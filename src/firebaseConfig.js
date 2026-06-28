// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Para o banco de dados
import { getAuth } from "firebase/auth";           // Para autenticação (se precisar)
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8NaWVWDoYmoasIuqjmpyJ8DEG2QYJ7Go",
  authDomain: "the-spectre-cdce8.firebaseapp.com",
  projectId: "the-spectre-cdce8",
  storageBucket: "the-spectre-cdce8.firebasestorage.app",
  messagingSenderId: "467930221853",
  appId: "1:467930221853:web:089ad44bac22bf969c25f4",
  measurementId: "G-RDTT5CDZRL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);