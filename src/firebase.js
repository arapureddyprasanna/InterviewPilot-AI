// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHg58ClFlpM37raustVUvg6U03jheyEjE",
  authDomain: "interviewpilot-0000.firebaseapp.com",
  projectId: "interviewpilot-0000",
  storageBucket: "interviewpilot-0000.firebasestorage.app",
  messagingSenderId: "191698873216",
  appId: "1:191698873216:web:742e32f2f3a4690161ef65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});