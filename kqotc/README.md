# KQOTC — King / Queen of the Court

Run a King/Queen of the Court beach volleyball tournament with live scoring and player check-in from any phone.

## Run locally

Use `serve.py` from the repo root (not the plain Python server) — it exposes `GET /api/ip` so QR codes resolve to the correct LAN address on other devices:

```sh
python3 serve.py
# open http://localhost:8080/kqotc/
```

Sign in with an admin Google account, or add `admins/{your-email}` manually in the Firestore console first.

## How it works

1. **Create an event** (admin only) — sets a name and date, opens the check-in screen
2. **Players check in** — scan the QR code or tap "Join →" on any phone; no account needed
3. **Start the event** — players are automatically split into King Court teams and a Work-up court
4. **Run rounds** — organiser enters scores; players can also submit their score from their phone as a reference
5. **End round** — winning Work-up players move up, losing King Court teams move down; cumulative scores update
6. **Repeat** until "End tournament" — final leaderboard shown

## Firebase setup

- **Auth**: Google OAuth2 for admins; Anonymous Auth for players (must be enabled in Firebase Console → Authentication)
- **Firestore**: add `admins/{email}` documents for each admin; deploy security rules from the repo root's `firestore.rules` (or the rules block in the main README)

## Data model

```
admins/{email}
tournaments/{id}
  .name, .status, .screen, .round, .numTopTeams
  .topTeams[]   — { id, playerIds[], roundScore }
  .workUp[]     — { playerId, roundScore }
  .pendingNext  — { topTeams[], workUp[] }
  .playerCount  — denormalised count for home screen display
tournaments/{id}/players/{uid}
  .name, .cumScore, .joinedAt
  .submittedScore, .submittedRound   — set by player after each round
```

## File structure

```
index.html      ← organiser app (all screens)
app.js          ← all state, Firebase calls, render functions
logic.js        ← pure functions: lineup generation, score computation, transitions
style.css
manifest.json
sw.js
join/
  index.html    ← player-facing page: check-in, score submission, round status
icons/
```
