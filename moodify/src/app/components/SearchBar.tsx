// moodify\src\app\components\SearchBar.tsx


'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists..."
          className="w-full bg-gray-700 border border-gray-600 rounded-full py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-10 flex items-center pr-3 text-gray-400 hover:text-gray-300"
          >
            <X size={18} />
          </button>
        )}
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-purple-400"
        >
          <span className="text-sm font-medium">Search</span>
        </button>
      </div>
    </form>
  );
}
