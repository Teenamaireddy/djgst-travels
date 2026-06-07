// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNtl9Vt16P8DE0g8rk263nifdR4zl7Wnk",
  authDomain: "djgst-travels.firebaseapp.com",
  projectId: "djgst-travels",
  storageBucket: "djgst-travels.firebasestorage.app",
  messagingSenderId: "884837949757",
  appId: "1:884837949757:web:b2eec4cc1e028333f02554",
  measurementId: "G-0JLW90GQ1S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
