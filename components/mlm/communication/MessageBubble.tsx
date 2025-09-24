'use client';

import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  Heart, 
  Laugh, 
  Angry, 
  Sad, 
  Wow, 
  Reply, 
  MoreVertical, 
  Pin, 
  Flag, 
  Edit3, 
  Trash2,
  Check,
  CheckCheck,
  Clock,
  Paperclip,
  Smile,
  Volume2
} from 'lucide-react';
import FileAttachment from './FileAttachment';
import FilePreviewModal from './FilePreviewModal';
import EmojiPicker from './EmojiPicker';
import MessageTranslation from './MessageTranslation';
import AudioAttachment from './AudioAttachment';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
      avatar?: string;
      rank: string;
      status: 'online' | 'away' | 'busy' | 'offline';
      language?: string;
    };
    timestamp: Date;
    type: 'text' | 'image' | 'file' | 'system' | 'announcement' | 'audio';
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
  };
  isOwn: boolean;
  currentUserLanguage?: string;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (messageId: string) => void;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onFlag: (messageId: string) => void;
  onTranslate?: (messageId: string, targetLanguage: string) => Promise<any>;
  onSetLanguage?: (language: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'away': return 'bg-yellow-500';
    case 'busy': return 'bg-red-500';
    case 'offline': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
};

