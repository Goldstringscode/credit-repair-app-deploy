// lib/database/communication-service.ts
import { createClient } from '@supabase/supabase-js';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id: string;
  message_type?: string;
  parent_message_id?: string;
  attachments?: any[];
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

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: string;
  attachments?: any[];
  is_read?: boolean;
  read_at?: string | null;
  is_edited?: boolean;
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectConversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
  is_pinned?: boolean;
  is_muted?: boolean;
  participants?: DirectConversationParticipant[];
  last_message?: DirectMessage | null;
}

export interface DirectConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  unread_count?: number;
  last_read_at?: string | null;
}

export interface ScheduledMessage {
  id: string;
  channel_id?: string | null;
  user_id: string;
  content: string;
  scheduled_for: string;
  status: string;
  message_type?: string;
  attachments?: any[];
  recurring?: any;
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

function isPlaceholderConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url === 'https://placeholder.supabase.co';
}

function tryGetSupabase() {
  if (isPlaceholderConfig()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(url, key);
}

export class CommunicationService {
  // ─── Channel Messages ───────────────────────────────────────────────

  async getMessages(channelId: string, limit = 50, offset = 0): Promise<Message[]> {
    const supabase = tryGetSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) { console.error('Error fetching messages:', error); return []; }
    return data || [];
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    const supabase = tryGetSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();
    if (error) { console.error('Error fetching message by ID:', error); return null; }
    return data;
  }

  async createMessage(msg: {
    channel_id: string;
    sender_id: string;
    content: string;
    message_type?: string;
    parent_message_id?: string;
    attachments?: any[];
  }): Promise<Message | null> {
    const supabase = tryGetSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('messages')
      .insert([msg])
      .select()
      .single();
    if (error) { console.error('Error creating message:', error); return null; }
    return data;
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message | null> {
    const supabase = tryGetSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single();
    if (error) { console.error('Error updating message:', error); return null; }
    return data;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const supabase = tryGetSupabase();
    if (!supabase) return false;
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
    if (error) { console.error('Error deleting message:', error); return false; }
    return true;
  }

  async getChannelMessages(channelId: string, _userId: string, limit = 50, offset = 0): Promise<Message[]> {
    const supabase = tryGetSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) { console.error('Error fetching channel messages:', error); return []; }
    return data || [];
  }

  // ─── Reactions ───────────────────────────────────────────────────────

  async addReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    const supabase = tryGetSupabase();
    if (!supabase) return false;
    const { error } = await supabase
      .from('message_reactions')
      .insert([{ message_id: messageId, user_id: userId, emoji }]);
    if (error) { console.error('Error adding reaction:', error); return false; }
    return true;
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    const supabase = tryGetSupabase();
    if (!supabase) return false;
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji);
    if (error) { console.error('Error removing reaction:', error); return false; }
    return true;
  }

  // ─── Channels ────────────────────────────────────────────────────────

  async getChannels(): Promise<Channel[]> {
    const supabase = tryGetSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('Error fetching channels:', error); return []; }
    return data || [];
  }

  async getUserChannels(userId: string): Promise<Channel[]> {
    const supabase = tryGetSupabase();
    if (!supabase) return [];

    // Get channel IDs the user is a member of via channel_members junction table
    const { data: memberships } = await supabase
      .from('channel_members')
      .select('channel_id')
      .eq('user_id', userId);

    const memberChannelIds = memberships?.map((m: any) => m.channel_id) ?? [];

    // Also get channels created by the user
    const { data: createdChannels } = await supabase
      .from('channels')
      .select('id')
      .eq('created_by', userId);

    const allIds = [...new Set([...memberChannelIds, ...(createdChannels?.map((c: any) => c.id) ?? [])])];

    if (allIds.length === 0) return [];

    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .in('id', allIds)
      .order('updated_at', { ascending: false });

    if (error) { console.error('Error fetching user channels:', error); return []; }
    return data || [];
  }

  async createChannel(channel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>): Promise<Channel | null> {
    const supabase = tryGetSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('channels')
      .insert([channel])
      .select()
      .single();
    if (error) { console.error('Error creating channel:', error); return null; }
    return data;
  }

  async updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel | null> {
    const supabase = tryGetSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('channels')
      .update(updates)
      .eq('id', channelId)
      .select()
      .single();
    if (error) { console.error('Error updating channel:', error); return null; }
    return data;
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    const supabase = tryGetSupabase();
    if (!supabase) return false;
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);
    if (error) { console.error('Error deleting channel:', error); return false; }
    return true;
  }

  // ─── Direct Messages ─────────────────────────────────────────────────

  async getDirectConversations(userId: string): Promise<DirectConversation[]> {
    const supabase = tryGetSupabase();
    if (!supabase) return [];

    const { data: participantRows, error: pErr } = await supabase
      .from('direct_conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (pErr) { console.error('Error fetching conversation participants:', pErr); return []; }

    const convIds = participantRows?.map((r: any) => r.conversation_id) ?? [];
    if (convIds.length === 0) return [];

    const { data, error } = await supabase
      .from('direct_conversations')
      .select('*, direct_conversation_participants(*)')
      .in('id', convIds)
      .order('updated_at', { ascending: false });

    if (error) { console.error('Error fetching direct conversations:', error); return []; }
    return data || [];
  }

  async getOrCreateDirectConversation(userId: string, recipientId: string): Promise<DirectConversation | null> {
    const supabase = tryGetSupabase();
    if (!supabase) return null;

    // Find existing conversation between these two users
    const { data: userConvs } = await supabase
      .from('direct_conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    const userConvIds = userConvs?.map((r: any) => r.conversation_id) ?? [];

    if (userConvIds.length > 0) {
      const { data: shared } = await supabase
        .from('direct_conversation_participants')
        .select('conversation_id')
        .eq('user_id', recipientId)
        .in('conversation_id', userConvIds);

      if (shared && shared.length > 0) {
        const { data: conv } = await supabase
          .from('direct_conversations')
          .select('*, direct_conversation_participants(*)')
          .eq('id', shared[0].conversation_id)
          .single();
        if (conv) return conv;
      }
    }

    // Create new conversation
    const { data: newConv, error: convErr } = await supabase
      .from('direct_conversations')
      .insert([{}])
      .select()
      .single();

    if (convErr || !newConv) { console.error('Error creating conversation:', convErr); return null; }

    // Add participants
    await supabase
      .from('direct_conversation_participants')
      .insert([
        { conversation_id: newConv.id, user_id: userId },
        { conversation_id: newConv.id, user_id: recipientId },
      ]);

    // Fetch the newly created conversation with participants to ensure full consistency
    const { data: fullConv } = await supabase
      .from('direct_conversations')
      .select('*, direct_conversation_participants(*)')
      .eq('id', newConv.id)
      .single();

    return fullConv ?? newConv;
  }

  async getDirectMessages(conversationId: string, limit = 50, offset = 0): Promise<DirectMessage[]> {
    const supabase = tryGetSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) { console.error('Error fetching direct messages:', error); return []; }
    return data || [];
  }

  async createDirectMessage(msg: {
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type?: string;
    attachments?: any[];
  }): Promise<DirectMessage | null> {
    const supabase = tryGetSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('direct_messages')
      .insert([msg])
      .select()
      .single();

    if (error) { console.error('Error creating direct message:', error); return null; }

    // Update conversation's updated_at and last_message_at
    await supabase
      .from('direct_conversations')
      .update({ updated_at: new Date().toISOString(), last_message_at: new Date().toISOString() })
      .eq('id', msg.conversation_id);

    return data;
  }

  async updateDirectMessage(messageId: string, updates: Partial<DirectMessage>): Promise<DirectMessage | null> {
    const supabase = tryGetSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('direct_messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single();
    if (error) { console.error('Error updating direct message:', error); return null; }
    return data;
  }

  async deleteDirectMessage(messageId: string): Promise<boolean> {
    const supabase = tryGetSupabase();
    if (!supabase) return false;
    const { error } = await supabase
      .from('direct_messages')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', messageId);
    if (error) { console.error('Error deleting direct message:', error); return false; }
    return true;
  }

  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    const supabase = tryGetSupabase();
    if (!supabase) return;
    await supabase
      .from('direct_conversation_participants')
      .update({ unread_count: 0, last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  }

  // ─── Scheduled Messages ──────────────────────────────────────────────

  async getScheduledMessages(userId: string, channelId?: string, status?: string): Promise<ScheduledMessage[]> {
    const supabase = tryGetSupabase();
    if (!supabase) return [];

    let query = supabase
      .from('scheduled_messages')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_for', { ascending: true });

    if (channelId) query = query.eq('channel_id', channelId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) { console.error('Error fetching scheduled messages:', error); return []; }
    return data || [];
  }

  async createScheduledMessage(msg: {
    channel_id: string;
    user_id: string;
    content: string;
    scheduled_for: string;
    message_type?: string;
    attachments?: any[];
    recurring?: any;
  }): Promise<ScheduledMessage | null> {
    const supabase = tryGetSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('scheduled_messages')
      .insert([{ ...msg, status: 'pending' }])
      .select()
      .single();
    if (error) { console.error('Error creating scheduled message:', error); return null; }
    return data;
  }

  async updateScheduledMessage(messageId: string, updates: Partial<ScheduledMessage>): Promise<ScheduledMessage | null> {
    const supabase = tryGetSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('scheduled_messages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single();
    if (error) { console.error('Error updating scheduled message:', error); return null; }
    return data;
  }

  async cancelScheduledMessage(messageId: string): Promise<boolean> {
    const supabase = tryGetSupabase();
    if (!supabase) return false;
    const { error } = await supabase
      .from('scheduled_messages')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('status', 'pending');
    if (error) { console.error('Error cancelling scheduled message:', error); return false; }
    return true;
  }
}

// Singleton instance
export const communicationDatabaseService = new CommunicationService();

// Legacy alias kept for any existing imports
export const communicationService = communicationDatabaseService;
