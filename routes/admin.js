const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { sendEmail } = require('../config/mailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── MULTER CONFIG ────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/berita');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Hanya diperbolehkan mengupload gambar (jpeg, jpg, png, webp)'));
  }
});

// Helper: delete file
function deleteFile(filePath) {
  if (filePath && fs.existsSync(path.join('public', filePath))) {
    fs.unlinkSync(path.join('public', filePath));
  }
}

// Helper: generate slug
function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

// ─── AUTH ─────────────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/admin/dashboard');
  res.render('admin/login', { title: 'Login Admin', error: req.flash('error'), success: req.flash('success') });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    req.flash('error', 'Email atau password salah');
    return res.redirect('/admin/login');
  }
  req.session.user = { id: user.id, nama: user.nama, email: user.email, role: user.role };
  res.redirect('/admin/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────
router.get('/dashboard', requireAuth, (req, res) => {
  const stats = {
    totalPendaftaran: db.prepare('SELECT COUNT(*) as c FROM pendaftaran').get().c,
    pendingPendaftaran: db.prepare("SELECT COUNT(*) as c FROM pendaftaran WHERE status = 'pending'").get().c,
    diterimaPendaftaran: db.prepare("SELECT COUNT(*) as c FROM pendaftaran WHERE status = 'diterima'").get().c,
    totalKontak: db.prepare('SELECT COUNT(*) as c FROM kontak_pesan').get().c,
    belumDibacaKontak: db.prepare("SELECT COUNT(*) as c FROM kontak_pesan WHERE status = 'belum_dibaca'").get().c,
    totalBerita: db.prepare('SELECT COUNT(*) as c FROM berita').get().c,
    publishedBerita: db.prepare("SELECT COUNT(*) as c FROM berita WHERE status = 'published'").get().c,
  };
  const recentPendaftaran = db.prepare('SELECT * FROM pendaftaran ORDER BY created_at DESC LIMIT 8').all();
  const recentKontak = db.prepare('SELECT * FROM kontak_pesan ORDER BY created_at DESC LIMIT 5').all();
  res.render('admin/dashboard', { title: 'Dashboard', stats, recentPendaftaran, recentKontak });
});

// ─── PENDAFTARAN ──────────────────────────────────────────────────────────
router.get('/pendaftaran', requireAuth, (req, res) => {
  const { status, prodi, search } = req.query;
  let query = 'SELECT * FROM pendaftaran WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (prodi) { query += ' AND program_studi = ?'; params.push(prodi); }
  if (search) { query += ' AND (nama LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY created_at DESC';
  const data = db.prepare(query).all(...params);
  res.render('admin/pendaftaran', { title: 'Data Pendaftaran', data, filter: { status, prodi, search } });
});

router.get('/pendaftaran/:id', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM pendaftaran WHERE id = ?').get(req.params.id);
  if (!item) { req.flash('error', 'Data tidak ditemukan'); return res.redirect('/admin/pendaftaran'); }
  res.render('admin/pendaftaran-detail', { title: 'Detail Pendaftaran', item, success: req.flash('success'), error: req.flash('error') });
});

router.post('/pendaftaran/:id/status', requireAuth, (req, res) => {
  const { status, catatan } = req.body;
  const item = db.prepare('SELECT * FROM pendaftaran WHERE id = ?').get(req.params.id);
  if (!item) { req.flash('error', 'Data tidak ditemukan'); return res.redirect('/admin/pendaftaran'); }

  db.prepare('UPDATE pendaftaran SET status = ?, catatan = ? WHERE id = ?').run(status, catatan || '', req.params.id);

  // Send status email
  const statusMsg = { diterima: 'DITERIMA', ditolak: 'TIDAK DITERIMA', diproses: 'SEDANG DIPROSES' };
  if (statusMsg[status]) {
    sendEmail({
      to: item.email,
      subject: `Update Status Pendaftaran UNDIRA - ${statusMsg[status]}`,
      html: `<h2>Halo ${item.nama},</h2>
        <p>Status pendaftaran Anda di Universitas Dian Nusantara telah diperbarui.</p>
        <p><b>Status: <span style="color:${status === 'diterima' ? 'green' : status === 'ditolak' ? 'red' : 'orange'}">${statusMsg[status]}</span></b></p>
        <p><b>Program Studi:</b> ${item.program_studi}</p>
        ${catatan ? `<p><b>Catatan:</b> ${catatan}</p>` : ''}
        <p>Untuk informasi lebih lanjut, hubungi kami di (021) 5694-8000 atau pmb@undira.ac.id</p>`
    });
  }

  req.flash('success', `Status berhasil diubah menjadi "${status}"`);
  res.redirect(`/admin/pendaftaran/${req.params.id}`);
});

router.post('/pendaftaran/:id/hapus', requireAuth, (req, res) => {
  db.prepare('DELETE FROM pendaftaran WHERE id = ?').run(req.params.id);
  req.flash('success', 'Data pendaftaran berhasil dihapus');
  res.redirect('/admin/pendaftaran');
});

// ─── KONTAK ───────────────────────────────────────────────────────────────
router.get('/kontak', requireAuth, (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM kontak_pesan WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC';
  const data = db.prepare(query).all(...params);
  res.render('admin/kontak', { title: 'Pesan Kontak', data, filter: { status } });
});

router.get('/kontak/:id', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM kontak_pesan WHERE id = ?').get(req.params.id);
  if (!item) { req.flash('error', 'Pesan tidak ditemukan'); return res.redirect('/admin/kontak'); }
  // Mark as read
  db.prepare("UPDATE kontak_pesan SET status = 'sudah_dibaca' WHERE id = ?").run(req.params.id);
  item.status = 'sudah_dibaca';
  res.render('admin/kontak-detail', { title: 'Detail Pesan', item });
});

