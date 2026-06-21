# Apps

A collection of no-build PWAs for volleyball, served from GitHub Pages.

## Structure

```
index.html        ← landing page
vb-lineups/       ← VB Lineups app
kqotc/            ← King / Queen of the Court tournament app
  index.html
  app.js
  logic.js
  style.css
  manifest.json
  sw.js
  join/
    index.html    ← player check-in & score submission page
  icons/
```

## Run locally

```sh
python3 -m http.server 8080
# landing:    http://localhost:8080
# vb-lineups: http://localhost:8080/vb-lineups/
# kqotc:      http://localhost:8080/kqotc/
```

For KQOTC QR check-in across devices on the same network, use `serve.py` instead — it auto-detects the LAN IP and exposes `GET /api/ip` so the QR code points to the right address:

```sh
python3 serve.py
# also prints the LAN URL, e.g. http://192.168.1.42:8080
```

## Deploy

Push to `main`. GitHub Pages serves immediately — no build step.

If the service worker cache is stale after a release, bump the `CACHE` constant in the app's `sw.js`.

---

## VB Lineups

Build valid rotation lineups for mixed volleyball.

- Add players with gender and position (Setter, OH / OPP, Middle, Libero)
- Configurable minimum women on court per rotation
- Optional OH / OPP split mode
- Brute-force search over all valid lineup combinations
- Flags rotation-sensitive lineups
- Filter and sort results
- Roster persisted to `localStorage`
- Works offline, installable on iOS and Android

---

## KQOTC — King / Queen of the Court

Run a King/Queen of the Court beach volleyball tournament with live scoring and player check-in from any phone.

### Features

- **Multi-tournament** — create and manage multiple events; home screen lists active, upcoming, and past tournaments
- **QR check-in** — players scan a QR code (or tap "Join →") to check in anonymously from their phone; no account needed
- **Live player list** — new check-ins appear on the organiser's screen in real time
- **Lineup generation** — automatically assigns players to King Court teams and a Work-up court based on player count
- **Round management** — organiser enters team and work-up scores per round; players can submit their own score from their phone as a reference
- **Automatic promotion/demotion** — winning work-up players move up; losing King Court teams move down
- **Leaderboard** — cumulative scores tracked across all rounds; final results shown at the end
- **Admin auth** — Google sign-in required to create/delete events or manage players; players join anonymously via Firebase Anonymous Auth

### Tech

- Firebase Firestore (real-time `onSnapshot` listeners) for tournament state and player subcollection
- Firebase Auth — Google OAuth2 for admins, Anonymous Auth for players
- Admin list managed in `admins/{email}` Firestore collection
- No build step — plain HTML/CSS/JS

### Firestore data model

```
admins/{email}                          ← admin access list
tournaments/{id}                        ← tournament doc (screen, round, teams, scores…)
tournaments/{id}/players/{uid}          ← player doc (name, cumScore, submittedScore, submittedRound)
```

### Running KQOTC locally

Use `serve.py` (not the plain Python server) so QR codes resolve correctly on other devices:

```sh
python3 serve.py
```

Sign in with an admin Google account, or manually add `admins/{your-email}` in the Firestore console first.
