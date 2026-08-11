/* =========================================================
   AGENT-LOGIN.JS
   APS ROBOTICS CHAMPIONSHIP 2026
   ---------------------------------------------------------
   Firebase Project:
       APS Robotics Championship 2026

   Firebase config:
       helpFirebaseConfig

   LOGIN PAGE:
       agent-login.html

   DASHBOARD:
       agent.html

   IMPORTANT:
       Firebase Rules are NOT changed by this file.
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
    getDatabase,
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


import {
    helpFirebaseConfig
} from "./firebase-config.js";


/* =========================================================
   FIREBASE INITIALIZATION
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


/*
 * Supports both:
 *
 *     loginEmail
 *
 * and:
 *
 *     email
 */

const loginEmail =
    document.getElementById(
        "loginEmail"
    ) ||
    document.getElementById(
        "email"
    );


/*
 * Supports both:
 *
 *     loginPassword
 *
 * and:
 *
 *     password
 */

const loginPassword =
    document.getElementById(
        "loginPassword"
    ) ||
    document.getElementById(
        "password"
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


const forgotPasswordBtn =
    document.getElementById(
        "forgotPasswordBtn"
    );


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "========================================"
);

console.log(
    "APS AGENT LOGIN INITIALIZED"
);

console.log(
    "loginForm:",
    !!loginForm
);

console.log(
    "loginEmail:",
    !!loginEmail
);

console.log(
    "loginPassword:",
    !!loginPassword
);

console.log(
    "loginBtn:",
    !!loginBtn
);

console.log(
    "Firebase Auth:",
    !!auth
);

console.log(
    "Firebase Database:",
    !!db
);

console.log(
    "========================================"
);


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    text,
    type = ""
) {

    if (!loginMessage) {

        console.log(
            "LOGIN MESSAGE:",
            text
        );

        return;

    }


    loginMessage.textContent =
        text;


    loginMessage.className =
        `login-message ${type}`.trim();

}


/* =========================================================
   LOADING
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


    if (loading) {

        loginBtn?.setAttribute(
            "aria-busy",
            "true"
        );

    }

    else {

        loginBtn?.removeAttribute(
            "aria-busy"
        );

    }

}


/* =========================================================
   SHOW LOGIN PAGE
========================================================= */

function showLoginPage() {

    loadingScreen?.classList.add(
        "hidden"
    );


    loginMain?.classList.remove(
        "hidden"
    );


    setLoading(
        false
    );

}


/* =========================================================
   FRIENDLY FIREBASE ERRORS
========================================================= */

function friendlyError(
    error
) {

    console.error(
        "Firebase error:",
        error
    );


    switch (
        error?.code
    ) {

        case "auth/invalid-email":

            return (
                "Please enter a valid email address."
            );


        case "auth/user-disabled":

            return (
                "This account has been disabled."
            );


        case "auth/user-not-found":

        case "auth/wrong-password":

        case "auth/invalid-credential":

            return (
                "Incorrect email or password."
            );


        case "auth/too-many-requests":

            return (
                "Too many login attempts. Please wait and try again."
            );


        case "auth/network-request-failed":

            return (
                "Network error. Check your internet connection."
            );


        case "auth/operation-not-allowed":

            return (
                "Email/password authentication is not enabled in Firebase."
            );


        case "auth/invalid-api-key":

            return (
                "Firebase configuration is invalid."
            );


        case "auth/app-not-authorized":

            return (
                "This website is not authorized in Firebase."
            );


        default:

            return (
                error?.message ||
                "Unable to sign in. Please try again."
            );

    }

}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

togglePassword?.addEventListener(
    "click",
    () => {

        if (!loginPassword) {

            return;

        }


        const isPassword =
            loginPassword.type === "password";


        loginPassword.type =
            isPassword
                ? "text"
                : "password";


        if (togglePassword) {

            togglePassword.innerHTML =
                isPassword
                    ? '<i class="fa-solid fa-eye-slash"></i>'
                    : '<i class="fa-solid fa-eye"></i>';


            togglePassword.title =
                isPassword
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
            loginEmail?.value
                ?.trim() ||
            "";


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
                friendlyError(
                    error
                ),
                "error"
            );

        }

    }
);


