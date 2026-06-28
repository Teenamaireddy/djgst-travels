
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Your Firebase configuration
firebase.initializeApp({
  apiKey: "AIzaSyDNtl9Vt16P8DE0g8rk263nifdR4zl7Wnk",
  authDomain: "djgst-travels.firebaseapp.com",
  projectId: "djgst-travels",
  storageBucket: "djgst-travels.firebasestorage.app",
  messagingSenderId: "884837949757",
  appId: "1:884837949757:web:b2eec4cc1e028333f02554"
});

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(function(payload) {
  console.log("Background Message:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon-192.png"
  });
});
