import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Shield, 
  Key, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from 'lucide-react';

interface EncryptionSettings {
  enabled: boolean;
  algorithm: 'AES-256' | 'RSA-2048' | 'ChaCha20-Poly1305';
  keyRotation: number; // days
  endToEnd: boolean;
  messageRetention: number; // days
  autoDelete: boolean;
}

interface MessageEncryptionProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: EncryptionSettings) => void;
  currentSettings?: EncryptionSettings;
}

const MessageEncryption: React.FC<MessageEncryptionProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<EncryptionSettings>({
    enabled: false,
    algorithm: 'AES-256',
    keyRotation: 30,
    endToEnd: true,
    messageRetention: 90,
    autoDelete: false
  });

  const [showKey, setShowKey] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState<'idle' | 'encrypting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const handleSave = () => {
    onSave(settings);
    setEncryptionStatus('success');
    setTimeout(() => {
      onClose();
      setEncryptionStatus('idle');
    }, 2000);
  };

  const generateNewKey = async () => {
    setIsGeneratingKey(true);
    setEncryptionStatus('encrypting');
    
    // Simulate key generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGeneratingKey(false);
    setEncryptionStatus('success');
  };

  const getAlgorithmInfo = (algorithm: string) => {
    const info = {
      'AES-256': {
        name: 'AES-256-GCM',
        description: 'Advanced Encryption Standard with 256-bit keys',
        security: 'Military-grade encryption',
        performance: 'Fast',
        compatibility: 'Excellent'
      },
      'RSA-2048': {
        name: 'RSA-2048',
        description: 'Rivest-Shamir-Adleman with 2048-bit keys',
        security: 'High security for key exchange',
        performance: 'Slower for large messages',
        compatibility: 'Good'
      },
      'ChaCha20-Poly1305': {
        name: 'ChaCha20-Poly1305',
        description: 'Stream cipher with authentication',
        security: 'Modern, secure alternative to AES',
        performance: 'Very fast',
        compatibility: 'Good'
      }
    };
    return info[algorithm as keyof typeof info];
  };

  if (!isOpen) return null;

  const algorithmInfo = getAlgorithmInfo(settings.algorithm);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Message Encryption</h2>
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
            {/* Encryption Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                {settings.enabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {settings.enabled ? 'Encryption Enabled' : 'Encryption Disabled'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {settings.enabled 
                      ? 'All messages are encrypted and secure'
                      : 'Messages are not encrypted. Enable for enhanced security.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Encryption Toggle */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Enable Message Encryption</h3>
                  <p className="text-sm text-gray-600">Encrypt all messages for enhanced security</p>
                </div>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.enabled && (
              <>
                {/* Encryption Algorithm */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Encryption Algorithm</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {(['AES-256', 'RSA-2048', 'ChaCha20-Poly1305'] as const).map((algorithm) => (
                      <label key={algorithm} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="algorithm"
                          value={algorithm}
                          checked={settings.algorithm === algorithm}
                          onChange={(e) => setSettings(prev => ({ ...prev, algorithm: e.target.value as any }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{algorithmInfo.name}</div>
                          <div className="text-sm text-gray-600">{algorithmInfo.description}</div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Security: {algorithmInfo.security}</span>
                            <span>Performance: {algorithmInfo.performance}</span>
                            <span>Compatibility: {algorithmInfo.compatibility}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Key Management */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Key Management</h3>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Current Encryption Key</span>
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showKey ? 'Hide' : 'Show'} Key</span>
                      </button>
                    </div>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                      {showKey ? 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6' : '••••••••••••••••••••••••••••••••'}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        Key rotation: Every {settings.keyRotation} days
                      </span>
                      <button
                        onClick={generateNewKey}
                        disabled={isGeneratingKey}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Key className="w-4 h-4" />
                        <span>{isGeneratingKey ? 'Generating...' : 'Generate New Key'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Advanced Settings</h3>
                  
                  {/* Key Rotation */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Key Rotation Period</h4>
                      <p className="text-sm text-gray-600">How often to generate new encryption keys</p>
                    </div>
                    <select
                      value={settings.keyRotation}
                      onChange={(e) => setSettings(prev => ({ ...prev, keyRotation: parseInt(e.target.value) }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={365}>1 year</option>
                    </select>
                  </div>

                  {/* End-to-End Encryption */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">End-to-End Encryption</h4>
                      <p className="text-sm text-gray-600">Messages are encrypted on device and only decrypted by recipient</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, endToEnd: !prev.endToEnd }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.endToEnd ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.endToEnd ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Message Retention */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Message Retention Period</h4>
                      <p className="text-sm text-gray-600">How long to keep encrypted messages</p>
                    </div>
                    <select
                      value={settings.messageRetention}
                      onChange={(e) => setSettings(prev => ({ ...prev, messageRetention: parseInt(e.target.value) }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={365}>1 year</option>
                      <option value={0}>Forever</option>
                    </select>
                  </div>

                  {/* Auto Delete */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto-Delete Expired Messages</h4>
                      <p className="text-sm text-gray-600">Automatically delete messages after retention period</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, autoDelete: !prev.autoDelete }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoDelete ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoDelete ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Security Notice</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        When encryption is enabled, all messages are encrypted using {settings.algorithm}. 
                        Keys are rotated every {settings.keyRotation} days for enhanced security. 
                        {settings.endToEnd && ' Messages are encrypted end-to-end, ensuring only the sender and recipient can read them.'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
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
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {encryptionStatus === 'success' ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageEncryption;
