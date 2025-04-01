// components/Snackbar.tsx
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export type SnackbarVariant = 'success' | 'error' | 'info' | 'warning';

interface SnackbarProps {
  open: boolean;
  message: string;
  variant?: SnackbarVariant;
  duration?: number;
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  variant = 'info',
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (open && duration !== null) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [open, duration, onClose]);

  if (!open) return null;

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
        return <AlertCircle className="h-5 w-5 mr-2" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 mr-2" />;
    }
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 animate-slide-up">
      <div className={`flex items-center p-4 rounded-lg shadow-lg ${getVariantStyles()}`}>
        <div className="flex items-center">
          {getIcon()}
          <p className="font-medium">{message}</p>
        </div>
        <button
          className="ml-auto pl-3"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;