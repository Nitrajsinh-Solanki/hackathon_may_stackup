
# 🎧 Moodify

🎧 **Moodify** is a full-featured AI-powered music web application built with Next.js, TypeScript, and Tailwind CSS. It leverages 🌍 geolocation, 🌤️ weather data, 🎶 user listening behavior, and 🔌 modern music APIs to deliver personalized music recommendations and immersive listening experiences. Whether you're vibing to the weather or exploring your favorite playlists, Moodify brings your mood to life through music.
## 🌟 Features

### 🎵 Core Music Features

* **Music Streaming**: Powered by Jamendo, Audius, and Deezer APIs.
* **Search Albums, Playlists, and Tracks**: Explore music from multiple sources.
* **Save & Like**: Save albums, playlists, and tracks you love.
* **Upload Your Own Music**: Upload tracks to Cloudinary with metadata support.
* **Custom Music Player**: Built-in visualizer and track controls.

### 🧠 AI-Powered Intelligence

* **Environmental Recommendations**: Personalized tracks based on location, weather, and time using Gemini AI.
* **Behavioral Recommendations**: Suggestions based on user likes, search history, and saved content (via Gemini).
* **Music Chat**: Chat-based music assistant powered by Gemini for discovering tracks conversationally.

### 📚 User Dashboard & Management

* **Authentication**: Register, login, OTP verification, password management.
* **Profile Dashboard**: Manage user details and view listening summaries.
* **Library**: Your saved music organized neatly in playlists and albums.
* **History & Insights**: View search history and AI-generated listening summaries.

## 🛠 Tech Stack

