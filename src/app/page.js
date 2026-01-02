'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import StudentCard from '@/components/StudentCard';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import { FiSearch, FiUsers, FiCode, FiMessageCircle, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

const CATEGORIES = [
  'Department of English',
  'Department of Urdu',
  'Department of Islamic Studies',
  'Department of Arabic',
  'Department of Persian',
  'Department of Philosophy',
  'Department of History',
  'Department of Pakistan Studies',
  'Department of Political Science',
  'Department of Sociology',
  'Department of Social Work',
  'Department of International Relations',
  'Department of Economics',
  'Department of Education',
  'Department of Mass Communication',
  'Department of Mathematics',
  'Department of Statistics',
  'Department of Physics',
  'Department of Chemistry',
  'Department of Botany',
  'Department of Zoology',
  'Department of Computer Science',
  'Department of Information Technology',
  'Institute of Pure & Applied Biology',
  'Institute of Biotechnology',
  'Institute of Molecular Biology & Biotechnology',
  'Department of Biochemistry',
  'Institute of Food Science & Nutrition',
  'Department of Microbiology',
  'Institute of Banking & Finance',
  'Institute of Management Sciences (IMS)',
  'Institute of Commerce',
  'Gillani Law College',
];

export default function Home() {
  const { data: session } = useSession();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadStudents();
  }, [search, category, page]);

  // Clean callbackUrl parameters on page load to prevent nesting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl');
      
      if (callbackUrl) {
        // Always remove callbackUrl parameter to prevent nesting
        // NextAuth will handle redirects internally, we don't need it in the URL
        urlParams.delete('callbackUrl');
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await fetch(`/api/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadStudents();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-cream-50 via-cream to-cream-50 dark:from-navy dark:via-navy-600 dark:to-navy">
      <BackgroundAnimation />
      
      {/* Hero Section */}
      <section className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cream-400/20 via-sky_blue-300/20 to-steel_blue-300/20 dark:from-navy-600/50 dark:via-dark_blue-700/50 dark:to-navy-700/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream/80 dark:bg-navy-400/80 backdrop-blur-sm border border-sky_blue-200 dark:border-steel_blue-700 mb-8 shadow-sm">
              <FiTrendingUp className="w-4 h-4 text-steel_blue-600 dark:text-steel_blue-400" />
              <span className="text-sm font-medium text-navy-600 dark:text-cream-400">
                Join {students.length > 0 ? students.length + '+' : '1000+'} Active Students
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-navy-600 dark:text-cream-100 mb-2">
                Connect with
              </span>
              <span className="block bg-gradient-to-r from-steel_blue-600 via-sky_blue-500 to-steel_blue-500 dark:from-steel_blue-400 dark:via-sky_blue-300 dark:to-steel_blue-300 bg-clip-text text-transparent">
                Talented Students
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-dark_blue-600 dark:text-dark_blue-300 mb-12 leading-relaxed max-w-2xl mx-auto">
              Discover innovative projects, collaborate on groundbreaking ideas, and build meaningful connections within your academic community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {!session ? (
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
                  className="group px-8 py-4 bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 dark:from-steel_blue-500 dark:to-sky_blue-400 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : null}
              <Link
                href="#explore"
                className="px-8 py-4 bg-cream dark:bg-navy-400 text-navy-600 dark:text-cream-100 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg border-2 border-steel_blue-300 dark:border-steel_blue-600 flex items-center justify-center gap-2"
              >
                Explore Students
                <FiUsers className="w-5 h-5" />
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-cream/60 dark:bg-navy-400/60 backdrop-blur-sm rounded-xl p-6 border border-sky_blue-200/50 dark:border-steel_blue-700/50">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-steel_blue-500 to-sky_blue-400 flex items-center justify-center mb-4 mx-auto">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-navy-600 dark:text-cream-100 mb-2">Find Students</h3>
                <p className="text-sm text-dark_blue-600 dark:text-dark_blue-300">Browse profiles by department and skills</p>
              </div>
              <div className="bg-cream/60 dark:bg-navy-400/60 backdrop-blur-sm rounded-xl p-6 border border-sky_blue-200/50 dark:border-steel_blue-700/50">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky_blue-400 to-steel_blue-400 flex items-center justify-center mb-4 mx-auto">
                  <FiCode className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-navy-600 dark:text-cream-100 mb-2">Showcase Projects</h3>
                <p className="text-sm text-dark_blue-600 dark:text-dark_blue-300">Display your work and achievements</p>
              </div>
              <div className="bg-cream/60 dark:bg-navy-400/60 backdrop-blur-sm rounded-xl p-6 border border-sky_blue-200/50 dark:border-steel_blue-700/50">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-steel_blue-400 to-sky_blue-500 flex items-center justify-center mb-4 mx-auto">
                  <FiMessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-navy-600 dark:text-cream-100 mb-2">Connect & Chat</h3>
                <p className="text-sm text-dark_blue-600 dark:text-dark_blue-300">Message and collaborate in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Students Section */}
      <section id="explore" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search and Filter Section */}
        <div className="bg-cream dark:bg-navy-400 rounded-2xl shadow-xl p-8 mb-12 border border-sky_blue-200 dark:border-steel_blue-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-steel_blue-500 to-sky_blue-400 flex items-center justify-center">
              <FiSearch className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-navy-600 dark:text-cream-100">
              Find Students
            </h2>
          </div>
          
          <div className="space-y-4 lg:flex lg:gap-4 lg:space-y-0">
            <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-steel_blue-500 dark:text-steel_blue-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, bio, or category..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-sky_blue-200 dark:border-steel_blue-700 rounded-xl bg-cream-50 dark:bg-navy-500 text-navy-600 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-steel_blue-400 dark:focus:ring-steel_blue-500 focus:border-transparent transition-all text-base sm:text-lg"
                />
              </div>
              <button
                type="submit"
                className="px-6 sm:px-8 py-4 bg-gradient-to-r from-steel_blue-600 to-sky_blue-500 dark:from-steel_blue-500 dark:to-sky_blue-400 text-white rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-semibold text-base sm:text-lg whitespace-nowrap"
              >
                Search
              </button>
            </form>

            <div className="lg:min-w-[280px]">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 sm:px-6 py-4 border-2 border-sky_blue-200 dark:border-steel_blue-700 rounded-xl bg-cream-50 dark:bg-navy-500 text-navy-600 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-steel_blue-400 dark:focus:ring-steel_blue-500 focus:border-transparent transition-all text-base sm:text-lg font-medium"
              >
                <option value="">All Departments</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-16 h-16 border-4 border-steel_blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-32 bg-cream dark:bg-navy-400 rounded-2xl border border-sky_blue-200 dark:border-steel_blue-700">
            <FiUsers className="w-16 h-16 text-steel_blue-400 dark:text-steel_blue-500 mx-auto mb-4" />
            <p className="text-xl text-dark_blue-600 dark:text-dark_blue-300 font-medium">
              No students found
            </p>
            <p className="text-dark_blue-500 dark:text-dark_blue-400 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-navy-600 dark:text-cream-100">
                {students.length} {students.length === 1 ? 'Student' : 'Students'} Found
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {students.map((student) => (
                <StudentCard key={student._id} student={student} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 border-2 border-steel_blue-300 dark:border-steel_blue-700 rounded-xl bg-cream dark:bg-navy-400 text-navy-600 dark:text-cream-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream-50 dark:hover:bg-dark_blue-700 hover:border-steel_blue-400 dark:hover:border-steel_blue-600 transition-all font-medium"
                >
                  Previous
                </button>
                <span className="px-6 py-3 bg-steel_blue-100 dark:bg-steel_blue-800 rounded-xl text-navy-600 dark:text-cream-100 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-3 border-2 border-steel_blue-300 dark:border-steel_blue-700 rounded-xl bg-cream dark:bg-navy-400 text-navy-600 dark:text-cream-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream-50 dark:hover:bg-dark_blue-700 hover:border-steel_blue-400 dark:hover:border-steel_blue-600 transition-all font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
