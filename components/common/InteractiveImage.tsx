import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RiExpandDiagonalLine, RiContractUpDownLine, RiDragMove2Line, RiCropLine } from 'react-icons/ri';

interface InteractiveImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onTransformChange?: (transform: ImageTransform) => void;
  initialTransform?: Partial<ImageTransform>;
  showControls?: boolean;
  showCropBox?: boolean;
  allowOverflow?: boolean;
}

interface ImageTransform {
  scale: number;
  translateX: number;
  translateY: number;
  objectFit: 'scale-down';
  cropBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface TouchState {
  touches: Touch[];
  initialDistance: number;
  initialScale: number;
  initialTranslate: { x: number; y: number };
  center: { x: number; y: number };
}

interface CropState {
  isDragging: boolean;
  isResizing: boolean;
  resizeHandle: string | null;
  startPos: { x: number; y: number };
  startCrop: { x: number; y: number; width: number; height: number };
}

const InteractiveImage: React.FC<InteractiveImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  onTransformChange,
  initialTransform = { scale: 1, translateX: 0, translateY: 0, objectFit: 'scale-down' },
  showControls = true,
  showCropBox = false,
  allowOverflow = false
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [transform, setTransform] = useState<ImageTransform>(() => ({
    scale: 1,
    translateX: 0,
    translateY: 0,
    objectFit: 'scale-down',
    cropBox: { x: 10, y: 10, width: 80, height: 80 },
    ...initialTransform
  }));
  
  // Update transform when initialTransform changes
  useEffect(() => {
    setTransform(prev => ({
      ...prev,
      ...initialTransform
    }));
  }, [initialTransform]);
  const [isDragging, setIsDragging] = useState(false);
  const [touchState, setTouchState] = useState<TouchState | null>(null);
  const [cropState, setCropState] = useState<CropState>({
    isDragging: false,
    isResizing: false,
    resizeHandle: null,
    startPos: { x: 0, y: 0 },
    startCrop: { x: 0, y: 0, width: 0, height: 0 }
  });

