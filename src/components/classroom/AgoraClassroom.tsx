'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  AgoraRTCProvider,
  useRTCClient,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  usePublish,
  LocalVideoTrack,
  RemoteUser,
} from 'agora-rtc-react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useAgoraManualJoin } from '@/hooks/useAgoraManualJoin';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  LogOut, 
  Users,
  Maximize2,
  Settings,
  Search,
  Bell,
  Home,
  Headphones,
  FileText,
  Calendar,
  LayoutGrid,
  MoreVertical,
  Volume2,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Hand
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Set Agora log level to Warning to suppress non-critical internal traffic_stats errors
if (typeof window !== 'undefined') {
  AgoraRTC.setLogLevel(2);
}

interface AgoraClassroomProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  userName: string;
  teacherUid?: number;
  onLeave?: () => void;
}

export function AgoraClassroom(props: AgoraClassroomProps) {
  // Stable client instance for the lifetime of this component.
  // Do NOT manually call agoraClient.leave() here — useJoin inside
  // ClassroomInner is the sole owner of the join/leave lifecycle.
  // A competing leave() causes UID_CONFLICT on the next join attempt.
  const [agoraClient] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));

  return (
    <AgoraRTCProvider client={agoraClient}>
      <ClassroomInner {...props} />
    </AgoraRTCProvider>
  );
}

