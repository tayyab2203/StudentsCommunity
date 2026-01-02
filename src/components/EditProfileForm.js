'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CategorySelect from './CategorySelect';
import ImageUpload from './ImageUpload';
import { 
  FiUser, 
  FiBook, 
  FiCalendar, 
  FiFileText, 
  FiImage, 
  FiCheckCircle,
  FiArrowRight,
  FiLoader
} from 'react-icons/fi';

export default function EditProfileForm({ user, isRegister = false }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: user?.name || '',
    category: user?.category || '',
    semester: user?.semester || '',
    bio: user?.bio || '',
    image: user?.image || '',
    availabilityStatus: user?.availabilityStatus || 'Available',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = isRegister ? 4 : 5;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        category: user?.category || '',
        semester: user?.semester || '',
        bio: user?.bio || '',
        image: user?.image || '',
        availabilityStatus: user?.availabilityStatus || 'Available',
      });
    }
  }, [user]);

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    }
    
    if (step === 2) {
      if (!formData.category) {
        newErrors.category = 'Department is required';
      }
      if (!formData.semester) {
        newErrors.semester = 'Semester is required';
      } else if (formData.semester < 1 || formData.semester > 8) {
        newErrors.semester = 'Semester must be between 1 and 8';
      }
    }
    
    if (step === 3) {
      if (formData.bio && formData.bio.length > 500) {
        newErrors.bio = 'Bio must be less than 500 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Get user ID from user object or session
      const userId = user?._id || user?.id || session?.user?.id;
      
      if (!userId) {
        throw new Error('User ID not found. Please sign in again.');
      }

      const url = `/api/users/${userId}`;
      const body = isRegister
        ? { ...formData, role: 'STUDENT' }
        : formData;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save profile' }));
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const data = await response.json();
      
      // Update session
      await update();
      
      // Redirect using the returned user ID or fallback to session ID
      const redirectId = data.user?._id || data.user?.id || userId;
      router.push(`/profile/${redirectId}`);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ submit: error.message || 'Failed to save profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        {isRegister && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-navy-600 dark:text-cream-100">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-steel_blue-600 dark:text-steel_blue-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2 bg-cream-200 dark:bg-navy-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-cream/80 dark:bg-navy-400/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-sky_blue-200/50 dark:border-steel_blue-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 dark:from-steel_blue-500 dark:to-sky_blue-400 px-8 py-6">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              {isRegister ? (
                <>
                  <FiUser className="w-8 h-8" />
                  Complete Your Profile
                </>
              ) : (
                <>
                  <FiFileText className="w-8 h-8" />
                  Edit Profile
                </>
              )}
            </h2>
            <p className="text-sky_blue-100 dark:text-sky_blue-200">
              {isRegister 
                ? 'Join our community by completing your student profile'
                : 'Update your information to keep your profile current'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-steel_blue-500 to-sky_blue-400 flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-600 dark:text-cream-100">
                      Basic Information
                    </h3>
                    <p className="text-sm text-dark_blue-500 dark:text-dark_blue-400">
                      Let's start with your name
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-600 dark:text-cream-100 mb-3">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-steel_blue-500 dark:text-steel_blue-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      placeholder="Enter your full name"
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-white dark:bg-navy-500 text-navy-600 dark:text-cream-100 placeholder-dark_blue-400 dark:placeholder-dark_blue-500 focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-sky_blue-200 dark:border-steel_blue-700 focus:ring-steel_blue-400 dark:focus:ring-steel_blue-500'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <FiCheckCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Academic Info */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky_blue-500 to-steel_blue-400 flex items-center justify-center">
                    <FiBook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-600 dark:text-cream-100">
                      Academic Information
                    </h3>
                    <p className="text-sm text-dark_blue-500 dark:text-dark_blue-400">
                      Tell us about your studies
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-600 dark:text-cream-100 mb-3">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <CategorySelect
                    value={formData.category}
                    onChange={(value) => {
                      setFormData({ ...formData, category: value });
                      if (errors.category) setErrors({ ...errors, category: null });
                    }}
                    required
                  />
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <FiCheckCircle className="w-4 h-4" />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-600 dark:text-cream-100 mb-3">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-steel_blue-500 dark:text-steel_blue-400 w-5 h-5" />
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={formData.semester}
                      onChange={(e) => {
                        setFormData({ ...formData, semester: parseInt(e.target.value) || '' });
                        if (errors.semester) setErrors({ ...errors, semester: null });
                      }}
                      placeholder="Select your semester (1-8)"
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-white dark:bg-navy-500 text-navy-600 dark:text-cream-100 placeholder-dark_blue-400 dark:placeholder-dark_blue-500 focus:outline-none focus:ring-2 transition-all ${
                        errors.semester
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-sky_blue-200 dark:border-steel_blue-700 focus:ring-steel_blue-400 dark:focus:ring-steel_blue-500'
                      }`}
                    />
                  </div>
                  {errors.semester && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <FiCheckCircle className="w-4 h-4" />
                      {errors.semester}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Bio */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-steel_blue-400 to-sky_blue-500 flex items-center justify-center">
                    <FiFileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-600 dark:text-cream-100">
                      About You
                    </h3>
                    <p className="text-sm text-dark_blue-500 dark:text-dark_blue-400">
                      Share a bit about yourself
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-600 dark:text-cream-100 mb-3">
                    Bio
                    <span className="ml-2 text-xs text-dark_blue-500 dark:text-dark_blue-400 font-normal">
                      (Optional, max 500 characters)
                    </span>
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => {
                      setFormData({ ...formData, bio: e.target.value });
                      if (errors.bio) setErrors({ ...errors, bio: null });
                    }}
                    rows={6}
                    placeholder="Tell us about your interests, goals, or what you're working on..."
                    maxLength={500}
                    className={`w-full px-4 py-4 border-2 rounded-xl bg-white dark:bg-navy-500 text-navy-600 dark:text-cream-100 placeholder-dark_blue-400 dark:placeholder-dark_blue-500 focus:outline-none focus:ring-2 transition-all resize-none ${
                      errors.bio
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-sky_blue-200 dark:border-steel_blue-700 focus:ring-steel_blue-400 dark:focus:ring-steel_blue-500'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.bio && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <FiCheckCircle className="w-4 h-4" />
                        {errors.bio}
                      </p>
                    )}
                    <p className="text-xs text-dark_blue-500 dark:text-dark_blue-400 ml-auto">
                      {formData.bio.length}/500
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Image */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky_blue-400 to-steel_blue-500 flex items-center justify-center">
                    <FiImage className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-600 dark:text-cream-100">
                      Profile Picture
                    </h3>
                    <p className="text-sm text-dark_blue-500 dark:text-dark_blue-400">
                      Add a photo to help others recognize you
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    label=""
                  />
                </div>
              </div>
            )}

            {/* Step 5: Availability (Edit only) */}
            {!isRegister && currentStep === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-steel_blue-500 to-sky_blue-400 flex items-center justify-center">
                    <FiCheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-600 dark:text-cream-100">
                      Availability Status
                    </h3>
                    <p className="text-sm text-dark_blue-500 dark:text-dark_blue-400">
                      Let others know your availability
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-600 dark:text-cream-100 mb-3">
                    Status
                  </label>
                  <select
                    value={formData.availabilityStatus}
                    onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
                    className="w-full px-4 py-4 border-2 border-sky_blue-200 dark:border-steel_blue-700 rounded-xl bg-white dark:bg-navy-500 text-navy-600 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-steel_blue-400 dark:focus:ring-steel_blue-500 transition-all"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                  </select>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-sky_blue-200 dark:border-steel_blue-700">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-sky_blue-300 dark:border-steel_blue-700 text-navy-600 dark:text-cream-100 rounded-xl hover:bg-cream-100 dark:hover:bg-dark_blue-700 transition-all font-semibold disabled:opacity-50"
                >
                  Back
                </button>
              )}
              
              <div className="flex-1 flex gap-4">
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 dark:from-steel_blue-500 dark:to-sky_blue-400 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    Next
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 dark:from-steel_blue-500 dark:to-sky_blue-400 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        {isRegister ? 'Registering...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        {isRegister ? 'Complete Registration' : 'Save Changes'}
                        <FiCheckCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
