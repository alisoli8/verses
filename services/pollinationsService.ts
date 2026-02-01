// Pollinations AI Image Generation Service
// Now proxied through /api/pollinations to keep API keys secure

/**
 * Generate an image using Pollinations AI via API proxy
 * Works great with simple queries like "mountain", "BMW", "Sushi", celebrity names, etc.
 * 
 * @param subject - The subject to generate (e.g., "mountain", "LeBron James", "sushi")
 * @returns Promise<string> - URL of the generated image (base64 data URL)
 */
export const generateImageWithPollinations = async (subject: string): Promise<string> => {
  try {
    const cleanSubject = subject.trim();
    
    // Call our API proxy instead of Pollinations directly
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
