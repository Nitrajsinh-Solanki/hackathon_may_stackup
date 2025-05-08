// moodify\src\app\components\FilterBar.tsx

'use client';
import { useState } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
import { genres, moods } from '@/lib/audius-api';

interface FilterBarProps {
  onGenreChange: (genre: string) => void;
  onMoodChange: (mood: string) => void;
  onSortChange: (sort: string) => void;
  activeGenre: string;
  activeMood: string;
  activeSort: string;
}

export default function FilterBar({
  onGenreChange,
  onMoodChange,
  onSortChange,
  activeGenre,
  activeMood,
  activeSort
}: FilterBarProps) {
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'recent', label: 'Recently Added' }
  ];

  // default values for filters
  const defaultGenre = 'All Genres';
  const defaultMood = 'All Moods';
  const defaultSort = 'trending';

  // function to clear all filters
  const clearAllFilters = () => {
    onGenreChange(defaultGenre);
    onMoodChange(defaultMood);
    onSortChange(defaultSort);
    setShowGenreDropdown(false);
    setShowMoodDropdown(false);
    setShowSortDropdown(false);
  };

  const isAnyFilterActive = 
    activeGenre !== defaultGenre || 
    activeMood !== defaultMood || 
    activeSort !== defaultSort;

  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <div className="flex items-center text-purple-400 mr-2">
        <Filter size={18} className="mr-1" />
        <span className="text-sm font-medium">Filters:</span>
      </div>
      {/* genre filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowGenreDropdown(!showGenreDropdown);
            setShowMoodDropdown(false);
            setShowSortDropdown(false);
          }}
          className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm"
        >
          <span>Genre: {activeGenre}</span>
          <ChevronDown size={16} className="ml-2" />
        </button>
        
        {showGenreDropdown && (
          <div className="absolute z-10 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  onGenreChange(genre);
                  setShowGenreDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
                  activeGenre === genre ? 'bg-purple-900 text-white' : 'text-gray-300'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* mood filter implemented here */}
      <div className="relative">
        <button
          onClick={() => {
            setShowMoodDropdown(!showMoodDropdown);
            setShowGenreDropdown(false);
            setShowSortDropdown(false);
          }}
          className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm"
        >
          <span>Mood: {activeMood}</span>
          <ChevronDown size={16} className="ml-2" />
        </button>
        
        {showMoodDropdown && (
          <div className="absolute z-10 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => {
                  onMoodChange(mood);
                  setShowMoodDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
                  activeMood === mood ? 'bg-purple-900 text-white' : 'text-gray-300'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* sort filter is implemented here  */}
      <div className="relative">
        <button
          onClick={() => {
            setShowSortDropdown(!showSortDropdown);
            setShowGenreDropdown(false);
            setShowMoodDropdown(false);
          }}
          className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm"
        >
          <span>Sort: {sortOptions.find(option => option.value === activeSort)?.label}</span>
          <ChevronDown size={16} className="ml-2" />
        </button>
        
        {showSortDropdown && (
          <div className="absolute z-10 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setShowSortDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
                  activeSort === option.value ? 'bg-purple-900 text-white' : 'text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* clear Filters is implemented here  - only shows when filters are active */}
      {isAnyFilterActive && (
        <button
          onClick={clearAllFilters}
          className="flex items-center bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-full text-sm ml-auto"
        >
          <X size={16} className="mr-1" />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
}
