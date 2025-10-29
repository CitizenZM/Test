const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.dataset.open === 'true';
    navMenu.dataset.open = String(!isOpen);
    navToggle.setAttribute('aria-expanded', String(!isOpen));
  });

  navMenu.addEventListener('click', (event) => {
    const target = event.target;
    const link = target instanceof Element ? target.closest('a') : null;
    if (!link) return;

    navMenu.dataset.open = 'false';
    navToggle.setAttribute('aria-expanded', 'false');
  });
}

const form = document.querySelector('.cta-form');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name') || 'there';

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = `Thanks, ${name}! We'll be in touch soon.`;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.dataset.visible = 'true';
    });

    setTimeout(() => {
      toast.dataset.visible = 'false';
      setTimeout(() => toast.remove(), 300);
    }, 4000);

    form.reset();
  });
}

const footerYearTargets = document.querySelectorAll('[data-footer-year]');
if (footerYearTargets.length) {
  const year = String(new Date().getFullYear());
  footerYearTargets.forEach((el) => {
    el.textContent = year;
  });
}
