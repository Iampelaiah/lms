import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Award, Clock, Activity, CheckCircle2, Zap, Target
} from 'lucide-react';

interface StudentProfileDashboardProps {
  student: any;
  progressData: any;
  deadlines: any[];
  onAddAssignment?: () => void;
}

export function StudentProfileDashboard({ student, progressData, deadlines, onAddAssignment }: StudentProfileDashboardProps) {
  // Generate mock data for performance over the last 6 months
  const performanceData = useMemo(() => {
    return [
      { month: 'Jan', grade: 75, participation: 60 },
      { month: 'Feb', grade: 78, participation: 70 },
      { month: 'Mar', grade: 82, participation: 85 },
      { month: 'Apr', grade: 80, participation: 80 },
      { month: 'May', grade: 88, participation: 90 },
      { month: 'Jun', grade: 92, participation: 95 },
    ];
  }, []);

  // Mock data for attendance
  const attendanceRate = 94; // Percentage

  // Mock data for strengths and weaknesses
  const strengths = ["Critical Thinking", "Consistent Participation", "Mathematics problem solving"];
  const weaknesses = ["Time Management in exams", "Advanced essay writing"];

  const completedAssignments = progressData?.completed || 0;
  const totalAssignments = progressData?.total || 0;
  const assignmentsPercent = progressData?.percent || 0;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 p-1">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              Current Grade <Award size={16} className="text-[#D4AF37]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">A-</div>
            <p className="text-xs text-green-400 flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" /> +5% from last term
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              Attendance <Clock size={16} className="text-blue-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Excellent punctuality
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              Task Completion <CheckCircle2 size={16} className="text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{assignmentsPercent}%</div>
            <Progress value={assignmentsPercent} className="h-1.5 mt-2 bg-muted [&>div]:bg-[#D4AF37]" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedAssignments} of {totalAssignments} assigned tasks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              Participation <Activity size={16} className="text-purple-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">High</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active in recent discussions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Performance Over Time</CardTitle>
            <CardDescription>Academic grades vs Participation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="grade" stroke="#D4AF37" fillOpacity={1} fill="url(#colorGrade)" name="Academic Grade" />
                  <Area type="monotone" dataKey="participation" stroke="#a855f7" fillOpacity={1} fill="url(#colorPart)" name="Participation" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Insights</CardTitle>
            <CardDescription>Strengths & Weaknesses</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-medium text-green-400 mb-3">
                <Zap size={16} /> Areas of Strength
              </h4>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-green-500/10 p-2 rounded-md border border-green-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="flex items-center gap-2 text-sm font-medium text-red-400 mb-3">
                <Target size={16} /> Areas for Improvement
              </h4>
              <ul className="space-y-2">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-red-500/10 p-2 rounded-md border border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Subjects */}
      <Card className="bg-card border-border shadow-sm mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Recent Participation & Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deadlines.slice(0, 3).map((d, i) => (
              <div key={d.id || i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${d.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {d.status === 'completed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-foreground">{d.title}</h5>
                    <p className="text-xs text-muted-foreground">{d.subjects?.name || 'General Assignment'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={d.status === 'completed' ? 'default' : 'secondary'} className={
                    d.status === 'completed' ? 'bg-green-600' : 
                    d.status === 'pending_admin_review' ? 'bg-purple-500 text-white' : ''
                  }>
                    {d.status === 'completed' ? 'Completed' : 
                     d.status === 'pending_admin_review' ? 'Awaiting Approval' : 'Pending'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(d.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {deadlines.length === 0 && (
              <div className="text-center py-8 flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-background/50">
                <Target size={32} className="text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm mb-4">No recent assignments found.</p>
                {onAddAssignment && (
                  <button 
                    onClick={onAddAssignment}
                    className="flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors px-4 py-2 rounded-lg text-sm font-medium border border-[#D4AF37]/30"
                  >
                    <Target size={16} /> Create Assignment
                  </button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
