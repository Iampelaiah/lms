import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TutorAnnotation } from '../Editor/extensions/TutorAnnotation';
import { Button } from '@/components/ui/button';
import { Highlighter, MessageSquare, Strikethrough, Type, RefreshCw, Undo, Redo, Search, Send, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface GradingEditorProps {
  initialContent: string;
  activeAnnotationId: string | null;
  onAnnotationClick: (id: string) => void;
  onAddAnnotation?: (annotation: any) => void;
}

export default function GradingEditor({ initialContent, activeAnnotationId, onAnnotationClick, onAddAnnotation }: GradingEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [bubbleMode, setBubbleMode] = useState<'menu' | 'comment' | 'replace' | 'resource'>('menu');
  const [inputValue, setInputValue] = useState('');

  const mockResources = [
    { id: 'res1', type: 'PDF', title: 'Cambridge IGCSE English 0500 - Paper 2 Guide', url: 'https://example.com/res1' },
    { id: 'res2', type: 'WB', title: 'Writing an Article – Cambridge Learner Guide', url: 'https://example.com/res2' },
    { id: 'res3', type: 'EXT', title: 'Improve Your Academic Writing', url: 'https://example.com/res3' },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TutorAnnotation,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      setWordCount(editor.getText().trim().split(/\s+/).filter(Boolean).length);
    },
    onSelectionUpdate: () => {
      // Reset bubble menu state when selection changes
      setBubbleMode('menu');
      setInputValue('');
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      setWordCount(editor.getText().trim().split(/\s+/).filter(Boolean).length);
      
      const handleEditorClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName.toLowerCase() === 'mark' && target.hasAttribute('data-annotation-id')) {
          const id = target.getAttribute('data-annotation-id');
          if (id) {
            onAnnotationClick(id);
          }
        }
      };
      
      editor.view.dom.addEventListener('click', handleEditorClick);
      return () => {
        editor.view.dom.removeEventListener('click', handleEditorClick);
      };
    }
  }, [editor, onAnnotationClick]);

  if (!editor) return null;

  const handleAddAnnotationSubmit = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    const id = crypto.randomUUID();
    
    // Determine type
    let annotationType = 'comment';
    if (bubbleMode === 'replace') annotationType = 'replace';
    else if (bubbleMode === 'resource') annotationType = 'resource';

    // Apply TipTap Mark
    editor.chain().focus().setTutorAnnotation({ id, type: annotationType }).run();

    // Call prop
    if (onAddAnnotation) {
      onAddAnnotation({
        type: annotationType,
        selected_text: selectedText,
        content: inputValue,
        marker_number: 1, // Parent can recalculate this
      });
    }

    setBubbleMode('menu');
    setInputValue('');
  };

  const handleResourceClick = (res: any) => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    const id = crypto.randomUUID();

    editor.chain().focus().setTutorAnnotation({ id, type: 'resource' }).run();

    if (onAddAnnotation) {
      onAddAnnotation({
        type: 'resource',
        selected_text: res.title,
        content: res.url,
      });
    }

    setBubbleMode('menu');
    setInputValue('');
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      <style>{`
        .ProseMirror { outline: none; padding: 2rem 4rem; color: #f1f5f9; font-size: 1rem; line-height: 2; font-family: system-ui, -apple-system, sans-serif; min-height: 100%; }
        .ProseMirror p { margin-bottom: 1.5rem; }
        mark[data-annotation-type="comment"] { background-color: rgba(59, 130, 246, 0.4); padding: 2px 4px; border-radius: 4px; cursor: pointer; transition: all 0.2s; color: white; }
        mark[data-annotation-type="highlight"] { background-color: rgba(245, 158, 11, 0.4); padding: 2px 4px; border-radius: 4px; cursor: pointer; transition: all 0.2s; color: white; }
        mark[data-annotation-type="replace"] { background-color: rgba(255, 255, 255, 0.1); text-decoration: line-through; color: #94a3b8; padding: 0 2px; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
        mark[data-annotation-type="resource"] { background-color: rgba(168, 85, 247, 0.4); padding: 2px 4px; border-radius: 4px; cursor: pointer; transition: all 0.2s; color: white; }
        mark[data-annotation-id="${activeAnnotationId}"] { box-shadow: 0 0 0 2px #D4AF37; outline: 2px solid #D4AF37; outline-offset: 1px; }
      `}</style>
      
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'top' }} className="flex flex-col bg-background shadow-xl border border-border rounded-xl overflow-hidden min-w-[200px] text-foreground">
          {bubbleMode === 'menu' ? (
            <div className="flex items-center p-1 divide-x divide-white/10">
              <Button variant="ghost" size="sm" onClick={() => setBubbleMode('comment')} className="h-9 px-3 gap-1.5 text-foreground/ hover:bg-muted hover:text-gold rounded-lg">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-medium">Comment</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setBubbleMode('replace')} className="h-9 px-3 gap-1.5 text-foreground/ hover:bg-muted hover:text-gold rounded-lg">
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs font-medium">Correct</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                 const { from, to } = editor.state.selection;
                 const selectedText = editor.state.doc.textBetween(from, to, ' ');
                 const id = crypto.randomUUID();
                 editor.chain().focus().setTutorAnnotation({ id, type: 'highlight' }).run();
                 if (onAddAnnotation) onAddAnnotation({ type: 'highlight', selected_text: selectedText, content: 'Highlight' });
              }} className="h-9 px-3 gap-1.5 text-foreground/ hover:bg-muted hover:text-gold rounded-lg">
                <Highlighter className="w-4 h-4" />
                <span className="text-xs font-medium">Highlight</span>
              </Button>
            </div>
          ) : (
            <div className="w-[300px] p-3 flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground/ uppercase">{bubbleMode === 'comment' ? 'Add Comment' : 'Add Correction'}</span>
                <button onClick={() => setBubbleMode('menu')} className="text-foreground/ hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Textarea 
                autoFocus
                placeholder={bubbleMode === 'comment' ? "Type your comment or type @ for resources..." : "Type the correct word/phrase..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="min-h-[80px] text-sm resize-none focus-visible:ring-gold bg-muted border-border text-foreground placeholder:text-foreground/"
              />
              
              {/* Resource Suggestions */}
              {inputValue.includes('@') && (
                <div className="absolute top-full left-0 w-full bg-background border border-border rounded-lg shadow-lg mt-1 overflow-hidden z-50">
                  <div className="bg-muted px-3 py-1 border-b border-border text-[10px] font-bold text-foreground/ uppercase">Suggested Resources</div>
                  <div className="max-h-[150px] overflow-y-auto">
                    {mockResources.map(res => (
                      <button 
                        key={res.id} 
                        onClick={() => handleResourceClick(res)}
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm text-foreground/ flex items-center gap-2 border-b border-border last:border-0"
                      >
                        <span className="w-6 h-6 rounded bg-gold/10 text-gold flex items-center justify-center text-[10px] font-bold">{res.type}</span>
                        <span className="truncate flex-1">{res.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-1">
                <Button size="sm" onClick={handleAddAnnotationSubmit} disabled={!inputValue.trim()} className="h-8 gap-1 bg-gold hover:bg-gold/90 text-obsidian">
                  <Send className="w-3.5 h-3.5" />
                  Send
                </Button>
              </div>
            </div>
          )}
        </BubbleMenu>
      )}

      <div className="flex-1 overflow-y-auto relative pb-20">
        <div className="max-w-[800px] mx-auto pt-8">
          <div className="bg-muted border border-border rounded-xl p-5 mx-16 mb-8 text-foreground/ shadow-sm">
            <h3 className="font-bold text-foreground mb-2">Task</h3>
            <p className="text-sm text-foreground/">Write an article for your school magazine arguing whether exams are the best way to measure a student's ability.</p>
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="absolute bottom-4 left-6 text-xs font-semibold text-foreground/">
        Word count: {wordCount}
      </div>
    </div>
  );
}


