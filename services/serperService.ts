// Serper API Service - Google Image Search
// https://serper.dev/ - Fast and affordable Google Search API
// In local dev, calls API directly. In production, uses /api/serper proxy.

// Check if running in local development
const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Get env vars for local dev
const getEnvVar = (key: string): string => {
  const viteEnv = (import.meta as any).env;
  return viteEnv?.[key] || '';
};

// ============================================
// TOGGLE: Set to false to disable Serper
// ============================================
const SERPER_ENABLED = true;

export interface SerperImageResult {
  title: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  source: string;
  domain: string;
  link: string;
  position: number;
}

interface SerperImageResponse {
  images: SerperImageResult[];
  searchParameters: {
    q: string;
    type: string;
    engine: string;
  };
}

class SerperService {
  /**
   * Search for images using Serper (Google Images)
   * In local dev, calls API directly. In production, uses proxy.
   * @param query - Search term (e.g., "mountain", "BMW", "LeBron James")
   * @param num - Number of images to return (default 20)
   * @returns Promise with image search results
   */
  async searchImages(query: string, num: number = 20): Promise<SerperImageResult[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      // In local dev, call Serper API directly
      if (isLocalDev) {
        const apiKey = getEnvVar('VITE_SERPER_API_KEY');
        if (!apiKey) {
          throw new Error('Serper API key not configured in .env.local');
        }

        const response = await fetch('https://google.serper.dev/images', {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: query.trim(),
            num: Math.min(num, 100),
          }),
        });

        if (!response.ok) {
          throw new Error(`Serper API error: ${response.status}`);
        }

        const data: SerperImageResponse = await response.json();
        return data.images || [];
      }

      // In production, call our API proxy
      const response = await fetch('/api/serper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          num: num,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data: SerperImageResponse = await response.json();
      return data.images || [];

    } catch (error) {
      console.error('Serper image search error:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to search images');
      }
    }
  }

  /**
   * Check if the service is enabled
   */
  isConfigured(): boolean {
    return SERPER_ENABLED;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      enabled: SERPER_ENABLED
    };
  }
}

// Export singleton instance
export const serperService = new SerperService();
