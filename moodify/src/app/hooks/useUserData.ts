// hackathon_may_stackup\moodify\src\app\hooks\useUserData.ts



import { useState, useEffect } from 'react';
import { IUser } from '@/models/User';

export function useUserData() {
  const [userData, setUserData] = useState<Partial<IUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        const response = await fetch('/api/user/data');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, []);

  return { userData, loading, error };
}
