# Health data dashboard

Local-first React app for exploring health metrics (blood pressure, activity, sleep, etc.) from CSV exports. Data stays in the browser via IndexedDB.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (bundled with Node)

## Run locally

From the project root:

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (by default [http://localhost:5173](http://localhost:5173)).

## Other scripts

| Command | Description |
|--------|-------------|
| `npm run build` | Typecheck and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally (run `build` first) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

## Stack

Vite, React, TypeScript, Dexie (IndexedDB), Recharts, Papa Parse for CSV.
