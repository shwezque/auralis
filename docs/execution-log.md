# Execution Log — Auralis / Lumia Journeys Pilot

---

## 2026-03-29 — Pipeline run: start-product → build-app

### What was done
Ran the full prototype-app pipeline from scratch:

1. **`/start-product`** — Created `docs/vision.md` and `docs/product-brief.md`. Framed Auralis as a voice-first AI customer support platform. Defined Lumia Journeys / Aria as the pilot.

2. **`/run-research`** — Researched 8 reference products (Bland AI, Vapi, Retell, ElevenLabs, ChatGPT Voice, Intercom, Typeform, Calm). Key findings: no competitor ships a live consumer-facing transcript; full-viewport (not widget) is the right delivery model; named pre-call lobby screen is the trust moment.

3. **`/create-prd`** — Wrote `docs/prd.md`. 6 MVP features, 10 non-goals, 4 build milestones.

4. **`/create-ux`** — Wrote `docs/ux-spec.md` and `docs/screen-map.md`. 4-screen linear flow (Onboarding → Lobby → Session → Summary), 5 session states, end confirmation dialog, mute toggle.

5. **`/create-content`** — Wrote `docs/content-map.md` and `docs/copy-deck.md`. All UI strings, error messages, Aria system prompt voice guidelines.

6. **`/build-app`** — Rebuilt the prototype to match specs:
   - Added React Router with 4 routes (`/`, `/lobby`, `/session`, `/summary`)
   - Added `AppContext` for shared state (apiKey, sessionTranscript, sessionEndedWithError)
   - Built `Onboarding.jsx` (S1), `Lobby.jsx` (S2), `Session.jsx` (S3), `Summary.jsx` (S4)
   - Updated `useGeminiLive` with mute toggle, error classification, and proper status types
   - Updated `systemPrompt.js` with copy-deck voice guidelines
   - Added ripple animation to Tailwind config for agent-speaking state
   - All copy matches `copy-deck.md`

### Agents and skills used
- `strategist` (via start-product, create-prd)
- `researcher` (via run-research)
- `ux-designer` (via create-ux)
- `growth-copywriter` (via create-content)
- `frontend-builder` (via build-app)

### What works
- Full 4-screen flow with React Router
- API key onboarding with localStorage persistence
- Lobby screen with Aria identity
- Session screen with: Gemini Live connection, audio in/out, real-time transcript, 5 state indicators, animated avatar, mute toggle, end confirmation
- Summary screen with full transcript readback and restart action
- Clean production build (487kb JS, no errors)

### What remains
- Deploy to Vercel (run `vercel --prod` from project root)
- Validate Gemini Live connection with a real API key
- QA on actual mobile device (iOS Safari mic permission flow)
- `/qa-app` review before sharing externally

### Known gaps
- Summary screen uses approximate timestamps (not real call duration)
- No handling for when both `pt-safe` and `pb-safe` are not supported (non-iOS)
- Old component files (ApiKeyGate.jsx, AgentInterface.jsx, Header.jsx, VoiceButton.jsx, StatusIndicator.jsx, TranscriptPanel.jsx) are unused — can be deleted after QA confirms they're not referenced

---

## Checkpoint — 2026-03-29

- **Current stage:** Build complete — pre-QA, pre-deploy
- **Current objective:** Validate the prototype works end-to-end with a real Gemini API key, then deploy to Vercel and run `/qa-app`
- **Completed this session:** Full prototype-app pipeline run from scratch — all 6 stages (start-product → run-research → create-prd → create-ux → create-content → build-app). Working React app with 4 screens, Gemini Live integration, real-time transcript, mute, end confirmation, React Router, AppContext.
- **Key outputs produced:** `docs/vision.md`, `docs/product-brief.md`, `docs/research-benchmark.md`, `docs/inspiration-notes.md`, `docs/prd.md`, `docs/ux-spec.md`, `docs/screen-map.md`, `docs/content-map.md`, `docs/copy-deck.md`. Code: `src/pages/Onboarding.jsx`, `src/pages/Lobby.jsx`, `src/pages/Session.jsx`, `src/pages/Summary.jsx`, `src/context/AppContext.jsx`, updated `useGeminiLive.js`, `systemPrompt.js`, `tailwind.config.js`.
- **Active scope:** Single-brand demo (Lumia Journeys / Aria), Gemini Live voice only, mobile web, client-side API key, 4 screens, no backend
- **Out of scope:** Multi-brand/tenant, operator dashboard, authentication, cross-session memory, booking/CRM integration, analytics, widget/embed mode, WCAG, native mobile app
- **Files to review on resume:** `src/pages/Session.jsx` (most complex), `src/hooks/useGeminiLive.js`, `src/lib/systemPrompt.js`, `docs/prd.md` (acceptance criteria for QA)
- **Commands / agents / skills used:** `/start-product` (strategist), `/run-research` (researcher), `/create-prd` (strategist), `/create-ux` (ux-designer), `/create-content` (growth-copywriter), `/build-app` (frontend-builder)
- **Key decisions:** Full-viewport (not widget); live consumer transcript as primary surface; named pre-call lobby before mic permission fires; Gemini 3.1 Flash Live + Aoede voice; API key stored client-side in localStorage; AppContext for cross-screen transcript state
- **Active assumptions:** Gemini Live latency is acceptable on demo devices; browser mic capture works in controlled demo environment; system prompt guardrails sufficient without RAG
- **Open questions:** Does Gemini Live `gemini-3.1-flash-live-preview` require allowlisting or is it generally available? iOS Safari mic permission UX — does it fire cleanly from the Lobby CTA tap? Is `inputAudioTranscription`/`outputAudioTranscription` available on the preview model?
- **Risks/blockers:** Model ID `gemini-3.1-flash-live-preview` may not be available on all API keys — fallback to `gemini-2.5-flash-preview-native-audio-dialog` or `gemini-live-2.5-flash-preview` if connection fails. Unused component files in `src/components/` could cause confusion — safe to delete.
- **Next recommended action:** Run `npm run dev`, test with a real Gemini API key, confirm voice works end-to-end. Then deploy with `vercel --prod` and run `/qa-app`.
- **First command or prompt to run on resume:** `npm run dev` in `/Users/shaun/AI/auralis`, then open `http://localhost:5173` and enter a Gemini API key to test the full flow.
