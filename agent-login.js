/* =========================================================
   AGENT-LOGIN.JS
   APS ROBOTICS CHAMPIONSHIP 2026
   ---------------------------------------------------------
   LOGIN PAGE FOR SUPPORT AGENTS

   Firebase:
       helpFirebaseConfig

   After successful authentication:
       agent.html

   Authorization is finally checked by agent.js
   against:

       /agents/{uid}
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    helpFirebaseConfig
} from "./firebase-config.js";


/* =========================================================
   FIREBASE
========================================================= */

const app = initializeApp(
    helpFirebaseConfig
);

const auth = getAuth(app);


/* =========================================================
   ELEMENTS
========================================================= */

const loadingScreen =
    document.getElementById("loadingScreen");

const loginMain =
    document.getElementById("loginMain");

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginMessage =
    document.getElementById("loginMessage");

const loginBtn =
    document.getElementById("loginBtn");

const togglePassword =
    document.getElementById("togglePassword");

const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type = ""
) {

    if (!loginMessage) {
        console.log(message);
        return;
    }

    loginMessage.textContent =
        message;

    loginMessage.className =
        `login-message ${type}`.trim();

}


/* =========================================================
   LOADING STATE
========================================================= */

function setLoading(
    loading
) {

    if (loginBtn) {

        loginBtn.disabled =
            loading;

        loginBtn.classList.toggle(
            "is-loading",
            loading
        );

    }

}


/* =========================================================
   FIREBASE ERROR
========================================================= */

function friendlyError(
    error
) {

    switch (error?.code) {

        case "auth/invalid-email":

            return "Please enter a valid email address.";

        case "auth/user-disabled":

            return "This account has been disabled.";

        case "auth/user-not-found":

        case "auth/wrong-password":

        case "auth/invalid-credential":

            return "Incorrect email or password.";

        case "auth/too-many-requests":

            return "Too many login attempts. Please wait and try again.";

        case "auth/network-request-failed":

            return "Network error. Check your internet connection.";

        case "auth/operation-not-allowed":

            return "Email/password authentication is not enabled in Firebase.";

        default:

            return error?.message ||
                "Unable to sign in. Please try again.";

    }

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

togglePassword?.addEventListener(
    "click",
    () => {

        if (!loginPassword) {
            return;
        }

        const hidden =
            loginPassword.type === "password";

        loginPassword.type =
            hidden
                ? "text"
                : "password";

        if (togglePassword) {

            togglePassword.innerHTML =
                hidden
                    ? '<i class="fa-solid fa-eye-slash"></i>'
                    : '<i class="fa-solid fa-eye"></i>';

            togglePassword.title =
                hidden
                    ? "Hide password"
                    : "Show password";

        }

    }
);


/* =========================================================
   FORGOT PASSWORD
========================================================= */

forgotPasswordBtn?.addEventListener(
    "click",
    async () => {

        const email =
            loginEmail?.value.trim() || "";

        if (!email) {

            showMessage(
                "Enter your email address first.",
                "error"
            );

            loginEmail?.focus();

            return;

        }

        try {

            showMessage(
                "Sending password reset email...",
                ""
            );

            await sendPasswordResetEmail(
                auth,
                email
            );

            showMessage(
                "Password reset email sent. Check your inbox.",
                "success"
            );

        }

        catch (error) {

            console.error(
                "Password reset error:",
                error
            );

            showMessage(
                friendlyError(error),
                "error"
            );

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

loginForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const email =
            loginEmail?.value.trim() || "";

        const password =
            loginPassword?.value || "";

        if (!email || !password) {

            showMessage(
                "Enter both your email and password.",
                "error"
            );

            return;

        }

        setLoading(true);

        showMessage(
            "Signing in...",
            ""
        );

        try {

            const result =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            console.log(
                "Agent Firebase login successful:",
                result.user.uid
            );

            /*
             * IMPORTANT:
             *
             * We redirect directly here.
             *
             * This means we do NOT depend only on
             * onAuthStateChanged to perform navigation.
             */

            window.location.replace(
                "agent.html"
            );

        }

        catch (error) {

            console.error(
                "Agent login error:",
                error
            );

            setLoading(false);

            showMessage(
                friendlyError(error),
                "error"
            );

        }

    }
);


/* =========================================================
   EXISTING AUTH SESSION
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        console.log(
            "Agent login auth state:",
            user
                ? user.uid
                : "No authenticated user"
        );

        if (user) {

            /*
             * If the agent is already logged in,
             * don't make them login again.
             */

            window.location.replace(
                "agent.html"
            );

            return;

        }

        /*
         * No logged-in user.
         * Show login screen.
         */

        loadingScreen?.classList.add(
            "hidden"
        );

        loginMain?.classList.remove(
            "hidden"
        );

        setLoading(false);

    }
);
