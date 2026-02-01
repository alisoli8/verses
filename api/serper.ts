// Vercel Serverless Function - Proxies Serper API requests
// API keys are stored server-side and never exposed to the browser

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Serper API key not configured' });
  }

  try {
    const { query, num = 20 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: Math.min(num, 100),
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Serper proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
