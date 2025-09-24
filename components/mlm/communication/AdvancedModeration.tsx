'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  UserX, 
  MessageSquareX, 
  Filter, 
  Settings, 
  Save, 
  X, 
  Check, 
  Clock, 
  Users, 
  Flag, 
  Eye, 
  EyeOff,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Zap,
  Target,
  BarChart3,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface ModerationRule {
  id: string;
  name: string;
  description: string;
  type: 'keyword' | 'spam' | 'profanity' | 'link' | 'mention' | 'length' | 'rate_limit';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'warn' | 'mute' | 'kick' | 'ban' | 'delete' | 'flag';
  config: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ModerationStats {
  totalMessages: number;
  flaggedMessages: number;
  autoModerated: number;
  userActions: number;
  bannedUsers: number;
  mutedUsers: number;
  topViolations: { type: string; count: number }[];
  recentActivity: { action: string; user: string; timestamp: Date }[];
}

interface AdvancedModerationProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  currentSettings?: any;
  channelId?: string;
  isModerator?: boolean;
  isAdmin?: boolean;
}

const MODERATION_TYPES = [
  { id: 'keyword', name: 'Keyword Filter', description: 'Filter messages containing specific keywords', icon: Filter },
  { id: 'spam', name: 'Spam Detection', description: 'Detect and prevent spam messages', icon: AlertTriangle },
  { id: 'profanity', name: 'Profanity Filter', description: 'Filter inappropriate language', icon: Shield },
  { id: 'link', name: 'Link Filter', description: 'Control link sharing and safety', icon: Target },
  { id: 'mention', name: 'Mention Limits', description: 'Limit excessive mentions', icon: Users },
  { id: 'length', name: 'Message Length', description: 'Control message length limits', icon: MessageSquareX },
  { id: 'rate_limit', name: 'Rate Limiting', description: 'Prevent message flooding', icon: Clock }
];

const SEVERITY_LEVELS = [
  { id: 'low', name: 'Low', color: 'text-green-600 bg-green-100', description: 'Minor violations' },
  { id: 'medium', name: 'Medium', color: 'text-yellow-600 bg-yellow-100', description: 'Moderate violations' },
  { id: 'high', name: 'High', color: 'text-orange-600 bg-orange-100', description: 'Serious violations' },
  { id: 'critical', name: 'Critical', color: 'text-red-600 bg-red-100', description: 'Severe violations' }
];

const ACTION_TYPES = [
  { id: 'warn', name: 'Warn', description: 'Send warning to user', icon: AlertCircle },
  { id: 'mute', name: 'Mute', description: 'Temporarily mute user', icon: VolumeX },
  { id: 'kick', name: 'Kick', description: 'Remove user from channel', icon: UserX },
  { id: 'ban', name: 'Ban', description: 'Permanently ban user', icon: Ban },
  { id: 'delete', name: 'Delete', description: 'Delete the message', icon: MessageSquareX },
  { id: 'flag', name: 'Flag', description: 'Flag for review', icon: Flag }
];