function ClassroomInner({
  appId,
  channelName,
  token,
  uid,
  userName,
  teacherUid,
  onLeave,
}: AgoraClassroomProps) {
  const [micOn, setMic] = useState(false);
  const [videoOn, setVideo] = useState(false);
  const [joined, setJoined] = useState(false);
  
  // Agora Hooks
  const { localMicrophoneTrack, error: micError } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack, error: camError } = useLocalCameraTrack(videoOn);
  const remoteUsers = useRemoteUsers();
  const client = useRTCClient();

  // Handle permission errors
  useEffect(() => {
    if (micError) {
      console.error('Microphone access failed:', micError);
      setMic(false);
    }
  }, [micError]);

  useEffect(() => {
    if (camError) {
      console.error('Camera access failed:', camError);
      setVideo(false);
    }
  }, [camError]);

  // --- MANUAL JOIN WITH UID_CONFLICT RECOVERY ---
  const { 
    isJoined, 
    isLoading: isJoinLoading, 
    error: joinError, 
    recovering, 
    manualJoin 
  } = useAgoraManualJoin({
    client,
    appId,
    channel: channelName,
    token: token || null,
    uid,
  });

  // Publish local tracks whenever they are ready
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Track if dual stream has been enabled to avoid redundant calls
  const dualStreamEnabledRef = useRef(false);

  // Enable Dual Stream Mode
  useEffect(() => {
    if (!client || dualStreamEnabledRef.current) return;
    
    const tryEnable = async () => {
      try {
        dualStreamEnabledRef.current = true;
        await client.enableDualStream();
      } catch (err: any) {
        const msg = err?.message || String(err);
        if (msg.includes('already enabled') || err?.code === 'DUAL_STREAM_ALREADY_ENABLED') {
          return;
        }
        dualStreamEnabledRef.current = false;
        console.error('Failed to enable dual stream:', err);
      }
    };

    tryEnable();
  }, [client]);

  const teacherUser = useMemo(() => {
    // If I am in the tutor range (1000-2000), I am the teacher
    if (uid >= 1000 && uid <= 2000) return 'local';
    // If I am a student, the teacher is any remote user in the 1000-2000 range
    return remoteUsers.find(u => Number(u.uid) >= 1000 && Number(u.uid) <= 2000);
  }, [remoteUsers, uid]);

  const studentUsers = useMemo(() => {
    // Student users are those outside the 1000-2000 range
    return remoteUsers.filter(u => Number(u.uid) < 1000 || Number(u.uid) > 2000);
  }, [remoteUsers]);

  // --- PRE-JOIN LOBBY ---
  if (!isJoined) {
    return (
      <LobbyScreen
        userName={userName}
        channelName={channelName}
        micOn={micOn}
        videoOn={videoOn}
        micError={micError}
        camError={camError}
        localCameraTrack={localCameraTrack}
        onToggleMic={() => setMic(m => !m)}
        onToggleVideo={() => setVideo(v => !v)}
        onJoin={manualJoin}
        onLeave={onLeave}
        isLoading={isJoinLoading}
        recovering={recovering}
        error={joinError}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#0A1A12] text-white overflow-hidden font-sans">
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-20 bg-[#07140D] flex flex-col items-center py-8 gap-10 border-r border-white/5 z-30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A7C957] to-[#6A994E] flex items-center justify-center shadow-lg shadow-[#A7C957]/20">
            <Sparkles className="w-6 h-6 text-[#0A1A12]" />
        </div>
        
        <nav className="flex flex-col gap-6">
          <SidebarIcon icon={Home} />
          <SidebarIcon icon={Headphones} active />
          <SidebarIcon icon={FileText} />
          <SidebarIcon icon={Users} />
          <SidebarIcon icon={Calendar} />
        </nav>

        <div className="mt-auto flex flex-col gap-6">
           <SidebarIcon icon={Bell} />
           <SidebarIcon icon={Settings} />
           <Avatar className="w-10 h-10 border-2 border-white/10">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
              <AvatarFallback>{userName[0]}</AvatarFallback>
           </Avatar>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="px-8 py-6 flex items-center justify-between z-20">
          <div>
            <h1 className="text-2xl font-bold text-white/90">Hello, {userName}!</h1>
            <p className="text-sm text-white/40">{channelName} | Live Now</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input 
                  placeholder="Search meetings..." 
                  className="bg-white/5 border-none rounded-full pl-11 py-5 text-sm focus-visible:ring-1 focus-visible:ring-white/20 transition-all placeholder:text-white/20"
                />
             </div>
             <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 w-10 h-10">
                <Bell className="w-5 h-5 text-white/60" />
             </Button>
          </div>
        </header>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: Video & Insights */}
            <div className="flex-1 flex flex-col gap-8">
              
              {/* MAIN STAGE (Teacher / Presenter) */}
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/5 shadow-2xl group group/stage">
                {teacherUser === 'local' ? (
                  // Local tutor's video — fills the entire stage
                  <div className="absolute inset-0 scale-105 transition-transform duration-700 group-hover/stage:scale-110">
                    <LocalVideoTrack
                      track={localCameraTrack}
                      play
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                ) : teacherUser ? (
                  // Remote tutor's video — fills the entire stage
                  <div className="absolute inset-0 scale-105 transition-transform duration-700 group-hover/stage:scale-110">
                    <RemoteUser
                      user={teacherUser}
                      playVideo
                      playAudio
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <VideoOff className="w-10 h-10 text-white/10" />
                    </div>
                    <p className="text-white/20 font-medium tracking-wide uppercase text-xs">Waiting for host...</p>
                  </div>
                )}

                {/* Stage Overlays */}
                <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
                </div>

                <div className="absolute top-6 right-6">
                   <Button variant="ghost" size="icon" className="bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-xl w-10 h-10 border border-white/10">
                      <Maximize2 className="w-5 h-5 text-white/80" />
                   </Button>
                </div>

                {/* Floating Volume Indicator */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 py-6 px-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <div className="h-24 w-1.5 bg-white/10 rounded-full relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-[#A7C957] to-[#F2E8CF] rounded-full shadow-[0_0_8px_rgba(167,201,87,0.5)]" />
                    </div>
                    <Volume2 className="w-4 h-4 text-white/60" />
                </div>

                {/* MAIN CONTROLS */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-black/60 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl transition-transform hover:scale-105 duration-300">
                    <ControlButton 
                      active={micOn} 
                      isError={!!micError}
                      icon={micOn ? Mic : MicOff} 
                      onClick={() => setMic(!micOn)} 
                    />
                    <ControlButton 
                      active={videoOn} 
                      isError={!!camError}
                      icon={videoOn ? VideoIcon : VideoOff} 
                      onClick={() => setVideo(!videoOn)} 
                    />
                    <ControlButton icon={LayoutGrid} />
                    <ControlButton icon={Hand} />
                    <Button 
                      variant="destructive" 
                      className="w-14 h-14 rounded-2xl bg-red-500/80 hover:bg-red-600 transition-all flex items-center justify-center border border-white/10"
                      onClick={onLeave}
                    >
                      <LogOut className="w-6 h-6" />
                    </Button>
                </div>
              </div>

              {/* PARTICIPANT GRID */}
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                 {/* Local Mini View */}
                 {uid !== teacherUid && (
                    <div className="w-44 shrink-0 aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group cursor-pointer">
                      {videoOn && localCameraTrack ? (
                        <div className="absolute inset-0 transition-transform group-hover:scale-110">
                          <LocalVideoTrack
                            track={localCameraTrack}
                            play
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                          <VideoOff className="w-7 h-7 text-white/20 mb-1" />
                          <span className="text-[9px] text-white/20 uppercase tracking-widest">Camera off</span>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                        <div className={cn("w-1.5 h-1.5 rounded-full", micOn ? "bg-green-500" : "bg-white/20")} />
                        <span className="text-[10px] font-medium tracking-tight">You</span>
                      </div>
                    </div>
                 )}

                 {/* Remote Participants */}
                 {studentUsers.map(user => (
                   <div key={user.uid} className="w-44 shrink-0 aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group cursor-pointer">
                     <div className="absolute inset-0 transition-transform group-hover:scale-110">
                       <RemoteUser user={user} playVideo playAudio style={{ width: '100%', height: '100%' }} />
                     </div>
                     <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#A7C957] animate-pulse" />
                          <span className="text-[10px] font-medium tracking-tight">User {user.uid}</span>
                     </div>
                   </div>
                 ))}

                 {/* Mock Participants */}
                 <MockParticipant name="Ethan C." img="1" status="muted" />
                 <MockParticipant name="Andy T." img="2" status="active" />
                 <MockParticipant name="Jordan K." img="3" status="muted" />
                 <MockParticipant name="Marta E." img="4" status="talking" />
              </div>

              {/* MEETING INSIGHTS */}
              <div className="flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white/80">Meeting Insights</h2>
                    <Button variant="link" className="text-[#A7C957] text-sm font-medium p-0 h-auto">View all</Button>
                 </div>
                 
                 <div className="flex flex-col gap-4">
                    <InsightCard 
                      title="PM & Designers Sync Meeting" 
                      time="30 min" 
                      tasks={5} 
                      accomplished="8/9" 
                      progress={85}
                      icon={Users}
                    />
                    <InsightCard 
                      title="Strategic Planning Meeting" 
                      time="1h" 
                      tasks={8} 
                      accomplished="4/10" 
                      progress={40}
                      icon={LayoutGrid}
                    />
                 </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Chat */}
            <div className="w-full lg:w-[400px] flex flex-col gap-6">
              
              {/* Chat Panel */}
              <div className="flex-1 flex flex-col bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-md">
                 <div className="p-8 pb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white/80">Chat Room</h2>
                    <Button variant="link" className="text-[#A7C957] text-xs font-medium p-0 h-auto">View all</Button>
                 </div>

                 <div className="flex-1 overflow-y-auto px-8 py-4 flex flex-col gap-6 custom-scrollbar">
                    <ChatMessage 
                      user="Jonathan Milton" 
                      time="2:30 pm" 
                      msg="Does anyone have the updated presentation? @ai_assistant" 
                    />
                    <ChatMessage 
                      user="You" 
                      time="2:31 pm" 
                      msg="I'll share it shortly. 👍" 
                      isMe
                    />
                    <ChatMessage 
                      user="AI Assistant" 
                      time="2:31 pm" 
                      msg="📄 Q1 Strategy.pptx" 
                      isAI
                    />
                    <ChatMessage 
                      user="Jonathan Milton" 
                      time="2:33 pm" 
                      msg="Thanks! Let's review slide 5 together." 
                    />
                    <ChatMessage 
                      user="You" 
                      time="2:34 pm" 
                      msg="We need to update the sales figures." 
                      isMe
                    />
                    <ChatMessage 
                      user="Marta E." 
                      time="2:34 pm" 
                      msg="Agreed. I'll provide the updated data by tomorrow." 
                    />
                 </div>

                 <div className="p-8 pt-4">
                    <div className="relative">
                       <Input 
                         placeholder="Type your message..." 
                         className="bg-white/5 border-none rounded-2xl py-7 pl-6 pr-14 text-sm focus-visible:ring-1 focus-visible:ring-white/20 transition-all placeholder:text-white/10"
                       />
                       <Button size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#A7C957] hover:bg-[#6A994E] rounded-xl w-10 h-10 transition-transform active:scale-95">
                          <Send className="w-4 h-4 text-[#0A1A12]" />
                       </Button>
                    </div>
                 </div>
              </div>

              {/* Upgrade Banner */}
              <div className="bg-gradient-to-br from-[#1B3E2D] to-[#0A1A12] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#A7C957]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#A7C957]/20 transition-colors" />
                  <h3 className="text-2xl font-serif italic mb-2">Upgrade <span className="text-[#A7C957] font-sans not-italic font-bold">to Pro</span></h3>
                  <p className="text-xs text-white/40 mb-6 leading-relaxed">Unlock the full potential of AI Assistant!</p>
                  <Button className="bg-[#D9ED92] hover:bg-[#B5E48C] text-[#0A1A12] font-bold rounded-full px-8 py-6 text-sm transition-all hover:scale-105 active:scale-95">
                     Explore Pro Plan
                  </Button>
                  
                  <div className="absolute right-8 bottom-8 w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-inner group-hover:rotate-12 transition-transform">
                      <div className="w-10 h-10 bg-red-500/80 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                  </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function LobbyScreen({
  userName,
  channelName,
  micOn,
  videoOn,
  micError,
  camError,
  localCameraTrack,
  onToggleMic,
  onToggleVideo,
  onJoin,
  onLeave,
}: {
  userName: string;
  channelName: string;
  micOn: boolean;
  videoOn: boolean;
  micError: any;
  camError: any;
  localCameraTrack: any;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onJoin: () => void;
  onLeave?: () => void;
  isLoading?: boolean;
  recovering?: boolean;
  error?: string | null;
}) {
  return (
    <div className="flex h-screen bg-[#0A1A12] text-white items-center justify-center relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#A7C957]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#6A994E]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl mx-auto px-6 flex flex-col items-center">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A7C957] to-[#6A994E] flex items-center justify-center mb-6 shadow-lg shadow-[#A7C957]/20">
          <Sparkles className="w-7 h-7 text-[#0A1A12]" />
        </div>

        <h1 className="text-3xl font-bold mb-1 text-center">Ready to join?</h1>
        <p className="text-white/40 text-sm mb-8 text-center">
          <span className="text-[#A7C957] font-semibold">{channelName}</span> · Hello, {userName}
        </p>

        {/* Camera preview */}
        <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden bg-black/40 border border-white/10 mb-6 shadow-2xl">
          {videoOn && localCameraTrack ? (
            <div className="absolute inset-0">
              <LocalVideoTrack
                track={localCameraTrack}
                play
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <VideoOff className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/30 text-sm">
                {camError ? 'Camera access denied' : 'Camera is off'}
              </p>
              {camError && (
                <p className="text-red-400/60 text-xs mt-1">Check your browser permissions</p>
              )}
            </div>
          )}

          {/* Name badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
            <div className={cn('w-2 h-2 rounded-full', micOn ? 'bg-[#A7C957] animate-pulse' : 'bg-white/20')} />
            <span className="text-xs font-medium">{userName}</span>
          </div>

          {/* Error & Recovery badges */}
          {(micError || camError || error) && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {(micError || camError) && (
                <div className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 backdrop-blur-md rounded-full">
                  <span className="text-[10px] text-red-400 font-medium uppercase tracking-wide">Permission needed</span>
                </div>
              )}
              {error && (
                <div className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 backdrop-blur-md rounded-full">
                  <span className="text-[10px] text-red-400 font-medium uppercase tracking-wide">{error}</span>
                </div>
              )}
            </div>
          )}

          {recovering && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <div className="w-12 h-12 border-4 border-[#A7C957] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#A7C957] font-bold text-lg animate-pulse">Recovering Connection...</p>
              <p className="text-white/40 text-xs mt-2">Resolving UID conflict, please wait</p>
            </div>
          )}
        </div>

        {/* Mic + Camera toggles */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onToggleMic}
            className={cn(
              'flex flex-col items-center gap-2 w-24 py-4 rounded-2xl border transition-all',
              micOn
                ? 'bg-[#A7C957]/10 border-[#A7C957]/30 text-[#A7C957]'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10',
              micError && 'border-red-500/30 text-red-400'
            )}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              {micError ? 'Denied' : micOn ? 'Mic On' : 'Mic Off'}
            </span>
          </button>

          <button
            onClick={onToggleVideo}
            className={cn(
              'flex flex-col items-center gap-2 w-24 py-4 rounded-2xl border transition-all',
              videoOn
                ? 'bg-[#A7C957]/10 border-[#A7C957]/30 text-[#A7C957]'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10',
              camError && 'border-red-500/30 text-red-400'
            )}
          >
            {videoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              {camError ? 'Denied' : videoOn ? 'Cam On' : 'Cam Off'}
            </span>
          </button>
        </div>

        {/* Join button */}
        <button
          onClick={onJoin}
          disabled={isLoading || recovering}
          className={cn(
            "w-full py-5 bg-gradient-to-r from-[#A7C957] to-[#6A994E] hover:from-[#B5E48C] hover:to-[#A7C957] text-[#0A1A12] font-bold rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#A7C957]/20 mb-4 flex items-center justify-center gap-3",
            (isLoading || recovering) && "opacity-50 cursor-not-allowed scale-100"
          )}
        >
          {(isLoading || recovering) && <div className="w-5 h-5 border-2 border-[#0A1A12] border-t-transparent rounded-full animate-spin" />}
          {recovering ? 'Recovering...' : isLoading ? 'Joining...' : 'Join Class'}
        </button>

        {/* Leave link */}
        {onLeave && (
          <button
            onClick={onLeave}
            className="text-white/30 hover:text-white/60 text-sm transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Leave
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarIcon({ icon: Icon, active = false }: { icon: any, active?: boolean }) {
  return (
    <div className={cn(
      "w-12 h-12 flex items-center justify-center rounded-2xl transition-all cursor-pointer group",
      active ? "bg-[#A7C957] text-[#0A1A12] shadow-lg shadow-[#A7C957]/20" : "text-white/30 hover:text-white/60 hover:bg-white/5"
    )}>
      <Icon className={cn("w-6 h-6", !active && "group-hover:scale-110 transition-transform")} />
    </div>
  );
}

function ControlButton({ 
  icon: Icon, 
  active = false, 
  isError = false,
  onClick 
}: { 
  icon: any, 
  active?: boolean, 
  isError?: boolean,
  onClick?: () => void 
}) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onClick}
      className={cn(
        "w-14 h-14 rounded-2xl transition-all border border-white/10 backdrop-blur-md",
        active ? "bg-white/10 text-white" : "bg-black/20 text-white/40 hover:bg-white/5 hover:text-white",
        isError && "border-red-500/50 text-red-500 hover:text-red-400"
      )}
    >
      <Icon className="w-6 h-6" />
    </Button>
  );
}

function MockParticipant({ name, img, status }: { name: string, img: string, status: 'muted' | 'active' | 'talking' }) {
  return (
    <div className="w-44 shrink-0 aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/5 bg-white/5 relative group cursor-pointer transition-all hover:border-[#A7C957]/30">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=p${img}`} className="w-full h-full object-cover transition-transform group-hover:scale-110 opacity-60" alt={name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {status === 'talking' && (
           <div className="absolute top-3 right-3 w-6 h-6 bg-[#A7C957] rounded-full flex items-center justify-center shadow-lg shadow-[#A7C957]/20">
              <Mic className="w-3.5 h-3.5 text-[#0A1A12]" />
           </div>
        )}

        <div className="absolute bottom-4 left-4 flex items-center gap-3">
           <Avatar className="w-8 h-8 border border-white/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=p${img}`} />
           </Avatar>
           <span className="text-xs font-bold tracking-tight text-white/90">{name}</span>
        </div>
    </div>
  );
}

function InsightCard({ title, time, tasks, accomplished, progress, icon: Icon }: any) {
  return (
    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/[0.07] transition-all group cursor-pointer">
       <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#A7C957] group-hover:text-[#0A1A12] transition-colors">
             <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
             <h4 className="font-bold text-white/90 mb-1">{title}</h4>
             <div className="flex items-center gap-4 text-xs text-white/30">
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {time}</span>
             </div>
          </div>
          <div className="flex-1 hidden md:block">
              <p className="text-[10px] uppercase tracking-widest text-white/20 mb-2">Follow-Up Tasks <span className="text-white/60 ml-2">{tasks}</span></p>
              <div className="flex items-center gap-4">
                  <p className="text-[10px] uppercase tracking-widest text-white/20">Accomplished <span className="text-white/60 ml-2">{accomplished}</span></p>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#A7C957] to-[#D9ED92]" style={{ width: `${progress}%` }} />
                  </div>
              </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
             <MoreVertical className="w-5 h-5 text-white/20" />
          </Button>
       </div>
    </div>
  );
}

function ChatMessage({ user, time, msg, isMe = false, isAI = false }: any) {
  return (
    <div className={cn("flex flex-col gap-2", isMe && "items-end")}>
       <div className={cn("flex items-center gap-3", isMe && "flex-row-reverse")}>
          <Avatar className="w-8 h-8 border border-white/10">
             <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} />
             <AvatarFallback>{user[0]}</AvatarFallback>
          </Avatar>
          <div className={cn("flex items-center gap-2", isMe && "flex-row-reverse")}>
             <span className="text-xs font-bold text-white/60">{user}</span>
             <span className="text-[10px] text-white/20">{time}</span>
          </div>
       </div>
       <div className={cn(
         "px-5 py-3 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-sm",
         isMe ? "bg-[#A7C957] text-[#0A1A12] rounded-tr-none" : 
         isAI ? "bg-[#1B3E2D] text-[#A7C957] border border-[#A7C957]/20 italic rounded-tl-none" : 
         "bg-white/10 text-white/80 rounded-tl-none"
       )}>
          {msg}
       </div>
    </div>
  );
}
