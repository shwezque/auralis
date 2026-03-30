# Screen Map — Auralis / Lumia Journeys Pilot

**Version:** 0.1
**Date:** 2026-03-29

---

## Screen Inventory

| # | Screen | Route | PRD Feature | Entry condition |
|---|---|---|---|---|
| S1 | Onboarding | `/` | F1 | No API key in localStorage |
| S2 | Lobby | `/lobby` | F2 | Key present in localStorage |
| S3 | Session | `/session` | F3, F4, F5 | Mic permission granted |
| S4 | Summary | `/summary` | F6 | Session ended (any reason) |

---

## Flow Diagram

```
[App Load]
    │
    ├─ key in localStorage? ──NO──→ [S1: Onboarding]
    │                                     │
    │                              key submitted
    │                                     │
    └─ YES ──────────────────────→ [S2: Lobby]
                                          │
                                   "Talk to Aria" tapped
                                   mic permission granted
                                          │
                                   [S3: Session]
                                          │
                              ┌───────────┴───────────┐
                         "End" tapped            error occurs
                              │                       │
                              └───────────┬───────────┘
                                          │
                                   [S4: Summary]
                                          │
                              ┌───────────┴───────────┐
                      "Start New"              "Change API Key"
                              │                       │
                         [S2: Lobby]           [S1: Onboarding]
                                               (key cleared)
```

---

## Screen-to-Feature Mapping

| PRD Feature | Screen(s) | Notes |
|---|---|---|
| F1 — API Key Onboarding | S1 | Stores key to localStorage on submit |
| F2 — Pre-Call Lobby | S2 | Intro Aria, trigger mic permission, connect |
| F3 — Live Voice Conversation | S3 | Full-duplex audio via Gemini Live |
| F4 — Real-Time Transcript | S3 | Rendered inside Session, both speaker turns |
| F5 — Conversation State Indicators | S3 | Avatar animation + state label |
| F6 — Session End + Transcript Readback | S3 (End button) + S4 | S3 triggers end; S4 displays result |

---

## State Inventory per Screen

### S1 — Onboarding
- `default` — empty form
- `error` — empty submit attempt
- `submitting` — key submit in progress

### S2 — Lobby
- `default` — ready to connect

### S3 — Session
- `connecting` — session initializing
- `listening` — idle, mic active, waiting for speech
- `user-speaking` — VAD detected user input
- `agent-speaking` — Aria audio streaming
- `muted` — mic capture paused (overlay on any active state)
- `error` — connection lost or API error

### S4 — Summary
- `default` — transcript present
- `empty` — session ended with no turns captured
- `error-ended` — session terminated due to error (shows "Change API Key" action)

---

## Navigation Rules

- **S1 → S2:** Only on valid key submit (key saved to localStorage)
- **S2 → S3:** Only after mic permission granted
- **S3 → S4:** On explicit "End" confirmation OR unrecoverable error
- **S4 → S2:** "Start New Conversation" — clears session state, key retained
- **S4 → S1:** "Change API Key" — clears key from localStorage
- **Direct URL to S3:** Redirect to S2 if no active session
- **Direct URL to S4:** Redirect to S2 if no transcript in state
- **No back navigation** during S3 (active session) — browser back button goes to S2 only after session ends
