// Serper API Service - Google Image Search
// https://serper.dev/ - Fast and affordable Google Search API
// Now proxied through /api/serper to keep API keys secure

// ============================================
// TOGGLE: Set to false to disable Serper
// ============================================
const SERPER_ENABLED = false;

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
   * Search for images using Serper (Google Images) via API proxy
   * @param query - Search term (e.g., "mountain", "BMW", "LeBron James")
   * @param num - Number of images to return (default 20)
   * @returns Promise with image search results
   */
  async searchImages(query: string, num: number = 20): Promise<SerperImageResult[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      // Call our API proxy instead of Serper directly
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
