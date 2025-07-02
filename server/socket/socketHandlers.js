import User from '../models/User.js';
import Message from '../models/Message.js';

const activeUsers = new Map();
const typingUsers = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining
    socket.on('join', async (userId) => {
      try {
        socket.userId = userId;
        activeUsers.set(userId, socket.id);
        
        await User.findByIdAndUpdate(userId, { isOnline: true });
        
        // Notify others about online status
        socket.broadcast.emit('userOnline', userId);
      } catch (error) {
        console.error('Join error:', error);
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, content, messageType, imageUrl } = data;
        
        const message = new Message({
          sender: socket.userId,
          receiver: receiverId,
          content,
          messageType: messageType || 'text',
          imageUrl
        });
        
        await message.save();
        await message.populate('sender receiver', 'username');
        
        // Send to receiver if online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', message);
        }
        
        // Send back to sender
        socket.emit('messageSent', message);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('messageError', { error: error.message });
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ receiverId, isTyping }) => {
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.userId,
          isTyping
        });
      }
    });

    // Handle message read receipts
    socket.on('markAsRead', async ({ messageId }) => {
      try {
        const message = await Message.findByIdAndUpdate(messageId, {
          isRead: true,
          readAt: new Date()
        }, { new: true });
        
        const senderSocketId = activeUsers.get(message.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageRead', { messageId });
        }
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle reactions
    socket.on('addReaction', async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        const existingReaction = message.reactions.find(r => r.user.toString() === socket.userId);
        
        if (existingReaction) {
          existingReaction.emoji = emoji;
        } else {
          message.reactions.push({ user: socket.userId, emoji });
        }
        
        await message.save();
        
        // Notify both users
        const senderSocketId = activeUsers.get(message.sender.toString());
        const receiverSocketId = activeUsers.get(message.receiver.toString());
        
        const reactionData = { messageId, emoji, userId: socket.userId };
        
        if (senderSocketId) io.to(senderSocketId).emit('reactionAdded', reactionData);
        if (receiverSocketId) io.to(receiverSocketId).emit('reactionAdded', reactionData);
      } catch (error) {
        console.error('Add reaction error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      
      if (socket.userId) {
        activeUsers.delete(socket.userId);
        typingUsers.delete(socket.userId);
        
        try {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date()
          });
          
          socket.broadcast.emit('userOffline', socket.userId);
        } catch (error) {
          console.error('Disconnect error:', error);
        }
      }
    });
  });
};