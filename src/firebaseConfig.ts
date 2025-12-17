import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: "one-personal-trainer.firebaseapp.com",
  projectId: "one-personal-trainer",
  storageBucket: "one-personal-trainer.firebasestorage.app",
  messagingSenderId: "924417685966",
  appId: "1:924417685966:web:cb18fb1f17d746a27f939f",
  measurementId: "G-76NDHNDN6C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Sign in with Google popup
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    throw error;
  }
}
