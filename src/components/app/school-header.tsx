'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

export function SchoolHeader() {
  const schoolName = "Northwood High School";
  const schoolMantra = "Fostering a community of lifelong learners and critical thinkers.";
  const avatarFallback = "NH";

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="flex items-center gap-6 p-0 pb-6">
        <Avatar className="h-16 w-16 border">
          <AvatarImage src="https://picsum.photos/seed/northwood-logo/100/100" alt="Northwood High School Logo" data-ai-hint="school logo" />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{schoolName}</h2>
          <p className="text-muted-foreground italic text-sm">"{schoolMantra}"</p>
        </div>
      </CardContent>
    </Card>
  );
}