export default function AdvancedModeration({
  isOpen,
  onClose,
  onSave,
  currentSettings = {},
  channelId,
  isModerator = false,
  isAdmin = false
}: AdvancedModerationProps) {
  const [activeTab, setActiveTab] = useState<'rules' | 'stats' | 'settings' | 'users'>('rules');
  const [rules, setRules] = useState<ModerationRule[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<ModerationRule | null>(null);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<ModerationRule>>({
    name: '',
    description: '',
    type: 'keyword',
    enabled: true,
    severity: 'medium',
    action: 'warn',
    config: {}
  });

  // Mock data for demonstration
  useEffect(() => {
    if (isOpen) {
      loadModerationData();
    }
  }, [isOpen]);

  const loadModerationData = async () => {
    setIsLoading(true);
    try {
      // Mock rules data
      const mockRules: ModerationRule[] = [
        {
          id: '1',
          name: 'Profanity Filter',
          description: 'Filter inappropriate language',
          type: 'profanity',
          enabled: true,
          severity: 'high',
          action: 'delete',
          config: { words: ['badword1', 'badword2'], replaceWith: '***' },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'Spam Detection',
          description: 'Detect repeated messages',
          type: 'spam',
          enabled: true,
          severity: 'medium',
          action: 'mute',
          config: { maxRepeats: 3, timeWindow: 60 },
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-10')
        },
        {
          id: '3',
          name: 'Link Safety',
          description: 'Check links for safety',
          type: 'link',
          enabled: true,
          severity: 'medium',
          action: 'flag',
          config: { checkSafety: true, allowedDomains: ['trusted.com'] },
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-12')
        }
      ];

      const mockStats: ModerationStats = {
        totalMessages: 15420,
        flaggedMessages: 234,
        autoModerated: 156,
        userActions: 45,
        bannedUsers: 3,
        mutedUsers: 12,
        topViolations: [
          { type: 'Profanity', count: 89 },
          { type: 'Spam', count: 67 },
          { type: 'Links', count: 45 },
          { type: 'Mentions', count: 23 }
        ],
        recentActivity: [
          { action: 'Message deleted', user: 'John Doe', timestamp: new Date() },
          { action: 'User muted', user: 'Jane Smith', timestamp: new Date(Date.now() - 300000) },
          { action: 'Rule triggered', user: 'Auto-mod', timestamp: new Date(Date.now() - 600000) }
        ]
      };

      setRules(mockRules);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading moderation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = () => {
    setNewRule({
      name: '',
      description: '',
      type: 'keyword',
      enabled: true,
      severity: 'medium',
      action: 'warn',
      config: {}
    });
    setEditingRule(null);
    setShowRuleForm(true);
  };

  const handleEditRule = (rule: ModerationRule) => {
    setEditingRule(rule);
    setNewRule(rule);
    setShowRuleForm(true);
  };

  const handleSaveRule = () => {
    if (!newRule.name || !newRule.description) return;

    const rule: ModerationRule = {
      id: editingRule?.id || `rule-${Date.now()}`,
      name: newRule.name,
      description: newRule.description,
      type: newRule.type as any,
      enabled: newRule.enabled || true,
      severity: newRule.severity as any,
      action: newRule.action as any,
      config: newRule.config || {},
      createdAt: editingRule?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingRule) {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
    } else {
      setRules(prev => [...prev, rule]);
    }

    setShowRuleForm(false);
    setEditingRule(null);
    setNewRule({});
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const getSeverityColor = (severity: string) => {
    return SEVERITY_LEVELS.find(s => s.id === severity)?.color || 'text-gray-600 bg-gray-100';
  };

  const getActionIcon = (action: string) => {
    return ACTION_TYPES.find(a => a.id === action)?.icon || AlertCircle;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Advanced Moderation</h3>
              <p className="text-sm text-gray-500">Manage moderation rules and settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'rules', name: 'Moderation Rules', icon: Filter },
            { id: 'stats', name: 'Statistics', icon: BarChart3 },
            { id: 'settings', name: 'Settings', icon: Settings },
            { id: 'users', name: 'User Management', icon: Users }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'rules' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Moderation Rules</h4>
                    <button
                      onClick={handleCreateRule}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Create Rule</span>
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {rules.map((rule) => {
                      const TypeIcon = MODERATION_TYPES.find(t => t.id === rule.type)?.icon || Filter;
                      const ActionIcon = getActionIcon(rule.action);
                      
                      return (
                        <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <TypeIcon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="font-medium text-gray-900">{rule.name}</h5>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                                    {rule.severity}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    rule.enabled ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                                  }`}>
                                    {rule.enabled ? 'Enabled' : 'Disabled'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>Action: {rule.action}</span>
                                  <span>Updated: {rule.updatedAt.toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleRule(rule.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  rule.enabled 
                                    ? 'text-green-600 hover:bg-green-50' 
                                    : 'text-gray-400 hover:bg-gray-50'
                                }`}
                                title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                              >
                                {rule.enabled ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              </button>
                              
                              <button
                                onClick={() => handleEditRule(rule)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit rule"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete rule"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'stats' && stats && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Moderation Statistics</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalMessages.toLocaleString()}</div>
                      <div className="text-sm text-blue-600">Total Messages</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">{stats.flaggedMessages}</div>
                      <div className="text-sm text-yellow-600">Flagged Messages</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">{stats.autoModerated}</div>
                      <div className="text-sm text-red-600">Auto-Moderated</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">{stats.userActions}</div>
                      <div className="text-sm text-purple-600">User Actions</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-4">Top Violations</h5>
                      <div className="space-y-2">
                        {stats.topViolations.map((violation, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{violation.type}</span>
                            <span className="text-sm font-medium text-gray-900">{violation.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-4">Recent Activity</h5>
                      <div className="space-y-2">
                        {stats.recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <span className="text-sm text-gray-900">{activity.action}</span>
                              <span className="text-xs text-gray-500 ml-2">by {activity.user}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {activity.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Moderation Settings</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900">General Settings</h5>
                      
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                          <span className="text-sm text-gray-700">Enable auto-moderation</span>
                        </label>
                        
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                          <span className="text-sm text-gray-700">Send notifications to moderators</span>
                        </label>
                        
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                          <span className="text-sm text-gray-700">Log all moderation actions</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900">Advanced Settings</h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Auto-delete threshold
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option>3 violations</option>
                            <option>5 violations</option>
                            <option>10 violations</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mute duration
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option>1 hour</option>
                            <option>24 hours</option>
                            <option>7 days</option>
                            <option>Permanent</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">User Management</h4>
                  
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900">Banned Users</h5>
                        <span className="text-sm text-gray-500">3 users</span>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {[
                        { name: 'John Doe', reason: 'Spam', bannedAt: '2024-01-15' },
                        { name: 'Jane Smith', reason: 'Harassment', bannedAt: '2024-01-10' },
                        { name: 'Bob Johnson', reason: 'Inappropriate content', bannedAt: '2024-01-05' }
                      ].map((user, index) => (
                        <div key={index} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">Reason: {user.reason}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{user.bannedAt}</span>
                            <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              Unban
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rule Form Modal */}
        {showRuleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRule ? 'Edit Rule' : 'Create New Rule'}
                </h3>
                <button
                  onClick={() => setShowRuleForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter rule name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newRule.description || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter rule description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newRule.type || 'keyword'}
                      onChange={(e) => setNewRule(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {MODERATION_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      value={newRule.severity || 'medium'}
                      onChange={(e) => setNewRule(prev => ({ ...prev, severity: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {SEVERITY_LEVELS.map((severity) => (
                        <option key={severity.id} value={severity.id}>
                          {severity.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action
                  </label>
                  <select
                    value={newRule.action || 'warn'}
                    onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {ACTION_TYPES.map((action) => (
                      <option key={action.id} value={action.id}>
                        {action.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowRuleForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRule}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Rule</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onSave({ rules, stats })}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
