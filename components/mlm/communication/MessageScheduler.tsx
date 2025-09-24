'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Send, 
  X, 
  Check, 
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface ScheduledMessage {
  id: string;
  channelId: string;
  content: string;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  attachments?: any[];
  messageType: string;
  recurring?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
}

interface MessageSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (message: Omit<ScheduledMessage, 'id' | 'createdAt' | 'status'>) => void;
  channelId: string;
  channelName: string;
  initialContent?: string;
  scheduledMessages?: ScheduledMessage[];
  onCancelScheduled?: (messageId: string) => void;
  onEditScheduled?: (messageId: string, updates: Partial<ScheduledMessage>) => void;
}

const RECURRING_OPTIONS = [
  { id: 'none', label: 'Send once', description: 'Send this message only once' },
  { id: 'daily', label: 'Daily', description: 'Repeat every day' },
  { id: 'weekly', label: 'Weekly', description: 'Repeat every week' },
  { id: 'monthly', label: 'Monthly', description: 'Repeat every month' }
];

const TIME_PRESETS = [
  { label: 'In 5 minutes', minutes: 5 },
  { label: 'In 15 minutes', minutes: 15 },
  { label: 'In 30 minutes', minutes: 30 },
  { label: 'In 1 hour', minutes: 60 },
  { label: 'In 2 hours', minutes: 120 },
  { label: 'Tomorrow at 9 AM', preset: 'tomorrow-9am' },
  { label: 'Next Monday at 9 AM', preset: 'next-monday-9am' }
];

export default function MessageScheduler({
  isOpen,
  onClose,
  onSchedule,
  channelId,
  channelName,
  initialContent = '',
  scheduledMessages = [],
  onCancelScheduled,
  onEditScheduled
}: MessageSchedulerProps) {
  const [content, setContent] = useState(initialContent);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [messageType, setMessageType] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScheduledList, setShowScheduledList] = useState(false);

  // Initialize with current time + 1 hour
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      setScheduledDate(oneHourLater.toISOString().split('T')[0]);
      setScheduledTime(oneHourLater.toTimeString().slice(0, 5));
      setContent(initialContent);
      setError(null);
    }
  }, [isOpen, initialContent]);

  const handlePresetTime = (preset: any) => {
    const now = new Date();
    let targetTime = new Date();

    if (preset.minutes) {
      targetTime = new Date(now.getTime() + preset.minutes * 60 * 1000);
    } else if (preset.preset === 'tomorrow-9am') {
      targetTime = new Date(now);
      targetTime.setDate(targetTime.getDate() + 1);
      targetTime.setHours(9, 0, 0, 0);
    } else if (preset.preset === 'next-monday-9am') {
      targetTime = new Date(now);
      const daysUntilMonday = (1 + 7 - targetTime.getDay()) % 7;
      targetTime.setDate(targetTime.getDate() + (daysUntilMonday || 7));
      targetTime.setHours(9, 0, 0, 0);
    }

    setScheduledDate(targetTime.toISOString().split('T')[0]);
    setScheduledTime(targetTime.toTimeString().slice(0, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!content.trim()) {
        throw new Error('Message content is required');
      }

      if (!scheduledDate || !scheduledTime) {
        throw new Error('Scheduled date and time are required');
      }

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();

      if (scheduledDateTime <= now) {
        throw new Error('Scheduled time must be in the future');
      }

      // Create scheduled message
      const scheduledMessage: Omit<ScheduledMessage, 'id' | 'createdAt' | 'status'> = {
        channelId,
        content: content.trim(),
        scheduledFor: scheduledDateTime,
        attachments,
        messageType,
        recurring: recurring !== 'none' ? {
          type: recurring,
          interval: recurringInterval,
          endDate: recurringEndDate ? new Date(recurringEndDate) : undefined
        } : undefined
      };

      await onSchedule(scheduledMessage);
      
      // Reset form
      setContent('');
      setAttachments([]);
      setRecurring('none');
      setRecurringInterval(1);
      setRecurringEndDate('');
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatScheduledTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `In ${days} day${days > 1 ? 's' : ''} ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `In ${hours}h ${minutes}m`;
    } else {
      return `In ${minutes}m`;
    }
  };

  const getStatusColor = (status: ScheduledMessage['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'sent': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: ScheduledMessage['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'sent': return <Check className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Schedule Message</h3>
              <p className="text-sm text-gray-500">#{channelName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowScheduledList(!showScheduledList)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="View scheduled messages"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showScheduledList ? (
            /* Scheduled Messages List */
            <div className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Scheduled Messages</h4>
              
              {scheduledMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No scheduled messages</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledMessages.map((message) => (
                    <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                              {getStatusIcon(message.status)}
                              <span className="ml-1 capitalize">{message.status}</span>
                            </span>
                            {message.recurring && message.recurring.type !== 'none' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                {message.recurring.type}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-900 mb-2 line-clamp-2">{message.content}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Scheduled: {formatScheduledTime(message.scheduledFor)}</span>
                            <span>Created: {message.createdAt.toLocaleDateString()}</span>
                            {message.attachments && message.attachments.length > 0 && (
                              <span>{message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {message.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onEditScheduled?.(message.id, {})}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onCancelScheduled?.(message.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Schedule Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Time Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Schedule
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePresetTime(preset)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Recurring Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recurring
                </label>
                <div className="space-y-2">
                  {RECURRING_OPTIONS.map((option) => (
                    <label key={option.id} className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="recurring"
                        value={option.id}
                        checked={recurring === option.id}
                        onChange={(e) => setRecurring(e.target.value as any)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recurring Settings */}
              {recurring !== 'none' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repeat Every
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={recurringInterval}
                        onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-700">
                        {recurring === 'daily' ? 'day(s)' : 
                         recurring === 'weekly' ? 'week(s)' : 'month(s)'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={recurringEndDate}
                      onChange={(e) => setRecurringEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Schedule Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
