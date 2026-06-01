'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle2, Clock, PlayCircle, FileText, CheckCircle } from "lucide-react"
import { format } from "date-fns"

export function CurriculumTree({ modules, progress, itemCompletions }: { 
  modules: any[], 
  progress: any[],
  itemCompletions: any[]
}) {

  if (!modules || modules.length === 0) {
    return (
      <div className="rounded-lg border text-card-foreground shadow-sm p-12 text-center bg-muted/50">
        <p className="text-muted-foreground">Course modules are currently being prepared by the instructor.</p>
      </div>
    )
  }

  const getProgressForModule = (moduleId: string) => {
    return progress.find(p => p.module_id === moduleId)
  }

  const getItemCompletion = (itemId: string) => {
    return itemCompletions.find(ic => ic.item_id === itemId)
  }

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full space-y-4">
        {modules.map((mod) => {
          const modProgress = getProgressForModule(mod.id);
          const isCompleted = modProgress?.is_completed;
          const score = modProgress?.score || 0;

          // Compute basic progress based on items if score is 0 but items are checked off
          const totalItems = mod.items?.length || 0;
          const completedItems = mod.items?.filter((i: any) => getItemCompletion(i.id)?.is_done).length || 0;
          const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

          return (
            <AccordionItem key={mod.id} value={mod.id} className="border rounded-xl bg-card shadow-sm overflow-hidden px-2">
              <AccordionTrigger className="hover:no-underline py-4 px-4 data-[state=open]:border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4 gap-4 text-left">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        Module {mod.sequence_order}
                      </span>
                      {mod.course_level && (
                        <Badge variant="outline" className="text-xs">{mod.course_level}</Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-bold">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground font-normal line-clamp-1">{mod.description}</p>
                    )}
                  </div>
                  
                  {/* Progress Info */}
                  <div className="flex flex-col items-end min-w-[150px] space-y-2">
                    <div className="flex items-center justify-between w-full text-xs font-medium">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={isCompleted ? "text-green-500" : "text-primary"}>
                        {progressPercent}%
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2 w-full bg-muted" />
                    {score > 0 && (
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">
                        Avg Score: <span className="text-foreground">{score}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0 bg-muted/20">
                <div className="divide-y">
                  {mod.items && mod.items.length > 0 ? mod.items.map((item: any, idx: number) => {
                    const metadata = item.metadata || {};
                    const completion = getItemCompletion(item.id);
                    const isItemDone = completion?.is_done;
                    
                    // Paper 1/2 fields
                    const examAllocation = metadata.exam_allocation_2026;
                    const keyQuestions = metadata.key_questions;
                    // Paper 3 fields
                    const coreFocus = metadata.core_focus;
                    // Paper 4 fields
                    const depthStudy = metadata.depth_study;
                    const themes = metadata.themes;

                    const title = depthStudy || item.title;

                    return (
                      <div key={item.id} className="p-5 hover:bg-muted/40 transition-colors flex flex-col md:flex-row gap-6 relative">
                        {/* Status / Timeline Column */}
                        <div className="flex flex-col items-center gap-2 md:min-w-[120px]">
                          {isItemDone ? (
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
                              {idx + 1}
                            </div>
                          )}
                          
                          {item.start_date && (
                            <div className="flex flex-col items-center text-center mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scheduled</span>
                              <div className="flex items-center text-xs font-medium bg-background border px-2 py-1 rounded shadow-sm whitespace-nowrap mt-1">
                                <Calendar className="w-3 h-3 mr-1.5 text-primary" />
                                {format(new Date(item.start_date), "MMM d")}
                              </div>
                            </div>
                          )}
                          
                          {completion?.score_achieved !== undefined && completion.score_achieved !== null && (
                            <div className="mt-2 text-center">
                              <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                Score: {completion.score_achieved}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {examAllocation && (
                                <Badge variant="secondary" className="text-[10px] uppercase font-bold text-primary">
                                  {examAllocation}
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-base font-bold">{title}</h4>
                          </div>

                          {/* Paper 1/2 Key Questions */}
                          {keyQuestions && Array.isArray(keyQuestions) && (
                            <div className="space-y-1.5">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Key Questions:</p>
                              <ul className="space-y-1">
                                {keyQuestions.map((q: string, i: number) => (
                                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                    <span className="text-primary">•</span>
                                    <span>{q}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Paper 3 Core Focus */}
                          {coreFocus && (
                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Core Focus:</p>
                              <p className="text-sm text-foreground/80">{coreFocus}</p>
                            </div>
                          )}

                          {/* Paper 4 Themes */}
                          {themes && Array.isArray(themes) && (
                            <div className="space-y-1.5">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Themes:</p>
                              <ul className="space-y-2">
                                {themes.map((t: string, i: number) => (
                                  <li key={i} className="text-sm text-muted-foreground flex gap-2 bg-background/50 border p-2 rounded">
                                    <span className="font-bold text-primary shrink-0">{i + 1}.</span>
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No topics have been scheduled for this module yet.
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
