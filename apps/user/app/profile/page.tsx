'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Loader2, LogOut } from 'lucide-react';
import { Card } from '@repo/ui/card';
import { signOut } from 'next-auth/react';

interface ProfileData {
  username: string;
  email: string;
  phone: string;
}

const ProfilePage = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/personalData');
        const result = await response.json();
        
        if (result.success) {
          setProfileData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      localStorage.clear();
      await signOut({ redirect: false });
      router.push('/auth/login');
    } catch (error) {
      setError('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 
        flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 
        flex items-center justify-center">
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <p className="text-red-500">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute w-40 h-40 bg-blue-200/30 rounded-full 
          animate-moreAround left-1/4 top-1/4" 
        />
        
        <div className="absolute w-32 h-32 bg-purple-200/30 rounded-full 
          animate-moveAround right-1/3 top-1/3" 
        />
        
        <div className="absolute w-36 h-36 bg-teal-200/30 rounded-lg rotate-45 
          animate-moveAndSpin left-1/3 bottom-1/4" 
        />
        
        <div className="absolute w-24 h-24 bg-pink-200/30 rounded-lg rotate-12 
          animate-[moveAndSpin_18s_linear_infinite] right-1/4 bottom-1/3" 
        />
        
        <div className="absolute w-20 h-20 bg-indigo-200/30 rounded-full 
          animate-moveAround left-1/2 top-1/2" 
        />
        
        <div className="absolute w-16 h-16 bg-amber-200/30 rounded-lg rotate-90 
          animate-moveAndSpin right-1/2 bottom-1/2" />
      </div>

      {/* Profile Content */}
      <div className="relative z-10 h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card className="backdrop-blur-none p-6">
            {/* User Info Cards */}
            <div className="space-y-4">
              <div className="rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{profileData?.username.toUpperCase() || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profileData?.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{profileData?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Updated Sign Out Button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className=" mt-6 py-3 px-7 backdrop-blur-sm 
                  text-customText rounded-lg flex items-center justify-center space-x-2 
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    <span className="text-blue-500">Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5 text-customText" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;