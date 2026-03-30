import { GoogleGenAI } from '@google/genai'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Gemini API key is not configured.' })
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1alpha' },
    })

    const now = Date.now()
    const token = await ai.tokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
        httpOptions: { apiVersion: 'v1alpha' },
        liveConnectConstraints: {
          config: {
            responseModalities: ['AUDIO'],
            enableAffectiveDialog: true,
          },
        },
      },
    })

    return res.status(200).json({
      token: token.name,
      expireTime: token.expireTime,
      newSessionExpireTime: token.newSessionExpireTime,
    })
  } catch (error) {
    console.error('[live-token] Failed to create ephemeral token:', error)
    return res.status(500).json({ error: 'Failed to create ephemeral token.' })
  }
}
