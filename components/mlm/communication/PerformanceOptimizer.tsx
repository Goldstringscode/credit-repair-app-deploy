import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Database, 
  Cpu, 
  MemoryStick, 
  Network, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Upload,
  X
} from 'lucide-react';

interface PerformanceMetrics {
  messageLoadTime: number;
  channelSwitchTime: number;
  memoryUsage: number;
  networkLatency: number;
  cacheHitRate: number;
  databaseQueryTime: number;
  websocketLatency: number;
  overallScore: number;
}

interface OptimizationSettings {
  messageCacheSize: number;
  imageCompression: number;
  lazyLoading: boolean;
  prefetchChannels: boolean;
  messageBatchSize: number;
  websocketHeartbeat: number;
  databaseConnectionPool: number;
  enableCDN: boolean;
  enableGzip: boolean;
  enableServiceWorker: boolean;
}

const PerformanceOptimizer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOptimize: (settings: OptimizationSettings) => void;
  currentSettings?: OptimizationSettings;
}> = ({ isOpen, onClose, onOptimize, currentSettings }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [settings, setSettings] = useState<OptimizationSettings>({
    messageCacheSize: 1000,
    imageCompression: 80,
    lazyLoading: true,
    prefetchChannels: true,
    messageBatchSize: 50,
    websocketHeartbeat: 30,
    databaseConnectionPool: 10,
    enableCDN: true,
    enableGzip: true,
    enableServiceWorker: true
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationStatus, setOptimizationStatus] = useState<'idle' | 'optimizing' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    
    // Simulate performance analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockMetrics: PerformanceMetrics = {
      messageLoadTime: Math.random() * 500 + 100,
      channelSwitchTime: Math.random() * 200 + 50,
      memoryUsage: Math.random() * 50 + 20,
      networkLatency: Math.random() * 100 + 20,
      cacheHitRate: Math.random() * 30 + 70,
      databaseQueryTime: Math.random() * 100 + 50,
      websocketLatency: Math.random() * 50 + 10,
      overallScore: Math.random() * 20 + 80
    };
    
    setMetrics(mockMetrics);
    setIsAnalyzing(false);
  };

  const optimizePerformance = async () => {
    setIsOptimizing(true);
    setOptimizationStatus('optimizing');
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setOptimizationStatus('success');
    setIsOptimizing(false);
    
    setTimeout(() => {
      onOptimize(settings);
      onClose();
      setOptimizationStatus('idle');
    }, 2000);
  };

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (!isOpen) return null;

  const performanceGrade = metrics ? getPerformanceGrade(metrics.overallScore) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Performance Optimizer</h2>
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
            {/* Performance Overview */}
            {metrics && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Performance Overview</h3>
                  <div className={`px-3 py-1 rounded-full ${performanceGrade?.bg} ${performanceGrade?.color}`}>
                    <span className="font-bold">{performanceGrade?.grade}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.messageLoadTime.toFixed(0)}ms</div>
                    <div className="text-sm opacity-90">Message Load Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.channelSwitchTime.toFixed(0)}ms</div>
                    <div className="text-sm opacity-90">Channel Switch</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}MB</div>
                    <div className="text-sm opacity-90">Memory Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.overallScore.toFixed(0)}%</div>
                    <div className="text-sm opacity-90">Overall Score</div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Network Latency</span>
                      <span className="text-2xl font-bold text-blue-600">{metrics.networkLatency.toFixed(0)}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cache Hit Rate</span>
                      <span className="text-2xl font-bold text-green-600">{metrics.cacheHitRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database Query Time</span>
                      <span className="text-2xl font-bold text-purple-600">{metrics.databaseQueryTime.toFixed(0)}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">WebSocket Latency</span>
                      <span className="text-2xl font-bold text-orange-600">{metrics.websocketLatency.toFixed(0)}ms</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Recommendations</h3>
                  <div className="space-y-3">
                    {metrics.messageLoadTime > 300 && (
                      <div className="flex items-start space-x-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <span className="text-gray-700">Message load time is high. Consider enabling lazy loading.</span>
                      </div>
                    )}
                    {metrics.cacheHitRate < 80 && (
                      <div className="flex items-start space-x-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <span className="text-gray-700">Cache hit rate is low. Increase cache size.</span>
                      </div>
                    )}
                    {metrics.memoryUsage > 100 && (
                      <div className="flex items-start space-x-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <span className="text-gray-700">Memory usage is high. Enable image compression.</span>
                      </div>
                    )}
                    {metrics.overallScore > 85 && (
                      <div className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-gray-700">Performance is excellent! Keep current settings.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Optimization Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Message Cache */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Message Cache Size</label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={settings.messageCacheSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, messageCacheSize: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>100 messages</span>
                    <span>{settings.messageCacheSize} messages</span>
                    <span>5000 messages</span>
                  </div>
                </div>

                {/* Image Compression */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Image Compression</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={settings.imageCompression}
                    onChange={(e) => setSettings(prev => ({ ...prev, imageCompression: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10% (High Quality)</span>
                    <span>{settings.imageCompression}%</span>
                    <span>100% (Low Quality)</span>
                  </div>
                </div>

                {/* Message Batch Size */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Message Batch Size</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={settings.messageBatchSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, messageBatchSize: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10 messages</span>
                    <span>{settings.messageBatchSize} messages</span>
                    <span>200 messages</span>
                  </div>
                </div>

                {/* WebSocket Heartbeat */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">WebSocket Heartbeat</label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={settings.websocketHeartbeat}
                    onChange={(e) => setSettings(prev => ({ ...prev, websocketHeartbeat: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10 seconds</span>
                    <span>{settings.websocketHeartbeat} seconds</span>
                    <span>120 seconds</span>
                  </div>
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-gray-900">Advanced Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'lazyLoading', label: 'Lazy Loading', description: 'Load messages on demand' },
                    { key: 'prefetchChannels', label: 'Prefetch Channels', description: 'Preload channel data' },
                    { key: 'enableCDN', label: 'Enable CDN', description: 'Use content delivery network' },
                    { key: 'enableGzip', label: 'Enable Gzip', description: 'Compress data transfer' },
                    { key: 'enableServiceWorker', label: 'Service Worker', description: 'Enable offline support' }
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{option.label}</h5>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, [option.key]: !prev[option.key as keyof OptimizationSettings] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[option.key as keyof OptimizationSettings] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[option.key as keyof OptimizationSettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Database Connection Pool */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Settings</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Connection Pool Size</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={settings.databaseConnectionPool}
                  onChange={(e) => setSettings(prev => ({ ...prev, databaseConnectionPool: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5 connections</span>
                  <span>{settings.databaseConnectionPool} connections</span>
                  <span>50 connections</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={analyzePerformance}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Performance'}</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={optimizePerformance}
              disabled={isOptimizing}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isOptimizing ? 'Optimizing...' : 'Optimize Performance'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOptimizer;
