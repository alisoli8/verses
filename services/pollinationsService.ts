// Pollinations AI Image Generation Service
// API docs: https://enter.pollinations.ai/api/docs
// Endpoint: https://gen.pollinations.ai/image/{prompt}?model=flux
// Requires: Bearer token authentication

// Get API key from window.process.env (set by env.js)
const getApiKey = () => (window as any).process?.env?.VITE_POLLINATIONS_API_KEY || '';

/**
 * Generate an image using Pollinations AI
 * Works great with simple queries like "mountain", "BMW", "Sushi", celebrity names, etc.
 * 
 * @param subject - The subject to generate (e.g., "mountain", "LeBron James", "sushi")
 * @returns Promise<string> - URL of the generated image (base64 data URL)
 */
export const generateImageWithPollinations = async (subject: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('Pollinations API key not configured');
    throw new Error('Pollinations API key is required');
  }
  
  try {
    // Clean the subject
    const cleanSubject = subject.trim();
    
    // Build URL with parameters
    // Endpoint: https://gen.pollinations.ai/image/{prompt}?model=flux
    const encodedPrompt = encodeURIComponent(cleanSubject);
    const finalUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux`;
    
    console.log('Pollinations URL:', finalUrl);
    
    // Fetch with Bearer token authentication
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status} ${response.statusText}`);
    }
    
    // Convert response to blob and then to data URL
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
  } catch (error) {
    console.error(`Pollinations image generation failed for "${subject}":`, error);
    throw error;
  }
};

/**
 * Generate image URL directly (requires auth, so this just builds the URL)
 * Note: This URL requires Bearer token auth to work
 */
export const getPollinationsImageUrl = (subject: string): string => {
  const cleanSubject = subject.trim();
  const encodedPrompt = encodeURIComponent(cleanSubject);
  return `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux`;
};

/**
 * Check if Pollinations API key is configured
 */
export const isPollinationsConfigured = (): boolean => {
  return !!getApiKey();
};