router.post('/kontak/:id/hapus', requireAuth, (req, res) => {
  db.prepare('DELETE FROM kontak_pesan WHERE id = ?').run(req.params.id);
  res.redirect('/admin/kontak');
});

// ─── BERITA ───────────────────────────────────────────────────────────────
router.get('/berita', requireAuth, (req, res) => {
  const data = db.prepare('SELECT * FROM berita ORDER BY created_at DESC').all();
  res.render('admin/berita', { title: 'Kelola Berita', data, success: req.flash('success'), error: req.flash('error') });
});

router.get('/berita/buat', requireAuth, (req, res) => {
  res.render('admin/berita-form', { title: 'Buat Berita Baru', item: null, error: req.flash('error') });
});

router.post('/berita/buat', requireAuth, upload.single('gambar'), (req, res) => {
  const { judul, konten, kategori, status } = req.body;
  if (!judul || !konten) {
    if (req.file) deleteFile('/uploads/berita/' + req.file.filename);
    req.flash('error', 'Judul dan konten wajib diisi');
    return res.redirect('/admin/berita/buat');
  }
  let slug = toSlug(judul);
  // Ensure unique slug
  const existing = db.prepare('SELECT id FROM berita WHERE slug = ?').get(slug);
  if (existing) slug = slug + '-' + Date.now();
  
  const gambar = req.file ? '/uploads/berita/' + req.file.filename : null;

  try {
    db.prepare('INSERT INTO berita (judul, slug, konten, gambar, kategori, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      judul, slug, konten, gambar, kategori || 'berita', status || 'draft', req.session.user.id
    );
    req.flash('success', 'Berita berhasil dibuat');
    res.redirect('/admin/berita');
  } catch (err) {
    if (req.file) deleteFile('/uploads/berita/' + req.file.filename);
    req.flash('error', 'Gagal membuat berita: ' + err.message);
    res.redirect('/admin/berita/buat');
  }
});

router.get('/berita/:id/edit', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM berita WHERE id = ?').get(req.params.id);
  if (!item) { req.flash('error', 'Berita tidak ditemukan'); return res.redirect('/admin/berita'); }
  res.render('admin/berita-form', { title: 'Edit Berita', item, error: req.flash('error') });
});

router.post('/berita/:id/edit', requireAuth, upload.single('gambar'), (req, res) => {
  const { judul, konten, kategori, status, hapus_gambar } = req.body;
  if (!judul || !konten) {
    if (req.file) deleteFile('/uploads/berita/' + req.file.filename);
    req.flash('error', 'Judul dan konten wajib diisi');
    return res.redirect(`/admin/berita/${req.params.id}/edit`);
  }

  const item = db.prepare('SELECT gambar FROM berita WHERE id = ?').get(req.params.id);
  let gambar = item.gambar;

  if (req.file) {
    if (item.gambar) deleteFile(item.gambar);
    gambar = '/uploads/berita/' + req.file.filename;
  } else if (hapus_gambar === '1') {
    if (item.gambar) deleteFile(item.gambar);
    gambar = null;
  }

  db.prepare('UPDATE berita SET judul = ?, konten = ?, gambar = ?, kategori = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    judul, konten, gambar, kategori || 'berita', status || 'draft', req.params.id
  );
  req.flash('success', 'Berita berhasil diperbarui');
  res.redirect('/admin/berita');
});

