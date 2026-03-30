# Copy Deck — Auralis / Lumia Journeys Pilot

**Version:** 0.1
**Date:** 2026-03-29
**Tone:** Warm, confident, premium. Concierge-level — knowledgeable friend, not a chatbot.

---

## Brand Voice Rules

- **Speak like a well-traveled friend** — specific, warm, never generic
- **No robotic UI language** — never "Please enter," "Submit," "Processing your request"
- **No AI self-reference** — Aria is a travel concierge. Full stop.
- **Contractions always** — "we'll" not "we will," "you're" not "you are"
- **Short over long** — if it can be said in four words, don't use eight
- **Confident over hedging** — no "might," "try to," "hopefully"

---

## Screen 1 — Onboarding

### Brand zone
```
Lumia Journeys
```
*(wordmark only — no tagline on this screen)*

### Experience invitation
```
Meet Aria, your personal travel concierge.

Ask her anything — where to go, when to go,
what not to miss. Just speak naturally.
```

### API key field
- **Label:** `Gemini API Key`
- **Placeholder:** `AIza...`

### Submit CTA
```
Start Conversation
```

### Helper text (two lines, muted)
```
Get a free key at aistudio.google.com/apikey
Your key is stored on this device only — never shared.
```

### Error states

**Empty field submit:**
```
Please enter your API key to continue.
```

**Loading state (button label):**
```
Connecting…
```

---

## Screen 2 — Lobby

### Brand header
- Wordmark: `Lumia Journeys`
- Change key link: `Change key`

### Agent identity block
- **Name:** `Aria`
- **Role line:** `Travel Concierge · Lumia Journeys`
- **Availability:** `Available now`

### Conversation starters
*(muted italic, 3 examples — visual context only, not tappable)*
```
"Where should I go for two weeks in Southeast Asia?"
"Help me plan a Maldives honeymoon under $10,000."
"What's the best time of year to visit Japan?"
```

### Talk CTA
```
Talk to Aria
```

### Mic permission note
*(small, below CTA)*
```
Tap to start — we'll ask for microphone access.
```

---

## Screen 3 — Session

### Session header
- Brand mark: `Lumia Journeys`
- End button: `End`

### State labels (below avatar)

| State | Label |
|---|---|
| Connecting | `Connecting…` |
| Listening | `Listening` |
| User speaking | `Hearing you…` |
| Aria speaking | `Aria is speaking` |
| Muted (overlay) | `Muted` |

### Transcript speaker labels
- Aria turns: `Aria`
- User turns: `You`

### Transcript empty state
*(centered placeholder, before first turn)*
```
Your conversation will appear here.
```

### End confirmation
*(inline prompt, minimal)*

**Heading:**
```
End this conversation?
```

**Confirm:**
```
Yes, end
```

**Cancel:**
```
Keep talking
```

### Error messages

**Invalid or expired API key:**
```
Couldn't connect — your API key may be invalid.
```
*Action: `Try Again` · `End`*

**Connection lost mid-session:**
```
Connection lost. Check your internet and try again.
```
*Action: `Try Again` · `End`*

**Generic / unknown error:**
```
Something went wrong. Tap to try again.
```
*Action: `Try Again` · `End`*

**Mic permission denied:**
```
Microphone access is required to talk to Aria.
Please allow mic access in your browser settings.
```
*Action: `End`*

---

## Screen 4 — Summary

### Header
- Brand mark: `Lumia Journeys`
- Screen subtitle: `Conversation ended`

### Transcript section label
```
Your conversation with Aria
```

### Empty transcript state
*(if session ended before any turns)*
```
Nothing was captured in this conversation.
```

### Restart CTA (primary)
```
Start New Conversation
```

### Change key link (secondary — error-ended only)
```
Change API key
```

---

## Aria System Prompt Voice Guidelines
*(For reference when reviewing or updating `src/lib/systemPrompt.js`)*

Aria's spoken responses should always:

- Open with warmth, not a preamble ("Oh, that's a great choice — the Amalfi Coast in May is…" not "Sure, I can help you with that. The Amalfi Coast…")
- Use sensory detail when describing destinations ("the smell of cardamom in a Marrakech souk at dusk" not "Morocco is a culturally rich country")
- Match the user's energy — excited traveler gets excited Aria; methodical planner gets precise Aria
- Keep turns short — this is voice, not email. Two to four sentences per turn maximum.
- Never start a response with "I" — it sounds robotic
- Never use lists — flow through information in natural spoken sentences
- Redirect off-topic questions warmly: *"That's a bit outside my world — but if you've been dreaming of a destination, I'm exactly the right person to talk to."*
- Never invent specific prices or availability — *"I'd want to check today's rates before giving you a number"*
