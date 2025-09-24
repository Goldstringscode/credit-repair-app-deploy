/**
 * Typing Indicator Component
 * Shows when users are typing in a channel
 */

import React, { useState, useEffect } from 'react';

export interface TypingUser {
  userId: string;
  name: string;
  avatar?: string;
  timestamp: number;
}

interface TypingIndicatorProps {
  channelId: string;
  typingUsers: TypingUser[];
  currentUserId: string;
  onTypingStart?: (channelId: string) => void;
  onTypingStop?: (channelId: string) => void;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  channelId,
  typingUsers,
  currentUserId,
  onTypingStart,
  onTypingStop
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Filter out current user from typing users
  const otherTypingUsers = typingUsers.filter(user => user.userId !== currentUserId);

  // Handle typing state changes
  useEffect(() => {
    if (isTyping) {
      onTypingStart?.(channelId);
    } else {
      onTypingStop?.(channelId);
    }
  }, [isTyping, channelId, onTypingStart, onTypingStop]);

  // Auto-stop typing after 3 seconds of inactivity
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000);

    setTypingTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const formatTypingMessage = () => {
    if (otherTypingUsers.length === 0) return null;

    const now = Date.now();
    const recentTypingUsers = otherTypingUsers.filter(
      user => now - user.timestamp < 5000 // Only show users who typed in last 5 seconds
    );

    if (recentTypingUsers.length === 0) return null;

    if (recentTypingUsers.length === 1) {
      return `${recentTypingUsers[0].name} is typing...`;
    } else if (recentTypingUsers.length === 2) {
      return `${recentTypingUsers[0].name} and ${recentTypingUsers[1].name} are typing...`;
    } else {
      return `${recentTypingUsers[0].name} and ${recentTypingUsers.length - 1} others are typing...`;
    }
  };

  const typingMessage = formatTypingMessage();

  return (
    <div className="typing-indicator">
      {typingMessage && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 px-4 py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>{typingMessage}</span>
        </div>
      )}
    </div>
  );
};

export default TypingIndicator;
