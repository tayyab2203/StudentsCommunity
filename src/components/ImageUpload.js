'use client';

import { useState } from 'react';
import { FiUpload, FiX, FiImage, FiCheck } from 'react-icons/fi';
import Image from 'next/image';

export default function ImageUpload({ value, onChange, label = 'Profile Image' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

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

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-navy-600 dark:text-cream-100">
          {label}
        </label>
      )}
      
      {preview ? (
        <div className="relative group">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-4 border-sky_blue-200 dark:border-steel_blue-700 shadow-xl">
            <Image
              src={preview}
              alt="Profile preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-500/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg hover:scale-110 z-10"
            aria-label="Remove image"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Change Image Button */}
          <label className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white/90 dark:bg-navy-500/90 backdrop-blur-sm text-navy-600 dark:text-cream-100 rounded-lg text-sm font-medium cursor-pointer hover:bg-white dark:hover:bg-navy-500 transition-all opacity-0 group-hover:opacity-100">
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              disabled={uploading}
              className="hidden"
            />
            Change
          </label>
        </div>
      ) : (
        <label
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center w-full h-48 sm:h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all
            ${dragActive 
              ? 'border-steel_blue-500 bg-steel_blue-50 dark:bg-steel_blue-900/20 scale-105' 
              : 'border-sky_blue-300 dark:border-steel_blue-700 hover:border-steel_blue-400 dark:hover:border-steel_blue-600 hover:bg-cream-50 dark:hover:bg-navy-500/50'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={uploading}
            className="hidden"
          />
          
          {uploading ? (
            <>
              <div className="w-12 h-12 border-4 border-steel_blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-steel_blue-600 dark:text-steel_blue-400">
                Uploading...
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-steel_blue-500 to-sky_blue-400 flex items-center justify-center mb-4 shadow-lg">
                {dragActive ? (
                  <FiCheck className="w-8 h-8 text-white" />
                ) : (
                  <FiImage className="w-8 h-8 text-white" />
                )}
              </div>
              <p className="text-base font-semibold text-navy-600 dark:text-cream-100 mb-2">
                {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-dark_blue-500 dark:text-dark_blue-400">
                PNG, JPG, GIF up to 5MB
              </p>
            </>
          )}
        </label>
      )}
    </div>
  );
}
