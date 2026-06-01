'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { useRoom, useSelf } from '@/liveblocks.config';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, 
  Heading1, Heading2, Heading3, List, ListOrdered, Code2, RefreshCw 
} from 'lucide-react';

interface RichTextEditorProps {
  onChange?: (html: string) => void;
  initialContent?: string;
  readOnly?: boolean;
  placeholder?: string;
}

const COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#F3FF33', 
  '#FF33F3', '#33FFF3', '#FFAF33', '#AF33FF'
];

export default function RichTextEditor({
  onChange,
  initialContent = '',
  readOnly = false,
  placeholder = 'Write your submission here...'
}: RichTextEditorProps) {
  const room = useRoom();
  const self = useSelf();
  
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Set up Yjs document and Liveblocks provider
  useEffect(() => {
    if (readOnly) return;

    const ydoc = new Y.Doc();
    const yprovider = new LiveblocksYjsProvider(room, ydoc);

    yprovider.on('sync', (isSynced: boolean) => {
      setIsConnected(isSynced);
    });

    setDoc(ydoc);
    setProvider(yprovider);

    return () => {
      ydoc.destroy();
      yprovider.destroy();
    };
  }, [room, readOnly]);

  const userName = self?.info?.name || 'Anonymous Student';
  const userColor = COLORS[Math.floor(Math.random() * COLORS.length)];

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // If collaborative, disable local history so Yjs handles undo/redo
        history: !doc ? false : undefined,
      } as any),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      ...(doc && provider ? [
        Collaboration.configure({
          document: doc,
        }),
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: userName,
            color: userColor,
          },
        }),
      ] : []),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  }, [doc, provider]);

  // Handle setting active content when readOnly changes or initialContent changes
  useEffect(() => {
    if (editor && readOnly && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent, readOnly]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Initializing editor workspace...
      </div>
    );
  }

  const BubbleMenuComp = BubbleMenu as any;

  return (
    <div className="w-full rounded-xl border border-white/10 bg-slate-950/60 overflow-hidden flex flex-col">
      {/* Editor styles overrides */}
      <style jsx global>{`
        .ProseMirror {
          min-height: 150px;
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
          height: 0;
        }
        /* Caret overlay styling */
        .ProseMirror .collaboration-cursor__caret {
          position: relative;
          margin-left: -1px;
          margin-right: -1px;
          border-left: 2px solid;
          border-right: 2px solid;
          border-color: currentColor;
          word-break: normal;
          pointer-events: none;
        }
        .ProseMirror .collaboration-cursor__label {
          position: absolute;
          top: -1.4em;
          left: -1px;
          font-size: 10px;
          font-weight: bold;
          line-height: 1;
          user-select: none;
          color: #fff;
          padding: 2px 4px;
          border-radius: 3px;
          white-space: nowrap;
          pointer-events: none;
        }
      `}</style>

      {/* Main Header Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-900/80 border-b border-white/10">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('bold') ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('italic') ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('underline') ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('strike') ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('bulletList') ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('orderedList') ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('code') ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
              editor.isActive('codeBlock') ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
            }`}
            title="Code Block"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Sync indicator */}
          {doc && (
            <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px]">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-slate-400 font-mono">
                {isConnected ? 'Collaborating' : 'Connecting...'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bubble Menu for quick text highlights */}
      {editor && !readOnly && (
        <BubbleMenuComp
          editor={editor}
          tippyOptions={{ duration: 150 }}
          className="flex items-center gap-0.5 bg-slate-900 border border-white/10 p-1 rounded-lg shadow-xl"
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded hover:bg-white/5 transition-colors ${
              editor.isActive('bold') ? 'text-[#00FFCC]' : 'text-slate-300'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded hover:bg-white/5 transition-colors ${
              editor.isActive('italic') ? 'text-[#00FFCC]' : 'text-slate-300'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded hover:bg-white/5 transition-colors ${
              editor.isActive('underline') ? 'text-[#00FFCC]' : 'text-slate-300'
            }`}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1 rounded hover:bg-white/5 transition-colors ${
              editor.isActive('strike') ? 'text-[#00FFCC]' : 'text-slate-300'
            }`}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </BubbleMenuComp>
      )}

      {/* Editor Content Area */}
      <div className="p-4 overflow-y-auto max-h-[300px] min-h-[160px] bg-slate-900/20 text-white/90">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
