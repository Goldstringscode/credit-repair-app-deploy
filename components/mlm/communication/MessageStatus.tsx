/**
 * Message Status Component
 * Shows delivery and read status of messages
 */

import React from 'react';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface MessageStatusProps {
  status: MessageStatus;
  readBy?: string[];
  showReadBy?: boolean;
  className?: string;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({
  status,
  readBy = [],
  showReadBy = false,
  className = ''
}) => {
  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sending':
        return (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        );
      case 'sent':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'delivered':
        return (
          <div className="flex">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-gray-400 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'read':
        return (
          <div className="flex">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-blue-500 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: MessageStatus) => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      case 'failed':
        return 'Failed to send';
      default:
        return '';
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {getStatusIcon(status)}
      {showReadBy && readBy.length > 0 && (
        <div className="flex -space-x-1">
          {readBy.slice(0, 3).map((userId, index) => (
            <div
              key={userId}
              className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center"
              title={`Read by user ${userId}`}
            >
              <span className="text-xs text-white font-medium">
                {userId.charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
          {readBy.length > 3 && (
            <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                +{readBy.length - 3}
              </span>
            </div>
          )}
        </div>
      )}
      <span className="text-xs text-gray-500">
        {getStatusText(status)}
      </span>
    </div>
  );
};

export default MessageStatus;
