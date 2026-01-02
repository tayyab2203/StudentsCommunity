'use client';

import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi';

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

export default function CategorySelect({ value, onChange, required = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredCategories = CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategory = CATEGORIES.find((cat) => cat === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-4 border-2 rounded-xl bg-white dark:bg-navy-500 text-navy-600 dark:text-cream-100 
          focus:outline-none focus:ring-2 transition-all text-left flex items-center justify-between
          ${isOpen 
            ? 'border-steel_blue-500 focus:ring-steel_blue-400 dark:focus:ring-steel_blue-500' 
            : 'border-sky_blue-200 dark:border-steel_blue-700 hover:border-steel_blue-300 dark:hover:border-steel_blue-600'
          }
        `}
      >
        <span className={selectedCategory ? '' : 'text-dark_blue-400 dark:text-dark_blue-500'}>
          {selectedCategory || 'Select Department'}
        </span>
        <FiChevronDown 
          className={`w-5 h-5 text-steel_blue-500 dark:text-steel_blue-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-navy-500 rounded-xl shadow-2xl border-2 border-sky_blue-200 dark:border-steel_blue-700 overflow-hidden animate-fadeIn">
          {/* Search Input */}
          <div className="p-3 border-b border-sky_blue-200 dark:border-steel_blue-700">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel_blue-500 dark:text-steel_blue-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search departments..."
                className="w-full pl-10 pr-4 py-2 border border-sky_blue-200 dark:border-steel_blue-700 rounded-lg bg-cream-50 dark:bg-navy-600 text-navy-600 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-steel_blue-400 dark:focus:ring-steel_blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-dark_blue-500 dark:text-dark_blue-400">
                No departments found
              </div>
            ) : (
              filteredCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    onChange(category);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-cream-100 dark:hover:bg-navy-600 transition-colors
                    flex items-center justify-between
                    ${value === category ? 'bg-steel_blue-50 dark:bg-steel_blue-900/30' : ''}
                  `}
                >
                  <span className="text-navy-600 dark:text-cream-100">{category}</span>
                  {value === category && (
                    <FiCheck className="w-5 h-5 text-steel_blue-600 dark:text-steel_blue-400" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hidden select for form validation */}
      <select
        value={value || ''}
        onChange={() => {}}
        required={required}
        className="hidden"
        aria-hidden="true"
      >
        <option value="">Select Department</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
