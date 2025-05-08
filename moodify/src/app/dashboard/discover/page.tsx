// moodify\src\app\dashboard\discover\page.tsx

'use client';
import { useState, useEffect } from 'react';
import { 
  Track, 
  getTrendingTracks, 
  searchTracks, 
  DEFAULT_LIMIT, 
  LOAD_MORE_LIMIT 
} from '@/lib/audius-api';
import SearchBar from '@/app/components/SearchBar';
import FilterBar from '@/app/components/FilterBar';
import TrackCard from '@/app/components/TrackCard';
import MusicPlayer from '@/app/components/MusicPlayer';
import { Loader2 } from 'lucide-react';

export default function MusicDiscovery() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All Genres');
  const [activeMood, setActiveMood] = useState('All Moods');
  const [activeSort, setActiveSort] = useState('trending');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    loadTracks(true);
  }, [activeGenre, activeSort]);

  const loadTracks = async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setOffset(0);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    const currentOffset = reset ? 0 : offset;
    const limit = reset ? DEFAULT_LIMIT : LOAD_MORE_LIMIT;
    
    try {
      let fetchedTracks: Track[] = [];
      
      if (searchQuery) {
        fetchedTracks = await searchTracks(
          searchQuery, 
          activeGenre !== 'All Genres' ? activeGenre : undefined,
          limit,
          currentOffset
        );
      } else {
        fetchedTracks = await getTrendingTracks(
          activeGenre !== 'All Genres' ? activeGenre : undefined,
          limit,
          currentOffset
        );
      }
      
      // filter by mood if selected
      if (activeMood !== 'All Moods') {
        fetchedTracks = fetchedTracks.filter(track => 
          track.mood && track.mood.toLowerCase() === activeMood.toLowerCase()
        );
      }
      
      // sort tracks based on activeSort
      if (activeSort === 'popular') {
        fetchedTracks.sort((a, b) => b.play_count - a.play_count);
      } else if (activeSort === 'recent') {
        fetchedTracks.sort((a, b) => {
          const dateA = new Date(a.release_date).getTime();
          const dateB = new Date(b.release_date).getTime();
          return dateB - dateA;
        });
      }
      
      if (reset) {
        setTracks(fetchedTracks);
      } else {
        setTracks(prevTracks => [...prevTracks, ...fetchedTracks]);
      }
      
      setOffset(currentOffset + limit);
    } catch (err) {
      console.error('Error loading tracks:', err);
      setError('Failed to load tracks. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    loadTracks(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setOffset(0);
    if (query) {
      setIsLoading(true);
      searchTracks(
        query, 
        activeGenre !== 'All Genres' ? activeGenre : undefined,
        DEFAULT_LIMIT,
        0
      )
        .then(results => {
          setTracks(results);
          setOffset(DEFAULT_LIMIT);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Search error:', err);
          setError('Search failed. Please try again.');
          setIsLoading(false);
        });
    } else {
      loadTracks(true);
    }
  };

  const handleGenreChange = (genre: string) => {
    setActiveGenre(genre);
  };

  const handleMoodChange = (mood: string) => {
    setActiveMood(mood);
    loadTracks(true);
  };

  const handleSortChange = (sort: string) => {
    setActiveSort(sort);
  };

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
  };

  return (
    <div className="pb-20">
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchBar onSearch={handleSearch} />
      </div>
      
      <FilterBar
        onGenreChange={handleGenreChange}
        onMoodChange={handleMoodChange}
        onSortChange={handleSortChange}
        activeGenre={activeGenre}
        activeMood={activeMood}
        activeSort={activeSort}
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={40} className="animate-spin text-purple-500" />
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-300">{error}</p>
          <button 
            onClick={() => loadTracks(true)}
            className="mt-2 text-sm text-white bg-red-800 hover:bg-red-700 px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      ) : tracks.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No tracks found</h3>
          <p className="text-gray-400">
            {searchQuery 
              ? `No results found for "${searchQuery}". Try a different search term or filter.`
              : 'No tracks available for the selected filters.'}
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-purple-300 mb-4">
            {searchQuery 
              ? `Search results for "${searchQuery}"`
              : activeGenre !== 'All Genres'
                ? `${activeSort === 'trending' ? 'Trending' : activeSort === 'popular' ? 'Popular' : 'Recent'} in ${activeGenre}`
                : `${activeSort === 'trending' ? 'Trending' : activeSort === 'popular' ? 'Popular' : 'Recent'} Tracks`}
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tracks.map((track) => (
              <TrackCard 
                key={track.id}
                track={track}
                onPlay={handlePlayTrack}
              />
            ))}
          </div>
          
          {/* Load More Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full flex items-center justify-center transition-colors disabled:opacity-70"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                `Load More Tracks`
              )}
            </button>
          </div>
        </>
      )}
      
      {currentTrack && (
        <MusicPlayer 
          track={currentTrack}
          onClose={() => setCurrentTrack(null)}
        />
      )}
    </div>
  );
}
