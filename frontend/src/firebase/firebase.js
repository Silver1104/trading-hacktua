import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBCnkzMh3VTYkSYNTl-CO7WcP1wNqiplM8",
  authDomain: "trading-hacktua.firebaseapp.com",
  projectId: "trading-hacktua",
  storageBucket: "trading-hacktua.firebasestorage.app",
  messagingSenderId: "494267858273",
  appId: "1:494267858273:web:670d60a141aa6eae1c5920",
  measurementId: "G-1NT3LSW9D9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const analytics = getAnalytics(app);


export { app, auth };
