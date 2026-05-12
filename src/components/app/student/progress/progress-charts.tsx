'use client';

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Sector,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/components/providers/user-context';
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const chartConfig = {
  grade: {
    label: 'Grade',
    color: 'hsl(var(--primary))',
  },
  progress: {
    label: 'Progress',
    color: 'hsl(var(--accent))',
  }
};

export function ProgressCharts() {
  const { profile } = useUser();
  const [gradeData, setGradeData] = useState<any[]>([]);
  const [assignmentStatusData, setAssignmentStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!profile?.id) return;

      const { data: progressData } = await supabase
        .from('student_progress')
        .select(`
          score,
          completed,
          course:courses (name)
        `)
        .eq('student_id', profile.id);

      if (progressData) {
        // Group by course
        const coursesMap: Record<string, { total: number, count: number, completed: number, notStarted: number }> = {};
        
        progressData.forEach((p: any) => {
          const name = p.course?.name || 'Unknown';
          if (!coursesMap[name]) {
            coursesMap[name] = { total: 0, count: 0, completed: 0, notStarted: 0 };
          }
          if (p.score !== null) {
            coursesMap[name].total += p.score;
            coursesMap[name].count += 1;
          }
          if (p.completed) coursesMap[name].completed += 1;
          else coursesMap[name].notStarted += 1;
        });

        const formattedGrades = Object.entries(coursesMap).map(([name, stats]) => ({
          subject: name,
          grade: stats.count > 0 ? Math.round(stats.total / stats.count) : 0
        }));

        setGradeData(formattedGrades);

        const totalCompleted = progressData.filter((p: any) => p.completed).length;
        const totalPending = progressData.filter((p: any) => !p.completed).length;

        setAssignmentStatusData([
          { status: 'Completed', value: totalCompleted, fill: 'hsl(var(--chart-1))' },
          { status: 'In Progress', value: totalPending, fill: 'hsl(var(--chart-2))' },
          { status: 'Not Started', value: 0, fill: 'hsl(var(--chart-5))' },
        ]);
      }
      setLoading(false);
    };

    fetchProgressData();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Grades by Subject</CardTitle>
          <CardDescription>A comparison of your current grades.</CardDescription>
        </CardHeader>
        <CardContent>
          {gradeData.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="subject" tickLine={false} axisLine={false} />
                  <YAxis />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar dataKey="grade" fill="var(--color-grade)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
              <p>No grade data available.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Assignment Completion</CardTitle>
          <CardDescription>A breakdown of your lesson completion.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
            {assignmentStatusData.some(d => d.value > 0) ? (
              <ChartContainer config={{}} className="min-h-[250px] w-full max-w-sm">
                   <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                      <RechartsTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
                      <Pie data={assignmentStatusData} dataKey="value" nameKey="status" innerRadius={60} />
                      <ChartLegend content={<ChartLegendContent nameKey="status"/>} />
                      </PieChart>
                  </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] w-full text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
                <p>No completion data.</p>
              </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
