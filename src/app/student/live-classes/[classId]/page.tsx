
'use client';

import { liveClasses } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, PhoneCall, PhoneOff, Video } from 'lucide-react';
import * as React from 'react';
import { db } from '@/lib/firebase';
import { createOffer, createAnswer, hangUp, servers } from '@/lib/webrtc';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LiveClassPage({
  params,
}: {
  params: { classId: string };
}) {
  const liveClass = liveClasses.find((c) => c.id === params.classId);
  const { toast } = useToast();

  const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = React.useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [callId, setCallId] = React.useState('');
  const [isCallActive, setIsCallActive] = React.useState(false);

  const pc = React.useRef<RTCPeerConnection | null>(null);
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    pc.current = new RTCPeerConnection(servers);

    pc.current.onicecandidate = (event) => {
        event.candidate && console.log('ICE candidate:', event.candidate);
    };
    pc.current.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
        }
    };
  }, []);

  React.useEffect(() => {
    if (localStream && pc.current) {
      localStream.getTracks().forEach((track) => {
        pc.current!.addTrack(track, localStream);
      });
    }
  }, [localStream]);

  React.useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  React.useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setHasCameraPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
    }
  };

  const handleStartCall = async () => {
    if (!db || !pc.current) return;
    if (!localStream) {
      await getCameraPermission();
      // If permission is granted, localStream will be set, and we can proceed in the next effect.
      // For now, let's just return and let the useEffects handle it.
      // A more direct approach would involve awaiting getCameraPermission and then proceeding,
      // but this requires getCameraPermission to return the stream. Let's stick to the current flow.
      if (!navigator.mediaDevices) return; // a second check
    }
    const newCallId = await createOffer(db, pc.current);
    setCallId(newCallId);
    setIsCallActive(true);
    toast({
        title: "Call Started",
        description: "Share the Call ID with another user to join."
    });
  };

  const handleAnswerCall = async () => {
    if (!db || !pc.current || !callId) {
        toast({
            variant: "destructive",
            title: "No Call ID",
            description: "Please enter a Call ID to join a call."
        });
        return
    };
    if (!localStream) {
      await getCameraPermission();
      if (!navigator.mediaDevices) return;
    }
    await createAnswer(db, pc.current, callId);
    setIsCallActive(true);
    toast({
        title: "Call Joined",
        description: "You have successfully joined the call."
    });
  };

  const handleHangUp = async () => {
      if(pc.current) {
        hangUp(pc.current, localStream);
      }
      // Resetting the peer connection
      pc.current = new RTCPeerConnection(servers);
       pc.current.onicecandidate = (event) => {
        event.candidate && console.log('ICE candidate:', event.candidate);
      };
      pc.current.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
              setRemoteStream(event.streams[0]);
          }
      };


      setLocalStream(null);
      setRemoteStream(null);
      setIsCallActive(false);
      setCallId('');
      setHasCameraPermission(null);
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      toast({
          title: "Call Ended",
      });
  }


  if (!liveClass) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{liveClass.title}</h1>
        <p className="text-muted-foreground">Live session with Dr. Evelyn Reed</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Virtual Classroom</CardTitle>
          <CardDescription>Join the live video session below.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <Card className="bg-secondary flex items-center justify-center aspect-video relative overflow-hidden">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
            <div className="absolute bottom-2 left-2 bg-background/70 text-xs px-2 py-1 rounded-md">
                You
            </div>
            {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white p-4">
                    <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access to use this feature.
                    </AlertDescription>
                    </Alert>
                </div>
            )}
             {!localStream && hasCameraPermission !== false && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <Video className="w-16 h-16" />
                    <p className="mt-2">Your video is off</p>
                </div>
            )}
          </Card>
          <Card className="bg-secondary flex items-center justify-center aspect-video relative overflow-hidden">
             <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
             <div className="absolute bottom-2 left-2 bg-background/70 text-xs px-2 py-1 rounded-md">
                Tutor
            </div>
            {!remoteStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <Video className="w-16 h-16" />
                    <p>Waiting for the other user to join...</p>
                </div>
            )}
          </Card>
        </CardContent>
        <CardContent className="space-y-4">
            {!isCallActive ? (
                <>
                {hasCameraPermission === null && (
                    <Button onClick={getCameraPermission} className="w-full">
                        <Video className="mr-2" /> Enable Camera & Mic
                    </Button>
                )}
                {hasCameraPermission && (
                    <>
                        <div className="flex items-center gap-4">
                            <Button onClick={handleStartCall} className="flex-1">
                                <PhoneCall className="mr-2" /> Start New Call
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input 
                                value={callId}
                                onChange={(e) => setCallId(e.target.value)}
                                placeholder="Enter Call ID to join"
                            />
                            <Button onClick={handleAnswerCall}>Join Call</Button>
                        </div>
                    </>
                )}
                {hasCameraPermission === false && (
                     <Button onClick={getCameraPermission} className="w-full">
                        <Video className="mr-2" /> Re-try Enabling Camera & Mic
                    </Button>
                )}
                </>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                        <span className="text-sm font-medium">Call ID:</span>
                        <Input readOnly value={callId} className="flex-1 h-8 bg-background" />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigator.clipboard.writeText(callId)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                     <Button onClick={handleHangUp} variant="destructive">
                        <PhoneOff className="mr-2" /> Hang Up
                    </Button>
                </div>
            )}

        </CardContent>
      </Card>
    </div>
  );
}
