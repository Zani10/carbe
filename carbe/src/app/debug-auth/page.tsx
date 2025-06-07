'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function DebugAuthPage() {
  const { user, profile } = useAuth();
  const [apiResponse, setApiResponse] = useState<{status: number | string; data: unknown} | null>(null);
  const [loading, setLoading] = useState(false);

  const testEarningsAPI = async () => {
    setLoading(true);
    try {
      console.log('Browser cookies:', document.cookie);
      const response = await fetch('/api/host/earnings', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      setApiResponse({
        status: response.status,
        data
      });
    } catch (error) {
      setApiResponse({
        status: 'error',
        data: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Authentication Debug</h1>
        
        <div className="bg-[#2A2A2A] p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Auth Status</h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              User: {user ? `✅ ${user.email}` : '❌ No user'}
            </p>
            <p className="text-gray-300">
              Profile: {profile ? `✅ ${profile.full_name || 'No name'}` : '❌ No profile'}
            </p>
            <p className="text-gray-300">
              User ID: {user?.id || 'None'}
            </p>
          </div>
        </div>

        <div className="bg-[#2A2A2A] p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">API Test</h2>
          <button
            onClick={testEarningsAPI}
            disabled={loading}
            className="bg-[#FF4646] text-white px-4 py-2 rounded-lg hover:bg-[#FF4646]/90 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Earnings API'}
          </button>
          
          {apiResponse && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-white font-medium mb-2">API Response:</h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-[#2A2A2A] p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Browser Cookies</h2>
          <p className="text-gray-300 text-sm">
            Check browser dev tools → Application → Cookies for Supabase tokens
          </p>
        </div>
      </div>
    </div>
  );
} 