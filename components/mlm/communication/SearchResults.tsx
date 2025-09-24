'use client';

import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  User, 
  Hash,
  File,
  Image,
  Video,
  Music,
  Pin,
  Flag,
  Reply,
  MoreVertical
} from 'lucide-react';
import MessageBubble from './MessageBubble';

interface SearchResultsProps {
  query: string;
  filters: any;
  results: any[];
  onClose: () => void;
  onMessageClick: (message: any) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (messageId: string) => void;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onFlag: (messageId: string) => void;
}

const MESSAGE_TYPE_ICONS = {
  text: File,
  image: Image,
  video: Video,
  audio: Music,
  file: File
};

export default function SearchResults({
  query,
  filters,
  results,
  onClose,
  onMessageClick,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onFlag
}: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'channel'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const formatDate = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageTypeIcon = (type: string) => {
    const IconComponent = MESSAGE_TYPE_ICONS[type as keyof typeof MESSAGE_TYPE_ICONS] || File;
    return IconComponent;
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return sortOrder === 'asc' 
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'channel':
        return sortOrder === 'asc'
          ? a.channel.name.localeCompare(b.channel.name)
          : b.channel.name.localeCompare(a.channel.name);
      default:
        return 0; // Relevance sorting would be handled by the backend
    }
  });

  const getFilterSummary = () => {
    const parts = [];
    
    if (filters.channels.length > 0) {
      parts.push(`${filters.channels.length} channel${filters.channels.length > 1 ? 's' : ''}`);
    }
    
    if (filters.users.length > 0) {
      parts.push(`${filters.users.length} user${filters.users.length > 1 ? 's' : ''}`);
    }
    
    if (filters.messageTypes.length > 0) {
      parts.push(`${filters.messageTypes.length} type${filters.messageTypes.length > 1 ? 's' : ''}`);
    }
    
    if (filters.dateRange.start || filters.dateRange.end) {
      parts.push('date range');
    }
    
    if (filters.hasAttachments) parts.push('with attachments');
    if (filters.hasReactions) parts.push('with reactions');
    if (filters.isPinned) parts.push('pinned');
    if (filters.isFlagged) parts.push('flagged');
    
    return parts.length > 0 ? ` • ${parts.join(', ')}` : '';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Search className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results
            </h2>
            <p className="text-sm text-gray-500 truncate">
              "{query}"{getFilterSummary()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
            <option value="channel">Channel</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm text-center">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedResults.map((message) => {
              const IconComponent = getMessageTypeIcon(message.type);
              
              return (
                <div
                  key={message.id}
                  className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                  onClick={() => onMessageClick(message)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Channel Info */}
                    <div className="flex items-center space-x-1 text-xs text-gray-500 min-w-0">
                      <Hash className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{message.channel.name}</span>
                    </div>
                    
                    {/* Message Type */}
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <IconComponent className="w-3 h-3" />
                    </div>
                    
                    {/* Timestamp */}
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(message.timestamp)}</span>
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                    
                    {/* Flags */}
                    <div className="flex items-center space-x-1">
                      {message.isPinned && (
                        <Pin className="w-3 h-3 text-yellow-500" />
                      )}
                      {message.isFlagged && (
                        <Flag className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Sender */}
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {message.sender.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {message.sender.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.sender.rank}
                    </span>
                  </div>
                  
                  {/* Message Content */}
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      {highlightText(message.content, query)}
                    </p>
                  </div>
                  
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                      <File className="w-3 h-3" />
                      <span>{message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="mt-2 flex items-center space-x-1">
                      {message.reactions.map((reaction: any, index: number) => (
                        <span key={index} className="text-sm">
                          {reaction.emoji} {reaction.users.length}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
