// hackathon_may_stackup\moodify\src\app\components\SavedAlbumsList.tsx



"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Disc, Calendar, Music, User, ExternalLink } from 'lucide-react';
import { SavedAlbum } from '@/models/User';
import { formatDistanceToNow } from 'date-fns';

export default function SavedAlbumsList() {
  const [albums, setAlbums] = useState<SavedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchSavedAlbums = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setDebugInfo('Fetching saved albums...');
        
        const response = await fetch('/api/albums/saved', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        
        setDebugInfo(prev => prev + `\nResponse status: ${response.status}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            setDebugInfo(prev => prev + '\nNot authenticated, redirecting to login');
            router.push('/login');
            return;
          }
          const errorText = await response.text();
          setDebugInfo(prev => prev + `\nError response: ${errorText}`);
          throw new Error(`Failed to fetch saved albums: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        setDebugInfo(prev => prev + `\nData received: ${JSON.stringify(data)}`);
        
        
        if (data && Array.isArray(data.savedAlbums)) {
          setAlbums(data.savedAlbums);
          setDebugInfo(prev => prev + `\nAlbums set, count: ${data.savedAlbums.length}`);
        } else {
          setAlbums([]);
          setDebugInfo(prev => prev + '\nNo albums found or invalid data format');
        }
      } catch (err) {
        console.error('Error fetching saved albums:', err);
        setError(`Failed to load your saved albums: ${err instanceof Error ? err.message : String(err)}`);
        setDebugInfo(prev => prev + `\nError: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedAlbums();
  }, [router]);

  const handleAlbumClick = (albumId: string) => {
    router.push(`/dashboard/album/${albumId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  

  if (!albums || albums.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-8 text-center">
          <Disc size={48} className="text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">You haven't saved any albums yet</p>
          <button 
            onClick={() => router.push('/dashboard/playlist-album')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-full inline-flex items-center"
          >
            <ExternalLink size={18} className="mr-2" />
            Explore Music
          </button>
        </div>
        
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {albums.map((album) => (
          <div 
            key={album.albumId}
            onClick={() => handleAlbumClick(album.albumId)}
            className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-700/50 transition-colors cursor-pointer group"
          >
            <div className="relative aspect-square">
              {album.coverImage ? (
                <Image
                  src={album.coverImage}
                  alt={album.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Disc size={64} className="text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3">
                  <Music size={24} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium truncate">{album.title}</h3>
              <p className="text-gray-400 text-sm truncate">{album.artist}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar size={12} className="mr-1" />
                  {album.year || 'Unknown'}
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Music size={12} className="mr-1" />
                  {album.trackCount} tracks
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Saved {typeof album.savedAt === 'string' 
                  ? formatDistanceToNow(new Date(album.savedAt), { addSuffix: true })
                  : album.savedAt instanceof Date 
                    ? formatDistanceToNow(album.savedAt, { addSuffix: true })
                    : 'recently'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
