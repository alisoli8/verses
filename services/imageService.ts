// Image Service for handling multiple image sources
// Integrates with Gemini AI, Unsplash, Google Custom Search, and Cloudinary

export interface ImageResult {
  id: string;
  url: string;
  thumbnail: string;
  title?: string;
  source: 'gemini' | 'unsplash' | 'google' | 'upload';
  attribution?: string;
  width?: number;
  height?: number;
}

export interface ImageSearchOptions {
  query: string;
  count?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

// Unsplash API Integration
export const searchUnsplashImages = async (options: ImageSearchOptions): Promise<ImageResult[]> => {
  const { query, count = 12, orientation = 'landscape' } = options;
  
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`,
      {
        headers: {
          'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) throw new Error('Unsplash API error');
    
    const data = await response.json();
    
    return data.results.map((photo: any): ImageResult => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      title: photo.alt_description || photo.description,
      source: 'unsplash',
      attribution: `Photo by ${photo.user.name} on Unsplash`,
      width: photo.width,
      height: photo.height
    }));
  } catch (error) {
    console.error('Unsplash search error:', error);
    return [];
  }
};

// Google Custom Search Integration
export const searchGoogleImages = async (options: ImageSearchOptions): Promise<ImageResult[]> => {
  const { query, count = 10 } = options;
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=${count}`
    );

    if (!response.ok) throw new Error('Google Custom Search API error');
    
    const data = await response.json();
    
    return (data.items || []).map((item: any, index: number): ImageResult => ({
      id: `google-${index}`,
      url: item.link,
      thumbnail: item.image.thumbnailLink,
      title: item.title,
      source: 'google',
      attribution: `Source: ${item.displayLink}`,
      width: item.image.width,
      height: item.image.height
    }));
  } catch (error) {
    console.error('Google search error:', error);
    return [];
  }
};

// Cloudinary Upload Integration
export const uploadToCloudinary = async (file: File): Promise<ImageResult | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET!);
    formData.append('cloud_name', process.env.CLOUDINARY_CLOUD_NAME!);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) throw new Error('Cloudinary upload error');
    
    const data = await response.json();
    
    return {
      id: data.public_id,
      url: data.secure_url,
      thumbnail: data.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill/'),
      title: file.name,
      source: 'upload',
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

// Combined search function
export const searchImages = async (options: ImageSearchOptions): Promise<{
  unsplash: ImageResult[];
  google: ImageResult[];
}> => {
  const [unsplashResults, googleResults] = await Promise.allSettled([
    searchUnsplashImages(options),
    searchGoogleImages(options)
  ]);

  return {
    unsplash: unsplashResults.status === 'fulfilled' ? unsplashResults.value : [],
    google: googleResults.status === 'fulfilled' ? googleResults.value : []
  };
};
