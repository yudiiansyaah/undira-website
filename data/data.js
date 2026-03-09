const fakultas = [
  {
    id: 'teknik-informatika',
    nama: 'Teknik Informatika',
    singkatan: 'TI',
    icon: '💻',
    warna: '#2563eb',
    deskripsi: 'Program studi yang membekali mahasiswa dengan kemampuan di bidang rekayasa perangkat lunak, kecerdasan buatan, jaringan komputer, dan sistem informasi.',
    keunggulan: [
      'Kurikulum berbasis industri 4.0',
      'Laboratorium komputer berteknologi tinggi',
      'Kerjasama dengan perusahaan teknologi ternama',
      'Program magang di perusahaan startup dan tech company'
    ],
    prospek: ['Software Engineer', 'Data Scientist', 'Cybersecurity Analyst', 'AI/ML Engineer', 'System Analyst'],
    akreditasi: 'B'
  },
  {
    id: 'teknik-sipil',
    nama: 'Teknik Sipil',
    singkatan: 'TS',
    icon: '🏗️',
    warna: '#d97706',
    deskripsi: 'Program studi yang mendidik mahasiswa menjadi insinyur handal di bidang konstruksi, perencanaan infrastruktur, dan manajemen proyek bangunan.',
    keunggulan: [
      'Laboratorium material dan struktur lengkap',
      'Studio desain berbasis BIM (Building Information Modeling)',
      'Kerjasama dengan kontraktor dan konsultan ternama',
      'Kunjungan lapangan ke proyek infrastruktur nyata'
    ],
    prospek: ['Structural Engineer', 'Project Manager', 'Quantity Surveyor', 'Site Engineer', 'Urban Planner'],
    akreditasi: 'B'
  },
  {
    id: 'teknik-mesin',
    nama: 'Teknik Mesin',
    singkatan: 'TM',
    icon: '⚙️',
    warna: '#059669',
    deskripsi: 'Program studi yang mempelajari perancangan, analisis, dan manufaktur sistem mekanik serta termal untuk berbagai aplikasi industri.',
    keunggulan: [
      'Laboratorium manufaktur dan CNC modern',
      'Workshop dengan peralatan industri terkini',
      'Program sertifikasi kompetensi nasional',
      'Kerjasama dengan industri otomotif dan manufaktur'
    ],
    prospek: ['Mechanical Engineer', 'Manufacturing Engineer', 'Maintenance Engineer', 'R&D Engineer', 'Plant Manager'],
    akreditasi: 'B'
  },
  {
    id: 'teknik-elektro',
    nama: 'Teknik Elektro',
    singkatan: 'TE',
    icon: '⚡',
    warna: '#7c3aed',
    deskripsi: 'Program studi yang mencakup bidang elektronika, sistem tenaga listrik, telekomunikasi, dan otomasi industri.',
    keunggulan: [
      'Laboratorium elektronika dan instrumentasi canggih',
      'Fokus pada energi terbarukan dan IoT',
      'Kerjasama dengan PLN dan perusahaan energi',
      'Proyek riset terapan berbasis industri'
    ],
    prospek: ['Electrical Engineer', 'Electronics Engineer', 'Automation Engineer', 'Power Systems Engineer', 'IoT Developer'],
    akreditasi: 'B'
  },
  {
    id: 'sastra-inggris',
    nama: 'Sastra Inggris',
    singkatan: 'SI',
    icon: '📚',
    warna: '#db2777',
    deskripsi: 'Program studi yang mengkaji bahasa, sastra, dan budaya Inggris secara mendalam, serta mempersiapkan mahasiswa menjadi profesional bilingual yang kompeten.',
    keunggulan: [
      'Dosen berpengalaman dan native speaker',
      'Program pertukaran mahasiswa ke luar negeri',
      'Language lab berteknologi modern',
      'Fokus pada penerjemahan dan interpretasi'
    ],
    prospek: ['Translator/Interpreter', 'Content Writer', 'English Teacher', 'Public Relations', 'Diplomat'],
    akreditasi: 'B'
  },
  {
    id: 'manajemen',
    nama: 'Manajemen',
    singkatan: 'MN',
    icon: '📊',
    warna: '#0891b2',
    deskripsi: 'Program studi yang membekali mahasiswa dengan kemampuan manajerial, kepemimpinan, dan kewirausahaan untuk menghadapi tantangan dunia bisnis global.',
    keunggulan: [
      'Kurikulum terintegrasi dengan praktik bisnis nyata',
      'Program inkubator startup dan kewirausahaan',
      'Kerjasama dengan perusahaan multinasional',
      'Studi kasus dan simulasi bisnis'
    ],
    prospek: ['Business Manager', 'Entrepreneur', 'Marketing Manager', 'HR Manager', 'Business Consultant'],
    akreditasi: 'B'
  },
  {
    id: 'ilmu-komunikasi',
    nama: 'Ilmu Komunikasi',
    singkatan: 'IK',
    icon: '📡',
    warna: '#ea580c',
    deskripsi: 'Program studi yang mempelajari teori dan praktik komunikasi massa, public relations, jurnalistik, dan komunikasi digital di era modern.',
    keunggulan: [
      'Studio radio dan TV yang profesional',
      'Laboratorium multimedia dan fotografi',
      'Kerjasama dengan media dan perusahaan PR ternama',
      'Praktik langsung di media massa'
    ],
    prospek: ['Journalist', 'PR Specialist', 'Content Creator', 'Brand Manager', 'Media Planner'],
    akreditasi: 'B'
  },
  {
    id: 'akuntansi',
    nama: 'Akuntansi',
    singkatan: 'AK',
    icon: '🧾',
    warna: '#16a34a',
    deskripsi: 'Program studi yang menghasilkan tenaga profesional di bidang akuntansi keuangan, perpajakan, audit, dan sistem informasi akuntansi.',
    keunggulan: [
      'Persiapan sertifikasi CPA dan brevet pajak',
      'Laboratorium akuntansi berbasis software terkini',
      'Kerjasama dengan KAP dan perusahaan audit',
      'Program magang di perusahaan Big Four'
    ],
    prospek: ['Akuntan Publik', 'Tax Consultant', 'Internal Auditor', 'Financial Analyst', 'CFO'],
    akreditasi: 'B'
  }
];

