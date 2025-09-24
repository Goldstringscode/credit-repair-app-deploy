/**
 * Database Connection Test for MLM Communication System
 * Tests Supabase connection and communication database service functionality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { CommunicationDatabaseService } from '../../lib/database/communication-service';
import { databaseConfig, validateDatabaseConfig } from '../../lib/config/database';

describe('Communication Database Connection Tests', () => {
  let dbService: CommunicationDatabaseService;

  beforeAll(async () => {
    // Validate environment configuration before running tests
    try {
      validateDatabaseConfig();
      console.log('✅ Environment configuration validated');
    } catch (error) {
      console.error('❌ Environment configuration failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Cleanup if needed
    console.log('🧹 Test cleanup completed');
  });

  describe('Environment Configuration', () => {
    it('should have valid Supabase URL', () => {
      expect(databaseConfig.supabase.url).toBeDefined();
      expect(databaseConfig.supabase.url).toMatch(/^https:\/\/.*\.supabase\.co$/);
      console.log('✅ Supabase URL is valid:', databaseConfig.supabase.url);
    });

    it('should have valid Supabase service key', () => {
      expect(databaseConfig.supabase.serviceKey).toBeDefined();
      expect(databaseConfig.supabase.serviceKey).toMatch(/^eyJ/); // JWT tokens start with 'eyJ'
      console.log('✅ Supabase service key is valid');
    });

    it('should validate database configuration without errors', () => {
      expect(() => validateDatabaseConfig()).not.toThrow();
      console.log('✅ Database configuration validation passed');
    });
  });

  describe('Database Service Initialization', () => {
    it('should initialize CommunicationDatabaseService without errors', () => {
      expect(() => {
        dbService = new CommunicationDatabaseService();
      }).not.toThrow();
      console.log('✅ CommunicationDatabaseService initialized successfully');
    });

    it('should have access to Supabase client', () => {
      expect(dbService).toBeDefined();
      // The service should be initialized without throwing errors
      console.log('✅ Database service is accessible');
    });
  });

  describe('Database Connection Tests', () => {
    it('should be able to fetch user channels', async () => {
      try {
        const testUserId = '550e8400-e29b-41d4-a716-446655440000';
        const channels = await dbService.getUserChannels(testUserId);
        
        expect(Array.isArray(channels)).toBe(true);
        console.log('✅ Successfully fetched user channels:', channels.length);
        
        // If we have channels, verify their structure
        if (channels.length > 0) {
          const channel = channels[0];
          expect(channel).toHaveProperty('id');
          expect(channel).toHaveProperty('name');
          expect(channel).toHaveProperty('type');
          expect(channel).toHaveProperty('scope');
          console.log('✅ Channel structure is valid:', {
            id: channel.id,
            name: channel.name,
            type: channel.type,
            scope: channel.scope
          });
        }
      } catch (error) {
        console.error('❌ Failed to fetch user channels:', error);
        throw error;
      }
    }, 10000); // 10 second timeout

    it('should be able to fetch channel messages', async () => {
      try {
        const testChannelId = '550e8400-e29b-41d4-a716-446655440001'; // General channel
        const testUserId = '550e8400-e29b-41d4-a716-446655440000';
        
        const messages = await dbService.getChannelMessages(testChannelId, testUserId, 10, 0);
        
        expect(Array.isArray(messages)).toBe(true);
        console.log('✅ Successfully fetched channel messages:', messages.length);
        
        // If we have messages, verify their structure
        if (messages.length > 0) {
          const message = messages[0];
          expect(message).toHaveProperty('id');
          expect(message).toHaveProperty('content');
          expect(message).toHaveProperty('channelId');
          expect(message).toHaveProperty('senderId');
          console.log('✅ Message structure is valid:', {
            id: message.id,
            content: message.content.substring(0, 50) + '...',
            channelId: message.channelId
          });
        }
      } catch (error) {
        console.error('❌ Failed to fetch channel messages:', error);
        throw error;
      }
    }, 10000); // 10 second timeout

    it('should be able to create a test message', async () => {
      try {
        const testChannelId = '550e8400-e29b-41d4-a716-446655440001'; // General channel
        const testUserId = '550e8400-e29b-41d4-a716-446655440000';
        
        const messageData = {
          channelId: testChannelId,
          senderId: testUserId,
          content: `Test message created at ${new Date().toISOString()}`,
          messageType: 'text' as const,
          attachments: []
        };
        
        const createdMessage = await dbService.createMessage(messageData);
        
        expect(createdMessage).toBeDefined();
        expect(createdMessage.id).toBeDefined();
        expect(createdMessage.content).toBe(messageData.content);
        expect(createdMessage.channelId).toBe(testChannelId);
        expect(createdMessage.senderId).toBe(testUserId);
        
        console.log('✅ Successfully created test message:', {
          id: createdMessage.id,
          content: createdMessage.content,
          channelId: createdMessage.channelId
        });
      } catch (error) {
        console.error('❌ Failed to create test message:', error);
        throw error;
      }
    }, 10000); // 10 second timeout
  });

  describe('Database Health Check', () => {
    it('should be able to perform a complete database health check', async () => {
      try {
        const testUserId = '550e8400-e29b-41d4-a716-446655440000';
        
        // Test 1: Fetch channels
        const channels = await dbService.getUserChannels(testUserId);
        console.log('✅ Health check - Channels fetched:', channels.length);
        
        // Test 2: Fetch messages from first channel
        if (channels.length > 0) {
          const messages = await dbService.getChannelMessages(
            channels[0].id, 
            testUserId, 
            5, 
            0
          );
          console.log('✅ Health check - Messages fetched:', messages.length);
        }
        
        // Test 3: Create a test message
        const testMessage = await dbService.createMessage({
          channelId: channels[0]?.id || '550e8400-e29b-41d4-a716-446655440001',
          senderId: testUserId,
          content: `Health check message - ${new Date().toISOString()}`,
          messageType: 'text',
          attachments: []
        });
        console.log('✅ Health check - Test message created:', testMessage.id);
        
        // All tests passed
        console.log('🎉 Database health check completed successfully!');
        expect(true).toBe(true); // This test passes if we reach here
        
      } catch (error) {
        console.error('❌ Database health check failed:', error);
        throw error;
      }
    }, 15000); // 15 second timeout for comprehensive health check
  });
});
