/* =========================================================
   ADMIN-LOGIN.JS
   APS ROBOTICS CHAMPIONSHIP 2026
   Firebase Project: aps-robotic-champs-2026
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { mainFirebaseConfig, ADMIN_UID } from "./firebase-config.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


/* =========================================================
   FIREBASE CONFIG
   (must match admin.js)
========================================================= */

/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(mainFirebaseConfig);

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
   MESSAGE HELPER
========================================================= */

function showMessage(text, type = "") {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent =
        text;

    loginMessage.className =
        "login-message " + type;

}


/* =========================================================
   FRIENDLY ERROR MESSAGES
========================================================= */

function friendlyError(error) {

    switch (error.code) {

        case "auth/invalid-email":

            return "That email address doesn't look right.";


        case "auth/user-disabled":

            return "This account has been disabled.";


        case "auth/user-not-found":

        case "auth/wrong-password":

        case "auth/invalid-credential":

            return "Incorrect email or password.";


        case "auth/too-many-requests":

            return "Too many attempts. Please wait a moment and try again.";


        case "auth/network-request-failed":

            return "Network error. Check your connection and try again.";


        default:

            return "Unable to sign in. Please try again.";

    }

}


/* =========================================================
   TOGGLE PASSWORD VISIBILITY
========================================================= */

togglePassword?.addEventListener(
    "click",
    () => {

        if (!loginPassword) {
            return;
        }

        const isHidden =
            loginPassword.type === "password";

        loginPassword.type =
            isHidden ? "text" : "password";

        togglePassword.innerHTML =
            isHidden
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';

        togglePassword.title =
            isHidden ? "Hide password" : "Show password";

    }
);


/* =========================================================
   FORGOT PASSWORD
========================================================= */

forgotPasswordBtn?.addEventListener(
    "click",
    async () => {

        const email =
            loginEmail?.value.trim();


        if (!email) {

            showMessage(
                "Enter your email address above, then tap this again.",
                "error"
            );

            loginEmail?.focus();

            return;

        }


        try {

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
   LOGIN SUBMIT
========================================================= */

loginForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            loginEmail?.value.trim();

        const password =
            loginPassword?.value;


        if (!email || !password) {

            showMessage(
                "Enter both your email and password.",
                "error"
            );

            return;

        }


        showMessage(
            "",
            ""
        );


        loginBtn?.classList.add(
            "is-loading"
        );

        if (loginBtn) {

            loginBtn.disabled =
                true;

        }


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            /*
             * onAuthStateChanged below
             * handles the redirect once
             * Firebase confirms the session.
             */

        }

        catch (error) {

            console.error(
                "Sign-in error:",
                error
            );


            showMessage(
                friendlyError(error),
                "error"
            );


            loginBtn?.classList.remove(
                "is-loading"
            );

            if (loginBtn) {

                loginBtn.disabled =
                    false;

            }

        }

    }
);


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(

    auth,

    user => {

        /*
         * Already signed in (or just signed in)
         * — go straight to the dashboard.
         *
         * admin.js independently checks ADMIN_UID
         * and will sign out + bounce back here if
         * this account isn't authorized, so this
         * redirect can't create a login loop.
         */

        if (user) {
            if (ADMIN_UID && !ADMIN_UID.startsWith("REPLACE_") && user.uid === ADMIN_UID) {
                window.location.replace("admin.html");
                return;
            }
            signOut(auth).catch(console.error);
            showMessage("Access denied. This account is not the administrator.", "error");
            return;
        }


        loadingScreen?.classList.add(
            "hidden"
        );

        loginMain?.classList.remove(
            "hidden"
        );

    }

);
