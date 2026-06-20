# Apps

A collection of no-build PWAs for volleyball, served from GitHub Pages.

## Structure

```
index.html        ← landing page
vb-lineups/       ← VB Lineups app
  index.html
  app.js
  style.css
  manifest.json
  sw.js
  icons/
```

## Run locally

```sh
python3 -m http.server 8080
# landing:    http://localhost:8080
# vb-lineups: http://localhost:8080/vb-lineups/
```

## Deploy

Push to `main`. GitHub Pages serves immediately — no build step.

## VB Lineups

Build valid lineups for mixed volleyball. Features:

- Add players with gender and position assignments (Setter, Hitter / OH + OPP, Middle, Libero)
- Configurable minimum women on court per rotation
- Optional split between Outside Hitter and Opposite roles
- Finds every valid lineup combination
- Flags rotation-sensitive lineups
- Filter by setter, libero, hitters, middles
- Roster persisted to `localStorage`
- Works offline, installable on iOS and Android
