import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RiCloseLine, RiCheckLine, RiErrorWarningLine, RiInformationLine } from 'react-icons/ri';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger slide-in animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  }, [onRemove, toast.id]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    // Only allow dragging upward (negative values)
    if (diff < 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // If dragged up more than 50px, dismiss
    if (dragY < -50) {
      handleDismiss();
    } else {
      setDragY(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startY.current = e.clientY;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientY - startY.current;
    if (diff < 0) {
      setDragY(diff);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (dragY < -50) {
      handleDismiss();
    } else {
      setDragY(0);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragY(0);
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <RiCheckLine className="w-5 h-5 text-green-500" />;
      case 'error':
        return <RiErrorWarningLine className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <RiErrorWarningLine className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <RiInformationLine className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div
      ref={toastRef}
      className={`
        w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-l-4 ${getBorderColor()}
        transform transition-all duration-300 ease-out cursor-grab active:cursor-grabbing
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      `}
      style={{
        transform: `translateY(${isVisible ? dragY : -100}px)`,
        opacity: isVisible ? 1 - Math.abs(dragY) / 100 : 0,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <p className="flex-1 text-sm text-gray-800 dark:text-gray-200">
          {toast.message}
        </p>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <RiCloseLine className="w-5 h-5" />
        </button>
      </div>
      {/* Swipe hint indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 left-0 right-0 z-[9999] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
