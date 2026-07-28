// firebase-init.js — single source of truth for Firebase config
// Update credentials HERE ONLY. All pages import from this file.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXkbjQ0JhxyXMyHTkQcpUUwzaEriJGyQk",
  authDomain: "converstation-ai.firebaseapp.com",
  projectId: "converstation-ai",
  storageBucket: "converstation-ai.firebasestorage.app",
  messagingSenderId: "999197990",
  appId: "1:999197990:web:a567285970d092ace805e7"
};

export const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
