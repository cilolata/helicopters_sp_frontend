# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server on :5173 (proxies /aircrafts → localhost:3000)
npm run build      # tsc + vite build
npm test           # vitest run (single pass)
npm run test:watch # vitest watch mode
npx vitest run src/__tests__/useAircrafts.test.ts  # run a single test file
```

## Architecture

React + TypeScript + Vite. Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin, no `tailwind.config.js`). Leaflet via `react-leaflet`.

### API connection

`src/config.ts` exports `API_BASE = import.meta.env.VITE_API_URL ?? ''`. In dev, the Vite proxy (`vite.config.ts`) maps `/aircrafts` → `localhost:3000`, so the empty default works. In production, set `VITE_API_URL` to the backend origin.

### Hook responsibilities

| Hook | What it owns |
|---|---|
| `useAircrafts` | Polls `GET /aircrafts` every 5 s; AbortController + 8 s timeout; exposes `error` state |
| `useTracking` | Which ICAO hex is currently "followed" on the map (click to toggle) |
| `useTrackPath` | Track polyline: fetches historical route on ICAO selection, appends live positions each poll (capped at 2 000 points) |
| `useHelipads` | Loads `public/helipads.json` once; increments `landings` counter when an aircraft enters 350 m radius at < 300 m altitude; uses a `landedRef` Map to count each aircraft only once per helipad |
| `useHistoryRoute` | One-shot fetch of a specific aircraft's full stored route — used by the sidebar "show history" action, independent of tracking |
| `useTodayAircrafts` | Polls `GET /aircrafts/today` every 30 s for the daily flight list |
| `useDateAircrafts` | One-shot fetch of `GET /aircrafts/history?date=` for the sidebar date picker |

### Map rendering quirks

`AircraftMarker` keeps `stablePos.current` as the permanent `position` prop passed to react-leaflet — it never changes after mount. Actual movement happens via `marker.setLatLng()` inside a `requestAnimationFrame` lerp loop that runs over the 5 s poll interval. This prevents react-leaflet from re-rendering and fighting the animation.

Icon recreation (via `setIcon`) is triggered only on `tracked` or `ac.track` changes, not on position changes.

`MapAutoFit` (`MapControls.tsx`) uses a `fitted` ref to run `fitBounds` exactly once on the first non-empty aircraft list.

### Marker icon

`makeHelicopterIcon` in `utils/markerIcon.ts` returns an `L.DivIcon` with inline SVG. The SMIL `<animateTransform>` spins the main rotor independently of CSS. The `.ac-body` wrapper carries the `rotate(${track}deg)` heading. Red = untracked, blue = tracked.

### Tests

Tests avoid mounting the full Leaflet map. `AircraftMarker.test.tsx` tests the lerp algorithm and RAF timing logic directly. `useAircrafts.test.ts` uses `vi.useFakeTimers()` and a stubbed `fetch`.

Pre-existing TS error in `AircraftMarker.test.tsx`: the `baseAircraft` fixture is missing the `operator` field — `tsc` catches it but `vitest run` still passes.

### Utilities

- `fmt(val, unit)` — formats nullable numbers with a unit or returns `'—'`
- `lerp(a, b, t)` — linear interpolation used by the position animation
- `applyRotation(el, deg, animate)` — DOM helper targeting `.ac-body`; exported but not currently used in production paths
- `exportToPdf(rows, date)` — jsPDF + jspdf-autotable; called from `HelicopterList` on the histórico tab
