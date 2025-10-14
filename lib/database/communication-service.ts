// lib/database/communication-service.ts
import { getSupabaseClient } from '@/lib/supabase-client';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id: string;
  is_edited?: boolean;
  is_deleted?: boolean;
  is_pinned?: boolean;
  is_flagged?: boolean;
  is_starred?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
  scope: string;
  created_by: string;
  members?: string[];
  is_private?: boolean;
  created_at: string;
  updated_at: string;
}

export class CommunicationService {
  // Messages
  async getMessages(channelId: string, limit = 50, offset = 0): Promise<Message[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (error) {
      console.error('Error fetching message by ID:', error);
      return null;
    }

    return data;
  }

  async createMessage(message: Omit<Message, 'id' | 'created_at' | 'updated_at'>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return null;
    }

    return data;
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return null;
    }

    return data;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }

    return true;
  }

  async getChannelMessages(channelId: string, userId: string, limit = 50, offset = 0): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching channel messages:', error);
      return [];
    }

    return data || [];
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    const { error } = await supabase
      .from('message_reactions')
      .insert([{
        message_id: messageId,
        user_id: userId,
        emoji: emoji
      }]);

    if (error) {
      console.error('Error adding reaction:', error);
      return false;
    }

    return true;
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji);

    if (error) {
      console.error('Error removing reaction:', error);
      return false;
    }

    return true;
  }

  // Channels
  async getChannels(): Promise<Channel[]> {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching channels:', error);
      return [];
    }

    return data || [];
  }

  async getUserChannels(userId: string): Promise<Channel[]> {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .or(`created_by.eq.${userId},members.cs.{${userId}}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user channels:', error);
      return [];
    }

    return data || [];
  }

  async createChannel(channel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>): Promise<Channel | null> {
    const { data, error } = await supabase
      .from('channels')
      .insert([channel])
      .select()
      .single();

    if (error) {
      console.error('Error creating channel:', error);
      return null;
    }

    return data;
  }

  async updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel | null> {
    const { data, error } = await supabase
      .from('channels')
      .update(updates)
      .eq('id', channelId)
      .select()
      .single();

    if (error) {
      console.error('Error updating channel:', error);
      return null;
    }

    return data;
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);

    if (error) {
      console.error('Error deleting channel:', error);
      return false;
    }

    return true;
  }
}

// Export singleton instance with lazy initialization
let _communicationService: CommunicationService | null = null

export const communicationService = {
  get instance() {
    if (!_communicationService) {
      _communicationService = new CommunicationService()
    }
    return _communicationService
  }
}

export const communicationDatabaseService = communicationService;
