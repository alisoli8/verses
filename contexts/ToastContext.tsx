import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { ToastContainer, ToastData, ToastType } from '../components/common/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastIdCounter = 0;

// Global toast reference for use outside React components
let globalToastRef: ToastContextType | null = null;

export const toast = {
  show: (message: string, type: ToastType = 'info', duration?: number) => {
    if (globalToastRef) {
      globalToastRef.showToast(message, type, duration);
    } else {
      console.warn('Toast not initialized yet');
    }
  },
  success: (message: string, duration?: number) => toast.show(message, 'success', duration),
  error: (message: string, duration?: number) => toast.show(message, 'error', duration),
  info: (message: string, duration?: number) => toast.show(message, 'info', duration),
  warning: (message: string, duration?: number) => toast.show(message, 'warning', duration),
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = `toast-${++toastIdCounter}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    success: useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]),
    error: useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]),
    info: useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]),
    warning: useCallback((message: string, duration?: number) => showToast(message, 'warning', duration), [showToast]),
  };

  // Set global reference for use outside React components
  useEffect(() => {
    globalToastRef = contextValue;
    return () => {
      globalToastRef = null;
    };
  }, [contextValue]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
