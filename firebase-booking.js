import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.saveBookingToFirebase = async function(booking){

  try {

    await addDoc(
      collection(db, "bookings"),
      booking
    );

    alert("✅ Saved to Firestore");

  } catch(err) {

    alert("❌ Firestore Error: " + err.message);
    console.error(err);

  }

}