router.post('/berita/:id/hapus', requireAuth, (req, res) => {
  const item = db.prepare('SELECT gambar FROM berita WHERE id = ?').get(req.params.id);
  if (item && item.gambar) deleteFile(item.gambar);
  
  db.prepare('DELETE FROM berita WHERE id = ?').run(req.params.id);
  req.flash('success', 'Berita berhasil dihapus');
  res.redirect('/admin/berita');
});

// ─── PENGATURAN ───────────────────────────────────────────────────────────
router.get('/pengaturan', requireAuth, (req, res) => {
  res.render('admin/pengaturan', { title: 'Pengaturan Akun', success: req.flash('success'), error: req.flash('error') });
});

router.post('/pengaturan/password', requireAuth, (req, res) => {
  const { password_lama, password_baru, password_konfirmasi } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user.id);
  if (!bcrypt.compareSync(password_lama, user.password)) {
    req.flash('error', 'Password lama tidak sesuai');
    return res.redirect('/admin/pengaturan');
  }
  if (password_baru !== password_konfirmasi) {
    req.flash('error', 'Konfirmasi password baru tidak sesuai');
    return res.redirect('/admin/pengaturan');
  }
  if (password_baru.length < 6) {
    req.flash('error', 'Password baru minimal 6 karakter');
    return res.redirect('/admin/pengaturan');
  }
  const hashed = bcrypt.hashSync(password_baru, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.session.user.id);
  req.flash('success', 'Password berhasil diubah');
  res.redirect('/admin/pengaturan');
});

// ─── FAKULTAS ─────────────────────────────────────────────────────────────
router.get('/fakultas', requireAuth, (req, res) => {
  const data = db.prepare('SELECT * FROM fakultas').all();
  res.render('admin/fakultas', { title: 'Kelola Fakultas', data, success: req.flash('success'), error: req.flash('error') });
});

router.get('/fakultas/buat', requireAuth, (req, res) => {
  res.render('admin/fakultas-form', { title: 'Tambah Fakultas', item: null, error: req.flash('error') });
});

router.post('/fakultas/buat', requireAuth, (req, res) => {
  const { id, nama, singkatan, icon, warna, deskripsi, keunggulan, prospek, akreditasi } = req.body;
  if (!id || !nama) { req.flash('error', 'ID dan Nama wajib diisi'); return res.redirect('/admin/fakultas/buat'); }
  
  try {
    const keunggulanArr = keunggulan.split('\n').map(s => s.trim()).filter(s => s !== '');
    const prospekArr = prospek.split('\n').map(s => s.trim()).filter(s => s !== '');
    
    db.prepare('INSERT INTO fakultas (id, nama, singkatan, icon, warna, deskripsi, keunggulan, prospek, akreditasi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, nama, singkatan, icon, warna, deskripsi, JSON.stringify(keunggulanArr), JSON.stringify(prospekArr), akreditasi || 'B'
    );
    req.flash('success', 'Fakultas berhasil ditambahkan');
    res.redirect('/admin/fakultas');
  } catch (err) {
    req.flash('error', 'Gagal menambahkan fakultas: ' + err.message);
    res.redirect('/admin/fakultas/buat');
  }
});

router.get('/fakultas/:id/edit', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM fakultas WHERE id = ?').get(req.params.id);
  if (!item) { req.flash('error', 'Fakultas tidak ditemukan'); return res.redirect('/admin/fakultas'); }
  // Parse JSON for textarea
  item.keunggulan = JSON.parse(item.keunggulan || '[]').join('\n');
  item.prospek = JSON.parse(item.prospek || '[]').join('\n');
  res.render('admin/fakultas-form', { title: 'Edit Fakultas', item, error: req.flash('error') });
});

