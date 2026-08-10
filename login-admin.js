import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { mainFirebaseConfig, ADMIN_UID } from "./firebase-config.js";

const auth = getAuth(initializeApp(mainFirebaseConfig));
const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    if (message) message.textContent = "Enter your email and password.";
    return;
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    if (credential.user.uid !== ADMIN_UID) {
      await signOut(auth);
      throw new Error("Access denied. This account is not the authorized administrator.");
    }

    location.replace("admin.html");
  } catch (error) {
    console.error(error);
    if (message) message.textContent = error.message || "Login failed.";
  }
});
