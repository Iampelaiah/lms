'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
import { useUser } from "@/components/providers/user-context";

export function SchoolHeader() {
  const schoolName = "Dr Max online school";
  const schoolMantra = "Empowering minds through digital excellence and personalized learning.";
  const avatarFallback = "DM";
  const { profile } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to class notifications
    const channel = supabase.channel('notifications')
      .on('broadcast', { event: 'class_started' }, (payload) => {
        const { title, meetingId, tutorName } = payload.payload;
        
        toast({
          title: "🚀 Class Started!",
          description: `${tutorName} has started "${title}".`,
          action: (
            <ToastAction 
              altText="Join Now" 
              onClick={() => router.push(`/classroom/${meetingId}?name=${profile?.full_name || 'Student'}&role=student`)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Video className="w-4 h-4 mr-1" />
              Join Now
            </ToastAction>
          ),
          duration: 10000,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, router]);

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="flex items-center gap-6 p-0 pb-6">
        <Avatar className="h-16 w-16 border">
          <AvatarImage src="https://picsum.photos/seed/drmax-logo/100/100" alt="Dr Max online school Logo" data-ai-hint="school logo" />
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