router.post('/fakultas/:id/edit', requireAuth, (req, res) => {
  const { nama, singkatan, icon, warna, deskripsi, keunggulan, prospek, akreditasi } = req.body;
  
  try {
    const keunggulanArr = keunggulan.split('\n').map(s => s.trim()).filter(s => s !== '');
    const prospekArr = prospek.split('\n').map(s => s.trim()).filter(s => s !== '');
    
    db.prepare('UPDATE fakultas SET nama = ?, singkatan = ?, icon = ?, warna = ?, deskripsi = ?, keunggulan = ?, prospek = ?, akreditasi = ? WHERE id = ?').run(
      nama, singkatan, icon, warna, deskripsi, JSON.stringify(keunggulanArr), JSON.stringify(prospekArr), akreditasi || 'B', req.params.id
    );
    req.flash('success', 'Fakultas berhasil diperbarui');
    res.redirect('/admin/fakultas');
  } catch (err) {
    req.flash('error', 'Gagal memperbarui fakultas: ' + err.message);
    res.redirect(`/admin/fakultas/${req.params.id}/edit`);
  }
});

router.post('/fakultas/:id/hapus', requireAuth, (req, res) => {
  db.prepare('DELETE FROM fakultas WHERE id = ?').run(req.params.id);
  req.flash('success', 'Fakultas berhasil dihapus');
  res.redirect('/admin/fakultas');
});

// ─── KAMPUS ─────────────────────────────────────────────────────────────
router.get('/kampus', requireAuth, (req, res) => {
  const data = db.prepare('SELECT * FROM kampus').all();
  res.render('admin/kampus', { title: 'Kelola Kampus', data, success: req.flash('success'), error: req.flash('error') });
});

router.get('/kampus/buat', requireAuth, (req, res) => {
  res.render('admin/kampus-form', { title: 'Tambah Kampus', item: null, error: req.flash('error') });
});

router.post('/kampus/buat', requireAuth, (req, res) => {
  const { id, nama, alamat, telepon, email, fasilitas, maps, keterangan } = req.body;
  if (!id || !nama) { req.flash('error', 'ID dan Nama wajib diisi'); return res.redirect('/admin/kampus/buat'); }
  
  try {
    const fasilitasArr = fasilitas.split('\n').map(s => s.trim()).filter(s => s !== '');
    db.prepare('INSERT INTO kampus (id, nama, alamat, telepon, email, fasilitas, maps, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, nama, alamat, telepon, email, JSON.stringify(fasilitasArr), maps, keterangan
    );
    req.flash('success', 'Kampus berhasil ditambahkan');
    res.redirect('/admin/kampus');
  } catch (err) {
    req.flash('error', 'Gagal menambahkan kampus: ' + err.message);
    res.redirect('/admin/kampus/buat');
  }
});

router.get('/kampus/:id/edit', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM kampus WHERE id = ?').get(req.params.id);
  if (!item) { req.flash('error', 'Kampus tidak ditemukan'); return res.redirect('/admin/kampus'); }
  item.fasilitas = JSON.parse(item.fasilitas || '[]').join('\n');
  res.render('admin/kampus-form', { title: 'Edit Kampus', item, error: req.flash('error') });
});

router.post('/kampus/:id/edit', requireAuth, (req, res) => {
  const { nama, alamat, telepon, email, fasilitas, maps, keterangan } = req.body;
  
  try {
    const fasilitasArr = fasilitas.split('\n').map(s => s.trim()).filter(s => s !== '');
    db.prepare('UPDATE kampus SET nama = ?, alamat = ?, telepon = ?, email = ?, fasilitas = ?, maps = ?, keterangan = ? WHERE id = ?').run(
      nama, alamat, telepon, email, JSON.stringify(fasilitasArr), maps, keterangan, req.params.id
    );
    req.flash('success', 'Kampus berhasil diperbarui');
    res.redirect('/admin/kampus');
  } catch (err) {
    req.flash('error', 'Gagal memperbarui kampus: ' + err.message);
    res.redirect(`/admin/kampus/${req.params.id}/edit`);
  }
});

router.post('/kampus/:id/hapus', requireAuth, (req, res) => {
  db.prepare('DELETE FROM kampus WHERE id = ?').run(req.params.id);
  req.flash('success', 'Kampus berhasil dihapus');
  res.redirect('/admin/kampus');
});

module.exports = router;
