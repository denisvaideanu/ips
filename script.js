const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav > a');
const revealItems = document.querySelectorAll('.reveal');
const year = document.getElementById('year');
const mega = document.querySelector('.has-mega');
const megaTrigger = document.querySelector('.mega-trigger');

if (year) year.textContent = new Date().getFullYear();

function onScroll() {
  if (header) header.classList.toggle('scrolled', window.scrollY > 24);
}
onScroll();
window.addEventListener('scroll', onScroll);

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('menu-open', open);
  });
}

if (megaTrigger && mega) {
  megaTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    const open = mega.classList.toggle('open');
    megaTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

document.addEventListener('click', (e) => {
  if (mega && !mega.contains(e.target) && window.innerWidth > 820) {
    mega.classList.remove('open');
    if (megaTrigger) megaTrigger.setAttribute('aria-expanded', 'false');
  }
});

document.querySelectorAll('.main-nav a, .mega-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 820 && nav) {
      nav.classList.remove('open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  });
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('revealed'));
}

const sections = [...document.querySelectorAll('main section[id]')];
if (sections.length) {
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 140) current = section.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#')) {
        link.classList.toggle('active', href === `#${current}` || (current === '' && href === '#top'));
      }
    });
  });
}

const videoPlaceholder = document.querySelector('.video-placeholder');
if (videoPlaceholder) {
  videoPlaceholder.addEventListener('click', () => {
    alert('Aici vom integra videoclipul promo IPS cand materialul final este disponibil.');
  });
}
