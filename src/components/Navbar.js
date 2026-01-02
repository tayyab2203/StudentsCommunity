'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FiUser, FiLogOut, FiMessageSquare, FiEdit3 } from 'react-icons/fi';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-light_cyan-500 dark:bg-jet_black-500 border-b border-cool_steel-300 dark:border-cool_steel-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-jet_black-500 dark:text-light_cyan-500">
          Student Connect
        </Link>
        
        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="w-8 h-8 border-2 border-cool_steel-500 border-t-transparent rounded-full animate-spin" />
          ) : session ? (
            <>
              {session.user.role === 'STUDENT' && (
                <>
                  <Link
                    href="/chat"
                    className="flex items-center gap-2 px-3 py-2 text-blue_slate-600 dark:text-light_blue-300 hover:bg-light_blue-400 dark:hover:bg-blue_slate-700 rounded-lg transition-colors"
                  >
                    <FiMessageSquare />
                    <span className="hidden sm:inline">Messages</span>
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="flex items-center gap-2 px-3 py-2 text-blue_slate-600 dark:text-light_blue-300 hover:bg-light_blue-400 dark:hover:bg-blue_slate-700 rounded-lg transition-colors"
                  >
                    <FiEdit3 />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </Link>
                </>
              )}
              
              {session.user.role === 'VISITOR' && (
                <Link
                  href="/register"
                  className="px-4 py-2 bg-cool_steel-500 dark:bg-cool_steel-400 text-white rounded-lg hover:bg-cool_steel-600 dark:hover:bg-cool_steel-500 transition-colors"
                >
                  Register as Student
                </Link>
              )}
              
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-blue_slate-600 dark:text-light_blue-300 hidden sm:inline">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-blue_slate-600 dark:text-light_blue-300 hover:bg-light_blue-400 dark:hover:bg-blue_slate-700 rounded-lg transition-colors"
                >
                  <FiLogOut />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="px-4 py-2 bg-cool_steel-500 dark:bg-cool_steel-400 text-white rounded-lg hover:bg-cool_steel-600 dark:hover:bg-cool_steel-500 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

