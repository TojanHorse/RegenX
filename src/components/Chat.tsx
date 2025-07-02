import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Search, Send, Image, Smile, MoreVertical, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

interface User {
  _id: string;
  username: string;
  isOnline: boolean;
  lastSeen: string;
}

interface Message {
  _id: string;
  sender: { _id: string; username: string };
  receiver: { _id: string; username: string };
  content: string;
  messageType: 'text' | 'image';
  imageUrl?: string;
  isRead: boolean;
  readAt?: string;
  reactions: Array<{ user: string; emoji: string }>;
  createdAt: string;
  deletedForAll: boolean;
}

const Chat: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket, onlineUsers, typingUsers } = useSocket();
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const emojis = ['❤️', '👍', '😂', '😮', '😢', '😡'];

  useEffect(() => {
    if (searchQuery) {
      searchUsers();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message: Message) => {
        if (selectedChat && 
           (message.sender._id === selectedChat._id || message.receiver._id === selectedChat._id)) {
          setMessages(prev => [...prev, message]);
          
          // Mark as read if chat is open
          if (message.sender._id === selectedChat._id) {
            socket.emit('markAsRead', { messageId: message._id });
          }
        }
      });

      socket.on('messageSent', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('messageRead', ({ messageId }: { messageId: string }) => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
          )
        );
      });

      socket.on('reactionAdded', ({ messageId, emoji, userId }: { messageId: string; emoji: string; userId: string }) => {
        setMessages(prev =>
          prev.map(msg => {
            if (msg._id === messageId) {
              const existingReaction = msg.reactions.find(r => r.user === userId);
              if (existingReaction) {
                existingReaction.emoji = emoji;
              } else {
                msg.reactions.push({ user: userId, emoji });
              }
            }
            return msg;
          })
        );
      });

      return () => {
        socket.off('newMessage');
        socket.off('messageSent');
        socket.off('messageRead');
        socket.off('reactionAdded');
      };
    }
  }, [socket, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const searchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/chat/users/search?query=${searchQuery}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedChat) return;
    
    try {
      const response = await axios.get(`${API_BASE}/chat/messages/${selectedChat._id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !socket) return;

    socket.emit('sendMessage', {
      receiverId: selectedChat._id,
      content: newMessage,
      messageType: 'text'
    });

    setNewMessage('');
    setIsTyping(false);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && selectedChat && socket) {
      setIsTyping(true);
      socket.emit('typing', { receiverId: selectedChat._id, isTyping: true });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedChat && socket) {
        socket.emit('typing', { receiverId: selectedChat._id, isTyping: false });
      }
    }, 1000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat || !socket) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${API_BASE}/chat/upload`, formData);
      
      socket.emit('sendMessage', {
        receiverId: selectedChat._id,
        content: 'Image',
        messageType: 'image',
        imageUrl: response.data.imageUrl
      });
    } catch (error) {
      console.error('Image upload error:', error);
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (socket) {
      socket.emit('addReaction', { messageId, emoji });
    }
    setShowEmojiPicker(null);
  };

  const deleteMessage = async (messageId: string, deleteFor: 'me' | 'all') => {
    try {
      await axios.delete(`${API_BASE}/chat/messages/${messageId}`, {
        data: { deleteFor }
      });
      
      if (deleteFor === 'all') {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      } else {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      }
    } catch (error) {
      console.error('Delete message error:', error);
    }
  };

  return (
    <div className="flex h-full bg-gray-900">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Chats</h2>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {users.map((chatUser) => (
            <div
              key={chatUser._id}
              onClick={() => setSelectedChat(chatUser)}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                selectedChat?._id === chatUser._id ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {chatUser.username[0].toUpperCase()}
                  </div>
                  {onlineUsers.has(chatUser._id) && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{chatUser.username}</h3>
                  <p className="text-sm text-gray-400">
                    {onlineUsers.has(chatUser._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedChat.username[0].toUpperCase()}
                  </div>
                  {onlineUsers.has(selectedChat._id) && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{selectedChat.username}</h3>
                  <p className="text-sm text-gray-400">
                    {typingUsers.has(selectedChat._id) ? 'Typing...' : 
                     onlineUsers.has(selectedChat._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender._id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                      message.sender._id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {message.messageType === 'image' ? (
                      <img
                        src={message.imageUrl}
                        alt="Shared image"
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <p>{message.content}</p>
                    )}

                    {/* Reactions */}
                    {message.reactions.length > 0 && (
                      <div className="flex space-x-1 mt-1">
                        {message.reactions.map((reaction, index) => (
                          <span key={index} className="text-sm">
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Message status */}
                    {message.sender._id === user?.id && (
                      <div className="text-xs text-gray-300 mt-1 flex items-center justify-end">
                        {message.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
                      </div>
                    )}

                    {/* Message actions */}
                    <div className="absolute -top-2 right-0 hidden group-hover:flex bg-gray-800 rounded-full p-1 space-x-1">
                      <button
                        onClick={() => setShowEmojiPicker(showEmojiPicker === message._id ? null : message._id)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Smile size={14} />
                      </button>
                      {message.sender._id === user?.id && (
                        <button
                          onClick={() => deleteMessage(message._id, 'me')}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <MoreVertical size={14} />
                        </button>
                      )}
                    </div>

                    {/* Emoji picker */}
                    {showEmojiPicker === message._id && (
                      <div className="absolute top-full right-0 mt-1 bg-gray-800 rounded-lg p-2 flex space-x-1 z-10">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(message._id, emoji)}
                            className="hover:bg-gray-700 p-1 rounded"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Image size={20} />
                </button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <h3 className="text-xl font-medium mb-2">Select a chat to start messaging</h3>
              <p>Search for users to begin a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;