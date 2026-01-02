'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { FiX, FiSend } from 'react-icons/fi';
import { useSocket } from '@/contexts/SocketContext';

export default function ChatModal({ roomId, onClose }) {
  const { data: session } = useSession();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    // Load room and messages
    const loadData = async () => {
      try {
        // Load room info
        const roomsResponse = await fetch('/api/chat/rooms');
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          const foundRoom = roomsData.rooms?.find((r) => r._id === roomId);
          if (foundRoom) {
            setRoom(foundRoom);
          }
        }

        // Load messages
        const messagesResponse = await fetch(`/api/chat/rooms/${roomId}/messages`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData.messages || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for new messages
    if (socket) {
      socket.emit('joinRoom', roomId);
      
      socket.on('newMessage', (message) => {
        if (message.chatRoomId === roomId || message.chatRoomId?.toString() === roomId) {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m._id === message._id)) {
              return prev;
            }
            return [...prev, message];
          });
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit('leaveRoom', roomId);
        socket.off('newMessage');
      }
    };
  }, [roomId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: newMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add message to local state immediately
      setMessages((prev) => [...prev, data.message]);
      
      // Emit via socket for real-time updates
      if (socket) {
        socket.emit('sendMessage', {
          chatRoomId: roomId,
          message: data.message,
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getMessageSender = (message) => {
    // Check if this is an anonymous room and the message is from the other participant
    if (room?.isAnonymous) {
      const messageSenderId = message.senderId?._id || message.senderId;
      const currentUserId = session?.user?.id;
      
      // If the message is not from the current user, show as anonymous
      if (messageSenderId !== currentUserId) {
        return { name: 'Anonymous', image: null };
      }
    }
    return message.senderId || { name: 'Unknown', image: null };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-navy-400 rounded-lg p-6">
          <div className="w-8 h-8 border-2 border-steel_blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-navy-400 rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-steel_blue-300 dark:border-steel_blue-700">
          <h3 className="text-lg font-semibold text-navy-500 dark:text-cream-500">
            Chat
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sky_blue-400 dark:hover:bg-dark_blue-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-dark_blue-600 dark:text-dark_blue-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const sender = getMessageSender(message);
            const isOwn = message.senderId._id === session?.user?.id;

            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwn
                      ? 'bg-steel_blue-500 dark:bg-steel_blue-400 text-white'
                      : 'bg-sky_blue-400 dark:bg-dark_blue-700 text-navy-500 dark:text-cream-500'
                  }`}
                >
                  {!isOwn && (
                    <div className="text-xs font-semibold mb-1">{sender.name}</div>
                  )}
                  <div className="text-sm">{message.body}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-steel_blue-300 dark:border-steel_blue-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-steel_blue-300 dark:border-steel_blue-700 rounded-lg bg-white dark:bg-navy-400 text-navy-500 dark:text-cream-500 focus:outline-none focus:ring-2 focus:ring-steel_blue-400 dark:focus:ring-steel_blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2 bg-steel_blue-500 dark:bg-steel_blue-400 text-white rounded-lg hover:bg-steel_blue-600 dark:hover:bg-steel_blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

