'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function StudentCard({ student }) {
  const availabilityColors = {
    Available: 'bg-green-500',
    Busy: 'bg-orange-500',
  };

  return (
    <Link href={`/profile/${student._id}`}>
      <div className="group bg-cream dark:bg-navy-400 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-sky_blue-200 dark:border-steel_blue-700 hover:border-sky_blue-400 dark:hover:border-steel_blue-600 hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-56 bg-gradient-to-br from-sky_blue-400 via-steel_blue-400 to-sky_blue-300 overflow-hidden">
          {student.image ? (
            <Image
              src={student.image}
              alt={student.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-steel_blue-300 to-sky_blue-300">
              <FiUser className="w-20 h-20 text-steel_blue-600 dark:text-steel_blue-400" />
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-500/60 via-transparent to-transparent"></div>
          
          {/* Availability Badge */}
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${
                availabilityColors[student.availabilityStatus] || 'bg-gray-500'
              }`}
            >
              {student.availabilityStatus}
            </span>
          </div>

          {/* Profile Completion Badge */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" />
                Profile {student.profileCompletionPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-cream-400 to-sky_blue-400 transition-all duration-500"
                style={{ width: `${student.profileCompletionPercent}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-navy-600 dark:text-cream-100 mb-2 group-hover:text-steel_blue-600 dark:group-hover:text-steel_blue-400 transition-colors">
            {student.name}
          </h3>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-steel_blue-600 dark:text-steel_blue-400">
              {student.category || 'No department'}
            </p>
            
            {student.semester && (
              <p className="text-xs text-dark_blue-500 dark:text-dark_blue-400">
                Semester {student.semester}
              </p>
            )}
          </div>
          
          {student.bio && (
            <p className="text-sm text-dark_blue-600 dark:text-dark_blue-300 line-clamp-2 mb-4 leading-relaxed">
              {student.bio}
            </p>
          )}
          
          {/* View Profile Link */}
          <div className="flex items-center justify-between pt-4 border-t border-sky_blue-200 dark:border-steel_blue-700">
            <span className="text-sm font-medium text-steel_blue-600 dark:text-steel_blue-400">
              View Profile
            </span>
            <FiArrowRight className="w-5 h-5 text-steel_blue-600 dark:text-steel_blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
