'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CategorySelect from './CategorySelect';
import ImageUpload from './ImageUpload';

export default function EditProfileForm({ user, isRegister = false }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    category: user?.category || '',
    semester: user?.semester || '',
    bio: user?.bio || '',
    image: user?.image || '',
    availabilityStatus: user?.availabilityStatus || 'Available',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isRegister ? '/api/users/me' : `/api/users/${user._id}`;
      const method = isRegister ? 'PATCH' : 'PATCH';
      
      const body = isRegister
        ? { ...formData, role: 'STUDENT' }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      const data = await response.json();
      
      // Update session
      await update();
      
      // Redirect
      if (isRegister) {
        router.push(`/profile/${data.user._id || session.user.id}`);
      } else {
        router.push(`/profile/${user._id}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-jet_black-500 dark:text-light_cyan-500 mb-6">
          {isRegister ? 'Register as Student' : 'Edit Profile'}
        </h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue_slate-600 dark:text-blue_slate-300 mb-2">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-cool_steel-300 dark:border-cool_steel-700 rounded-lg bg-white dark:bg-jet_black-400 text-jet_black-500 dark:text-light_cyan-500 focus:outline-none focus:ring-2 focus:ring-cool_steel-400 dark:focus:ring-cool_steel-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue_slate-600 dark:text-blue_slate-300 mb-2">
          Department
        </label>
        <CategorySelect
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue_slate-600 dark:text-blue_slate-300 mb-2">
          Semester
        </label>
        <input
          type="number"
          min="1"
          max="8"
          value={formData.semester}
          onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || '' })}
          required
          className="w-full px-4 py-2 border border-cool_steel-300 dark:border-cool_steel-700 rounded-lg bg-white dark:bg-jet_black-400 text-jet_black-500 dark:text-light_cyan-500 focus:outline-none focus:ring-2 focus:ring-cool_steel-400 dark:focus:ring-cool_steel-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue_slate-600 dark:text-blue_slate-300 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-cool_steel-300 dark:border-cool_steel-700 rounded-lg bg-white dark:bg-jet_black-400 text-jet_black-500 dark:text-light_cyan-500 focus:outline-none focus:ring-2 focus:ring-cool_steel-400 dark:focus:ring-cool_steel-500"
        />
      </div>

      <div>
        <ImageUpload
          value={formData.image}
          onChange={(url) => setFormData({ ...formData, image: url })}
        />
      </div>

      {!isRegister && (
        <div>
          <label className="block text-sm font-medium text-blue_slate-600 dark:text-blue_slate-300 mb-2">
            Availability Status
          </label>
          <select
            value={formData.availabilityStatus}
            onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
            className="w-full px-4 py-2 border border-cool_steel-300 dark:border-cool_steel-700 rounded-lg bg-white dark:bg-jet_black-400 text-jet_black-500 dark:text-light_cyan-500 focus:outline-none focus:ring-2 focus:ring-cool_steel-400 dark:focus:ring-cool_steel-500"
          >
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
          </select>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-cool_steel-500 dark:bg-cool_steel-400 text-white rounded-lg hover:bg-cool_steel-600 dark:hover:bg-cool_steel-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isRegister ? 'Register' : 'Save Changes'}
        </button>
        {!isRegister && (
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-cool_steel-300 dark:border-cool_steel-700 text-blue_slate-600 dark:text-blue_slate-300 rounded-lg hover:bg-light_blue-400 dark:hover:bg-blue_slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

