// hackathon_may_stackup\moodify\src\app\components\ProfileDashboard.tsx


'use client';
import { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  ListMusic, 
  Album, 
  Music, 
  PlayCircle 
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function ProfileDashboard({ userData }: { userData: any }) {
  const [playlistTrackCounts, setPlaylistTrackCounts] = useState<number[]>([]);
  const [playlistNames, setPlaylistNames] = useState<string[]>([]);
  const [totalTracks, setTotalTracks] = useState(0);
  const [createdPlaylists, setCreatedPlaylists] = useState([]);

  useEffect(() => {
    const fetchCreatedPlaylists = async () => {
      try {
        const response = await fetch('/api/playlists/created', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setCreatedPlaylists(data.playlists || []);
          
          // calculating track counts
          const trackCounts = data.playlists.map((playlist: any) => playlist.tracks.length);
          setPlaylistTrackCounts(trackCounts);
          setPlaylistNames(data.playlists.map((playlist: any) => playlist.name));
          
          // calculating total tracks
          const total = trackCounts.reduce((sum: number, count: number) => sum + count, 0);
          setTotalTracks(total);
        }
      } catch (error) {
        console.error('Error fetching created playlists:', error);
      }
    };

    // if userData has createdPlaylists, use it; otherwise fetch
    if (userData?.createdPlaylists && userData.createdPlaylists.length > 0) {
      setCreatedPlaylists(userData.createdPlaylists);
      const trackCounts = userData.createdPlaylists.map((playlist: any) => playlist.tracks.length);
      setPlaylistTrackCounts(trackCounts);
      setPlaylistNames(userData.createdPlaylists.map((playlist: any) => playlist.name));
      setTotalTracks(trackCounts.reduce((sum: number, count: number) => sum + count, 0));
    } else {
      fetchCreatedPlaylists();
    }
  }, [userData]);

  // fetching liked tracks count if not available
  useEffect(() => {
    const fetchLikedTracks = async () => {
      if (!userData?.likedTracks) {
        try {
          const response = await fetch('/api/my-music/liked-tracks', {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            // updating  liked tracks count in stats
            const statsCardsCopy = [...statsCards];
            statsCardsCopy[0].value = data.tracks?.length || 0;
          }
        } catch (error) {
          console.error('Error fetching liked tracks:', error);
        }
      }
    };
    
    fetchLikedTracks();
  }, [userData]);

  const statsCards = [
    {
      title: 'Liked Songs',
      value: userData?.likedTracks?.length || 0,
      icon: <ThumbsUp className="h-6 w-6 text-purple-400" />,
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-700'
    },
    {
      title: 'Saved Playlists',
      value: userData?.savedPlaylists?.length || 0,
      icon: <ListMusic className="h-6 w-6 text-blue-400" />,
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-700'
    },
    {
      title: 'Saved Albums',
      value: userData?.savedAlbums?.length || 0,
      icon: <Album className="h-6 w-6 text-green-400" />,
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700'
    },
    {
      title: 'Created Playlists',
      value: createdPlaylists?.length || 0,
      icon: <Music className="h-6 w-6 text-pink-400" />,
      bgColor: 'bg-pink-900/20',
      borderColor: 'border-pink-700'
    },
    {
      title: 'Total Tracks',
      value: totalTracks,
      icon: <PlayCircle className="h-6 w-6 text-yellow-400" />,
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-700'
    }
  ];

  const pieChartData = {
    labels: ['Liked Songs', 'Saved Playlists', 'Saved Albums', 'Created Playlists'],
    datasets: [
      {
        data: [
          userData?.likedTracks?.length || 0,
          userData?.savedPlaylists?.length || 0,
          userData?.savedAlbums?.length || 0,
          createdPlaylists?.length || 0
        ],
        backgroundColor: [
          'rgba(147, 51, 234, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: playlistNames,
    datasets: [
      {
        label: 'Number of Tracks',
        data: playlistTrackCounts,
        backgroundColor: 'rgba(147, 51, 234, 0.7)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Your Music Activity',
        color: 'white',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statsCards.map((card, index) => (
          <div 
            key={index}
            className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4 flex flex-col items-center justify-center text-center`}
          >
            <div className="mb-2">{card.icon}</div>
            <h3 className="text-lg font-medium text-white">{card.title}</h3>
            <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Music Activity Overview</h3>
          <div className="h-64">
            <Pie data={pieChartData} />
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Tracks per Playlist</h3>
          <div className="h-64">
            {playlistNames.length > 0 ? (
              <Bar options={chartOptions} data={barChartData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No playlists created yet
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        {userData?.likedTracks?.length > 0 || userData?.savedPlaylists?.length > 0 ? (
          <div className="space-y-4">
            {userData?.likedTracks?.slice(0, 3).map((track: any, index: number) => (
              <div key={`liked-${index}`} className="flex items-center p-3 bg-gray-700/30 rounded-lg">
                <ThumbsUp className="h-5 w-5 text-purple-400 mr-3" />
                <div>
                  <p className="text-white font-medium">{track.title}</p>
                  <p className="text-gray-400 text-sm">Liked a song by {track.artist}</p>
                </div>
              </div>
            ))}
            {userData?.savedPlaylists?.slice(0, 3).map((playlist: any, index: number) => (
              <div key={`playlist-${index}`} className="flex items-center p-3 bg-gray-700/30 rounded-lg">
                <ListMusic className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-white font-medium">{playlist.title}</p>
                  <p className="text-gray-400 text-sm">Saved a playlist with {playlist.trackCount} tracks</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No recent activity to display</p>
        )}
      </div>
    </div>
  );
}

