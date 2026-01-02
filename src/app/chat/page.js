'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatModal from '@/components/ChatModal';
import { FiMessageSquare } from 'react-icons/fi';

export default function ChatDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/');
      return;
    }

    loadRooms();
  }, [session, status, router]);

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-steel_blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-navy-500 dark:text-cream-500 mb-6">
        Messages
      </h1>

      {rooms.length === 0 ? (
        <div className="bg-white dark:bg-navy-400 rounded-lg shadow-lg p-8 text-center">
          <FiMessageSquare className="w-16 h-16 text-steel_blue-400 dark:text-steel_blue-500 mx-auto mb-4" />
          <p className="text-dark_blue-600 dark:text-dark_blue-300 text-lg">
            No messages yet. Start a conversation with a student!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => {
            const otherParticipant = room.participants?.find(
              (p) => p._id !== session?.user?.id
            );

            return (
              <button
                key={room._id}
                onClick={() => setSelectedRoomId(room._id)}
                className="w-full bg-white dark:bg-navy-400 rounded-lg shadow-md p-4 hover:shadow-lg transition-all text-left border border-steel_blue-300 dark:border-steel_blue-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {otherParticipant?.image ? (
                      <img
                        src={otherParticipant.image}
                        alt={otherParticipant.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-sky_blue-400 dark:bg-dark_blue-700 flex items-center justify-center">
                        <FiMessageSquare className="w-6 h-6 text-steel_blue-500 dark:text-steel_blue-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-navy-500 dark:text-cream-500">
                        {room.isAnonymous ? 'Anonymous' : otherParticipant?.name || 'Unknown'}
                      </h3>
                      {room.lastMessage && (
                        <p className="text-sm text-dark_blue-600 dark:text-dark_blue-300 truncate">
                          {room.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-dark_blue-500 dark:text-dark_blue-400">
                    {formatTime(room.updatedAt)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedRoomId && (
        <ChatModal
          roomId={selectedRoomId}
          onClose={() => {
            setSelectedRoomId(null);
            loadRooms();
          }}
        />
      )}
    </div>
  );
}

