import { SchoolHeader } from "@/components/app/school-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, CalendarCheck, Medal, Star } from "lucide-react";

// Mock data based on the image
const student = {
    name: "Alex Johnson",
    grade: 11,
    avatarUrl: "https://picsum.photos/seed/101/100/100",
    avatarHint: "student portrait",
    overallScore: 88,
    attendance: 98,
    courses: 3,
};

const courseProgress = [
    { name: "Mathematics", progress: 90, grade: "A-" },
    { name: "Physics", progress: 82, grade: "B" },
    { name: "History", progress: 88, grade: "B+" },
];

const recentAchievements = [
    { title: "Top Performer in Calculus Quiz", date: "2 days ago", icon: Award },
    { title: "Perfect Attendance for the month", date: "Last week", icon: CalendarCheck },
    { title: "Submitted Science Fair project early", date: "Last week", icon: Medal },
];

function StudentOverviewCard() {
    return (
        <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border">
                    <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint={student.avatarHint} />
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-grow text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{student.name}</h2>
                    <p className="text-muted-foreground">Grade {student.grade}</p>
                </div>
                <div className="flex gap-8 text-center">
                    <div>
                        <p className="text-3xl font-bold text-primary">{student.overallScore}%</p>
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-primary">{student.attendance}%</p>
                        <p className="text-sm text-muted-foreground">Attendance</p>
                    </div>
                     <div>
                        <p className="text-3xl font-bold text-primary">{student.courses}</p>
                        <p className="text-sm text-muted-foreground">Courses</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function CourseProgressCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>An overview of {student.name}'s progress in their courses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {courseProgress.map(course => (
                    <div key={course.name}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{course.name}</span>
                            <span className="text-sm text-muted-foreground">{course.grade} ({course.progress}%)</span>
                        </div>
                        <Progress value={course.progress} />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function RecentAchievementsCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Celebrate {student.name}'s recent milestones!</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {recentAchievements.map((achievement, index) => (
                        <li key={index} className="flex items-center gap-4">
                             <div className="bg-amber-100 p-2 rounded-full">
                                <achievement.icon className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium">{achievement.title}</p>
                                <p className="text-sm text-muted-foreground">{achievement.date}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}


export default function ParentPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
                <p className="text-muted-foreground">Your central hub for monitoring your child's learning journey.</p>
            </div>
            <StudentOverviewCard />
            <div className="grid md:grid-cols-2 gap-6">
                <CourseProgressCard />
                <RecentAchievementsCard />
            </div>
        </div>
    );
}
