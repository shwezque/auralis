# Auralis QA Checklist

**Reviewed:** 2026-03-30
**Build:** Multi-brand voice AI demo (Rajah Travel, Jollibee, Globe Telecom)
**Scope:** Pre-external-share review

---

## Summary

| Area | Status | Notes |
|---|---|---|
| Onboarding / Entry | PASS | BrandPicker works cleanly |
| Happy Path | CONDITIONAL PASS | Core flow works; model ID must be verified before use |
| State & Persistence | FAIL | No persistence — refresh resets all state |
| Navigation (forward) | PASS | All forward paths work correctly |
| Navigation (back/browser) | FAIL | Browser back from Session bypasses end flow |
| Empty States | PASS | Route guards redirect correctly |
| Error States | PARTIAL | Mic error copy names wrong agent; Summary ignores error flag |
| Mobile Responsiveness | UNKNOWN | `pt-safe`/`pb-safe` utilities unverified — may break notch layout on iPhone |
| Copy | PARTIAL | "Aria" hardcoded in mic error message for all brands |
| Visual Polish | PASS | Consistent design system, no placeholder text in core flow |
| Performance | NOT TESTED | Dependent on Gemini Live API latency |

---

## Area-by-Area Detail

### 1. Onboarding / Entry (BrandPicker)

**Status: PASS**

- Auralis branding renders correctly
- All three brand cards present and selectable
- Selecting a brand sets context and routes to /lobby
- No placeholder text visible
- No dead ends

---

### 2. Happy Path (BrandPicker → Lobby → Session → Summary)

**Status: CONDITIONAL PASS**

The full forward flow is structurally sound. Each screen renders correctly, transitions are guarded, and the end-to-end user journey completes without dead ends.

**Condition:** The Gemini Live model ID (`gemini-3.1-flash-live-preview`) has not been confirmed correct. The execution log flags this as a known risk. If the model ID is wrong, the Session screen will fail to connect for every user. This is the single highest-risk item before demo day.

---

### 3. State & Persistence

**Status: FAIL**

Neither `selectedBrand` nor `sessionTranscript` is persisted to localStorage. A page refresh on any screen drops the user back to BrandPicker with no recovery path. The API key is hardcoded — no user input, no localStorage, no recovery path if the key is rate-limited or revoked mid-demo.

Acceptable for a presenter-controlled demo. Not acceptable if the link is shared for independent exploration.

---

### 4. Navigation (Forward)

**Status: PASS**

| Route | Trigger | Result |
|---|---|---|
| / → /lobby | Brand selected | Correct |
| /lobby → / | Back button | Correct, clears brand |
| /lobby → /session | CTA tap | Correct |
| /session → /summary | End + confirm | Correct |
| /summary → /lobby | Talk Again | Correct |
| /summary → / | Choose different brand | Correct |
| /session (no brand in state) | Direct URL | Redirects to / ✓ |
| /summary (empty transcript) | Direct URL | Redirects to /lobby ✓ |

---

### 5. Navigation (Browser Back / System Back)

**Status: FAIL**

Pressing browser back from Session navigates directly to Lobby without triggering the end confirmation modal, saving the transcript to context, or cleanly terminating the Gemini session. The WebSocket cleanup runs via useEffect unmount but the transcript is lost. No `useBlocker` or `beforeunload` guard is in place.

---

### 6. Empty States

**Status: PASS**

Route guards behave correctly. Direct URL navigation to guarded routes redirects appropriately. Session transcript zone shows "Your conversation will appear here." Summary shows "Nothing was captured in this conversation." on empty transcript. No blank or broken screens.

---

### 7. Error States

**Status: PARTIAL**

Session screen has a proper error state UI with "Try Again" and "End" buttons. Error copy is surfaced to the user.

Two issues:
- The mic permission error message reads "Microphone access is required to talk to Aria" regardless of which brand is selected. Joy (Jollibee) and Gem (Globe) users see the wrong agent name.
- The Summary screen does not act on the `sessionEndedWithError` flag. No recovery guidance is shown after an error-terminated session.

---

### 8. Mobile Responsiveness

**Status: UNKNOWN**

All four screens use `pt-safe` and `pb-safe` Tailwind utility classes for safe-area insets (iPhone notch / home indicator). These are non-standard Tailwind utilities. If they are not defined in `tailwind.config.js`, they will be silently ignored and content will render behind the notch or home indicator on iPhone Safari.

Must be verified before sharing externally. If the demo will be shown on an iPhone, this is a blocking issue.

---

### 9. Copy

**Status: PARTIAL**

- No placeholder text visible in the normal user flow
- No emoji in UI copy
- One copy bug: mic error message hardcoded to "Aria" for all brands (see BUG-001)
- Summary timestamps are computed from message index, not real session duration — visually misleading but not broken

---

### 10. Visual Polish

**Status: PASS**

- Typography hierarchy is consistent across all screens
- Color tokens applied consistently per brand
- Avatar animation states (ripple, pulse ring) are intentional and purposeful
- No developer-facing text exposed in the UI
- Orphaned component files in `src/components/` are not rendered — no user-facing impact

---

### 11. Performance

**Status: NOT TESTED**

Performance is primarily dependent on Gemini Live API latency, which cannot be assessed statically. No client-side performance concerns identified in the architecture.

---

## Pre-Share Blockers

The following must be resolved or explicitly accepted before external sharing:

1. Verify Gemini Live model ID is correct (BUG-002)
2. Fix mic error message agent name (BUG-001)
3. Verify `pt-safe`/`pb-safe` are configured in Tailwind (BUG-009)
