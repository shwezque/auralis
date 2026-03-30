# PRD — Auralis Voice AI Platform: Lumia Journeys Pilot

**Version:** 0.1 — Prototype
**Date:** 2026-03-29
**Status:** Active build

---

## 1. Target User and Core Problem

The end user is a consumer on a travel site who wants help — planning a trip, comparing options, or getting a quick answer. They are not thinking about AI. They want to talk to someone competent and warm who can help them move forward.

Every existing support surface fails them the same way: chat widgets are generic and slow, IVR trees are disorienting, email is invisible. Voice AI can solve this — but every current platform (Bland, Vapi, Retell, ElevenLabs) stops at the API layer and leaves the consumer-facing experience completely unaddressed. No branded agent identity. No live transcript. No premium UI. The customer is left with raw latency and no trust signal.

Auralis solves the consumer-facing layer. This prototype demonstrates what that looks like using Lumia Journeys (fictional travel agency) and a named agent named Aria.

---

## 2. MVP Features

### F1 — API Key Onboarding Screen
A minimal gate screen that collects the user's Gemini API key before any session begins.

**Acceptance criteria**
- User enters a Gemini API key and submits; key is stored in localStorage and persists across page refreshes
- Returning users with a stored key bypass this screen entirely and land on the lobby
- Empty submission shows an inline error; does not proceed

---

### F2 — Pre-Call Lobby Screen
A full-viewport screen introducing Aria before the microphone permission prompt fires.

**Acceptance criteria**
- Screen displays Aria's name, her role ("Lumia Journeys travel concierge"), and a single "Start Conversation" CTA
- Browser mic permission prompt does not fire before the user taps the CTA
- Layout is unbroken on a 390px viewport (iPhone 14 width)

---

### F3 — Live Voice Conversation
Full-duplex voice session between the user and Aria via Gemini Live API.

**Acceptance criteria**
- Aria's audio response plays back within 2 seconds of session start after mic permission is granted
- Barge-in is active: user can speak while Aria is speaking and Aria stops
- Invalid API key or connection failure shows a human-readable error message, not a blank or frozen screen

---

### F4 — Real-Time Transcript
Live scrolling transcript rendered on-screen during the session, attributed to each speaker.

**Acceptance criteria**
- Each turn is labeled ("You" or "Aria") and appended as it streams — not after the turn ends
- Transcript auto-scrolls to the latest entry; user can scroll up to review without the view snapping back mid-read
- Transcript is visible during the active session — no separate tap or mode switch required

---

### F5 — Conversation State Indicators
Persistent visual indicator showing the current session state at all times.

**Acceptance criteria**
- Five states display and transition correctly during a real session: Connecting / Listening / You are speaking / Aria is speaking / Error
- Transition from Listening → You are speaking occurs within 300ms of user starting to speak
- Error state shows a specific non-technical message and a recovery action (retry or end)

---

### F6 — Session End and Transcript Readback
Clean end-of-session flow that confirms the conversation is over and shows the full transcript.

**Acceptance criteria**
- "End Conversation" button is accessible at all times during an active session and terminates audio immediately
- After ending, user sees the full session transcript in a scrollable view
- A "Start New Conversation" action returns the user to the lobby with clean session state

---

## 3. Non-Goals

These are explicitly out of scope. Named at the feature level to prevent build-time scope creep.

- **Multi-agent routing** — Aria is the only agent; no escalation, handoff, or supervisor layer
- **Server-side infrastructure** — no Node server, no database, no API proxy; Gemini key runs client-side from localStorage
- **Authentication or user accounts** — no login, no persistent identity across devices
- **Cross-session memory** — each session starts cold; no retrieval of prior conversations
- **Admin dashboard or analytics** — no call logs, no transcript storage, no usage metrics
- **Booking or transaction functionality** — Aria answers questions; she does not integrate with a reservation system or complete bookings
- **Non-English language support** — English only
- **Native mobile app** — mobile web only; no iOS or Android build
- **Accessibility audit** — WCAG compliance is post-validation
- **Widget or embeddable mode** — full-viewport only; no iframe, no chat widget variant

---

## 4. Build Milestones

**Milestone 1 — Shell and Routing**
React + Vite scaffolded with Tailwind, all screen routes stubbed (onboarding → lobby → session → summary), navigation works with placeholder content, deploys to Vercel without errors.

**Milestone 2 — Gemini Live Integration**
API key onboarding stores the key; lobby initiates a real Gemini session on button tap; full-duplex audio works (mic in, audio out); barge-in confirmed functional in manual test.

**Milestone 3 — Transcript and State Layer**
Real-time transcript renders during an active session with correct speaker attribution and auto-scroll; all five state indicators display and transition correctly; error state handles a bad API key gracefully.

**Milestone 4 — Session End and Demo Polish**
End session flow complete (button → summary → restart); Lumia Journeys brand identity applied across all screens; full happy path demonstrable end-to-end on a mobile browser with no broken states.
