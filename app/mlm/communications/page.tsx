'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import error handling components to avoid SSR issues
const ErrorBoundary = dynamic(() => import('@/components/error/ErrorBoundary').then(mod => ({ default: mod.ErrorBoundary })), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const CommunicationErrorHandler = dynamic(() => import('@/components/mlm/communication/CommunicationErrorHandler').then(mod => ({ default: mod.CommunicationErrorHandler })), {
  ssr: false,
  loading: () => <div>Loading...</div>
});
import { 
  MessageCircle, 
  Users, 
  Hash, 
  Plus, 
  Search, 
  Bell, 
  Settings, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Star,
  Pin,
  Archive,
  Trash2,
  Edit3,
  Reply,
  Forward,
  Copy,
  Flag,
  Mute,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronRight,
  Crown,
  Award,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Lock,
  Globe,
  X,
  Smartphone,
  FileText,
  BarChart3,
  Eye,
  EyeOff,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Info,
  ThumbsUp,
  Heart,
  Laugh,
  Angry,
  Sad,
  Wow,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Calendar,
  Clock as ClockIcon,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Mail,
  Phone as PhoneIcon,
  MapPin,
  Link,
  Image as ImageIcon,
  File,
  Download,
  Upload,
  Share,
  Bookmark,
  BookmarkCheck,
  Tag,
  Hashtag,
  AtSign,
  DollarSign,
  Percent,
  PieChart,
  Activity,
  TrendingUp as TrendingUpIcon,
  Users2,
  MessageSquare,
  MessageSquarePlus,
  MessageSquareReply,
  MessageSquareForward,
  MessageSquareEdit,
  MessageSquareX,
  MessageSquareCheck,
  MessageSquareWarning,
  MessageSquareQuestion,
  MessageSquareHeart,
  MessageSquareSmile,
  MessageSquareLaugh,
  MessageSquareAngry,
  MessageSquareSad,
  MessageSquareWow,
  MessageSquareThumbsUp,
  MessageSquareThumbsDown,
  MessageSquareStar,
  MessageSquarePin,
  MessageSquareArchive,
  MessageSquareTrash,
  MessageSquareFlag,
  MessageSquareMute,
  MessageSquareVolume,
  MessageSquareVolumeX,
  MessageSquareEye,
  MessageSquareEyeOff,
  MessageSquareLock,
  MessageSquareUnlock,
  MessageSquareShield,
  MessageSquareGlobe,
  MessageSquareLink,
  MessageSquareImage,
  MessageSquareFile,
  MessageSquareDownload,
  MessageSquareUpload,
  MessageSquareShare,
  MessageSquareBookmark,
  MessageSquareTag,
  MessageSquareHashtag,
  MessageSquareAtSign,
  MessageSquareDollar,
  MessageSquarePercent,
  MessageSquareBarChart,
  MessageSquarePieChart,
  MessageSquareActivity,
  MessageSquareTrendingUp,
  MessageSquareUsers,
  MessageSquareUser,
  MessageSquareUserPlus,
  MessageSquareUserMinus,
  MessageSquareUserCheck,
  MessageSquareUserX,
  MessageSquareMail,
  MessageSquarePhone,
  MessageSquareMapPin,
  MessageSquareCalendar,
  MessageSquareClock,
  MessageSquareFilter,
  MessageSquareSort,
  MessageSquareGrid,
  MessageSquareList,
  MessageSquareSearch,
  MessageSquareSettings,
  MessageSquareMore,
  MessageSquareChevronDown,
  MessageSquareChevronRight,
  MessageSquareCrown,
  MessageSquareAward,
  MessageSquareTarget,
  MessageSquareZap,
  MessageSquareShield as MessageSquareShieldIcon,
  MessageSquareLock as MessageSquareLockIcon,
  MessageSquareGlobe as MessageSquareGlobeIcon,
  MessageSquareEye as MessageSquareEyeIcon,
  MessageSquareEyeOff as MessageSquareEyeOffIcon,
  MessageSquareCheck as MessageSquareCheckIcon,
  MessageSquareX as MessageSquareXIcon,
  MessageSquareWarning as MessageSquareWarningIcon,
  MessageSquareQuestion as MessageSquareQuestionIcon,
  MessageSquareHeart as MessageSquareHeartIcon,
  MessageSquareSmile as MessageSquareSmileIcon,
  MessageSquareLaugh as MessageSquareLaughIcon,
  MessageSquareAngry as MessageSquareAngryIcon,
  MessageSquareSad as MessageSquareSadIcon,
  MessageSquareWow as MessageSquareWowIcon,
  MessageSquareThumbsUp as MessageSquareThumbsUpIcon,
  MessageSquareThumbsDown as MessageSquareThumbsDownIcon,
  MessageSquareStar as MessageSquareStarIcon,
  MessageSquarePin as MessageSquarePinIcon,
  MessageSquareArchive as MessageSquareArchiveIcon,
  MessageSquareTrash as MessageSquareTrashIcon,
  MessageSquareFlag as MessageSquareFlagIcon,
  MessageSquareMute as MessageSquareMuteIcon,
  MessageSquareVolume as MessageSquareVolumeIcon,
  MessageSquareVolumeX as MessageSquareVolumeXIcon,
  MessageSquareLock as MessageSquareLockIcon2,
  MessageSquareUnlock as MessageSquareUnlockIcon,
  MessageSquareShield as MessageSquareShieldIcon2,
  MessageSquareGlobe as MessageSquareGlobeIcon2,
  MessageSquareLink as MessageSquareLinkIcon,
  MessageSquareImage as MessageSquareImageIcon,
  MessageSquareFile as MessageSquareFileIcon,
  MessageSquareDownload as MessageSquareDownloadIcon,
  MessageSquareUpload as MessageSquareUploadIcon,
  MessageSquareShare as MessageSquareShareIcon,
  MessageSquareBookmark as MessageSquareBookmarkIcon,
  MessageSquareTag as MessageSquareTagIcon,
  MessageSquareHashtag as MessageSquareHashtagIcon,
  MessageSquareAtSign as MessageSquareAtSignIcon,
  MessageSquareDollar as MessageSquareDollarIcon,
  MessageSquarePercent as MessageSquarePercentIcon,
  MessageSquareBarChart as MessageSquareBarChartIcon,
  MessageSquarePieChart as MessageSquarePieChartIcon,
  MessageSquareActivity as MessageSquareActivityIcon,
  MessageSquareTrendingUp as MessageSquareTrendingUpIcon,
  MessageSquareUsers as MessageSquareUsersIcon,
  MessageSquareUser as MessageSquareUserIcon,
  MessageSquareUserPlus as MessageSquareUserPlusIcon,
  MessageSquareUserMinus as MessageSquareUserMinusIcon,
  MessageSquareUserCheck as MessageSquareUserCheckIcon,
  MessageSquareUserX as MessageSquareUserXIcon,
  MessageSquareMail as MessageSquareMailIcon,
  MessageSquarePhone as MessageSquarePhoneIcon,
  MessageSquareMapPin as MessageSquareMapPinIcon,
  MessageSquareCalendar as MessageSquareCalendarIcon,
  MessageSquareClock as MessageSquareClockIcon,
  MessageSquareFilter as MessageSquareFilterIcon,
  MessageSquareSort as MessageSquareSortIcon,
  MessageSquareGrid as MessageSquareGridIcon,
  MessageSquareList as MessageSquareListIcon,
  MessageSquareSearch as MessageSquareSearchIcon,
  MessageSquareSettings as MessageSquareSettingsIcon,
  MessageSquareMore as MessageSquareMoreIcon,
  MessageSquareChevronDown as MessageSquareChevronDownIcon,
  MessageSquareChevronRight as MessageSquareChevronRightIcon,
  MessageSquareCrown as MessageSquareCrownIcon,
  MessageSquareAward as MessageSquareAwardIcon,
  MessageSquareTarget as MessageSquareTargetIcon,
  MessageSquareZap as MessageSquareZapIcon,
  Plug,
  Mic,
  MicOff
} from 'lucide-react';

import ChannelList from '@/components/mlm/communication/ChannelList';
import MessageBubble from '@/components/mlm/communication/MessageBubble';
import { FileUpload } from '@/components/mlm/communication/FileAttachment';
import MessageTemplates from '@/components/mlm/communication/MessageTemplates';
import QuickResponses from '@/components/mlm/communication/QuickResponses';
import CommunicationAnalytics from '@/components/mlm/communication/CommunicationAnalytics';
import ChannelCreateModal from '@/components/mlm/communication/ChannelCreateModal';
import { TypingIndicator } from '@/components/mlm/communication/TypingIndicator';
import { PresenceIndicator } from '@/components/mlm/communication/PresenceIndicator';
import { MessageStatus } from '@/components/mlm/communication/MessageStatus';
import ThreadView from '@/components/mlm/communication/ThreadView';
import FileUploadModal from '@/components/mlm/communication/FileUploadModal';
import FilePreview from '@/components/mlm/communication/FilePreview';
import SearchModal from '@/components/mlm/communication/SearchModal';
import SearchResults from '@/components/mlm/communication/SearchResults';
import UserPresence from '@/components/mlm/communication/UserPresence';
import PinnedMessages from '@/components/mlm/communication/PinnedMessages';
import StarredMessages from '@/components/mlm/communication/StarredMessages';
import MessageEditModal from '@/components/mlm/communication/MessageEditModal';
import MessageDeleteModal from '@/components/mlm/communication/MessageDeleteModal';
import MessageScheduler from '@/components/mlm/communication/MessageScheduler';
import VoiceMessageModal from '@/components/mlm/communication/VoiceMessageModal';
import { useMLMCommunications } from '@/hooks/useMLMCommunications';

// Phase 4 Components
import AdvancedAnalytics from '@/components/mlm/communication/AdvancedAnalytics';
import MessageEncryption from '@/components/mlm/communication/MessageEncryption';
import PerformanceOptimizer from '@/components/mlm/communication/PerformanceOptimizer';
import MobileOptimizer from '@/components/mlm/communication/MobileOptimizer';
import AccessibilityFeatures from '@/components/mlm/communication/AccessibilityFeatures';
import ModerationTools from '@/components/mlm/communication/ModerationTools';
import IntegrationCapabilities from '@/components/mlm/communication/IntegrationCapabilities';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rank: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
  isTyping?: boolean;
}

