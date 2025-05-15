// hackathon_may_stackup\moodify\src\app\components\CreatePlaylistForm.tsx


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music, Upload, X } from "lucide-react";
import Image from "next/image";

export default function CreatePlaylistForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Playlist name is required");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      
      const response = await fetch("/api/playlists/create", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create playlist");
      }
      
      setName("");
      setDescription("");
      setCoverImage(null);
      setCoverImagePreview(null);
      
      if (onSuccess) {
        onSuccess();
      }
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-lg p-8">
      <div className="max-w-md mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex justify-center">
            {coverImagePreview ? (
              <div className="relative w-40 h-40 mb-4">
                <Image 
                  src={coverImagePreview} 
                  alt="Playlist cover" 
                  fill 
                  className="object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-gray-900 rounded-full p-1 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-40 h-40 bg-gray-700 border-2 border-dashed border-gray-500 rounded-md cursor-pointer hover:bg-gray-600 transition-colors mb-4">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Music size={40} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-400">Upload cover image</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="playlist-name" className="block text-sm font-medium text-gray-300 mb-2">
            Playlist Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="playlist-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter playlist name"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="playlist-description" className="block text-sm font-medium text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            id="playlist-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter playlist description"
          ></textarea>
        </div>
        
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            "Create Playlist"
          )}
        </button>
      </div>
    </form>
  );
}
