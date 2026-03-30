# Auralis — Product Brief

## Primary Users

**The business (deploying brand)**
A customer-facing company — travel agency, hospitality brand, retail service, financial product — that currently handles support via live agents, a chat widget, or both. They want faster resolution, lower support cost, and a branded experience that doesn't embarrass them. They are the buyer and the configuration owner. They define the persona, the knowledge base, and the behavioral guardrails. They do not need to be technical.

**The end customer (voice caller)**
A consumer visiting a brand's site or app who has a question, a request, or wants help making a decision. They are not thinking about AI — they want their question answered. They will tolerate a lot from a human voice that feels competent and warm; they will abandon immediately if they sense they're being stalled or scripted.

---

## Problem

Customer support in 2026 is still painful in ways that feel unacceptable given available technology.

Live agents are expensive, inconsistent, and capped at business hours. Chat widgets are low-resolution — most are FAQ glorified with a text box, and customers know it. Voice IVR systems are despised universally. Knowledge bases require the customer to do the work of searching and interpreting.

The deeper problem is not operational — it is experiential. Every support touchpoint signals to the customer how much the brand values their time. A bad support experience is a brand damage event, not just a cost line.

AI chat has improved but has not solved this. Text still feels like support. It is slow, interrupt-heavy, and cognitively demanding compared to speech. Most AI chat products also carry no brand identity — they feel like a white-label product bolted onto the site, which is exactly what they are.

There is no credible, deployable, brand-owned voice AI support product in the market that a mid-market business can stand up without a six-month enterprise integration project.

---

## Promise

Auralis gives any brand a voice — a real one.

A conversational AI agent that sounds like a person, thinks like a specialist, operates inside strict brand guardrails, and is live on the brand's site within days. Customers ask questions by voice and get answers by voice. No hold time. No transfer. No scripted dead ends. Just a warm, intelligent conversation that resolves the issue and reflects well on the brand.

For the business: lower support cost, higher customer satisfaction, 24/7 coverage, full brand control.
For the customer: the fastest, most natural support experience available — talking to someone who actually knows the product and never gets frustrated.

---

## Positioning

**One sentence:**
Auralis is the voice AI platform that lets any brand deploy a human-quality support agent — branded, intelligent, and live — in days, not months.

**Category frame:**
This is not a chatbot. It is not a phone system. It is a new category: a deployable voice presence. The closest analog is hiring a very good support agent who never sleeps, never goes off-script, and scales to every customer simultaneously.

---

## Pilot Scope — Lumia Journeys (Travel Agency Demo)

The pilot is a working prototype built on top of a fictional premium travel agency called Lumia Journeys. Its purpose is to demonstrate the platform's potential to prospective B2B clients — showing what a real deployment looks like, feels like, and is capable of.

**What the pilot includes:**
- A branded web interface with Lumia Journeys visual identity (name, color, persona)
- A named voice agent persona ("Aria") with a warm, professional, travel-knowledgeable conversational style
- Real-time voice conversation using Gemini Live (audio in, audio out, low latency)
- Live transcript displayed on screen as the conversation happens
- A system prompt defining Aria's persona, tone, knowledge domain, and topic guardrails
- Topic scope: destination exploration, trip planning advice, booking initiation, general travel questions
- Graceful redirection for off-topic queries
- A clean, premium mobile web UI optimized for demo presentation

**What the pilot excludes:**
- Real booking system integration
- Authentication or user accounts
- Conversation history or session persistence across sessions
- Multi-language support
- Analytics or reporting dashboard
- Operator configuration UI for other brands
- Multiple brand deployments

---

## MVP Boundaries

### In scope
- Gemini Live API integration (audio-to-audio, real-time)
- Single branded persona (Aria / Lumia Journeys)
- Voice input via browser microphone
- Audio output from the agent (HD voice)
- Live transcript synchronized with voice
- System prompt with persona definition and topic guardrails
- Premium mobile-first UI: conversation screen, start/stop control, brand identity
- Deployed to Vercel as a public URL for demo sharing

### Out of scope
- Multi-brand / multi-tenant architecture
- Operator dashboard or configuration interface
- User authentication, sessions, or persistent memory
- Booking or CRM integrations
- Conversation history beyond the active session
- Admin analytics
- Accessibility compliance (WCAG)
- Offline support

---

## Key Assumptions

1. Gemini Live API latency and voice quality are convincing enough to demo without post-processing.
2. Browser mic access is reliable in controlled demo environments (not noisy trade show floors).
3. A single strong persona is enough to sell the platform concept to prospective B2B clients.
4. System prompt guardrails are sufficient for topic control at prototype stage — no RAG or fine-tuning needed.
5. The B2B buyer evaluates on experience quality, not backend architecture, at this stage.
6. Mobile web is the right delivery format — shareable by URL, no install friction.

---

## Open Questions

1. **Latency on mobile networks** — Does Gemini Live perform well enough over 4G/5G for the "feels like a person" promise to hold?
2. **iOS Safari mic permissions** — How do we handle the browser permission prompt cleanly on first demo use?
3. **Guardrail robustness** — How does Aria behave when a skeptical demo audience deliberately tries to break the persona?
4. **API cost at scale** — At what conversation volume does Gemini Live become expensive, and how does that inform B2B pricing?
5. **Competitive timing** — Are credible competitors launching in this space now?
6. **Post-pilot product path** — Does Auralis become a configuration platform (operator dashboard as the product), or does it stay at the integration and design layer?
