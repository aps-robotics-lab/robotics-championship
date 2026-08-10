import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { helpFirebaseConfig } from "./firebase-config.js";

const app = initializeApp(helpFirebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const snapshot = await get(ref(db, `agents/${credential.user.uid}`));

    if (!snapshot.exists() || snapshot.val()?.active === false) {
      await signOut(auth);
      throw new Error("This Firebase account is not registered as an active agent.");
    }

    location.replace("agent.html");
  } catch (error) {
    console.error(error);
    if (message) message.textContent = error.message || "Agent login failed.";
  }
});
