'use client';

import React, { useState } from 'react';
import { 
  Trash2, 
  X, 
  AlertTriangle, 
  Clock,
  User,
  Calendar
} from 'lucide-react';

interface MessageDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
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
    reactions: { emoji: string; users: string[] }[];
    replies: any[];
  };
  isDeleting?: boolean;
}

export default function MessageDeleteModal({
  isOpen,
  onClose,
  onDelete,
  message,
  isDeleting = false
}: MessageDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString();
  };

  const handleDelete = () => {
    if (deleteType === 'hard' && confirmText !== 'DELETE') {
      return;
    }
    onDelete();
    onClose();
  };

  const handleClose = () => {
    setConfirmText('');
    setDeleteType('soft');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Delete Message</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Preview */}
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
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {message.sender.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(message.timestamp)} at {formatTime(message.timestamp)}
                </span>
                {message.isEdited && message.editedAt && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>edited</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">
                {message.content}
              </p>
              
              {/* Message Stats */}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                {message.reactions.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span>👍</span>
                    <span>{message.reactions.reduce((sum, r) => sum + r.users.length, 0)} reactions</span>
                  </div>
                )}
                {message.replies.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span>{message.replies.length} replies</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Options */}
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="deleteType"
                value="soft"
                checked={deleteType === 'soft'}
                onChange={(e) => setDeleteType(e.target.value as 'soft' | 'hard')}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Soft Delete</div>
                <div className="text-xs text-gray-500">
                  Replace message with "This message was deleted" placeholder. 
                  Original content will be hidden but message structure remains.
                </div>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="deleteType"
                value="hard"
                checked={deleteType === 'hard'}
                onChange={(e) => setDeleteType(e.target.value as 'soft' | 'hard')}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Hard Delete</div>
                <div className="text-xs text-gray-500">
                  Permanently remove the message and all its data. This action cannot be undone.
                </div>
              </div>
            </label>
          </div>

          {/* Hard Delete Confirmation */}
          {deleteType === 'hard' && (
            <div className="space-y-2">
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Warning: Permanent Deletion</p>
                  <p>This will permanently delete the message and cannot be undone. Type "DELETE" to confirm.</p>
                </div>
              </div>
              
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full p-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Soft Delete Warning */}
          {deleteType === 'soft' && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Soft Delete</p>
                <p>The message will be replaced with a deletion notice, but the message structure and metadata will remain.</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={
              isDeleting || 
              (deleteType === 'hard' && confirmText !== 'DELETE')
            }
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 rounded-lg transition-colors"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{deleteType === 'soft' ? 'Soft Delete' : 'Hard Delete'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
