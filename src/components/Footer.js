'use client';

import Link from 'next/link';
import { FiGithub, FiMail, FiUsers, FiBook } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-navy dark:bg-navy-600 text-cream border-t border-steel_blue-700 dark:border-steel_blue-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-cream">Student Connect</h3>
            <p className="text-sky_blue-300 dark:text-sky_blue-400 mb-4 max-w-md">
              Connect with talented students, showcase your projects, and build meaningful collaborations within your university community.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-steel_blue-700 dark:bg-steel_blue-600 flex items-center justify-center hover:bg-steel_blue-600 dark:hover:bg-steel_blue-500 transition-colors text-cream"
                aria-label="GitHub"
              >
                <FiGithub className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@studentconnect.edu"
                className="w-10 h-10 rounded-full bg-steel_blue-700 dark:bg-steel_blue-600 flex items-center justify-center hover:bg-steel_blue-600 dark:hover:bg-steel_blue-500 transition-colors text-cream"
                aria-label="Email"
              >
                <FiMail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-cream">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sky_blue-300 dark:text-sky_blue-400 hover:text-cream transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sky_blue-300 dark:text-sky_blue-400 hover:text-cream transition-colors">
                  Register as Student
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sky_blue-300 dark:text-sky_blue-400 hover:text-cream transition-colors">
                  Messages
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-cream">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sky_blue-300 dark:text-sky_blue-400 hover:text-cream transition-colors flex items-center gap-2">
                  <FiUsers className="w-4 h-4" />
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sky_blue-300 dark:text-sky_blue-400 hover:text-cream transition-colors flex items-center gap-2">
                  <FiBook className="w-4 h-4" />
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sky_blue-300 dark:text-sky_blue-400 hover:text-cream transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sky_blue-300 dark:text-sky_blue-400 hover:text-cream transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-steel_blue-700 dark:border-steel_blue-800 mt-8 pt-8 text-center">
          <p className="text-sky_blue-300 dark:text-sky_blue-400">
            © {new Date().getFullYear()} Student Connect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

