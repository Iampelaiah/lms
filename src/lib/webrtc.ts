
'use client';

import {
  db,
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
} from './firebase';
import type { Firestore } from 'firebase/firestore';

export const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export async function createOffer(firestore: Firestore, pc: RTCPeerConnection) {
  const callDoc = doc(collection(firestore, 'calls'));
  const offerCandidates = collection(callDoc, 'offerCandidates');
  const answerCandidates = collection(callDoc, 'answerCandidates');

  pc.onicecandidate = (event) => {
    event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
  };

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await updateDoc(callDoc, { offer });

  onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });

  onSnapshot(callDoc, (snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  return callDoc.id;
}

export async function createAnswer(firestore: Firestore, pc: RTCPeerConnection, callId: string) {
  const callDoc = doc(firestore, 'calls', callId);
  const answerCandidates = collection(callDoc, 'offerCandidates'); // Note: This should be answerCandidates but offerCandidates is used in the offer to listen
  const offerCandidates = collection(callDoc, 'answerCandidates'); // Note: This is swapped to send to the right collection

  pc.onicecandidate = (event) => {
    event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
  };

  const callData = (await getDoc(callDoc)).data();
  if (!callData?.offer) {
      throw new Error("Offer not found in call document");
  }

  const offerDescription = new RTCSessionDescription(callData.offer);
  await pc.setRemoteDescription(offerDescription);

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await updateDoc(callDoc, { answer });

  onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
}


export function hangUp(pc: RTCPeerConnection, localStream: MediaStream | null) {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
  if (pc) {
    pc.close();
  }
}
