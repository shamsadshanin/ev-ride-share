import { useCallback, useEffect, useRef, useState } from "react";

export type CallStatus = "idle" | "calling" | "ringing" | "connected";

interface UseWebRTCOptions {
  rideId: string | null;
  selfId: string | undefined;
  peerId: string | undefined; // the other participant's uid
  peerName?: string;
}

export function useWebRTC({ rideId, selfId, peerId, peerName }: UseWebRTCOptions) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: "leave", rideId, from: selfId }));
      } catch {}
      wsRef.current.close();
    }
    wsRef.current = null;
    pendingCandidates.current = [];
  }, [rideId, selfId]);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "ice", rideId, from: selfId, to: peerId, candidate: e.candidate })
        );
      }
    };

    pc.ontrack = (e) => {
      const [stream] = e.streams;
      remoteStreamRef.current = stream;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setStatus("connected");
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        endCall();
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
    }

    pcRef.current = pc;
    return pc;
  }, [rideId, selfId, peerId]);

  const ensureSignal = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        resolve(wsRef.current);
        return;
      }
      const proto = location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${location.host}/ws`);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "join", rideId, from: selfId }));
        wsRef.current = ws;
        resolve(ws);
      };
      ws.onerror = () => reject(new Error("Signaling connection failed"));
      ws.onmessage = async (ev) => {
        let msg: any;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }

        if (msg.type === "peer-left") {
          endCall();
          return;
        }

        if (msg.type === "offer" && msg.from === peerId) {
          try {
            if (!localStreamRef.current) {
              localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            const pc = createPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            for (const c of pendingCandidates.current) {
              try { await pc.addIceCandidate(c); } catch {}
            }
            pendingCandidates.current = [];
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(
              JSON.stringify({ type: "answer", rideId, from: selfId, to: peerId, sdp: answer })
            );
            setStatus("connected");
          } catch (err: any) {
            setError(err?.message || "Failed to answer call");
          }
          return;
        }

        if (msg.type === "answer" && msg.from === peerId) {
          try {
            await pcRef.current?.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            for (const c of pendingCandidates.current) {
              try { await pcRef.current?.addIceCandidate(c); } catch {}
            }
            pendingCandidates.current = [];
          } catch (err: any) {
            setError(err?.message || "Failed to complete call");
          }
          return;
        }

        if (msg.type === "ice" && msg.from === peerId) {
          const cand = new RTCIceCandidate(msg.candidate);
          if (pcRef.current && pcRef.current.remoteDescription) {
            try { await pcRef.current.addIceCandidate(cand); } catch {}
          } else {
            pendingCandidates.current.push(msg.candidate);
          }
          return;
        }

        if (msg.type === "hangup" && msg.from === peerId) {
          endCall();
        }
      };
    });
  }, [rideId, selfId, peerId, createPeerConnection]);

  const startCall = useCallback(async () => {
    if (!rideId || !peerId || !selfId) return;
    setError(null);
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ws = await ensureSignal();
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify({ type: "offer", rideId, from: selfId, to: peerId, sdp: offer }));
      setStatus("calling");
    } catch (err: any) {
      setError(err?.message || "Microphone access denied");
      cleanup();
      setStatus("idle");
    }
  }, [rideId, peerId, selfId, ensureSignal, createPeerConnection, cleanup]);

  const endCall = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && rideId && selfId && peerId) {
      try {
        wsRef.current.send(JSON.stringify({ type: "hangup", rideId, from: selfId, to: peerId }));
      } catch {}
    }
    cleanup();
    setStatus("idle");
    setMuted(false);
  }, [rideId, selfId, peerId, cleanup]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !muted;
    stream.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  }, [muted]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    status,
    muted,
    error,
    remoteAudioRef,
    peerName,
    startCall,
    endCall,
    toggleMute,
  };
}
