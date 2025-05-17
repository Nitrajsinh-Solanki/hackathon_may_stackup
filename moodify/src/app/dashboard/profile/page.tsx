// hackathon_may_stackup\moodify\src\app\dashboard\profile\page.tsx


'use client';
import { useState, useEffect } from 'react';
import { useUserData } from '@/app/hooks/useUserData';
import ProfileDashboard from '@/app/components/ProfileDashboard';
import UserDetails from '@/app/components/UserDetails';
import ChangePassword from '@/app/components/ChangePassword';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export default function ProfilePage() {
  const { userData, loading, error } = useUserData();
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // refreshing user data when switching to the details tab
  useEffect(() => {
    if (activeTab === 'details') {
      fetchUserProfile();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 rounded-lg text-center">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">My Profile</h1>
      
      <Tabs 
        defaultValue="dashboard" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="details">Account Details</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <ProfileDashboard userData={userData} />
        </TabsContent>
        
        <TabsContent value="details" className="mt-6">
          <UserDetails user={user} />
        </TabsContent>
        
        <TabsContent value="password" className="mt-6">
          <ChangePassword />
        </TabsContent>
      </Tabs>
    </div>
  );
}
