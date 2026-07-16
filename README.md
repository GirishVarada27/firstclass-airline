# FirstClass

A futuristic airline ticket booking app: international flights, hotel stays in 50 major cities,
guided city tours in 20 cities, and visa services — all bookable as a guest, no account required.

## Stack

React 19 + Vite + Tailwind v4 on the frontend, Express 5 + Postgres (Neon) + Better Auth on the backend.
One process serves both the API and the built frontend in production.

## Local development

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and BETTER_AUTH_SECRET
npm run dev
```

This starts the Vite dev server (client) and the Express API concurrently, proxied together.

## Production

```bash
npm run build
npm start
```

Schema creation and catalog seeding (flights, hotels, tours) run automatically on boot — no manual
migration step needed.
