import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "ev-ride-share",
  appId: "1:165104203417:web:1e7039b01e81316a20ea08",
  apiKey: "AIzaSyBD3akbEK1bEWgU_Jgzh7er6tcw5FFclEI",
  authDomain: "ev-ride-share.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-evride-a3179739-f841-4171-8c70-d14e2005f1b3",
  storageBucket: "ev-ride-share.firebasestorage.app",
  messagingSenderId: "165104203417",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
