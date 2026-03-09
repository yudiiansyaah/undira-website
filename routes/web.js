const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Helper to parse JSON fields
function parseFakultas(fak) {
  if (!fak) return null;
  return {
    ...fak,
    keunggulan: JSON.parse(fak.keunggulan || '[]'),
    prospek: JSON.parse(fak.prospek || '[]')
  };
}

function parseKampus(kamp) {
  if (!kamp) return null;
  return {
    ...kamp,
    fasilitas: JSON.parse(kamp.fasilitas || '[]')
  };
}

router.get('/', (req, res) => {
  const fakultas = db.prepare("SELECT * FROM fakultas").all().map(parseFakultas);
  const kampus = db.prepare("SELECT * FROM kampus").all().map(parseKampus);
  const berita = db.prepare("SELECT * FROM berita WHERE status = 'published' ORDER BY created_at DESC LIMIT 3").all();
  res.render('index', { fakultas, kampus, berita, title: 'Beranda' });
});

router.get('/fakultas', (req, res) => {
  const fakultas = db.prepare("SELECT * FROM fakultas").all().map(parseFakultas);
  res.render('fakultas-list', { fakultas, title: 'Fakultas & Program Studi' });
});

router.get('/fakultas/:id', (req, res) => {
  const fakRaw = db.prepare('SELECT * FROM fakultas WHERE id = ?').get(req.params.id);
  if (!fakRaw) return res.status(404).render('404', { title: 'Halaman Tidak Ditemukan' });
  const fak = parseFakultas(fakRaw);
  res.render('fakultas-detail', { fak, title: fak.nama });
});

router.get('/kampus', (req, res) => {
  const kampus = db.prepare("SELECT * FROM kampus").all().map(parseKampus);
  res.render('kampus', { kampus, title: 'Lokasi Kampus' });
});

router.get('/tentang', (req, res) => {
  res.render('tentang', { title: 'Tentang UNDIRA' });
});

router.get('/penerimaan', (req, res) => {
  const fakultas = db.prepare("SELECT * FROM fakultas").all().map(parseFakultas);
  res.render('penerimaan', { fakultas, title: 'Penerimaan Mahasiswa Baru' });
});

router.get('/kontak', (req, res) => {
  const kampus = db.prepare("SELECT * FROM kampus").all().map(parseKampus);
  res.render('kontak', { kampus, title: 'Kontak Kami' });
});

router.get('/berita', (req, res) => {
  const berita = db.prepare("SELECT * FROM berita WHERE status = 'published' ORDER BY created_at DESC").all();
  res.render('berita-list', { berita, title: 'Berita & Pengumuman' });
});

router.get('/berita/:slug', (req, res) => {
  const artikel = db.prepare("SELECT * FROM berita WHERE slug = ? AND status = 'published'").get(req.params.slug);
  if (!artikel) return res.status(404).render('404', { title: 'Berita Tidak Ditemukan' });
  const lainnya = db.prepare("SELECT * FROM berita WHERE status = 'published' AND id != ? ORDER BY created_at DESC LIMIT 3").all(artikel.id);
  res.render('berita-detail', { artikel, lainnya, title: artikel.judul });
});

module.exports = router;
