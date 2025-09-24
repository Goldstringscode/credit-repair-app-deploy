'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  Calendar, 
  User, 
  Hash, 
  File, 
  Image, 
  Video, 
  Music,
  Clock,
  ArrowUp,
  ArrowDown,
  Check,
  ChevronDown
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, filters: SearchFilters) => void;
  channels: any[];
  users: any[];
}

interface SearchFilters {
  channels: string[];
  users: string[];
  dateRange: {
    start: string;
    end: string;
  };
  messageTypes: string[];
  hasAttachments: boolean | null;
  hasReactions: boolean | null;
  isPinned: boolean | null;
  isFlagged: boolean | null;
  // Advanced search filters
  searchIn: string[]; // 'content', 'attachments', 'reactions'
  caseSensitive: boolean;
  wholeWords: boolean;
  regexMode: boolean;
  sortBy: 'relevance' | 'date' | 'user' | 'channel';
  sortOrder: 'asc' | 'desc';
  minLength: number;
  maxLength: number;
  hasMentions: boolean | null;
  hasLinks: boolean | null;
  hasEmojis: boolean | null;
  sentiment: 'positive' | 'negative' | 'neutral' | 'all';
  language: string;
}

const MESSAGE_TYPES = [
  { id: 'text', label: 'Text', icon: File },
  { id: 'image', label: 'Images', icon: Image },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'file', label: 'Files', icon: File }
];

const DATE_RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'Past 7 days' },
  { id: 'month', label: 'Past 30 days' },
  { id: 'custom', label: 'Custom range' }
];

const SEARCH_IN_OPTIONS = [
  { id: 'content', label: 'Message Content' },
  { id: 'attachments', label: 'File Names' },
  { id: 'reactions', label: 'Reactions' }
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'date', label: 'Date' },
  { id: 'user', label: 'User' },
  { id: 'channel', label: 'Channel' }
];

const SENTIMENT_OPTIONS = [
  { id: 'all', label: 'All Sentiments' },
  { id: 'positive', label: 'Positive' },
  { id: 'negative', label: 'Negative' },
  { id: 'neutral', label: 'Neutral' }
];

