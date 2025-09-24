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
  private readonly endpoint = 'https://api.openverse.org/v1/images/';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Get API credentials from environment variables
    this.clientId = (import.meta as any).env?.VITE_OPENVERSE_CLIENT_ID || '';
    this.clientSecret = (import.meta as any).env?.VITE_OPENVERSE_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('Openverse API credentials not found. Image search will not work.');
    }
  }

  /**
   * Get or refresh access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Openverse API credentials are required');
    }

    try {
      const response = await fetch('https://api.openverse.org/v1/auth_tokens/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry to 90% of actual expiry to refresh early
      this.tokenExpiry = Date.now() + (data.expires_in * 900);
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Openverse access token:', error);
      throw new Error('Failed to authenticate with Openverse API');
    }
  }

  /**
   * Search for images using Openverse API
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
      const token = await this.getAccessToken();
      
      const params = new URLSearchParams({
        q: query.trim(),
        page: page.toString(),
        page_size: Math.min(pageSize, 500).toString(), // Openverse max is 500
        license: 'cc0,pdm,by,by-sa,by-nc,by-nd,by-nc-sa,by-nc-nd', // All Creative Commons licenses
        category: 'photograph', // Focus on photos
        extension: 'jpg,jpeg,png,webp', // Common web formats
        mature: 'false', // Filter out mature content
        qa: 'false', // Exclude quality assurance flagged content
      });

      const response = await fetch(`${this.endpoint}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, clear it and retry once
          this.accessToken = null;
          this.tokenExpiry = 0;
          throw new Error('Authentication failed. Please check your Openverse credentials.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Openverse API error: ${response.status} ${response.statusText}`);
        }
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
   * Get image details by ID
   * @param imageId - The Openverse image ID
   */
  async getImageDetails(imageId: string): Promise<OpenverseImageResult | null> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.endpoint}${imageId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get image details:', error);
      return null;
    }
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
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  /**
   * Get usage info for the API credentials
   */
  getUsageInfo(): { hasCredentials: boolean; credentialsConfigured: boolean } {
    return {
      hasCredentials: !!(this.clientId && this.clientSecret),
      credentialsConfigured: this.clientId.length > 0 && this.clientSecret.length > 0
    };
  }
}

// Export singleton instance
export const openverseService = new OpenverseService();

// Export types for use in components
export type { OpenverseImageResult, OpenverseSearchResponse };
