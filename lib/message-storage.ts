import fs from 'fs'
import path from 'path'

const STORAGE_DIR = path.join(process.cwd(), 'data', 'mlm-messages')
const MESSAGES_FILE = path.join(STORAGE_DIR, 'messages.json')

// Ensure storage directory exists
const ensureStorageDir = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
    console.log('📁 Created MLM messages storage directory')
  }
}

// Load messages from file
export const loadMessages = (): { [channelId: string]: any[] } => {
  try {
    ensureStorageDir()
    
    if (!fs.existsSync(MESSAGES_FILE)) {
      console.log('📄 Messages file does not exist, creating new one')
      return {}
    }

    const data = fs.readFileSync(MESSAGES_FILE, 'utf8')
    const messages = JSON.parse(data)
    console.log(`📄 Loaded messages from file: ${Object.keys(messages).length} channels`)
    return messages
  } catch (error) {
    console.error('Error loading messages:', error)
    return {}
  }
}

// Save messages to file
export const saveMessages = (messages: { [channelId: string]: any[] }) => {
  try {
    ensureStorageDir()
    
    const data = JSON.stringify(messages, null, 2)
    fs.writeFileSync(MESSAGES_FILE, data, 'utf8')
    console.log(`💾 Saved messages to file: ${Object.keys(messages).length} channels`)
  } catch (error) {
    console.error('Error saving messages:', error)
  }
}

// Get messages for a specific channel
export const getChannelMessages = (channelId: string): any[] => {
  const allMessages = loadMessages()
  return allMessages[channelId] || []
}

// Save a message to a specific channel
export const saveChannelMessage = (channelId: string, message: any) => {
  const allMessages = loadMessages()
  const channelMessages = allMessages[channelId] || []
  
  // Add the new message
  channelMessages.push(message)
  allMessages[channelId] = channelMessages
  
  // Save to file
  saveMessages(allMessages)
  
  console.log(`💾 Saved message to channel ${channelId}:`, message.id)
  return message
}

// Update messages for a specific channel
export const updateChannelMessages = (channelId: string, messages: any[]) => {
  const allMessages = loadMessages()
  allMessages[channelId] = messages
  saveMessages(allMessages)
  
  console.log(`💾 Updated ${messages.length} messages for channel ${channelId}`)
}
