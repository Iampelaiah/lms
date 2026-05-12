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
import { useChat } from '@/hooks/use-chat';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  LogOut, 
  Users,
  Maximize2,
  Minimize2,
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
  Hand,
  Monitor,
  MonitorOff,
  Presentation,
  AlertTriangle
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/components/providers/user-context';

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

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
  role?: string;
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
  role,
  teacherUid,
  onLeave,
}: AgoraClassroomProps) {
  const [micOn, setMic] = useState(false);
  const [videoOn, setVideo] = useState(false);
  const { profile, loading: loadingProfile } = useUser();
  const { messages, sendMessage } = useChat(channelName);
  const [msgInput, setMsgInput] = useState('');
  const [spotlightedUid, setSpotlightedUid] = useState<number | null>(null);
  const [screenTrack, setScreenTrack] = useState<any>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  // UID of the remote participant currently sharing screen
  const [remoteScreenUid, setRemoteScreenUid] = useState<number | null>(null);
  const [classData, setClassData] = useState<any>(null);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  // Map of uid -> { name, role } for showing real names on tiles
  const [participantMap, setParticipantMap] = useState<Record<number, { name: string; role: string }>>({});
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Determine if the CURRENT user is the tutor/host using ALL available signals
  const iAmTutor = useMemo(() => {
    const fromProp = role === 'tutor';
    const fromProfile = profile?.role === 'tutor';
    const fromUid = uid >= 1000 && uid <= 2000;
    return fromProp || fromProfile || fromUid;
  }, [role, profile?.role, uid]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Agora Hooks — explicit encoder config for low latency
  const { localMicrophoneTrack, error: micError } = useLocalMicrophoneTrack(micOn, {
    AEC: true, ANS: true, AGC: true,
  });
  const { localCameraTrack, error: camError } = useLocalCameraTrack(videoOn, {
    encoderConfig: { width: 640, height: 360, frameRate: 24, bitrateMin: 200, bitrateMax: 600 },
    optimizationMode: 'motion',
  });
  const remoteUsers = useRemoteUsers();
  const client = useRTCClient();

  // Handle permission errors
  useEffect(() => { if (micError) { console.error('Mic:', micError); setMic(false); } }, [micError]);
  useEffect(() => { if (camError) { console.error('Cam:', camError); setVideo(false); } }, [camError]);

  // --- MANUAL JOIN WITH UID_CONFLICT RECOVERY ---
  const { isJoined, isLoading: isJoinLoading, error: joinError, recovering, manualJoin } = useAgoraManualJoin({
    client, appId, channel: channelName, token: token || null, uid,
  });

  // Fetch Class Data
  useEffect(() => {
    if (!channelName) return;
    supabase.from('classes').select('*').eq('id', channelName).single()
      .then(({ data }) => { if (data) setClassData(data); });
  }, [channelName, supabase]);

  // ─── SINGLE unified Supabase broadcast channel ─────────────────────────────
  // All real-time events (class end, spotlight, screen share, hand raise,
  // participant identity) go through one channel to minimise WS connections.
  useEffect(() => {
    if (!channelName) return;
    const ch = supabase.channel(`classroom:${channelName}`, {
      config: { broadcast: { self: false } },
    })
      // Class ended — kick students out
      .on('broadcast', { event: 'CLASS_ENDED' }, () => {
        if (!iAmTutor) onLeave?.();
      })
      // Spotlight sync
      .on('broadcast', { event: 'spotlight' }, ({ payload }) => {
        setSpotlightedUid(payload.uid);
      })
      // Screen share: track which remote UID is sharing
      .on('broadcast', { event: 'screen-share' }, ({ payload }) => {
        if (payload.sharing) {
          setRemoteScreenUid(Number(payload.uid));
        } else if (Number(payload.uid) === remoteScreenUid) {
          setRemoteScreenUid(null);
        }
      })
      // Hand raise
      .on('broadcast', { event: 'hand-raise' }, ({ payload }) => {
        const { uid: raiserUid, name, raised } = payload;
        setRaisedHands(prev =>
          raised
            ? [...prev.filter(h => h.uid !== raiserUid), { uid: raiserUid, name }]
            : prev.filter(h => h.uid !== raiserUid)
        );
      })
      // Identity announcement — who just joined
      .on('broadcast', { event: 'identity' }, ({ payload }) => {
        setParticipantMap(prev => ({ ...prev, [payload.uid]: { name: payload.name, role: payload.role } }));
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  // Announce our own identity when we join the Agora channel
  useEffect(() => {
    if (!isJoined || !profile) return;
    supabase.channel(`classroom:${channelName}`).send({
      type: 'broadcast',
      event: 'identity',
      payload: { uid, name: profile.full_name || userName, role: iAmTutor ? 'tutor' : 'student' },
    });
  }, [isJoined, profile, uid, userName, iAmTutor, channelName, supabase]);

  // Auto-clear raise hand when a remote user leaves the Agora channel
  useEffect(() => {
    if (!client) return;
    const onUserLeft = (user: any) => {
      setRaisedHands(prev => prev.filter(h => h.uid !== Number(user.uid)));
      // Also clear remote screen share if that user was sharing
      setRemoteScreenUid(prev => (prev === Number(user.uid) ? null : prev));
    };
    client.on('user-left', onUserLeft);
    return () => { client.off('user-left', onUserLeft); };
  }, [client]);

  const handleFinalize = async () => {
    setIsEnding(true);
    try {
      await supabase.from('classes').update({ status: 'completed' }).eq('id', channelName);
      await supabase.channel(`classroom:${channelName}`).send({
        type: 'broadcast', event: 'CLASS_ENDED',
        payload: { endedAt: new Date().toISOString() },
      });
      onLeave?.();
    } catch (err) {
      console.error('Failed to finalize class:', err);
    } finally {
      setIsEnding(false);
      setShowFinalizeDialog(false);
    }
  };

  const handleLeaveClick = () => {
    if (iAmTutor) setShowFinalizeDialog(true);
    else onLeave?.();
  };

  // Publish tracks — filter out null so Agora doesn't choke
  const tracksToPublish = useMemo(
    () => [localMicrophoneTrack, localCameraTrack].filter(Boolean) as any[],
    [localMicrophoneTrack, localCameraTrack]
  );
  usePublish(isJoined ? tracksToPublish : []);

  // Track if dual stream has been enabled to avoid redundant calls
  const dualStreamEnabledRef = useRef(false);

  // Enable Dual Stream Mode for adaptive bitrate (reduces latency under poor network)
  useEffect(() => {
    if (!client || dualStreamEnabledRef.current) return;
    dualStreamEnabledRef.current = true;
    client.enableDualStream().catch((err: any) => {
      if (!err?.message?.includes('already enabled')) console.error('Dual stream:', err);
    });
  }, [client]);

  const toggleSpotlight = (targetUid: number | null) => {
    if (!iAmTutor) return;
    setSpotlightedUid(targetUid);
    supabase.channel(`classroom:${channelName}`).send({
      type: 'broadcast', event: 'spotlight',
      payload: { uid: targetUid },
    });
  };

  const teacherUser = useMemo(() => {
    if (iAmTutor) return 'local';
    return remoteUsers.find(u => Number(u.uid) >= 1000 && Number(u.uid) <= 2000);
  }, [remoteUsers, iAmTutor]);

  const studentUsers = useMemo(() => {
    return remoteUsers.filter(u => !(Number(u.uid) >= 1000 && Number(u.uid) <= 2000));
  }, [remoteUsers]);

  // --- SCREEN SHARING & UI STATE ---
  const [handRaised, setHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState<{uid: number; name: string}[]>([]);
  const screenVideoRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const startScreenShare = async () => {
    try {
      const track = await AgoraRTC.createScreenVideoTrack(
        { encoderConfig: { width: 1920, height: 1080, frameRate: 15, bitrateMax: 2000 } },
        'disable'
      );
      const videoTrack = Array.isArray(track) ? track[0] : track;
      if (client && isJoined) await client.publish(videoTrack);
      setScreenTrack(videoTrack);
      setIsScreenSharing(true);
      supabase.channel(`classroom:${channelName}`).send({
        type: 'broadcast', event: 'screen-share',
        payload: { uid, sharing: true },
      });
      videoTrack.on('track-ended', () => stopScreenShare(videoTrack));
    } catch (err) {
      console.error('Screen share failed:', err);
    }
  };

  const stopScreenShare = async (track?: any) => {
    const t = track || screenTrack;
    if (t) {
      try { if (client && isJoined) await client.unpublish(t); t.close(); } catch (e) { console.error(e); }
    }
    setScreenTrack(null);
    setIsScreenSharing(false);
    supabase.channel(`classroom:${channelName}`).send({
      type: 'broadcast', event: 'screen-share',
      payload: { uid, sharing: false },
    });
  };

  // Play LOCAL screen track into the ref div
  useEffect(() => {
    if (screenTrack && screenVideoRef.current) screenTrack.play(screenVideoRef.current);
  }, [screenTrack]);

  // --- HAND RAISE ---
  const toggleHandRaise = () => {
    const newState = !handRaised;
    setHandRaised(newState);
    supabase.channel(`classroom:${channelName}`).send({
      type: 'broadcast', event: 'hand-raise',
      payload: { uid, name: profile?.full_name || userName, raised: newState },
    });
  };

  // --- LOADING STATE ---
  if (loadingProfile) {
    return (
      <div className="h-screen bg-[#0A1A12] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#A7C957] border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-white/40 text-lg animate-pulse font-medium">Verifying identity...</p>
      </div>
    );
  }

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
        profile={profile}
        classBanner={classData?.imageUrl}
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
              <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || userName}`} />
              <AvatarFallback>{(profile?.full_name || userName)[0]}</AvatarFallback>
           </Avatar>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="px-8 py-6 flex items-center justify-between z-20">
          <div>
            <h1 className="text-2xl font-bold text-white/90">Hello, {profile?.full_name || userName}!</h1>
            <p className="text-sm text-white/40">{channelName} | {profile?.role ? (profile.role.charAt(0).toUpperCase() + profile.role.slice(1)) : (role === 'tutor' ? 'Tutor' : 'Participant')}</p>
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
              
              {/* PRESENTATION STAGE — screen share takes priority, then tutor camera */}
              <div ref={stageRef} className={cn("relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#07120C] shadow-2xl group group/stage", isFullscreen ? 'rounded-none' : 'aspect-video')}>
                {/* Priority 1: LOCAL screen share (tutor sharing their screen) */}
                {isScreenSharing && screenTrack ? (
                  <div ref={screenVideoRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
                ) : remoteScreenUid ? (
                  /* Priority 2: REMOTE screen share (someone else sharing) */
                  (() => {
                    const sharingUser = remoteUsers.find(u => Number(u.uid) === remoteScreenUid);
                    return sharingUser ? (
                      <div className="absolute inset-0">
                        <RemoteUser user={sharingUser} playVideo playAudio style={{ width: '100%', height: '100%' }} />
                      </div>
                    ) : null;
                  })()
                ) : iAmTutor && videoOn && localCameraTrack ? (
                  /* Priority 3: TUTOR's own camera (they see themselves in stage) */
                  <div className="absolute inset-0">
                    <LocalVideoTrack track={localCameraTrack} play style={{ width: '100%', height: '100%' }} />
                  </div>
                ) : !iAmTutor && teacherUser && teacherUser !== 'local' ? (
                  /* Priority 3 (student view): Show REMOTE tutor's camera in the stage */
                  <div className="absolute inset-0">
                    <RemoteUser user={teacherUser as any} playVideo playAudio style={{ width: '100%', height: '100%' }} />
                  </div>
                ) : (
                  /* Fallback: idle state */
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0A1A12] to-[#132E1B]">
                    <div className="w-28 h-28 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover/stage:scale-110 transition-transform duration-500">
                      <Presentation className="w-14 h-14 text-white/10" />
                    </div>
                    <p className="text-white/30 font-bold tracking-widest uppercase text-xs mb-2">
                      {iAmTutor ? 'You are Live' : 'Waiting for Tutor'}
                    </p>
                    <p className="text-white/15 text-[10px] tracking-wide max-w-xs text-center">
                      {iAmTutor
                        ? 'Turn on your camera or share your screen to begin'
                        : 'The tutor will appear here when they turn on their camera'}
                    </p>
                    {iAmTutor && (
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setVideo(true)}
                          className="px-5 py-2.5 bg-[#A7C957]/20 hover:bg-[#A7C957]/30 border border-[#A7C957]/30 rounded-full text-[#A7C957] text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <VideoIcon className="w-4 h-4" />
                          Camera
                        </button>
                        <button
                          onClick={startScreenShare}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/60 text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <Monitor className="w-4 h-4" />
                          Present
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Stage Overlays */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
                  </div>
                  {isScreenSharing && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#A7C957]/20 backdrop-blur-md rounded-full border border-[#A7C957]/30">
                      <Monitor className="w-3 h-3 text-[#A7C957]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#A7C957]">Presenting</span>
                      {iAmTutor && (
                        <button
                          onClick={() => stopScreenShare()}
                          className="ml-2 text-white/40 hover:text-white transition-colors"
                        >
                          <MonitorOff className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Hand Raise Notifications (Tutor only) */}
                {iAmTutor && raisedHands.length > 0 && (
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    {raisedHands.map(h => (
                      <div key={h.uid} className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-md rounded-full border border-amber-500/30 animate-pulse">
                        <Hand className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-300">{h.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="absolute top-6 right-6">
                  <Button variant="ghost" size="icon" className="bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-xl w-10 h-10 border border-white/10" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize2 className="w-5 h-5 text-white/80" /> : <Maximize2 className="w-5 h-5 text-white/80" />}
                  </Button>
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
                    <ControlButton
                      active={isScreenSharing}
                      icon={isScreenSharing ? MonitorOff : Monitor}
                      onClick={isScreenSharing ? () => stopScreenShare() : startScreenShare}
                    />
                    <ControlButton
                      active={handRaised}
                      icon={Hand}
                      onClick={toggleHandRaise}
                    />
                    <Button
                      variant="destructive"
                      className="w-14 h-14 rounded-2xl bg-red-500/80 hover:bg-red-600 transition-all flex items-center justify-center border border-white/10"
                      onClick={handleLeaveClick}
                    >
                      <LogOut className="w-6 h-6" />
                    </Button>
                </div>

                {/* Finalize Dialog for Tutor */}
                <AlertDialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
                  <AlertDialogContent className="bg-[#0A1A12] border-white/10 text-white rounded-[2rem] p-8 max-w-md">
                    <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <AlertDialogTitle className="text-2xl font-bold">End Class Session?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/40 text-sm">
                          This will end the meeting for all participants and mark this class as <span className="text-[#A7C957] font-bold">Completed</span> in the system.
                        </AlertDialogDescription>
                      </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                      <AlertDialogCancel className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white mt-0">
                        Stay in Class
                      </AlertDialogCancel>
                      <Button 
                        onClick={handleFinalize} 
                        disabled={isEnding}
                        className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all hover:scale-105 active:scale-95"
                      >
                        {isEnding ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Finalize Class
                          </>
                        )}
                      </Button>
                    </AlertDialogFooter>
                    <button 
                      onClick={() => onLeave()}
                      className="w-full text-center mt-4 text-[10px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
                    >
                      Just leave without ending for all
                    </button>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* PARTICIPANT GRID — ALL users including tutor */}
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                 {/* Local user (always visible) */}
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
                       <Avatar className="w-16 h-16 border-2 border-white/10 mb-2">
                         <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || userName}`} />
                         <AvatarFallback className="text-lg">{(profile?.full_name || userName)[0]}</AvatarFallback>
                       </Avatar>
                       <span className="text-[9px] text-white/20 uppercase tracking-widest">Camera off</span>
                     </div>
                   )}
                   <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                     <div className={cn("w-1.5 h-1.5 rounded-full", micOn ? "bg-green-500" : "bg-white/20")} />
                     <span className="text-[10px] font-medium tracking-tight">{profile?.full_name || userName}</span>
                   </div>
                   {iAmTutor && (
                     <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#A7C957]/20 rounded-full border border-[#A7C957]/30">
                       <span className="text-[8px] font-bold text-[#A7C957] uppercase tracking-widest">Host</span>
                     </div>
                   )}
                 </div>

                 {/* All Remote Participants */}
                 {remoteUsers.map(user => {
                   const info = participantMap[Number(user.uid)];
                   const isUserTutor = info?.role === 'tutor' ||
                     (Number(user.uid) >= 1000 && Number(user.uid) <= 2000);
                   const displayName = info?.name || `User ${user.uid}`;
                   const hasHandRaised = !!raisedHands.find(h => h.uid === Number(user.uid));
                   return (
                    <div key={user.uid} className="w-44 shrink-0 aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group cursor-pointer">
                      <div className="absolute inset-0 transition-transform group-hover:scale-110">
                        <RemoteUser user={user} playVideo playAudio style={{ width: '100%', height: '100%' }} />
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                        <div className={cn("w-1.5 h-1.5 rounded-full", user.hasAudio ? 'bg-green-500 animate-pulse' : 'bg-white/20')} />
                        <span className="text-[10px] font-medium tracking-tight">{displayName}</span>
                      </div>
                      {isUserTutor && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#A7C957]/20 rounded-full border border-[#A7C957]/30">
                          <span className="text-[8px] font-bold text-[#A7C957] uppercase tracking-widest">Host</span>
                        </div>
                      )}
                      {hasHandRaised && (
                        <div className="absolute top-2 right-2 w-7 h-7 bg-amber-500/30 rounded-full flex items-center justify-center border border-amber-500/40 animate-bounce">
                          <Hand className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      )}
                    </div>
                   );
                 })}

               {/* No mock participants - only real ones from Agora */}
              </div>

              {/* CLASSROOM INSIGHTS & KPIs */}
              <div className="flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white/80">Classroom KPIs</h2>
                    <Button variant="link" className="text-[#A7C957] text-sm font-medium p-0 h-auto">Goal Progress</Button>
                 </div>
                 
                 <div className="flex flex-col gap-4">
                    <InsightCard 
                      title="Assignment Submissions" 
                      time="Due today" 
                      tasks="12 Pending" 
                      accomplished="28/40" 
                      progress={70}
                      icon={FileText}
                    />
                    <InsightCard 
                      title="Course Objectives" 
                      time="Current Module" 
                      tasks="3 Remaining" 
                      accomplished="7/10" 
                      progress={70}
                      icon={Sparkles}
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

                 <div 
                    ref={chatScrollRef}
                    className="flex-1 overflow-y-auto px-8 py-4 flex flex-col gap-6 custom-scrollbar"
                  >
                    {messages.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                        <Sparkles className="w-12 h-12 mb-4" />
                        <p className="text-sm font-medium">No messages yet. Be the first to say hi!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <ChatMessage 
                          key={msg.id}
                          user={msg.profiles?.full_name || 'Unknown'} 
                          time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                          msg={msg.content} 
                          isMe={msg.sender_id === profile?.id}
                          avatar={msg.profiles?.avatar_url}
                        />
                      ))
                    )}
                 </div>

                 <div className="p-8 pt-4">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (msgInput.trim() && profile?.id) {
                          sendMessage(msgInput, profile.id, { 
                            full_name: profile.full_name, 
                            avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`
                          });
                          setMsgInput('');
                        }
                      }}
                      className="relative"
                    >
                       <Input 
                         value={msgInput}
                         onChange={(e) => setMsgInput(e.target.value)}
                         placeholder="Type your message..." 
                         className="bg-white/5 border-none rounded-2xl py-7 pl-6 pr-14 text-sm focus-visible:ring-1 focus-visible:ring-white/20 transition-all placeholder:text-white/10"
                       />
                       <Button 
                         type="submit"
                         size="icon" 
                         disabled={!msgInput.trim()}
                         className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#A7C957] hover:bg-[#6A994E] rounded-xl w-10 h-10 transition-transform active:scale-95 disabled:opacity-50"
                       >
                          <Send className="w-4 h-4 text-[#0A1A12]" />
                       </Button>
                    </form>
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

function LobbyScreen(props: {
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
  profile?: UserProfile | null;
  classBanner?: string;
}) {
  const {
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
    isLoading,
    recovering,
    error,
    profile,
    classBanner,
  } = props;
  return (
    <div className="flex h-screen bg-[#0A1A12] text-white items-center justify-center relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#A7C957]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#6A994E]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl mx-auto px-6 flex flex-col items-center z-10">
        {/* Class Banner / Logo Area */}
        <div className="w-full aspect-video rounded-[2rem] overflow-hidden mb-8 relative border border-white/10 shadow-2xl group">
          {classBanner ? (
            <>
              <img src={classBanner} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Class Banner" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A7C957] to-[#6A994E] flex items-center justify-center shadow-lg shadow-[#A7C957]/20">
                   <Sparkles className="w-5 h-5 text-[#0A1A12]" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#A7C957] uppercase tracking-widest">Live Class</span>
                    <h2 className="text-lg font-bold text-white leading-none">Class Session</h2>
                 </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0A1A12] to-[#132E1B] flex flex-col items-center justify-center gap-4">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A7C957] to-[#6A994E] flex items-center justify-center shadow-lg shadow-[#A7C957]/20 transition-transform group-hover:scale-110 duration-500">
                 <Sparkles className="w-8 h-8 text-[#0A1A12]" />
               </div>
               <div className="flex flex-col items-center">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Dr Max Online School</p>
                  <div className="w-8 h-0.5 bg-[#A7C957]/30 mt-2 rounded-full" />
               </div>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-1 text-center">Ready to join?</h1>
        <p className="text-white/40 text-sm mb-8 text-center">
          <span className="text-[#A7C957] font-semibold">{profile?.id || channelName}</span> · Hello, {profile?.full_name || userName} {profile?.role && <span className="opacity-50 text-[10px] ml-1 uppercase tracking-tighter">({profile.role})</span>}
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
            <span className="text-xs font-medium">{profile?.full_name || userName}</span>
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

function ChatMessage({ user, time, msg, avatar, isMe = false, isAI = false }: any) {
  return (
    <div className={cn("flex flex-col gap-2", isMe && "items-end")}>
       <div className={cn("flex items-center gap-3", isMe && "flex-row-reverse")}>
          <Avatar className="w-8 h-8 border border-white/10">
             <AvatarImage src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} />
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
