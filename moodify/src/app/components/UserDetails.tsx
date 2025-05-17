// hackathon_may_stackup\moodify\src\app\components\UserDetails.tsx


'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Save } from 'lucide-react';

export default function UserDetails({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState(user || null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  // updating local state when user prop changes
  useEffect(() => {
    if (user) {
      setUserData(user);
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // updating the local user data with the response
        setUserData(data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-6">Account Details</h2>
      {message.text && (
        <div 
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <User className="h-4 w-4 mr-2" />
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                minLength={3}
              />
            ) : (
              <div className="p-3 bg-gray-700/30 rounded-md text-white">{userData?.username || 'Not available'}</div>
            )}
          </div>
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Mail className="h-4 w-4 mr-2" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            ) : (
              <div className="p-3 bg-gray-700/30 rounded-md text-white">{userData?.email || 'Not available'}</div>
            )}
          </div>
          <div className="pt-4 flex justify-end">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setUsername(userData?.username || '');
                    setEmail(userData?.email || '');
                    setMessage({ type: '', text: '' });
                  }}
                  className="px-4 py-2 mr-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
