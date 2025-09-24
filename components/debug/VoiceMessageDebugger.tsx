'use client'

import { useState, useEffect } from 'react'

interface DebugLog {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  data?: any
}

export default function VoiceMessageDebugger() {
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Listen for custom debug events
    const handleDebugLog = (event: CustomEvent) => {
      const { level, message, data } = event.detail
      const newLog: DebugLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        level,
        message,
        data
      }
      setLogs(prev => [newLog, ...prev].slice(0, 50)) // Keep last 50 logs
    }

    window.addEventListener('voice-debug', handleDebugLog as EventListener)
    return () => window.removeEventListener('voice-debug', handleDebugLog as EventListener)
  }, [])

  const clearLogs = () => setLogs([])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500'
      case 'warning': return 'text-yellow-500'
      case 'success': return 'text-green-500'
      case 'info': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      default: return '📝'
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        🐛 Voice Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-black bg-opacity-90 text-white rounded-lg shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center p-3 border-b border-gray-600">
        <h3 className="font-bold">🎤 Voice Message Debugger</h3>
        <div className="flex gap-2">
          <button
            onClick={clearLogs}
            className="text-xs bg-red-600 px-2 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs bg-gray-600 px-2 py-1 rounded"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {logs.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No debug logs yet. Record a voice message to see logs.
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="text-xs border-l-2 border-gray-600 pl-2">
              <div className="flex items-center gap-2">
                <span className={getLevelColor(log.level)}>
                  {getLevelIcon(log.level)}
                </span>
                <span className="text-gray-400">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={getLevelColor(log.level)}>
                  {log.message}
                </span>
              </div>
              {log.data && (
                <div className="mt-1 text-gray-300 text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Helper function to emit debug logs
export const emitVoiceDebug = (level: 'info' | 'warning' | 'error' | 'success', message: string, data?: any) => {
  const event = new CustomEvent('voice-debug', {
    detail: { level, message, data }
  })
  window.dispatchEvent(event)
}

