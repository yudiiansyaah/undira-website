// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// Highlight active nav link
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.style.background = 'rgba(26,58,143,0.08)';
    link.style.color = '#1a3a8f';
    link.style.fontWeight = '700';
  }
});

// PMB Form Submit
const pmbForm = document.getElementById('pmbForm');
if (pmbForm) {
  pmbForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = pmbForm.querySelector('button[type="submit"]');
    const msg = document.getElementById('pmbMsg');
    btn.disabled = true;
    btn.textContent = 'Mengirim...';
    const data = Object.fromEntries(new FormData(pmbForm));
    try {
      const res = await fetch('/api/pendaftaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      msg.className = 'form-msg ' + (json.success ? 'form-msg-success' : 'form-msg-error');
      msg.textContent = json.success ? `${json.message} Nomor Pendaftaran: ${json.nomor}` : json.message;
      msg.style.display = 'block';
      if (json.success) pmbForm.reset();
    } catch {
      msg.className = 'form-msg form-msg-error';
      msg.textContent = 'Gagal mengirim. Periksa koneksi internet Anda.';
      msg.style.display = 'block';
    }
    btn.disabled = false;
    btn.textContent = 'Kirim Pendaftaran';
  });
}

// Kontak Form Submit
const kontakForm = document.getElementById('kontakForm');
if (kontakForm) {
  kontakForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = kontakForm.querySelector('button[type="submit"]');
    const msg = document.getElementById('kontakMsg');
    btn.disabled = true;
    btn.textContent = 'Mengirim...';
    const data = Object.fromEntries(new FormData(kontakForm));
    try {
      const res = await fetch('/api/kontak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      msg.className = 'form-msg ' + (json.success ? 'form-msg-success' : 'form-msg-error');
      msg.textContent = json.message;
      msg.style.display = 'block';
      if (json.success) kontakForm.reset();
    } catch {
      msg.className = 'form-msg form-msg-error';
      msg.textContent = 'Gagal mengirim. Periksa koneksi internet Anda.';
      msg.style.display = 'block';
    }
    btn.disabled = false;
    btn.textContent = 'Kirim Pesan';
  });
}

// Fade-in animation on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fak-card, .keunggulan-card, .kampus-card, .fak-list-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
