'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
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
} from '@/components/ui/chart';
import { studentData } from '@/lib/data';
import { TrendingUp } from 'lucide-react';

const chartData = studentData.progress;
const chartConfig = {
  grade: {
    label: 'Grade',
    color: 'hsl(var(--primary))',
  },
};

export function ProgressOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="text-primary" />
          <span>Progress Overview</span>
        </CardTitle>
        <CardDescription>Your current grades by subject.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: -15, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="subject"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
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
  );
}
