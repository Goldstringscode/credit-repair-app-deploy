'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Wifi, WifiOff, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface CommunicationError {
  id: string;
  type: 'connection' | 'message_send' | 'message_load' | 'file_upload' | 'channel_switch';
  message: string;
  timestamp: Date;
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
}

interface CommunicationErrorHandlerProps {
  children: React.ReactNode;
  onError?: (error: CommunicationError) => void;
  onRetry?: (errorId: string) => void;
}

export function CommunicationErrorHandler({ 
  children, 
  onError, 
  onRetry 
}: CommunicationErrorHandlerProps) {
  const [errors, setErrors] = useState<CommunicationError[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [showErrors, setShowErrors] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-clear old errors
  useEffect(() => {
    const timer = setInterval(() => {
      setErrors(prev => prev.filter(error => 
        Date.now() - error.timestamp.getTime() < 30000 // Keep errors for 30 seconds
      ));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const addError = (error: Omit<CommunicationError, 'id' | 'timestamp' | 'retryCount'>) => {
    const newError: CommunicationError = {
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
    };

    setErrors(prev => [newError, ...prev.slice(0, 4)]); // Keep only last 5 errors
    onError?.(newError);
  };

  const retryError = (errorId: string) => {
    setErrors(prev => prev.map(error => 
      error.id === errorId 
        ? { ...error, retryCount: error.retryCount + 1 }
        : error
    ));
    onRetry?.(errorId);
  };

  const dismissError = (errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  };

  const getErrorIcon = (type: CommunicationError['type']) => {
    switch (type) {
      case 'connection':
        return isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
      case 'message_send':
      case 'message_load':
        return <MessageSquare className="h-4 w-4" />;
      case 'file_upload':
        return <AlertCircle className="h-4 w-4" />;
      case 'channel_switch':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getErrorColor = (type: CommunicationError['type']) => {
    switch (type) {
      case 'connection':
        return isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      case 'message_send':
      case 'message_load':
        return 'bg-yellow-100 text-yellow-800';
      case 'file_upload':
        return 'bg-orange-100 text-orange-800';
      case 'channel_switch':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getErrorMessage = (error: CommunicationError) => {
    if (!isOnline && error.type === 'connection') {
      return 'You are offline. Messages will be sent when connection is restored.';
    }
    return error.message;
  };

  // Expose error handling functions to children
  const errorContext = {
    addError,
    errors,
    isOnline,
  };

  return (
    <div className="relative">
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {errors.slice(0, 3).map((error) => (
            <Alert key={error.id} className="shadow-lg">
              <div className="flex items-start space-x-2">
                {getErrorIcon(error.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className={getErrorColor(error.type)}>
                      {error.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <button
                      onClick={() => dismissError(error.id)}
                      className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ×
                    </button>
                  </div>
                  <AlertDescription className="text-sm">
                    {getErrorMessage(error)}
                  </AlertDescription>
                  {error.retryable && error.retryCount < error.maxRetries && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryError(error.id)}
                      className="mt-2 h-6 px-2 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry ({error.retryCount}/{error.maxRetries})
                    </Button>
                  )}
                </div>
              </div>
            </Alert>
          ))}
          
          {errors.length > 3 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowErrors(!showErrors)}
              className="w-full text-xs"
            >
              {showErrors ? 'Hide' : `Show ${errors.length - 3} more errors`}
            </Button>
          )}
        </div>
      )}

      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50">
          <Alert className="bg-orange-50 border-orange-200">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You're offline. Messages will be queued and sent when connection is restored.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Render children with error context */}
      {React.cloneElement(children as React.ReactElement, { errorContext })}
    </div>
  );
}

// Hook for components to use error handling
export const useCommunicationErrorHandler = () => {
  const addError = (error: Omit<CommunicationError, 'id' | 'timestamp' | 'retryCount'>) => {
    // This would be connected to the error context in a real implementation
    console.error('Communication error:', error);
  };

  const handleAsyncError = async <T,>(
    operation: () => Promise<T>,
    errorType: CommunicationError['type'],
    errorMessage: string,
    retryable: boolean = true
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      addError({
        type: errorType,
        message: errorMessage,
        retryable,
        maxRetries: retryable ? 3 : 0,
      });
      return null;
    }
  };

  return { addError, handleAsyncError };
};
