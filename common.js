import { messaging, db } from "./firebase-config.js";

import { getToken } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            console.log("✅ Service Worker Registered:", registration);
        } catch (error) {
            console.error("❌ Service Worker Registration Failed:", error);
        }
    });
}

async function enableNotifications() {
    try {

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            alert("Notification permission denied.");
            return;
        }

        console.log("Notification permission granted.");

        const token = await getToken(messaging, {
            vapidKey: "BPU5BIZUcFFi6nKV8xAqbWB0Ue8vsTMopTWBay4OOqHcFvyb6B37h_oxFZH4OeCQqSCpMwdMZp9EM90B3CWwL8g"
        });

        if (token) {

            console.log("FCM Token:", token);

            await setDoc(doc(db, "notificationTokens", token), {
                token: token,
                createdAt: new Date().toISOString()
            });

            console.log("Token saved successfully.");

        } else {
            console.log("No token received.");
        }

    } catch (error) {
        console.error(error);
    }
}

enableNotifications();
