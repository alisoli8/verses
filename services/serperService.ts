// Serper API Service - Google Image Search
// https://serper.dev/ - Fast and affordable Google Search API

// ============================================
// TOGGLE: Set to false to disable Serper
// ============================================
const SERPER_ENABLED = false;

// Get API key from window.process.env (set by env.js)
const getApiKey = () => (window as any).process?.env?.VITE_SERPER_API_KEY || '';

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

// API_KEY is now retrieved via getApiKey() function above

class SerperService {
  private readonly endpoint = 'https://google.serper.dev/images';

  /**
   * Search for images using Serper (Google Images)
   * @param query - Search term (e.g., "mountain", "BMW", "LeBron James")
   * @param num - Number of images to return (default 20)
   * @returns Promise with image search results
   */
  async searchImages(query: string, num: number = 20): Promise<SerperImageResult[]> {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Serper API key is required');
    }

    if (!query.trim()) {
      return [];
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query.trim(),
          num: num,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Serper API key. Please check your API key.');
        } else if (response.status === 429) {
          throw new Error('Serper API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
        }
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
   * Check if the service is properly configured AND enabled
   */
  isConfigured(): boolean {
    return SERPER_ENABLED && !!getApiKey();
  }

  /**
   * Get API key status info
   */
  getStatus() {
    const apiKey = getApiKey();
    return {
      hasKey: !!apiKey,
      keyConfigured: apiKey.length > 0
    };
  }
}

// Export singleton instance
export const serperService = new SerperService();
