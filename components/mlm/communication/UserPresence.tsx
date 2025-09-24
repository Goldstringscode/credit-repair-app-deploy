'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  MessageCircle, 
  Phone, 
  Video, 
  UserPlus,
  Crown,
  Shield,
  Star,
  Zap,
  Coffee,
  Moon,
  Gamepad2,
  Headphones,
  Mic,
  Video as VideoIcon,
  AlertCircle,
  Clock
} from 'lucide-react';
import PresenceIndicator from './PresenceIndicator';

interface User {
  id: string;
  name: string;
  avatar?: string;
  rank: string;
  status: 'online' | 'away' | 'busy' | 'offline' | 'invisible';
  activity?: string;
  lastSeen?: Date;
  isTyping?: boolean;
  isInChannel?: boolean;
  isMuted?: boolean;
  isDeafened?: boolean;
  isStreaming?: boolean;
  isRecording?: boolean;
  customStatus?: string;
  timezone?: string;
  joinDate: Date;
  messageCount: number;
  reactionCount: number;
  isModerator?: boolean;
  isAdmin?: boolean;
  isOwner?: boolean;
}

interface UserPresenceProps {
  users: User[];
  currentUserId: string;
  onUserClick: (user: User) => void;
  onStartCall: (user: User) => void;
  onStartVideoCall: (user: User) => void;
  onSendMessage: (user: User) => void;
  onInviteUser: (user: User) => void;
  onMuteUser: (userId: string) => void;
  onKickUser: (userId: string) => void;
  onBanUser: (userId: string) => void;
  onPromoteUser: (userId: string) => void;
  onDemoteUser: (userId: string) => void;
}

const RANK_COLORS = {
  'Bronze': 'text-orange-600',
  'Silver': 'text-gray-500',
  'Gold': 'text-yellow-600',
  'Platinum': 'text-blue-600',
  'Diamond': 'text-purple-600',
  'Master': 'text-pink-600',
  'Grandmaster': 'text-red-600',
  'Champion': 'text-green-600',
  'Legend': 'text-indigo-600'
};

const ACTIVITY_ICONS = {
  'in-meeting': VideoIcon,
  'in-call': Mic,
  'gaming': Gamepad2,
  'listening': Headphones,
  'streaming': VideoIcon,
  'recording': Mic,
  'presenting': VideoIcon,
  'custom': Zap
};

