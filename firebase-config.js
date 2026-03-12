import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const auth = getAuth(app);
const db = getFirestore(app);

window.auth = auth;
window.db = db;
