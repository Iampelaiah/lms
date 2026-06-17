'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import GradingHeader from '@/components/TutorGrading/GradingHeader';
import LeftPanel, { MarkingData } from '@/components/TutorGrading/LeftPanel';
import RightPanel from '@/components/TutorGrading/RightPanel';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ImageAnnotator = dynamic(() => import('@/components/TutorGrading/ImageAnnotator'), { ssr: false });
const GradingEditor = dynamic(() => import('@/components/TutorGrading/GradingEditor'), { ssr: false });

export default function GradingPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [overallFeedback, setOverallFeedback] = useState<string>('');
  const [marksData, setMarksData] = useState<MarkingData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!submissionId) return;

    const fetchSubmission = async () => {
      setLoading(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (err) {
        console.error("Error getting user session:", err);
      }

      if (submissionId === 'mock-assignment-id-1') {
        const mockSub = {
          id: 'mock-assignment-id-1',
          student_id: 'mock-student-id',
          assignment_id: 'mock-assignment-id-1',
          raw_text: `France was on the brink of bankruptcy in 1789 due to its involvement in the American Revolutionary War and the extravagant spending of the royal court at Versailles. The tax system was regressive, exempting the nobility and clergy while placing the burden entirely on the Third Estate (peasants and bourgeoisie). This, coupled with poor harvests leading to high bread prices, triggered widespread famine and discontent, forcing King Louis XVI to summon the Estates-General.`,
          overall_grade: null,
          overall_feedback: null,
          status: 'grading',
          component_scores: {
            contentMark: 8, contentMax: 10,
            commMark: 6, commMax: 7,
            orgMark: 6, orgMax: 7,
            langMark: 5, langMax: 6,
            totalMark: 25, totalMax: 30,
            grade: 'A',
            questionScores: {
              'q-1': { score: 12, feedback: 'Very good detail about the American war.' },
              'q-2': { score: 13, feedback: 'Clear explanation of the Third Estate.' }
            }
          },
          profiles: { full_name: 'Pelaiah Tadiwanashe Tapera Ngarande' }
        };

        const key = `drmax_submissions_mock-student-id_mock-subject-id`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const found = parsed.find((item: any) => item.id === 'mock-assignment-id-1');
          if (found) {
            mockSub.status = found.status || mockSub.status;
            mockSub.overall_feedback = found.tutor_feedback || mockSub.overall_feedback;
            mockSub.overall_grade = found.grade || mockSub.overall_grade;
            if (found.component_scores) {
              mockSub.component_scores = found.component_scores;
            }
          }
        }

        setSubmission(mockSub);
        if (mockSub.overall_feedback) {
          setOverallFeedback(mockSub.overall_feedback);
        }
        setQuestions([
          { id: 'q-1', question_text: 'Explain the cause of bankruptcy in 1789.', points: 15 },
          { id: 'q-2', question_text: 'Discuss the impact of tax exemptions for nobility and clergy.', points: 15 }
        ]);
        setAnnotations([]);
        setLoading(false);
        return;
      }

      const { data: subData, error: subError } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('id', submissionId)
        .single();

      if (subError) {
        console.error("Error fetching submission:", JSON.stringify(subError, null, 2));
        toast({ title: 'Error', description: 'Could not load submission', variant: 'destructive' });
        router.push('/tutor/assignments');
        return;
      }

      setSubmission(subData);
      if (subData?.overall_feedback) {
        setOverallFeedback(subData.overall_feedback);
      }

      if (subData?.file_url) {
        setAnnotations(subData.annotations_data || []);
      } else {
        const { data: annData, error: annError } = await supabase
          .from('annotations')
          .select('*')
          .eq('submission_id', submissionId)
          .order('start_offset', { ascending: true });

        if (annError) {
          console.error("Error fetching annotations:", annError);
        } else {
          setAnnotations(annData || []);
        }
      }

      let topicTitle = '';
      let subjectNameStr = '';

      if (subData?.assignment_id) {
        // Fetch assignment details separately
        const { data: assignData } = await supabase
          .from('curriculum_assignments')
          .select('assignment_number, module_item_id')
          .eq('id', subData.assignment_id)
          .single();
          
        if (assignData?.module_item_id) {
           const { data: itemData } = await supabase
             .from('curriculum_items')
             .select('title, module_id')
             .eq('id', assignData.module_item_id)
             .single();
             
           if (itemData) {
             topicTitle = itemData.title;
             
             if (itemData.module_id) {
               const { data: modData } = await supabase
                 .from('curriculum_modules')
                 .select('subject_id')
                 .eq('id', itemData.module_id)
                 .single();
                 
               if (modData?.subject_id) {
                 const { data: sub } = await supabase
                   .from('subjects')
                   .select('name, level')
                   .eq('id', modData.subject_id)
                   .single();
                   
                 if (sub) {
                   subjectNameStr = `${sub.name} ${sub.level ? `(${sub.level})` : ''} – Assignment ${assignData.assignment_number}`;
                 }
               }
             }
           }
        }
        subData.topicTitle = topicTitle;
        subData.subjectNameStr = subjectNameStr;
        subData.assignmentNumber = assignData?.assignment_number;

        // Fetch assignment questions
        let { data: qData, error: qError } = await supabase
          .from('assignment_questions')
          .select('*')
          .eq('assignment_id', subData.assignment_id)
          .order('sequence_order', { ascending: true });
        
        if (qError || !qData || qData.length === 0) {
          const { data: dlData } = await supabase
            .from('student_deadlines')
            .select('questions, description')
            .eq('id', subData.assignment_id)
            .single();
          if (dlData) {
            if (dlData.description && dlData.description.trim().startsWith('{') && dlData.description.includes('"_richAssignment":true')) {
              try {
                const parsed = JSON.parse(dlData.description);
                qData = parsed.questions || [];
                qError = null;
              } catch (err) {
                console.error("Error parsing fallback description questions:", err);
              }
            } else if (dlData.questions) {
              qData = dlData.questions;
              qError = null;
            }
          }
        }
        
        if (!qError && qData && qData.length > 0) {
          setQuestions(qData);
          
          // Fetch student question scores for this submission
          const { data: qsData } = await supabase
            .from('student_question_scores')
            .select('*')
            .eq('submission_id', submissionId);
            
          const questionScoresMap: Record<string, any> = {};
          qData.forEach(q => {
            const dbScore = qsData?.find(qs => qs.question_id === q.id);
            questionScoresMap[q.id] = {
              score: dbScore ? Number(dbScore.score) : q.points,
              feedback: dbScore?.feedback || ''
            };
          });
          
          if (!subData.component_scores) {
            subData.component_scores = {};
          }
          subData.component_scores.questionScores = {
            ...questionScoresMap,
            ...(subData.component_scores.questionScores || {})
          };
        }
      }

      setSubmission(subData);
      setLoading(false);
    };

    fetchSubmission();
  }, [submissionId, supabase, toast, router]);

  const handleAddAnnotation = async (annotation: any) => {
    const newAnnotation = {
      ...annotation,
      id: annotation.id || crypto.randomUUID(),
      submission_id: submissionId,
      tutor_id: currentUserId || 'bb4b0f5b-852b-4cbd-8fc2-fb038643742a', // fallback admin user
      created_at: new Date().toISOString(),
      marker_number: annotations.length + 1
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const handleRemoveAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const handleEditAnnotation = (id: string, newContent: string) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, content: newContent } : a));
  };

  const handlePublishGrades = async () => {
    try {
      setLoading(true);

      if (submissionId !== 'mock-assignment-id-1') {
        // 1. Update the submissions table
        const updatePayload: any = {
          status: 'graded',
          overall_feedback: overallFeedback,
          overall_grade: marksData?.grade || null,
          component_scores: marksData as any,
          updated_at: new Date().toISOString()
        };

        if (submission?.file_url) {
          updatePayload.annotations_data = annotations;
        }

        let { error: subError } = await supabase
          .from('submissions')
          .update(updatePayload)
          .eq('id', submissionId);
          
        if (subError) {
          console.warn("First submissions update attempt failed, retrying with fallback payload:", subError);
          // Fallback: remove component_scores (if column not created yet) and set overall_grade to numeric totalMark
          const fallbackPayload: any = {
            status: 'graded',
            overall_feedback: overallFeedback,
            overall_grade: marksData?.totalMark || null,
            updated_at: new Date().toISOString()
          };

          if (submission?.file_url) {
            fallbackPayload.annotations_data = annotations;
          }

          const { error: retryError } = await supabase
            .from('submissions')
            .update(fallbackPayload)
            .eq('id', submissionId);
            
          if (retryError) throw retryError;
        }

        // Save structured question scores to database
        if (marksData?.questionScores) {
          const upsertRows = Object.entries(marksData.questionScores).map(([qId, val]: [string, any]) => ({
            submission_id: submissionId,
            question_id: qId,
            score: val.score,
            feedback: val.feedback
          }));
          if (upsertRows.length > 0) {
            const { error: qsError } = await supabase
              .from('student_question_scores')
              .upsert(upsertRows, { onConflict: 'submission_id,question_id' });
            if (qsError) {
              console.error("Error saving student question scores during publish:", qsError);
            }
          }
        }

        // 2. Save annotations for text
        if (!submission?.file_url) {
          await supabase.from('annotations').delete().eq('submission_id', submissionId);
          if (annotations.length > 0) {
            const { error: annError } = await supabase.from('annotations').insert(
              annotations.map((a, idx) => ({
                id: a.id,
                submission_id: a.submission_id,
                tutor_id: currentUserId || a.tutor_id || 'bb4b0f5b-852b-4cbd-8fc2-fb038643742a',
                type: a.type,
                start_offset: a.start_offset,
                end_offset: a.end_offset,
                selected_text: a.selected_text,
                content: a.content,
                marker_number: idx + 1,
              }))
            );
            if (annError) throw annError;
          }
        }

        // 3. update legacy student_assignments or student_deadlines
        if (submission?.assignment_id) {
          const { data: isDeadline } = await supabase
            .from('student_deadlines')
            .select('id')
            .eq('id', submission.assignment_id)
            .maybeSingle();

          if (isDeadline) {
            await supabase
              .from('student_deadlines')
              .update({
                status: 'completed',
                updated_at: new Date().toISOString()
              })
              .eq('id', submission.assignment_id);
          } else {
            await supabase
              .from('student_assignments')
              .update({
                status: 'completed',
                tutor_feedback: overallFeedback,
                grade: marksData?.grade || null,
                total_score: marksData?.totalMark || null,
                component_scores: marksData as any,
                marked_at: new Date().toISOString()
              })
              .eq('id', submission.assignment_id);
          }
        }
      } else {
        // Mock flow updates local storage
        const key = `drmax_submissions_mock-student-id_mock-subject-id`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = parsed.map((item: any) => {
            if (item.id === 'mock-assignment-id-1') {
              return { 
                ...item, 
                status: 'completed', 
                tutor_feedback: overallFeedback, 
                grade: marksData?.grade,
                total_score: marksData?.totalMark,
                component_scores: marksData,
                marked_at: new Date().toISOString() 
              };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(updated));
        }
      }

      toast({ title: 'Success', description: 'Marks published successfully!' });
      router.push('/tutor/assignments'); 
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to publish marks.', variant: 'destructive' });
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);

      if (submissionId !== 'mock-assignment-id-1') {
        // 1. Update the submissions table
        const updatePayload: any = {
          status: 'grading', // Keep in grading status
          overall_feedback: overallFeedback,
          overall_grade: marksData?.grade || null,
          component_scores: marksData as any,
          updated_at: new Date().toISOString()
        };

        if (submission?.file_url) {
          updatePayload.annotations_data = annotations;
        }

        let { error: subError } = await supabase
          .from('submissions')
          .update(updatePayload)
          .eq('id', submissionId);
          
        if (subError) {
          console.warn("First submissions update attempt failed, retrying with fallback payload:", subError);
          const fallbackPayload: any = {
            status: 'grading',
            overall_feedback: overallFeedback,
            overall_grade: marksData?.totalMark || null,
            updated_at: new Date().toISOString()
          };

          if (submission?.file_url) {
            fallbackPayload.annotations_data = annotations;
          }

          const { error: retryError } = await supabase
            .from('submissions')
            .update(fallbackPayload)
            .eq('id', submissionId);
            
          if (retryError) throw retryError;
        }

        // Save structured question scores to database
        if (marksData?.questionScores) {
          const upsertRows = Object.entries(marksData.questionScores).map(([qId, val]: [string, any]) => ({
            submission_id: submissionId,
            question_id: qId,
            score: val.score,
            feedback: val.feedback
          }));
          if (upsertRows.length > 0) {
            const { error: qsError } = await supabase
              .from('student_question_scores')
              .upsert(upsertRows, { onConflict: 'submission_id,question_id' });
            if (qsError) {
              console.error("Error saving student question scores during save draft:", qsError);
            }
          }
        }

        // 2. Save annotations for text
        if (!submission?.file_url) {
          await supabase.from('annotations').delete().eq('submission_id', submissionId);
          if (annotations.length > 0) {
            const { error: annError } = await supabase.from('annotations').insert(
              annotations.map((a, idx) => ({
                id: a.id,
                submission_id: a.submission_id,
                tutor_id: currentUserId || a.tutor_id || 'bb4b0f5b-852b-4cbd-8fc2-fb038643742a',
                type: a.type,
                start_offset: a.start_offset,
                end_offset: a.end_offset,
                selected_text: a.selected_text,
                content: a.content,
                marker_number: idx + 1,
              }))
            );
            if (annError) throw annError;
          }
        }

        // 3. update legacy student_assignments or student_deadlines
        if (submission?.assignment_id) {
          const { data: isDeadline } = await supabase
            .from('student_deadlines')
            .select('id')
            .eq('id', submission.assignment_id)
            .maybeSingle();

          if (!isDeadline) {
            await supabase
              .from('student_assignments')
              .update({
                status: 'grading',
                tutor_feedback: overallFeedback,
                grade: marksData?.grade || null,
                total_score: marksData?.totalMark || null,
                component_scores: marksData as any,
              })
              .eq('id', submission.assignment_id);
          }
        }
      } else {
        // Mock flow updates local storage
        const key = `drmax_submissions_mock-student-id_mock-subject-id`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = parsed.map((item: any) => {
            if (item.id === 'mock-assignment-id-1') {
              return { 
                ...item, 
                status: 'grading', 
                tutor_feedback: overallFeedback, 
                grade: marksData?.grade,
                total_score: marksData?.totalMark,
                component_scores: marksData,
              };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(updated));
        }
      }

      toast({ title: 'Success', description: 'Draft saved successfully!' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to save draft.', variant: 'destructive' });
    } finally {
      setSavingDraft(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <GradingHeader 
        studentName={submission?.profiles?.full_name || 'Student'}
        submissionTitle={submission?.assignmentNumber ? `Assignment ${submission.assignmentNumber}` : 'Assignment'}
        assignmentTopic={submission?.topicTitle}
        subjectName={submission?.subjectNameStr}
        onClose={() => router.push('/tutor/assignments')}
        onSubmit={handlePublishGrades}
        onSaveDraft={handleSaveDraft}
        isLoading={loading}
        isDraftLoading={savingDraft}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel onMarksChange={setMarksData} initialMarks={submission?.component_scores} questions={questions} />
        
        {submission?.file_url ? (
          <div className="flex-1 overflow-hidden border-r">
            <ImageAnnotator
              fileUrl={submission.file_url}
              activeAnnotationId={activeAnnotationId}
              annotations={annotations}
              onAnnotationClick={(id) => setActiveAnnotationId(id)}
              onAddAnnotation={handleAddAnnotation}
              onRemoveAnnotation={handleRemoveAnnotation}
            />
          </div>
        ) : (
          <GradingEditor 
            initialContent={submission?.raw_text || ''} 
            activeAnnotationId={activeAnnotationId}
            annotations={annotations}
            onAnnotationClick={(id) => setActiveAnnotationId(id)}
            onAddAnnotation={handleAddAnnotation}
          />
        )}
        
        <RightPanel 
          activeAnnotationId={activeAnnotationId}
          onCommentClick={(id) => setActiveAnnotationId(id)}
          overallFeedback={overallFeedback}
          onFeedbackChange={setOverallFeedback}
          annotations={annotations}
          onEditAnnotation={handleEditAnnotation}
        />
      </div>
    </div>
  );
}

