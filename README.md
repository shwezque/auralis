# Auralis

Browser-based voice AI platform for brands. Deploy intelligent voice agents with no installation — users speak naturally, hear real-time responses, and see a live transcript.

## Overview

Auralis replaces broken support experiences — hold music, scripted chat, failed FAQ searches — with voice-first AI agents that carry full brand context and personality.

The platform ships at two levels:

- **Demo agents** — Pre-built branded agents (Rajah Travel, Jollibee, Globe Telecom) showcasing polished voice deployments
- **Self-serve creation** — Paste a website URL, and Auralis crawls the site, extracts brand knowledge, builds the system prompt, and generates a shareable agent link in minutes

## Features

- Full-duplex audio via Gemini Live (low-latency, audio-to-audio)
- Real-time session transcript visible to the user
- Named agent personas with brand-specific guardrails and conversation starters
- Session history with AI-generated summaries
- Shareable agent links (`/agent/:id`) backed by Redis KV
- Pre-call lobby screen with knowledge base preview

## Tech Stack

- React 18 + React Router + Vite
- Tailwind CSS (dark glass design system)
- Google Gemini Live API (real-time audio)
- Cheerio (web crawling for agent creation)
- Vercel (deployment + Edge Functions)

## Routes

| Route | Screen |
|---|---|
| `/` | Home — demo agents + user-created agents |
| `/create` | Create agent from URL |
| `/agent/:id` | Shareable agent entry point |
| `/lobby` | Pre-call intro with conversation starters |
| `/session` | Live voice session with real-time transcript |
| `/summary` | Session end + transcript readback |
| `/history` | Past session list |
| `/history/:id` | Transcript detail view |

## Setup

```bash
npm install
cp .env.example .env.local
# Add your Gemini API key to .env.local
npm run dev
```
