# UX Spec — Auralis / Lumia Journeys Pilot

**Version:** 0.1
**Date:** 2026-03-29
**Maps to:** prd.md features F1–F6

---

## Navigation Model

**Linear, stateful, no persistent chrome.**

The app is a single directed flow: Onboarding → Lobby → Session → Summary. There is no bottom nav, no hamburger menu, no back button visible during an active session. Each screen owns the full viewport. The only exit points are:

- Onboarding → Lobby (on valid key submit)
- Lobby → Session (on "Start Conversation" tap)
- Session → Summary (on "End Conversation" tap or connection error)
- Summary → Lobby (on "Start New Conversation")
- Summary → Onboarding (on "Change API key" — shown only if error occurred)

**Routing:**
```
/          → Onboarding (if no key in localStorage) OR Lobby (if key exists)
/lobby     → Lobby
/session   → Session (redirect to /lobby if no active key)
/summary   → Summary (redirect to /lobby if no transcript)
```

---

## Visual Tone Direction

**Reference:** Calm (night mode) × Intercom (agent identity) × Typeform (spatial restraint)

- **Background:** Deep navy (`#0A1628`) — full-bleed, no card-on-white layouts
- **Accent:** Warm gold (`#C4922A` / `#E8B84B`) — CTA buttons, agent name, active state highlights
- **Text primary:** Warm cream (`#F8F4EE`)
- **Text secondary:** Muted slate (`#94A3B8`)
- **Motion:** Slow, low-amplitude (3–5s cycles). Ambient, not attention-grabbing.
- **Typography:** Inter (geometric humanist) — generous line height, moderate weights only (400, 500, 600). No condensed, no ultra-light.
- **Spatial grammar:** Centered focal element in upper zone. Content/transcript in lower zone. Controls docked at bottom. No sidebars. Generous vertical padding.

---

## Screen Specifications

---

### Screen 1 — Onboarding
**PRD feature:** F1
**Route:** `/` (first visit only)
**Purpose:** Collect the Gemini API key. Frame the experience. Set tone.

**Layout zones (top to bottom):**
1. **Brand zone** — Lumia Journeys logo mark + wordmark, centered, upper third
2. **Experience preview** — 2–3 lines describing what Aria does (not a form label — a warm invitation)
3. **Key input field** — password-type input, placeholder "AIza...", label "Gemini API Key"
4. **Submit CTA** — full-width button: "Start Conversation"
5. **Helper text** — small, muted: where to get a key + privacy note ("Key stored on this device only")

**States:**
- **Default** — empty field, button enabled
- **Error** — empty submit: inline error below field ("Please enter your API key")
- **Loading** — button shows spinner after submit (brief, while key is validated by first connect attempt)

**Interactions:**
- Submit on button tap or keyboard "Enter"
- On success: key written to localStorage, navigate to `/lobby`
- Field is `type="password"` — key is masked

**Empty state:** N/A — this is the empty state

**UX decisions flagged:**
- Key validation happens at session connect time (not on submit) — onboarding only stores the key. Invalid keys surface as errors on the Session screen.

---

### Screen 2 — Lobby
**PRD feature:** F2
**Route:** `/lobby`
**Purpose:** Introduce Aria. Establish trust. Prime the user for a voice conversation before mic permission fires.

**Layout zones (top to bottom):**
1. **Brand header** — Lumia Journeys wordmark (small, top-left) + "Change key" link (top-right, subtle)
2. **Agent identity block** — centered:
   - Aria avatar (circular, gold gradient initials "A" or illustration)
   - Name: "Aria"
   - Role line: "Travel Concierge · Lumia Journeys"
   - Availability indicator: small green dot + "Available now"
3. **Conversation starters** — 2–3 example questions in muted italic (not tappable — visual context only)
   - *"Where should I go for two weeks in Southeast Asia?"*
   - *"Help me plan a Maldives honeymoon."*
   - *"What's the best time to visit Japan?"*
4. **CTA** — large, full-width: "Talk to Aria"
5. **Mic note** — micro-copy below CTA: "Tap to start — we'll ask for mic access"

**States:**
- **Default** — above
- **Returning user** — same layout; no difference visible (key already stored)

**Interactions:**
- "Talk to Aria" → triggers browser mic permission → on grant, navigate to `/session`
- "Change key" → clears localStorage key → navigate to `/`
- No other interactive elements on this screen

**Empty state:** N/A

---

### Screen 3 — Session
**PRD features:** F3, F4, F5
**Route:** `/session`
**Purpose:** The live voice conversation. Agent visual + real-time transcript + session controls.

**Layout zones (top to bottom):**
1. **Session header** — slim bar: Lumia Journeys mark (left) + "End" text button (right, always visible)
2. **Agent visual zone** — upper ~35% of viewport:
   - Aria avatar (same as lobby, larger)
   - State-driven animation (see states below)
   - State label: small text below avatar ("Listening", "Aria is speaking", etc.)
