import { auth } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.validateSignup = async function () {

  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!name || !email || !password) {
    alert("All fields are required.");
    return;
  }

  try {

    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Account created successfully!");

    toggleCard();

  } catch (error) {

    alert(error.message);

  }

};

window.validateLogin = async function () {

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Login successful!");

    window.location.href = "bookingtype.html";

  } catch (error) {

    alert("Invalid email or password");

  }

};
