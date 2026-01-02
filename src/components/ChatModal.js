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

    // Load messages
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Listen for new messages
    if (socket) {
      socket.on('newMessage', (message) => {
        if (message.chatRoomId === roomId) {
          setMessages((prev) => [...prev, message]);
        }
      });
    }

    return () => {
      if (socket) {
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
      
      // Emit via socket
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
    if (room?.isAnonymous && message.senderId._id !== session?.user?.id) {
      return { name: 'Anonymous', image: null };
    }
    return message.senderId || { name: 'Unknown', image: null };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-jet_black-400 rounded-lg p-6">
          <div className="w-8 h-8 border-2 border-cool_steel-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-jet_black-400 rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-cool_steel-300 dark:border-cool_steel-700">
          <h3 className="text-lg font-semibold text-jet_black-500 dark:text-light_cyan-500">
            Chat
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-light_blue-400 dark:hover:bg-blue_slate-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-blue_slate-600 dark:text-blue_slate-300" />
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
                      ? 'bg-cool_steel-500 dark:bg-cool_steel-400 text-white'
                      : 'bg-light_blue-400 dark:bg-blue_slate-700 text-jet_black-500 dark:text-light_cyan-500'
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

        <form onSubmit={handleSend} className="p-4 border-t border-cool_steel-300 dark:border-cool_steel-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-cool_steel-300 dark:border-cool_steel-700 rounded-lg bg-white dark:bg-jet_black-400 text-jet_black-500 dark:text-light_cyan-500 focus:outline-none focus:ring-2 focus:ring-cool_steel-400 dark:focus:ring-cool_steel-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2 bg-cool_steel-500 dark:bg-cool_steel-400 text-white rounded-lg hover:bg-cool_steel-600 dark:hover:bg-cool_steel-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

