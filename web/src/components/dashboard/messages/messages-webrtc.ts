"use client";

import type { CallType, SignalPayload } from "./messages-types";
import { CURRENT_USER_ID } from "./messages-data";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

type CallCallbacks = {
  onRemoteStream?: (stream: MediaStream) => void;
  onStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: Error) => void;
};

export class WebRTCCallSession {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private pollTimer: number | null = null;
  private lastSignalAt = 0;
  private closed = false;

  constructor(
    private readonly callId: string,
    private readonly isInitiator: boolean,
    private readonly callType: CallType,
    private readonly callbacks: CallCallbacks = {},
  ) {}

  async start() {
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.bindPeerEvents();
    await this.attachLocalMedia();

    if (this.isInitiator) {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      await this.postSignal({ type: "offer", payload: offer, fromUserId: CURRENT_USER_ID });
    }

    this.startPolling();
  }

  async answer() {
    if (!this.pc) {
      await this.start();
      return;
    }
    this.startPolling();
  }

  private bindPeerEvents() {
    if (!this.pc) return;

    this.pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      void this.postSignal({
        type: "ice",
        payload: event.candidate.toJSON(),
        fromUserId: CURRENT_USER_ID,
      });
    };

    this.pc.ontrack = (event) => {
      this.callbacks.onRemoteStream?.(event.streams[0]);
    };

    this.pc.onconnectionstatechange = () => {
      if (!this.pc) return;
      this.callbacks.onStateChange?.(this.pc.connectionState);
      if (this.pc.connectionState === "failed") {
        this.callbacks.onError?.(new Error("Connection failed"));
      }
    };
  }

  private async attachLocalMedia() {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: this.callType === "video",
    };
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    this.localStream.getTracks().forEach((track) => {
      this.pc?.addTrack(track, this.localStream!);
    });
  }

  getLocalStream() {
    return this.localStream;
  }

  toggleMute(muted: boolean) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  toggleVideo(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  private startPolling() {
    if (this.pollTimer) return;
    this.pollTimer = window.setInterval(() => {
      void this.pollSignals();
    }, 900);
  }

  private async pollSignals() {
    if (this.closed) return;
    try {
      const res = await fetch(
        `/api/v1/messages/calls/${this.callId}/signal?since=${this.lastSignalAt}`,
      );
      if (!res.ok) return;
      const json = (await res.json()) as {
        success?: boolean;
        data?: { signals: Array<SignalPayload & { id: string; createdAt: number }> };
      };
      const signals = json.data?.signals ?? [];
      for (const signal of signals) {
        this.lastSignalAt = Math.max(this.lastSignalAt, signal.createdAt);
        if (signal.fromUserId === CURRENT_USER_ID) continue;
        await this.handleRemoteSignal(signal);
      }
    } catch {
      // polling errors are non-fatal during demo calls
    }
  }

  private async handleRemoteSignal(signal: SignalPayload) {
    if (!this.pc) return;

    if (signal.type === "offer" && signal.payload) {
      await this.pc.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      await this.postSignal({ type: "answer", payload: answer, fromUserId: CURRENT_USER_ID });
      return;
    }

    if (signal.type === "answer" && signal.payload) {
      await this.pc.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
      return;
    }

    if (signal.type === "ice" && signal.payload) {
      try {
        await this.pc.addIceCandidate(signal.payload as RTCIceCandidateInit);
      } catch {
        // ignore duplicate ICE candidates
      }
      return;
    }

    if (signal.type === "hangup" || signal.type === "decline") {
      await this.hangup(false);
    }
  }

  private async postSignal(signal: SignalPayload) {
    await fetch(`/api/v1/messages/calls/${this.callId}/signal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signal),
    });
  }

  async hangup(notifyRemote = true) {
    if (this.closed) return;
    this.closed = true;

    if (this.pollTimer) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    if (notifyRemote) {
      await this.postSignal({ type: "hangup", fromUserId: CURRENT_USER_ID });
    }

    this.localStream?.getTracks().forEach((track) => track.stop());
    this.pc?.close();
    this.pc = null;
    this.localStream = null;
  }
}

export async function createCallSession(conversationId: string, callType: CallType) {
  const res = await fetch("/api/v1/messages/calls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, callType }),
  });

  const json = (await res.json()) as {
    success?: boolean;
    data?: { callId: string; isInitiator: boolean };
    error?: string;
  };

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Could not start call");
  }

  return json.data;
}

export async function uploadMessageFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "messages");

  const res = await fetch("/api/v1/upload", { method: "POST", body: formData });
  const json = (await res.json()) as {
    success?: boolean;
    data?: {
      id: string;
      url: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    };
    error?: string;
  };

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Upload failed");
  }

  return {
    id: json.data.id,
    fileName: json.data.fileName,
    fileType: json.data.fileType,
    fileSize: json.data.fileSize,
    url: json.data.url,
  };
}
