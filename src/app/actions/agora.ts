"use server"

import { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } from 'agora-access-token';
import { createClient } from '@/utils/supabase/server';

export async function generateAgoraToken(channelName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    console.error('Agora App ID or Certificate not configured');
    return { error: 'Server misconfiguration' };
  }

  // Set role (Publisher for everyone by default in a class)
  const role = RtcRole.PUBLISHER;
  
  // Expiration time in seconds (e.g. 2 hours)
  const expirationTimeInSeconds = 7200;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    // Generate RTC token for a user with uid 0 (allows Agora to assign a random integer uid)
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      0, // uid 0 means let Agora assign the UID
      role,
      privilegeExpiredTs
    );

    // Generate RTM token using the Supabase user ID as the account string
    const rtmUid = user.id;
    const rtmToken = RtmTokenBuilder.buildToken(
      appId,
      appCertificate,
      rtmUid,
      RtmRole.Rtm_User,
      privilegeExpiredTs
    );

    return { token: rtcToken, rtmToken, rtmUid };
  } catch (err: any) {
    console.error('Error generating Agora token:', err);
    return { error: err.message };
  }
}
