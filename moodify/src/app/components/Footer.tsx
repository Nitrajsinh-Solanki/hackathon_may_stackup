// moodify\src\app\components\Footer.tsx


export default function Footer() {
  return (
    <footer className="bg-gray-900/80 backdrop-blur-sm py-6 border-t border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-gray-200 text-sm tracking-wide">
              © {new Date().getFullYear()} <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Moodify</span>. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Created by <span className="font-medium text-purple-300">AuraBeats</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
