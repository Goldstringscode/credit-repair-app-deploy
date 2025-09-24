'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  Clock, 
  MoreVertical,
  Pin,
  Flag,
  Edit3,
  Trash2
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import ReplyModal from './ReplyModal';

interface ThreadViewProps {
  thread: {
    id: string;
    parentMessage: {
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
    replies: {
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
      attachments?: {
        name: string;
        type: string;
        size: number;
        url: string;
      }[];
      isPinned: boolean;
      isFlagged: boolean;
      readBy: { user: { id: string; name: string }; timestamp: Date }[];
    }[];
    participants: {
      id: string;
      name: string;
      avatar?: string;
      rank: string;
      status: 'online' | 'away' | 'busy' | 'offline';
    }[];
  };
  currentUserId: string;
  onClose: () => void;
  onReply: (parentId: string, content: string, attachments: File[]) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onFlag: (messageId: string) => void;
}

export default function ThreadView({
  thread,
  currentUserId,
  onClose,
  onReply,
  onReaction,
  onEdit,
  onDelete,
  onPin,
  onFlag
}: ThreadViewProps) {
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleReply = async (content: string, attachments: File[]) => {
    setIsSending(true);
    try {
      await onReply(thread.parentMessage.id, content, attachments);
      setShowReplyModal(false);
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatTime(date);
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Thread</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{thread.replies.length + 1} messages</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{thread.participants.length} participants</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReplyModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            Reply
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Parent Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-blue-700">Original message</span>
          </div>
          <MessageBubble
            message={thread.parentMessage}
            isOwn={thread.parentMessage.sender.id === currentUserId}
            onReaction={onReaction}
            onReply={() => setShowReplyModal(true)}
            onEdit={onEdit}
            onDelete={onDelete}
            onPin={onPin}
            onFlag={onFlag}
          />
        </div>

        {/* Replies */}
        {thread.replies.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500 px-2">
                {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            
            {thread.replies.map((reply) => (
              <div key={reply.id} className="ml-4">
                <MessageBubble
                  message={reply}
                  isOwn={reply.sender.id === currentUserId}
                  onReaction={onReaction}
                  onReply={() => setShowReplyModal(true)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPin={onPin}
                  onFlag={onFlag}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <ReplyModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        onSend={handleReply}
        parentMessage={thread.parentMessage}
        isSending={isSending}
      />
    </div>
  );
}
