/* ============================================================
   CONFIGURATION
============================================================ */

const DOMAIN_KEY = 'domain_pk_6a548ff4ce248197a246458c6713e8c70dadf08d8f890c9d';
const API_URL    = 'https://openai.secondbrainos.com/chatkit';

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
  const style = document.createElement('style');
  style.textContent = `
    .bg-slate-950,
    .bg-slate-900 { background: #03081b !important; }
    [class*="bg-slate"] { background: #03081b !important; }
  `;
  chat.shadowRoot.appendChild(style);
}

/* ============================================================
   DARK MODE
============================================================ */

function applyTheme(theme) {
  const themeToggle = document.getElementById('themeToggle');
  const mobileTheme = document.getElementById('mobileTheme');

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    if (themeToggle) themeToggle.innerHTML = '&#9728;&#65039;';
    if (mobileTheme) mobileTheme.innerHTML = '&#9728;&#65039;';
  } else {
    document.documentElement.classList.remove('dark');
    if (themeToggle) themeToggle.innerHTML = '&#127769;';
    if (mobileTheme) mobileTheme.innerHTML = '&#127769;';
  }

  // Re-apply chatkit theme so the widget matches
  const chat = document.getElementById('chat');
  if (chat && typeof chat.setOptions === 'function') {
    chat.setOptions(getChatKitOptions(theme));
  }

  localStorage.setItem('theme', theme);
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
      mobileMenu.classList.toggle('hidden');
    });

    // Close when a link is tapped
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }

  /* ---- ChatKit ---- */
  initChatKit();
});