  // Calculate distance between two touches
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touches
  const getCenter = (touch1: Touch, touch2: Touch) => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  });

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touches: Touch[] = [];
    for (let i = 0; i < e.touches.length; i++) {
      touches.push(e.touches[i]);
    }
    
    if (touches.length === 1) {
      // Single touch - prepare for drag
      setIsDragging(true);
      setTouchState({
        touches,
        initialDistance: 0,
        initialScale: transform.scale,
        initialTranslate: { x: transform.translateX, y: transform.translateY },
        center: { x: touches[0].clientX, y: touches[0].clientY }
      });
    } else if (touches.length === 2) {
      // Two touches - prepare for pinch
      const distance = getDistance(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);
      
      setTouchState({
        touches,
        initialDistance: distance,
        initialScale: transform.scale,
        initialTranslate: { x: transform.translateX, y: transform.translateY },
        center
      });
    }
  }, [transform]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchState) return;

    const touches: Touch[] = [];
    for (let i = 0; i < e.touches.length; i++) {
      touches.push(e.touches[i]);
    }
    
    if (touches.length === 1 && isDragging) {
      // Single touch drag
      const deltaX = touches[0].clientX - touchState.center.x;
      const deltaY = touches[0].clientY - touchState.center.y;
      
      const newTransform = {
        ...transform,
        translateX: touchState.initialTranslate.x + deltaX,
        translateY: touchState.initialTranslate.y + deltaY
      };
      
      setTransform(newTransform);
      onTransformChange?.(newTransform);
    } else if (touches.length === 2) {
      // Two touch pinch/zoom
      const distance = getDistance(touches[0], touches[1]);
      const scaleChange = distance / touchState.initialDistance;
      const newScale = Math.max(0.5, Math.min(3, touchState.initialScale * scaleChange));
      
      const newTransform = {
        ...transform,
        scale: newScale
      };
      
      setTransform(newTransform);
      onTransformChange?.(newTransform);
    }
  }, [touchState, isDragging, transform, onTransformChange]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setTouchState(null);
  }, []);

  // Handle mouse events for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setTouchState({
      touches: [],
      initialDistance: 0,
      initialScale: transform.scale,
      initialTranslate: { x: transform.translateX, y: transform.translateY },
      center: { x: e.clientX, y: e.clientY }
    });
  }, [transform]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !touchState) return;
    
    const deltaX = e.clientX - touchState.center.x;
    const deltaY = e.clientY - touchState.center.y;
    
    const newTransform = {
      ...transform,
      translateX: touchState.initialTranslate.x + deltaX,
      translateY: touchState.initialTranslate.y + deltaY
    };
    
    setTransform(newTransform);
    onTransformChange?.(newTransform);
  }, [isDragging, touchState, transform, onTransformChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setTouchState(null);
  }, []);

  // Handle wheel zoom for desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, transform.scale * scaleChange));
    
    const newTransform = {
      ...transform,
      scale: newScale
    };
    
    setTransform(newTransform);
    onTransformChange?.(newTransform);
  }, [transform, onTransformChange]);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Crop box handlers
  const handleCropMouseDown = (e: React.MouseEvent, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!transform.cropBox) return;
    
    setCropState({
      isDragging: !handle,
      isResizing: !!handle,
      resizeHandle: handle || null,
      startPos: { x: e.clientX, y: e.clientY },
      startCrop: { ...transform.cropBox }
    });
  };
  
  const handleCropMouseMove = useCallback((e: MouseEvent) => {
    if (!cropState.isDragging && !cropState.isResizing) return;
    if (!transform.cropBox || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - cropState.startPos.x) / rect.width) * 100;
    const deltaY = ((e.clientY - cropState.startPos.y) / rect.height) * 100;
    
    let newCropBox = { ...transform.cropBox };
    
    if (cropState.isDragging) {
      // Move the entire crop box
      newCropBox.x = Math.max(0, Math.min(100 - newCropBox.width, cropState.startCrop.x + deltaX));
      newCropBox.y = Math.max(0, Math.min(100 - newCropBox.height, cropState.startCrop.y + deltaY));
    } else if (cropState.isResizing && cropState.resizeHandle) {
      // Resize the crop box based on the handle
      const handle = cropState.resizeHandle;
      
      if (handle.includes('right')) {
        newCropBox.width = Math.max(10, Math.min(100 - newCropBox.x, cropState.startCrop.width + deltaX));
      }
      if (handle.includes('left')) {
        const newWidth = Math.max(10, cropState.startCrop.width - deltaX);
        const newX = cropState.startCrop.x + (cropState.startCrop.width - newWidth);
        if (newX >= 0) {
          newCropBox.x = newX;
          newCropBox.width = newWidth;
        }
      }
      if (handle.includes('bottom')) {
        newCropBox.height = Math.max(10, Math.min(100 - newCropBox.y, cropState.startCrop.height + deltaY));
      }
      if (handle.includes('top')) {
        const newHeight = Math.max(10, cropState.startCrop.height - deltaY);
        const newY = cropState.startCrop.y + (cropState.startCrop.height - newHeight);
        if (newY >= 0) {
          newCropBox.y = newY;
          newCropBox.height = newHeight;
        }
      }
    }
    
    const newTransform = { ...transform, cropBox: newCropBox };
    setTransform(newTransform);
    onTransformChange?.(newTransform);
  }, [cropState, transform, onTransformChange]);
  
  const handleCropMouseUp = useCallback(() => {
    setCropState({
      isDragging: false,
      isResizing: false,
      resizeHandle: null,
      startPos: { x: 0, y: 0 },
      startCrop: { x: 0, y: 0, width: 0, height: 0 }
    });
  }, []);
  
  // Crop box event listeners
  useEffect(() => {
    if (cropState.isDragging || cropState.isResizing) {
      document.addEventListener('mousemove', handleCropMouseMove);
      document.addEventListener('mouseup', handleCropMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCropMouseMove);
        document.removeEventListener('mouseup', handleCropMouseUp);
      };
    }
  }, [cropState.isDragging, cropState.isResizing, handleCropMouseMove, handleCropMouseUp]);

  // Reset transform (simplified since we only use scale-down)
  const resetImageTransform = () => {
    const resetTransform = { 
      ...transform, 
      scale: 1, 
      translateX: 0, 
      translateY: 0,
      objectFit: 'scale-down' as const
    };
    setTransform(resetTransform);
    onTransformChange?.(resetTransform);
  };


  return (
    <div 
      className={`relative w-full h-full ${allowOverflow ? '' : 'overflow-hidden'} ${containerClassName}`} 
      ref={containerRef}
    >
      {/* Image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`absolute select-none ${className}`}
        style={{
          top: '50%',
          left: '50%',
          width: 'auto',
          height: 'auto',
          maxWidth: allowOverflow ? 'none' : '100%',
          maxHeight: allowOverflow ? 'none' : '100%',
          objectFit: 'contain',
          transform: `translate(-50%, -50%) scale(${transform.scale}) translate(${transform.translateX}px, ${transform.translateY}px)`,
          transformOrigin: 'center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        draggable={false}
      />

      {/* Controls */}
      {showControls && (
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {/* Reset Button */}
          <button
            onClick={resetImageTransform}
            className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors"
            title="Reset Position & Scale"
          >
            <RiContractUpDownLine size={16} />
          </button>
          
          {/* Crop Toggle Button */}
          {showCropBox && (
            <button
              className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors"
              title="Crop Tool"
            >
              <RiCropLine size={16} />
            </button>
          )}
        </div>
      )}

      {/* Crop Box */}
      {showCropBox && transform.cropBox && (
        <div 
          className="absolute border-2 border-white shadow-lg"
          style={{
            left: `${transform.cropBox.x}%`,
            top: `${transform.cropBox.y}%`,
            width: `${transform.cropBox.width}%`,
            height: `${transform.cropBox.height}%`,
            cursor: cropState.isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={(e) => handleCropMouseDown(e)}
        >
          {/* Crop box overlay */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Corner handles */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(handle => (
            <div
              key={handle}
              className={`absolute w-3 h-3 bg-white border border-gray-400 ${
                handle.includes('top') ? '-top-1.5' : '-bottom-1.5'
              } ${
                handle.includes('left') ? '-left-1.5' : '-right-1.5'
              } cursor-nw-resize hover:bg-blue-500`}
              onMouseDown={(e) => handleCropMouseDown(e, handle)}
            />
          ))}
          
          {/* Edge handles */}
          <div 
            className="absolute w-3 h-3 bg-white border border-gray-400 -top-1.5 left-1/2 transform -translate-x-1/2 cursor-n-resize hover:bg-blue-500"
            onMouseDown={(e) => handleCropMouseDown(e, 'top')}
          />
          <div 
            className="absolute w-3 h-3 bg-white border border-gray-400 -bottom-1.5 left-1/2 transform -translate-x-1/2 cursor-s-resize hover:bg-blue-500"
            onMouseDown={(e) => handleCropMouseDown(e, 'bottom')}
          />
          <div 
            className="absolute w-3 h-3 bg-white border border-gray-400 -left-1.5 top-1/2 transform -translate-y-1/2 cursor-w-resize hover:bg-blue-500"
            onMouseDown={(e) => handleCropMouseDown(e, 'left')}
          />
          <div 
            className="absolute w-3 h-3 bg-white border border-gray-400 -right-1.5 top-1/2 transform -translate-y-1/2 cursor-e-resize hover:bg-blue-500"
            onMouseDown={(e) => handleCropMouseDown(e, 'right')}
          />
          
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/50" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/50" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/50" />
          </div>
        </div>
      )}

      {/* Scale Indicator */}
      {showControls && (transform.scale !== 1 || transform.translateX !== 0 || transform.translateY !== 0) && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded">
          {Math.round(transform.scale * 100)}%
        </div>
      )}

      {/* Instructions */}
      {showControls && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded opacity-70">
          <div className="hidden sm:block">Drag • Scroll to zoom</div>
          <div className="sm:hidden">Drag • Pinch to zoom</div>
        </div>
      )}
    </div>
  );
};

export default InteractiveImage;
