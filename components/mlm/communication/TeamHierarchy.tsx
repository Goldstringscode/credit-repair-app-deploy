'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Crown, 
  Award, 
  Target, 
  TrendingUp, 
  ChevronDown, 
  ChevronRight,
  User,
  UserPlus,
  MessageCircle,
  Phone,
  Video,
  Mail
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rank: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  personalVolume: number;
  teamVolume: number;
  commission: number;
  joinDate: Date;
  children: TeamMember[];
  level: number;
}

interface TeamHierarchyProps {
  members: TeamMember[];
  onMemberSelect: (member: TeamMember) => void;
  onStartDirectMessage: (member: TeamMember) => void;
  onCallMember: (member: TeamMember) => void;
  onVideoCallMember: (member: TeamMember) => void;
  onEmailMember: (member: TeamMember) => void;
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

const getRankIcon = (rank: string) => {
  switch (rank) {
    case 'Diamond': return <Crown className="w-4 h-4 text-blue-600" />;
    case 'Platinum': return <Award className="w-4 h-4 text-purple-600" />;
    case 'Gold': return <Award className="w-4 h-4 text-yellow-600" />;
    case 'Silver': return <Target className="w-4 h-4 text-gray-600" />;
    case 'Bronze': return <Target className="w-4 h-4 text-orange-600" />;
    default: return <User className="w-4 h-4 text-gray-600" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function TeamHierarchy({
  members,
  onMemberSelect,
  onStartDirectMessage,
  onCallMember,
  onVideoCallMember,
  onEmailMember,
}: TeamHierarchyProps) {
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const toggleExpanded = (memberId: string) => {
    setExpandedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member.id);
    onMemberSelect(member);
  };

  const renderMember = (member: TeamMember, depth = 0) => {
    const isExpanded = expandedMembers.has(member.id);
    const isSelected = selectedMember === member.id;
    const hasChildren = member.children && member.children.length > 0;

    return (
      <div key={member.id} className="select-none">
        <div
          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-50 border border-blue-200'
              : 'hover:bg-gray-50'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => handleMemberClick(member)}
        >
          {/* Expand/Collapse Button */}
          <div className="w-6 h-6 flex items-center justify-center">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(member.id);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Avatar */}
          <div className="relative">
            <img
              src={member.avatar || '/default-avatar.png'}
              alt={member.name}
              className="w-10 h-10 rounded-full"
            />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
          </div>

          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {getRankIcon(member.rank)}
              <span className="font-medium text-gray-900 truncate">{member.name}</span>
              <span className={`text-xs ${getRankColor(member.rank)}`}>{member.rank}</span>
            </div>
            <div className="text-sm text-gray-500 truncate">{member.email}</div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>PV: {formatCurrency(member.personalVolume)}</span>
              <span>TV: {formatCurrency(member.teamVolume)}</span>
              <span>Comm: {formatCurrency(member.commission)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartDirectMessage(member);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Send Message"
            >
              <MessageCircle className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCallMember(member);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Call"
            >
              <Phone className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVideoCallMember(member);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Video Call"
            >
              <Video className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEmailMember(member);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Email"
            >
              <Mail className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {member.children.map(child => renderMember(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalMembers = members.length;
  const totalVolume = members.reduce((sum, member) => sum + member.teamVolume, 0);
  const totalCommission = members.reduce((sum, member) => sum + member.commission, 0);
  const onlineMembers = members.filter(member => member.status === 'online').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Team Hierarchy</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{totalMembers} members</span>
            <span>{onlineMembers} online</span>
            <span>{formatCurrency(totalVolume)} total volume</span>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
            <div className="text-sm text-gray-500">Total Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalVolume)}</div>
            <div className="text-sm text-gray-500">Total Volume</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalCommission)}</div>
            <div className="text-sm text-gray-500">Total Commission</div>
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="max-h-96 overflow-y-auto">
        {members.map(member => renderMember(member))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Click on a member to view details</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
            <div className="w-2 h-2 bg-yellow-500 rounded-full ml-2"></div>
            <span>Away</span>
            <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
            <span>Busy</span>
            <div className="w-2 h-2 bg-gray-400 rounded-full ml-2"></div>
            <span>Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
