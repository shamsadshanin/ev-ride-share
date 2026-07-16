import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

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
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
