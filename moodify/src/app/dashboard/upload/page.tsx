
// moodify\src\app\dashboard\upload\page.tsx

'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Music, AlertCircle } from 'lucide-react';
import { genres, moods } from '@/lib/audius-api';

interface UploadedTrack {
  title: string;
  artist?: string;
  cloudinaryUrl: string;
  coverImage?: string;
  duration: number;
  genre?: string;
  mood?: string;
  uploadedAt: Date;
}

export default function UploadMusic() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedTrack, setUploadedTrack] = useState<UploadedTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    mood: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // check if file is audio
    if (!selectedFile.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Try to extract title from filename
    const fileName = selectedFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
    setFormData(prev => ({
      ...prev,
      title: fileName,
    }));

    // simulate progress for better UX
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 95) {
        clearInterval(interval);
      } else {
        setUploadProgress(progress);
      }
    }, 300);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('artist', formData.artist);
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('mood', formData.mood);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload track');
      }

      const data = await response.json();
      setUploadedTrack(data.track);
      setUploadProgress(100);

      // reset form after successful upload
      setFile(null);
      setFormData({
        title: '',
        artist: '',
        genre: '',
        mood: '',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload track');
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const goToMyMusic = () => {
    router.push('/dashboard/my-music', { scroll: false });
  };

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold text-white mb-6">Upload Your Music</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="text-red-400 mr-2 mt-0.5" size={18} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">Upload Track</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Audio File
              </label>
              <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex flex-col items-center">
                    <Music className="h-12 w-12 text-purple-400 mb-2" />
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-300">Drag and drop your audio file here or click to browse</p>
                    <p className="text-gray-500 text-sm mt-2">Supports MP3, WAV, FLAC (max 50MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Track Details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-gray-300 text-sm font-medium mb-2">
                  Track Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter track title"
                />
              </div>

              <div>
                <label htmlFor="artist" className="block text-gray-300 text-sm font-medium mb-2">
                  Artist Name
                </label>
                <input
                  type="text"
                  id="artist"
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter artist name"
                />
              </div>

              <div>
                <label htmlFor="genre" className="block text-gray-300 text-sm font-medium mb-2">
                  Genre
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a genre</option>
                  {genres.slice(1).map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mood" className="block text-gray-300 text-sm font-medium mb-2">
                  Mood
                </label>
                <select
                  id="mood"
                  name="mood"
                  value={formData.mood}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a mood</option>
                  {moods.slice(1).map((mood) => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading || !file}
              className={`w-full py-2 px-4 rounded-md font-medium flex items-center justify-center ${
                isUploading || !file
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              } transition-colors`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Uploading...
                </>
              ) : (
                'Upload Track'
              )}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">Track Preview</h2>

          {isUploading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
                <div
                  className="bg-purple-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-300">Uploading... {uploadProgress}%</p>
            </div>
          ) : uploadedTrack ? (
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-purple-900 rounded-md flex items-center justify-center">
                    {uploadedTrack.coverImage ? (
                      <img
                        src={uploadedTrack.coverImage}
                        alt={uploadedTrack.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <Music className="h-8 w-8 text-purple-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{uploadedTrack.title}</h3>
                    <p className="text-gray-400">{uploadedTrack.artist}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span>{formatDuration(uploadedTrack.duration)}</span>
                      {uploadedTrack.genre && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{uploadedTrack.genre}</span>
                        </>
                      )}
                      {uploadedTrack.mood && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{uploadedTrack.mood}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <audio
                    src={uploadedTrack.cloudinaryUrl}
                    controls
                    className="w-full"
                  ></audio>
                </div>
              </div>

              <div className="text-center">
                <p className="text-green-400 mb-2">Upload successful!</p>
                <button
                  onClick={goToMyMusic}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  Go to My Music
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Music className="h-16 w-16 mb-4 opacity-30" />
              <p>Upload a track to see preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
