'use client';

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

const classPerformanceData = [];

const chartConfig = {
  score: {
    label: 'Avg. Score',
    color: 'hsl(var(--chart-4))',
  },
};

export function ClassPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Performance</CardTitle>
        <CardDescription>Average student scores across your classes.</CardDescription>
      </CardHeader>
      <CardContent>
        {classPerformanceData.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart
                data={classPerformanceData}
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
                  width={100}
                />
                <XAxis type="number" domain={[0, 100]} />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value}%`, 'Avg. Score']}
                      labelClassName="hidden"
                    />
                  }
                />
                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
            <p>No performance data available yet.</p>
            <p className="text-xs mt-1">Data will appear once students start taking assessments.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
