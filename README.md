# DynamicDash — Frontend

Vite + React + TypeScript builder UI for the DynamicDash API.

**Stack:** React 18 · Ant Design 5 · Zustand · react-grid-layout · Recharts · axios · react-router

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

The .NET API must be running first (from `../Dynamic Dashboard/DynamicDashboard.Api`):

```bash
dotnet run --launch-profile https   # listens on https://localhost:7017 (+ http 5248)
```

Vite proxies `/api/*` → `https://localhost:7017` (see `vite.config.ts`, `secure:false` to
accept the dev cert), so the browser only ever talks to the Vite origin — no CORS in dev.
To bypass the proxy and hit the API directly, set `VITE_API_BASE_URL` in `.env`.

## What works

- **Gallery** (`/`) — list / create / delete dashboards. New dashboards are owned by the
  first seeded user.
- **Builder** (`/builder/:id`) — drag/resize widgets on a 12-col grid, add from the palette
  (KPI · Chart · Table · Gauge · Markdown), delete, and **Save layout** (persists each
  widget's `position`). Each widget pulls from `POST /api/widgets/{id}/data` (currently
  backend mock data).

## Structure

```
src/
  api/            axios client + DTO types (mirror the .NET DTOs, camelCase)
  store/          zustand builder store (widgets + dirty tracking)
  pages/          GalleryPage, BuilderPage
  components/     WidgetPalette, WidgetCard, widgets/<type> renderers + registry
```

## Notes / next steps

- Widget `config`/`position` are JSON **strings** on the API; we parse/serialize at the edge.
- Canonical widget types are `KPI | CHART | TABLE | GAUGE | MARKDOWN` (match the backend
  mock-data switch). The `/api/widget-types` schema endpoint uses different ids
  (`lineChart`, etc.) — wire a config form (react-jsonschema-form) to it later.
- No auth yet; owner is hard-picked from the users list.
