# Content Map — Auralis / Lumia Journeys Pilot

**Version:** 0.1
**Date:** 2026-03-29
**All content is static (hardcoded) — no CMS required**

---

## Content Categories

### 1. Brand Identity
Content that defines Lumia Journeys and its visual/verbal presence.

| Item | Value |
|---|---|
| Brand name | Lumia Journeys |
| Agent name | Aria |
| Agent role | Travel Concierge |
| Brand tagline | (not displayed in UI — used for tone reference only) |
| Brand voice | Warm, confident, knowledgeable. Speaks like a well-traveled friend. |

---

### 2. Onboarding Screen (S1)
Content that frames the experience before the user has done anything.

| Item | Type | Notes |
|---|---|---|
| Brand name display | UI text | "Lumia Journeys" |
| Experience invitation | Body copy | 2–3 line description of what Aria does |
| API key field label | Form label | "Gemini API Key" |
| API key placeholder | Input placeholder | "AIza..." |
| Submit CTA | Button label | "Start Conversation" |
| Key source helper | Micro-copy | Where to get a key |
| Privacy note | Micro-copy | Where the key is stored |
| Empty field error | Error message | Inline, below field |

---

### 3. Lobby Screen (S2)
Content that introduces Aria and sets the expectation for voice conversation.

| Item | Type | Notes |
|---|---|---|
| Agent name | UI text | "Aria" |
| Agent role line | UI text | "Travel Concierge · Lumia Journeys" |
| Availability indicator | Status text | "Available now" |
| Conversation starters (×3) | Example copy | Muted italic, non-interactive |
| Talk CTA | Button label | Primary action |
| Mic permission note | Micro-copy | Below CTA |
| Change key link | Link text | Top-right, subtle |

---

### 4. Session Screen (S3)
Content that communicates real-time state and grounds the user during the conversation.

| Item | Type | Notes |
|---|---|---|
| State label: Connecting | Status text | Below avatar |
| State label: Listening | Status text | Below avatar |
| State label: User speaking | Status text | Below avatar |
| State label: Aria speaking | Status text | Below avatar |
| State label: Muted | Status text | Overlay on active state |
| Transcript placeholder | Empty state | Before first turn |
| Transcript speaker label — Aria | Label | On Aria turns |
| Transcript speaker label — user | Label | On user turns |
| End session button | Button label | Top-right header |
| End confirmation heading | Dialog copy | Inline prompt |
| End confirmation: confirm action | Button label | |
| End confirmation: cancel action | Button label | |
| Error: bad API key | Error message | Human-readable |
| Error: connection lost | Error message | Human-readable |
| Error: generic | Error message | Fallback |
| Retry action | Button label | In error state |

---

### 5. Summary Screen (S4)
Content shown after the session ends.

| Item | Type | Notes |
|---|---|---|
| Screen title | Heading | "Conversation ended" framing |
| Transcript header | Section label | Above transcript readback |
| Empty transcript message | Empty state | If no turns captured |
| Restart CTA | Button label | Primary action |
| Change key link | Link text | Secondary, error-ended only |

---

### 6. Aria System Prompt (Agent Content)
Content that defines what Aria knows, how she speaks, and what she stays within. Hardcoded in `src/lib/systemPrompt.js`. Not surfaced directly in UI but shapes every voice response.

| Item | Notes |
|---|---|
| Aria persona definition | Name, role, personality, tone |
| Knowledge domain | Travel planning, destinations, Lumia Journeys services |
| Topic guardrails | Scope boundaries, redirection language |
| Brand information | Lumia Journeys positioning, offerings |
| Conversation style rules | Voice-first, concise sentences, no lists |

---

## Content Principles

1. **No placeholder text** — every string is real, representative, and on-brand
2. **Voice-first copy** — all UI strings should feel comfortable spoken aloud, not just readable on screen
3. **Warm but not chatty** — concierge tone: helpful, warm, precise. Not effusive or over-explanatory.
4. **No AI self-reference** — Aria does not describe herself as AI, a chatbot, a language model, or a virtual assistant in the UI. She is a travel concierge.
5. **Confidence over hedging** — avoid "try to," "might," "I'll do my best." Write for a system that works.
