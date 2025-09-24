import React, { useState, useEffect } from 'react';
import { 
  Plug, 
  Zap, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ExternalLink,
  Code,
  Database,
  Mail,
  Calendar,
  FileText,
  BarChart3,
  MessageSquare,
  Users,
  Shield,
  X
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'productivity' | 'analytics' | 'security' | 'storage';
  status: 'active' | 'inactive' | 'error' | 'pending';
  icon: React.ReactNode;
  apiKey?: string;
  webhookUrl?: string;
  lastSync?: Date;
  errorMessage?: string;
}

interface IntegrationCapabilitiesProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (integrations: Integration[]) => void;
  currentIntegrations?: Integration[];
}

const IntegrationCapabilities: React.FC<IntegrationCapabilitiesProps> = ({
  isOpen,
  onClose,
  onSave,
  currentIntegrations
}) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const availableIntegrations: Integration[] = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Integrate with Slack workspaces for seamless communication',
      category: 'communication',
      status: 'inactive',
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Connect with Discord servers for community management',
      category: 'communication',
      status: 'inactive',
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Integrate with Microsoft Teams for enterprise communication',
      category: 'communication',
      status: 'inactive',
      icon: <Users className="w-6 h-6" />
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Sync with Gmail for email notifications and management',
      category: 'communication',
      status: 'inactive',
      icon: <Mail className="w-6 h-6" />
    },
    {
      id: 'outlook',
      name: 'Outlook',
      description: 'Connect with Outlook for email integration',
      category: 'communication',
      status: 'inactive',
      icon: <Mail className="w-6 h-6" />
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync with Google Calendar for event management',
      category: 'productivity',
      status: 'inactive',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Integrate with Notion for document collaboration',
      category: 'productivity',
      status: 'inactive',
      icon: <FileText className="w-6 h-6" />
    },
    {
      id: 'trello',
      name: 'Trello',
      description: 'Connect with Trello for project management',
      category: 'productivity',
      status: 'inactive',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Integrate with Google Analytics for communication insights',
      category: 'analytics',
      status: 'inactive',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      id: 'mixpanel',
      name: 'Mixpanel',
      description: 'Connect with Mixpanel for user behavior analytics',
      category: 'analytics',
      status: 'inactive',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      id: 'aws-s3',
      name: 'AWS S3',
      description: 'Store files and media in AWS S3',
      category: 'storage',
      status: 'inactive',
      icon: <Database className="w-6 h-6" />
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Integrate with Google Drive for file storage',
      category: 'storage',
      status: 'inactive',
      icon: <Database className="w-6 h-6" />
    },
    {
      id: 'okta',
      name: 'Okta',
      description: 'Integrate with Okta for single sign-on',
      category: 'security',
      status: 'inactive',
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'auth0',
      name: 'Auth0',
      description: 'Connect with Auth0 for authentication',
      category: 'security',
      status: 'inactive',
      icon: <Shield className="w-6 h-6" />
    }
  ];

  useEffect(() => {
    if (currentIntegrations) {
      setIntegrations(currentIntegrations);
    } else {
      setIntegrations(availableIntegrations);
    }
  }, [currentIntegrations]);

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsConfiguring(true);
  };

  const handleSaveConfiguration = (updatedIntegration: Integration) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === updatedIntegration.id ? updatedIntegration : integration
    ));
    setIsConfiguring(false);
    setSelectedIntegration(null);
  };

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: integration.status === 'active' ? 'inactive' : 'active' }
        : integration
    ));
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      case 'productivity': return <Calendar className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'storage': return <Database className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Plug className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Integration Capabilities</h2>
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
            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="communication">Communication</option>
                <option value="productivity">Productivity</option>
                <option value="analytics">Analytics</option>
                <option value="security">Security</option>
                <option value="storage">Storage</option>
              </select>
            </div>

            {/* Integration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((integration) => (
                <div key={integration.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600">{integration.icon}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{integration.name}</h3>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(integration.category)}
                          <span className="text-sm text-gray-600 capitalize">{integration.category}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                      {integration.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleConfigure(integration)}
                      className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configure</span>
                    </button>
                    <button
                      onClick={() => handleToggleIntegration(integration.id)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        integration.status === 'active'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {integration.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Configuration Modal */}
            {isConfiguring && selectedIntegration && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      {selectedIntegration.icon}
                      <h3 className="text-xl font-bold text-gray-900">Configure {selectedIntegration.name}</h3>
                    </div>
                    <button
                      onClick={() => setIsConfiguring(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                        <input
                          type="text"
                          value={selectedIntegration.apiKey || ''}
                          onChange={(e) => setSelectedIntegration(prev => prev ? { ...prev, apiKey: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter API key"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                        <input
                          type="url"
                          value={selectedIntegration.webhookUrl || ''}
                          onChange={(e) => setSelectedIntegration(prev => prev ? { ...prev, webhookUrl: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter webhook URL"
                        />
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900">Configuration Help</h4>
                            <p className="text-sm text-blue-800 mt-1">
                              To configure {selectedIntegration.name}, you'll need to:
                            </p>
                            <ul className="text-sm text-blue-800 mt-2 list-disc list-inside space-y-1">
                              <li>Create an account with {selectedIntegration.name}</li>
                              <li>Generate an API key from their developer console</li>
                              <li>Set up a webhook URL to receive notifications</li>
                              <li>Test the connection to ensure it's working properly</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                      onClick={() => setIsConfiguring(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveConfiguration(selectedIntegration)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            )}
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
            onClick={() => onSave(integrations)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Integrations
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationCapabilities;