interface Channel {
  id: string;
  name: string;
  type: 'team' | 'direct' | 'announcement' | 'training' | 'support';
  description?: string;
  members: User[];
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

interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system' | 'announcement';
  isEdited: boolean;
  isDeleted: boolean;
  reactions: { emoji: string; users: string[] }[];
  replies: Message[];
  attachments?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  isPinned: boolean;
  isFlagged: boolean;
  readBy: { user: User; timestamp: Date }[];
}

interface Team {
  id: string;
  name: string;
  members: User[];
  channels: Channel[];
  hierarchy: {
    level: number;
    parent?: string;
    children: string[];
  };
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    rank: 'Diamond',
    status: 'online',
    lastSeen: new Date(),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    rank: 'Platinum',
    status: 'away',
    lastSeen: new Date(Date.now() - 300000),
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    rank: 'Gold',
    status: 'busy',
    lastSeen: new Date(Date.now() - 600000),
  },
];

const mockChannels: Channel[] = [
  {
    id: '1',
    name: 'general',
    type: 'team',
    description: 'General team discussions',
    members: mockUsers,
    unreadCount: 3,
    lastMessage: {
      content: 'Welcome to the team! 🎉',
      sender: 'John Smith',
      timestamp: new Date(Date.now() - 300000),
    },
    isPinned: true,
    isMuted: false,
    isArchived: false,
    permissions: {
      canSendMessages: true,
      canAddMembers: true,
      canManageChannel: true,
    },
  },
  {
    id: '2',
    name: 'announcements',
    type: 'announcement',
    description: 'Important team announcements',
    members: mockUsers,
    unreadCount: 1,
    lastMessage: {
      content: 'New training session scheduled for next week',
      sender: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 600000),
    },
    isPinned: true,
    isMuted: false,
    isArchived: false,
    permissions: {
      canSendMessages: false,
      canAddMembers: false,
      canManageChannel: false,
    },
  },
  {
    id: '3',
    name: 'training',
    type: 'training',
    description: 'Training materials and discussions',
    members: mockUsers,
    unreadCount: 0,
    lastMessage: {
      content: 'Check out the new training video',
      sender: 'Mike Wilson',
      timestamp: new Date(Date.now() - 900000),
    },
    isPinned: false,
    isMuted: false,
    isArchived: false,
    permissions: {
      canSendMessages: true,
      canAddMembers: false,
      canManageChannel: false,
    },
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Welcome to the team! 🎉',
    sender: mockUsers[0],
    timestamp: new Date(Date.now() - 300000),
    type: 'text',
    isEdited: false,
    isDeleted: false,
    reactions: [
      { emoji: '🎉', users: ['2', '3'] },
      { emoji: '👏', users: ['2'] },
    ],
    replies: [],
    isPinned: false,
    isFlagged: false,
    readBy: [
      { user: mockUsers[1], timestamp: new Date(Date.now() - 250000) },
      { user: mockUsers[2], timestamp: new Date(Date.now() - 200000) },
    ],
  },
  {
    id: '2',
    content: 'Thanks for the warm welcome! Excited to be part of this amazing team.',
    sender: mockUsers[1],
    timestamp: new Date(Date.now() - 250000),
    type: 'text',
    isEdited: false,
    isDeleted: false,
    reactions: [
      { emoji: '❤️', users: ['1'] },
    ],
    replies: [],
    isPinned: false,
    isFlagged: false,
    readBy: [
      { user: mockUsers[0], timestamp: new Date(Date.now() - 200000) },
      { user: mockUsers[2], timestamp: new Date(Date.now() - 150000) },
    ],
  },
  {
    id: '3',
    content: 'Let\'s make this the best MLM team ever! 💪',
    sender: mockUsers[2],
    timestamp: new Date(Date.now() - 200000),
    type: 'text',
    isEdited: false,
    isDeleted: false,
    reactions: [
      { emoji: '💪', users: ['1', '2'] },
      { emoji: '🔥', users: ['1'] },
    ],
    replies: [],
    isPinned: false,
    isFlagged: false,
    readBy: [
      { user: mockUsers[0], timestamp: new Date(Date.now() - 150000) },
      { user: mockUsers[1], timestamp: new Date(Date.now() - 100000) },
    ],
  },
];

