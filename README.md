# 🎧 Moodify

🎧 **Moodify** is a full-featured AI-powered music web application built with Next.js, TypeScript, and Tailwind CSS. It leverages 🌍 geolocation, 🌤️ weather data, 🎶 user listening behavior, and 🔌 modern music APIs to deliver personalized music recommendations and immersive listening experiences. Whether you're vibing to the weather or exploring your favorite playlists, Moodify brings your mood to life through music.

![MIT License](https://img.shields.io/badge/License-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

---

## 📚 Table of Contents

1. [🌟 Features](#-features)
2. [🎮 Video Demo and Showcase](#-live-demo-and-showcase)
3. [🤔 Why Moodify?](#-why-moodify)
4. [📂 Directory Structure](#-directory-structure)
5. [🔌 API Integrations](#-api-integrations)
6. [🚀 Getting Started](#-installation)
7. [🔐 Authentication Workflow](#-authentication-workflow)
8. [🛠 Tech Stack](#-tech-stack)
9. [👥 Contributors](#-contributors)
10. [🙏 Acknowledgements](#-acknowledgements)
11. [📞 Contact](#-contact)
12. [📜 License](#-license)

---

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

---

## 🎮 Live Demo and Showcase

Experience Moodify in action through our comprehensive video demonstrations:

* 🎬 **Full Application Demo**: [Watch on YouTube](https://youtu.be/MAW5gd2lZxM?feature=shared)
  See the complete user journey from sign-up to personalized recommendations.
  
* ⚙️ **Project Setup Guide**: [Watch on YouTube](https://youtu.be/qduyHvMyG_4?feature=shared)
  Follow along with our detailed setup process to get Moodify running on your machine.

---

## 🤔 Why Moodify?

Moodify stands out from traditional music platforms by:

* **Contextual Understanding**: We don't just recommend music; we understand your environment and mood.
* **Multi-Source Integration**: Access music from various platforms in one unified experience.
* **AI-Powered Personalization**: Our recommendation engine learns and evolves with your listening habits.
* **Privacy-Focused**: Your data stays on your device, with transparent AI processing.
* **Developer-Friendly**: Built with modern tech stack and well-documented for easy contributions.

---

## 📂 Directory Structure

The project follows a modular architecture for maintainability and scalability:

```
moodify/
├── app/                # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # User dashboard
│   ├── explore/        # Music discovery
│   └── upload/         # Music upload functionality
├── components/         # Reusable UI components
├── lib/                # Utility functions and helpers
├── models/             # MongoDB schemas
├── public/             # Static assets
└── styles/             # Global styles
```

For a complete and detailed breakdown of the Moodify project structure, please refer to the following Medium article:
🔗 [Moodify: AI-Powered Music Experience – Full Project Structure](https://medium.com/@nrsolanki2005/moodify-ai-powered-music-experience-3eb356849948)

---

## 🔌 API Integrations

Moodify seamlessly integrates with multiple music and AI services:

* **Jamendo API**: For indie and creative commons music
* **Deezer API**: For mainstream music catalog access
* **Audius API**: For decentralized music platform integration
* **TheAudioDB**: For artist information and metadata
* **Google Gemini**: For AI-powered recommendations and chat
* **OpenWeather API**: For location-based weather data
* **Cloudinary**: For music storage and streaming

Each integration is abstracted through our API layer for consistent data handling.

---

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

---

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

### 🔐 3. Set-up-env
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

---

### 🧩 Need help setting these up?
* 🔗 **MongoDB URI**:
  Get it from [MongoDB Atlas](https://account.mongodb.com/account/login) after setting up a free cluster.
  📽️ [Video tutorial](https://youtu.be/SMXbGrKe5gM?feature=shared)
* 📧 **Email credentials for Nodemailer**:
  If you're using Gmail, enable 2FA and generate an App Password.
  📽️ [How to generate a Gmail App Password](https://youtu.be/FT-AiOcw-50?feature=shared)
* 🔐 **JWT Secret**:
  Generate a secure token here: [JWT Generator](https://www.javainuse.com/jwtgenerator)
* ☁️ **Cloudinary credentials**:
  [Cloudinary Dashboard](https://cloudinary.com/users/login)
* 🎶 **Jamendo API Key**:
  [Jamendo Developer Portal](https://devportal.jamendo.com/login)
* 🌦️ **OpenWeather API Key**:
  [OpenWeather Sign In](https://home.openweathermap.org/users/sign_in)
* 🤖 **Gemini API Key**:
  [Google Gemini API Console](https://aistudio.google.com/app/apikey)

---

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Authentication Workflow

Moodify implements a secure authentication system:

1. **Registration**: Email, password, and profile details
2. **Email Verification**: OTP sent via Nodemailer
3. **Login**: Secure JWT-based authentication
4. **Password Recovery**: Email-based reset flow
5. **Session Management**: Persistent login with secure cookies

All authentication routes are protected with rate limiting and CSRF protection.

---

## 🙏 Acknowledgements

Special thanks to:
- The open-source community for invaluable libraries and tools
- Music API providers for enabling our multi-source integration
- Google for Gemini AI capabilities
- All beta testers who provided feedback

---


## 👥 Contributors

This project was developed by:

### Nitrajsinh Solanki
- 🧠 AI Integration & Recommendation Engine
- 🎵 Music API Integrations (Jamendo, Deezer, Audius)
- 🔐 Authentication System
- 📊 User Dashboard & Analytics
- 🌐 Project Architecture & Documentation

### Amar Tiwari
- 🎨 UI/UX Design & Implementation
- 🎵 Custom Music Player & Visualizer
- 🌤️ Weather & Geolocation Integration
- 📱 Responsive Design & Mobile Optimization
- 🧪 Testing & Quality Assurance

We worked collaboratively to create a seamless music experience that adapts to users' moods and environments. Our combined expertise in AI, API integration, and frontend development made Moodify possible.


## 📞 Contact

Have questions or suggestions? Reach out to the developer:

- 💬 Discord: `nitrajsinhsolanki`
- 💬 Discord: `rexon2.0`

- 🐦 X/Twitter: [@Nitrajsinh2005](https://twitter.com/Nitrajsinh2005)

---


## 📜 License

This project is open-source under the [MIT License](LICENSE).

---
