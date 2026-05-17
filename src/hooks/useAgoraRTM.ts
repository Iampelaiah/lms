'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTM from 'agora-rtm-sdk';

// NOTE: We are using the Agora RTM SDK for peer-to-peer signaling in the classroom.
// This handles hand raises, spotlighting, and screen share sync.

interface UseAgoraRTMProps {
  appId: string;
  channelName: string;
  uid: number;
  userName: string;
  token?: string | null;
}

export function useAgoraRTM({ appId, channelName, uid, userName, token }: UseAgoraRTMProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clientRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const isMounted = useRef(true);

  // Store message handlers so they can be dynamically updated without re-subscribing
  const handlersRef = useRef<{
    onSpotlight?: (payload: any) => void;
    onScreenShare?: (payload: any) => void;
    onHandRaise?: (payload: any) => void;
    onClassEnded?: (payload: any) => void;
  }>({});

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      leaveRTM();
    };
  }, []);

  const leaveRTM = async () => {
    try {
      if (channelRef.current) {
        await channelRef.current.leave();
        channelRef.current = null;
      }
      if (clientRef.current) {
        await clientRef.current.logout();
        clientRef.current = null;
      }
      setIsJoined(false);
    } catch (err) {
      console.error('[RTM] Leave error:', err);
    }
  };

  const joinRTM = useCallback(async () => {
    if (!appId || !channelName || !uid || isJoined) return;

    try {
      // 1. Initialize Client
      const client = AgoraRTM.createInstance(appId);
      clientRef.current = client;

      client.on('ConnectionStateChanged', (newState, reason) => {
        console.log(`[RTM] State: ${newState}, Reason: ${reason}`);
      });

      // 2. Login
      await client.login({ uid: String(uid), token: token || undefined });

      // 3. Join Channel
      const channel = client.createChannel(channelName);
      channelRef.current = channel;

      channel.on('ChannelMessage', ({ text }: { text: string }, senderId: string) => {
        try {
          const msg = JSON.parse(text);
          console.log(`[RTM] Msg from ${senderId}:`, msg);
          
          if (msg.event === 'spotlight' && handlersRef.current.onSpotlight) {
            handlersRef.current.onSpotlight(msg.payload);
          } else if (msg.event === 'screen-share' && handlersRef.current.onScreenShare) {
            handlersRef.current.onScreenShare(msg.payload);
          } else if (msg.event === 'hand-raise' && handlersRef.current.onHandRaise) {
            handlersRef.current.onHandRaise(msg.payload);
          } else if (msg.event === 'CLASS_ENDED' && handlersRef.current.onClassEnded) {
            handlersRef.current.onClassEnded(msg.payload);
          }
        } catch (e) {
          console.error('[RTM] Failed to parse message', text, e);
        }
      });

      await channel.join();

      if (isMounted.current) {
        setIsJoined(true);
        setError(null);
      }
    } catch (err: any) {
      console.error('[RTM] Join failed:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to join RTM');
      }
      leaveRTM();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, channelName, uid, token]);

  const sendMessage = useCallback(async (event: string, payload: any) => {
    if (!channelRef.current || !isJoined) return;
    try {
      const text = JSON.stringify({ event, payload, senderName: userName });
      await channelRef.current.sendMessage({ text });
    } catch (err) {
      console.error('[RTM] Send failed:', err);
    }
  }, [isJoined, userName]);

  // Hook to register listeners dynamically without re-creating RTM instance
  const registerListeners = useCallback((handlers: typeof handlersRef.current) => {
    handlersRef.current = handlers;
  }, []);

  return {
    isJoined,
    error,
    joinRTM,
    leaveRTM,
    sendMessage,
    registerListeners
  };
}
