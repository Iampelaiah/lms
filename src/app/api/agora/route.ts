import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function POST(request: Request) {
  try {
    const { channelName, uid, role = 'publisher' } = await request.json();

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json(
        { error: 'Agora API configuration is missing on the server' },
        { status: 500 }
      );
    }

    if (!channelName) {
      return NextResponse.json(
        { error: 'channelName is required' },
        { status: 400 }
      );
    }

    // Role definition: publisher (host) or subscriber (participant)
    const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    // Token expiration: 1 hour
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Use buildTokenWithUid for integer UIDs
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid || 0, // 0 allows Agora to assign a random UID if needed
      rtcRole,
      privilegeExpiredTs
    );

    return NextResponse.json({
      token,
      appId,
    });
  } catch (error) {
    console.error('Agora Token API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
