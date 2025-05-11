// hackathon_may_stackup\moodify\src\app\dashboard\playlist-album\page.tsx



'use client';
import { useState, useEffect } from 'react';
import { Search, Disc, Album, Loader } from 'lucide-react';
import {
  getFeaturedPlaylists,
  searchPlaylists,
  DeezerPlaylist,
} from '@/lib/deezer-api';
import {
  searchAlbumsByArtist,
  getPopularAlbums,
  AudioDBAlbum,
  DEFAULT_LIMIT
} from '@/lib/audiodb-api';
import PlaylistCard from '@/app/components/PlaylistCard';
import AlbumCard from '@/app/components/AlbumCard';

export default function PlaylistAlbumPage() {
  const [activeTab, setActiveTab] = useState<'playlists' | 'albums'>('playlists');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [playlists, setPlaylists] = useState<DeezerPlaylist[]>([]);
  const [albums, setAlbums] = useState<AudioDBAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // load featured playlists or popular albums on initial load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (activeTab === 'playlists') {
          const featuredPlaylists = await getFeaturedPlaylists();
          setPlaylists(featuredPlaylists);
        } else {
          const popularAlbums = await getPopularAlbums();
          setAlbums(popularAlbums);
        }
      } catch (err) {
        console.error(`Error loading ${activeTab}:`, err);
        setError(`Failed to load ${activeTab === 'playlists' ? 'featured playlists' : 'popular albums'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [activeTab]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setError(null);
      
      if (activeTab === 'playlists') {
        const results = await searchPlaylists(searchQuery);
        setPlaylists(results.data || []);
      } else {
        // for albums, we search by artist name with TheAudioDB
        const results = await searchAlbumsByArtist(searchQuery);
        setAlbums(results || []);
      }
    } catch (err) {
      console.error(`Error searching ${activeTab}:`, err);
      setError(`Failed to search ${activeTab}`);
      if (activeTab === 'playlists') {
        setPlaylists([]);
      } else {
        setAlbums([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleTabChange = (tab: 'playlists' | 'albums') => {
    if (tab === activeTab) return; 
    
    setActiveTab(tab);
    setSearchQuery('');
    setError(null);
    setIsLoading(true);
    
    if (tab === 'playlists') {
      getFeaturedPlaylists()
        .then(data => {
          setPlaylists(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error loading featured playlists:', err);
          setError('Failed to load featured playlists');
          setIsLoading(false);
        });
    } else {
      getPopularAlbums()
        .then(data => {
          setAlbums(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error loading popular albums:', err);
          setError('Failed to load popular albums');
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Playlists & Albums</h1>
        <p className="text-gray-400">Discover and search for playlists and albums</p>
      </div>
      
            <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`py-3 px-6 font-medium flex items-center ${
            activeTab === 'playlists'
              ? 'text-purple-500 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => handleTabChange('playlists')}
        >
          <Disc size={18} className="mr-2" />
          Playlists
        </button>
        <button
          className={`py-3 px-6 font-medium flex items-center ${
            activeTab === 'albums'
              ? 'text-purple-500 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => handleTabChange('albums')}
        >
          <Album size={18} className="mr-2" />
          Albums
        </button>
      </div>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder={activeTab === 'playlists' 
              ? 'Search playlists...' 
              : 'Search albums by artist name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-3 px-4 pl-12 focus:outline-none focus:border-purple-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-md disabled:bg-purple-800 disabled:text-gray-300"
          >
            {isSearching ? <Loader size={16} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-900/20 border border-red-900 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* content will be shown by this*/}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div>
          {activeTab === 'playlists' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-4">
                {searchQuery ? `Results for "${searchQuery}"` : 'Featured Playlists'}
              </h2>
              {playlists.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  {searchQuery ? 'No playlists found for your search.' : 'No featured playlists available.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'albums' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-4">
                {searchQuery ? `Albums by "${searchQuery}"` : 'Popular Albums'}
              </h2>
              {albums.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  {searchQuery 
                    ? 'No albums found for this artist.'
                    : 'No popular albums available.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {albums.map((album) => (
                    <AlbumCard key={album.idAlbum} album={album} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}


