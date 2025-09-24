const fs = require('fs');
const path = require('path');

// Path to the messages file
const messagesPath = path.join(__dirname, '..', 'data', 'mlm-messages', 'messages.json');

try {
  // Read the current messages
  const messagesData = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
  
  let totalMessages = 0;
  let voiceMessages = 0;
  let cleanedMessages = 0;
  
  // Process each channel
  Object.keys(messagesData).forEach(channelId => {
    const channelMessages = messagesData[channelId];
    totalMessages += channelMessages.length;
    
    // Filter out voice messages with blob URLs
    const cleanedChannelMessages = channelMessages.filter(message => {
      // Check if it's a voice message
      if (message.type === 'audio' || message.messageType === 'audio') {
        voiceMessages++;
        
        // Check if any attachment has a blob URL
        const hasBlobUrl = message.attachments && message.attachments.some(attachment => 
          attachment.url && attachment.url.startsWith('blob:')
        );
        
        if (hasBlobUrl) {
          console.log(`Removing voice message with blob URL: ${message.id}`);
          cleanedMessages++;
          return false; // Remove this message
        }
      }
      
      return true; // Keep this message
    });
    
    messagesData[channelId] = cleanedChannelMessages;
  });
  
  // Write the cleaned messages back to the file
  fs.writeFileSync(messagesPath, JSON.stringify(messagesData, null, 2));
  
  console.log('✅ Cleanup completed!');
  console.log(`📊 Total messages: ${totalMessages}`);
  console.log(`🎤 Voice messages found: ${voiceMessages}`);
  console.log(`🧹 Voice messages with blob URLs removed: ${cleanedMessages}`);
  console.log(`📝 Remaining messages: ${totalMessages - cleanedMessages}`);
  
} catch (error) {
  console.error('❌ Error cleaning up messages:', error);
}

