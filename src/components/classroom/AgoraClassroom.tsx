'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
// Import AgoraRTC default from agora-rtc-react, NOT from agora-rtc-sdk-ng.
// agora-rtc-react re-exports the same SDK but through its own module context.
// Using a separate agora-rtc-sdk-ng import creates a different module instance,
// which means client events never reach the React hooks (no video/audio renders).
import AgoraRTC, {
  AgoraRTCProvider,
  useRTCClient,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  usePublish,
  LocalVideoTrack,
  RemoteUser,
} from 'agora-rtc-react';
import { useAgoraManualJoin } from '@/hooks/useAgoraManualJoin';
import { useChat } from '@/hooks/use-chat';
import { useAgoraRTM } from '@/hooks/useAgoraRTM';
import { useConvoAI } from '@/hooks/useConvoAI';
import { useAgoraChat } from '@/hooks/useAgoraChat';
import { lazy, Suspense } from 'react';
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
  AlertTriangle,
  Loader2,
  Upload,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { useUser } from '@/components/providers/user-context';

const AgoraWhiteboard = lazy(() => import('./AgoraWhiteboard'));

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
                        {isUploading && (
                          <div className="space-y-2">
                             <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                                <span>Uploading document...</span>
                                <span>{uploadProgress}%</span>
                             </div>
                             <Progress value={uploadProgress} className="h-1 bg-white/5" indicatorClassName="bg-royal" />
                          </div>
                        )}

                        <div className="flex flex-col gap-3">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-1">Session Documents</h4>
                           {classResources.length === 0 ? (
                             <p className="text-xs text-white/10 italic">No documents shared in this session yet.</p>
                           ) : (
                             classResources.map((res, i) => (
                               <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-white/20" />
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-white/80 truncate max-w-[120px]">{res.name}</p>
                                        <p className="text-[10px] text-white/30">{res.size} · {res.type.toUpperCase()}</p>
                                     </div>
                                  </div>
                                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/5">
                                     <ArrowUpRight className="w-4 h-4 text-royal" />
                                  </Button>
                               </div>
                             ))
                           )}
                        </div>
                     </div>
                  </TabsContent>

                  <TabsContent value="assignments" className="flex-1 data-[state=active]:!flex flex-col min-h-0 m-0 p-8">
                     <div className="flex flex-col gap-6">
                        <div className="p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0B0C10] rounded-3xl border border-royal/10 relative overflow-hidden">
                           <div className="absolute -top-6 -right-6 w-24 h-24 bg-royal/10 rounded-full blur-2xl" />
                           <h3 className="text-lg font-bold mb-2">Assignment Portal</h3>
                           <p className="text-xs text-white/40 leading-relaxed">Students can submit their tasks here during the live session for immediate feedback.</p>
                        </div>

                        {!iAmTutor ? (
                          <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 group/assign cursor-pointer hover:bg-royal/5 transition-all relative overflow-hidden">
                            <div className="w-14 h-14 rounded-2xl bg-royal/10 flex items-center justify-center group-hover/assign:scale-110 transition-transform duration-500">
                              <Sparkles className="w-7 h-7 text-royal" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-white/80">Submit Your Assignment</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Upload work to teacher</p>
                            </div>
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={async (e) => {
                                alert("Assignment submitted successfully to your tutor!");
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Awaiting Submission</h4>
                             <div className="flex flex-col items-center justify-center py-12 opacity-20">
                                <Users className="w-12 h-12 mb-4" />
                                <p className="text-xs font-medium">No student submissions yet</p>
                             </div>
                          </div>
                        )}
                     </div>
                  </TabsContent>

                  <TabsContent value="whiteboard" className="flex-1 data-[state=active]:!flex flex-col min-h-0 m-0 p-8">
                     <div className="flex flex-col gap-6 h-full justify-between">
                        <div className="space-y-6">
                           <div className="p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0B0C10] rounded-3xl border border-royal/10 relative overflow-hidden">
                              <div className="absolute -top-6 -right-6 w-24 h-24 bg-royal/10 rounded-full blur-2xl" />
                              <h3 className="text-lg font-bold mb-2">Whiteboard Stage</h3>
                              <p className="text-xs text-white/40 leading-relaxed">
                                 The interactive board has been relocated to the widescreen **Main Presentation Stage** for maximum drawing space and utility.
                              </p>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Board Status & Controls</h4>
                              
                              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className={cn(
                                       "w-3 h-3 rounded-full animate-pulse",
                                       showWhiteboard ? "bg-royal shadow-[0_0_8px_rgba(167,201,87,0.5)]" : "bg-white/25"
                                    )} />
                                    <div>
                                       <p className="text-xs font-bold text-white/80">Interactive Stage Mode</p>
                                       <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">
                                          {showWhiteboard ? "Active on Main Screen" : "Currently Hidden"}
                                       </p>
                                    </div>
                                 </div>
                                 <Button
                                    onClick={() => setShowWhiteboard(!showWhiteboard)}
                                    className={cn(
                                       "rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
                                       showWhiteboard 
                                          ? "bg-white/10 hover:bg-white/15 text-white" 
                                          : "bg-royal hover:bg-[#800000] text-[#0B0C10]"
                                    )}
                                 >
                                    {showWhiteboard ? "Hide Board" : "Show Board"}
                                 </Button>
                              </div>

                              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3.5">
                                 <h5 className="text-[10px] font-bold uppercase tracking-wider text-royal">Board Guide & Features</h5>
                                 <ul className="text-xs space-y-2.5 text-white/50">
                                    <li className="flex items-start gap-2">
                                       <span className="text-royal font-bold">•</span>
                                       <span>**Tutor Privileges**: Only the tutor can draw or clear the board, ensuring structured classes.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                       <span className="text-royal font-bold">•</span>
                                       <span>**Smooth Fallback**: Automatically switches to local canvas if cloud sync is unavailable.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                       <span className="text-royal font-bold">•</span>
                                       <span>**Drawing Toolbar**: Located at the bottom of the main stage screen when the whiteboard is active.</span>
                                    </li>
                                 </ul>
                              </div>
                           </div>
                        </div>

                        <p className="text-[10px] text-white/20 leading-relaxed italic">
                           * All participants see drawing updates in near-zero latency.
                        </p>
                     </div>
                  </TabsContent>
                 </Tabs>
              </div>

              {/* Upgrade Banner — right column, below Chat */}
              <div className="bg-[#07140D] p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex items-center justify-between group/upgrade shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-royal/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/upgrade:bg-royal/10 transition-colors" />
                  <div className="flex flex-col gap-2 z-10">
                     <h3 className="text-xl font-bold font-serif text-white/90">
                       Upgrade <span className="font-serif italic text-royal">to Pro</span>
                     </h3>
                     <p className="text-[11px] text-white/40 max-w-[180px] leading-relaxed">
                       Unlock the full potential of AI Assistant!
                     </p>
                     <Button className="mt-2 bg-[#D9ED92] hover:bg-[#E8C85E] text-[#0B0C10] font-semibold rounded-full px-5 py-1.5 text-xs transition-all w-fit shadow-md shadow-[#D9ED92]/15">
                       Explore Pro Plan
                     </Button>
                  </div>
                  <div className="relative w-24 h-24 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse [animation-duration:3000ms]">
                    <svg viewBox="0 0 100 100" className="w-20 h-20">
                      <defs>
                        <radialGradient id="coinRadial" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                          <stop offset="0%" stopColor="#ffb3c1" />
                          <stop offset="40%" stopColor="#ff758f" />
                          <stop offset="85%" stopColor="#c9184a" />
                          <stop offset="100%" stopColor="#590d22" />
                        </radialGradient>
                      </defs>
                      <circle cx="50" cy="50" r="42" fill="url(#coinRadial)" stroke="#ffb3c1" strokeWidth="2" />
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#ff85a1" strokeWidth="1" strokeDasharray="3 2" />
                      <path
                        d="M12 4.419C12.448 3.852 14.105 2.25 16.223 2.012C18.665 1.739 20.252 3.421 21 4.58C21.748 3.421 23.335 1.739 25.777 2.012C27.895 2.25 29.552 3.852 30 4.419C30.985 5.67 31.066 9.479 28.536 12.569C26.177 15.451 21.666 19.333 21 20C20.334 19.333 15.823 15.451 13.464 12.569C10.934 9.479 11.015 5.67 12 4.419Z"
                        fill="#ff0f47"
                        stroke="#ffb3c1"
                        strokeWidth="1"
                        transform="translate(29, 28) scale(2.0)"
                      />
                    </svg>
                  </div>
              </div>

            </div>

          </div>
        </div>
      </main>
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
  micPermissionRevoked?: boolean;
  camPermissionRevoked?: boolean;
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
    micPermissionRevoked = false,
    camPermissionRevoked = false,
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
    <div className="flex h-screen bg-obsidian text-white items-center justify-center relative overflow-hidden">
      {/* Join button at Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={onJoin}
          disabled={isLoading || recovering}
          className={cn(
            "px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#800000] hover:from-[#E8C85E] hover:to-[#D4AF37] text-[#0B0C10] font-bold rounded-2xl text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-3",
            (isLoading || recovering) && "opacity-50 cursor-not-allowed scale-100"
          )}
        >
          {(isLoading || recovering) && <div className="w-5 h-5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />}
          {recovering ? 'Recovering...' : isLoading ? 'Joining...' : 'Join Class'}
        </button>
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-royal/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#800000]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl mx-auto px-6 flex flex-col items-center z-10">
        {/* Class Banner / Logo Area */}
        <div className="w-full aspect-video rounded-[2rem] overflow-hidden mb-8 relative border border-white/10 shadow-2xl group">
          {classBanner ? (
            <>
              <Image src={classBanner} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" alt="Class Banner" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#800000] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                   <Sparkles className="w-5 h-5 text-[#0B0C10]" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-royal uppercase tracking-widest">Live Class</span>
                    <h2 className="text-lg font-bold text-white leading-none">Class Session</h2>
                 </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0B0C10] to-[#132E1B] flex flex-col items-center justify-center gap-4">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#800000] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 transition-transform group-hover:scale-110 duration-500">
                 <Sparkles className="w-8 h-8 text-[#0B0C10]" />
               </div>
               <div className="flex flex-col items-center">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Dr Max Online School</p>
                  <div className="w-8 h-0.5 bg-royal/30 mt-2 rounded-full" />
               </div>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-1 text-center">Ready to join?</h1>
        <p className="text-white/40 text-sm mb-8 text-center">
          <span className="text-royal font-semibold">{profile?.id || channelName}</span> · Hello, {profile?.full_name || userName} {profile?.role && <span className="opacity-50 text-[10px] ml-1 uppercase tracking-tighter">({profile.role})</span>}
        </p>

        {/* Camera preview */}
        <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden bg-obsidian/40 border border-white/10 mb-6 shadow-2xl">
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
                {camPermissionRevoked ? 'Camera permission revoked' : camError ? 'Camera access denied' : 'Camera is off'}
              </p>
              {camPermissionRevoked && (
                <p className="text-royal/60 text-xs mt-1">Please allow camera access in your browser address bar</p>
              )}
              {!camPermissionRevoked && camError && (
                <p className="text-burgundy/80/60 text-xs mt-1">Check your browser permissions</p>
              )}
            </div>
          )}

          {/* Name badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-obsidian/60 backdrop-blur-md rounded-full border border-white/10">
            <div className={cn('w-2 h-2 rounded-full', micOn ? 'bg-royal animate-pulse' : 'bg-white/20')} />
            <span className="text-xs font-medium">{profile?.full_name || userName}</span>
          </div>

          {/* Error & Recovery badges */}
          {(micError || camError || error) && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {micPermissionRevoked && (
                <div className="px-3 py-1.5 bg-royal/20 border border-royal/30 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/5">
                  <AlertTriangle className="w-3.5 h-3.5 text-royal animate-pulse" />
                  <span className="text-[10px] text-royal/80 font-bold uppercase tracking-wider">Mic Revoked</span>
                </div>
              )}
              {camPermissionRevoked && (
                <div className="px-3 py-1.5 bg-royal/20 border border-royal/30 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/5">
                  <AlertTriangle className="w-3.5 h-3.5 text-royal animate-pulse" />
                  <span className="text-[10px] text-royal/80 font-bold uppercase tracking-wider">Cam Revoked</span>
                </div>
              )}
              {!micPermissionRevoked && micError && (
                <div className="px-3 py-1.5 bg-burgundy/20 border border-burgundy/30 backdrop-blur-md rounded-full flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-burgundy/80" />
                  <span className="text-[10px] text-burgundy/80 font-medium uppercase tracking-wide">Mic Error</span>
                </div>
              )}
              {!camPermissionRevoked && camError && (
                <div className="px-3 py-1.5 bg-burgundy/20 border border-burgundy/30 backdrop-blur-md rounded-full flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-burgundy/80" />
                  <span className="text-[10px] text-burgundy/80 font-medium uppercase tracking-wide">Cam Error</span>
                </div>
              )}
              {error && (
                <div className="px-3 py-1.5 bg-burgundy/20 border border-burgundy/30 backdrop-blur-md rounded-full">
                  <span className="text-[10px] text-burgundy/80 font-medium uppercase tracking-wide">{error}</span>
                </div>
              )}
            </div>
          )}

          {recovering && (
            <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <div className="w-12 h-12 border-4 border-royal border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-royal font-bold text-lg animate-pulse">Recovering Connection...</p>
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
                ? 'bg-royal/10 border-royal/30 text-royal'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10',
              micPermissionRevoked && 'border-royal/30 text-royal bg-royal/5',
              !micPermissionRevoked && micError && 'border-burgundy/30 text-burgundy/80'
            )}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            <span className="text-[10px] uppercase tracking-widest font-semibold text-center leading-tight">
              {micPermissionRevoked ? 'Revoked' : micError ? 'Error' : micOn ? 'Mic On' : 'Mic Off'}
            </span>
          </button>

          <button
            onClick={onToggleVideo}
            className={cn(
              'flex flex-col items-center gap-2 w-24 py-4 rounded-2xl border transition-all',
              videoOn
                ? 'bg-royal/10 border-royal/30 text-royal'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10',
              camPermissionRevoked && 'border-royal/30 text-royal bg-royal/5',
              !camPermissionRevoked && camError && 'border-burgundy/30 text-burgundy/80'
            )}
          >
            {videoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            <span className="text-[10px] uppercase tracking-widest font-semibold text-center leading-tight">
              {camPermissionRevoked ? 'Revoked' : camError ? 'Error' : videoOn ? 'Cam On' : 'Cam Off'}
            </span>
          </button>
        </div>

        {/* Join button moved to top right */}

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
      "w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer group",
      active ? "bg-white text-[#0B0C10] shadow-lg shadow-white/5" : "text-white/30 hover:text-white/60 hover:bg-white/5"
    )}>
      <Icon className={cn("w-6 h-6", !active && "group-hover:scale-110 transition-transform")} />
    </div>
  );
}

