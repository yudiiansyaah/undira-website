const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { sendEmail } = require('../config/mailer');

// POST /api/pendaftaran
router.post('/pendaftaran', (req, res) => {
  const { nama, email, telepon, program_studi, jalur, kampus } = req.body;

  if (!nama || !email || !telepon || !program_studi || !jalur || !kampus) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO pendaftaran (nama, email, telepon, program_studi, jalur, kampus) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nama, email, telepon, program_studi, jalur, kampus);

    const noPendaftaran = `PMB-${String(result.lastInsertRowid).padStart(6, '0')}`;

    // Email ke admin
    sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@undira.ac.id',
      subject: `[PMB] Pendaftaran Baru - ${nama}`,
      html: `<h2>Pendaftaran Mahasiswa Baru</h2>
        <table border="1" cellpadding="8" style="border-collapse:collapse">
          <tr><td><b>No. Pendaftaran</b></td><td>${noPendaftaran}</td></tr>
          <tr><td><b>Nama</b></td><td>${nama}</td></tr>
          <tr><td><b>Email</b></td><td>${email}</td></tr>
          <tr><td><b>Telepon</b></td><td>${telepon}</td></tr>
          <tr><td><b>Program Studi</b></td><td>${program_studi}</td></tr>
          <tr><td><b>Jalur</b></td><td>${jalur}</td></tr>
          <tr><td><b>Kampus</b></td><td>${kampus}</td></tr>
        </table>`
    });

    // Email konfirmasi ke pendaftar
    sendEmail({
      to: email,
      subject: `Konfirmasi Pendaftaran - Universitas Dian Nusantara`,
      html: `<h2>Halo ${nama},</h2>
        <p>Pendaftaran Anda di <b>Universitas Dian Nusantara</b> telah berhasil diterima.</p>
        <p><b>Nomor Pendaftaran: ${noPendaftaran}</b></p>
        <p>Detail pendaftaran:</p>
        <ul>
          <li>Program Studi: ${program_studi}</li>
          <li>Jalur: ${jalur}</li>
          <li>Kampus: ${kampus}</li>
        </ul>
        <p>Tim PMB kami akan menghubungi Anda dalam 1x24 jam untuk informasi selanjutnya.</p>
        <p>Terima kasih telah memilih UNDIRA!</p>`
    });

    res.json({ success: true, message: 'Pendaftaran berhasil dikirim!', nomor: noPendaftaran });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

// POST /api/kontak
router.post('/kontak', (req, res) => {
  const { nama, email, telepon, subjek, pesan } = req.body;

  if (!nama || !email || !subjek || !pesan) {
    return res.status(400).json({ success: false, message: 'Nama, email, subjek, dan pesan wajib diisi' });
  }

  try {
    db.prepare(
      'INSERT INTO kontak_pesan (nama, email, telepon, subjek, pesan) VALUES (?, ?, ?, ?, ?)'
    ).run(nama, email, telepon || '', subjek, pesan);

    sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@undira.ac.id',
      subject: `[Kontak] ${subjek} - dari ${nama}`,
      html: `<h2>Pesan Baru dari Website UNDIRA</h2>
        <p><b>Nama:</b> ${nama}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Telepon:</b> ${telepon || '-'}</p>
        <p><b>Subjek:</b> ${subjek}</p>
        <hr/>
        <p><b>Pesan:</b></p>
        <p>${pesan.replace(/\n/g, '<br>')}</p>`
    });

    res.json({ success: true, message: 'Pesan berhasil dikirim! Kami akan merespons dalam 1x24 jam.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
