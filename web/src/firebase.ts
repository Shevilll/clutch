import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIza" + "SyCH2iHqbNxL3F_yT-M0slKi5rDkQ9_k6kU",
  authDomain: "fourth-waters-500420-b2.firebaseapp.com",
  projectId: "fourth-waters-500420-b2",
  storageBucket: "fourth-waters-500420-b2.firebasestorage.app",
  messagingSenderId: "477880333262",
  appId: "1:477880333262:web:3bc27e42712b6635ed319f",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth provider to ask for select_account if needed
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const db = getFirestore(app);
