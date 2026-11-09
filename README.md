# FOODWISE (React)

Household food management app by BU3102 Group 33, JCU Singapore.
Built with React 18 + Vite. No UI libraries; styles are in `src/styles.css`.

## Run it

You need Node.js 18 or newer (https://nodejs.org).

```bash
npm install
npm run dev
```

Open the link shown in the terminal (usually http://localhost:5173).
To try it on your phone, connect to the same Wi-Fi and open the "Network" link.

## Two modes

| Mode | When | Data |
|------|------|------|
| Offline | `VITE_API_URL` is empty (default) | Saved in the browser, with demo data |
| Backend | `VITE_API_URL` is set in `.env` | Loaded from and saved to the FOODWISE API |

To switch to backend mode:

```bash
cp .env.example .env
# then edit .env:
VITE_API_URL=https://your-backend-url
```

Photo scan, AI recipes and household sharing only work in backend mode.
Everything else works in both.

## Build and upload to a server

```bash
npm run build
```

Upload everything inside the `dist/` folder to your web server
(for example `public_html/` on cPanel, or `/var/www/foodwise/` on Nginx).
Use HTTPS so the camera and "Add to Home Screen" work on phones.

## Project structure

```
src/
  App.jsx            screen switcher, bottom sheet and toast
  styles.css         all styles (light and dark mode)
  lib/
    api.js           THE ONLY FILE THAT TALKS TO DATA (offline or backend)
    store.jsx        app data in React context, optimistic updates
    ui.jsx           navigation, sheets, toasts
    food.js          recipe matching, emoji, impact assumptions
    dates.js         date helpers
    useShopping.jsx  smart shopping check ("you already have this")
  pages/             one file per screen
  sheets/            bottom sheets (item, recipe, plan, waste, household)
  components/        small shared pieces
  data/              built-in recipes and offline demo data
```

## Who works where

- UI and design changes: `pages/`, `components/`, `styles.css`
- Backend connection: `lib/api.js` only, following `API.md`
- Impact estimates (price per kg, CO2 factor): `lib/food.js`
