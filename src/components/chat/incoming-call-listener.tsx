'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PhoneCall, PhoneMissed, Video } from 'lucide-react';

// A tiny, soft synthetic ringtone as a base64 string
const RINGTONE_B64 = 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
// Note: Since a full real ringtone MP3 is too large to safely inline, we use a simple empty stub or browser beeps. 
// However, the best approach is to let the browser play a simple local audio file if you drop one in `public/ringtone.mp3`.
// For the sake of this feature, I will assume we have `/ringtone.mp3`. If it 404s, it fails silently but the UI still shows.

export function IncomingCallListener() {
  const { profile } = useUser();
  const supabase = createClient();
  const router = useRouter();
  
  const [incomingCall, setIncomingCall] = useState<{
    tutorId: string;
    tutorName: string;
    channelName: string;
    avatarUrl?: string;
  } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const playRing = () => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Create a nice ringing sequence
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1); // C#5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  };

  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase.channel(`calls:${profile.id}`)
      .on('broadcast', { event: 'incoming-call' }, ({ payload }) => {
        console.log('Incoming call received:', payload);
        setIncomingCall(payload as any);
        
        // Start ringing loop
        playRing();
        if (!ringIntervalRef.current) {
          ringIntervalRef.current = setInterval(playRing, 2000);
        }
      })
      .on('broadcast', { event: 'cancel-call' }, () => {
        setIncomingCall(null);
        if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
        ringIntervalRef.current = null;
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    };
  }, [profile?.id, supabase]);

  const handleJoin = () => {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    ringIntervalRef.current = null;
    const callData = incomingCall;
    setIncomingCall(null);
    if (callData) {
      // Redirect to the chat page with the call parameter
      router.push(`/student/chat?partner=${callData.tutorId}&call=${callData.channelName}`);
    }
  };

  const handleDecline = () => {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    ringIntervalRef.current = null;
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#07120C] border border-border p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 text-center">
        
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#D9ED92] rounded-full animate-ping opacity-20"></div>
          <img 
            src={incomingCall.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingCall.tutorName}`} 
            alt={incomingCall.tutorName}
            className="w-24 h-24 rounded-full border-4 border-[#07120C] shadow-xl relative z-10 bg-muted"
          />
        </div>
        
        <h2 className="text-2xl font-bold font-serif text-white mb-2">{incomingCall.tutorName}</h2>
        <p className="text-white/70 mb-8 flex items-center justify-center gap-2">
          <Video className="w-4 h-4" /> Incoming Virtual Class...
        </p>
        
        <div className="flex gap-4 w-full">
          <Button 
            onClick={handleDecline}
            variant="outline" 
            className="flex-1 rounded-full h-12 bg-white/5 border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all text-white"
          >
            <PhoneMissed className="w-5 h-5 mr-2" />
            Decline
          </Button>
          <Button 
            onClick={handleJoin}
            className="flex-1 rounded-full h-12 bg-[#D9ED92] hover:bg-[#E8C85E] text-[#0B0C10] transition-all font-semibold shadow-lg shadow-[#D9ED92]/20"
          >
            <PhoneCall className="w-5 h-5 mr-2 animate-pulse" />
            Join Class
          </Button>
        </div>
      </div>
    </div>
  );
}
