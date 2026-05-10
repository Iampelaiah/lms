'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const AgoraClassroom = dynamic(
  () => import('@/components/classroom/AgoraClassroom').then((mod) => mod.AgoraClassroom),
  { ssr: false }
);

function ClassroomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;
  const role = searchParams.get('role') || 'participant';
  const userName = searchParams.get('name') || 'Guest';
  
  const [agoraData, setAgoraData] = useState<{ token: string; appId: string; uid: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        // Tutors: 1000-2000, Students: 2001-65535.
        // Wider ranges prevent UID_CONFLICT on refreshes.
        const uid = role === 'tutor' 
          ? Math.floor(Math.random() * 1000) + 1000 
          : Math.floor(Math.random() * 60000) + 2001;
        const response = await fetch('/api/agora', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelName: meetingId,
            uid,
            role: role === 'tutor' ? 'publisher' : 'subscriber'
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to get Agora token');
        
        setAgoraData({ ...data, uid });
      } catch (err) {
        console.error('Error fetching Agora token:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    fetchToken();
  }, [meetingId, role]);

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#051C1C] text-white p-6">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connection Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!agoraData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#051C1C] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#00FFCC]" />
        <p className="mt-4 text-white/50 animate-pulse">Securing connection...</p>
      </div>
    );
  }

  return (
    <AgoraClassroom
      appId={agoraData.appId}
      channelName={meetingId}
      token={agoraData.token}
      uid={agoraData.uid}
      userName={userName}
      onLeave={() => router.push('/')}
    />
  );
}

export default function ClassroomPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#051C1C] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#00FFCC]" />
      </div>
    }>
      <ClassroomContent />
    </Suspense>
  );
}
