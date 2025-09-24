'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestOpenAIPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [envVars, setEnvVars] = useState<any>({});

  const addResult = (test: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testEnvironmentVariables = async () => {
    addResult('Environment Variables', 'pending', 'Checking environment variables...');
    
    try {
      const response = await fetch('/api/test-openai/env-check');
      const data = await response.json();
      
      if (response.ok) {
        setEnvVars(data);
        addResult('Environment Variables', 'success', 'Environment variables loaded successfully', data);
      } else {
        addResult('Environment Variables', 'error', 'Failed to load environment variables', data);
      }
    } catch (error) {
      addResult('Environment Variables', 'error', 'Error checking environment variables', error);
    }
  };

  const testOpenAIConnection = async () => {
    addResult('OpenAI Connection', 'pending', 'Testing OpenAI API connection...');
    
    try {
      const response = await fetch('/api/test-openai/connection-test');
      const data = await response.json();
      
      if (response.ok) {
        addResult('OpenAI Connection', 'success', 'OpenAI API connection successful', data);
      } else {
        addResult('OpenAI Connection', 'error', 'OpenAI API connection failed', data);
      }
    } catch (error) {
      addResult('OpenAI Connection', 'error', 'Error testing OpenAI connection', error);
    }
  };

  const testSimpleGeneration = async () => {
    addResult('Simple Generation', 'pending', 'Testing simple text generation...');
    
    try {
      const response = await fetch('/api/test-openai/simple-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Generate a simple test response in 10 words or less.'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addResult('Simple Generation', 'success', 'Simple generation successful', data);
      } else {
        addResult('Simple Generation', 'error', 'Simple generation failed', data);
      }
    } catch (error) {
      addResult('Simple Generation', 'error', 'Error testing simple generation', error);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    await testEnvironmentVariables();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testOpenAIConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testSimpleGeneration();
    
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            OpenAI API Connection Test
          </h1>
          <p className="text-gray-600 mb-6">
            This page tests the OpenAI API connection and functionality step by step.
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Clear Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testEnvironmentVariables}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
            >
              Test Environment
            </button>
            
            <button
              onClick={testOpenAIConnection}
              disabled={isRunning}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
            >
              Test OpenAI Connection
            </button>
            
            <button
              onClick={testSimpleGeneration}
              disabled={isRunning}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
            >
              Test Generation
            </button>
          </div>
        </div>

        {/* Environment Variables Display */}
        {Object.keys(envVars).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables</h2>
            <div className="bg-gray-100 rounded-lg p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(envVars, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tests run yet. Click "Run All Tests" to start.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : result.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{result.test}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : result.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{result.message}</p>
                  
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        View Details
                      </summary>
                      <div className="mt-2 bg-gray-100 rounded p-3">
                        <pre className="text-xs text-gray-800 overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
