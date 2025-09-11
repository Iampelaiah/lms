import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";

type Topic = {
    name: string;
    progress: number;
}

type SubjectProgressCardProps = {
  subject: {
    name: string;
    overallProgress: number;
    icon: string; // We'll just use BookOpen for now as per the image
    topics: Topic[];
  };
};

export function SubjectProgressCard({ subject }: SubjectProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{subject.name}</CardTitle>
            <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{subject.overallProgress}%</span>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
        </div>
        <p className="text-sm text-muted-foreground">Overall Progress</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={subject.overallProgress} className="h-2" />
        <div className="space-y-2">
            {subject.topics.map(topic => (
                 <div key={topic.name} className="bg-secondary/50 rounded-md p-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{topic.name}</span>
                        <span className="font-semibold">{topic.progress}%</span>
                    </div>
                    <Progress value={topic.progress} className="h-1.5 mt-1" />
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
