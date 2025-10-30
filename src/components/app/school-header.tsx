
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

export function SchoolHeader() {
  const [schoolName, setSchoolName] = React.useState("Northwood High School");
  const [schoolMantra, setSchoolMantra] = React.useState("Our mission is to foster a community of lifelong learners and critical thinkers.");
  const [avatarFallback, setAvatarFallback] = React.useState("SH");

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('schoolName');
      const storedMantra = localStorage.getItem('schoolMantra');
      if (storedName) {
        setSchoolName(storedName);
        const fallback = storedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        setAvatarFallback(fallback);
      }
      if (storedMantra) {
        setSchoolMantra(storedMantra);
      }
    }
  }, []);

  return (
    <Card>
      <CardContent className="flex items-center gap-6 p-6">
        <Avatar className="h-24 w-24 border">
          <AvatarImage src="https://picsum.photos/seed/school-logo/100/100" alt="School Logo" data-ai-hint="school logo" />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{schoolName}</h2>
          <p className="text-muted-foreground italic">"{schoolMantra}"</p>
        </div>
      </CardContent>
    </Card>
  );
}
