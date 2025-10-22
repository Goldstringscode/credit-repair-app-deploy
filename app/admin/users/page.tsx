'use client'

import React from 'react'

export default function AdminUsersPage() {
  console.log('AdminUsersPage component rendering - MINIMAL VERSION')
  
  // Test if basic JavaScript works
  try {
    console.log('Testing basic JavaScript functionality...')
    const testFunction = () => {
      console.log('Test function works!')
      return 'success'
    }
    const result = testFunction()
    console.log('JavaScript test result:', result)
  } catch (error) {
    console.error('JavaScript test failed:', error)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users Management - MINIMAL TEST</h1>
      <p className="text-xs text-blue-600">Version: {new Date().toISOString()}</p>
      
      <div className="mt-4">
        <button 
          onClick={() => {
            console.log('HTML button clicked!')
            alert('HTML button works!')
          }} 
          style={{
            padding: '12px 24px', 
            margin: '8px', 
            border: '2px solid #007bff', 
            backgroundColor: '#007bff', 
            color: 'white', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          TEST BUTTON - Click Me!
        </button>
        
        <button 
          onClick={() => {
            console.log('Second button clicked!')
            alert('Second button works!')
          }} 
          style={{
            padding: '12px 24px', 
            margin: '8px', 
            border: '2px solid #28a745', 
            backgroundColor: '#28a745', 
            color: 'white', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          SECOND TEST BUTTON
        </button>
      </div>
      
      <div className="mt-4">
        <p>If you can see this text, React is working.</p>
        <p>If you can click the buttons above, JavaScript is working.</p>
        <p>Current time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}