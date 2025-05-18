// moodify\src\app\components\Navbar.tsx

'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link 
              href="/"
              className="flex-shrink-0 text-xl sm:text-2xl font-bold text-purple-600 cursor-pointer"
            >
              Moodify
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link 
              href="/login" 
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-purple-600 text-purple-600 text-sm sm:text-base rounded-md hover:bg-purple-50 transition-colors cursor-pointer"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 text-white text-sm sm:text-base rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