export default function UserPresence({
  users,
  currentUserId,
  onUserClick,
  onStartCall,
  onStartVideoCall,
  onSendMessage,
  onInviteUser,
  onMuteUser,
  onKickUser,
  onBanUser,
  onPromoteUser,
  onDemoteUser
}: UserPresenceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'away' | 'busy' | 'offline'>('all');
  const [sortBy, setSortBy] = useState<'status' | 'name' | 'rank' | 'activity'>('status');
  const [showUserActions, setShowUserActions] = useState<string | null>(null);

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (user.customStatus && user.customStatus.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'status':
          const statusOrder = { online: 0, away: 1, busy: 2, offline: 3, invisible: 4 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rank':
          const rankOrder = { 'Bronze': 0, 'Silver': 1, 'Gold': 2, 'Platinum': 3, 'Diamond': 4, 'Master': 5, 'Grandmaster': 6, 'Champion': 7, 'Legend': 8 };
          return (rankOrder[a.rank as keyof typeof rankOrder] || 0) - (rankOrder[b.rank as keyof typeof rankOrder] || 0);
        case 'activity':
          return (b.activity || '').localeCompare(a.activity || '');
        default:
          return 0;
      }
    });

  const getStatusCounts = () => {
    const counts = { online: 0, away: 0, busy: 0, offline: 0, invisible: 0 };
    users.forEach(user => {
      counts[user.status]++;
    });
    return counts;
  };

  const getRankIcon = (rank: string) => {
    if (rank.includes('Master') || rank.includes('Champion') || rank.includes('Legend')) {
      return <Crown className="w-4 h-4 text-yellow-500" />;
    }
    if (rank.includes('Diamond') || rank.includes('Platinum')) {
      return <Shield className="w-4 h-4 text-blue-500" />;
    }
    return <Star className="w-4 h-4 text-gray-400" />;
  };

  const getActivityIcon = (activity?: string) => {
    if (!activity) return null;
    const IconComponent = ACTIVITY_ICONS[activity as keyof typeof ACTIVITY_ICONS] || ACTIVITY_ICONS.custom;
    return <IconComponent className="w-4 h-4 text-gray-400" />;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onInviteUser({} as User)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Invite User"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2 mb-4">
          {[
            { key: 'all', label: 'All', count: users.length },
            { key: 'online', label: 'Online', count: statusCounts.online },
            { key: 'away', label: 'Away', count: statusCounts.away },
            { key: 'busy', label: 'Busy', count: statusCounts.busy },
            { key: 'offline', label: 'Offline', count: statusCounts.offline }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key as any)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                statusFilter === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="status">Status</option>
            <option value="name">Name</option>
            <option value="rank">Rank</option>
            <option value="activity">Activity</option>
          </select>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Users className="w-8 h-8 mb-2" />
            <p className="text-sm">No members found</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="group relative p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <PresenceIndicator
                      status={user.status}
                      activity={user.activity}
                      lastSeen={user.lastSeen}
                      isTyping={user.isTyping}
                      size="sm"
                      className="absolute -bottom-1 -right-1"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </h4>
                      {getRankIcon(user.rank)}
                      {user.isOwner && <Crown className="w-4 h-4 text-yellow-500" />}
                      {user.isAdmin && <Shield className="w-4 h-4 text-blue-500" />}
                      {user.isModerator && <Star className="w-4 h-4 text-green-500" />}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs font-medium ${RANK_COLORS[user.rank as keyof typeof RANK_COLORS] || 'text-gray-500'}`}>
                        {user.rank}
                      </span>
                      
                      {user.activity && getActivityIcon(user.activity)}
                      
                      {user.customStatus && (
                        <span className="text-xs text-gray-500 truncate">
                          {user.customStatus}
                        </span>
                      )}
                    </div>

                    {/* Activity Indicators */}
                    <div className="flex items-center space-x-2 mt-1">
                      {user.isStreaming && (
                        <div className="flex items-center space-x-1 text-xs text-red-500">
                          <VideoIcon className="w-3 h-3" />
                          <span>Streaming</span>
                        </div>
                      )}
                      
                      {user.isRecording && (
                        <div className="flex items-center space-x-1 text-xs text-orange-500">
                          <Mic className="w-3 h-3" />
                          <span>Recording</span>
                        </div>
                      )}
                      
                      {user.isMuted && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Mic className="w-3 h-3" />
                          <span>Muted</span>
                        </div>
                      )}
                      
                      {user.isDeafened && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Headphones className="w-3 h-3" />
                          <span>Deafened</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onSendMessage(user)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Send Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onStartCall(user)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Voice Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onStartVideoCall(user)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setShowUserActions(showUserActions === user.id ? null : user.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="More Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* User Actions Menu */}
                {showUserActions === user.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onSendMessage(user);
                          setShowUserActions(null);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Send Message</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onStartCall(user);
                          setShowUserActions(null);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Voice Call</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onStartVideoCall(user);
                          setShowUserActions(null);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Video className="w-4 h-4" />
                        <span>Video Call</span>
                      </button>
                      
                      <div className="border-t border-gray-200 my-1" />
                      
                      {user.isMuted ? (
                        <button
                          onClick={() => {
                            onMuteUser(user.id);
                            setShowUserActions(null);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Unmute</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onMuteUser(user.id);
                            setShowUserActions(null);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Mute</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          onKickUser(user.id);
                          setShowUserActions(null);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Kick User</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onBanUser(user.id);
                          setShowUserActions(null);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <X className="w-4 h-4" />
                        <span>Ban User</span>
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
