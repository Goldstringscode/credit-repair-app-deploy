'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Search, 
  ChevronDown,
  X,
  Clock,
  TrendingUp,
  Pin
} from 'lucide-react';

interface QuickResponse {
  id: string;
  text: string;
  category: string;
  usageCount: number;
  lastUsed?: Date;
  isPinned: boolean;
  createdAt: Date;
}

interface QuickResponsesProps {
  responses: QuickResponse[];
  onUseResponse: (response: QuickResponse) => void;
  onCreateResponse: (response: Omit<QuickResponse, 'id' | 'createdAt' | 'usageCount'>) => void;
  onUpdateResponse: (id: string, response: Partial<QuickResponse>) => void;
  onDeleteResponse: (id: string) => void;
  onPinResponse: (id: string) => void;
}

export default function QuickResponses({
  responses,
  onUseResponse,
  onCreateResponse,
  onUpdateResponse,
  onDeleteResponse,
  onPinResponse
}: QuickResponsesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingResponse, setEditingResponse] = useState<QuickResponse | null>(null);
  const [newResponse, setNewResponse] = useState({
    text: '',
    category: 'general',
    isPinned: false
  });

  const categories = ['all', 'general', 'welcome', 'follow-up', 'motivation', 'support', 'sales'];

  const filteredResponses = responses
    .filter(response => {
      const matchesSearch = response.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || response.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Pinned responses first, then by usage count
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.usageCount - a.usageCount;
    });

  const handleCreateResponse = () => {
    if (newResponse.text.trim()) {
      onCreateResponse(newResponse);
      setNewResponse({ text: '', category: 'general', isPinned: false });
      setShowCreateModal(false);
    }
  };

  const handleUseResponse = (response: QuickResponse) => {
    onUseResponse(response);
  };

  const handleCopyResponse = (response: QuickResponse) => {
    navigator.clipboard.writeText(response.text);
    // You could add a toast notification here
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'follow-up': return 'bg-blue-100 text-blue-800';
      case 'motivation': return 'bg-yellow-100 text-yellow-800';
      case 'support': return 'bg-purple-100 text-purple-800';
      case 'sales': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Quick Responses</h3>
            <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
              {filteredResponses.length}
            </span>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Response</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Responses List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredResponses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No responses found</p>
            <p className="text-sm">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first quick response to get started'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredResponses.map((response) => (
              <div key={response.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {response.isPinned && (
                        <Pin className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(response.category)}`}>
                        {response.category}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3" />
                        <span>{response.usageCount}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2 line-clamp-3">
                      {response.text}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {response.lastUsed && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Last used {formatDate(response.lastUsed)}</span>
                        </div>
                      )}
                      <span>Created {formatDate(response.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={() => handleUseResponse(response)}
                      className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      title="Use Response"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onPinResponse(response.id)}
                      className={`p-1 transition-colors ${
                        response.isPinned 
                          ? 'text-yellow-500 hover:text-yellow-600' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      title={response.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setEditingResponse(response)}
                      className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onDeleteResponse(response.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingResponse) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
              setShowCreateModal(false);
              setEditingResponse(null);
              setNewResponse({ text: '', category: 'general', isPinned: false });
            }} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingResponse ? 'Edit Response' : 'New Quick Response'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingResponse(null);
                    setNewResponse({ text: '', category: 'general', isPinned: false });
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Text</label>
                  <textarea
                    value={editingResponse ? editingResponse.text : newResponse.text}
                    onChange={(e) => {
                      if (editingResponse) {
                        setEditingResponse({ ...editingResponse, text: e.target.value });
                      } else {
                        setNewResponse({ ...newResponse, text: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter your quick response text..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingResponse ? editingResponse.category : newResponse.category}
                    onChange={(e) => {
                      if (editingResponse) {
                        setEditingResponse({ ...editingResponse, category: e.target.value });
                      } else {
                        setNewResponse({ ...newResponse, category: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={editingResponse ? editingResponse.isPinned : newResponse.isPinned}
                    onChange={(e) => {
                      if (editingResponse) {
                        setEditingResponse({ ...editingResponse, isPinned: e.target.checked });
                      } else {
                        setNewResponse({ ...newResponse, isPinned: e.target.checked });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPinned" className="ml-2 text-sm text-gray-700">
                    Pin this response (show at top)
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingResponse(null);
                    setNewResponse({ text: '', category: 'general', isPinned: false });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingResponse) {
                      onUpdateResponse(editingResponse.id, editingResponse);
                      setEditingResponse(null);
                    } else {
                      handleCreateResponse();
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  {editingResponse ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