3. **Transcript zone** — middle ~50% of viewport, scrollable:
   - Each turn is a message bubble
   - Aria turns: left-aligned, dark surface bubble, gold avatar dot, cream text
   - User turns: right-aligned, navy-700 bubble, muted "You" label, cream text
   - In-progress turn shows a blinking cursor or streaming text
   - Auto-scrolls to latest; user can scroll up freely
4. **Controls dock** — bottom ~15%, fixed:
   - Mute toggle (icon button, left)
   - End Conversation (prominent, centered or right)

**Conversation states (F5):**

| State | Avatar animation | Label | Controls |
|---|---|---|---|
| Connecting | Slow pulse, dimmed | "Connecting…" | End only |
| Listening | Gentle breathing ring | "Listening" | Mute + End |
| User speaking | Faster ring pulse, brighter | "Hearing you…" | Mute + End |
| Aria speaking | Gold wave rings radiate outward | "Aria is speaking" | Mute + End |
| Error | Red tint, static | Error message (see below) | Retry + End |

**Error state:**
- Avatar dims to red tint
- Error message replaces state label: human-readable string (e.g. "Couldn't connect — check your API key" or "Connection lost — tap to retry")
- Two actions: "Try Again" (re-initiates session) and "End" (goes to summary with whatever transcript exists)

**Transcript empty state:**
- Before first turn: centered placeholder in transcript zone — "Your conversation will appear here"

**Interactions:**
- Barge-in: handled by Gemini Live VAD — no UI interaction required
- Mute: toggles mic capture off/on; avatar dims slightly when muted; label shows "Muted"
- "End" tap: shows a brief confirmation ("End this conversation?") with "Yes, end" / "Keep talking" — prevents accidental taps. On confirm: closes session, navigates to `/summary`
- Scroll: transcript zone scrolls independently; auto-scroll resumes after 3s of inactivity if user has not manually scrolled far up

**UX decisions flagged:**
- End confirmation modal prevents demo accidents. Keep it minimal — not a full bottom sheet, just an inline prompt.
- Mute does not disconnect the session — audio capture stops, WebSocket stays open.

---

### Screen 4 — Summary
**PRD feature:** F6
**Route:** `/summary`
**Purpose:** Confirm the session ended. Show the full transcript. Offer a clean restart.

**Layout zones (top to bottom):**
1. **Session end header** — Lumia Journeys mark + "Conversation ended" subtitle
2. **Transcript readback** — full scrollable conversation transcript, same bubble style as Session screen
   - Static (not live) — shows the complete record
   - Timestamp on each turn (duration into call, e.g. "0:32")
3. **Actions** — bottom, fixed:
   - Primary: "Start New Conversation" (gold, full-width)
   - Secondary: "Change API Key" (text link, only shown if session ended with an error)

**States:**
- **Normal** — transcript present, both actions
- **Empty transcript** — session ended before any turns: "Nothing was captured in this conversation." + New Conversation button
- **Error-ended** — same layout, "Change API Key" secondary visible

**Interactions:**
- "Start New Conversation" → clears session state → navigate to `/lobby`
- "Change API Key" → clear key from localStorage → navigate to `/`
- Transcript is read-only; no copy, no share in this prototype

---

## First-Session User Journey

```
Opens URL
  → No key in localStorage
  → Onboarding screen
  → Enters Gemini API key
  → Taps "Start Conversation"
  → Key saved to localStorage
  → Navigates to Lobby

Lobby
  → Sees Aria's name, role, example questions
  → Taps "Talk to Aria"
  → Browser asks for mic permission
  → Grants permission
  → Navigates to Session

Session — Connecting
  → Avatar dims, "Connecting…" label
  → Gemini Live session establishes (~1–2s)

Session — Listening
  → Avatar breathing ring, "Listening" label
  → Aria speaks an opening greeting (audio plays, transcript appears)
  → State: Aria speaking → back to Listening

User speaks
  → State: Hearing you → Aria speaking (after processing)
  → Transcript updates with user turn, then Aria turn
  → Conversation continues naturally

User taps "End"
  → Confirmation prompt: "End this conversation?"
  → Taps "Yes, end"
  → Audio stops, navigate to Summary

Summary
  → Full transcript visible
  → Taps "Start New Conversation"
  → Navigate to Lobby (key still stored)
```

---

## Core Interaction Loop

```
[User speaks]
     ↓
[VAD detects speech — state: User speaking]
     ↓
[Audio streams to Gemini Live]
     ↓
[Gemini processes — state: Listening (brief)]
     ↓
[Aria audio streams back — state: Aria speaking]
[Transcript appends simultaneously]
     ↓
[Aria finishes turn — state: Listening]
     ↓
[User can speak again or barge in at any point]
```

Barge-in path:
```
[Aria speaking]
     ↓
[User begins speaking]
     ↓
[Gemini VAD interrupts — state: User speaking]
[Aria audio stops]
     ↓
[Normal loop resumes]
```

---

## States Summary

| Screen | States |
|---|---|
| Onboarding | Default, Error (empty submit), Loading (submit in progress) |
| Lobby | Default |
| Session | Connecting, Listening, User speaking, Aria speaking, Error, Muted (overlay on any state) |
| Summary | Normal, Empty transcript, Error-ended |
