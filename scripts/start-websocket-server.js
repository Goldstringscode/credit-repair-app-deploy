#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MLM WebSocket Server...');

// Change to the server directory
process.chdir(path.join(__dirname, '..', 'server'));

// Start the WebSocket server
const server = spawn('node', ['websocket-server.js'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Failed to start WebSocket server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`📡 WebSocket server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  server.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ WebSocket server started successfully!');
console.log('📡 Server running on ws://localhost:3001');
console.log('💡 Press Ctrl+C to stop the server');