/* =========================================================
   CHECK AGENT
   ---------------------------------------------------------
   IMPORTANT:

   We do NOT change Firebase Rules.

   We simply read:

       /agents/{uid}

   Your Rules allow an authenticated user
   to read their own UID.

   Supported structures:

       UID: true

   OR:

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

        const agentReference =
            ref(
                db,
                `agents/${user.uid}`
            );


        const snapshot =
            await get(
                agentReference
            );


        if (
            !snapshot.exists()
        ) {

            console.warn(
                "No agent record found for UID:",
                user.uid
            );


            return false;

        }


        const value =
            snapshot.val();


        /*
         * Current structure:
         *
         * agents:
         *   UID:
         *     true
         */

        if (
            value === true
        ) {

            return true;

        }


        /*
         * Future structure:
         *
         * agents:
         *   UID:
         *     active: true
         */

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
   LOGIN FORM
========================================================= */

loginForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        console.log(
            "LOGIN FORM SUBMITTED"
        );


        const email =
            loginEmail?.value
                ?.trim() ||
            "";


        const password =
            loginPassword?.value ||
            "";


        console.log(
            "Email field found:",
            !!loginEmail
        );


        console.log(
            "Password field found:",
            !!loginPassword
        );


        console.log(
            "Email entered:",
            email
                ? "YES"
                : "NO"
        );


        console.log(
            "Password entered:",
            password
                ? "YES"
                : "NO"
        );


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

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


        /* ---------------------------------------------
           START LOGIN
        --------------------------------------------- */

        setLoading(
            true
        );


        showMessage(
            "Signing in...",
            ""
        );


        try {

            /*
             * Firebase Email/Password Login
             */

            const result =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                result.user;


            console.log(
                "========================================"
            );


            console.log(
                "FIREBASE LOGIN SUCCESS"
            );


            console.log(
                "UID:",
                user.uid
            );


            console.log(
                "EMAIL:",
                user.email
            );


            console.log(
                "========================================"
            );


            /*
             * Check whether this Firebase account
             * is actually registered as an agent.
             */

            showMessage(
                "Checking agent access...",
                ""
            );


            const authorized =
                await checkAgent(
                    user
                );


            if (!authorized) {

                console.error(
                    "USER IS NOT AN AUTHORIZED AGENT:",
                    user.uid
                );


                await signOut(
                    auth
                );


                setLoading(
                    false
                );


                showMessage(
                    "Access denied. This account is not an authorized support agent.",
                    "error"
                );


                return;

            }


            /*
             * Agent is authorized.
             *
             * NOW redirect to dashboard.
             */

            console.log(
                "AUTHORIZED AGENT"
            );


            console.log(
                "Redirecting to agent.html..."
            );


            showMessage(
                "Login successful. Opening Agent Dashboard...",
                "success"
            );


            /*
             * Small delay so the user can see
             * the success message.
             */

            setTimeout(
                () => {

                    window.location.replace(
                        "./agent.html"
                    );

                },
                300
            );

        }

        catch (error) {

            console.error(
                "========================================"
            );


            console.error(
                "AGENT LOGIN FAILED"
            );


            console.error(
                error
            );


            console.error(
                "CODE:",
                error?.code
            );


            console.error(
                "MESSAGE:",
                error?.message
            );


            console.error(
                "========================================"
            );


            setLoading(
                false
            );


            showMessage(
                friendlyError(
                    error
                ),
                "error"
            );

        }

    }
);


/* =========================================================
   AUTH STATE
   ---------------------------------------------------------
   This handles the case where the agent is already
   logged in before opening agent-login.html.
========================================================= */

let authStateHandled =
    false;


onAuthStateChanged(
    auth,
    async user => {

        console.log(
            "AUTH STATE:",
            user
                ? user.uid
                : "SIGNED OUT"
        );


        /*
         * No user
         */

        if (!user) {

            authStateHandled =
                false;


            showLoginPage();


            return;

        }


        /*
         * User exists.
         *
         * Check agent authorization.
         */

        if (
            authStateHandled
        ) {

            return;

        }


        authStateHandled =
            true;


        try {

            console.log(
                "Checking existing agent session..."
            );


            const authorized =
                await checkAgent(
                    user
                );


            if (!authorized) {

                console.warn(
                    "Existing Firebase session is not an authorized agent."
                );


                await signOut(
                    auth
                );


                authStateHandled =
                    false;


                showLoginPage();


                showMessage(
                    "Access denied. This account is not an authorized support agent.",
                    "error"
                );


                return;

            }


            /*
             * Already authenticated AND authorized.
             */

            console.log(
                "Existing authorized agent session found."
            );


            window.location.replace(
                "./agent.html"
            );

        }

        catch (error) {

            console.error(
                "Existing session check failed:",
                error
            );


            authStateHandled =
                false;


            showLoginPage();


            showMessage(
                "Unable to verify agent access.",
                "error"
            );

        }

    }
);
