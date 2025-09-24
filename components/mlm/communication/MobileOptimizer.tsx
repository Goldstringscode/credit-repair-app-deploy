import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  Battery, 
  Hand,
  Eye,
  Volume2,
  Vibrate,
  Settings,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';

interface MobileSettings {
  touchOptimization: boolean;
  gestureNavigation: boolean;
  hapticFeedback: boolean;
  voiceMessages: boolean;
  pushNotifications: boolean;
  offlineMode: boolean;
  dataSaver: boolean;
  autoPlay: boolean;
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'auto';
  orientation: 'portrait' | 'landscape' | 'auto';
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  screenSize: string;
  orientation: 'portrait' | 'landscape';
  touchSupport: boolean;
  batteryLevel?: number;
  connectionType: 'wifi' | 'cellular' | 'ethernet';
}

const MobileOptimizer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: MobileSettings) => void;
  currentSettings?: MobileSettings;
}> = ({ isOpen, onClose, onSave, currentSettings }) => {
  const [settings, setSettings] = useState<MobileSettings>({
    touchOptimization: true,
    gestureNavigation: true,
    hapticFeedback: true,
    voiceMessages: true,
    pushNotifications: true,
    offlineMode: false,
    dataSaver: false,
    autoPlay: true,
    fontSize: 'medium',
    theme: 'auto',
    orientation: 'auto'
  });

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  useEffect(() => {
    if (isOpen) {
      detectDevice();
    }
  }, [isOpen]);

  const detectDevice = async () => {
    setIsDetecting(true);
    
    // Simulate device detection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockDeviceInfo: DeviceInfo = {
      type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      touchSupport: 'ontouchstart' in window,
      batteryLevel: Math.random() * 100,
      connectionType: 'wifi'
    };
    
    setDeviceInfo(mockDeviceInfo);
    setIsDetecting(false);
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-6 h-6" />;
      case 'tablet': return <Tablet className="w-6 h-6" />;
      default: return <Monitor className="w-6 h-6" />;
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'cellular': return <Smartphone className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Mobile Optimization</h2>
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
            {/* Device Detection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Device Detection</h3>
              {isDetecting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Detecting device...</span>
                </div>
              ) : deviceInfo ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(deviceInfo.type)}
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{deviceInfo.type}</div>
                      <div className="text-sm text-gray-600">{deviceInfo.screenSize}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getConnectionIcon(deviceInfo.connectionType)}
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{deviceInfo.connectionType}</div>
                      <div className="text-sm text-gray-600">
                        {deviceInfo.batteryLevel && `${deviceInfo.batteryLevel.toFixed(0)}% battery`}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Hand Optimization */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Hand Optimization</h3>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Hand className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Hand Optimization</h4>
                    <p className="text-sm text-gray-600">Optimize interface for touch interactions</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, touchOptimization: !prev.touchOptimization }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.touchOptimization ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.touchOptimization ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Gesture Navigation</h4>
                    <p className="text-sm text-gray-600">Enable swipe gestures for navigation</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, gestureNavigation: !prev.gestureNavigation }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.gestureNavigation ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.gestureNavigation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Vibrate className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Haptic Feedback</h4>
                    <p className="text-sm text-gray-600">Vibrate on touch interactions</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, hapticFeedback: !prev.hapticFeedback }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.hapticFeedback ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.hapticFeedback ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Media Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Media Settings</h3>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Voice Messages</h4>
                    <p className="text-sm text-gray-600">Enable voice message recording</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, voiceMessages: !prev.voiceMessages }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.voiceMessages ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.voiceMessages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Auto Play</h4>
                    <p className="text-sm text-gray-600">Automatically play media content</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoPlay ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoPlay ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Display Settings</h3>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Font Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSettings(prev => ({ ...prev, fontSize: size }))}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        settings.fontSize === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'auto'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setSettings(prev => ({ ...prev, theme }))}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        settings.theme === theme
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Orientation</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['portrait', 'landscape', 'auto'] as const).map((orientation) => (
                    <button
                      key={orientation}
                      onClick={() => setSettings(prev => ({ ...prev, orientation }))}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        settings.orientation === orientation
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Data & Performance */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Data & Performance</h3>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wifi className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Data Saver</h4>
                    <p className="text-sm text-gray-600">Reduce data usage for slower connections</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, dataSaver: !prev.dataSaver }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.dataSaver ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.dataSaver ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Battery className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Offline Mode</h4>
                    <p className="text-sm text-gray-600">Enable offline message caching</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, offlineMode: !prev.offlineMode }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.offlineMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.offlineMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications for new messages</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
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

export default MobileOptimizer;
