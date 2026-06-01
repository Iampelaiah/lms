'use client';

import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';

// Dynamically import to avoid SSR hydration issues with ProseMirror
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl border border-white/10 bg-slate-950/60 flex items-center justify-center py-12 text-slate-400">
      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
      <span className="text-sm">Loading editor...</span>
    </div>
  ),
});

interface CollaborativeEditorProps {
  roomId?: string;
  onChange?: (html: string) => void;
  initialContent?: string;
  readOnly?: boolean;
  placeholder?: string;
}

export default function CollaborativeEditor({
  onChange,
  initialContent = '',
  readOnly = false,
  placeholder,
}: CollaborativeEditorProps) {
  return (
    <RichTextEditor
      onChange={onChange}
      initialContent={initialContent}
      readOnly={readOnly}
      placeholder={placeholder}
    />
  );
}
