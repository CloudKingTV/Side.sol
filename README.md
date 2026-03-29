# SIDE.SOL — Solana Side Events

The gamified side event directory for Solana conferences. Built by CloudKing.

## Features

- **Event Discovery** — Grid, list, and calendar views with search, category/date filters
- **Banner Uploads** — Event hosts can upload custom banners with pastel gradient overlay
- **RSVP + Check-in** — RSVP to events, verify attendance with rotating 6-char codes
- **Side Quests** — 11 quests gated behind real attendance. Earn XP for checking in.
- **Leaderboard** — Compete with attendees. Level up from Lurker → Solana God.
- **Live Pulse** — Real-time feed of check-ins, quest completions, level-ups
- **Friends** — Add friends, see what they're attending, view profiles
- **Privacy** — Public/private toggle, per-event incognito mode
- **Dark Mode** — Full dark theme with toggle, persisted to localStorage
- **Deep Links** — Share events via `#event=ID` URLs with native share sheet
- **Host Dashboard** — Rotating check-in codes for event hosts

## Deploy

```bash
npm install
npm run dev          # localhost:5173
npx vercel           # deploy
```

Or push to GitHub → connect in vercel.com (auto-detects Vite).

## Stack

- React 18 + Vite
- localStorage persistence
- Zero backend dependencies
- Bricolage Grotesque + Outfit + JetBrains Mono
- CSS-only animations (20+ keyframes)

## License

MIT
