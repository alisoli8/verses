// Pollinations AI Image Generation Service
// In local dev, calls API directly. In production, uses /api/pollinations proxy.

// Check if running in local development
const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Get env vars for local dev
const getEnvVar = (key: string): string => {
  const viteEnv = (import.meta as any).env;
  return viteEnv?.[key] || '';
};

/**
 * Generate an image using Pollinations AI
 * In local dev, calls API directly. In production, uses proxy.
 * Works great with simple queries like "mountain", "BMW", "Sushi", celebrity names, etc.
 * 
 * @param subject - The subject to generate (e.g., "mountain", "LeBron James", "sushi")
 * @returns Promise<string> - URL of the generated image (base64 data URL or direct URL)
 */
export const generateImageWithPollinations = async (subject: string): Promise<string> => {
  try {
    const cleanSubject = subject.trim();
    
    // In local dev, call Pollinations API directly
    if (isLocalDev) {
      const apiKey = getEnvVar('VITE_POLLINATIONS_API_KEY');
      const encodedPrompt = encodeURIComponent(cleanSubject);
      const url = `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux`;
      
      const headers: HeadersInit = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Pollinations API error: ${response.status}`);
      }
      
      // Convert to base64 data URL
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    // In production, call our API proxy
    const response = await fetch('/api/pollinations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: cleanSubject,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.imageUrl;
    
  } catch (error) {
    console.error(`Pollinations image generation failed for "${subject}":`, error);
    throw error;
  }
};

/**
 * Generate image URL directly - not available when using proxy
 * Returns empty string since we use the proxy now
 */
export const getPollinationsImageUrl = (subject: string): string => {
  // Can't return a direct URL when using proxy
  return '';
};

/**
 * Check if Pollinations is configured (always true when using proxy)
 */
export const isPollinationsConfigured = (): boolean => {
  return true;
};
