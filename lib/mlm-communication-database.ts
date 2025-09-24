import { neon } from "@neondatabase/serverless"

// Use the correct environment variable name
const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("Database URL not configured. Please set NEON_DATABASE_URL or DATABASE_URL")
}

const sql = neon(databaseUrl)

export interface MLMChannel {
  id: string
  name: string
  type: 'team' | 'direct' | 'group'
  description?: string
  memberCount: number
  unreadCount: number
  isPrivate: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  lastMessage?: {
    content: string
    sender: {
      id: string
      name: string
      avatar?: string
    }
    timestamp: string
  }
}

export interface MLMMessage {
  id: string
  channelId: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  messageType: 'text' | 'image' | 'file' | 'system'
  sender: {
    id: string
    name: string
    email: string
    avatar?: string
    rank: string
    status: 'online' | 'offline' | 'away' | 'busy'
    lastSeen: Date
  }
  timestamp: string
  createdAt: string
  updatedAt: string
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: string
    size: number
    duration?: number
  }>
  reactions: Array<{
    emoji: string
    userId: string
    timestamp: Date
  }>
  replies: any[]
  isEdited: boolean
  isDeleted: boolean
  isPinned: boolean
  isFlagged: boolean
  isStarred: boolean
  readBy: string[]
}

export class MLMCommunicationDatabase {
  // Initialize database tables
  static async initializeTables() {
    try {
      console.log("Initializing MLM communication tables...")
      console.log("Database URL configured:", !!databaseUrl)

      // Test database connection first
      await sql`SELECT 1 as test`
      console.log("Database connection test successful")

      // Create channels table
      await sql`
        CREATE TABLE IF NOT EXISTS mlm_channels (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('team', 'direct', 'group')),
          description TEXT,
          member_count INTEGER DEFAULT 0,
          unread_count INTEGER DEFAULT 0,
          is_private BOOLEAN DEFAULT FALSE,
          created_by VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log("Channels table created/verified")

      // Create messages table
      await sql`
        CREATE TABLE IF NOT EXISTS mlm_messages (
          id VARCHAR(255) PRIMARY KEY,
          channel_id VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'image', 'file', 'system')),
          message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('text', 'image', 'file', 'system')),
          sender_id VARCHAR(255) NOT NULL,
          sender_name VARCHAR(255) NOT NULL,
          sender_email VARCHAR(255) NOT NULL,
          sender_avatar VARCHAR(500),
          sender_rank VARCHAR(100),
          sender_status VARCHAR(50),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_edited BOOLEAN DEFAULT FALSE,
          is_deleted BOOLEAN DEFAULT FALSE,
          is_pinned BOOLEAN DEFAULT FALSE,
          is_flagged BOOLEAN DEFAULT FALSE,
          is_starred BOOLEAN DEFAULT FALSE,
          read_by TEXT[] DEFAULT '{}',
          FOREIGN KEY (channel_id) REFERENCES mlm_channels(id) ON DELETE CASCADE
        )
      `

      // Create message attachments table
      await sql`
        CREATE TABLE IF NOT EXISTS mlm_message_attachments (
          id VARCHAR(255) PRIMARY KEY,
          message_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          type VARCHAR(100) NOT NULL,
          size INTEGER DEFAULT 0,
          duration INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (message_id) REFERENCES mlm_messages(id) ON DELETE CASCADE
        )
      `

      // Create message reactions table
      await sql`
        CREATE TABLE IF NOT EXISTS mlm_message_reactions (
          id VARCHAR(255) PRIMARY KEY,
          message_id VARCHAR(255) NOT NULL,
          emoji VARCHAR(10) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (message_id) REFERENCES mlm_messages(id) ON DELETE CASCADE
        )
      `

      // Create channel members table
      await sql`
        CREATE TABLE IF NOT EXISTS mlm_channel_members (
          id VARCHAR(255) PRIMARY KEY,
          channel_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_admin BOOLEAN DEFAULT FALSE,
          is_moderator BOOLEAN DEFAULT FALSE,
          FOREIGN KEY (channel_id) REFERENCES mlm_channels(id) ON DELETE CASCADE,
          UNIQUE(channel_id, user_id)
        )
      `

      console.log("MLM communication tables initialized successfully")
    } catch (error) {
      console.error("Error initializing MLM communication tables:", error)
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      })
      throw error
    }
  }

  // Get channels for a user
  static async getChannels(userId: string): Promise<MLMChannel[]> {
    try {
      const channels = await sql`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM mlm_channel_members WHERE channel_id = c.id) as member_count,
          (SELECT COUNT(*) FROM mlm_messages WHERE channel_id = c.id AND NOT (${userId} = ANY(read_by))) as unread_count
        FROM mlm_channels c
        WHERE c.id IN (
          SELECT channel_id FROM mlm_channel_members WHERE user_id = ${userId}
        )
        ORDER BY c.updated_at DESC
      `

      return channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        description: channel.description,
        memberCount: channel.member_count,
        unreadCount: channel.unread_count,
        isPrivate: channel.is_private,
        createdBy: channel.created_by,
        createdAt: channel.created_at.toISOString(),
        updatedAt: channel.updated_at.toISOString()
      }))
    } catch (error) {
      console.error("Error fetching channels:", error)
      throw error
    }
  }

  // Get messages for a channel
  static async getMessages(channelId: string, limit: number = 50, offset: number = 0): Promise<MLMMessage[]> {
    try {
      const messages = await sql`
        SELECT 
          m.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', ma.id,
                'name', ma.name,
                'url', ma.url,
                'type', ma.type,
                'size', ma.size,
                'duration', ma.duration
              )
            ) FILTER (WHERE ma.id IS NOT NULL),
            '[]'::json
          ) as attachments,
          COALESCE(
            json_agg(
              json_build_object(
                'emoji', mr.emoji,
                'userId', mr.user_id,
                'timestamp', mr.timestamp
              )
            ) FILTER (WHERE mr.id IS NOT NULL),
            '[]'::json
          ) as reactions
        FROM mlm_messages m
        LEFT JOIN mlm_message_attachments ma ON m.id = ma.message_id
        LEFT JOIN mlm_message_reactions mr ON m.id = mr.message_id
        WHERE m.channel_id = ${channelId}
        AND m.is_deleted = FALSE
        GROUP BY m.id
        ORDER BY m.timestamp DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `

      return messages.map(message => ({
        id: message.id,
        channelId: message.channel_id,
        content: message.content,
        type: message.type,
        messageType: message.message_type,
        sender: {
          id: message.sender_id,
          name: message.sender_name,
          email: message.sender_email,
          avatar: message.sender_avatar,
          rank: message.sender_rank || 'Member',
          status: message.sender_status || 'offline',
          lastSeen: new Date()
        },
        timestamp: message.timestamp.toISOString(),
        createdAt: message.created_at.toISOString(),
        updatedAt: message.updated_at.toISOString(),
        attachments: message.attachments || [],
        reactions: message.reactions || [],
        replies: [],
        isEdited: message.is_edited,
        isDeleted: message.is_deleted,
        isPinned: message.is_pinned,
        isFlagged: message.is_flagged,
        isStarred: message.is_starred,
        readBy: message.read_by || []
      }))
    } catch (error) {
      console.error("Error fetching messages:", error)
      throw error
    }
  }

  // Create a new message
  static async createMessage(messageData: {
    channelId: string
    content: string
    type: string
    messageType: string
    sender: {
      id: string
      name: string
      email: string
      avatar?: string
      rank: string
      status: string
    }
    attachments?: Array<{
      id: string
      name: string
      url: string
      type: string
      size: number
      duration?: number
    }>
  }): Promise<MLMMessage> {
    try {
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      console.log("Creating message with data:", {
        messageId,
        channelId: messageData.channelId,
        content: messageData.content,
        type: messageData.type,
        sender: messageData.sender,
        attachments: messageData.attachments
      })
      
      // Insert message
      const result = await sql`
        INSERT INTO mlm_messages (
          id, channel_id, content, type, message_type,
          sender_id, sender_name, sender_email, sender_avatar, sender_rank, sender_status
        ) VALUES (
          ${messageId},
          ${messageData.channelId},
          ${messageData.content},
          ${messageData.type},
          ${messageData.messageType},
          ${messageData.sender.id},
          ${messageData.sender.name},
          ${messageData.sender.email},
          ${messageData.sender.avatar || null},
          ${messageData.sender.rank},
          ${messageData.sender.status}
        )
      `
      console.log("Message inserted successfully:", result)

      // Insert attachments if any
      if (messageData.attachments && messageData.attachments.length > 0) {
        console.log("Inserting attachments:", messageData.attachments)
        for (const attachment of messageData.attachments) {
          console.log("Inserting attachment:", attachment)
          const attachmentResult = await sql`
            INSERT INTO mlm_message_attachments (
              id, message_id, name, url, type, size, duration
            ) VALUES (
              ${attachment.id},
              ${messageId},
              ${attachment.name},
              ${attachment.url},
              ${attachment.type},
              ${attachment.size},
              ${attachment.duration || 0}
            )
          `
          console.log("Attachment inserted successfully:", attachmentResult)
        }
      }

      // Update channel's updated_at timestamp
      await sql`
        UPDATE mlm_channels 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${messageData.channelId}
      `

      // Return the created message
      const createdMessage = await this.getMessages(messageData.channelId, 1, 0)
      console.log("Created message retrieved:", createdMessage[0])
      return createdMessage[0]
    } catch (error) {
      console.error("Error creating message:", error)
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        stack: error.stack
      })
      throw error
    }
  }

  // Create a new channel
  static async createChannel(channelData: {
    name: string
    type: string
    description?: string
    isPrivate: boolean
    createdBy: string
  }): Promise<MLMChannel> {
    try {
      const channelId = `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Insert channel
      await sql`
        INSERT INTO mlm_channels (
          id, name, type, description, is_private, created_by
        ) VALUES (
          ${channelId},
          ${channelData.name},
          ${channelData.type},
          ${channelData.description || null},
          ${channelData.isPrivate},
          ${channelData.createdBy}
        )
      `

      // Add creator as member
      await sql`
        INSERT INTO mlm_channel_members (
          id, channel_id, user_id, is_admin
        ) VALUES (
          ${`member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`},
          ${channelId},
          ${channelData.createdBy},
          TRUE
        )
      `

      // Return the created channel
      const channels = await this.getChannels(channelData.createdBy)
      return channels.find(c => c.id === channelId)!
    } catch (error) {
      console.error("Error creating channel:", error)
      throw error
    }
  }
}
