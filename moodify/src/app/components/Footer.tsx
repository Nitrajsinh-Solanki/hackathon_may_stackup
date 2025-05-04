// moodify\src\app\components\Footer.tsx


export default function Footer() {
    return (
      <footer className="bg-gray-800 py-6">
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
    );
  }
  