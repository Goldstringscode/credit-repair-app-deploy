'use client';

import React from 'react';
import { 
  Mic, 
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceMessageModal({
  isOpen,
  onClose
}: VoiceMessageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Voice Messages Coming Soon!
            <Sparkles className="w-5 h-5 text-purple-500" />
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-center text-gray-600 mb-4">
            We're working on an amazing voice messaging feature that will make team communication even more personal and engaging.
          </p>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full w-20 h-20 flex items-center justify-center">
              <Mic className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">What to expect:</span>
            </div>
            <ul className="text-sm text-blue-800 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Record and send voice messages instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Play voice messages with full controls</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Voice message transcription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Enhanced team collaboration</span>
              </li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              This feature will be available in our next major update. Stay tuned!
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Got it!
              </Button>
              <Button 
                onClick={() => {
                  // You could add a "Notify me" feature here
                  onClose();
                }}
                className="flex-1"
              >
                Notify Me
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
