'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { RoomProvider } from '@/liveblocks.config';
import { Loader2 } from 'lucide-react';

// Dynamically import RichTextEditor with SSR disabled to prevent ProseMirror compilation on Node
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-4 flex items-center justify-center min-h-[220px]">
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs">Loading Editor Workspace...</span>
      </div>
    </div>
  )
});

interface CollaborativeEditorProps {
  roomId: string;
  onChange?: (html: string) => void;
  initialContent?: string;
  readOnly?: boolean;
  placeholder?: string;
}

export default function CollaborativeEditor({
  roomId,
  onChange,
  initialContent = '',
  readOnly = false,
  placeholder
}: CollaborativeEditorProps) {
  // If readOnly, we bypass Liveblocks RoomProvider (collaboration) to avoid unnecessary websockets
  if (readOnly) {
    return (
      <RichTextEditor 
        onChange={onChange}
        initialContent={initialContent}
        readOnly={true}
        placeholder={placeholder}
      />
    );
  }

  return (
    <RoomProvider 
      id={roomId} 
      initialPresence={{ cursor: null }}
    >
      <RichTextEditor 
        onChange={onChange}
        initialContent={initialContent}
        readOnly={false}
        placeholder={placeholder}
      />
    </RoomProvider>
  );
}
