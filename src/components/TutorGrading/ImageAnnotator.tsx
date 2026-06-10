'use client';

import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Highlighter, Strikethrough, MessageSquare, Undo, X, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type AnnotationType = 'highlight' | 'strikethrough' | 'comment';

export interface ImageAnnotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  marker_number?: number;
  page?: number;
}

interface ImageAnnotatorProps {
  fileUrl: string;
  activeAnnotationId: string | null;
  annotations: ImageAnnotation[];
  onAnnotationClick: (id: string) => void;
  onAddAnnotation: (annotation: ImageAnnotation) => void;
  onRemoveAnnotation: (id: string) => void;
}

export default function ImageAnnotator({
  fileUrl,
  activeAnnotationId,
  annotations,
  onAnnotationClick,
  onAddAnnotation,
  onRemoveAnnotation
}: ImageAnnotatorProps) {
  const [tool, setTool] = useState<AnnotationType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDraw, setCurrentDraw] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [draftComment, setDraftComment] = useState<{ x: number, y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  
  // PDF state
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  
  const isPdf = fileUrl.toLowerCase().includes('.pdf');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter annotations for current page (or page 1 if not set)
  const currentAnnotations = annotations.filter(a => !a.page || a.page === pageNumber);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const getCoordinates = (e: MouseEvent<SVGElement>) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const handlePointerDown = (e: MouseEvent<SVGElement>) => {
    if (!tool) return;
    const { x, y } = getCoordinates(e);

    if (tool === 'comment') {
      setDraftComment({ x, y });
      setTool(null);
    } else {
      setIsDrawing(true);
      setCurrentDraw({ x, y, width: 0, height: 0 });
    }
  };

  const handlePointerMove = (e: MouseEvent<SVGElement>) => {
    if (!isDrawing || !currentDraw || !tool) return;
    const { x, y } = getCoordinates(e);
    
    setCurrentDraw({
      x: currentDraw.x,
      y: currentDraw.y,
      width: x - currentDraw.x,
      height: y - currentDraw.y,
    });
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentDraw || !tool) return;
    setIsDrawing(false);

    let finalX = currentDraw.x;
    let finalY = currentDraw.y;
    let finalWidth = currentDraw.width;
    let finalHeight = currentDraw.height;

    if (finalWidth < 0) {
      finalX += finalWidth;
      finalWidth = Math.abs(finalWidth);
    }
    if (finalHeight < 0) {
      finalY += finalHeight;
      finalHeight = Math.abs(finalHeight);
    }

    if (finalWidth < 1 && finalHeight < 1) {
      setCurrentDraw(null);
      return;
    }

    const id = crypto.randomUUID();
    onAddAnnotation({
      id,
      type: tool,
      x: finalX,
      y: finalY,
      width: finalWidth,
      height: finalHeight,
      content: tool === 'highlight' ? 'Highlight' : 'Correction',
      page: isPdf ? pageNumber : 1
    });

    setCurrentDraw(null);
    setTool(null);
  };

  const submitComment = () => {
    if (!draftComment || !commentText.trim()) return;
    const id = crypto.randomUUID();
    onAddAnnotation({
      id,
      type: 'comment',
      x: draftComment.x,
      y: draftComment.y,
      content: commentText,
      page: isPdf ? pageNumber : 1
    });
    setDraftComment(null);
    setCommentText('');
  };

  return (
    <div className="flex flex-col h-full bg-muted/20 relative">
      <div className="flex items-center justify-between p-2 bg-background border-b z-10 shadow-sm">
        <div className="flex gap-2">
          <Button 
            variant={tool === 'highlight' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setTool(tool === 'highlight' ? null : 'highlight')}
            className={tool === 'highlight' ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' : ''}
          >
            <Highlighter className="w-4 h-4 mr-2" /> Highlight
          </Button>
          <Button 
            variant={tool === 'strikethrough' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setTool(tool === 'strikethrough' ? null : 'strikethrough')}
            className={tool === 'strikethrough' ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''}
          >
            <Strikethrough className="w-4 h-4 mr-2" /> Strikethrough
          </Button>
          <Button 
            variant={tool === 'comment' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setTool(tool === 'comment' ? null : 'comment')}
            className={tool === 'comment' ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' : ''}
          >
            <MessageSquare className="w-4 h-4 mr-2" /> Comment
          </Button>
        </div>
        
        {isPdf && numPages && numPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">Page {pageNumber} of {numPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
        <div 
          className="relative inline-block shadow-lg border border-border bg-white"
          ref={containerRef}
          style={{ cursor: tool ? 'crosshair' : 'default' }}
        >
          {isPdf ? (
            <div className="select-none pointer-events-none">
              <Document 
                file={fileUrl} 
                onLoadSuccess={onDocumentLoadSuccess} 
                loading={<div className="p-10 text-muted-foreground text-sm font-medium">Loading PDF...</div>}
                error={<div className="p-10 text-destructive text-sm font-medium">Failed to load PDF.</div>}
              >
                <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} scale={pdfScale} />
              </Document>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={fileUrl} 
              alt="Student Submission" 
              className="max-w-[800px] h-auto block select-none pointer-events-none"
            />
          )}

          {/* Drawing Overlay */}
          <svg 
            className={`absolute inset-0 w-full h-full z-10 ${tool ? 'touch-none' : 'pointer-events-none'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {currentAnnotations.map((ann) => {
              const isActive = ann.id === activeAnnotationId;
              
              if (ann.type === 'highlight') {
                return (
                  <rect 
                    key={ann.id}
                    x={`${ann.x}%`} y={`${ann.y}%`} 
                    width={`${ann.width}%`} height={`${ann.height}%`}
                    fill="rgba(245, 158, 11, 0.4)"
                    stroke={isActive ? '#D4AF37' : 'transparent'}
                    strokeWidth="2"
                    className="cursor-pointer transition-colors pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); onAnnotationClick(ann.id); }}
                  />
                );
              }
              if (ann.type === 'strikethrough') {
                return (
                  <line 
                    key={ann.id}
                    x1={`${ann.x}%`} y1={`${ann.y + (ann.height || 0)/2}%`} 
                    x2={`${ann.x + (ann.width || 0)}%`} y2={`${ann.y + (ann.height || 0)/2}%`}
                    stroke="rgba(239, 68, 68, 0.8)"
                    strokeWidth="3"
                    className="cursor-pointer pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); onAnnotationClick(ann.id); }}
                    style={isActive ? { filter: 'drop-shadow(0px 0px 4px #D4AF37)' } : {}}
                  />
                );
              }
              if (ann.type === 'comment') {
                return (
                  <g 
                    key={ann.id} 
                    className="cursor-pointer transition-transform hover:scale-110 pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); onAnnotationClick(ann.id); }}
                  >
                    <circle cx={`${ann.x}%`} cy={`${ann.y}%`} r="12" fill={isActive ? '#D4AF37' : '#3b82f6'} className="shadow-sm" />
                    <text x={`${ann.x}%`} y={`${ann.y}%`} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                      {ann.marker_number || '!'}
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {isDrawing && currentDraw && tool === 'highlight' && (
              <rect 
                x={`${currentDraw.width < 0 ? currentDraw.x + currentDraw.width : currentDraw.x}%`} 
                y={`${currentDraw.height < 0 ? currentDraw.y + currentDraw.height : currentDraw.y}%`} 
                width={`${Math.abs(currentDraw.width)}%`} 
                height={`${Math.abs(currentDraw.height)}%`}
                fill="rgba(245, 158, 11, 0.4)"
              />
            )}
            {isDrawing && currentDraw && tool === 'strikethrough' && (
              <line 
                x1={`${currentDraw.x}%`} 
                y1={`${currentDraw.y + currentDraw.height/2}%`} 
                x2={`${currentDraw.x + currentDraw.width}%`} 
                y2={`${currentDraw.y + currentDraw.height/2}%`}
                stroke="rgba(239, 68, 68, 0.8)"
                strokeWidth="3"
              />
            )}
          </svg>

          {/* Draft Comment UI */}
          {draftComment && (
            <div 
              className="absolute z-20 bg-background border shadow-xl rounded-xl p-3 w-[250px]"
              style={{ left: `calc(${draftComment.x}% + 10px)`, top: `calc(${draftComment.y}% + 10px)` }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Add Comment</span>
                <button onClick={() => setDraftComment(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Textarea 
                autoFocus
                placeholder="Type your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] text-sm resize-none focus-visible:ring-gold bg-muted"
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={submitComment} disabled={!commentText.trim()} className="bg-gold hover:bg-gold/90 text-obsidian h-8 gap-1">
                  <Send className="w-3.5 h-3.5" /> Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
