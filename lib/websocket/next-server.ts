/**
 * Next.js WebSocket Server Setup
 * Integrates WebSocket server with Next.js HTTP server
 */

import { NextRequest } from 'next/server';
import { Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';
import MLMWebSocketServer from './server';

let wsServer: MLMWebSocketServer | null = null;

export function initializeWebSocketServer(server: HTTPServer | HTTPSServer) {
  if (!wsServer) {
    wsServer = new MLMWebSocketServer(server);
    console.log('🔌 WebSocket server initialized');
  }
  return wsServer;
}

export function getWebSocketServer(): MLMWebSocketServer | null {
  return wsServer;
}

// For CommonJS compatibility
module.exports = {
  initializeWebSocketServer,
  getWebSocketServer
};

// API route handler for WebSocket upgrade
export async function handleWebSocketUpgrade(request: NextRequest) {
  // This would be handled by the HTTP server directly
  // Next.js API routes don't support WebSocket upgrades
  return new Response('WebSocket upgrade not supported in API routes', { status: 400 });
}
