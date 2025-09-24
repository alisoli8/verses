// Bing Image Search API Service
// Provides image search functionality as an alternative to Google Images

interface BingImageResult {
  name: string;
  webSearchUrl: string;
  thumbnailUrl: string;
  datePublished: string;
  isFamilyFriendly: boolean;
  contentUrl: string;
  hostPageUrl: string;
  contentSize: string;
  encodingFormat: string;
  hostPageDisplayUrl: string;
  width: number;
  height: number;
  thumbnail: {
    width: number;
    height: number;
  };
}

interface BingImageSearchResponse {
  _type: string;
  instrumentation: {
    _type: string;
  };
  readLink: string;
  webSearchUrl: string;
  totalEstimatedMatches: number;
  nextOffset: number;
  value: BingImageResult[];
}

class BingImageService {
  private readonly endpoint = 'https://api.bing.microsoft.com/v7.0/images/search';
  private readonly subscriptionKey: string;

  constructor() {
    // Get API key from environment variables
    this.subscriptionKey = (import.meta as any).env?.VITE_BING_SEARCH_API_KEY || '';
    
    if (!this.subscriptionKey) {
      console.warn('Bing Image Search API key not found. Image search will not work.');
    }
  }

  /**
   * Search for images using Bing Image Search API
   * @param query - Search term (e.g., "kobe", "pizza vs burger")
   * @param count - Number of images to return (max 150)
   * @param offset - Offset for pagination
   * @returns Promise with image search results
   */
  async searchImages(
    query: string, 
    count: number = 20, 
    offset: number = 0
  ): Promise<BingImageResult[]> {
    if (!this.subscriptionKey) {
      throw new Error('Bing Image Search API key is required');
    }

    if (!query.trim()) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        count: Math.min(count, 150).toString(), // Bing max is 150
        offset: offset.toString(),
        mkt: 'en-US',
        safeSearch: 'Moderate',
        imageType: 'Photo', // Focus on photos rather than clipart
        size: 'Medium', // Good balance of quality and load time
        aspect: 'All',
        color: 'All',
        freshness: 'All'
      });

      const response = await fetch(`${this.endpoint}?${params}`, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Bing API key. Please check your subscription key.');
        } else if (response.status === 403) {
          throw new Error('Bing API quota exceeded or access denied.');
        } else {
          throw new Error(`Bing API error: ${response.status} ${response.statusText}`);
        }
      }

      const data: BingImageSearchResponse = await response.json();
      return data.value || [];

    } catch (error) {
      console.error('Bing Image Search error:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to search images');
      }
    }
  }

  /**
   * Get a proxy URL for an image to avoid CORS issues
   * This is a simple implementation - in production you might want a proper proxy service
   */
  getProxyImageUrl(originalUrl: string): string {
    // For now, return the original URL
    // In production, you might want to proxy through your backend
    // or use a service like images.weserv.nl
    return originalUrl;
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.subscriptionKey;
  }

  /**
   * Get usage info for the API key (if available)
   * Note: Bing doesn't provide usage info in the response headers by default
   */
  getUsageInfo(): { hasKey: boolean; keyConfigured: boolean } {
    return {
      hasKey: !!this.subscriptionKey,
      keyConfigured: this.subscriptionKey.length > 0
    };
  }
}

// Export singleton instance
export const bingImageService = new BingImageService();

// Export types for use in components
export type { BingImageResult, BingImageSearchResponse };
