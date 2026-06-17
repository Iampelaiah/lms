import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Info } from 'lucide-react';

export interface QuestionScore {
  score: number;
  feedback: string;
}

export interface MarkingData {
  contentMark: number; contentMax: number;
  commMark: number; commMax: number;
  orgMark: number; orgMax: number;
  langMark: number; langMax: number;
  totalMark: number; totalMax: number;
  grade: string;
  questionScores?: Record<string, QuestionScore>;
}

interface LeftPanelProps {
  onMarksChange?: (data: MarkingData) => void;
  initialMarks?: MarkingData;
  isReadOnly?: boolean;
  questions?: {
    id: string;
    question_text: string;
    points: number;
    image_url?: string;
  }[];
}

export default function LeftPanel({ onMarksChange, initialMarks, isReadOnly = false, questions = [] }: LeftPanelProps = {}) {
  const [contentMark, setContentMark] = useState<number>(initialMarks?.contentMark ?? 7);
  const [contentMax, setContentMax] = useState<number>(initialMarks?.contentMax ?? 10);
  const [commMark, setCommMark] = useState<number>(initialMarks?.commMark ?? 6);
  const [commMax, setCommMax] = useState<number>(initialMarks?.commMax ?? 7);
  const [orgMark, setOrgMark] = useState<number>(initialMarks?.orgMark ?? 5);
  const [orgMax, setOrgMax] = useState<number>(initialMarks?.orgMax ?? 7);
  const [langMark, setLangMark] = useState<number>(initialMarks?.langMark ?? 4);
  const [langMax, setLangMax] = useState<number>(initialMarks?.langMax ?? 6);

  // Structured questions scores state
  const [qScores, setQScores] = useState<Record<string, QuestionScore>>(() => {
    const scores: Record<string, QuestionScore> = {};
    questions.forEach((q) => {
      const saved = initialMarks?.questionScores?.[q.id];
      scores[q.id] = {
        score: saved?.score ?? q.points,
        feedback: saved?.feedback ?? ''
      };
    });
    return scores;
  });

  // Sync scores if questions array updates later
  useEffect(() => {
    if (questions.length > 0) {
      setQScores((prev) => {
        const next = { ...prev };
        let changed = false;
        questions.forEach((q) => {
          if (!next[q.id] || (initialMarks?.questionScores?.[q.id] && next[q.id].score !== initialMarks.questionScores[q.id].score)) {
            const saved = initialMarks?.questionScores?.[q.id];
            next[q.id] = {
              score: saved?.score ?? q.points,
              feedback: saved?.feedback ?? ''
            };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [questions, initialMarks]);

  const calculatedTotalMark = questions && questions.length > 0 
    ? questions.reduce((sum, q) => sum + (qScores[q.id]?.score ?? 0), 0)
    : contentMark + commMark + orgMark + langMark;

  const calculatedTotalMax = questions && questions.length > 0
    ? questions.reduce((sum, q) => sum + q.points, 0)
    : contentMax + commMax + orgMax + langMax;

  const calculateGrade = (total: number, max: number) => {
    if (max === 0) return 'U';
    const percent = (total / max) * 100;
    if (percent >= 90) return 'A*';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B';
    if (percent >= 60) return 'C';
    if (percent >= 50) return 'D';
    if (percent >= 40) return 'E';
    return 'U';
  };

  const grade = questions && questions.length > 0
    ? calculateGrade(calculatedTotalMark, calculatedTotalMax)
    : (calculatedTotalMark >= 26 ? 'A*' : calculatedTotalMark >= 24 ? 'A' : calculatedTotalMark >= 21 ? 'B' : calculatedTotalMark >= 18 ? 'C' : calculatedTotalMark >= 15 ? 'D' : calculatedTotalMark >= 12 ? 'E' : 'U');

  const getMarkColor = (mark: number, max: number) => {
    const ratio = max > 0 ? mark / max : 0;
    if (ratio >= 0.8) return 'bg-gold';
    if (ratio >= 0.5) return 'bg-gold';
    return 'bg-burgundy';
  };

  const getTextColor = (mark: number, max: number) => {
    const ratio = max > 0 ? mark / max : 0;
    if (ratio >= 0.8) return 'text-gold';
    if (ratio >= 0.5) return 'text-gold';
    return 'text-burgundy';
  };

  useEffect(() => {
    if (onMarksChange && !isReadOnly) {
      if (questions && questions.length > 0) {
        onMarksChange({
          contentMark, contentMax,
          commMark, commMax,
          orgMark, orgMax,
          langMark, langMax,
          totalMark: calculatedTotalMark,
          totalMax: calculatedTotalMax,
          grade,
          questionScores: qScores
        });
      } else {
        onMarksChange({
          contentMark, contentMax,
          commMark, commMax,
          orgMark, orgMax,
          langMark, langMax,
          totalMark: calculatedTotalMark,
          totalMax: calculatedTotalMax,
          grade
        });
      }
    }
  }, [
    contentMark, contentMax, commMark, commMax, orgMark, orgMax, langMark, langMax,
    calculatedTotalMark, calculatedTotalMax, grade, qScores, questions, isReadOnly
  ]);

  return (
    <div className="w-[280px] bg-background border-r border-border h-full flex flex-col flex-shrink-0 overflow-y-auto hide-scrollbar">
      <div className="p-4 space-y-8">
        
        {/* Marking Overview */}
        <section>
          <h2 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider mb-3">Marking Overview</h2>
          <div className="bg-muted border border-border rounded-xl p-5 transition-all">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-xs text-foreground/ font-medium mb-1">Total Mark</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold transition-colors ${getTextColor(calculatedTotalMark, calculatedTotalMax)}`}>{calculatedTotalMark}</span>
                  <span className="text-lg text-foreground/ font-medium">/ {calculatedTotalMax}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-foreground/ font-medium mb-1">Grade</p>
                <span className={`text-4xl font-extrabold transition-colors ${getTextColor(calculatedTotalMark, calculatedTotalMax)}`}>{grade}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-foreground/ font-medium">According to Cambridge Marking Scheme</span>
              <Info className="w-4 h-4 text-foreground/" />
            </div>
          </div>
        </section>

        {/* Structured Question grading OR Rubric Breakdown */}
        {questions && questions.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider mb-3">Question Grading</h2>
            <div className="space-y-4">
              {questions.map((q) => {
                const qScoreObj = qScores[q.id] || { score: q.points, feedback: '' };
                return (
                  <div key={q.id} className="bg-muted border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Question</span>
                        <p className="text-xs text-foreground/ leading-relaxed line-clamp-3 font-semibold">{q.question_text}</p>
                      </div>
                      
                      {/* Score Input */}
                      <div className="flex items-center bg-background border border-border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-gold transition-all shrink-0">
                        <input 
                          type="number" 
                          min={0} max={q.points} 
                          value={qScoreObj.score} 
                          disabled={isReadOnly}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(q.points, Number(e.target.value)));
                            setQScores(prev => ({
                              ...prev,
                              [q.id]: { ...prev[q.id], score: val }
                            }));
                          }} 
                          className="w-8 text-center text-xs font-bold bg-transparent border-none focus:outline-none p-1 text-foreground/ disabled:opacity-100 disabled:bg-transparent" 
                        />
                        <div className="text-[9px] font-bold text-muted-foreground pr-1.5 border-l border-border pl-1.5 py-1 bg-muted shrink-0 select-none">
                          / {q.points}
                        </div>
                      </div>
                    </div>

                    {q.image_url && (
                      <div className="relative w-full h-20 rounded overflow-hidden border border-border/60 bg-background/5 flex items-center justify-center p-1">
                        <img src={q.image_url} alt="Question diagram" className="h-full object-contain" />
                      </div>
                    )}

                    {/* Question Feedback */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Question Feedback</span>
                      <textarea
                        value={qScoreObj.feedback}
                        disabled={isReadOnly}
                        onChange={(e) => {
                          setQScores(prev => ({
                            ...prev,
                            [q.id]: { ...prev[q.id], feedback: e.target.value }
                          }));
                        }}
                        placeholder="Tutor notes on this answer..."
                        className="w-full text-xs bg-background border border-border/80 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-gold min-h-[50px] resize-y text-foreground disabled:opacity-100 disabled:bg-muted/10 leading-snug"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider mb-3">Mark Scheme Breakdown</h2>
            <div className="bg-muted border border-border rounded-xl divide-y divide-white/5">
              
              <div className="p-4 flex items-center justify-between group">
                <span className="text-sm font-semibold text-foreground/">Content</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-background/20 border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent transition-all">
                    <input 
                      type="number" 
                      min={0} max={contentMax} 
                      value={contentMark} 
                      disabled={isReadOnly}
                      onChange={(e) => setContentMark(Math.max(0, Math.min(contentMax, Number(e.target.value))))} 
                      className="w-10 text-center text-sm font-bold bg-transparent border-none focus:outline-none p-1 text-foreground/ disabled:opacity-100 disabled:bg-transparent" 
                    />
                    <div className="flex items-center text-xs font-medium text-foreground/ pr-2 border-l border-border pl-2 py-1 bg-muted">
                      / <input type="number" min={1} value={contentMax} disabled={isReadOnly} onChange={(e) => {
                        const newMax = Math.max(1, Number(e.target.value));
                        setContentMax(newMax);
                        if (contentMark > newMax) setContentMark(newMax);
                      }} className="w-8 ml-1 bg-transparent border-none focus:outline-none text-foreground/ disabled:opacity-100 disabled:bg-transparent" />
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full transition-colors ${getMarkColor(contentMark, contentMax)}`} />
                </div>
              </div>

              <div className="p-4 flex items-center justify-between group">
                <span className="text-sm font-semibold text-foreground/">Communicative Achievement</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-background/20 border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent transition-all">
                    <input 
                      type="number" 
                      min={0} max={commMax} 
                      value={commMark} 
                      disabled={isReadOnly}
                      onChange={(e) => setCommMark(Math.max(0, Math.min(commMax, Number(e.target.value))))} 
                      className="w-10 text-center text-sm font-bold bg-transparent border-none focus:outline-none p-1 text-foreground/ disabled:opacity-100 disabled:bg-transparent" 
                    />
                    <div className="flex items-center text-xs font-medium text-foreground/ pr-2 border-l border-border pl-2 py-1 bg-muted">
                      / <input type="number" min={1} value={commMax} disabled={isReadOnly} onChange={(e) => {
                        const newMax = Math.max(1, Number(e.target.value));
                        setCommMax(newMax);
                        if (commMark > newMax) setCommMark(newMax);
                      }} className="w-8 ml-1 bg-transparent border-none focus:outline-none text-foreground/ disabled:opacity-100 disabled:bg-transparent" />
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full transition-colors ${getMarkColor(commMark, commMax)}`} />
                </div>
              </div>

              <div className="p-4 flex items-center justify-between group">
                <span className="text-sm font-semibold text-foreground/">Organisation</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-background/20 border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
                    <input 
                      type="number" 
                      min={0} max={orgMax} 
                      value={orgMark} 
                      disabled={isReadOnly}
                      onChange={(e) => setOrgMark(Math.max(0, Math.min(orgMax, Number(e.target.value))))} 
                      className="w-10 text-center text-sm font-bold bg-transparent border-none focus:outline-none p-1 text-foreground/ disabled:opacity-100 disabled:bg-transparent" 
                    />
                    <div className="flex items-center text-xs font-medium text-foreground/ pr-2 border-l border-border pl-2 py-1 bg-muted">
                      / <input type="number" min={1} value={orgMax} disabled={isReadOnly} onChange={(e) => {
                        const newMax = Math.max(1, Number(e.target.value));
                        setOrgMax(newMax);
                        if (orgMark > newMax) setOrgMark(newMax);
                      }} className="w-8 ml-1 bg-transparent border-none focus:outline-none text-foreground/ disabled:opacity-100 disabled:bg-transparent" />
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full transition-colors ${getMarkColor(orgMark, orgMax)}`} />
                </div>
              </div>

              <div className="p-4 flex items-center justify-between group">
                <span className="text-sm font-semibold text-foreground/">Language</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-background/20 border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
                    <input 
                      type="number" 
                      min={0} max={langMax} 
                      value={langMark} 
                      disabled={isReadOnly}
                      onChange={(e) => setLangMark(Math.max(0, Math.min(langMax, Number(e.target.value))))} 
                      className="w-10 text-center text-sm font-bold bg-transparent border-none focus:outline-none p-1 text-foreground/ disabled:opacity-100 disabled:bg-transparent" 
                    />
                    <div className="flex items-center text-xs font-medium text-foreground/ pr-2 border-l border-border pl-2 py-1 bg-muted">
                      / <input type="number" min={1} value={langMax} disabled={isReadOnly} onChange={(e) => {
                        const newMax = Math.max(1, Number(e.target.value));
                        setLangMax(newMax);
                        if (langMark > newMax) setLangMark(newMax);
                      }} className="w-8 ml-1 bg-transparent border-none focus:outline-none text-foreground/ disabled:opacity-100 disabled:bg-transparent" />
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full transition-colors ${getMarkColor(langMark, langMax)}`} />
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Cambridge Marking Scheme Details (Only shown when not using custom questions) */}
        {!questions || questions.length === 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider">Cambridge Marking Scheme</h2>
              <button className="text-xs text-gold font-medium hover:underline">Show descriptors</button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-muted border border-border rounded-xl p-4 transition-all hover:bg-muted cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-foreground/">Content (0 – {contentMax})</h3>
                  <span className={`text-sm font-bold ${getTextColor(contentMark, contentMax)}`}>{contentMark} / {contentMax}</span>
                </div>
                <p className="text-xs text-foreground/">The candidate has fulfilled the task.</p>
              </div>

              <div className="bg-muted border border-border rounded-xl p-4 transition-all hover:bg-muted cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-foreground/">Communicative Achievement (0 – {commMax})</h3>
                  <span className={`text-sm font-bold ${getTextColor(commMark, commMax)}`}>{commMark} / {commMax}</span>
                </div>
                <p className="text-xs text-foreground/">The candidate has used the tone and style of the specified format appropriately.</p>
              </div>

              <div className="bg-muted border border-border rounded-xl p-4 transition-all hover:bg-muted cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-foreground/">Organisation (0 – {orgMax})</h3>
                  <span className={`text-sm font-bold ${getTextColor(orgMark, orgMax)}`}>{orgMark} / {orgMax}</span>
                </div>
                <p className="text-xs text-foreground/">The candidate has organised the information and ideas.</p>
              </div>

              <div className="bg-muted border border-border rounded-xl p-4 transition-all hover:bg-muted cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-foreground/">Language (0 – {langMax})</h3>
                  <span className={`text-sm font-bold ${getTextColor(langMark, langMax)}`}>{langMark} / {langMax}</span>
                </div>
                <p className="text-xs text-foreground/">The candidate has used a range of vocabulary and grammatical structures.</p>
              </div>
            </div>
          </section>
        )}

      </div>
      
      <div className="mt-auto p-4 bg-background border-t border-border sticky bottom-0">
        <Button variant="outline" className="w-full h-10 border-border bg-muted hover:bg-muted text-foreground font-bold transition-all">
          <Download className="w-4 h-4 mr-2 text-gold" />
          Download Mark Sheet
        </Button>
      </div>
    </div>
  );
}


