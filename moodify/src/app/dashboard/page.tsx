// moodify\src\app\dashboard\page.tsx


'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Upload,
  Music,
  Library,
  User,
  LogOut
} from 'lucide-react';
import MusicDiscovery from './discover/page';
import dynamic from 'next/dynamic';

const TrackPage = dynamic(() => import('@/app/dashboard/[trackId]/page'), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trackId = searchParams.get('track');
  
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');

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

  useEffect(() => {
    // set active page based on current path
    if (pathname.includes('/upload')) {
      setActivePage('upload');
    } else if (pathname.includes('/my-music')) {
      setActivePage('my-music');
    } else if (pathname.includes('/library')) {
      setActivePage('library');
    } else if (pathname.includes('/profile')) {
      setActivePage('profile');
    } else {
      setActivePage('home');
    }
  }, [pathname]);

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

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} />, path: '/dashboard' },
    { id: 'upload', label: 'Upload Music', icon: <Upload size={20} />, path: '/dashboard/upload' },
    { id: 'my-music', label: 'My Music', icon: <Music size={20} />, path: '/dashboard/my-music' },
    { id: 'library', label: 'Library', icon: <Library size={20} />, path: '/dashboard/library' },
    { id: 'profile', label: 'Profile', icon: <User size={20} />, path: '/dashboard/profile' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 fixed inset-y-0 left-0 z-20">
        <div className="p-4 border-b border-gray-800 flex items-center justify-center md:justify-start">
          <h1 className="text-2xl font-bold text-purple-500">Moodify</h1>
        </div>
        
        {/* navigation - with its own scrollbar if needed */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.path}>
                    <div
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        activePage === item.id
                          ? 'bg-purple-900 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 pt-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 w-full"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>
      
      <div className="flex-1 ml-64 flex flex-col h-screen">
        {/* fixed Header */}
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
            {trackId ? 'Track Details' : (
                <>
                  {activePage === 'home' && 'Discover Music'}
                  {activePage === 'upload' && 'Upload Music'}
                  {activePage === 'my-music' && 'My Music'}
                  {activePage === 'library' && 'My Library'}
                  {activePage === 'profile' && 'My Profile'}
                </>
              )}
            </h2>
            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center">
                  <span className="text-sm font-medium">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium hidden md:inline-block">{user.username}</span>
              </div>
            )}
          </div>
        </header>
        
        {/* scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {trackId ? (
              <TrackPage trackId={trackId} />
            ) : (
              <>
                {activePage === 'home' && <MusicDiscovery />}
                {activePage === 'upload' && <div>Upload Music Component (Coming Soon)</div>}
                {activePage === 'my-music' && <div>My Music Component (Coming Soon)</div>}
                {activePage === 'library' && <div>Library Component (Coming Soon)</div>}
                {activePage === 'profile' && <div>Profile Component (Coming Soon)</div>}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