const LANGUAGE_OPTIONS = [
  { id: 'all', label: 'All Languages' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
  { id: 'it', label: 'Italian' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'ru', label: 'Russian' },
  { id: 'ja', label: 'Japanese' },
  { id: 'ko', label: 'Korean' },
  { id: 'zh', label: 'Chinese' }
];

export default function SearchModal({
  isOpen,
  onClose,
  onSearch,
  channels,
  users
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    channels: [],
    users: [],
    dateRange: { start: '', end: '' },
    messageTypes: [],
    hasAttachments: null,
    hasReactions: null,
    isPinned: null,
    isFlagged: null,
    // Advanced search filters
    searchIn: ['content'],
    caseSensitive: false,
    wholeWords: false,
    regexMode: false,
    sortBy: 'relevance',
    sortOrder: 'desc',
    minLength: 0,
    maxLength: 10000,
    hasMentions: null,
    hasLinks: null,
    hasEmojis: null,
    sentiment: 'all',
    language: 'all'
  });
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMessageTypeDropdown, setShowMessageTypeDropdown] = useState(false);
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = () => {
    onSearch(query, filters);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleChannel = (channelId: string) => {
    setFilters(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(id => id !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const toggleUser = (userId: string) => {
    setFilters(prev => ({
      ...prev,
      users: prev.users.includes(userId)
        ? prev.users.filter(id => id !== userId)
        : [...prev.users, userId]
    }));
  };

  const toggleMessageType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      messageTypes: prev.messageTypes.includes(type)
        ? prev.messageTypes.filter(t => t !== type)
        : [...prev.messageTypes, type]
    }));
  };

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    
    if (range === 'custom') {
      return;
    }
    
    const now = new Date();
    let start = new Date();
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setDate(now.getDate() - 30);
        break;
    }
    
    setFilters(prev => ({
      ...prev,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      channels: [],
      users: [],
      dateRange: { start: '', end: '' },
      messageTypes: [],
      hasAttachments: null,
      hasReactions: null,
      isPinned: null,
      isFlagged: null,
      // Reset advanced filters
      searchIn: ['content'],
      caseSensitive: false,
      wholeWords: false,
      regexMode: false,
      sortBy: 'relevance',
      sortOrder: 'desc',
      minLength: 0,
      maxLength: 10000,
      hasMentions: null,
      hasLinks: null,
      hasEmojis: null,
      sentiment: 'all',
      language: 'all'
    });
    setSelectedDateRange('week');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.channels.length > 0) count++;
    if (filters.users.length > 0) count++;
    if (filters.messageTypes.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.hasAttachments !== null) count++;
    if (filters.hasReactions !== null) count++;
    if (filters.isPinned !== null) count++;
    if (filters.isFlagged !== null) count++;
    // Advanced filters
    if (filters.searchIn.length !== 1 || !filters.searchIn.includes('content')) count++;
    if (filters.caseSensitive) count++;
    if (filters.wholeWords) count++;
    if (filters.regexMode) count++;
    if (filters.sortBy !== 'relevance') count++;
    if (filters.sortOrder !== 'desc') count++;
    if (filters.minLength > 0) count++;
    if (filters.maxLength < 10000) count++;
    if (filters.hasMentions !== null) count++;
    if (filters.hasLinks !== null) count++;
    if (filters.hasEmojis !== null) count++;
    if (filters.sentiment !== 'all') count++;
    if (filters.language !== 'all') count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Search Messages</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters Toggle */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 pb-4 space-y-4 max-h-64 overflow-y-auto">
            {/* Channels */}
            <div className="relative">
              <button
                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">
                  Channels {filters.channels.length > 0 && `(${filters.channels.length})`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showChannelDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showChannelDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {channels.map((channel) => (
                    <label
                      key={channel.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.channels.includes(channel.id)}
                        onChange={() => toggleChannel(channel.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{channel.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Users */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">
                  Users {filters.users.length > 0 && `(${filters.users.length})`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showUserDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.users.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Message Types */}
            <div className="relative">
              <button
                onClick={() => setShowMessageTypeDropdown(!showMessageTypeDropdown)}
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">
                  Message Types {filters.messageTypes.length > 0 && `(${filters.messageTypes.length})`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMessageTypeDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showMessageTypeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {MESSAGE_TYPES.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <label
                        key={type.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.messageTypes.includes(type.id)}
                          onChange={() => toggleMessageType(type.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <IconComponent className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="relative">
              <button
                onClick={() => setShowDateRangeDropdown(!showDateRangeDropdown)}
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">
                  Date Range
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDateRangeDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDateRangeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {DATE_RANGES.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => {
                        handleDateRangeChange(range.id);
                        setShowDateRangeDropdown(false);
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 text-left"
                    >
                      <span className="text-sm text-gray-700">{range.label}</span>
                      {selectedDateRange === range.id && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                  
                  {selectedDateRange === 'custom' && (
                    <div className="p-2 border-t border-gray-200">
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-500">From</label>
                          <input
                            type="date"
                            value={filters.dateRange.start}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, start: e.target.value }
                            }))}
                            className="w-full p-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">To</label>
                          <input
                            type="date"
                            value={filters.dateRange.end}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, end: e.target.value }
                            }))}
                            className="w-full p-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Filters */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hasAttachments === true}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    hasAttachments: e.target.checked ? true : null
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Has attachments</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hasReactions === true}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    hasReactions: e.target.checked ? true : null
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Has reactions</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isPinned === true}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    isPinned: e.target.checked ? true : null
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Pinned messages</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isFlagged === true}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    isFlagged: e.target.checked ? true : null
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Flagged messages</span>
              </label>
            </div>

            {/* Advanced Search Options */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Search</h4>
              
              {/* Search In Options */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search in:</label>
                <div className="space-y-1">
                  {SEARCH_IN_OPTIONS.map((option) => (
                    <label key={option.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.searchIn.includes(option.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              searchIn: [...prev.searchIn, option.id]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              searchIn: prev.searchIn.filter(item => item !== option.id)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Search Options */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.caseSensitive}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        caseSensitive: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Case sensitive</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.wholeWords}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        wholeWords: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Whole words</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.regexMode}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        regexMode: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Regex mode</span>
                  </label>
                </div>
              </div>

              {/* Sort Options */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value as any
                    }))}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order:</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sortOrder: e.target.value as any
                    }))}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </div>
              </div>

              {/* Message Length */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min length:</label>
                  <input
                    type="number"
                    value={filters.minLength}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      minLength: parseInt(e.target.value) || 0
                    }))}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max length:</label>
                  <input
                    type="number"
                    value={filters.maxLength}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      maxLength: parseInt(e.target.value) || 10000
                    }))}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10000"
                  />
                </div>
              </div>

              {/* Content Filters */}
              <div className="space-y-2 mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.hasMentions === true}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      hasMentions: e.target.checked ? true : null
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Has mentions (@username)</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.hasLinks === true}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      hasLinks: e.target.checked ? true : null
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Has links</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.hasEmojis === true}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      hasEmojis: e.target.checked ? true : null
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Has emojis</span>
                </label>
              </div>

              {/* Sentiment and Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment:</label>
                  <select
                    value={filters.sentiment}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sentiment: e.target.value as any
                    }))}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SENTIMENT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language:</label>
                  <select
                    value={filters.language}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      language: e.target.value
                    }))}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
