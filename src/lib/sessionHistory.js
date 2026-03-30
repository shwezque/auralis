import { GoogleGenAI } from '@google/genai'

const STORAGE_KEY = 'auralis_sessions'
const MAX_SESSIONS = 200

function readSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function writeSessions(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)) } catch {}
}

/**
 * Save a completed session to localStorage.
 * Returns the new session id.
 */
export function saveSession({ brand, transcript, startedAt }) {
  const sessions = readSessions()
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const lastTs = transcript.filter(m => m.text?.trim()).at(-1)?.ts || 0
  const newSession = {
    id,
    brandId: brand.id,
    brandName: brand.brandName,
    agentName: brand.agentName,
    agentInitial: brand.agentInitial,
    avatar: brand.avatar || null,
    colors: brand.colors,
    startedAt: startedAt || new Date().toISOString(),
    durationMs: lastTs,
    transcript,
    summary: null,
  }
  writeSessions([newSession, ...sessions].slice(0, MAX_SESSIONS))
  return id
}

export function getSessions() {
  return readSessions()
}

export function getSession(id) {
  return readSessions().find(s => s.id === id) || null
}

export function deleteSession(id) {
  writeSessions(readSessions().filter(s => s.id !== id))
}

export function updateSessionSummary(id, summary) {
  writeSessions(readSessions().map(s => s.id === id ? { ...s, summary } : s))
}

/**
 * Generate a 2–3 sentence AI summary of a session transcript using Gemini.
 */
export async function generateSummary(transcript, apiKey) {
  const turns = transcript.filter(m => m.text?.trim())
  if (turns.length === 0) return 'No conversation content was captured.'

  const text = turns
    .map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.text}`)
    .join('\n')

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Summarize the following customer service conversation in 2–3 short sentences. State what the customer needed and what was discussed or resolved. Be factual, specific, and concise.\n\n${text}`,
  })
  return response.text?.trim() || 'Summary unavailable.'
}
