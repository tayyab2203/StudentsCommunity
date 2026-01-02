'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiClock, FiCheckCircle } from 'react-icons/fi';

export default function StudentCard({ student }) {
  const availabilityColors = {
    Available: 'bg-green-500',
    Busy: 'bg-red-500',
  };

  return (
    <Link href={`/profile/${student._id}`}>
      <div className="bg-white dark:bg-jet_black-400 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-cool_steel-200 dark:border-cool_steel-700">
        <div className="relative h-48 bg-gradient-to-br from-light_blue-400 to-cool_steel-400">
          {student.image ? (
            <Image
              src={student.image}
              alt={student.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiUser className="w-16 h-16 text-cool_steel-600 dark:text-cool_steel-300" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                availabilityColors[student.availabilityStatus] || 'bg-gray-500'
              }`}
            >
              {student.availabilityStatus}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-jet_black-500 dark:text-light_cyan-500 mb-1 truncate">
            {student.name}
          </h3>
          
          <p className="text-sm text-blue_slate-600 dark:text-blue_slate-300 mb-2">
            {student.category || 'No category'}
          </p>
          
          {student.semester && (
            <p className="text-xs text-blue_slate-500 dark:text-blue_slate-400 mb-2">
              Semester {student.semester}
            </p>
          )}
          
          {student.bio && (
            <p className="text-sm text-blue_slate-600 dark:text-blue_slate-300 line-clamp-2 mb-3">
              {student.bio}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-blue_slate-500 dark:text-blue_slate-400">
              <FiCheckCircle />
              <span>{student.profileCompletionPercent}% Complete</span>
            </div>
            
            <div className="w-24 h-2 bg-cool_steel-200 dark:bg-cool_steel-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-light_blue-400 to-cool_steel-400 transition-all duration-300"
                style={{ width: `${student.profileCompletionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

