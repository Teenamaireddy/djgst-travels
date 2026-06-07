import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNtl9Vt16P8DE0g8rk263nifdR4zl7Wnk",
  authDomain: "djgst-travels.firebaseapp.com",
  projectId: "djgst-travels",
  storageBucket: "djgst-travels.firebasestorage.app",
  messagingSenderId: "884837949757",
  appId: "1:884837949757:web:b2eec4cc1e028333f02554",
  measurementId: "G-0JLW90GQ1S"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("Firebase Connected Successfully!");
