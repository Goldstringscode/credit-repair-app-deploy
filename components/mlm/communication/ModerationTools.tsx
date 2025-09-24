import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Ban, 
  Mute, 
  Flag, 
  AlertTriangle, 
  CheckCircle,
  Users,
  MessageSquare,
  Clock,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  X
} from 'lucide-react';

interface ModerationAction {
  id: string;
  type: 'warn' | 'mute' | 'ban' | 'kick' | 'delete' | 'flag';
  targetUser: string;
  moderator: string;
  reason: string;
  timestamp: Date;
  duration?: number; // in hours
  status: 'active' | 'expired' | 'appealed';
}

interface ModerationSettings {
  autoModeration: boolean;
  profanityFilter: boolean;
  spamDetection: boolean;
  linkFilter: boolean;
  imageModeration: boolean;
  rateLimiting: boolean;
  autoWarn: boolean;
  autoMute: boolean;
  autoBan: boolean;
  reportThreshold: number;
  muteDuration: number;
  banDuration: number;
  allowedDomains: string[];
  blockedWords: string[];
}

interface ModerationToolsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ModerationSettings) => void;
  currentSettings?: ModerationSettings;
}

const ModerationTools: React.FC<ModerationToolsProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<ModerationSettings>({
    autoModeration: true,
    profanityFilter: true,
    spamDetection: true,
    linkFilter: false,
    imageModeration: false,
    rateLimiting: true,
    autoWarn: true,
    autoMute: false,
    autoBan: false,
    reportThreshold: 3,
    muteDuration: 24,
    banDuration: 168, // 7 days
    allowedDomains: ['example.com', 'trusted-site.com'],
    blockedWords: ['spam', 'scam', 'fake']
  });

  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<ModerationAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  useEffect(() => {
    if (isOpen) {
      loadModerationActions();
    }
  }, [isOpen]);

  const loadModerationActions = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockActions: ModerationAction[] = [
      {
        id: '1',
        type: 'warn',
        targetUser: 'user123',
        moderator: 'moderator1',
        reason: 'Inappropriate language',
        timestamp: new Date(Date.now() - 3600000),
        status: 'active'
      },
      {
        id: '2',
        type: 'mute',
        targetUser: 'user456',
        moderator: 'moderator2',
        reason: 'Spamming messages',
        timestamp: new Date(Date.now() - 7200000),
        duration: 24,
        status: 'active'
      },
      {
        id: '3',
        type: 'ban',
        targetUser: 'user789',
        moderator: 'moderator1',
        reason: 'Repeated violations',
        timestamp: new Date(Date.now() - 86400000),
        duration: 168,
        status: 'active'
      }
    ];
    
    setActions(mockActions);
    setIsLoading(false);
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const performAction = (actionType: string, targetUser: string, reason: string, duration?: number) => {
    const newAction: ModerationAction = {
      id: Date.now().toString(),
      type: actionType as any,
      targetUser,
      moderator: 'current-moderator',
      reason,
      timestamp: new Date(),
      duration,
      status: 'active'
    };
    
    setActions(prev => [newAction, ...prev]);
  };

  const filteredActions = actions.filter(action => {
    const matchesSearch = action.targetUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || action.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Moderation Tools</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Moderation Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Automated Moderation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'autoModeration', label: 'Auto Moderation', description: 'Enable automated content moderation' },
                  { key: 'profanityFilter', label: 'Profanity Filter', description: 'Filter inappropriate language' },
                  { key: 'spamDetection', label: 'Spam Detection', description: 'Detect and prevent spam messages' },
                  { key: 'linkFilter', label: 'Link Filter', description: 'Filter suspicious links' },
                  { key: 'imageModeration', label: 'Image Moderation', description: 'Moderate uploaded images' },
                  { key: 'rateLimiting', label: 'Rate Limiting', description: 'Limit message frequency' }
                ].map((option) => (
                  <div key={option.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, [option.key]: !prev[option.key as keyof ModerationSettings] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[option.key as keyof ModerationSettings] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[option.key as keyof ModerationSettings] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Automatic Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Report Threshold</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.reportThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, reportThreshold: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">Number of reports before action</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Mute Duration (hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.muteDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, muteDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Ban Duration (hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="8760"
                    value={settings.banDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, banDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Content Filters */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Allowed Domains</label>
                  <div className="space-y-2">
                    {settings.allowedDomains.map((domain, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={domain}
                          onChange={(e) => {
                            const newDomains = [...settings.allowedDomains];
                            newDomains[index] = e.target.value;
                            setSettings(prev => ({ ...prev, allowedDomains: newDomains }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => {
                            const newDomains = settings.allowedDomains.filter((_, i) => i !== index);
                            setSettings(prev => ({ ...prev, allowedDomains: newDomains }));
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, allowedDomains: [...prev.allowedDomains, ''] }))}
                      className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400"
                    >
                      + Add Domain
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Blocked Words</label>
                  <div className="space-y-2">
                    {settings.blockedWords.map((word, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={word}
                          onChange={(e) => {
                            const newWords = [...settings.blockedWords];
                            newWords[index] = e.target.value;
                            setSettings(prev => ({ ...prev, blockedWords: newWords }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => {
                            const newWords = settings.blockedWords.filter((_, i) => i !== index);
                            setSettings(prev => ({ ...prev, blockedWords: newWords }));
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, blockedWords: [...prev.blockedWords, ''] }))}
                      className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400"
                    >
                      + Add Word
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Moderation Actions History */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Moderation Actions</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search actions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Actions</option>
                    <option value="warn">Warnings</option>
                    <option value="mute">Mutes</option>
                    <option value="ban">Bans</option>
                    <option value="kick">Kicks</option>
                    <option value="delete">Deletions</option>
                    <option value="flag">Flags</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Target User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Moderator</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Reason</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActions.map((action) => (
                        <tr key={action.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              action.type === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                              action.type === 'mute' ? 'bg-orange-100 text-orange-800' :
                              action.type === 'ban' ? 'bg-red-100 text-red-800' :
                              action.type === 'kick' ? 'bg-purple-100 text-purple-800' :
                              action.type === 'delete' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {action.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900">{action.targetUser}</td>
                          <td className="py-3 px-4 text-gray-600">{action.moderator}</td>
                          <td className="py-3 px-4 text-gray-600">{action.reason}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {action.duration ? `${action.duration}h` : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              action.status === 'active' ? 'bg-green-100 text-green-800' :
                              action.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {action.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {action.timestamp.toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationTools;
