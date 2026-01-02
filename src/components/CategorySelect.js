'use client';

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
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-2 border border-cool_steel-300 dark:border-cool_steel-700 rounded-lg bg-white dark:bg-jet_black-400 text-jet_black-500 dark:text-light_cyan-500 focus:outline-none focus:ring-2 focus:ring-cool_steel-400 dark:focus:ring-cool_steel-500"
    >
      <option value="">Select Department</option>
      {CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}

