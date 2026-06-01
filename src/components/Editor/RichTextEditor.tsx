'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
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

export default function RichTextEditor({
  onChange,
  initialContent = '',
  readOnly = false,
  placeholder = 'Write your submission here...'
}: RichTextEditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({} as any),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    immediatelyRender: false,
  });

  // Sync readOnly content changes
  useEffect(() => {
    if (editor && readOnly && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent, readOnly]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Initializing editor...
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-white/10 bg-slate-950/60 overflow-hidden flex flex-col">
      {/* Inline styles for ProseMirror */}
      <style>{`
        .tiptap-editor .ProseMirror {
          min-height: 150px;
          outline: none;
          padding: 1rem;
          color: rgba(255,255,255,0.9);
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
          height: 0;
        }
        .tiptap-editor .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: white; }
        .tiptap-editor .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: white; }
        .tiptap-editor .ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; color: white; }
        .tiptap-editor .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap-editor .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap-editor .ProseMirror code { background: rgba(255,255,255,0.1); padding: 0.1em 0.3em; border-radius: 3px; font-family: monospace; font-size: 0.85em; }
        .tiptap-editor .ProseMirror pre { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.75rem 1rem; overflow-x: auto; margin: 0.5rem 0; }
        .tiptap-editor .ProseMirror pre code { background: none; padding: 0; font-family: monospace; }
        .tiptap-editor .ProseMirror strong { font-weight: 700; }
        .tiptap-editor .ProseMirror em { font-style: italic; }
        .tiptap-editor .ProseMirror s { text-decoration: line-through; }
        .tiptap-editor .ProseMirror u { text-decoration: underline; }
        .tiptap-editor .ProseMirror blockquote { border-left: 3px solid rgba(255,255,255,0.2); padding-left: 1rem; color: rgba(255,255,255,0.6); margin: 0.5rem 0; }
      `}</style>

      {/* Toolbar — only in edit mode */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-slate-900/80 border-b border-white/10">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code2 className="w-4 h-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor content */}
      <div className="tiptap-editor overflow-y-auto max-h-[300px] min-h-[160px] bg-slate-900/20">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick, active, title, children
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
        active ? 'bg-white/10 text-[#00FFCC]' : 'text-slate-300'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-[1px] h-6 bg-white/10 mx-1" />;
}
