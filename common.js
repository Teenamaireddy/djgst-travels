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
