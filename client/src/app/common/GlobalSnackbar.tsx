// components/common/GlobalSnackbar.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export type SnackbarVariant = 'success' | 'error' | 'info' | 'warning';

interface SnackbarProps {
  open: boolean;
  message: string;
  variant?: SnackbarVariant;
  duration?: number;
  onClose: () => void;
}

const GlobalSnackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  variant = 'info',
  duration = 5000,
  onClose
}) => {
  console.log("GlobalSnackbar render:", { open, message, variant });
  
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    console.log("GlobalSnackbar useEffect open/duration changed:", { open, duration });
    
    if (open && duration !== null) {
      console.log(`Setting timeout for ${duration}ms to close snackbar:`, message);
      
      const timer = setTimeout(() => {
        console.log("Timeout triggered, closing snackbar:", message);
        handleClose();
      }, duration);

      return () => {
        console.log("Clearing timeout for snackbar:", message);
        clearTimeout(timer);
      };
    }
  }, [open, duration, message]);

  // Reset exit state when opening
  useEffect(() => {
    console.log("GlobalSnackbar useEffect open changed:", { open, isExiting });
    
    if (open) {
      setIsExiting(false);
    }
  }, [open]);

  const handleClose = () => {
    console.log("handleClose called for snackbar:", message);
    setIsExiting(true);
    
    // Wait for animation to complete
    setTimeout(() => {
      console.log("Animation complete, calling onClose for:", message);
      onClose();
    }, 300);
  };

  if (!open) {
    console.log("GlobalSnackbar not showing because open is false");
    return null;
  }

  const getVariantStyles = (): string => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-l-4 border-green-500';
      case 'error':
        return 'bg-red-100 text-red-800 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 mr-2" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 mr-2" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 mr-2" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 mr-2" />;
    }
  };

  console.log("GlobalSnackbar rendering UI with classes:", getVariantStyles());

  return (
    <div 
      className={`
        flex items-center p-4 rounded-lg shadow-lg ${getVariantStyles()}
        transition-all duration-300 ease-in-out w-80 max-w-full
        ${isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
      `}
    >
      <div className="flex items-center">
        {getIcon()}
        <p className="font-medium">{message}</p>
      </div>
      <button
        className="ml-auto pl-3"
        onClick={handleClose}
        aria-label="Close notification"
      >
        <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  );
};

export default GlobalSnackbar;