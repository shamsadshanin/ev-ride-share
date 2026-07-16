import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";

// Initialize Firebase Admin with lazy check for credentials
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  if (!getApps().length) {
    initializeApp();
  }
  db = getFirestore();
  auth = getAuth();
  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", firebase: !!db });
  });

  // Example API route for fetching user data
  app.get("/api/users/:uid", async (req, res) => {
    if (!db) return res.status(500).json({ error: "Database not initialized" });
    try {
      const userDoc = await db.collection('users').doc(req.params.uid).get();
      if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
      res.json(userDoc.data());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  let httpServer: HttpServer;
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    httpServer = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    httpServer = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  // --- WebRTC signaling server (ride call feature) ---
  // Clients join a room = rideId and relay SDP offers/answers + ICE candidates
  // to the other peer in the same room. This is a pure relay; no media passes
  // through the server (peer-to-peer via WebRTC).
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  type Room = Map<string, WebSocket>;
  const rooms = new Map<string, Room>();

  function send(ws: WebSocket, payload: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  wss.on("connection", (ws) => {
    let roomId: string | null = null;
    let peerId: string | null = null;

    ws.on("message", (raw) => {
      let msg: any;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (msg.type === "join") {
        roomId = msg.rideId;
        peerId = msg.from;
        if (!rooms.has(roomId)) rooms.set(roomId, new Map());
        rooms.get(roomId)!.set(peerId, ws);
        // notify the other peer (if any) that we joined
        rooms.get(roomId)!.forEach((peer, id) => {
          if (id !== peerId) send(peer, { type: "peer-joined", from: peerId });
        });
        return;
      }

      if (msg.type === "leave") {
        if (roomId && peerId && rooms.has(roomId)) {
          const room = rooms.get(roomId)!;
          room.delete(peerId);
          room.forEach((peer) => send(peer, { type: "peer-left", from: peerId }));
          if (room.size === 0) rooms.delete(roomId);
        }
        return;
      }

      // relay offer / answer / ice / hangup to the target peer
      if (roomId && msg.to) {
        const room = rooms.get(roomId);
        const target = room?.get(msg.to);
        if (target) send(target, { ...msg, from: peerId });
      }
    });

    ws.on("close", () => {
      if (roomId && peerId && rooms.has(roomId)) {
        const room = rooms.get(roomId)!;
        room.delete(peerId);
        room.forEach((peer) => send(peer, { type: "peer-left", from: peerId }));
        if (room.size === 0) rooms.delete(roomId);
      }
    });
  });

  console.log("WebSocket signaling server running on ws://localhost:" + PORT + "/ws");
}

startServer();