function MLMCommunicationsPage() {
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'pinned' | 'flagged'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [showThreadView, setShowThreadView] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [starredMessages, setStarredMessages] = useState<any[]>([]);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Message Scheduling
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState<any[]>([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  
  // Voice Messages
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceCurrentTime, setVoiceCurrentTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  

  // Debug function to add information to the visual debug panel
  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
  };

  // Expose addDebugInfo globally for child components
  useEffect(() => {
    (window as any).addDebugInfo = addDebugInfo;
    return () => {
      delete (window as any).addDebugInfo;
    };
  }, []);

  // Phase 4 State Variables
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showMessageEncryption, setShowMessageEncryption] = useState(false);
  const [showPerformanceOptimizer, setShowPerformanceOptimizer] = useState(false);
  const [showMobileOptimizer, setShowMobileOptimizer] = useState(false);
  const [showAccessibilityFeatures, setShowAccessibilityFeatures] = useState(false);
  const [showModerationTools, setShowModerationTools] = useState(false);
  const [showIntegrationCapabilities, setShowIntegrationCapabilities] = useState(false);
  
  // Phase 4 Settings
  const [encryptionSettings, setEncryptionSettings] = useState<any>(null);
  const [performanceSettings, setPerformanceSettings] = useState<any>(null);
  const [mobileSettings, setMobileSettings] = useState<any>(null);
  const [accessibilitySettings, setAccessibilitySettings] = useState<any>(null);
  const [moderationSettings, setModerationSettings] = useState<any>(null);
  const [integrationSettings, setIntegrationSettings] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Mock data for templates and quick responses
  const mockTemplates = [
    {
      id: '1',
      name: 'Welcome New Team Member',
      category: 'welcome',
      subject: 'Welcome to {{team_name}}!',
      content: 'Welcome {{member_name}}! 🎉 We\'re excited to have you join {{team_name}}. Your sponsor {{sponsor_name}} will be your guide as you start your journey with us.',
      variables: ['member_name', 'team_name', 'sponsor_name'],
      isSystem: true,
      usageCount: 25,
      lastUsed: new Date('2024-01-15'),
      createdBy: 'system',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Achievement Celebration',
      category: 'achievement',
      subject: 'Congratulations on {{achievement_type}}!',
      content: 'Congratulations {{member_name}}! 🏆 You\'ve achieved {{achievement_type}} and earned {{reward_amount}}. Keep up the amazing work!',
      variables: ['member_name', 'achievement_type', 'reward_amount'],
      isSystem: true,
      usageCount: 18,
      lastUsed: new Date('2024-01-14'),
      createdBy: 'system',
      createdAt: new Date('2024-01-01')
    }
  ];

  const mockQuickResponses = [
    {
      id: '1',
      text: 'Thanks for reaching out! I\'ll get back to you soon.',
      category: 'general',
      usageCount: 12,
      lastUsed: new Date('2024-01-15'),
      isPinned: true,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      text: 'Great job on your progress! Keep up the excellent work! 💪',
      category: 'motivation',
      usageCount: 8,
      lastUsed: new Date('2024-01-14'),
      isPinned: false,
      createdAt: new Date('2024-01-02')
    }
  ];

  // Mock analytics data
  const mockAnalyticsData = {
    totalMessages: 15420,
    totalChannels: 12,
    activeUsers: 89,
    responseTime: 15, // minutes
    engagementRate: 78,
    topChannels: [
      { id: '1', name: 'general', messageCount: 3420, userCount: 45 },
      { id: '2', name: 'announcements', messageCount: 2890, userCount: 89 },
      { id: '3', name: 'training', messageCount: 2100, userCount: 32 },
      { id: '4', name: 'support', messageCount: 1850, userCount: 28 }
    ],
    topUsers: [
      { id: '1', name: 'John Smith', messageCount: 1250, rank: 'Diamond' },
      { id: '2', name: 'Sarah Johnson', messageCount: 980, rank: 'Platinum' },
      { id: '3', name: 'Mike Wilson', messageCount: 850, rank: 'Gold' },
      { id: '4', name: 'Lisa Brown', messageCount: 720, rank: 'Silver' }
    ],
    dailyActivity: [
      { date: '2024-01-08', messages: 120, users: 45 },
      { date: '2024-01-09', messages: 180, users: 52 },
      { date: '2024-01-10', messages: 150, users: 48 },
      { date: '2024-01-11', messages: 220, users: 61 },
      { date: '2024-01-12', messages: 190, users: 55 },
      { date: '2024-01-13', messages: 160, users: 49 },
      { date: '2024-01-14', messages: 200, users: 58 }
    ],
    messageTypes: [
      { type: 'text', count: 12000, percentage: 78 },
      { type: 'image', count: 2100, percentage: 14 },
      { type: 'file', count: 800, percentage: 5 },
      { type: 'system', count: 520, percentage: 3 }
    ],
    teamPerformance: [
      { teamId: '1', teamName: 'Alpha Warriors', totalMessages: 4200, activeMembers: 25, engagementScore: 85 },
      { teamId: '2', teamName: 'Beta Builders', totalMessages: 3800, activeMembers: 22, engagementScore: 78 },
      { teamId: '3', teamName: 'Gamma Leaders', totalMessages: 3200, activeMembers: 18, engagementScore: 72 },
      { teamId: '4', teamName: 'Delta Achievers', totalMessages: 2800, activeMembers: 16, engagementScore: 68 }
    ]
  };

  // Use the MLM Communications hook
  const {
    channels,
    messages,
    selectedChannel,
    users,
    isConnected,
    isConnecting,
    isLoading,
    error,
    typingUsers,
    onlineUsers,
    messageStatuses,
    sendMessage,
    addReaction,
    selectChannel,
    loadChannels,
    loadMessages,
    sendTypingIndicator,
    setError,
    clearCache,
    forceUpdate,
  } = useMLMCommunications();

  console.log('🚀 MLMCommunicationsPage - hooks loaded:', {
    channels: channels?.length,
    selectedChannel: selectedChannel?.id,
    messages: messages?.length,
    sendMessage: typeof sendMessage,
    newMessage,
    attachedFiles: attachedFiles.length,
    forceUpdate
  });
  
  console.log('🚀 MLMCommunicationsPage - messages:', messages);
  console.log('🚀 MLMCommunicationsPage - selectedChannel:', selectedChannel);
  console.log('🚀 MLMCommunicationsPage - channels:', channels);
  console.log('🚀 MLMCommunicationsPage - channels type:', typeof channels);
  console.log('🚀 MLMCommunicationsPage - channels is array:', Array.isArray(channels));

  // Track channels changes in component
  useEffect(() => {
    console.log('🎯 Component - channels changed:', channels);
    console.log('🎯 Component - channels length:', channels?.length);
    console.log('🎯 Component - channels type:', typeof channels);
    console.log('🎯 Component - channels is array:', Array.isArray(channels));
    if (channels && channels.length > 0) {
      console.log('🎯 Component - First channel:', channels[0]);
    }
  }, [channels]);

  // Track forceUpdate changes
  useEffect(() => {
    console.log('🎯 Component - forceUpdate changed:', forceUpdate);
    console.log('🎯 Component - channels at forceUpdate:', channels);
  }, [forceUpdate, channels]);

  // Force load channels if they're empty
  useEffect(() => {
    if (channels.length === 0) {
      console.log('🎯 Component - No channels, calling loadChannels');
      loadChannels();
    }
  }, [channels.length, loadChannels]);

  // Test direct channel loading
  useEffect(() => {
    console.log('🎯 Component - Testing direct channel loading');
    loadChannels();
  }, [loadChannels]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load scheduled messages when channel changes
  useEffect(() => {
    if (selectedChannel) {
      loadScheduledMessages();
    }
  }, [selectedChannel]);

  // Handle typing indicator
  useEffect(() => {
    if (selectedChannel) {
      if (newMessage.length > 0) {
        sendTypingIndicator(selectedChannel.id, true);
      } else {
        sendTypingIndicator(selectedChannel.id, false);
      }
    }
  }, [newMessage, sendTypingIndicator, selectedChannel]);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('⌨️ handleKeyPress called with key:', e.key);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('⌨️ Enter key - calling handleSendMessage');
      handleSendMessage();
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };

  const handleFileSelect = (files: File[]) => {
    console.log('📎 handleFileSelect called with files:', files);
    console.log('📎 Current attachedFiles before adding:', attachedFiles);
    setAttachedFiles(prev => {
      const newFiles = [...prev, ...files];
      console.log('📎 New attachedFiles after adding:', newFiles);
      return newFiles;
    });
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUseTemplate = (template: any) => {
    setNewMessage(template.content);
    setShowTemplates(false);
  };

  const handleUseQuickResponse = (response: any) => {
    setNewMessage(response.text);
    setShowQuickResponses(false);
  };

  const handleExportAnalytics = (format: 'csv' | 'pdf' | 'json') => {
    console.log(`Exporting analytics as ${format}`);
    // In a real implementation, you would generate and download the file
  };

  const handleOpenThread = (messageId: string) => {
    // In a real implementation, you would fetch the thread data
    const mockThread = {
      id: `thread-${messageId}`,
      parentMessage: messages.find(m => m.id === messageId),
      replies: [], // Mock replies
      participants: users.slice(0, 3) // Mock participants
    };
    setSelectedThread(mockThread);
    setShowThreadView(true);
  };

  const handleCloseThread = () => {
    setShowThreadView(false);
    setSelectedThread(null);
  };

  const handleThreadReply = async (parentId: string, content: string, attachments: File[]) => {
    // In a real implementation, you would send the reply to the server
    console.log('Sending thread reply:', { parentId, content, attachments });
    // Mock: Add reply to thread
    if (selectedThread) {
      const newReply = {
        id: `reply-${Date.now()}`,
        content,
        sender: users[0], // Mock current user
        timestamp: new Date(),
        type: 'text' as const,
        isEdited: false,
        isDeleted: false,
        reactions: [],
        isPinned: false,
        isFlagged: false,
        readBy: []
      };
      // Update thread with new reply
      setSelectedThread(prev => ({
        ...prev,
        replies: [...prev.replies, newReply]
      }));
    }
  };

  const handleFileUpload = (files: File[]) => {
    setAttachedFiles(prev => [...prev, ...files]);
    setShowFileUploadModal(false);
  };

  const handleFilePreview = (file: any) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  const handleFileDownload = (file: any) => {
    // In a real implementation, you would trigger the download
    console.log('Downloading file:', file);
    // Mock download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = (query: string, filters: any) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    
    // Mock search results - in a real implementation, you would call an API
    const mockResults = messages
      .filter(message => {
        // Simple text search
        if (!message.content.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }
        
        // Apply filters
        if (filters.channels.length > 0 && !filters.channels.includes(message.channelId)) {
          return false;
        }
        
        if (filters.users.length > 0 && !filters.users.includes(message.sender.id)) {
          return false;
        }
        
        if (filters.messageTypes.length > 0 && !filters.messageTypes.includes(message.type)) {
          return false;
        }
        
        if (filters.hasAttachments && (!message.attachments || message.attachments.length === 0)) {
          return false;
        }
        
        if (filters.hasReactions && (!message.reactions || message.reactions.length === 0)) {
          return false;
        }
        
        if (filters.isPinned && !message.isPinned) {
          return false;
        }
        
        if (filters.isFlagged && !message.isFlagged) {
          return false;
        }
        
        return true;
      })
      .map(message => ({
        ...message,
        channel: channels.find(c => c.id === message.channelId) || { name: 'Unknown Channel' }
      }));
    
    setSearchResults(mockResults);
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (message: any) => {
    // Switch to the channel containing the message
    const channel = channels.find(c => c.id === message.channelId);
    if (channel) {
      selectChannel(channel);
      setShowSearchResults(false);
      // In a real implementation, you would scroll to the specific message
    }
  };

  const handlePinMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      const pinnedMessage = {
        ...message,
        pinnedBy: users[0], // Mock current user
        pinnedAt: new Date(),
        channel: selectedChannel
      };
      setPinnedMessages(prev => [...prev, pinnedMessage]);
      console.log('Message pinned:', messageId);
    }
  };

  const handleUnpinMessage = (messageId: string) => {
    setPinnedMessages(prev => prev.filter(m => m.id !== messageId));
    console.log('Message unpinned:', messageId);
  };

  const handleStarMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      const starredMessage = {
        ...message,
        starredBy: users[0], // Mock current user
        starredAt: new Date(),
        channel: selectedChannel
      };
      setStarredMessages(prev => [...prev, starredMessage]);
      console.log('Message starred:', messageId);
    }
  };

  const handleUnstarMessage = (messageId: string) => {
    setStarredMessages(prev => prev.filter(m => m.id !== messageId));
    console.log('Message unstarred:', messageId);
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessage(message);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async (content: string) => {
    if (!editingMessage) return;
    
    setIsEditing(true);
    try {
      // In a real implementation, you would call an API to update the message
      console.log('Saving edited message:', editingMessage.id, content);
      
      // Mock: Update the message in the local state
      // In a real implementation, this would be handled by the API response
      
      setShowEditModal(false);
      setEditingMessage(null);
    } catch (error) {
      console.error('Failed to save edited message:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setDeletingMessage(message);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMessage) return;
    
    setIsDeleting(true);
    try {
      // In a real implementation, you would call an API to delete the message
      console.log('Deleting message:', deletingMessage.id);
      
      // Mock: Remove the message from the local state
      // In a real implementation, this would be handled by the API response
      
      setShowDeleteModal(false);
      setDeletingMessage(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateChannel = async (channelData: any) => {
    try {
      console.log('Creating channel:', channelData);
      
      // In a real implementation, you would call the API to create the channel
      // For now, we'll add it to the local state
      const newChannel = {
        id: `channel-${Date.now()}`,
        name: channelData.name,
        type: channelData.type,
        description: channelData.description,
        isPrivate: channelData.isPrivate,
        memberCount: channelData.members.length,
        lastMessage: null,
        unreadCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: channelData.permissions,
        members: channelData.members
      };

      // Add to channels list (this would normally be handled by the API)
      console.log('Channel created successfully:', newChannel);
      
      // Show success message
      alert(`Channel "#${channelData.name}" created successfully!`);
      
    } catch (error) {
      console.error('Failed to create channel:', error);
      alert('Failed to create channel. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    console.log('🎯 handleSendMessage called with:', { 
      newMessage, 
      attachedFiles: attachedFiles.length, 
      selectedChannel: selectedChannel,
      selectedChannelId: selectedChannel?.id,
      selectedChannelType: typeof selectedChannel
    });
    
    if (!newMessage.trim() && attachedFiles.length === 0) {
      console.log('❌ handleSendMessage: No message or files, returning early');
      return;
    }

    try {
      console.log('🔄 handleSendMessage: Starting upload process');
      setIsUploading(true);
      
      // Upload files first if any
      const uploadedAttachments = [];
      for (const file of attachedFiles) {
        try {
          // Upload file to server
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/upload/message-attachment', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const uploadResult = await response.json();
            console.log('📤 File upload successful:', {
              name: file.name,
              size: file.size,
              type: file.type,
              uploadResult
            });
            uploadedAttachments.push({
              name: file.name,
              type: file.type,
              size: file.size,
              url: uploadResult.url
            });
          } else {
            const errorText = await response.text();
            console.error('Failed to upload file:', file.name, 'Status:', response.status, 'Error:', errorText);
            // Fallback to temporary URL
            uploadedAttachments.push({
              name: file.name,
              type: file.type,
              size: file.size,
              url: URL.createObjectURL(file)
            });
          }
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          // Fallback to temporary URL
          console.log('📤 Using fallback for file:', {
            name: file.name,
            size: file.size,
            type: file.type,
            fileType: typeof file,
            isFile: file instanceof File,
            isBlob: file instanceof Blob
          });
          
          // Only use URL.createObjectURL if it's a valid File or Blob
          if (file instanceof File || file instanceof Blob) {
            uploadedAttachments.push({
              name: file.name || 'Unknown file',
              type: file.type || 'application/octet-stream',
              size: file.size || 0,
              url: URL.createObjectURL(file)
            });
          } else {
            console.error('File is not a valid File or Blob object:', file);
            // Skip this file
          }
        }
      }

      // Send message with attachments
      const channelId = selectedChannel?.id || '';
      console.log('📤 handleSendMessage: Calling sendMessage with:', {
        channelId: channelId,
        channelIdType: typeof channelId,
        content: newMessage,
        type: 'text',
        attachments: uploadedAttachments,
        selectedChannel: selectedChannel
      });
      
      await sendMessage(channelId, newMessage, 'text', uploadedAttachments);
      
      console.log('✅ handleSendMessage: sendMessage completed successfully');
      
      setNewMessage('');
      setAttachedFiles([]);
      setShowFileUpload(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return 'Unknown';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if dateObj is valid
    if (!dateObj || isNaN(dateObj.getTime())) {
      return 'Invalid time';
    }
    
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if dateObj is valid
    if (!dateObj || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return dateObj.toLocaleDateString();
  };

  // Phase 4 Handlers
  const handleEncryptionSave = (settings: any) => {
    setEncryptionSettings(settings);
    console.log('Encryption settings saved:', settings);
  };

  const handlePerformanceSave = (settings: any) => {
    setPerformanceSettings(settings);
    console.log('Performance settings saved:', settings);
  };

  const handleMobileSave = (settings: any) => {
    setMobileSettings(settings);
    console.log('Mobile settings saved:', settings);
  };

  const handleAccessibilitySave = (settings: any) => {
    setAccessibilitySettings(settings);
    console.log('Accessibility settings saved:', settings);
  };

  const handleModerationSave = (settings: any) => {
    setModerationSettings(settings);
    console.log('Moderation settings saved:', settings);
  };

  const handleIntegrationSave = (integrations: any) => {
    setIntegrationSettings(integrations);
    console.log('Integration settings saved:', integrations);
  };

  // Message Scheduling Handlers
  const handleScheduleMessage = async (scheduledData: any) => {
    try {
      console.log('📅 Scheduling message:', scheduledData);
      
      const response = await fetch('/api/mlm/communication/scheduled-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scheduledData,
          userId: '550e8400-e29b-41d4-a716-446655440000'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Message scheduled successfully:', result.data);
        
        // Refresh scheduled messages list
        loadScheduledMessages();
        
        // Show success message
        alert('Message scheduled successfully!');
      } else {
        const error = await response.json();
        console.error('❌ Failed to schedule message:', error);
        alert('Failed to schedule message. Please try again.');
      }
    } catch (error) {
      console.error('Error scheduling message:', error);
      alert('Error scheduling message. Please try again.');
    }
  };

  const loadScheduledMessages = async () => {
    if (!selectedChannel) return;
    
    setIsLoadingScheduled(true);
    try {
      const response = await fetch(`/api/mlm/communication/scheduled-messages?userId=550e8400-e29b-41d4-a716-446655440000&channelId=${selectedChannel.id}`);
      
      if (response.ok) {
        const result = await response.json();
        setScheduledMessages(result.data || []);
      }
    } catch (error) {
      console.error('Error loading scheduled messages:', error);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  const handleCancelScheduled = async (messageId: string) => {
    try {
      const response = await fetch(`/api/mlm/communication/scheduled-messages?messageId=${messageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log('✅ Scheduled message cancelled');
        loadScheduledMessages();
      } else {
        console.error('❌ Failed to cancel scheduled message');
      }
    } catch (error) {
      console.error('Error cancelling scheduled message:', error);
    }
  };

  const handleEditScheduled = async (messageId: string, updates: any) => {
    try {
      const response = await fetch('/api/mlm/communication/scheduled-messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, updates })
      });

      if (response.ok) {
        console.log('✅ Scheduled message updated');
        loadScheduledMessages();
      } else {
        console.error('❌ Failed to update scheduled message');
      }
    } catch (error) {
      console.error('Error updating scheduled message:', error);
    }
  };

  // Voice Message Handlers
  const handleStartRecording = () => {
    console.log('🎤 handleStartRecording called - setting isRecording to true');
    // Reset previous voice message state
    setVoiceBlob(null);
    setVoiceDuration(0);
    setIsPlayingVoice(false);
    setVoiceCurrentTime(0);
    setIsRecording(true);
    console.log('🎤 Started recording voice message');
  };

  const handleStopRecording = (audioBlob?: Blob, duration?: number) => {
    setIsRecording(false);
    if (audioBlob) {
      setVoiceBlob(audioBlob);
      setVoiceDuration(duration || 0);
    }
    console.log('🎤 Stopped recording voice message');
  };

  const handleSendRecording = async (audioBlob: Blob, duration: number) => {
    if (!selectedChannel) return

    console.log('✅ handleSendRecording called', {
      channel: selectedChannel.id,
      duration: duration,
      blobSize: audioBlob.size
    });

    console.log('🎤🎤🎤 handleSendRecording CALLED! 🎤🎤🎤', { blob: audioBlob, duration, channelId: selectedChannel.id })
    

    try {
      // Convert blob to base64 for storage
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Data = reader.result as string
        console.log('🎤 Base64 conversion result:', { 
          length: base64Data.length, 
          startsWithData: base64Data.startsWith('data:'),
          mimeType: base64Data.substring(0, 50),
          urlPrefix: base64Data.substring(0, 100)
        })
        
            // Create voice message attachment with base64 data
            const voiceAttachment = {
              id: `voice-attachment-${Date.now()}`,
              name: 'voice-message.webm',
              type: audioBlob.type,
              size: audioBlob.size,
              url: base64Data, // This is already a data URL from readAsDataURL
              duration: duration
            }
            
            console.log('📎 Voice attachment created', {
              urlType: base64Data.startsWith('data:') ? 'DATA URL' : 'OTHER',
              urlStart: base64Data.substring(0, 30) + '...',
              size: audioBlob.size
            });
            
            console.log('🎤 Voice attachment created:', voiceAttachment)
        
        // Send voice message via regular POST endpoint
        const response = await fetch('/api/mlm/communication/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channelId: selectedChannel.id,
            userId: '550e8400-e29b-41d4-a716-446655440000', // TODO: Get from auth
            content: `🎤 Voice message (${duration}s)`,
            messageType: 'audio',
            attachments: [voiceAttachment]
          })
        })

        console.log('🎤 API response:', { status: response.status, ok: response.ok })

        if (response.ok) {
          const data = await response.json()
          
          console.log('✅ API success', {
            messageId: data.data?.id,
            status: response.status
          });
          
          console.log('🎤 Voice message saved successfully:', data)
          
          // Clear recording state immediately to prevent showing blob URL
          setVoiceBlob(null)
          setVoiceDuration(0)
          
          // Reload messages to show the new voice message
          await loadMessages(selectedChannel.id)
          
        } else {
          const errorText = await response.text()
          console.log('🎤 Failed to send voice message:', { status: response.status, error: errorText })
        }
      }
      reader.onerror = (error) => {
        console.error('🎤 FileReader error:', error)
      }
      reader.readAsDataURL(audioBlob)
    } catch (error) {
      console.error('🎤 Error in handleSendRecording:', error)
    }
  }


  const handleCancelVoiceRecording = () => {
    setIsRecording(false);
    setVoiceBlob(null);
    setVoiceDuration(0);
    setVoiceCurrentTime(0);
    setIsPlayingVoice(false);
    console.log('🎤 Cancelled voice recording');
  };

  const handlePlayVoice = () => {
    setIsPlayingVoice(true);
    console.log('🎤 Playing voice message');
  };

  const handlePauseVoice = () => {
    setIsPlayingVoice(false);
    console.log('🎤 Paused voice message');
  };

  const handleDeleteVoice = () => {
    setVoiceBlob(null);
    setVoiceDuration(0);
    setVoiceCurrentTime(0);
    setIsPlayingVoice(false);
    console.log('🎤 Deleted voice message');
  };


  // Message Translation Handlers
  const handleTranslateMessage = async (messageId: string, targetLanguage: string) => {
    try {
      console.log('🌐 Translating message:', messageId, 'to', targetLanguage);
      
      const response = await fetch('/api/mlm/communication/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          text: messages.find(m => m.id === messageId)?.content || '',
          targetLanguage,
          userId: '550e8400-e29b-41d4-a716-446655440000'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Translation completed:', result.data);
        return result.data;
      } else {
        const error = await response.json();
        console.error('❌ Translation failed:', error);
        throw new Error(error.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Error translating message:', error);
      throw error;
    }
  };

  const handleSetUserLanguage = (language: string) => {
    console.log('🌐 User language set to:', language);
    // In a real implementation, you would save this to user preferences
    localStorage.setItem('userLanguage', language);
  };

  const handleAdvancedAnalyticsExport = (format: string) => {
    console.log('Exporting advanced analytics as:', format);
    // In a real implementation, you would generate and download the file
  };

  const getStatusColor = (status: User['status']) => {
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Channel List Sidebar - Hidden on mobile when user list is open */}
      <div className={`${showUserList ? 'hidden' : 'flex'} lg:flex w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 flex-col shadow-xl`}>
        <ChannelList
          channels={channels}
          selectedChannelId={selectedChannel?.id}
          onChannelSelect={selectChannel}
          onChannelCreate={() => setShowCreateChannel(true)}
          onChannelSearch={setSearchQuery}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/60 backdrop-blur-sm">
        {showPinnedMessages ? (
          <PinnedMessages
            pinnedMessages={pinnedMessages}
            currentUserId="550e8400-e29b-41d4-a716-446655440000"
            onUnpin={handleUnpinMessage}
            onMessageClick={(message) => {
              const channel = channels.find(c => c.id === message.channel.id);
              if (channel) {
                selectChannel(channel);
                setShowPinnedMessages(false);
              }
            }}
            onReaction={handleReaction}
            onReply={(messageId) => console.log('Reply to:', messageId)}
            onEdit={(messageId) => console.log('Edit message:', messageId)}
            onDelete={(messageId) => console.log('Delete message:', messageId)}
            onPin={handlePinMessage}
            onFlag={(messageId) => console.log('Flag message:', messageId)}
          />
        ) : showStarredMessages ? (
          <StarredMessages
            starredMessages={starredMessages}
            currentUserId="550e8400-e29b-41d4-a716-446655440000"
            onUnstar={handleUnstarMessage}
            onMessageClick={(message) => {
              const channel = channels.find(c => c.id === message.channel.id);
              if (channel) {
                selectChannel(channel);
                setShowStarredMessages(false);
              }
            }}
            onReaction={handleReaction}
            onReply={(messageId) => console.log('Reply to:', messageId)}
            onEdit={(messageId) => console.log('Edit message:', messageId)}
            onDelete={(messageId) => console.log('Delete message:', messageId)}
            onPin={handlePinMessage}
            onFlag={(messageId) => console.log('Flag message:', messageId)}
          />
        ) : showSearchResults ? (
          <SearchResults
            query={searchQuery}
            filters={searchFilters}
            results={searchResults}
            onClose={() => setShowSearchResults(false)}
            onMessageClick={handleSearchResultClick}
            onReaction={handleReaction}
            onReply={(messageId) => console.log('Reply to:', messageId)}
            onEdit={(messageId) => console.log('Edit message:', messageId)}
            onDelete={(messageId) => console.log('Delete message:', messageId)}
            onPin={(messageId) => console.log('Pin message:', messageId)}
            onFlag={(messageId) => console.log('Flag message:', messageId)}
          />
        ) : showThreadView && selectedThread ? (
          <ThreadView
            thread={selectedThread}
            currentUserId="550e8400-e29b-41d4-a716-446655440000"
            onClose={handleCloseThread}
            onReply={handleThreadReply}
            onReaction={handleReaction}
            onEdit={(messageId) => console.log('Edit message:', messageId)}
            onDelete={(messageId) => console.log('Delete message:', messageId)}
            onPin={(messageId) => console.log('Pin message:', messageId)}
            onFlag={(messageId) => console.log('Flag message:', messageId)}
          />
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading communication system...</h3>
              <p className="text-gray-500">Please wait while we load your channels and messages</p>
            </div>
          </div>
        ) : selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                    {getChannelIcon(selectedChannel.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-gray-900 truncate">#{selectedChannel.name}</h2>
                    <p className="text-sm text-gray-600 truncate">{selectedChannel.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setShowUserList(!showUserList)}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 lg:hidden hover:scale-105"
                    title="Menu"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 group"
                    title="Search Messages"
                  >
                    <Search className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  </button>
                  <button className="p-3 hover:bg-green-50 rounded-xl transition-all duration-200 hidden sm:block hover:scale-105 group">
                    <Phone className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                  </button>
                  <button className="p-3 hover:bg-purple-50 rounded-xl transition-all duration-200 hidden sm:block hover:scale-105 group">
                    <Video className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                  </button>
                  <button
                    onClick={() => setShowUserList(!showUserList)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden lg:block"
                    title="Members"
                  >
                    <Users className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowPinnedMessages(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Pinned Messages"
                  >
                    <Pin className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowStarredMessages(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Starred Messages"
                  >
                    <Star className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Analytics"
                  >
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                  </button>
                  {process.env.NODE_ENV === 'development' && (
                    <button 
                      onClick={clearCache}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Clear Cache (Dev Only)"
                    >
                      <span className="text-red-600">🧹</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setShowChannelSettings(!showChannelSettings)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* Phase 4 Buttons */}
                  <button
                    onClick={() => setShowAdvancedAnalytics(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Advanced Analytics"
                  >
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowMessageEncryption(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Message Encryption"
                  >
                    <Shield className="w-5 h-5 text-green-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowPerformanceOptimizer(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Performance Optimizer"
                  >
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowMobileOptimizer(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Mobile Optimizer"
                  >
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowAccessibilityFeatures(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Accessibility Features"
                  >
                    <Eye className="w-5 h-5 text-indigo-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowModerationTools(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Moderation Tools"
                  >
                    <Shield className="w-5 h-5 text-red-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowIntegrationCapabilities(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Integration Capabilities"
                  >
                    <Plug className="w-5 h-5 text-orange-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-gray-50/30">
              {messages.map((message, index) => {
                
                console.log('🔍 Rendering message:', {
                  id: message.id,
                  hasSender: !!message.sender,
                  sender: message.sender,
                  messageKeys: Object.keys(message)
                });
                
                const showDate = index === 0 || 
                  formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
                
                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="flex items-center justify-center my-6">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 text-sm px-4 py-2 rounded-full border border-gray-200/50 shadow-sm">
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                    )}
                    
                    <MessageBubble
                      message={message}
                      isOwn={message.sender?.id === '550e8400-e29b-41d4-a716-446655440000'} // Current user ID
                      currentUserLanguage="en"
                      onReaction={handleReaction}
                      onReply={handleOpenThread}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                      onPin={handlePinMessage}
                      onFlag={(messageId) => console.log('Flag:', messageId)}
                      onTranslate={handleTranslateMessage}
                      onSetLanguage={handleSetUserLanguage}
                    />
                  </div>
                );
              })}
              
              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <TypingIndicator
                  channelId={selectedChannel?.id || ''}
                  typingUsers={typingUsers}
                  currentUserId="550e8400-e29b-41d4-a716-446655440000"
                />
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 p-6 shadow-lg">
              {/* File Upload Area */}
              <div className="mb-4">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  maxFiles={5}
                  maxSize={10}
                  disabled={isUploading}
                />
              </div>


              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="relative bg-gray-100 border border-gray-200 rounded-lg p-2 flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
                          📎
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-2 lg:space-x-3">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowFileUploadModal(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Attach Files"
                  >
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                    title="Message Templates"
                  >
                    <FileText className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowQuickResponses(!showQuickResponses)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                    title="Quick Responses"
                  >
                    <Zap className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowScheduler(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Schedule Message"
                  >
                    <Clock className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  
                </div>
                
                <div className="flex-1 relative">
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => {
                      console.log('📝 Textarea changed:', e.target.value);
                      setNewMessage(e.target.value);
                      
                      // Clear existing timeout
                      if (typingTimeout) {
                        clearTimeout(typingTimeout);
                      }
                      
                      // Send typing indicator
                      if (selectedChannel && e.target.value.trim()) {
                        sendTypingIndicator(selectedChannel.id, true);
                        
                        // Set timeout to stop typing after 3 seconds
                        const timeout = setTimeout(() => {
                          sendTypingIndicator(selectedChannel.id, false);
                        }, 3000);
                        setTypingTimeout(timeout);
                      } else if (selectedChannel) {
                        // Stop typing if message is empty
                        sendTypingIndicator(selectedChannel.id, false);
                      }
                    }}
                    onKeyPress={(e) => {
                      console.log('⌨️ Key pressed:', e.key);
                      handleKeyPress(e);
                    }}
                    placeholder={`Message #${selectedChannel.name}`}
                    className="w-full px-6 py-4 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50/50 backdrop-blur-sm shadow-sm transition-all duration-200 focus:bg-white focus:shadow-md"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                  
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                {/* Voice Message Button */}
                <button
                  onClick={() => {
                    console.log('🎤 Microphone button clicked!');
                    setShowVoiceModal(true);
                  }}
                  className="p-3 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-2xl transition-all duration-200 hover:scale-105 mr-2"
                  title="Voice Messages Coming Soon"
                >
                  <Mic className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={() => {
                    console.log('🔘 Send button clicked!');
                    console.log('🔘 Button state:', {
                      newMessage: newMessage.trim(),
                      attachedFiles: attachedFiles.length,
                      isUploading,
                      disabled: (!newMessage.trim() && attachedFiles.length === 0) || isUploading
                    });
                    handleSendMessage();
                  }}
                  disabled={(!newMessage.trim() && attachedFiles.length === 0) || isUploading}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
                  title={`Send message (disabled: ${(!newMessage.trim() && attachedFiles.length === 0) || isUploading})`}
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {typingUsers.size > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  {Array.from(typingUsers).map(userId => {
                    const user = users.find(u => u.id === userId);
                    return user ? user.name : 'Someone';
                  }).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </div>
              )}

              {/* Templates Panel */}
              {showTemplates && (
                <div className="mt-4">
                  <MessageTemplates
                    templates={mockTemplates}
                    onUseTemplate={handleUseTemplate}
                    onCreateTemplate={() => {}}
                    onUpdateTemplate={() => {}}
                    onDeleteTemplate={() => {}}
                    currentUser={{ id: 'current-user', name: 'Current User', rank: 'Gold' }}
                  />
                </div>
              )}

              {/* Quick Responses Panel */}
              {showQuickResponses && (
                <div className="mt-4">
                  <QuickResponses
                    responses={mockQuickResponses}
                    onUseResponse={handleUseQuickResponse}
                    onCreateResponse={() => {}}
                    onUpdateResponse={() => {}}
                    onDeleteResponse={() => {}}
                    onPinResponse={() => {}}
                  />
                </div>
              )}

              {/* Analytics Panel */}
              {showAnalytics && (
                <div className="mt-4">
                  <CommunicationAnalytics
                    data={mockAnalyticsData}
                    onExport={handleExportAnalytics}
                    onDateRangeChange={() => {}}
                    onFilterChange={() => {}}
                  />
                </div>
              )}
            </div>

            {/* Channel Create Modal */}
            <ChannelCreateModal
              isOpen={showCreateChannel}
              onClose={() => setShowCreateChannel(false)}
              onCreateChannel={handleCreateChannel}
              teamMembers={users}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a channel</h3>
              <p className="text-gray-500">Choose a channel from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - User List */}
      {showUserList && (
        <div className="w-80 bg-white border-l border-gray-200 fixed lg:relative inset-y-0 right-0 z-50 lg:z-auto flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Members</h3>
            <button
              onClick={() => setShowUserList(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <UserPresence
            users={users.map(user => ({
              ...user,
              isTyping: typingUsers.has(user.id),
              lastSeen: user.lastSeen || new Date(),
              activity: user.activity || undefined,
              customStatus: user.customStatus || undefined,
              isModerator: user.rank.includes('Moderator'),
              isAdmin: user.rank.includes('Admin'),
              isOwner: user.rank.includes('Owner'),
              joinDate: new Date(),
              messageCount: Math.floor(Math.random() * 100),
              reactionCount: Math.floor(Math.random() * 50)
            }))}
            currentUserId="550e8400-e29b-41d4-a716-446655440000"
            onUserClick={(user) => console.log('User clicked:', user)}
            onStartCall={(user) => console.log('Start call with:', user)}
            onStartVideoCall={(user) => console.log('Start video call with:', user)}
            onSendMessage={(user) => console.log('Send message to:', user)}
            onInviteUser={(user) => console.log('Invite user:', user)}
            onMuteUser={(userId) => console.log('Mute user:', userId)}
            onKickUser={(userId) => console.log('Kick user:', userId)}
            onBanUser={(userId) => console.log('Ban user:', userId)}
            onPromoteUser={(userId) => console.log('Promote user:', userId)}
            onDemoteUser={(userId) => console.log('Demote user:', userId)}
          />
        </div>
      )}

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        onUpload={handleFileUpload}
        maxFiles={10}
        maxFileSize={50}
        acceptedTypes={['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
      />

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          isOpen={showFilePreview}
          onClose={() => {
            setShowFilePreview(false);
            setPreviewFile(null);
          }}
          onDownload={handleFileDownload}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
        channels={channels}
        users={users}
      />

      {/* Message Edit Modal */}
      {editingMessage && (
        <MessageEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingMessage(null);
          }}
          onSave={handleSaveEdit}
          message={editingMessage}
          isSaving={isEditing}
        />
      )}

      {/* Message Delete Modal */}
      {deletingMessage && (
        <MessageDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingMessage(null);
          }}
          onDelete={handleConfirmDelete}
          message={deletingMessage}
          isDeleting={isDeleting}
        />
      )}

      {/* Channel Create Modal */}
      <ChannelCreateModal
        isOpen={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        onChannelCreate={handleCreateChannel}
        users={users}
      />

      {/* Phase 4 Modals */}
      <AdvancedAnalytics
        isOpen={showAdvancedAnalytics}
        onClose={() => setShowAdvancedAnalytics(false)}
        onExport={handleAdvancedAnalyticsExport}
      />

      <MessageEncryption
        isOpen={showMessageEncryption}
        onClose={() => setShowMessageEncryption(false)}
        onSave={handleEncryptionSave}
        currentSettings={encryptionSettings}
      />

      <PerformanceOptimizer
        isOpen={showPerformanceOptimizer}
        onClose={() => setShowPerformanceOptimizer(false)}
        onOptimize={handlePerformanceSave}
        currentSettings={performanceSettings}
      />

      <MobileOptimizer
        isOpen={showMobileOptimizer}
        onClose={() => setShowMobileOptimizer(false)}
        onSave={handleMobileSave}
        currentSettings={mobileSettings}
      />

      <AccessibilityFeatures
        isOpen={showAccessibilityFeatures}
        onClose={() => setShowAccessibilityFeatures(false)}
        onSave={handleAccessibilitySave}
        currentSettings={accessibilitySettings}
      />

      <ModerationTools
        isOpen={showModerationTools}
        onClose={() => setShowModerationTools(false)}
        onSave={handleModerationSave}
        currentSettings={moderationSettings}
      />

      <IntegrationCapabilities
        isOpen={showIntegrationCapabilities}
        onClose={() => setShowIntegrationCapabilities(false)}
        onSave={handleIntegrationSave}
        currentIntegrations={integrationSettings}
      />

      {/* Message Scheduler Modal */}
      {selectedChannel && (
        <MessageScheduler
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
          onSchedule={handleScheduleMessage}
          channelId={selectedChannel.id}
          channelName={selectedChannel.name}
          initialContent={newMessage}
          scheduledMessages={scheduledMessages}
          onCancelScheduled={handleCancelScheduled}
          onEditScheduled={handleEditScheduled}
        />
      )}

      {/* Debug Panel */}
      {debugInfo.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md max-h-64 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold">Duration Debug</h3>
            <button 
              onClick={() => setDebugInfo([])}
              className="text-xs bg-red-600 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
          <div className="text-xs space-y-1">
            {debugInfo.map((info, index) => (
              <div key={index} className="font-mono">
                {info}
              </div>
            ))}
          </div>
        </div>
      )}
      
      
      {/* Voice Message Modal */}
      <VoiceMessageModal 
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />
    </div>
  );
}

// Export with error handling wrapper
export default function MLMCommunicationsPageWithErrorHandling() {
  return (
    <ErrorBoundary>
      <CommunicationErrorHandler>
        <MLMCommunicationsPage />
      </CommunicationErrorHandler>
    </ErrorBoundary>
  );
}
