'use client'

import React, { useState, useEffect } from 'react'

export default function TestUsersPage() {
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'premium', status: 'pending' }
  ])

  const handleRefresh = () => {
    console.log('Refresh button clicked')
    alert('Refresh button works!')
  }

  const handleExport = () => {
    console.log('Export button clicked')
    alert('Export button works!')
  }

  const handleAddUser = () => {
    console.log('Add User button clicked')
    alert('Add User button works!')
  }

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user clicked:', userId)
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId))
      alert('User deleted!')
    }
  }

  useEffect(() => {
    console.log('TestUsersPage component mounted successfully')
    alert('TestUsersPage loaded!')
  }, [])

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Test Users Page - Direct Route
      </h1>
      
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={handleRefresh}
          style={{
            padding: '8px 16px',
            margin: '4px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
        
        <button 
          onClick={handleExport}
          style={{
            padding: '8px 16px',
            margin: '4px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export
        </button>
        
        <button 
          onClick={handleAddUser}
          style={{
            padding: '8px 16px',
            margin: '4px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add User
        </button>
      </div>

      <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderBottom: '1px solid #d1d5db' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Users ({users.length})</h2>
        </div>
        
        <div style={{ padding: '16px' }}>
          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            <div>
              {users.map((user) => (
                <div 
                  key={user.id} 
                  style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>{user.email}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      Role: {user.role} | Status: {user.status}
                    </div>
                  </div>
                  
                  <div>
                    <button 
                      onClick={() => alert(`View ${user.name}`)}
                      style={{
                        padding: '4px 8px',
                        margin: '2px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      View
                    </button>
                    
                    <button 
                      onClick={() => alert(`Edit ${user.name}`)}
                      style={{
                        padding: '4px 8px',
                        margin: '2px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Edit
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      style={{
                        padding: '4px 8px',
                        margin: '2px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#dc2626'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
        <p>If you can see this text and the buttons work, React is functioning properly.</p>
        <p>Current time: {new Date().toLocaleString()}</p>
        <p>This is a direct route test: /test-users</p>
      </div>
    </div>
  )
}
