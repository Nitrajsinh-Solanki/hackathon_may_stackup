
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
  Get it from [MongoDB Atlas](https://account.mongodb.com/account/login) after setting up a free cluster.
  📽️ [Video tutorial](https://youtu.be/SMXbGrKe5gM?feature=shared)

* 📧 **Email credentials for Nodemailer**:
  If you're using Gmail, enable 2FA and generate an App Password instead of using your real password.
  📽️ [How to generate a Gmail App Password](https://youtu.be/FT-AiOcw-50?feature=shared)

* 🔐 **JWT Secret**:
  Generate a secure token using this free tool:
  [JWT Generator](https://www.javainuse.com/jwtgenerator)

* ☁️ **Cloudinary credentials**:
  Create an account and get your API keys from your [Cloudinary dashboard](https://cloudinary.com/users/login)

* 🎶 **Jamendo API Key**:
  Sign up as a developer and create an app at [Jamendo Developer Portal](https://devportal.jamendo.com/login)

* 🌦️ **OpenWeather API Key**:
  Register and create a key at [OpenWeather](https://home.openweathermap.org/users/sign_in)

* 🤖 **Gemini API Key**:
  Access and generate your API key from [Google Gemini](https://aistudio.google.com/app/apikey)
---

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.


---

## 🧩 Project Structure

For a complete and detailed breakdown of the Moodify project structure, please refer to the following Medium article:

🔗 [Moodify: AI-Powered Music Experience – Full Project Structure](https://medium.com/@nrsolanki2005/moodify-ai-powered-music-experience-3eb356849948)

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).

---
