import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { helpFirebaseConfig, AGENT_UID } from "./firebase-config.js";

const app = initializeApp(helpFirebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");

function setMessage(text, type = "") {
    if (!message) return;
    message.textContent = text;
    message.className = `message ${type}`.trim();
}

togglePassword?.addEventListener("click", () => {
    const isPassword = password?.type === "password";
    if (!password) return;
    password.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "🙈" : "👁";
});

form?.addEventListener("submit", async event => {
    event.preventDefault();
    const emailValue = email?.value.trim() || "";
    const passwordValue = password?.value || "";

    if (!emailValue || !passwordValue) {
        setMessage("Enter your email and password.", "error");
        return;
    }

    setMessage("Authenticating...");

    try {
        const credential = await signInWithEmailAndPassword(auth, emailValue, passwordValue);
        const profileSnap = await get(ref(db, `agents/${credential.user.uid}`));
        const profile = profileSnap.exists() ? profileSnap.val() : null;
        const legacyAllowed = credential.user.uid === AGENT_UID;
        if ((!profile || profile.active !== true) && !legacyAllowed) {
            await signOut(auth);
            setMessage("Access denied. This account is not an active support agent.", "error");
            return;
        }
        setMessage(`Welcome ${profile?.name || credential.user.email || "Support Agent"}.`, "success");
        window.location.replace("agent.html");
    } catch (error) {
        console.error("Agent sign-in error:", error);
        setMessage("Invalid agent credentials or Firebase authentication is unavailable.", "error");
    }
});

onAuthStateChanged(auth, async user => {
    if (!user) return;
    try {
        const profileSnap = await get(ref(db, `agents/${user.uid}`));
        const active = profileSnap.exists() && profileSnap.val()?.active === true;
        if (active || user.uid === AGENT_UID) window.location.replace("agent.html");
        else await signOut(auth);
    } catch (error) {
        console.error(error);
    }
});
