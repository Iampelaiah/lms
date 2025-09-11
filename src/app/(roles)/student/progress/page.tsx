import { ProgressCharts } from "@/components/app/student/progress/progress-charts";

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
        <p className="text-muted-foreground">
          Visualize your academic performance and track your growth.
        </p>
      </div>
      <ProgressCharts />
    </div>
  );
}
