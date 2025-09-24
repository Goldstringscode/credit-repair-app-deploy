'use client';

import React, { useState } from 'react';
import { 
  Hash, 
  User, 
  Bell, 
  Award, 
  Shield, 
  Plus, 
  Search, 
  Pin, 
  VolumeX, 
  Archive, 
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  MessageCircle,
  Star,
  Lock,
  Globe
} from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  type: 'team' | 'direct' | 'announcement' | 'training' | 'support';
  description?: string;
  members: any[];
  unreadCount: number;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: Date;
  };
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  permissions: {
    canSendMessages: boolean;
    canAddMembers: boolean;
    canManageChannel: boolean;
  };
}

interface ChannelListProps {
  channels: Channel[];
  selectedChannelId?: string;
  onChannelSelect: (channel: Channel) => void;
  onChannelCreate: () => void;
  onChannelSearch: (query: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const getChannelIcon = (type: Channel['type']) => {
  switch (type) {
    case 'team': return <Hash className="w-4 h-4" />;
    case 'direct': return <User className="w-4 h-4" />;
    case 'announcement': return <Bell className="w-4 h-4" />;
    case 'training': return <Award className="w-4 h-4" />;
    case 'support': return <Shield className="w-4 h-4" />;
    default: return <MessageCircle className="w-4 h-4" />;
  }
};

const getChannelTypeColor = (type: Channel['type']) => {
  switch (type) {
    case 'team': return 'text-gray-600';
    case 'direct': return 'text-green-600';
    case 'announcement': return 'text-yellow-600';
    case 'training': return 'text-blue-600';
    case 'support': return 'text-purple-600';
    default: return 'text-gray-600';
  }
};

const formatTime = (date: Date | string | null | undefined) => {
  if (!date) return 'Unknown';
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid date';
  const diff = now.getTime() - dateObj.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return dateObj.toLocaleDateString();
};

export default function ChannelList({
  channels,
  selectedChannelId,
  onChannelSelect,
  onChannelCreate,
  onChannelSearch,
  searchQuery,
  setSearchQuery,
}: ChannelListProps) {
  const [expandedSections, setExpandedSections] = useState({
    pinned: true,
    team: true,
    direct: true,
    archived: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredChannels = channels.filter(channel => {
    if (searchQuery) {
      return channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             channel.description?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const pinnedChannels = filteredChannels.filter(c => c.isPinned && !c.isArchived);
  const teamChannels = filteredChannels.filter(c => c.type === 'team' && !c.isPinned && !c.isArchived);
  const directChannels = filteredChannels.filter(c => c.type === 'direct' && !c.isPinned && !c.isArchived);
  const otherChannels = filteredChannels.filter(c => 
    !['team', 'direct'].includes(c.type) && !c.isPinned && !c.isArchived
  );
  const archivedChannels = filteredChannels.filter(c => c.isArchived);

  const ChannelItem = ({ channel }: { channel: Channel }) => (
    <button
      onClick={() => onChannelSelect(channel)}
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
        selectedChannelId === channel.id
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-md'
          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className={`flex items-center space-x-2 ${getChannelTypeColor(channel.type)}`}>
          {getChannelIcon(channel.type)}
          <span className="font-medium text-gray-900 truncate">
            {channel.type === 'direct' ? channel.name : `#${channel.name}`}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {channel.isPinned && (
            <Pin className="w-3 h-3 text-yellow-500" />
          )}
          {channel.isMuted && (
            <VolumeX className="w-3 h-3 text-gray-400" />
          )}
          {channel.permissions?.canSendMessages === false && (
            <Lock className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        {channel.unreadCount > 0 && (
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {channel.unreadCount}
          </span>
        )}
        {channel.lastMessage && (
          <span className="text-xs text-gray-500 font-medium">
            {formatTime(channel.lastMessage.timestamp)}
          </span>
        )}
      </div>
    </button>
  );

  const SectionHeader = ({ 
    title, 
    count, 
    isExpanded, 
    onToggle, 
    icon 
  }: { 
    title: string; 
    count: number; 
    isExpanded: boolean; 
    onToggle: () => void; 
    icon: React.ReactNode;
  }) => (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full p-3 text-sm font-bold text-gray-700 uppercase tracking-wide hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 hover:scale-105"
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span>{title}</span>
        <span className="text-gray-500">({count})</span>
      </div>
      {isExpanded ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Communications</h1>
          <div className="flex items-center space-x-2">
            <button className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 group">
              <Search className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>
            <button className="p-3 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-105 group">
              <Settings className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels, messages, or people..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onChannelSearch(e.target.value);
            }}
            className="w-full pl-12 pr-4 py-3 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm shadow-sm transition-all duration-200 focus:bg-white focus:shadow-md"
          />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Pinned Channels */}
          {pinnedChannels.length > 0 && (
            <div>
              <SectionHeader
                title="Pinned"
                count={pinnedChannels.length}
                isExpanded={expandedSections.pinned}
                onToggle={() => toggleSection('pinned')}
                icon={<Pin className="w-4 h-4" />}
              />
              {expandedSections.pinned && (
                <div className="mt-2 space-y-1">
                  {pinnedChannels.map((channel) => (
                    <ChannelItem key={channel.id} channel={channel} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Team Channels */}
          {teamChannels.length > 0 && (
            <div>
              <SectionHeader
                title="Team Channels"
                count={teamChannels.length}
                isExpanded={expandedSections.team}
                onToggle={() => toggleSection('team')}
                icon={<Users className="w-4 h-4" />}
              />
              {expandedSections.team && (
                <div className="mt-2 space-y-1">
                  {teamChannels.map((channel) => (
                    <ChannelItem key={channel.id} channel={channel} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Direct Messages */}
          {directChannels.length > 0 && (
            <div>
              <SectionHeader
                title="Direct Messages"
                count={directChannels.length}
                isExpanded={expandedSections.direct}
                onToggle={() => toggleSection('direct')}
                icon={<User className="w-4 h-4" />}
              />
              {expandedSections.direct && (
                <div className="mt-2 space-y-1">
                  {directChannels.map((channel) => (
                    <ChannelItem key={channel.id} channel={channel} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Other Channels */}
          {otherChannels.length > 0 && (
            <div>
              <SectionHeader
                title="Other"
                count={otherChannels.length}
                isExpanded={true}
                onToggle={() => {}}
                icon={<MessageCircle className="w-4 h-4" />}
              />
              <div className="mt-2 space-y-1">
                {otherChannels.map((channel) => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
              </div>
            </div>
          )}

          {/* Archived Channels */}
          {archivedChannels.length > 0 && (
            <div>
              <SectionHeader
                title="Archived"
                count={archivedChannels.length}
                isExpanded={expandedSections.archived}
                onToggle={() => toggleSection('archived')}
                icon={<Archive className="w-4 h-4" />}
              />
              {expandedSections.archived && (
                <div className="mt-2 space-y-1">
                  {archivedChannels.map((channel) => (
                    <ChannelItem key={channel.id} channel={channel} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Channel Button */}
          <button
            onClick={onChannelCreate}
            className="w-full flex items-center space-x-2 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border-2 border-dashed border-gray-200 hover:border-gray-300"
          >
            <Plus className="w-4 h-4" />
            <span>Create Channel</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {channels.length} channels • {channels.reduce((sum, c) => sum + c.unreadCount, 0)} unread
        </div>
      </div>
    </div>
  );
}
