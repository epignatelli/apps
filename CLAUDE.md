# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A no-build, no-framework Progressive Web App (PWA). All logic lives in three files — `index.html`, `app.js`, `style.css` — served directly as static files. There is no package manager, no bundler, no transpiler, and no test suite.

## Running locally

Open `index.html` directly in a browser, or serve with any static file server:

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

The service worker (`sw.js`) only activates over HTTPS or `localhost`, so offline caching works locally but not when opening the file via `file://`.

## Deployment

Push to GitHub Pages (`main` branch, root). The app is live immediately — no build step.

If the service worker cache gets stale after code changes, bump the `CACHE` constant name in `sw.js` (e.g. `vb-lineups-v2`). The activate handler purges old cache keys automatically.

## Architecture

**Two screens, one JS file.** `index.html` holds both screen divs (`#screen-setup`, `#screen-results`); CSS `.screen.active` toggles visibility. All state and logic is in `app.js`, executing as a plain script with globals.

**State:**
- `players` — array of `{ id, name, gender:'m'|'f', positions: Set<string> }`, persisted to `localStorage` under `vb-roster-v1`. Sets are not JSON-serialisable; boot re-hydrates them from arrays.
- `minWomen` — minimum women required on court per rotation, persisted under `vb-settings-v1`.
- `ALL_LINEUPS` — computed on "Build lineups", held in memory for the results screen.
- `filterState` — ephemeral per-session filter/sort state for the results screen.

**Lineup generation (`generateLineups`):** Brute-force combinatorial search — picks 1 setter, 3 hitters, 2 middles, 1 libero from the `positions` sets, then checks each rotation (libero substitutes for each middle) against `minWomen`. Marks a lineup `tight` when any rotation lands exactly at `minWomen`.

**Gender dot:** Clicking the colored dot on a roster row calls `toggleGender(id)`, flipping `'m'`↔`'f'` and re-saving.

**Filter panel** in the results screen is rebuilt on every `buildLineups()` call via `buildFilterPanel()`. Toggle labels ("N+ women on court", rotation-sensitive tooltip) are rendered dynamically from `minWomen`.

**CSS custom properties** (defined on `:root` in `style.css`) drive the entire color system — `--green` for women, `--purple` for men, `--amber` for rotation-sensitive warnings.
