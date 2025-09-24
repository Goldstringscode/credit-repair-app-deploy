'use client';

import React from 'react';
import { Loader2, MessageSquare, Users, Upload, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface LoadingStatesProps {
  type: 'channels' | 'messages' | 'sending' | 'uploading' | 'connecting';
  message?: string;
  progress?: number;
}

export function LoadingStates({ type, message, progress }: LoadingStatesProps) {
  const getLoadingConfig = () => {
    switch (type) {
      case 'channels':
        return {
          icon: <Users className="h-5 w-5" />,
          title: 'Loading Channels',
          description: 'Fetching your communication channels...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'messages':
        return {
          icon: <MessageSquare className="h-5 w-5" />,
          title: 'Loading Messages',
          description: 'Fetching conversation history...',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'sending':
        return {
          icon: <Send className="h-5 w-5" />,
          title: 'Sending Message',
          description: 'Your message is being sent...',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        };
      case 'uploading':
        return {
          icon: <Upload className="h-5 w-5" />,
          title: 'Uploading File',
          description: 'Your file is being uploaded...',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        };
      case 'connecting':
        return {
          icon: <Loader2 className="h-5 w-5" />,
          title: 'Connecting',
          description: 'Establishing connection...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
      default:
        return {
          icon: <Loader2 className="h-5 w-5" />,
          title: 'Loading',
          description: 'Please wait...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const config = getLoadingConfig();
  const displayMessage = message || config.description;

  return (
    <div className="flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${config.bgColor}`}>
          <div className={`animate-spin ${config.color}`}>
            {config.icon}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className={`text-lg font-medium ${config.color}`}>
            {config.title}
          </h3>
          <p className="text-sm text-gray-600">
            {displayMessage}
          </p>
        </div>

        {progress !== undefined && (
          <div className="w-full max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${config.color.replace('text-', 'bg-')}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <Badge variant="outline" className="text-xs">
          {type.toUpperCase()}
        </Badge>
      </div>
    </div>
  );
}

// Skeleton components for different loading states
export function ChannelListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs lg:max-w-md ${i % 2 === 0 ? 'order-2' : 'order-1'}`}>
            <div className="flex items-end space-x-2">
              {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className={`rounded-lg p-3 ${i % 2 === 0 ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <Skeleton className={`h-4 w-full ${i % 2 === 0 ? 'bg-blue-300' : 'bg-gray-300'}`} />
                  <Skeleton className={`h-3 w-3/4 mt-2 ${i % 2 === 0 ? 'bg-blue-300' : 'bg-gray-300'}`} />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageInputSkeleton() {
  return (
    <div className="flex items-center space-x-2 p-4 border-t">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
  );
}

// Hook for managing loading states
export const useLoadingState = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingMessage, setLoadingMessage] = React.useState<string>('');
  const [progress, setProgress] = React.useState<number>(0);

  const startLoading = (message?: string) => {
    setIsLoading(true);
    setLoadingMessage(message || '');
    setProgress(0);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
    setProgress(0);
  };

  const updateProgress = (newProgress: number, message?: string) => {
    setProgress(newProgress);
    if (message) setLoadingMessage(message);
  };

  return {
    isLoading,
    loadingMessage,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
  };
};
