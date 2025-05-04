// moodify\src\app\dashboard\page.tsx


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Authentication check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-purple-400">
              Moodify
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Your Playlists</h2>
            <p className="text-gray-400">You haven't created any playlists yet.</p>
            <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors">
              Create Playlist
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Mood Recommendations</h2>
            <p className="text-gray-400">Discover music based on your current mood.</p>
            <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors">
              Explore Moods
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Recent Activity</h2>
            <p className="text-gray-400">Your listening history will appear here.</p>
            <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors">
              View History
            </button>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-gray-200 text-sm tracking-wide">
                © {new Date().getFullYear()} <span className="font-semibold">Moodify</span>. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Created by <span className="font-medium">Nitrajsinh Solanki</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
