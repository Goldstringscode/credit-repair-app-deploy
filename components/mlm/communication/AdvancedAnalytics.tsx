import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock, 
  Download,
  Filter,
  Calendar,
  Activity,
  Target,
  Award,
  Zap,
  X
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalMessages: number;
    totalUsers: number;
    totalChannels: number;
    activeUsers: number;
    messageGrowth: number;
    userGrowth: number;
  };
  engagement: {
    messagesPerUser: number;
    averageResponseTime: number;
    peakActivityHours: number[];
    mostActiveChannels: Array<{
      id: string;
      name: string;
      messageCount: number;
      userCount: number;
    }>;
  };
  performance: {
    messageDeliveryRate: number;
    userRetentionRate: number;
    channelUtilization: number;
    responseTime: number;
  };
  trends: Array<{
    date: string;
    messages: number;
    users: number;
    channels: number;
  }>;
  topPerformers: Array<{
    id: string;
    name: string;
    messages: number;
    reactions: number;
    influence: number;
  }>;
  channelAnalytics: Array<{
    id: string;
    name: string;
    messages: number;
    users: number;
    engagement: number;
    growth: number;
  }>;
}

const AdvancedAnalytics: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string) => void;
}> = ({ isOpen, onClose, onExport }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('messages');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockAnalyticsData: AnalyticsData = {
    overview: {
      totalMessages: 15420,
      totalUsers: 89,
      totalChannels: 12,
      activeUsers: 67,
      messageGrowth: 23.5,
      userGrowth: 15.2
    },
    engagement: {
      messagesPerUser: 173.3,
      averageResponseTime: 4.2,
      peakActivityHours: [9, 10, 11, 14, 15, 16, 20, 21],
      mostActiveChannels: [
        { id: '1', name: 'general', messageCount: 5420, userCount: 67 },
        { id: '2', name: 'announcements', messageCount: 2340, userCount: 89 },
        { id: '3', name: 'training', messageCount: 1890, userCount: 45 },
        { id: '4', name: 'support', messageCount: 1560, userCount: 23 }
      ]
    },
    performance: {
      messageDeliveryRate: 99.2,
      userRetentionRate: 87.5,
      channelUtilization: 78.3,
      responseTime: 2.1
    },
    trends: [
      { date: '2024-01-01', messages: 1200, users: 45, channels: 8 },
      { date: '2024-01-02', messages: 1350, users: 48, channels: 8 },
      { date: '2024-01-03', messages: 1420, users: 52, channels: 9 },
      { date: '2024-01-04', messages: 1580, users: 55, channels: 9 },
      { date: '2024-01-05', messages: 1650, users: 58, channels: 10 },
      { date: '2024-01-06', messages: 1720, users: 62, channels: 10 },
      { date: '2024-01-07', messages: 1890, users: 67, channels: 12 }
    ],
    topPerformers: [
      { id: '1', name: 'John Smith', messages: 1240, reactions: 456, influence: 95.2 },
      { id: '2', name: 'Sarah Johnson', messages: 980, reactions: 389, influence: 87.3 },
      { id: '3', name: 'Mike Wilson', messages: 890, reactions: 312, influence: 82.1 },
      { id: '4', name: 'Lisa Brown', messages: 760, reactions: 298, influence: 78.9 }
    ],
    channelAnalytics: [
      { id: '1', name: 'general', messages: 5420, users: 67, engagement: 89.2, growth: 15.3 },
      { id: '2', name: 'announcements', messages: 2340, users: 89, engagement: 92.1, growth: 8.7 },
      { id: '3', name: 'training', messages: 1890, users: 45, engagement: 76.8, growth: 22.4 },
      { id: '4', name: 'support', messages: 1560, users: 23, engagement: 94.5, growth: 18.9 }
    ]
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAnalyticsData(mockAnalyticsData);
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, selectedPeriod]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button
              onClick={() => onExport('pdf')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : analyticsData ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Messages</p>
                      <p className="text-3xl font-bold">{analyticsData.overview.totalMessages.toLocaleString()}</p>
                      <p className="text-blue-100 text-sm">+{analyticsData.overview.messageGrowth}% from last period</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Users</p>
                      <p className="text-3xl font-bold">{analyticsData.overview.activeUsers}</p>
                      <p className="text-green-100 text-sm">+{analyticsData.overview.userGrowth}% from last period</p>
                    </div>
                    <Users className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Channels</p>
                      <p className="text-3xl font-bold">{analyticsData.overview.totalChannels}</p>
                      <p className="text-purple-100 text-sm">Active channels</p>
                    </div>
                    <Activity className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Engagement</p>
                      <p className="text-3xl font-bold">{analyticsData.engagement.messagesPerUser}</p>
                      <p className="text-orange-100 text-sm">Messages per user</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Message Delivery Rate</span>
                      <span className="text-2xl font-bold text-green-600">{analyticsData.performance.messageDeliveryRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">User Retention Rate</span>
                      <span className="text-2xl font-bold text-blue-600">{analyticsData.performance.userRetentionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Channel Utilization</span>
                      <span className="text-2xl font-bold text-purple-600">{analyticsData.performance.channelUtilization}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg Response Time</span>
                      <span className="text-2xl font-bold text-orange-600">{analyticsData.performance.responseTime}s</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Activity Hours</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                          analyticsData.engagement.peakActivityHours.includes(i)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Messages</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Reactions</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Influence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topPerformers.map((performer, index) => (
                        <tr key={performer.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                {performer.name.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900">{performer.name}</span>
                              {index < 3 && <Award className="w-4 h-4 text-yellow-500" />}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{performer.messages.toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-600">{performer.reactions.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${performer.influence}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{performer.influence}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Channel Analytics */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analyticsData.channelAnalytics.map((channel) => (
                    <div key={channel.id} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{channel.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Messages</span>
                          <span className="font-medium">{channel.messages.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Users</span>
                          <span className="font-medium">{channel.users}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Engagement</span>
                          <span className="font-medium text-green-600">{channel.engagement}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Growth</span>
                          <span className="font-medium text-blue-600">+{channel.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
