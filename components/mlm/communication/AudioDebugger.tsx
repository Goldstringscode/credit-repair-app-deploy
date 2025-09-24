'use client';

import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface AudioDebugInfo {
  id: string;
  timestamp: string;
  type: 'recording' | 'storage' | 'loading' | 'playback' | 'error';
  message: string;
  data?: any;
}

interface AudioDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AudioDebugger({ isOpen, onClose }: AudioDebuggerProps) {
  const [debugLogs, setDebugLogs] = useState<AudioDebugInfo[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);

  // Add debug log function
  const addDebugLog = (type: AudioDebugInfo['type'], message: string, data?: any) => {
    const log: AudioDebugInfo = {
      id: `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    };
    
    setDebugLogs(prev => {
      const newLogs = [...prev, log];
      // Keep only last 50 logs to prevent memory issues
      return newLogs.slice(-50);
    });
  };

  // Expose debug function globally
  useEffect(() => {
    (window as any).addAudioDebugLog = addDebugLog;
    return () => {
      delete (window as any).addAudioDebugLog;
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll) {
      const debugContainer = document.getElementById('audio-debug-container');
      if (debugContainer) {
        debugContainer.scrollTop = debugContainer.scrollHeight;
      }
    }
  }, [debugLogs, autoScroll]);

  const filteredLogs = filter === 'all' 
    ? debugLogs 
    : debugLogs.filter(log => log.type === filter);

  const getLogIcon = (type: AudioDebugInfo['type']) => {
    switch (type) {
      case 'recording': return <Play className="w-4 h-4 text-blue-500" />;
      case 'storage': return <Download className="w-4 h-4 text-green-500" />;
      case 'loading': return <Volume2 className="w-4 h-4 text-yellow-500" />;
      case 'playback': return <Play className="w-4 h-4 text-purple-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLogColor = (type: AudioDebugInfo['type']) => {
    switch (type) {
      case 'recording': return 'bg-blue-50 border-blue-200';
      case 'storage': return 'bg-green-50 border-green-200';
      case 'loading': return 'bg-yellow-50 border-yellow-200';
      case 'playback': return 'bg-purple-50 border-purple-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  const exportLogs = () => {
    const logText = debugLogs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}${log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">🎤 Audio Debugger</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear
            </button>
            <button
              onClick={exportLogs}
              className="px-3 py-1 text-sm bg-blue-200 text-blue-700 rounded hover:bg-blue-300"
            >
              Export
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 p-4 border-b bg-gray-50">
          <span className="text-sm font-medium text-gray-600">Filter:</span>
          {['all', 'recording', 'storage', 'loading', 'playback', 'error'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 text-xs rounded-full capitalize ${
                filter === filterType 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterType}
            </button>
          ))}
          <div className="flex items-center space-x-2 ml-auto">
            <label className="flex items-center space-x-1 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              <span>Auto-scroll</span>
            </label>
          </div>
        </div>

        {/* Debug Logs */}
        <div 
          id="audio-debug-container"
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No debug logs yet. Record a voice message to see debugging information.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border ${getLogColor(log.type)}`}
              >
                <div className="flex items-start space-x-2">
                  {getLogIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">
                        {log.timestamp}
                      </span>
                      <span className="text-xs font-semibold uppercase text-gray-600">
                        {log.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1 break-words">
                      {log.message}
                    </p>
                    {log.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                          View Data
                        </summary>
                        <pre className="text-xs text-gray-700 mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
          Total logs: {debugLogs.length} | Filtered: {filteredLogs.length}
        </div>
      </div>
    </div>
  );
}