* **Frontend**: Next.js 15, React 19, Tailwind CSS
* **Backend**: Node.js, Next.js API routes
* **AI**: Gemini Generative AI
* **Storage**: Cloudinary (for uploads), MongoDB (via Mongoose)
* **Authentication**: Custom auth with OTP verification
* **APIs Used**:

  * [Jamendo](https://developer.jamendo.com/)
  * [Deezer](https://developers.deezer.com/)
  * [TheAudioDB](https://www.theaudiodb.com/)
  * [Audius](https://audius.org/)
  * [Google Gemini](https://ai.google.dev/)

## 📦 Installation

### Prerequisites

* Node.js >= 18
* MongoDB URI
* Cloudinary credentials
* Gemini API key

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/nitrajsinh-solanki/hackathon_may_stackup.git
   cd hackathon_may_stackup/moodify
   ```

2. Install dependencies:

   ```bash
   npm install
   ```


---

### 🔐 3. Set up `.env`

Create a `.env` file in the root of the project and add the following environment variables:

```env
# Database (MongoDB Atlas)
MONGODB_URI=your_mongodb_uri

# Email (for OTP verification via Nodemailer)
EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_email_password

# JWT secret (for user sessions)
JWT_SECRET=your_jwt_secret

# Cloudinary (for uploading and hosting audio files)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Public API keys
NEXT_PUBLIC_JAMENDO_CLIENT_ID=your_jamendo_client_id

NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key

NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```


### 🧩 Need help setting these up?

* 🔗 **MongoDB URI**:
  Get it from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) after setting up a free cluster.
  📽️ [Video tutorial](https://youtu.be/SMXbGrKe5gM?feature=shared)

* 📧 **Email credentials for Nodemailer**:
  If you're using Gmail, enable 2FA and generate an App Password instead of using your real password.
  📽️ [How to generate a Gmail App Password](https://youtu.be/FT-AiOcw-50?feature=shared)

* 🔐 **JWT Secret**:
  Generate a secure token using this free tool:
  [JWT Generator](https://www.javainuse.com/jwtgenerator)

* ☁️ **Cloudinary credentials**:
  Create an account and get your API keys from your [Cloudinary dashboard](https://cloudinary.com/)

* 🎶 **Jamendo API Key**:
  Sign up as a developer and create an app at [Jamendo Developer Portal](https://developer.jamendo.com/v3.0)

* 🌦️ **OpenWeather API Key**:
  Register and create a key at [OpenWeather](https://home.openweathermap.org/api_keys)

* 🤖 **Gemini API Key**:
  Access and generate your API key from [Google Gemini](https://ai.google.dev)
---

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.


## 🧩 Project Structure
```
hackathon_may_stackup/
└── moodify/
    ├── README.md                      // Project documentation and setup instructions
    ├── eslint.config.mjs              // ESLint configuration for code quality
    ├── next.config.ts                 // Next.js configuration settings
    ├── package-lock.json              // Dependency lock file
    ├── package.json                   // Project dependencies and scripts
    ├── postcss.config.mjs             // PostCSS configuration for CSS processing
    ├── tsconfig.json                  // TypeScript configuration
    ├── .gitignore                     // Git ignore file
    ├── public/                        // Static assets directory
    └── src/
        ├── middleware.ts              // Next.js middleware for auth protection and routing logic
        ├── app/
        │   ├── globals.css            // Global Tailwind CSS and custom styles
        │   ├── layout.tsx             // Root layout with common UI elements for all pages
        │   ├── page.tsx               // Landing page with login/signup options and app intro
        │   ├── api/                   // Backend API routes
        │   │   ├── albums/            // Album management endpoints
        │   │   │   ├── check/
        │   │   │   │   └── route.ts   // Checks if an album is saved by the current user
        │   │   │   ├── save/
        │   │   │   │   └── route.ts   // Saves an album to user's collection
        │   │   │   ├── saved/
        │   │   │   │   └── route.ts   // Retrieves all saved albums for the current user
        │   │   │   └── unsave/
        │   │   │       └── route.ts   // Removes an album from user's saved collection
        │   │   ├── audiodb/           // TheAudioDB API integration
        │   │   │   ├── album/
        │   │   │   │   └── route.ts   // Fetches detailed album information
        │   │   │   ├── popular-albums/
        │   │   │   │   └── route.ts   // Gets trending/popular albums
        │   │   │   ├── search-albums/
        │   │   │   │   └── route.ts   // Searches albums by name or artist
        │   │   │   └── tracks/
        │   │   │       └── route.ts   // Gets tracks for a specific album
        │   │   ├── auth/              // Authentication endpoints
        │   │   │   ├── login/
        │   │   │   │   └── route.ts   // User login with email/password
        │   │   │   ├── logout/
        │   │   │   │   └── route.ts   // Logs out current user and clears session
        │   │   │   ├── me/
        │   │   │   │   └── route.ts   // Gets current authenticated user data
        │   │   │   ├── register/
        │   │   │   │   └── route.ts   // Creates new user account and sends OTP
        │   │   │   ├── resend-otp/
        │   │   │   │   └── route.ts   // Resends verification OTP to user's email
        │   │   │   └── verify-otp/
        │   │   │       └── route.ts   // Verifies OTP code to activate account
        │   │   ├── deezer/            // Deezer API integration
        │   │   │   ├── featured-playlists/
        │   │   │   │   └── route.ts   // Gets featured/curated playlists from Deezer
        │   │   │   ├── playlist/
        │   │   │   │   └── [id]/
        │   │   │   │       └── route.ts // Gets specific playlist details by ID
        │   │   │   └── search-playlists/
        │   │   │       └── route.ts   // Searches playlists on Deezer
        │   │   ├── geolocation/
        │   │   │   └── route.ts       // Gets user's location for recommendations
        │   │   ├── jamendo/           // Jamendo API integration
        │   │   │   ├── batch-search/
        │   │   │   │   └── route.ts   // Searches multiple tracks in one request
        │   │   │   ├── search/
        │   │   │   │   └── route.ts   // Searches tracks on Jamendo
        │   │   │   └── stream/
        │   │   │       └── [id]/
        │   │   │           └── route.ts // Gets streaming URL for a track
        │   │   ├── music-chat/        // AI music assistant endpoints
        │   │   │   ├── clear/
        │   │   │   │   └── route.ts   // Clears chat history
        │   │   │   ├── history/
        │   │   │   │   └── route.ts   // Gets user's chat history
        │   │   │   └── save/
        │   │   │       └── route.ts   // Saves chat conversation
        │   │   ├── my-music/          // User's uploaded music
        │   │   │   ├── route.ts       // Gets all user uploaded tracks
        │   │   │   ├── [id]/
        │   │   │   │   └── route.ts   // Gets specific uploaded track
        │   │   │   ├── like/
        │   │   │   │   ├── route.ts   // Likes/unlikes a track
        │   │   │   │   └── batch/
        │   │   │   │       └── route.ts // Batch like/unlike multiple tracks
        │   │   │   └── liked-tracks/
        │   │   │       └── route.ts   // Gets all liked tracks
        │   │   ├── playlists/         // Playlist management
        │   │   │   ├── [playlistId]/
        │   │   │   │   ├── route.ts   // Gets specific playlist details
        │   │   │   │   └── remove-track/
        │   │   │   │       └── route.ts // Removes track from playlist
        │   │   │   ├── add-track/
        │   │   │   │   └── route.ts   // Adds track to playlist
        │   │   │   ├── create/
        │   │   │   │   └── route.ts   // Creates new playlist
        │   │   │   ├── created/
        │   │   │   │   └── route.ts   // Gets all playlists created by user
        │   │   │   ├── delete/
        │   │   │   │   └── route.ts   // Deletes a playlist
        │   │   │   ├── is-saved/
        │   │   │   │   └── route.ts   // Checks if playlist is saved
        │   │   │   ├── save/
        │   │   │   │   └── route.ts   // Saves playlist to collection
        │   │   │   ├── saved/
        │   │   │   │   └── route.ts   // Gets all saved playlists
        │   │   │   └── update/
        │   │   │       └── route.ts   // Updates playlist details
        │   │   ├── recommendations/   // Music recommendations
        │   │   │   └── environmental/
        │   │   │       └── route.ts   // Gets recommendations based on weather/time
        │   │   ├── tracks/
        │   │   │   └── [trackId]/
        │   │   │       └── like/
        │   │   │           └── route.ts // Likes/unlikes a specific track
        │   │   ├── upload/
        │   │   │   └── route.ts       // Handles music file uploads
        │   │   └── user/              // User profile management
        │   │       ├── change-password/
        │   │       │   └── route.ts   // Updates user password
        │   │       ├── data/
        │   │       │   └── route.ts   // Gets user profile data
        │   │       ├── search-history/
        │   │       │   └── route.ts   // Gets user's search history
        │   │       ├── summary/
        │   │       │   └── route.ts   // Gets AI-generated listening summary
        │   │       └── update-profile/
        │   │           └── route.ts   // Updates user profile info
        │   ├── components/            // Reusable UI components
        │   │   ├── AlbumCard.tsx      // Displays album with cover, title, artist - used in discover and search results
        │   │   ├── AudioVisualizer.tsx // Visual waveform for playing tracks - used in MusicPlayer
        │   │   ├── ChangePassword.tsx // Password change form - used in profile page
        │   │   ├── CloudinaryMusicPlayer.tsx // Player for Cloudinary-hosted tracks - used for uploaded music
        │   │   ├── CreatedPlaylistList.tsx // Lists user-created playlists - used in library page
        │   │   ├── CreatePlaylistForm.tsx // Form to create new playlist - used in library page
        │   │   ├── EditPlaylistModal.tsx // Modal to edit playlist details - used in playlist pages
        │   │   ├── EnvironmentalRecommendations.tsx // Weather-based recommendations - used in recommendations page
        │   │   ├── FilterBar.tsx      // Filtering options for music lists - used in discover and library pages
        │   │   ├── Footer.tsx         // App footer with links - used in main layout
        │   │   ├── HistoryRecommendations.tsx // History-based suggestions - used in recommendations page
        │   │   ├── LikeButton.tsx     // Heart icon to like tracks - used in TrackCard and player
        │   │   ├── LikedMusicList.tsx // Shows liked tracks - used in my-music page
        │   │   ├── MusicPlayer.tsx    // Main audio player - used in dashboard layout
        │   │   ├── MyMusicPlaylistSelector.tsx // Dropdown to add tracks to playlists - used in track pages
        │   │   ├── Navbar.tsx         // Top navigation bar - used in dashboard layout
        │   │   ├── PlaylistCard.tsx   // Displays playlist with cover and title - used in library and discover pages
        │   │   ├── PlaylistSelector.tsx // Dropdown to select playlists - used when adding tracks
        │   │   ├── ProfileDashboard.tsx // User profile overview - used in profile page
        │   │   ├── SavedAlbumsList.tsx // Lists saved albums - used in library page
        │   │   ├── SavedPlaylistsList.tsx // Lists saved playlists - used in library/saved-playlists page
        │   │   ├── SavePlaylistButton.tsx // Button to save playlists - used in playlist pages
        │   │   ├── SearchBar.tsx      // Search input with suggestions - used in discover page
        │   │   ├── TrackCard.tsx      // Displays track info - used in album and playlist pages
        │   │   ├── TrackList.tsx      // Lists tracks with play options - used in album and playlist pages
        │   │   ├── UserDetails.tsx    // Shows user profile details - used in profile page
        │   │   ├── UserSummary.tsx    // AI-generated listening habits - used in profile page
        │   │   └── ui/
        │   │       └── tabs.tsx       // Reusable tab component - used in multiple dashboard pages
        │   ├── context/
        │   │   └── LikedTracksContext.tsx // Global state for liked tracks - used across player and track components
        │   ├── dashboard/             // Main app pages after login
        │   │   ├── layout.tsx         // Dashboard layout with sidebar and player - wraps all dashboard pages
        │   │   ├── page.tsx           // Dashboard home with overview and quick access - entry point after login
        │   │   ├── [trackId]/
        │   │   │   └── page.tsx       // Individual track page with details and player - accessed from track links
        │   │   ├── album/
        │   │   │   └── [id]/
        │   │   │       └── page.tsx   // Album details page with tracks - accessed from album cards
        │   │   ├── discover/
        │   │   │   ├── layout.tsx     // Discover section layout - used for all discovery features
        │   │   │   └── page.tsx       // Music discovery with trending and search - accessed from sidebar
        │   │   ├── library/
        │   │   │   ├── page.tsx       // User's music library overview - accessed from sidebar
        │   │   │   ├── [playlistId]/
        │   │   │   │   └── page.tsx   // User's playlist details - accessed from library playlists
        │   │   │   └── saved-playlists/
        │   │   │       └── page.tsx   // Saved playlists view - accessed from library tabs
        │   │   ├── music-chat/
        │   │   │   └── page.tsx       // AI music assistant chat - accessed from sidebar
        │   │   ├── my-music/
        │   │   │   └── page.tsx       // User's uploaded and liked music - accessed from sidebar
        │   │   ├── playlist/
        │   │   │   └── [id]/
        │   │   │       └── page.tsx   // Public playlist details - accessed from playlist cards
        │   │   ├── playlist-album/
        │   │   │   └── page.tsx       // Combined playlist/album view - accessed from recommendations
        │   │   ├── profile/
        │   │   │   └── page.tsx       // User profile management - accessed from navbar
        │   │   ├── recommendations/
        │   │   │   └── page.tsx       // Personalized music recommendations - accessed from sidebar
        │   │   └── upload/
        │   │       └── page.tsx       // Music upload interface - accessed from sidebar
        │   ├── hooks/
        │   │   └── useUserData.ts     // Custom hook for user data - used in profile and dashboard components
        │   ├── login/
        │   │   └── page.tsx           // Login page with form - accessed from landing page
        │   ├── register/
        │   │   └── page.tsx           // Registration page with form - accessed from landing page
        │   └── verify-otp/
        │       └── page.tsx           // OTP verification page - accessed after registration
        ├── lib/                       // Utility functions and API clients
        │   ├── audiodb-api.ts         // TheAudioDB API client - used for album and track metadata
        │   ├── audius-api.ts          // Audius API client - used for decentralized music content
        │   ├── combined-api.ts        // Aggregates multiple music APIs - used for comprehensive search
        │   ├── custom-audio-adapter.ts // Audio playback utilities - used by music player components
        │   ├── db.ts                  // MongoDB connection and utilities - used by API routes
        │   ├── deezer-api.ts          // Deezer API client - used for playlists and tracks
        │   ├── gemini-api.ts          // Google Gemini AI client - used for environmental recommendations
        │   ├── gemini-api2.ts         // Extended Gemini AI client - used for personalized recommendations
        │
        │   ├── gemini-music-chat.ts   // Gemini AI for music chat - used in music-chat page for conversational recommendations
        │   ├── gemini-user-summary.ts // Gemini AI for user insights - used in profile page to generate listening summaries
        │   ├── jamendo-api.ts         // Jamendo API client - used for free music streaming and discovery
        │   ├── mail.ts                // Email sending utilities - used for OTP verification during registration
        │   ├── utils.ts               // General utility functions - used throughout the application
        │   ├── utils2.ts              // Additional utility functions - used for specialized formatting and processing
        │   └── weather-api.ts         // Weather API client - used for environmental music recommendations
        └── models/                    // Database models
            ├── OTP.ts                 // OTP model for verification codes - used in auth verification flow
            └── User.ts                // User model with profile and preferences - used for all user-related operations

```

## 📜 License

This project is open-source under the [MIT License](LICENSE).

---
