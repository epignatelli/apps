# VB Lineups

A Progressive Web App for building valid mixed volleyball lineups from your roster.

## Features

- Add players with gender and position assignments (Setter, Hitter / OH+OPP, Middle, Libero)
- Configurable minimum women on court per rotation
- Optional split between Outside Hitter and Opposite roles
- Brute-force combinatorial search — finds every valid lineup
- Rotation-sensitive detection: flags lineups where a middle swap lands exactly at the minimum
- Filter by setter, libero, must-include hitters, middles
- Sort by women count or rotation sensitivity
- Roster persisted to `localStorage` — your team is there next time you open the app
- Works offline after first visit
- Installable on iOS and Android home screens

## Run locally

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy to GitHub Pages

1. Push to a GitHub repo (`main` branch, root)
2. Go to **Settings → Pages → Source** and set it to `main` branch, `/ (root)`
3. Your app will be live at `https://yourusername.github.io/vb-lineups/`

## Install on iPhone

1. Open the URL in Safari
2. Tap the Share button → **Add to Home Screen**

## Install on Android

1. Open the URL in Chrome
2. Tap the banner or **⋮ → Add to Home screen**
