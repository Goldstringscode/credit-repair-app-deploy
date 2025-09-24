/**
 * Presence Indicator Component
 * Shows user online/offline status
 */

import React from 'react';

export interface UserPresence {
  userId: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: number;
}

interface PresenceIndicatorProps {
  user: UserPresence;
  showLastSeen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  user,
  showLastSeen = false,
  size = 'md'
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      case 'md':
      default:
        return 'w-3 h-3';
    }
  };

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className={`rounded-full ${size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'}`}
          />
        ) : (
          <div className={`${size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'} rounded-full bg-gray-300 flex items-center justify-center`}>
            <span className={`${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-sm'} font-medium text-gray-600`}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Status indicator */}
        <div className={`absolute -bottom-0.5 -right-0.5 ${getSizeClasses(size)} ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
      </div>
      
      <div className="flex flex-col">
        <span className={`${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'} font-medium text-gray-900`}>
          {user.name}
        </span>
        {showLastSeen && user.lastSeen && (
          <span className={`${size === 'sm' ? 'text-xs' : 'text-xs'} text-gray-500`}>
            {user.status === 'offline' ? `Last seen ${formatLastSeen(user.lastSeen)}` : 'Online'}
          </span>
        )}
      </div>
    </div>
  );
};

export default PresenceIndicator;