function ControlButton({ 
  icon: Icon, 
  active = false, 
  isError = false,
  isWarning = false,
  onClick 
}: { 
  icon: any, 
  active?: boolean, 
  isError?: boolean,
  isWarning?: boolean,
  onClick?: () => void 
}) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onClick}
      className={cn(
        "w-14 h-14 rounded-full transition-all border border-white/10 backdrop-blur-md relative",
        active ? "bg-white/10 text-white" : "bg-obsidian/20 text-white/40 hover:bg-white/5 hover:text-white",
        isWarning && "border-royal/50 text-royal hover:text-royal hover:border-royal/80 bg-royal/10",
        isError && "border-burgundy/50 text-burgundy hover:text-burgundy/80"
      )}
    >
      <Icon className="w-6 h-6" />
      {isWarning && (
        <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-royal text-[10px] font-bold text-obsidian border border-obsidian animate-bounce">
          !
        </span>
      )}
    </Button>
  );
}

function MockParticipant({ name, img, status }: { name: string, img: string, status: 'muted' | 'active' | 'talking' }) {
  return (
    <div className="w-44 shrink-0 aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/5 bg-white/5 relative group cursor-pointer transition-all hover:border-royal/30">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=p${img}`} className="w-full h-full object-cover transition-transform group-hover:scale-110 opacity-60" alt={name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {status === 'talking' && (
           <div className="absolute top-3 right-3 w-6 h-6 bg-royal rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Mic className="w-3.5 h-3.5 text-[#0B0C10]" />
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
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-royal group-hover:text-[#0B0C10] transition-colors">
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
                      <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#D9ED92]" style={{ width: `${progress}%` }} />
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
             <span className={cn("text-xs font-bold", isMe ? "text-white/60" : "text-royal")}>{user}</span>
             <span className="text-[10px] text-white/20">{time}</span>
          </div>
       </div>
       <div className={cn(
         "px-5 py-3 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-sm flex items-center gap-2",
         isMe ? "bg-[#0B1E14] border border-white/5 text-white/90 rounded-tr-none" : 
         isAI ? "bg-[#132E1F]/80 border border-royal/20 text-royal rounded-tl-none italic font-medium" : 
         "bg-[#132E1F] border border-white/5 text-white/90 rounded-tl-none"
       )}>
          {isAI && <Sparkles className="w-3.5 h-3.5 shrink-0 text-royal" />}
          <span>{msg}</span>
       </div>
    </div>
  );
}




