'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FiUser, FiLogOut, FiMessageSquare, FiEdit3, FiUsers, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-cream/95 dark:bg-navy/95 backdrop-blur-md border-b border-sky_blue-200/50 dark:border-steel_blue-700/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-steel_blue-600 to-sky_blue-500 dark:from-steel_blue-500 dark:to-sky_blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <FiUsers className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-navy-600 to-steel_blue-600 dark:from-cream-100 dark:to-sky_blue-300 bg-clip-text text-transparent block">
                Student Connect
              </span>
              <span className="text-xs text-dark_blue-500 dark:text-sky_blue-400 hidden sm:block">
                University Network
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className="text-dark_blue-700 dark:text-sky_blue-300 hover:text-steel_blue-600 dark:hover:text-steel_blue-400 font-medium transition-colors relative group"
            >
              Browse
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 group-hover:w-full transition-all"></span>
            </Link>
            {session?.user?.role === 'STUDENT' && (
              <>
                <Link
                  href="/chat"
                  className="text-dark_blue-700 dark:text-sky_blue-300 hover:text-steel_blue-600 dark:hover:text-steel_blue-400 font-medium transition-colors relative group"
                >
                  Messages
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 group-hover:w-full transition-all"></span>
                </Link>
                <Link
                  href="/profile/edit"
                  className="text-dark_blue-700 dark:text-sky_blue-300 hover:text-steel_blue-600 dark:hover:text-steel_blue-400 font-medium transition-colors relative group"
                >
                  Profile
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 group-hover:w-full transition-all"></span>
                </Link>
              </>
            )}
          </div>
        
          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 border-2 border-steel_blue-500 border-t-transparent rounded-full animate-spin" />
            ) : session ? (
              <>
                {session.user.role === 'VISITOR' && (
                  <Link
                    href="/register"
                    className="hidden md:inline-flex px-5 py-2.5 bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 dark:from-steel_blue-500 dark:to-sky_blue-400 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium"
                  >
                    Register
                  </Link>
                )}
                
                <div className="flex items-center gap-3 pl-4 border-l border-sky_blue-200 dark:border-steel_blue-700">
                  {session.user.image ? (
                    <Link href={`/profile/${session.user.id}`} className="group">
                      <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-11 h-11 rounded-full border-2 border-sky_blue-300 dark:border-steel_blue-600 group-hover:border-steel_blue-500 dark:group-hover:border-steel_blue-400 transition-colors shadow-md"
                      />
                    </Link>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-steel_blue-400 to-sky_blue-400 flex items-center justify-center shadow-md">
                      <FiUser className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="hidden xl:block">
                    <p className="text-sm font-semibold text-navy-600 dark:text-cream-100">
                      {session.user.name?.split(' ')[0]}
                    </p>
                    <p className="text-xs text-dark_blue-500 dark:text-sky_blue-400 capitalize">
                      {session.user.role?.toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-2.5 text-dark_blue-600 dark:text-sky_blue-300 hover:bg-cream-100 dark:hover:bg-dark_blue-700 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                  onClick={() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.has('callbackUrl')) {
                      urlParams.delete('callbackUrl');
                      const cleanUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
                      window.history.replaceState({}, '', cleanUrl);
                    }
                    signIn();
                  }}
                className="px-6 py-2.5 bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 dark:from-steel_blue-500 dark:to-sky_blue-400 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                Sign In
              </button>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-navy-600 dark:text-cream-100"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-sky_blue-200 dark:border-steel_blue-700">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-dark_blue-700 dark:text-sky_blue-300 font-medium py-2"
              >
                Browse Students
              </Link>
              {session?.user?.role === 'STUDENT' && (
                <>
                  <Link
                    href="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-dark_blue-700 dark:text-sky_blue-300 font-medium py-2"
                  >
                    Messages
                  </Link>
                  <Link
                    href="/profile/edit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-dark_blue-700 dark:text-sky_blue-300 font-medium py-2"
                  >
                    Edit Profile
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
