import { db } from "./firebase-config.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.saveBookingToFirebase = async function(data){

  try{

    await addDoc(
      collection(db, "bookings"),
      data
    );

    console.log("Booking Saved");

  }catch(err){

    console.error(err);

  }

}
