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

      <Navbar />

      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-5xl font-extrabold text-purple-300 mb-6 drop-shadow-md">
          Welcome to Moodify
        </h1>
        <p className="text-xl max-w-2xl text-gray-300 mb-8">
          Discover music that matches your mood. Create playlists based on your emotions and relive your summer memories through personalized soundtracks.
        </p>
        <div className="flex gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-all">
            Get Started
          </button>
          <button className="border border-purple-500 text-purple-300 hover:bg-purple-800 hover:text-white font-bold py-2 px-6 rounded-full transition-all">
            Learn More
          </button>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes blob1 {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(30px, -20px) scale(1.1);
          }
        }

        @keyframes blob2 {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(-20px, 20px) scale(1.05);
          }
        }

        @keyframes blob3 {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(0px, -30px) scale(1.1);
          }
        }

        .animate-blob1 {
          animation: blob1 20s ease-in-out infinite;
        }

        .animate-blob2 {
          animation: blob2 25s ease-in-out infinite;
        }

        .animate-blob3 {
          animation: blob3 30s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
