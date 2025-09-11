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
import { studentData } from '@/lib/data';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';

const gradeData = studentData.progress;
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

const progressOverTimeData = [
    { month: 'Jan', grade: 75 },
    { month: 'Feb', grade: 78 },
    { month: 'Mar', grade: 85 },
    { month: 'Apr', grade: 82 },
    { month: 'May', grade: 88 },
];

const assignmentStatusData = [
    { status: 'Completed', value: 42, fill: 'hsl(var(--chart-1))' },
    { status: 'In Progress', value: 15, fill: 'hsl(var(--chart-2))' },
    { status: 'Not Started', value: 8, fill: 'hsl(var(--chart-5))' },
]

export function ProgressCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Grades by Subject</CardTitle>
          <CardDescription>A comparison of your current grades.</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
          <CardDescription>Your average grade trend this semester.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="grade" stroke="var(--color-grade)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Assignment Status</CardTitle>
          <CardDescription>A breakdown of your current assignments.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
            <ChartContainer config={{}} className="min-h-[250px] w-full max-w-sm">
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                    <RechartsTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
                    <Pie data={assignmentStatusData} dataKey="value" nameKey="status" innerRadius={60} />
                    <ChartLegend content={<ChartLegendContent nameKey="status"/>} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
