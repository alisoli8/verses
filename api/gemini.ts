// Vercel Serverless Function - Proxies Gemini API requests
// API keys are stored server-side and never exposed to the browser

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const { action, prompt, schema } = req.body;

    if (!action || !prompt) {
      return res.status(400).json({ error: 'Action and prompt are required' });
    }

    // Use Gemini REST API directly
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    // Add response schema if provided (for structured output)
    if (schema) {
      requestBody.generationConfig = {
        responseMimeType: 'application/json',
        responseSchema: schema,
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract the text content from Gemini response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return res.status(200).json({ 
      result: textContent,
      raw: data 
    });
  } catch (error: any) {
    console.error('Gemini proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
