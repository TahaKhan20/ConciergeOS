/* ============================================================
   CONFIGURATION
============================================================ */

const DOMAIN_KEY        = 'domain_pk_6a548ff4ce248197a246458c6713e8c70dadf08d8f890c9d';
const API_URL           = 'https://openai.secondbrainos.com/chatkit';
const CALENDLY_BASE_URL = 'https://calendly.com/mohammadtahakhan20/30min';

const customFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Domain-Key': DOMAIN_KEY,
    },
  });
};

/* ============================================================
   CHATKIT OPTIONS BUILDER
============================================================ */

function getChatKitOptions(colorScheme) {
  return {
    api: {
      url:       API_URL,
      domainKey: DOMAIN_KEY,
      fetch:     customFetch,
    },
    theme: {
      colorScheme: colorScheme,
      color: {
        accent: { primary: '#4F46E5', level: 2 },
      },
      radius:  'round',
      density: 'spacious',
    },
    startScreen: {
      greeting: 'Welcome to ConciergeOS! I\u2019m your AI concierge. I can help with reservations, bookings, guest inquiries, customer support, and business automation. How can I assist you today?',
      prompts: [
        { label: 'Book a Reservation',  prompt: 'I would like to make a reservation.' },
        { label: 'Ask a Question',      prompt: 'I have a question about your services.' },
        { label: 'Business Automation', prompt: 'Tell me how ConciergeOS can automate my business.' },
      ],
    },
    composer: {
      placeholder: 'Ask about reservations, AI automation, or customer support...',
    },
  };
}

/* ============================================================
   CHATKIT INIT
============================================================ */

function initChatKit() {
  const kit = document.querySelector('openai-chatkit');
  if (kit && typeof kit.setOptions === 'function') {
    const colorScheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    kit.setOptions(getChatKitOptions(colorScheme));
    customizeChatKit();
  } else {
    setTimeout(initChatKit, 50);
  }
}

function customizeChatKit() {
  const chat = document.querySelector('openai-chatkit');
  if (!chat || !chat.shadowRoot) {
    return setTimeout(customizeChatKit, 100);
  }
  // Guard: only inject styles once
  if (chat.shadowRoot.querySelector('[data-cOS-styles]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-cOS-styles', '');
  style.textContent = `
    .bg-slate-950,
    .bg-slate-900 { background: #03081b !important; }
    [class*="bg-slate"] { background: #03081b !important; }
  `;
  chat.shadowRoot.appendChild(style);
}

/* ============================================================
   CALENDLY THEME
============================================================ */

function getCalendlyUrl(theme) {
  const params = theme === 'dark'
    ? '?background_color=0f172a&text_color=f8fafc&primary_color=2563eb'
    : '?primary_color=2563eb';
  return CALENDLY_BASE_URL + params;
}

function updateCalendlyTheme(theme) {
  const container = document.querySelector('.calendly-inline-widget');
  if (!container) return;

  const url = getCalendlyUrl(theme);

  // Always update the data-url so Calendly reads the right URL on first load
  container.setAttribute('data-url', url);

  // If the Calendly SDK is already loaded, destroy and re-init the widget
  if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
    container.innerHTML = '';
    window.Calendly.initInlineWidget({
      url:           url,
      parentElement: container,
    });
  }
}

/* ============================================================
   DARK MODE
============================================================ */

function applyTheme(theme) {
  const themeToggle = document.getElementById('themeToggle');
  const mobileTheme = document.getElementById('mobileTheme');

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    if (themeToggle) { themeToggle.innerHTML = '&#9728;&#65039;'; themeToggle.setAttribute('aria-label', 'Switch to light mode'); }
    if (mobileTheme) { mobileTheme.innerHTML = '&#9728;&#65039;'; mobileTheme.setAttribute('aria-label', 'Switch to light mode'); }
  } else {
    document.documentElement.classList.remove('dark');
    if (themeToggle) { themeToggle.innerHTML = '&#127769;'; themeToggle.setAttribute('aria-label', 'Switch to dark mode'); }
    if (mobileTheme) { mobileTheme.innerHTML = '&#127769;'; mobileTheme.setAttribute('aria-label', 'Switch to dark mode'); }
  }

  // Re-apply chatkit theme so the widget matches
  const chat = document.getElementById('chat');
  if (chat && typeof chat.setOptions === 'function') {
    chat.setOptions(getChatKitOptions(theme));
  }

  // Re-apply Calendly theme
  updateCalendlyTheme(theme);

  localStorage.setItem('theme', theme);
}

/* ============================================================
   COUNTER ANIMATION
============================================================ */

function animateCounter(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const isDecimal = target % 1 !== 0;
  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = target * eased;
    el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ============================================================
   DOM READY — INIT ALL
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Theme ---- */
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  const themeToggle = document.getElementById('themeToggle');
  const mobileTheme = document.getElementById('mobileTheme');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  if (mobileTheme) {
    mobileTheme.addEventListener('click', () => {
      applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  /* ---- Mobile menu ---- */
  const menuButton = document.getElementById('menuButton');
  const mobileMenu  = document.getElementById('mobileMenu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.toggle('hidden');
      menuButton.setAttribute('aria-label', isHidden ? 'Open navigation menu' : 'Close navigation menu');
    });

    // Close when a link is tapped
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }

  /* ---- ChatKit ---- */
  initChatKit();

  /* ---- Counters ---- */
  initCounters();
});
