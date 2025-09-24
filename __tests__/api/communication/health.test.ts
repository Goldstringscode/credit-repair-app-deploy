/**
 * API Health Check Test for MLM Communication System
 * Tests the database health check API endpoint
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Communication API Health Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  beforeAll(async () => {
    console.log('🚀 Starting Communication API Health Tests');
    console.log('Base URL:', baseUrl);
  });

  describe('Database Health Check API', () => {
    it('should respond to database health check endpoint', async () => {
      try {
        const response = await fetch(`${baseUrl}/api/health/database`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        expect(response.status).toBe(200);
        
        const data = await response.json();
        expect(data).toHaveProperty('status');
        expect(data.status).toBe('healthy');
        expect(data).toHaveProperty('timestamp');
        expect(data).toHaveProperty('database');
        
        console.log('✅ Database health check API responded successfully:', data);
      } catch (error) {
        console.error('❌ Database health check API failed:', error);
        throw error;
      }
    }, 10000); // 10 second timeout

    it('should include database connection details in health check', async () => {
      try {
        const response = await fetch(`${baseUrl}/api/health/database`);
        const data = await response.json();

        expect(data.database).toBeDefined();
        expect(data.database).toHaveProperty('connected');
        expect(data.database.connected).toBe(true);
        
        console.log('✅ Database connection details:', data.database);
      } catch (error) {
        console.error('❌ Database connection details check failed:', error);
        throw error;
      }
    }, 10000);
  });

  describe('Communication API Endpoints', () => {
    it('should respond to channels API endpoint', async () => {
      try {
        const response = await fetch(`${baseUrl}/api/mlm/communications/channels`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Should either return 200 with data or 401/403 for auth
        expect([200, 401, 403]).toContain(response.status);
        
        if (response.status === 200) {
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
          console.log('✅ Channels API responded with data:', data.length);
        } else {
          console.log('✅ Channels API responded with auth required (expected)');
        }
      } catch (error) {
        console.error('❌ Channels API test failed:', error);
        throw error;
      }
    }, 10000);

    it('should respond to messages API endpoint', async () => {
      try {
        const testChannelId = '550e8400-e29b-41d4-a716-446655440001';
        const response = await fetch(`${baseUrl}/api/mlm/communications/messages?channelId=${testChannelId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Should either return 200 with data or 401/403 for auth
        expect([200, 401, 403]).toContain(response.status);
        
        if (response.status === 200) {
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
          console.log('✅ Messages API responded with data:', data.length);
        } else {
          console.log('✅ Messages API responded with auth required (expected)');
        }
      } catch (error) {
        console.error('❌ Messages API test failed:', error);
        throw error;
      }
    }, 10000);
  });
});
