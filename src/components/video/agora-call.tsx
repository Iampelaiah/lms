'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { generateAgoraToken } from '@/app/actions/agora';
import { Loader2 } from 'lucide-react';

// Dynamically import AgoraUIKit to avoid SSR issues
const AgoraUIKit = dynamic(() => import('agora-react-uikit'), { ssr: false });

export default function AgoraCall({ 
  channelName, 
  onEndCall 
}: { 
  channelName: string;
  onEndCall: () => void;
}) {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const [token, setToken] = useState<string | null>(null);
  const [rtmToken, setRtmToken] = useState<string | null>(null);
  const [rtmUid, setRtmUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      if (!appId) {
        setLoading(false);
        return;
      }
      try {
        const res = await generateAgoraToken(channelName);
        if (res.error) {
          setError(res.error);
        } else if (res.token) {
          setToken(res.token);
          setRtmToken(res.rtmToken || null);
          setRtmUid(res.rtmUid || null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch token');
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, [channelName, appId]);

  if (!appId) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white p-8">
        <h2 className="text-xl font-bold mb-4">Missing Agora App ID</h2>
        <p className="text-center text-white/70 max-w-md">
          Please add <code className="bg-white/20 px-2 py-1 rounded">NEXT_PUBLIC_AGORA_APP_ID</code> to your <code className="bg-white/20 px-2 py-1 rounded">.env.local</code> file and restart the server.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
        <p>Connecting to virtual class...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white p-8">
        <h2 className="text-xl font-bold mb-4 text-burgundy">Connection Error</h2>
        <p className="text-center text-white/70 mb-4">{error}</p>
        <button 
          onClick={onEndCall}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-black relative">
      <AgoraUIKit
        rtcProps={{
          appId,
          channel: channelName,
          token: token,
          role: 'host',
          layout: 0, // 0 is pinned layout (PIP)
        }}
        rtmProps={{
          token: rtmToken || undefined,
          uid: rtmUid || undefined,
          displayUsername: true,
        }}
        styleProps={{
          UIKitContainer: { backgroundColor: '#07120C', borderRadius: '1.5rem', overflow: 'hidden', position: 'relative' },
          maxViewStyles: { borderRadius: '1.5rem' },
          minViewContainer: { 
            position: 'absolute', 
            bottom: '24px', 
            left: '24px', 
            width: '180px', 
            height: '120px', 
            borderRadius: '1rem', 
            overflow: 'hidden', 
            border: '2px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            zIndex: 10
          },
          minViewStyles: { borderRadius: '1rem' },
          localBtnContainer: { 
            position: 'absolute', 
            bottom: '24px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            backgroundColor: 'rgba(0,0,0,0.6)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '9999px',
            padding: '8px 16px',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          },
          BtnTemplateStyles: { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', width: '40px', height: '40px' },
        }}
        callbacks={{
          EndCall: () => onEndCall(),
        }}
      />
    </div>
  );
}
