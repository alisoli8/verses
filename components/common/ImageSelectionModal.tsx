import React, { useState, useEffect } from 'react';
import { RiCloseLine, RiSearchLine, RiUploadLine, RiSparklingLine, RiGlobalLine, RiExternalLinkLine } from 'react-icons/ri';
import { uploadToCloudinary } from '../../services/imageService';
import { generateImage } from '../../services/geminiService';
import { openverseService, OpenverseImageResult } from '../../services/openverseService';
import { serperService, SerperImageResult } from '../../services/serperService';
import { toast } from '../../contexts/ToastContext';

// Combined image result type for web search tab
interface WebImageResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  source: 'serper' | 'openverse';
  attribution?: string;
  width?: number;
  height?: number;
}

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  searchQuery?: string;
  title?: string;
}

type TabType = 'ai' | 'web';

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [webImages, setWebImages] = useState<WebImageResult[]>([]);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  useEffect(() => {
    if (isOpen && searchQuery) {
      setQuery(searchQuery);
      // Don't auto-search on tab switch - user must click search button
    }
  }, [isOpen, searchQuery]);

  // Combined web search - fetches from both Serper (Google) and Openverse
  const handleWebSearch = async (page: number = 1, append: boolean = false) => {
    if (!query.trim()) return;
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setWebImages([]);
    }
    
    try {
      // Fetch from both sources in parallel
      const [serperResults, openverseResults] = await Promise.allSettled([
        serperService.isConfigured() ? serperService.searchImages(query.trim(), 10) : Promise.resolve([]),
        openverseService.isConfigured() ? openverseService.searchImages(query.trim(), page, 20) : Promise.resolve([])
      ]);

      const combinedResults: WebImageResult[] = [];

      // Add Serper (Google) results (only on first page)
      if (!append && serperResults.status === 'fulfilled' && serperResults.value.length > 0) {
        serperResults.value.forEach((img, idx) => {
          combinedResults.push({
            id: `serper-${idx}`,
            url: img.imageUrl,
            thumbnailUrl: img.thumbnailUrl,
            title: img.title,
            source: 'serper',
            attribution: img.source,
            width: img.imageWidth,
            height: img.imageHeight
          });
        });
      }

      // Add Openverse results
      let openverseCount = 0;
      if (openverseResults.status === 'fulfilled' && openverseResults.value.length > 0) {
        openverseCount = openverseResults.value.length;
        openverseResults.value.forEach((img) => {
          combinedResults.push({
            id: `openverse-${img.id}-${page}`,
            url: img.url,
            thumbnailUrl: img.thumbnail || img.url,
            title: img.title,
            source: 'openverse',
            attribution: openverseService.getShortAttribution(img),
            width: img.width,
            height: img.height
          });
        });
      }

      // Check if there are more results to load
      setHasMoreResults(openverseCount >= 20);
      setCurrentPage(page);
      setLastQuery(query.trim());

      if (append) {
        // Append new results to existing ones
        setWebImages(prev => [...prev, ...combinedResults]);
      } else {
        // Interleave results for variety (alternating sources) on first load
        const interleaved: WebImageResult[] = [];
        const serperItems = combinedResults.filter(r => r.source === 'serper');
        const openverseItems = combinedResults.filter(r => r.source === 'openverse');
        const maxLen = Math.max(serperItems.length, openverseItems.length);
        
        for (let i = 0; i < maxLen; i++) {
          if (serperItems[i]) interleaved.push(serperItems[i]);
          if (openverseItems[i]) interleaved.push(openverseItems[i]);
        }

        setWebImages(interleaved);
      }

      if (combinedResults.length === 0 && !append) {
        console.warn('No images found from either source');
      }
    } catch (error) {
      console.error('Web image search failed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more images
  const handleLoadMore = () => {
    if (!loadingMore && hasMoreResults) {
      handleWebSearch(currentPage + 1, true);
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
      toast.warning('Please select an image file');
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

  const handleSearch = () => {
    if (activeTab === 'web') handleWebSearch();
    else if (activeTab === 'ai') handleAiGeneration();
  };

  return (
    <div className="fixed inset-0 bg-[#f1efe9] dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 flex-shrink-0">
        <button
          onClick={onClose}
          className="text-gray-800 dark:text-gray-200"
        >
          <RiCloseLine className="w-7 h-7" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <div className="w-7" /> {/* Spacer for centering */}
      </header>

      {/* Search Bar */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for images..."
              className="w-full text-lg bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-0 outline-none pb-3 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <RiSearchLine className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4 overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-2xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <RiSparklingLine className="w-4 h-4" />
            AI Generate
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-2xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'web'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <RiGlobalLine className="w-4 h-4" />
            Web Search
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
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

          {/* Web Search Tab - Combined Serper (Google) + Openverse */}
          {activeTab === 'web' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Searching web images...</span>
                </div>
              ) : webImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {webImages.map((image) => (
                      <div
                        key={image.id}
                        className="relative cursor-pointer group rounded-lg overflow-hidden"
                        onClick={() => handleImageSelect(image.url)}
                      >
                        <img
                          src={image.thumbnailUrl}
                          alt={image.title || 'Web image'}
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
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate flex justify-between">
                          <span>{image.attribution}</span>
                          <span className={`px-1 rounded text-[10px] ${image.source === 'serper' ? 'bg-blue-500' : 'bg-green-500'}`}>
                            {image.source === 'serper' ? 'Google' : 'CC'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {hasMoreResults && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingMore ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-2xl animate-spin"></span>
                            Loading...
                          </span>
                        ) : (
                          'Load More Images'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <RiGlobalLine className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Search for images from in the web here or from 
                    <span className="block text-gray-500 dark:text-gray-300 p-2 rounded-2xl border border-gray-400 mt-4"><a href="https://images.google.com/" target="_blank" rel="noopener noreferrer"> Google Images <RiExternalLinkLine className="inline" /></a></span> 
                  </p>
                  {!serperService.isConfigured() && !openverseService.isConfigured() && (
                    <p className="text-red-500 text-sm mt-2">
                      ⚠️ No image search APIs configured. Please add VITE_SERPER_API_KEY or Openverse credentials.
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
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </>
              )}
            </div>
          )}
        </div>
    </div>
  );
};

export default ImageSelectionModal;