const kampus = [
  {
    id: 'tanjung-duren',
    nama: 'Kampus Tanjung Duren',
    alamat: 'Jl. Tanjung Duren Barat No.1, RT.1/RW.5, Tanjung Duren Utara, Kec. Grogol petamburan, Kota Jakarta Barat, DKI Jakarta 11470',
    telepon: '(021) 5694-8000',
    email: 'info.tanjungduren@undira.ac.id',
    fasilitas: ['Perpustakaan Pusat', 'Laboratorium Komputer', 'Aula Serbaguna', 'Kantin', 'Masjid', 'Lapangan Olahraga'],
    maps: 'https://maps.google.com/?q=Tanjung+Duren,Jakarta+Barat',
    keterangan: 'Kampus utama UNDIRA dengan fasilitas terlengkap'
  },
  {
    id: 'greenville',
    nama: 'Kampus Greenville',
    alamat: 'Kompleks Greenville, Jl. Jelambar Baru, Grogol Petamburan, Jakarta Barat, DKI Jakarta 11460',
    telepon: '(021) 5694-8100',
    email: 'info.greenville@undira.ac.id',
    fasilitas: ['Laboratorium Teknik', 'Studio Kreatif', 'Ruang Seminar', 'Kantin', 'Parkir Luas'],
    maps: 'https://maps.google.com/?q=Greenville,Jakarta+Barat',
    keterangan: 'Kampus fokus program studi Teknik dan Desain'
  },
  {
    id: 'cibubur',
    nama: 'Kampus Cibubur',
    alamat: 'Jl. Alternatif Cibubur, Harjamukti, Kec. Cimanggis, Kota Depok / Bekasi, Jawa Barat 16454',
    telepon: '(021) 8444-8000',
    email: 'info.cibubur@undira.ac.id',
    fasilitas: ['Gedung Modern', 'Laboratorium Multimedia', 'Pusat Bisnis Mahasiswa', 'Kantin', 'Asrama Mahasiswa', 'Lapangan Futsal'],
    maps: 'https://maps.google.com/?q=Cibubur,Bekasi',
    keterangan: 'Kampus berkembang pesat di kawasan Cibubur-Bekasi'
  }
];

module.exports = { fakultas, kampus };
