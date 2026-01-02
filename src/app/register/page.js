'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EditProfileForm from '@/components/EditProfileForm';

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/');
      return;
    }

    if (session.user.role === 'STUDENT') {
      router.push(`/profile/${session.user.id}`);
      return;
    }

    loadUser();
  }, [session, status, router]);

  const loadUser = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // If user not found, create a user object from session
        if (response.status === 404 && session?.user) {
          setUser({
            _id: session.user.id,
            name: session.user.name || '',
            email: session.user.email || '',
            image: session.user.image || '',
            role: 'VISITOR',
            category: '',
            semester: '',
            bio: '',
            availabilityStatus: 'Available',
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error loading user:', errorData);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Fallback: create user object from session
      if (session?.user) {
        setUser({
          _id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || '',
          role: 'VISITOR',
          category: '',
          semester: '',
          bio: '',
          availabilityStatus: 'Available',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-cream dark:bg-navy">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-steel_blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-600 dark:text-cream-100 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && session?.user) {
    // Create a minimal user object from session if user not loaded
    const fallbackUser = {
      _id: session.user.id,
      name: session.user.name || '',
      email: session.user.email || '',
      image: session.user.image || '',
      role: 'VISITOR',
      category: '',
      semester: '',
      bio: '',
      availabilityStatus: 'Available',
    };
    return (
      <div className="min-h-screen py-8">
        <EditProfileForm user={fallbackUser} isRegister={true} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-cream dark:bg-navy">
        <div className="text-center p-8 bg-cream dark:bg-navy-400 rounded-2xl border border-sky_blue-200 dark:border-steel_blue-700">
          <p className="text-xl text-navy-600 dark:text-cream-100 font-semibold mb-4">
            Unable to load your profile
          </p>
          <p className="text-dark_blue-600 dark:text-dark_blue-300 mb-6">
            Please try refreshing the page or sign in again.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <EditProfileForm user={user} isRegister={true} />
    </div>
  );
}

