import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RiCloseLine, RiCheckLine, RiRefreshLine, RiRepeatLine, RiDropLine, RiPaletteLine } from 'react-icons/ri';
import InteractiveImage from './InteractiveImage';

interface ImageEditorProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImageUrl: string, backgroundColor?: string) => void;
  title?: string;
  initialBackgroundColor?: string;
}


const ImageEditor: React.FC<ImageEditorProps> = ({ 
  imageUrl, 
  isOpen, 
  onClose, 
  onSave, 
  title = "Edit Image",
  initialBackgroundColor = "#000000"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor);
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [imageTransform, setImageTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
    objectFit: 'scale-down' as const
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsImageLoaded(false);
      setRotation(0);
      setScale(1);
      setBackgroundColor(initialBackgroundColor);
      setIsEyedropperActive(false);
      setShowColorPicker(false);
      setImageTransform({
        scale: 1,
        translateX: 0,
        translateY: 0,
        objectFit: 'scale-down' as const
      });
    }
  }, [isOpen, initialBackgroundColor]);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);


  // Eyedropper functionality
  const handleEyedropperClick = (e: React.MouseEvent) => {
    if (!isEyedropperActive || !imageRef.current || !containerRef.current) return;
    
    e.preventDefault();
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    
    // Create a temporary canvas to get pixel color
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    const img = imageRef.current;
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    tempCtx.drawImage(img, 0, 0);
    
    // Calculate the actual pixel position on the image
    const scaleX = img.naturalWidth / containerRect.width;
    const scaleY = img.naturalHeight / containerRect.height;
    const pixelX = Math.floor(x * scaleX);
    const pixelY = Math.floor(y * scaleY);
    
    // Get pixel color
    const imageData = tempCtx.getImageData(pixelX, pixelY, 1, 1);
    const [r, g, b] = imageData.data;
    const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    
    setBackgroundColor(hexColor);
    setIsEyedropperActive(false);
  };


  const handleSave = async () => {
    if (!canvasRef.current || !imageRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = imageRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Set canvas size to container size
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(imageTransform.scale, imageTransform.scale);
    ctx.translate(imageTransform.translateX, imageTransform.translateY);
    
    // Calculate image dimensions to fit scale-down behavior
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight;
    if (imgAspect > containerAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgAspect;
    }
    
    // Draw the image
    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    
    ctx.restore();
    
    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const editedImageUrl = URL.createObjectURL(blob);
        onSave(editedImageUrl, backgroundColor);
      }
    }, 'image/jpeg', 0.9);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Image Editor */}
        <div className="p-4">
          <div 
            ref={containerRef}
            className={`relative w-full h-80 rounded-lg mb-4 ${isEyedropperActive ? 'cursor-crosshair' : ''}`}
            style={{ backgroundColor, overflow: 'visible' }}
            onClick={handleEyedropperClick}
          >
            <InteractiveImage
              src={imageUrl}
              alt="Edit"
              containerClassName="w-full h-full rounded-lg"
              className=""
              onTransformChange={setImageTransform}
              initialTransform={imageTransform}
              showControls={true}
              showCropBox={false}
              // allowOverflow={true}
            />
            
            {/* Hidden image for eyedropper functionality */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Hidden for eyedropper"
              className="hidden"
              onLoad={handleImageLoad}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4 mb-4">
            {/* Transform Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRotation(prev => prev - 90)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Rotate Left"
                >
                  <RiRefreshLine className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setRotation(prev => prev + 90)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Rotate Right"
                >
                  <RiRepeatLine className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium dark:text-white">Use pinch/drag on image to position</span>
              </div>
            </div>

            {/* Background Color Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    isEyedropperActive 
                      ? 'bg-brand-lime text-black' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Pick color from image"
                >
                  <RiDropLine className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Choose background color"
                >
                  <RiPaletteLine className="w-5 h-5" />
                </button>
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor }}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium dark:text-white">Background:</label>
                {showColorPicker && (
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600"
                  />
                )}
              </div>
            </div>

            {/* Preset Colors */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium dark:text-white">Presets:</span>
              {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(color => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    backgroundColor === color ? 'border-brand-lime scale-110' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-4 bg-brand-lime text-black rounded-lg hover:bg-brand-lime/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <RiCheckLine className="w-5 h-5" />
              Apply Changes
            </button>
          </div>
        </div>
      </div>
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageEditor;
