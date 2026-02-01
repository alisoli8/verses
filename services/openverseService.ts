// Openverse API Service
// Provides access to Creative Commons and public domain images

interface OpenverseImageResult {
  id: string;
  title: string;
  indexed_on: string;
  foreign_landing_url: string;
  url: string;
  creator: string;
  creator_url: string;
  license: string;
  license_version: string;
  license_url: string;
  provider: string;
  source: string;
  category: string;
  filesize: number;
  filetype: string;
  tags: Array<{
    name: string;
    accuracy: number;
  }>;
  attribution: string;
  fields_matched: string[];
  mature: boolean;
  height: number;
  width: number;
  thumbnail: string;
  detail_url: string;
  related_url: string;
}

interface OpenverseSearchResponse {
  result_count: number;
  page_count: number;
  page_size: number;
  page: number;
  results: OpenverseImageResult[];
}

class OpenverseService {
  /**
   * Search for images using Openverse API via proxy
   * @param query - Search term (e.g., "kobe", "pizza vs burger")
   * @param page - Page number (1-based)
   * @param pageSize - Number of images per page (max 500)
   * @returns Promise with image search results
   */
  async searchImages(
    query: string, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<OpenverseImageResult[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      // Call our API proxy instead of Openverse directly
      const response = await fetch('/api/openverse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          page,
          pageSize,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data: OpenverseSearchResponse = await response.json();
      return data.results || [];

    } catch (error) {
      console.error('Openverse image search error:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to search images');
      }
    }
  }

  /**
   * Get image details by ID - not available via proxy
   */
  async getImageDetails(imageId: string): Promise<OpenverseImageResult | null> {
    // Not implemented for proxy version
    return null;
  }

  /**
   * Generate proper attribution text for an image
   * @param image - The Openverse image result
   */
  getAttributionText(image: OpenverseImageResult): string {
    const title = image.title || 'Untitled';
    const creator = image.creator || 'Unknown';
    const license = image.license.toUpperCase();
    const source = image.provider;

    return `"${title}" by ${creator} is licensed under ${license}. Source: ${source}`;
  }

  /**
   * Get a shorter attribution for UI display
   * @param image - The Openverse image result
   */
  getShortAttribution(image: OpenverseImageResult): string {
    const creator = image.creator || 'Unknown';
    const license = image.license.toUpperCase();
    return `${creator} • ${license}`;
  }

  /**
   * Check if the service is enabled (always true when using proxy)
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Get usage info
   */
  getUsageInfo(): { hasCredentials: boolean; credentialsConfigured: boolean } {
    return {
      hasCredentials: true,
      credentialsConfigured: true
    };
  }
}

// Export singleton instance
export const openverseService = new OpenverseService();

// Export types for use in components
export type { OpenverseImageResult, OpenverseSearchResponse };