const getRankColor = (rank: string) => {
  switch (rank) {
    case 'Diamond': return 'text-blue-600';
    case 'Platinum': return 'text-purple-600';
    case 'Gold': return 'text-yellow-600';
    case 'Silver': return 'text-gray-600';
    case 'Bronze': return 'text-orange-600';
    default: return 'text-gray-600';
  }
};

  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return 'Unknown time';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid time';
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function MessageBubble({
  message,
  isOwn,
  currentUserLanguage = 'en',
  onReaction,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onFlag,
  onTranslate,
  onSetLanguage,
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Add debug info for audio attachments
  useEffect(() => {
    if (message.attachments && message.attachments.length > 0) {
      const audioAttachment = message.attachments.find(att => att.type && att.type.startsWith('audio/'));
      if (audioAttachment && typeof window !== 'undefined' && (window as any).addDebugInfo) {
        (window as any).addDebugInfo(`MessageBubble passing duration: ${audioAttachment.duration || 0}`);
      }
    }
  }, [message.attachments]);

  const handleReaction = (emoji: string) => {
    onReaction(message.id, emoji);
    setShowReactions(false);
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    handleReaction(emoji);
  };

  const handleFilePreview = (file: any) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const getReadStatus = () => {
    if (isOwn) {
      if (message.readBy && message.readBy.length > 0) {
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      } else {
        return <Check className="w-4 h-4 text-gray-400" />;
      }
    }
    return null;
  };

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="bg-gray-100 text-gray-500 italic px-4 py-2 rounded-lg max-w-xs">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-2xl`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="relative flex-shrink-0">
            <img
              src={message.sender?.avatar || '/default-avatar.png'}
              alt={message.sender?.name || 'Unknown User'}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(message.sender?.status || 'offline')}`} />
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender Info */}
          {!isOwn && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-900">{message.sender?.name || 'Unknown User'}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRankColor(message.sender?.rank || 'Member')} bg-gray-100`}>
                  {message.sender?.rank || 'Member'}
                </span>
              </div>
            </div>
          )}

          {/* Message Bubble */}
          <div className="relative">
            <div
              className={`px-6 py-4 rounded-2xl shadow-sm ${
                isOwn
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : message.type === 'announcement'
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-900 border border-yellow-200 shadow-md'
                  : 'bg-white text-gray-900 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200'
              }`}
            >
              {message.type === 'announcement' && (
                <div className="flex items-center space-x-1 mb-1">
                  <Flag className="w-3 h-3" />
                  <span className="text-xs font-semibold">ANNOUNCEMENT</span>
                </div>
              )}
              
              {message.type === 'audio' && (
                <div className="flex items-center space-x-1 mb-1">
                  <Volume2 className="w-3 h-3" />
                  <span className="text-xs font-semibold">VOICE MESSAGE</span>
                </div>
              )}
              
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {message.isEdited && (
                <span className="text-xs opacity-75 ml-2">(edited)</span>
              )}
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => {
                  console.log('MessageBubble - attachment data:', attachment);
                  console.log('MessageBubble - attachment size:', attachment.size, 'type:', typeof attachment.size);
                  
                  // Special handling for audio attachments
                  if (attachment.type && attachment.type.startsWith('audio/')) {
                    console.log('🎵 MessageBubble - Rendering audio attachment:', {
                      messageId: message.id,
                      attachmentIndex: index,
                      attachment: attachment,
                      url: attachment.url,
                      urlType: attachment.url?.startsWith('blob:') ? 'blob' : attachment.url?.startsWith('data:') ? 'data' : 'other',
                      urlPrefix: attachment.url?.substring(0, 50) + '...'
                    });
                    
                    // Log if blob URL is detected in message feed (should not happen with new voice messages)
                    if (attachment.url?.startsWith('blob:')) {
                      console.error('🚨 CRITICAL: MessageBubble is rendering audio with BLOB URL!', {
                        messageId: message.id,
                        attachmentUrl: attachment.url,
                        messageContent: message.content
                      });
                    }
                    
                    return (
                      <AudioAttachment
                        key={index}
                        audio={{
                          id: `${message.id}-${index}`,
                          name: attachment.name || 'Voice message',
                          type: attachment.type,
                          size: attachment.size || 0,
                          url: attachment.url || '#',
                          duration: attachment.duration || 0
                        }}
                      />
                    );
                  }
                  
                  return (
                    <FileAttachment
                      key={index}
                      file={{
                        id: `${message.id}-${index}`,
                        name: attachment.name || 'Unknown file',
                        type: attachment.type || 'application/octet-stream',
                        size: attachment.size || 0,
                        url: attachment.url || '#'
                      }}
                      onPreview={handleFilePreview}
                    />
                  );
                })}
              </div>
            )}

            {/* Reactions */}
            {message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <button
                    key={index}
                    onClick={() => handleReaction(reaction.emoji)}
                    className="flex items-center space-x-1 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 px-3 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-gray-600">{reaction.users?.length || 0}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Message Translation */}
            {onTranslate && (
              <MessageTranslation
                message={message}
                currentUserLanguage={currentUserLanguage}
                onTranslate={onTranslate}
                onSetLanguage={onSetLanguage}
              />
            )}

            {/* Quick Reactions */}
            {showReactions && (
              <div className="absolute bottom-full left-0 mb-2 bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-3 flex space-x-2">
                {quickReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 hover:scale-110 text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Actions Menu */}
            {showActions && (
              <div className="absolute bottom-full right-0 mb-2 bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl py-2 z-10">
                <button
                  onClick={() => {
                    onReply(message.id);
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 w-full transition-all duration-200 hover:scale-105"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => {
                    onPin(message.id);
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 w-full transition-all duration-200 hover:scale-105"
                >
                  <Pin className="w-4 h-4" />
                  <span>{message.isPinned ? 'Unpin' : 'Pin'}</span>
                </button>
                <button
                  onClick={() => {
                    onFlag(message.id);
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 w-full transition-all duration-200 hover:scale-105"
                >
                  <Flag className="w-4 h-4" />
                  <span>{message.isFlagged ? 'Unflag' : 'Flag'}</span>
                </button>
                {isOwn && (
                  <>
                    <button
                      onClick={() => {
                        onEdit(message.id);
                        setShowActions(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 w-full transition-all duration-200 hover:scale-105"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        onDelete(message.id);
                        setShowActions(false);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Timestamp and Read Status */}
          <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
            {getReadStatus()}
            {message.isPinned && (
              <Pin className="w-3 h-3 text-yellow-500" />
            )}
            {message.isFlagged && (
              <Flag className="w-3 h-3 text-red-500" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2 transition-all duration-200 relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Add reaction"
          >
            <Smile className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Quick reactions"
          >
            <ThumbsUp className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        onClose={() => setShowEmojiPicker(false)}
      />

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewFile(null);
          }}
        />
      )}
    </div>
  );
}
