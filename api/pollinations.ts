// Vercel Serverless Function - Proxies Pollinations API requests
// API keys are stored server-side and never exposed to the browser

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Pollinations API key not configured' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const encodedPrompt = encodeURIComponent(prompt.trim());
    const url = `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`);
    }

    // Get the image as a buffer and convert to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';
    const dataUrl = `data:${contentType};base64,${base64}`;

    return res.status(200).json({ imageUrl: dataUrl });
  } catch (error: any) {
    console.error('Pollinations proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
