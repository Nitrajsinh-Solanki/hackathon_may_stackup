// moodify\src\app\page.tsx

"use client";


import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-purple-700 opacity-20 rounded-full filter blur-3xl animate-blob1 z-0" />
      <div className="absolute top-40 -right-32 w-[400px] h-[400px] bg-pink-600 opacity-20 rounded-full filter blur-2xl animate-blob2 z-0" />
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-blue-600 opacity-20 rounded-full filter blur-2xl animate-blob3 z-0" />
      
      <div className="absolute top-1/4 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-20 w-3 h-3 bg-pink-400 rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
      <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
      
      <Navbar />
      
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 md:p-8 text-center">
        <div className="max-w-4xl mx-auto backdrop-blur-sm bg-black/20 p-8 md:p-12 rounded-2xl border border-purple-500/20 shadow-xl">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-md">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Welcome to Moodify
            </span>
          </h1>
          
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-300 mb-8 leading-relaxed">
            Discover music that matches your mood. Create playlists based on your emotions 
            and relive your summer memories through personalized soundtracks.
          </p>
          
          <div className="mt-10">
            <a 
              href="/register" 
              className="group relative inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 overflow-hidden font-bold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:from-purple-500 hover:to-pink-500"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
              <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
              <span className="relative flex items-center">
                Get Started
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </span>
            </a>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <div className="flex items-center space-x-2 text-purple-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Personalized Musics</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Mood-Based Discovery</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Free to Use</span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <style jsx>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-20px, 20px) scale(1.05); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(0px, -30px) scale(1.1); }
        }
        .animate-blob1 { animation: blob1 20s ease-in-out infinite; }
        .animate-blob2 { animation: blob2 25s ease-in-out infinite; }
        .animate-blob3 { animation: blob3 30s ease-in-out infinite; }
      `}</style>
    </main>
  );

  


}
