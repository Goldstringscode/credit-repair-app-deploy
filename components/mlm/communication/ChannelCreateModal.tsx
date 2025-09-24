'use client';

import React, { useState } from 'react';
import { 
  X, 
  Hash, 
  User, 
  Bell, 
  Award, 
  Shield, 
  Lock, 
  Globe, 
  Users, 
  MessageCircle,
  Plus,
  Check
} from 'lucide-react';

interface ChannelCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (channelData: ChannelData) => void;
  teamMembers: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    rank: string;
  }>;
}

interface ChannelData {
  name: string;
  type: 'team' | 'direct' | 'announcement' | 'training' | 'support';
  description: string;
  isPrivate: boolean;
  members: string[];
  permissions: {
    canSendMessages: boolean;
    canAddMembers: boolean;
    canManageChannel: boolean;
  };
}

const channelTypes = [
  {
    value: 'team',
    label: 'Team Channel',
    description: 'General team discussions and collaboration',
    icon: <Hash className="w-5 h-5" />,
    color: 'text-gray-600',
  },
  {
    value: 'announcement',
    label: 'Announcement',
    description: 'Important team announcements and updates',
    icon: <Bell className="w-5 h-5" />,
    color: 'text-yellow-600',
  },
  {
    value: 'training',
    label: 'Training',
    description: 'Training materials and educational content',
    icon: <Award className="w-5 h-5" />,
    color: 'text-blue-600',
  },
  {
    value: 'support',
    label: 'Support',
    description: 'Technical support and help desk',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-purple-600',
  },
];

export default function ChannelCreateModal({
  isOpen,
  onClose,
  onCreateChannel,
  teamMembers,
}: ChannelCreateModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ChannelData>({
    name: '',
    type: 'team',
    description: '',
    isPrivate: false,
    members: [],
    permissions: {
      canSendMessages: true,
      canAddMembers: true,
      canManageChannel: true,
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Channel name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Channel name must be at least 2 characters';
    } else if (!/^[a-z0-9-_]+$/.test(formData.name)) {
      newErrors.name = 'Channel name can only contain lowercase letters, numbers, hyphens, and underscores';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.members.length === 0) {
      newErrors.members = 'Please select at least one team member';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep1() && validateStep2()) {
      onCreateChannel(formData);
      onClose();
      setStep(1);
      setFormData({
        name: '',
        type: 'team',
        description: '',
        isPrivate: false,
        members: [],
        permissions: {
          canSendMessages: true,
          canAddMembers: true,
          canManageChannel: true,
        },
      });
      setErrors({});
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(memberId)
        ? prev.members.filter(id => id !== memberId)
        : [...prev.members, memberId]
    }));
  };

  const handleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      members: teamMembers.map(member => member.id)
    }));
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({
      ...prev,
      members: []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Channel</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-8">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                  </div>
                  <div className="ml-2 text-sm text-gray-600">
                    {stepNumber === 1 ? 'Basic Info' : stepNumber === 2 ? 'Members' : 'Permissions'}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-8 h-0.5 ml-4 ${
                      step > stepNumber ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {channelTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${
                          formData.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={type.color}>{type.icon}</div>
                          <div>
                            <div className="font-medium text-gray-900">{type.label}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel Name
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">#</span>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="channel-name"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What is this channel about?"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-gray-700">
                    Make this a private channel
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Select Members</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => handleMemberToggle(member.id)}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        formData.members.includes(member.id)
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={member.avatar || '/default-avatar.png'}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        {formData.members.includes(member.id) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <div className="text-sm text-gray-600">{member.rank}</div>
                    </div>
                  ))}
                </div>

                {errors.members && (
                  <p className="text-sm text-red-600">{errors.members}</p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Channel Permissions</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Send Messages</div>
                      <div className="text-sm text-gray-500">Allow members to send messages in this channel</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.canSendMessages}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canSendMessages: e.target.checked }
                      }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Add Members</div>
                      <div className="text-sm text-gray-500">Allow members to invite others to this channel</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.canAddMembers}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canAddMembers: e.target.checked }
                      }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Manage Channel</div>
                      <div className="text-sm text-gray-500">Allow members to edit channel settings and permissions</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permissions.canManageChannel}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, canManageChannel: e.target.checked }
                      }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={step === 1 ? onClose : handleBack}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <div className="flex space-x-3">
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors"
                >
                  Create Channel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
