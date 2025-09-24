'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Edit3, 
  X, 
  Send, 
  Paperclip, 
  Smile, 
  Save,
  AlertCircle,
  Clock
} from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface MessageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  message: {
    id: string;
    content: string;
    sender: {
      name: string;
      avatar?: string;
    };
    timestamp: Date;
    isEdited: boolean;
    editedAt?: Date;
  };
  isSaving?: boolean;
}

export default function MessageEditModal({
  isOpen,
  onClose,
  onSave,
  message,
  isSaving = false
}: MessageEditModalProps) {
  const [content, setContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      // Select all text for easy editing
      textareaRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    setContent(message.content);
  }, [message.content]);

  const handleSave = () => {
    if (content.trim() && content !== message.content) {
      onSave(content.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Edit Message</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Message Info */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {message.sender.avatar ? (
                <img
                  src={message.sender.avatar}
                  alt={message.sender.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                message.sender.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {message.sender.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(message.timestamp)} at {formatTime(message.timestamp)}
                </span>
                {message.isEdited && message.editedAt && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>edited {formatDate(message.editedAt)} at {formatTime(message.editedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Content */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {/* Message Input */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Edit your message..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                disabled={isSaving}
              />
              
              {/* Character Count */}
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSaving}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  {content.length} characters
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Editing message</p>
                <p>This will update the message for everyone in the channel. The edit will be visible to all members.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || content === message.content || isSaving}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-lg transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {/* Emoji Picker */}
        <EmojiPicker
          isOpen={showEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      </div>
    </div>
  );
}
