import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Ear, 
  MousePointer, 
  Keyboard, 
  Volume2, 
  VolumeX,
  Contrast,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';

interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  voiceOver: boolean;
  audioDescriptions: boolean;
  captions: boolean;
  reducedMotion: boolean;
  focusIndicators: boolean;
  colorBlindSupport: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrastRatio: 'normal' | 'high' | 'maximum';
  zoomLevel: number;
  colorScheme: 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
}

const AccessibilityFeatures: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AccessibilitySettings) => void;
  currentSettings?: AccessibilitySettings;
}> = ({ isOpen, onClose, onSave, currentSettings }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReader: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: true,
    voiceOver: false,
    audioDescriptions: false,
    captions: false,
    reducedMotion: false,
    focusIndicators: true,
    colorBlindSupport: false,
    fontSize: 'medium',
    contrastRatio: 'normal',
    zoomLevel: 100,
    colorScheme: 'normal'
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    wcagLevel: 'A' | 'AA' | 'AAA' | 'F';
    score: number;
    issues: string[];
  } | null>(null);

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const runAccessibilityTest = async () => {
    setIsTesting(true);
    
    // Simulate accessibility testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = {
      wcagLevel: 'AA' as const,
      score: 85,
      issues: [
        'Some images missing alt text',
        'Color contrast could be improved',
        'Focus indicators need enhancement'
      ]
    };
    
    setTestResults(mockResults);
    setIsTesting(false);
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const getWCAGColor = (level: string) => {
    switch (level) {
      case 'AAA': return 'text-green-600 bg-green-100';
      case 'AA': return 'text-blue-600 bg-blue-100';
      case 'A': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Accessibility Features</h2>
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
            {/* Accessibility Test Results */}
            {testResults && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Accessibility Test Results</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getWCAGColor(testResults.wcagLevel)}`}>
                    WCAG {testResults.wcagLevel}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{testResults.score}%</div>
                    <div className="text-sm text-gray-600">Accessibility Score</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Issues Found:</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {testResults.issues.map((issue, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Accessibility */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Visual Accessibility</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Contrast className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">High Contrast</h4>
                      <p className="text-sm text-gray-600">Increase color contrast for better visibility</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Type className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Large Text</h4>
                      <p className="text-sm text-gray-600">Increase text size for better readability</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, largeText: !prev.largeText }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.largeText ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.largeText ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Focus Indicators</h4>
                      <p className="text-sm text-gray-600">Highlight focused elements</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, focusIndicators: !prev.focusIndicators }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.focusIndicators ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.focusIndicators ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Color Blind Support</h4>
                      <p className="text-sm text-gray-600">Adjust colors for color vision deficiency</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, colorBlindSupport: !prev.colorBlindSupport }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.colorBlindSupport ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.colorBlindSupport ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Accessibility */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Audio Accessibility</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Ear className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Screen Reader</h4>
                      <p className="text-sm text-gray-600">Enable screen reader support</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, screenReader: !prev.screenReader }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.screenReader ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.screenReader ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Voice Over</h4>
                      <p className="text-sm text-gray-600">Enable voice narration</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, voiceOver: !prev.voiceOver }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.voiceOver ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.voiceOver ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Audio Descriptions</h4>
                      <p className="text-sm text-gray-600">Describe visual content</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, audioDescriptions: !prev.audioDescriptions }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.audioDescriptions ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.audioDescriptions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Captions</h4>
                      <p className="text-sm text-gray-600">Show text captions for audio</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, captions: !prev.captions }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.captions ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.captions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Motor Accessibility */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Motor Accessibility</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Keyboard className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Keyboard Navigation</h4>
                      <p className="text-sm text-gray-600">Enable keyboard-only navigation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, keyboardNavigation: !prev.keyboardNavigation }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.keyboardNavigation ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MousePointer className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Reduced Motion</h4>
                      <p className="text-sm text-gray-600">Minimize animations and transitions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Display Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Font Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
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
                  <label className="block text-sm font-medium text-gray-700">Contrast Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'high', 'maximum'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setSettings(prev => ({ ...prev, contrastRatio: ratio }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          settings.contrastRatio === ratio
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {ratio.charAt(0).toUpperCase() + ratio.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Zoom Level</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, zoomLevel: Math.max(50, prev.zoomLevel - 10) }))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="10"
                      value={settings.zoomLevel}
                      onChange={(e) => setSettings(prev => ({ ...prev, zoomLevel: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, zoomLevel: Math.min(200, prev.zoomLevel + 10) }))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 w-12">{settings.zoomLevel}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Color Scheme</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {(['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'monochrome'] as const).map((scheme) => (
                    <button
                      key={scheme}
                      onClick={() => setSettings(prev => ({ ...prev, colorScheme: scheme }))}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        settings.colorScheme === scheme
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={runAccessibilityTest}
            disabled={isTesting}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test Accessibility'}</span>
          </button>
          <div className="flex items-center space-x-3">
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
    </div>
  );
};

export default AccessibilityFeatures;
