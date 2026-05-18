'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WhiteWebSdk, Room, DeviceType, ApplianceNames } from 'white-web-sdk';
import { Loader2 } from 'lucide-react';

interface AgoraWhiteboardProps {
  appIdentifier: string; // Agora Whiteboard App Identifier
  sdkToken: string;      // Agora Whiteboard SDK Token
  roomToken: string;     // Agora Whiteboard Room Token
  uuid: string;          // Agora Whiteboard Room UUID
  uid: string;           // Current user ID
  isTutor: boolean;      // Controls write access
}

export default function AgoraWhiteboard({
  appIdentifier,
  sdkToken,
  roomToken,
  uuid,
  uid,
  isTutor,
}: AgoraWhiteboardProps) {
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let currentRoom: Room | null = null;
    let isMounted = true;

    const initWhiteboard = async () => {
      if (!whiteboardRef.current || !appIdentifier || !roomToken || !uuid) return;

      try {
        const whiteWebSdk = new WhiteWebSdk({
          appIdentifier: appIdentifier,
          region: 'us-sv', // Use your appropriate region
          deviceType: DeviceType.Desktop,
        });

        const newRoom = await whiteWebSdk.joinRoom({
          uuid: uuid,
          roomToken: roomToken,
          uid: uid,
          isWritable: isTutor, // Only tutors can draw by default
          disableNewPencil: false,
        });

        if (isMounted) {
          newRoom.bindHtmlElement(whiteboardRef.current);
          currentRoom = newRoom;
          setRoom(newRoom);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('[Whiteboard] Initialization failed:', err);
        if (isMounted) {
          setError(err.message || 'Failed to initialize whiteboard');
          setIsLoading(false);
        }
      }
    };

    initWhiteboard();

    return () => {
      isMounted = false;
      if (currentRoom) {
        currentRoom.disconnect().catch(console.error);
      }
    };
  }, [appIdentifier, roomToken, uuid, uid, isTutor]);

  return (
    <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden border border-white/10">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-black/60 font-medium">Loading Interactive Whiteboard...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm z-10 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-red-500 font-bold">!</span>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* The actual canvas container */}
      <div 
        ref={whiteboardRef} 
        className="w-full h-full"
        style={{ pointerEvents: isTutor ? 'auto' : 'none' }} // Ensure students can't interact if not writable
      />
      
      {/* Simple Toolbar Overlay (Tutor only) */}
      {isTutor && room && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-lg text-black">
           <button 
             onClick={() => room.setMemberState({ currentApplianceName: ApplianceNames.pencil })}
             className="px-3 py-1 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
           >
             Pen
           </button>
           <div className="w-px h-4 bg-gray-300" />
           <button 
             onClick={() => room.setMemberState({ currentApplianceName: ApplianceNames.eraser })}
             className="px-3 py-1 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
           >
             Eraser
           </button>
           <div className="w-px h-4 bg-gray-300" />
           <button 
             onClick={() => room.setMemberState({ currentApplianceName: ApplianceNames.text })}
             className="px-3 py-1 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
           >
             Text
           </button>
           <div className="w-px h-4 bg-gray-300" />
           <button 
             onClick={() => room.cleanCurrentScene()}
             className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
           >
             Clear
           </button>
        </div>
      )}
    </div>
  );
}
