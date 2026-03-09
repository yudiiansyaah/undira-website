require('dotenv').config();
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'undira.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pendaftaran (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    email TEXT NOT NULL,
    telepon TEXT NOT NULL,
    program_studi TEXT NOT NULL,
    jalur TEXT NOT NULL,
    kampus TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    catatan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS kontak_pesan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    email TEXT NOT NULL,
    telepon TEXT,
    subjek TEXT NOT NULL,
    pesan TEXT NOT NULL,
    status TEXT DEFAULT 'belum_dibaca',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS berita (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    konten TEXT NOT NULL,
    gambar TEXT,
    kategori TEXT DEFAULT 'berita',
    status TEXT DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS fakultas (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    singkatan TEXT,
    icon TEXT,
    warna TEXT,
    deskripsi TEXT,
    keunggulan TEXT, -- JSON string
    prospek TEXT,    -- JSON string
    akreditasi TEXT DEFAULT 'B'
  );

  CREATE TABLE IF NOT EXISTS kampus (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    alamat TEXT,
    telepon TEXT,
    email TEXT,
    fasilitas TEXT,  -- JSON string
    maps TEXT,
    keterangan TEXT
  );
`);

// Seed data from data.js if empty
const { fakultas: initialFakultas, kampus: initialKampus } = require('../data/data');

const fakCount = db.prepare('SELECT COUNT(*) as c FROM fakultas').get().c;
if (fakCount === 0) {
  const insertFak = db.prepare('INSERT INTO fakultas (id, nama, singkatan, icon, warna, deskripsi, keunggulan, prospek, akreditasi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  initialFakultas.forEach(f => {
    insertFak.run(f.id, f.nama, f.singkatan, f.icon, f.warna, f.deskripsi, JSON.stringify(f.keunggulan), JSON.stringify(f.prospek), f.akreditasi);
  });
}

const kampCount = db.prepare('SELECT COUNT(*) as c FROM kampus').get().c;
if (kampCount === 0) {
  const insertKamp = db.prepare('INSERT INTO kampus (id, nama, alamat, telepon, email, fasilitas, maps, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  initialKampus.forEach(k => {
    insertKamp.run(k.id, k.nama, k.alamat, k.telepon, k.email, JSON.stringify(k.fasilitas), k.maps, k.keterangan);
  });
}

// Seed default admin
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@undira.ac.id');
if (!adminExists) {
  const hashed = bcrypt.hashSync('Admin123!', 10);
  db.prepare('INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Administrator UNDIRA', 'admin@undira.ac.id', hashed, 'superadmin'
  );
  console.log('Default admin: admin@undira.ac.id / Admin123!');
}

// Seed sample berita
const beritaExists = db.prepare('SELECT id FROM berita LIMIT 1').get();
if (!beritaExists) {
  const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@undira.ac.id');
  const sampleBerita = [
    {
      judul: 'UNDIRA Buka Pendaftaran Mahasiswa Baru 2024/2025',
      slug: 'pmb-2024-2025',
      konten: 'Universitas Dian Nusantara (UNDIRA) dengan bangga membuka pendaftaran mahasiswa baru untuk Tahun Akademik 2024/2025. Tersedia 8 program studi unggulan dengan akreditasi nasional. Daftarkan diri Anda sekarang dan raih masa depan cerah bersama UNDIRA!',
      kategori: 'pengumuman',
      status: 'published'
    },
    {
      judul: 'UNDIRA Raih Penghargaan Kampus Inovatif 2024',
      slug: 'penghargaan-kampus-inovatif-2024',
      konten: 'Universitas Dian Nusantara berhasil meraih penghargaan bergengsi sebagai Kampus Inovatif 2024 dari Kementerian Pendidikan dan Kebudayaan. Penghargaan ini merupakan bukti nyata komitmen UNDIRA dalam menghadirkan pendidikan berkualitas yang relevan dengan kebutuhan industri.',
      kategori: 'prestasi',
      status: 'published'
    },
    {
      judul: 'Workshop Kecerdasan Buatan untuk Mahasiswa Teknik',
      slug: 'workshop-ai-mahasiswa-teknik',
      konten: 'UNDIRA bekerja sama dengan perusahaan teknologi terkemuka menyelenggarakan workshop intensif tentang Kecerdasan Buatan (AI) dan Machine Learning. Workshop ini terbuka untuk seluruh mahasiswa program studi Teknik Informatika dan Teknik Elektro.',
      kategori: 'kegiatan',
      status: 'published'
    }
  ];
  const insertBerita = db.prepare('INSERT INTO berita (judul, slug, konten, kategori, status, created_by) VALUES (?, ?, ?, ?, ?, ?)');
  sampleBerita.forEach(b => insertBerita.run(b.judul, b.slug, b.konten, b.kategori, b.status, adminUser ? adminUser.id : 1));
}

module.exports = db;
