import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export function SchoolHeader() {
  return (
    <Card>
      <CardContent className="flex items-center gap-6 p-6">
        <Avatar className="h-24 w-24 border">
          <AvatarImage src="https://picsum.photos/seed/school-logo/100/100" alt="School Logo" data-ai-hint="school logo" />
          <AvatarFallback>SH</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">Northwood High School</h2>
          <p className="text-muted-foreground italic">"Our mission is to foster a community of lifelong learners and critical thinkers."</p>
        </div>
      </CardContent>
    </Card>
  );
}
