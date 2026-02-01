// Vercel Serverless Function - Proxies Openverse API requests
// API keys are stored server-side and never exposed to the browser

import type { VercelRequest, VercelResponse } from '@vercel/node';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.OPENVERSE_CLIENT_ID;
  const clientSecret = process.env.OPENVERSE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Openverse credentials not configured');
  }

  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // Get new token
  const response = await fetch('https://api.openverse.org/v1/auth_tokens/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Openverse token: ${response.status}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return accessToken!;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, page = 1, pageSize = 20 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const token = await getAccessToken();

    const params = new URLSearchParams({
      q: query.trim(),
      page: page.toString(),
      page_size: Math.min(pageSize, 500).toString(),
      mature: 'false',
    });

    const response = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Openverse API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Openverse proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
