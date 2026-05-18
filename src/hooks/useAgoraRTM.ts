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
      if (clientRef.current) {
        if (isJoined) {
          try {
            await clientRef.current.unsubscribe(channelName);
          } catch (err) {
            console.error('[RTM] Unsubscribe error:', err);
          }
        }
        try {
          await clientRef.current.logout();
        } catch (err) {
          console.error('[RTM] Logout error:', err);
        }
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
      // 1. Initialize RTM Client
      const client = new AgoraRTM.RTM(appId, String(uid), {
        token: token || undefined,
      });
      clientRef.current = client;

      client.addEventListener('status', (event: any) => {
        console.log(`[RTM] Status:`, event);
      });

      // 2. Register Message event listener
      client.addEventListener('message', (event: any) => {
        if (event.channelName === channelName) {
          try {
            const msg = JSON.parse(event.message);
            console.log(`[RTM] Msg from ${event.publisherId}:`, msg);
            
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
            console.error('[RTM] Failed to parse message', event.message, e);
          }
        }
      });

      // 3. Login
      await client.login();

      // 4. Subscribe to the classroom channel
      await client.subscribe(channelName);

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
    if (!clientRef.current || !isJoined) return;
    try {
      const text = JSON.stringify({ event, payload, senderName: userName });
      await clientRef.current.publish(channelName, text);
    } catch (err) {
      console.error('[RTM] Send failed:', err);
    }
  }, [isJoined, channelName, userName]);

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
