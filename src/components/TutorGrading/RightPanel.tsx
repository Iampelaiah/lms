import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, MoreVertical, ExternalLink } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

export interface Annotation {
  id: string;
  type: 'highlight' | 'comment' | 'strikeout' | 'insert' | 'replace' | 'resource';
  selected_text?: string;
  content?: string;
  marker_number?: number;
}

interface RightPanelProps {
  activeAnnotationId: string | null;
  onCommentClick: (id: string) => void;
  overallFeedback?: string;
  onFeedbackChange?: (feedback: string) => void;
  annotations?: Annotation[];
}

export default function RightPanel({ activeAnnotationId, onCommentClick, overallFeedback = '', onFeedbackChange, annotations = [] }: RightPanelProps) {
  const comments = annotations.filter(a => a.type === 'comment' || a.type === 'highlight');
  const corrections = annotations.filter(a => a.type === 'replace' || a.type === 'strikeout' || a.type === 'insert');
  const resources = annotations.filter(a => a.type === 'resource');

  return (
    <div className="w-[360px] bg-obsidian border-l border-white/10 h-full flex flex-col flex-shrink-0">
      
      <Tabs defaultValue="comments" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full bg-obsidian border-b border-white/10 rounded-none h-12 justify-start px-2">
          <TabsTrigger value="comments" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-royal rounded-none h-full px-4 text-white/60 data-[state=active]:text-royal">
            Comments
          </TabsTrigger>
          <TabsTrigger value="corrections" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-royal rounded-none h-full px-4 text-white/60 data-[state=active]:text-royal">
            Corrections
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-royal rounded-none h-full px-4 text-white/60 data-[state=active]:text-royal">
            Resources
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-5">
          <TabsContent value="comments" className="m-0 space-y-4">
            <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Areas to Improve</h3>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div 
                  key={comment.id} 
                  onClick={() => onCommentClick(comment.id.toString())}
                  className={`flex gap-3 bg-white/5 p-3 rounded-lg transition-colors cursor-pointer border ${
                    activeAnnotationId === comment.id.toString() 
                      ? 'border-royal ring-1 ring-royal' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`flex items-center justify-center w-5 h-5 rounded ${comment.type === 'highlight' ? 'bg-royal' : 'bg-royal text-obsidian'} text-white font-bold text-xs flex-shrink-0 mt-0.5`}>
                    {comment.marker_number || '*'}
                  </div>
                  <p className="text-sm text-white/90 flex-1 leading-snug">{comment.content}</p>
                  <button className="text-white/60 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="corrections" className="m-0 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Corrections</h3>
              <button className="text-xs text-royal font-medium hover:underline">View all</button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden divide-y divide-white/10">
              {corrections.length === 0 && <p className="p-3 text-sm text-white/60">No corrections yet.</p>}
              {corrections.map((corr, i) => (
                <div key={corr.id} className="flex items-center justify-between p-3 text-sm">
                  <span className="text-white/60 line-through truncate w-[40%]">{corr.selected_text || '...'}</span>
                  <span className="text-white/60">→</span>
                  <span className="text-royal font-medium truncate w-[45%]">{corr.content}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="m-0 space-y-4">
            <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Recommended Reading</h3>
            <div className="space-y-3">
              {resources.length === 0 && <p className="text-sm text-white/60">No resources linked yet.</p>}
              {resources.map(res => (
                <a key={res.id} href={res.content} target="_blank" rel="noreferrer" className="flex items-start gap-3 bg-white/5 border border-white/10 p-3 rounded-lg hover:border-royal/50 transition-colors group">
                  <div className="w-6 h-6 rounded bg-royal/10 text-royal flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold">LINK</span>
                  </div>
                  <span className="text-sm font-medium text-white/90 flex-1 group-hover:text-royal">{res.selected_text || res.content}</span>
                  <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-royal" />
                </a>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Overall Feedback */}
      <div className="p-5 border-t border-white/10 bg-white/5">
        <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-3">Overall Feedback</h3>
        <Textarea 
          placeholder="Write your overall feedback for the student here..."
          value={overallFeedback}
          onChange={(e) => onFeedbackChange?.(e.target.value)}
          className="min-h-[100px] text-sm resize-none focus-visible:ring-royal bg-white/5 border-white/10 text-white placeholder:text-white/60"
        />
      </div>
      
    </div>
  );
}


