# ConciergeOS

ConciergeOS is an AI-powered business automation platform for the hospitality industry, including restaurants, hotels, apartments, vacation rentals, and other booking-based businesses. It provides AI voice and chat receptionists, reservation and appointment booking, CRM integration, custom AI CRM development, lead qualification, and workflow automation to enhance guest experiences, streamline operations, and increase bookings.

## Project Structure

```
ConciergeOS/
├── package.json                  ← Root scripts (npm start / npm run dev)
├── .gitignore
├── README.md
├── client/                       ← Frontend (static, served by Express)
│   ├── index.html                ← HTML entry point
│   ├── js/
│   │   └── main.js               ← Frontend logic (calls /api/chat proxy)
│   ├── css/
│   │   └── styles.css            ← Tailwind overrides & custom styles
│   └── assets/
│       ├── ConciergeOS Logo.png
│       └── MicrosoftOutlook.png
└── server/                       ← Backend (Express)
    ├── index.js                  ← App entry — mounts routes, serves client/
    ├── package.json              ← Server dependencies
    ├── .env                      ← Secrets (gitignored)
    ├── .env.example              ← Template for .env
    ├── routes/
    │   └── chat.js               ← /api/chat/* proxy (injects DOMAIN_KEY)
    ├── middleware/
    │   └── rateLimiter.js        ← Rate limiting (30 req/min per IP)
    └── utils/
        └── logger.js             ← Structured logging with levels
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your API keys

# 3. Start the server (serves frontend + API proxy)
npm start

# For development with auto-reload:
npm run dev
```

## Architecture

```
Browser  →  localhost:3001  →  Express server
              ├─ Static files from client/ (HTML, JS, CSS, assets)
              ├─ /api/chat/*  →  SecondBrainOS API (DOMAIN_KEY injected server-side)
              ├─ /api/config  →  Public config (no secrets)
              └─ /health      →  Health check endpoint
```

API keys are kept **server-side only** in `server/.env`. The frontend never sees or transmits secrets.

## Key Decisions

| Concern | Approach |
| --- | --- |
| API key security | Backend proxy injects `X-Domain-Key` header; key never reaches browser |
| Rate limiting | 30 req/min per IP via `express-rate-limit` |
| CORS | Restricted to `ALLOWED_ORIGINS` list in `.env` |
| Streaming | Response body piped via ReadableStream for SSE support |
| SPA routing | Catch-all `*` serves `index.html` for client-side navigation |

