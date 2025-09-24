'use client';

import React from 'react';
import { 
  Mic, 
  Clock,
  Sparkles
} from 'lucide-react';

interface VoiceMessageProps {
  className?: string;
}

export default function VoiceMessage({
  className = ''
}: VoiceMessageProps) {
  return (
    <div className={`flex items-center justify-center p-6 text-center ${className}`}>
      <div className="max-w-md">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full mb-4 mx-auto w-16 h-16 flex items-center justify-center">
          <Mic className="w-8 h-8 text-blue-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Voice Messages Coming Soon!
          <Sparkles className="w-5 h-5 text-purple-500" />
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          We're working on an amazing voice messaging feature that will make team communication even more personal and engaging.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">What to expect:</span>
          </div>
          <ul className="text-xs text-blue-800 space-y-1 text-left">
            <li>• Record and send voice messages instantly</li>
            <li>• Play voice messages with full controls</li>
            <li>• Voice message transcription</li>
            <li>• Enhanced team collaboration</li>
          </ul>
        </div>
        
        <div className="text-xs text-gray-500">
          This feature will be available in our next major update. Stay tuned!
        </div>
      </div>
    </div>
  );
}