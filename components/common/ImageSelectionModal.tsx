import React, { useState, useEffect } from 'react';
import { RiCloseLine, RiSearchLine, RiUploadLine, RiSparklingLine, RiGlobalLine, RiCreativeCommonsLine } from 'react-icons/ri';
import { ImageResult, ImageSearchOptions, searchImages, uploadToCloudinary } from '../../services/imageService';
import { generateImage } from '../../services/geminiService';
import { bingImageService, BingImageResult } from '../../services/bingImageService';
import { openverseService, OpenverseImageResult } from '../../services/openverseService';
import { LuImage } from 'react-icons/lu';

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  searchQuery?: string;
  title?: string;
}

type TabType = 'ai' | 'stock' | 'bing' | 'openverse';

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  searchQuery = '',
  title = 'Select Image'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ai');
  const [query, setQuery] = useState(searchQuery);
  const [loading, setLoading] = useState(false);
  const [stockImages, setStockImages] = useState<ImageResult[]>([]);
  const [bingImages, setBingImages] = useState<BingImageResult[]>([]);
  const [openverseImages, setOpenverseImages] = useState<OpenverseImageResult[]>([]);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen && searchQuery) {
      setQuery(searchQuery);
      if (activeTab === 'stock') {
        handleStockSearch();
      } else if (activeTab === 'bing') {
        handleBingSearch();
      } else if (activeTab === 'openverse') {
        handleOpenverseSearch();
      }
    }
  }, [isOpen, searchQuery, activeTab]);

  const handleStockSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchImages({ 
        query: query.trim(),
        count: 20,
        orientation: 'landscape'
      });
      
      // Use Unsplash results
      const combinedResults = [
        ...results.unsplash,
        ...results.google.slice(0, 8) // Limit Google results
      ];
      
      setStockImages(combinedResults);
    } catch (error) {
      console.error('Image search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBingSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await bingImageService.searchImages(query.trim(), 20);
      setBingImages(results);
    } catch (error) {
      console.error('Bing image search failed:', error);
      alert('Image search failed. Please check your API key configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenverseSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await openverseService.searchImages(query.trim(), 1, 20);
      setOpenverseImages(results);
    } catch (error) {
      console.error('Openverse image search failed:', error);
      alert('Image search failed. Please check your API credentials configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiGeneration = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const imageUrl = await generateImage(query.trim(), 'versus battle');
      setAiImage(imageUrl);
    } catch (error) {
      console.error('AI image generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setLoading(true);
    try {
      const result = await uploadToCloudinary(file);
      if (result) {
        onSelectImage(result.url);
        onClose();
      }
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    onSelectImage(imageUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RiCloseLine className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for images..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (activeTab === 'stock') handleStockSearch();
                    else if (activeTab === 'bing') handleBingSearch();
                    else if (activeTab === 'openverse') handleOpenverseSearch();
                    else if (activeTab === 'ai') handleAiGeneration();
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                if (activeTab === 'stock') handleStockSearch();
                else if (activeTab === 'bing') handleBingSearch();
                else if (activeTab === 'openverse') handleOpenverseSearch();
                else if (activeTab === 'ai') handleAiGeneration();
              }}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex min-w-max">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <RiSparklingLine className="w-5 h-5" />
              AI Generated
            </button>
            <button
              onClick={() => setActiveTab('bing')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'bing'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <RiGlobalLine className="w-5 h-5" />
              Web Images
            </button>
            <button
              onClick={() => setActiveTab('openverse')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'openverse'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <RiCreativeCommonsLine className="w-5 h-5" />
              Openverse
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'stock'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <LuImage className="w-5 h-5" />
              Stock Photos
            </button>
            {/* <button
              onClick={() => setActiveTab('upload')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <RiUploadLine className="w-5 h-5" />
              Upload
            </button> */}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* AI Generated Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Generating AI image...</span>
                </div>
              ) : aiImage ? (
                <div className="flex justify-center">
                  <div 
                    className="relative cursor-pointer group rounded-lg overflow-hidden"
                    onClick={() => handleImageSelect(aiImage)}
                  >
                    <img
                      src={aiImage}
                      alt="AI Generated"
                      className="w-64 h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-medium">Select Image</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <RiSparklingLine className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a search term and click "Search" to generate an AI image</p>
                </div>
              )}
            </div>
          )}

          {/* Bing Web Images Tab */}
          {activeTab === 'bing' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Searching web images...</span>
                </div>
              ) : bingImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bingImages.map((image, index) => (
                    <div
                      key={`${image.contentUrl}-${index}`}
                      className="relative cursor-pointer group rounded-lg overflow-hidden"
                      onClick={() => handleImageSelect(image.contentUrl)}
                    >
                      <img
                        src={image.thumbnailUrl}
                        alt={image.name}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          // Fallback to content URL if thumbnail fails
                          const target = e.target as HTMLImageElement;
                          if (target.src !== image.contentUrl) {
                            target.src = image.contentUrl;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-sm">Select</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                        {image.width}×{image.height} • {image.encodingFormat?.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <RiGlobalLine className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Search for web images using the search bar above</p>
                  {!bingImageService.isConfigured() && (
                    <p className="text-red-500 text-sm mt-2">
                      ⚠️ Bing API key not configured. Please add VITE_BING_SEARCH_API_KEY to your environment.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stock Photos Tab */}
          {activeTab === 'stock' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Searching images...</span>
                </div>
              ) : stockImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stockImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative cursor-pointer group rounded-lg overflow-hidden"
                      onClick={() => handleImageSelect(image.url)}
                    >
                      <img
                        src={image.thumbnail}
                        alt={image.title || 'Stock photo'}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-sm">Select</span>
                      </div>
                      {image.attribution && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                          {image.attribution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <LuImage className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Search for stock photos using the search bar above</p>
                </div>
              )}
            </div>
          )}

          {/* Openverse Tab */}
          {activeTab === 'openverse' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Searching Creative Commons images...</span>
                </div>
              ) : openverseImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {openverseImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative cursor-pointer group rounded-lg overflow-hidden"
                      onClick={() => handleImageSelect(image.url)}
                    >
                      <img
                        src={image.thumbnail || image.url}
                        alt={image.title || 'Openverse image'}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          // Fallback to main URL if thumbnail fails
                          const target = e.target as HTMLImageElement;
                          if (target.src !== image.url) {
                            target.src = image.url;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-sm">Select</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                        {openverseService.getShortAttribution(image)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <RiCreativeCommonsLine className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Search for Creative Commons images using the search bar above</p>
                  <p className="text-sm mt-2 text-gray-400">All images are free to use with proper attribution</p>
                  {!openverseService.isConfigured() && (
                    <p className="text-red-500 text-sm mt-2">
                      ⚠️ Openverse API credentials not configured. Please add VITE_OPENVERSE_CLIENT_ID and VITE_OPENVERSE_CLIENT_SECRET to your environment.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Uploading...</span>
                </div>
              ) : (
                <>
                  <RiUploadLine className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Drag and drop an image here, or click to select
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSelectionModal;
