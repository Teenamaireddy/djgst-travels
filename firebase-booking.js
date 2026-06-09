import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("Booking file loaded");
console.log("db =", db);
console.log("addDoc =", addDoc);



export async function saveBookingToFirebase(booking){

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

export async function getBookingsFromFirebase(){

  const bookings = [];

  const querySnapshot = await getDocs(
    collection(db, "bookings")
  );

  querySnapshot.forEach((doc) => {

    bookings.push({
      id: doc.id,
      ...doc.data()
    });

  });

  return bookings;
}

export async function deleteBookingFromFirebase(docId){

  await deleteDoc(
    doc(db, "bookings", docId)
  );
}



window.saveBookingToFirebase = saveBookingToFirebase;
window.getBookingsFromFirebase = getBookingsFromFirebase;
window.deleteBookingFromFirebase = deleteBookingFromFirebase;
