# dsm

Frontend for **Digital Shop Manager** — a multi-tenant SaaS POS for shops in Tanzania.

## Stack

- React + Vite
- react-router-dom v6
- react-i18next — English (default) + Kiswahili toggle
- axios (JWT in memory, 401 refresh + 402 subscription-expired interceptors)
- Offline-first: service worker + IndexedDB sync queue
- Talks to the `dsm-api` backend

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm test` | Run tests |
| `npm run lint` | Lint |

## Architecture

- Tenant is resolved from the subdomain in production; on localhost the backend
  derives it from the JWT, so the dev app just sends the Bearer token.
- Two shells: **Super Admin portal** and **Shop**.
