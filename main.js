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
        accent: { primary: '#ffffff', level: 2 },
      },
      radius:  'round',
      density: 'spacious',
    },
    startScreen: {
      greeting: "Welcome to ConciergeOS! I'm your AI Receptionist. Whether you have questions about our AI solutions or want to book a demo, I'm here to help. What can I do for you today?",
      prompts: [
        {
          label: "Learn About ConciergeOS",
          prompt: "What is ConciergeOS and how can it help my business?"
        },
        {
          label: "Explore AI Solutions",
          prompt: "Tell me about your AI Voice Receptionists, AI Chat Assistants, and business automation solutions."
        },
        {
          label: "Book a Personalized Demo",
          prompt: "I'd like to schedule a personalized demo for my business."
        },
      ],
    },
    composer: {
      placeholder: "Ask about AI receptionists, business automation, integrations, or book a demo...",
    },
  };
}

/* ============================================================
   CHATKIT INIT
============================================================ */

function initChatKit() {
  const kit = document.querySelector('openai-chatkit');
  if (kit && typeof kit.setOptions === 'function') {
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    kit.setOptions(getChatKitOptions(theme));
    customizeChatKit(theme);
  } else {
    setTimeout(initChatKit, 50);
  }
}

/**
 * Injects theme-aware overrides into the ChatKit shadow DOM.
 * Called on init and every time the theme changes.
 * No guard — always removes the previous injection and re-injects so
 * theme toggles are reflected correctly.
 */
function customizeChatKit(theme) {
  const chat = document.querySelector('openai-chatkit');
  if (!chat || !chat.shadowRoot) {
    return setTimeout(() => customizeChatKit(theme), 100);
  }

  // Remove any previous injection so the new theme takes effect
  const existing = chat.shadowRoot.querySelector('[data-cOS-styles]');
  if (existing) existing.remove();

  // In light mode let ChatKit use its own native styles
  if (theme !== 'dark') return;

  const style = document.createElement('style');
  style.setAttribute('data-cOS-styles', '');
  style.textContent = `
    /* Force dark backgrounds — covers bg-white AND all bg-slate-* variants */
    .bg-white,
    .bg-slate-50,
    .bg-slate-100,
    .bg-slate-800,
    .bg-slate-900,
    .bg-slate-950,
    [class*="bg-slate"],
    [class*="bg-gray"],
    [class*="bg-zinc"] {
      background: #0f172a !important;
    }

    /* Ensure text is readable on dark backgrounds */
    .text-slate-900,
    .text-gray-900,
    .text-black {
      color: #f8fafc !important;
    }

    .text-slate-500,
    .text-gray-500,
    .text-slate-600,
    .text-gray-600 {
      color: #94a3b8 !important;
    }

    /* Soften borders */
    .border-slate-200,
    .border-gray-200,
    .border-slate-100,
    .border-gray-100 {
      border-color: #334155 !important;
    }

    /* ---- Send button: white background + dark arrow in dark mode ---- */
    form button[type="submit"],
    button[aria-label*="Send" i],
    button[class*="send"],
    button[class*="Send"],
    [class*="send-button"],
    [class*="sendButton"],
    [class*="send-btn"],
    [class*="sendBtn"] {
      background:       #ffffff !important;
      background-color: #ffffff !important;
      color:            #051333 !important;
    }

    form button[type="submit"] svg,
    button[aria-label*="Send" i] svg,
    button[class*="send"] svg,
    button[class*="Send"] svg,
    [class*="send-button"] svg,
    [class*="sendButton"] svg,
    [class*="send-btn"] svg,
    [class*="sendBtn"] svg {
      color:  #051333 !important;
      fill:   #051333 !important;
      stroke: #051333 !important;
    }

    form button[type="submit"] svg path,
    button[aria-label*="Send" i] svg path,
    button[class*="send"] svg path,
    button[class*="Send"] svg path,
    [class*="send-button"] svg path,
    [class*="sendButton"] svg path,
    [class*="send-btn"] svg path,
    [class*="sendBtn"] svg path {
      fill:   #051333 !important;
      stroke: #051333 !important;
    }
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

  // Re-apply ChatKit theme (colorScheme + shadow DOM overrides)
  const chat = document.getElementById('chat');
  if (chat && typeof chat.setOptions === 'function') {
    chat.setOptions(getChatKitOptions(theme));
    customizeChatKit(theme);
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
