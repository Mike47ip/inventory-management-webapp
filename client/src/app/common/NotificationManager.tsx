'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

// Define notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

// Create context
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Helper hooks for common notification types
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();
  
  const showSuccess = useCallback((message: string, duration = 5000) => {
    console.log("[Notification] Showing success:", message);
    addNotification(message, 'success', duration);
  }, [addNotification]);
  
  const showError = useCallback((message: string, duration = 8000) => {
    console.log("[Notification] Showing error:", message);
    addNotification(message, 'error', duration);
  }, [addNotification]);
  
  const showInfo = useCallback((message: string, duration = 5000) => {
    console.log("[Notification] Showing info:", message);
    addNotification(message, 'info', duration);
  }, [addNotification]);
  
  const showWarning = useCallback((message: string, duration = 6000) => {
    console.log("[Notification] Showing warning:", message);
    addNotification(message, 'warning', duration);
  }, [addNotification]);

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  maxVisible = 5,
  position = 'bottom-right'
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  console.log("[Notification] Provider render, count:", notifications.length);

  // Add a notification
  const addNotification = useCallback((message: string, type: NotificationType = 'info', duration = 5000) => {
    console.log(`[Notification] Adding ${type}:`, message);
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setNotifications(prev => {
      // Limit to maxVisible
      const newNotifications = [
        ...prev,
        { id, message, type, duration }
      ];
      
      // Only keep the most recent notifications up to maxVisible
      if (newNotifications.length > maxVisible) {
        return newNotifications.slice(newNotifications.length - maxVisible);
      }
      
      return newNotifications;
    });
  }, [maxVisible]);

  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    console.log("[Notification] Removing:", id);
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Provide context value
  const contextValue = {
    notifications,
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification}
        position={position}
      />
      {/* Debug element to verify mounting */}
      <div style={{ display: 'none' }} id="notification-system-mounted">
        Notification system is mounted
      </div>
    </NotificationContext.Provider>
  );
};

// Container component for notifications
interface NotificationContainerProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ 
  notifications, 
  removeNotification,
  position
}) => {
  console.log("[Notification] Container render, count:", notifications.length);
  
  // Position styling
  const getPositionStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    };
    
    switch (position) {
      case 'top-right':
        return {
          ...baseStyle,
          top: '1rem',
          right: '1rem',
        };
      case 'top-left':
        return {
          ...baseStyle,
          top: '1rem',
          left: '1rem',
        };
      case 'bottom-left':
        return {
          ...baseStyle,
          bottom: '1rem',
          left: '1rem',
        };
      case 'bottom-right':
      default:
        return {
          ...baseStyle,
          bottom: '1rem',
          right: '1rem',
        };
    }
  };
  
  return (
    <div 
      className="notifications-container" 
      style={getPositionStyle()} 
      data-testid="notifications-container"
    >
      {notifications.map((notification, index) => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
          position={position}
          index={index}
        />
      ))}
    </div>
  );
};

// Individual notification item
interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
  position: string;
  index: number;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onClose,
  position,
  index
}) => {
  const { id, message, type, duration } = notification;
  const [isExiting, setIsExiting] = useState(false);
  
  // Auto-dismiss after duration
  useEffect(() => {
    console.log(`[Notification] Setting timeout for ${id}, duration:`, duration);
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [id, duration]);

  // Handle close with animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Animation duration
  };

  // Get styles based on notification type
  const getTypeStyles = () => {
    switch (type) {
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

  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
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

  // Animation classes based on position
  const getAnimationClass = () => {
    if (isExiting) {
      if (position.includes('right')) return 'animate-slide-out-right';
      return 'animate-slide-out-left';
    } else {
      if (position.includes('right')) return 'animate-slide-in-right';
      return 'animate-slide-in-left';
    }
  };

  return (
    <div 
      className={`
        flex items-center p-4 rounded-lg shadow-lg ${getTypeStyles()}
        transition-all duration-300 ease-in-out w-80 max-w-full
        ${getAnimationClass()}
      `}
      style={{ 
        animationDelay: `${index * 100}ms`,
      }}
      data-notification-id={id}
    >
      <div className="flex items-center overflow-hidden">
        {getIcon()}
        <p className="font-medium text-sm whitespace-normal break-words">{message}</p>
      </div>
      <button
        className="ml-auto pl-3 flex-shrink-0"
        onClick={handleClose}
        aria-label="Close notification"
      >
        <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  );
};

export default NotificationProvider;