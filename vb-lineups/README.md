# VB Lineups

Build valid rotation lineups for mixed volleyball. Given a roster of players with positions and genders, it finds every valid 6-player lineup and flags rotation-sensitive ones.

## Run locally

```sh
# from repo root
python3 -m http.server 8080
# open http://localhost:8080/vb-lineups/
```

## Features

- Add players with gender (M/F) and one or more positions: Setter, Outside Hitter, Opposite, Middle, Libero
- Configurable minimum women on court per rotation (default: 2)
- Optional OH / OPP split mode — treats Outside Hitter and Opposite as distinct roles
- Brute-force search over all valid lineup combinations
- Flags `tight` lineups where any rotation lands exactly at the women minimum
- Filter results by setter, libero, hitters, middles; sort by tightness
- Roster persisted to `localStorage` under `vb-roster-v1`
- Settings (minWomen, splitHitters) persisted under `vb-settings-v1`
- Works offline, installable as a PWA on iOS and Android

## Architecture

Two screens (`#screen-setup`, `#screen-results`) in a single `index.html`; CSS `.screen.active` toggles visibility. All state and logic lives in `app.js` as plain globals — no framework, no build step.

**Lineup generation** (`generateLineups` in `app.js`): picks 1 setter, 3 hitters, 2 middles, 1 libero from each player's `positions` set, then checks every rotation (libero substitutes for each middle) against `minWomen`.
