'use client';

import React, { useState } from 'react';
import { 
  Pin, 
  X, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  MessageCircle, 
  User, 
  Calendar,
  MoreVertical,
  PinOff,
  Flag,
  Reply,
  Edit3,
  Trash2
} from 'lucide-react';
import MessageBubble from './MessageBubble';

interface PinnedMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    rank: string;
    status: 'online' | 'away' | 'busy' | 'offline';
  };
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system' | 'announcement';
  isEdited: boolean;
  isDeleted: boolean;
  reactions: { emoji: string; users: string[] }[];
  replies: any[];
  attachments?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  isPinned: boolean;
  isFlagged: boolean;
  readBy: { user: { id: string; name: string }; timestamp: Date }[];
  pinnedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  pinnedAt: Date;
  channel: {
    id: string;
    name: string;
    type: string;
  };
}

interface PinnedMessagesProps {
  pinnedMessages: PinnedMessage[];
  currentUserId: string;
  onPinOff: (messageId: string) => void;
  onMessageClick: (message: PinnedMessage) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (messageId: string) => void;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onFlag: (messageId: string) => void;
}

export default function PinnedMessages({
  pinnedMessages,
  currentUserId,
  onPinOff,
  onMessageClick,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  onFlag
}: PinnedMessagesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'sender' | 'channel'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUserActions, setShowUserActions] = useState<string | null>(null);

  const filteredMessages = pinnedMessages
    .filter(message => {
      const matchesSearch = message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           message.channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.pinnedAt).getTime() - new Date(b.pinnedAt).getTime();
          break;
        case 'sender':
          comparison = a.sender.name.localeCompare(b.sender.name);
          break;
        case 'channel':
          comparison = a.channel.name.localeCompare(b.channel.name);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'general':
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
      case 'announcement':
        return <Flag className="w-4 h-4 text-red-500" />;
      case 'training':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Pin className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Pinned Messages</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {pinnedMessages.length}
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pinned messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="date">Date Pinned</option>
                <option value="sender">Sender</option>
                <option value="channel">Channel</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Pin className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No pinned messages</p>
            <p className="text-sm text-center">
              {searchQuery ? 'No messages match your search' : 'Pin important messages to keep them easily accessible'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="group relative p-4 hover:bg-gray-50 border border-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-start space-x-3">
                  {/* Channel Info */}
                  <div className="flex items-center space-x-1 text-xs text-gray-500 min-w-0">
                    {getChannelIcon(message.channel.type)}
                    <span className="truncate">#{message.channel.name}</span>
                  </div>
                  
                  {/* Pinned Info */}
                  <div className="flex items-center space-x-1 text-xs text-yellow-600">
                    <Pin className="w-3 h-3" />
                    <span>Pinned by {message.pinnedBy.name}</span>
                    <span>•</span>
                    <span>{formatDate(message.pinnedAt)} {formatTime(message.pinnedAt)}</span>
                  </div>
                </div>

                {/* Message Content */}
                <div className="mt-3">
                  <MessageBubble
                    message={message}
                    isOwn={message.sender.id === currentUserId}
                    onReaction={onReaction}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPin={onPinOff}
                    onFlag={onFlag}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{message.sender.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(message.timestamp)} {formatTime(message.timestamp)}</span>
                    </div>
                    {message.replies.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Reply className="w-3 h-3" />
                        <span>{message.replies.length} replies</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onMessageClick(message)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View in Channel"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onPinOff(message.id)}
                      className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                      title="PinOff Message"
                    >
                      <PinOff className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setShowUserActions(showUserActions === message.id ? null : message.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="More Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Actions Menu */}
                {showUserActions === message.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onMessageClick(message);
                          setShowUserActions(null);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>View in Channel</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onReply(message.id);
                          setShowUserActions(null);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                      
                      <div className="border-t border-gray-200 my-1" />
                      
                      <button
                        onClick={() => {
                          onPinOff(message.id);
                          setShowUserActions(null);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 w-full text-left"
                      >
                        <PinOff className="w-4 h-4" />
                        <span>PinOff Message</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onFlag(message.id);
                          setShowUserActions(null);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Flag Message</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
