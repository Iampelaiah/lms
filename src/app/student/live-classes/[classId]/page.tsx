
'use client';

import { liveClasses, users } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Hand, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const attendees = [
    users['user-2'],
    users['user-1'],
    users['user-3'],
    users['user-4'],
    { id: 'user-5', name: 'Liam', avatarUrl: 'https://picsum.photos/seed/105/100/100', avatarHint: 'student portrait' },
    { id: 'user-6', name: 'Olivia', avatarUrl: 'https://picsum.photos/seed/106/100/100', avatarHint: 'student portrait' },
    { id: 'user-7', name: 'Noah', avatarUrl: 'https://picsum.photos/seed/107/100/100', avatarHint: 'student portrait' },
    { id: 'user-8', name: 'Emma', avatarUrl: 'https://picsum.photos/seed/108/100/100', avatarHint: 'student portrait' },
];

const chatMessages = [
    { user: 'Alex Johnson', message: 'Hello Prof. Reed!', time: '10:02 AM' },
    { user: 'Dr. Evelyn Reed', message: "Welcome everyone! We'll start in a moment.", time: '10:03 AM' },
    { user: 'Samantha Blue', message: 'Will this be on the test?', time: '10:15 AM' },
    { user: 'Dr. Evelyn Reed', message: 'Yes, the concepts covered today are crucial for the midterm.', time: '10:16 AM' },
    { user: 'Ben Carter', message: 'Could you please explain the last point again?', time: '10:25 AM' },
];

function ClassChat() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Class Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="space-y-4 pr-4">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className="flex flex-col">
                                <div className="flex items-baseline gap-2">
                                     <span className="font-bold text-sm">{msg.user}</span>
                                     <span className="text-xs text-muted-foreground">{msg.time}</span>
                                </div>
                                <p className="text-sm">{msg.message}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardContent>
                <form className="flex items-center gap-2 pt-4 border-t">
                    <Textarea placeholder="Type a message..." className="min-h-0 h-10" />
                    <Button size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function AttendeeList() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendees ({attendees.length})</CardTitle>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-[200px] lg:h-auto lg:max-h-[calc(100vh-22rem)]">
                    <div className="space-y-4 pr-4">
                        {attendees.map(user => (
                            <div key={user.id} className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.avatarHint} />
                                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{user.name}</span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export default function LiveClassPage({
  params,
}: {
  params: { classId: string };
}) {
  const liveClass = liveClasses.find((c) => c.id === params.classId);
  const [micOn, setMicOn] = React.useState(true);
  const [videoOn, setVideoOn] = React.useState(true);

  if (!liveClass) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{liveClass.title}</h1>
        <p className="text-muted-foreground">
          Live session with Dr. Evelyn Reed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
           <Card className="overflow-hidden">
                <div className="relative aspect-video w-full bg-secondary">
                    <Image src={liveClass.imageUrl} alt={liveClass.title} fill className="object-cover" data-ai-hint={liveClass.imageHint} />
                    <div className="absolute bottom-4 left-4 bg-background/80 p-2 rounded-lg">
                        <p className="font-semibold text-sm">Dr. Evelyn Reed (Host)</p>
                    </div>
                </div>
                <CardContent className="p-4 flex items-center justify-center gap-2 bg-card">
                     <Button variant={micOn ? 'secondary' : 'destructive'} size="icon" onClick={() => setMicOn(!micOn)}>
                        {micOn ? <Mic /> : <MicOff />}
                    </Button>
                     <Button variant={videoOn ? 'secondary' : 'destructive'} size="icon" onClick={() => setVideoOn(!videoOn)}>
                        {videoOn ? <Video /> : <VideoOff />}
                    </Button>
                    <Button variant="secondary" size="icon">
                        <Hand />
                    </Button>
                    <Button variant="destructive" className="ml-auto">Leave</Button>
                </CardContent>
           </Card>
           <div className="block lg:hidden">
            <AttendeeList />
           </div>
           <div className="block lg:hidden h-[600px]">
            <ClassChat />
           </div>
        </div>
        <div className="lg:col-span-1 space-y-6 hidden lg:block">
            <AttendeeList />
            <div className="h-[400px]">
                <ClassChat />
            </div>
        </div>
      </div>

    </div>
  );
}
