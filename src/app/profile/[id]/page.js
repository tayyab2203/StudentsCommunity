'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FiUser, FiEdit3, FiMessageSquare, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import ChatModal from '@/components/ChatModal';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [skillMatch, setSkillMatch] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadProfile();
    }
  }, [params.id]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProjects(data.projects || []);
        setSkillMatch(data.skillMatch || 0);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!session) {
      router.push('/');
      return;
    }

    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: params.id,
          isAnonymous: session.user.role === 'VISITOR',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatRoomId(data.room._id);
        setChatModalOpen(true);
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-steel_blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isOwner = session?.user?.id === user._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-navy-400 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-steel_blue-300 dark:border-steel_blue-700 flex-shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-sky_blue-400 dark:bg-dark_blue-700">
                <FiUser className="w-16 h-16 text-steel_blue-500 dark:text-steel_blue-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-navy-500 dark:text-cream-500 mb-2">
                  {user.name}
                </h1>
                <p className="text-lg text-dark_blue-600 dark:text-dark_blue-300 mb-1">
                  {user.category || 'No category'}
                </p>
                {user.semester && (
                  <p className="text-sm text-dark_blue-500 dark:text-dark_blue-400">
                    Semester {user.semester}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {isOwner ? (
                  <Link
                    href="/profile/edit"
                    className="px-4 py-2 bg-steel_blue-500 dark:bg-steel_blue-400 text-white rounded-lg hover:bg-steel_blue-600 dark:hover:bg-steel_blue-500 transition-colors flex items-center gap-2"
                  >
                    <FiEdit3 />
                    Edit
                  </Link>
                ) : (
                  session && (
                    <button
                      onClick={handleMessage}
                      className="px-4 py-2 bg-steel_blue-500 dark:bg-steel_blue-400 text-white rounded-lg hover:bg-steel_blue-600 dark:hover:bg-steel_blue-500 transition-colors flex items-center gap-2"
                    >
                      <FiMessageSquare />
                      Message
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  user.availabilityStatus === 'Available'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {user.availabilityStatus}
              </span>
              
              {session?.user?.role === 'STUDENT' && skillMatch > 0 && (
                <div className="flex items-center gap-2 text-sm text-dark_blue-600 dark:text-dark_blue-300">
                  <FiCheckCircle />
                  <span>Skill Match: {skillMatch}%</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-dark_blue-600 dark:text-dark_blue-300">
                  Profile Completion
                </span>
                <span className="text-sm text-dark_blue-500 dark:text-dark_blue-400">
                  {user.profileCompletionPercent}%
                </span>
              </div>
              <div className="w-full h-3 bg-steel_blue-200 dark:bg-steel_blue-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky_blue-400 to-steel_blue-400 transition-all duration-300"
                  style={{ width: `${user.profileCompletionPercent}%` }}
                />
              </div>
            </div>

            {user.bio && (
              <p className="text-dark_blue-600 dark:text-dark_blue-300">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-400 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-navy-500 dark:text-cream-500 mb-4">
          Projects
        </h2>
        
        {projects.length === 0 ? (
          <p className="text-dark_blue-600 dark:text-dark_blue-300">
            No projects yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="border border-steel_blue-300 dark:border-steel_blue-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-navy-500 dark:text-cream-500 mb-2">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-sm text-dark_blue-600 dark:text-dark_blue-300 mb-3">
                    {project.description}
                  </p>
                )}
                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-steel_blue-600 dark:text-steel_blue-400 hover:text-steel_blue-700 dark:hover:text-steel_blue-300"
                  >
                    <FiExternalLink />
                    View Project
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {chatModalOpen && chatRoomId && (
        <ChatModal
          roomId={chatRoomId}
          onClose={() => {
            setChatModalOpen(false);
            setChatRoomId(null);
          }}
        />
      )}
    </div>
  );
}

