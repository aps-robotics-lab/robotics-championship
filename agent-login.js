/* =========================================================
   AGENT-LOGIN.JS
   APS ROBOTICS CHAMPIONSHIP 2026
   AGENT HELP CENTER

   FIREBASE DATABASE STRUCTURE:

   /agents
       UID: true

   /tickets
   /ticketStatusLookup

   IMPORTANT:
   DO NOT CHANGE FIREBASE RULES FOR THIS FILE.
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

import {
    helpFirebaseConfig
} from "./firebase-config.js";


/* =========================================================
   FIREBASE
========================================================= */

const app =
    initializeApp(
        helpFirebaseConfig
    );

const auth =
    getAuth(
        app
    );

const db =
    getDatabase(
        app
    );


/* =========================================================
   ELEMENTS
========================================================= */

const loadingScreen =
    document.getElementById(
        "loadingScreen"
    );

const loginMain =
    document.getElementById(
        "loginMain"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const loginBtn =
    document.getElementById(
        "loginBtn"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(
    message,
    type = ""
) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent =
        message;

    loginMessage.className =
        `login-message ${type}`.trim();

}


/* =========================================================
   SHOW LOGIN SCREEN
========================================================= */

function showLoginScreen() {

    loadingScreen?.classList.add(
        "hidden"
    );

    loginMain?.classList.remove(
        "hidden"
    );

}


/* =========================================================
   SHOW LOADING
========================================================= */

function showLoading() {

    loadingScreen?.classList.remove(
        "hidden"
    );

    loginMain?.classList.add(
        "hidden"
    );

}


/* =========================================================
   FRIENDLY FIREBASE ERRORS
========================================================= */

function friendlyError(
    error
) {

    switch (
        error?.code
    ) {

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


        default:

            return (
                error?.message ||
                "Unable to sign in. Please try again."
            );

    }

}


/* =========================================================
   CHECK AGENT AUTHORIZATION
=========================================================

   YOUR CURRENT DATABASE:

   agents/
       HgWiHPRx9gcXZtDTl0pDCpZlokt2: true

   This function supports:

       UID: true

   and also:

       UID:
           active: true
           name: "Agent"

========================================================= */

async function checkAgent(
    user
) {

    if (!user) {
        return false;
    }

    try {

        const agentRef =
            ref(
                db,
                `agents/${user.uid}`
            );

        const snapshot =
            await get(
                agentRef
            );


        console.log(
            "Agent authorization check:",
            user.uid,
            snapshot.exists(),
            snapshot.exists()
                ? snapshot.val()
                : null
        );


        if (!snapshot.exists()) {

            return false;

        }


        const value =
            snapshot.val();


        /* ---------------------------------------------
           YOUR CURRENT STRUCTURE

               UID: true
        --------------------------------------------- */

        if (
            value === true
        ) {

            return true;

        }


        /* ---------------------------------------------
           OPTIONAL STRUCTURE

               UID:
                   active: true
        --------------------------------------------- */

        if (
            typeof value === "object" &&
            value !== null &&
            value.active === true
        ) {

            return true;

        }


        return false;

    }

    catch (error) {

        console.error(
            "Agent authorization check failed:",
            error
        );

        return false;

    }

}


/* =========================================================
   REDIRECT TO DASHBOARD
========================================================= */

function redirectToDashboard() {

    console.log(
        "Redirecting authorized agent to agent.html..."
    );

    window.location.replace(
        "agent.html"
    );

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
            loginEmail?.value
                ?.trim()
                .toLowerCase() ||
            "";

        const password =
            loginPassword?.value ||
            "";


        if (!email) {

            showMessage(
                "Enter your email address.",
                "error"
            );

            loginEmail?.focus();

            return;

        }


        if (!password) {

            showMessage(
                "Enter your password.",
                "error"
            );

            loginPassword?.focus();

            return;

        }


        try {

            showMessage(
                "Signing in..."
            );


            if (loginBtn) {

                loginBtn.disabled =
                    true;

                loginBtn.classList.add(
                    "is-loading"
                );

            }


            /*
             * Firebase Authentication
             */

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            console.log(
                "Firebase login successful.",
                {
                    uid: user.uid,
                    email: user.email
                }
            );


            /*
             * Check /agents/{uid}
             */

            const authorized =
                await checkAgent(
                    user
                );


            if (!authorized) {

                console.error(
                    "User is authenticated but is NOT an agent:",
                    user.uid
                );


                await signOut(
                    auth
                );


                showMessage(
                    "Access denied. This account is not an authorized support agent.",
                    "error"
                );


                if (loginBtn) {

                    loginBtn.disabled =
                        false;

                    loginBtn.classList.remove(
                        "is-loading"
                    );

                }

                return;

            }


            /*
             * AUTHORIZED
             */

            showMessage(
                "Login successful. Opening Agent Dashboard...",
                "success"
            );


            console.log(
                "AUTHORIZED AGENT:",
                user.uid
            );


            /*
             * Give Firebase a moment to persist
             * the authentication state before redirect.
             */

            setTimeout(
                () => {

                    redirectToDashboard();

                },
                250
            );

        }

        catch (error) {

            console.error(
                "Agent login error:",
                error
            );


            showMessage(
                friendlyError(
                    error
                ),
                "error"
            );


            if (loginBtn) {

                loginBtn.disabled =
                    false;

                loginBtn.classList.remove(
                    "is-loading"
                );

            }

        }

    }
);


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        console.log(
            "Agent login auth state:",
            user
                ? {
                    uid: user.uid,
                    email: user.email
                }
                : "SIGNED OUT"
        );


        /*
         * No user
         */

        if (!user) {

            showLoginScreen();

            return;

        }


        /*
         * User already authenticated.
         * Check whether they are an authorized agent.
         */

        try {

            const authorized =
                await checkAgent(
                    user
                );


            if (authorized) {

                console.log(
                    "Existing authorized agent detected."
                );


                redirectToDashboard();

                return;

            }


            /*
             * Authenticated but not an agent.
             */

            console.log(
                "Authenticated account is not an authorized agent."
            );


            await signOut(
                auth
            );


            showLoginScreen();


            showMessage(
                "Access denied. This account is not an authorized support agent.",
                "error"
            );

        }

        catch (error) {

            console.error(
                "Auth state authorization error:",
                error
            );


            await signOut(
                auth
            ).catch(
                () => {}
            );


            showLoginScreen();


            showMessage(
                "Unable to verify agent access.",
                "error"
            );

        }

    }
);
