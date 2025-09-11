
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart3, CheckCircle, GraduationCap, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const stats = [
    { title: 'Active Students', value: '10,000+', icon: Users, color: 'text-orange-500' },
    { title: 'Completion Rate', value: '92%', icon: CheckCircle, color: 'text-green-500' },
    { title: 'Pass Rate', value: '98%', icon: GraduationCap, color: 'text-blue-500' },
    { title: 'Courses Available', value: '500+', icon: BarChart3, color: 'text-purple-500' },
];

const chartData = [
    { month: 'January', students: 2400 },
    { month: 'February', students: 3050 },
    { month: 'March', students: 4200 },
    { month: 'April', students: 5800 },
    { month: 'May', students: 7500 },
    { month: 'June', students: 9200 },
];

const passRateData = [
    { subject: 'Literature', passRate: 98 },
    { subject: 'History', passRate: 90 },
    { subject: 'Physics', passRate: 85 },
    { subject: 'Mathematics', passRate: 95 },
];

const areaChartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
};

const barChartConfig = {
    passRate: {
        label: "Pass Rate",
        color: "hsl(var(--chart-1))",
    },
};

export function StatisticsSection() {
    return (
        <div className="space-y-12">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Thousands of Learners</h2>
                <p className="mt-4 text-lg text-muted-foreground">Our platform empowers students to achieve their academic goals.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Platform Growth</CardTitle>
                    <CardDescription>Number of active students over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <ChartContainer config={areaChartConfig} className="min-h-[250px] w-full">
                         <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="month" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickMargin={10}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <YAxis 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickMargin={10}
                                    tickFormatter={(value) => `${value/1000}k`}
                                />
                                <ChartTooltip 
                                    cursor={{stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: '3 3'}}
                                    content={<ChartTooltipContent 
                                        formatter={(value, name) => [`${value.toLocaleString()}`, 'Students']}
                                    />} 
                                />
                                <Area type="monotone" dataKey="students" stroke="hsl(var(--chart-1))" fill="url(#colorStudents)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <CardTitle>Student Pass Rate by Subject</CardTitle>
                    </div>
                    <CardDescription>Average pass rate for students across different subjects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={barChartConfig} className="min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={passRateData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis 
                                    dataKey="subject" 
                                    type="category" 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <XAxis type="number" hide />
                                <ChartTooltip 
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                    content={<ChartTooltipContent 
                                        formatter={(value) => [`${value}%`, 'Pass Rate']}
                                        labelClassName="hidden"
                                    />} 
                                />
                                <Bar dataKey="passRate" fill="hsl(var(--chart-1))" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
