'use client';

import { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import Image from 'next/image';

export default function ImageUpload({ value, onChange, label = 'Profile Image' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-blue_slate-600 dark:text-blue_slate-300">
        {label}
      </label>
      
      {preview ? (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-cool_steel-300 dark:border-cool_steel-700">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-cool_steel-300 dark:border-cool_steel-700 rounded-lg cursor-pointer hover:border-cool_steel-400 dark:hover:border-cool_steel-600 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <div className="w-8 h-8 border-2 border-cool_steel-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FiUpload className="w-8 h-8 text-cool_steel-500 dark:text-cool_steel-400 mb-2" />
              <span className="text-xs text-cool_steel-600 dark:text-cool_steel-300">
                Upload
              </span>
            </>
          )}
        </label>
      )}
    </div>
  );
}

