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
} from '@/components/ui/chart';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, BarChart3 } from "lucide-react";

const chartConfig = {
  students: {
    label: 'Students',
    color: 'hsl(var(--chart-4))',
  },
};

export function ClassPerformance({ tutorId }: { tutorId?: string }) {
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!tutorId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch courses for this tutor
        const { data: courses, error } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            enrollments (id)
          `)
          .eq('tutor_id', tutorId);

        if (courses && !error) {
          const formatted = courses.map(c => ({
            class: c.title,
            students: c.enrollments?.length || 0
          }));
          setPerformanceData(formatted);
        }
      } catch (err) {
        console.error('Error fetching performance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [tutorId]);

  if (loading) return (
    <Card className="h-full">
        <CardHeader><CardTitle>Class Performance</CardTitle></CardHeader>
        <CardContent className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Enrollment Distribution</CardTitle>
        <CardDescription>Number of students enrolled in each of your courses.</CardDescription>
      </CardHeader>
      <CardContent>
        {performanceData.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart
                data={performanceData}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="class"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={120}
                  className="text-[10px]"
                />
                <XAxis type="number" allowDecimals={false} />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value}`, 'Students']}
                      labelClassName="hidden"
                    />
                  }
                />
                <Bar dataKey="students" fill="var(--color-students)" radius={4} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/5 rounded-xl border border-dashed">
            <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">No courses or enrollments yet.</p>
            <p className="text-xs mt-1 italic">Once you create courses and students enroll, their distribution will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
