/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   AGENT LOGIN
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyCVfkLAc5EKDRUoHf4LgVhBFwTNmq2GMI0",

    authDomain:
        "robotics-championship-ab248.firebaseapp.com",

    databaseURL:
        "https://robotics-championship-ab248-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "robotics-championship-ab248",

    storageBucket:
        "robotics-championship-ab248.firebasestorage.app",

    messagingSenderId:
        "521981495733",

    appId:
        "1:521981495733:web:ecec2bc677a4450f19f1fc",

    measurementId:
        "G-NTBPB3MJ0E"

};


/* =========================================================
   ONLY AUTHORIZED AGENT UID
========================================================= */

const AGENT_UID =
    "HgWiHPRx9gcXZtDTl0pDCpZlokt2";


/* =========================================================
   INITIALIZE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* =========================================================
   ELEMENTS
========================================================= */

const form =
    document.getElementById(
        "agentLoginForm"
    );

const emailInput =
    document.getElementById(
        "agentEmail"
    );

const passwordInput =
    document.getElementById(
        "agentPassword"
    );

const loginBtn =
    document.getElementById(
        "loginBtn"
    );

const loginBtnText =
    document.getElementById(
        "loginBtnText"
    );

const loginLoader =
    document.getElementById(
        "loginLoader"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type = "error"
) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent =
        message;

    loginMessage.className =
        `login-message ${type}`;

}


/* =========================================================
   LOADING
========================================================= */

function setLoading(
    loading
) {

    if (!loginBtn) {
        return;
    }

    loginBtn.disabled =
        loading;


    if (loginBtnText) {

        loginBtnText.textContent =
            loading
                ? "AUTHENTICATING..."
                : "ACCESS AGENT PANEL";

    }


    if (loginLoader) {

        loginLoader.classList.toggle(
            "hidden",
            !loading
        );

    }

}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

togglePassword?.addEventListener(
    "click",
    () => {

        const isPassword =
            passwordInput.type ===
            "password";


        passwordInput.type =
            isPassword
                ? "text"
                : "password";


        togglePassword.textContent =
            isPassword
                ? "🙈"
                : "👁";

    }
);


/* =========================================================
   LOGIN
========================================================= */

form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            showMessage(
                "Enter your agent email and password."
            );

            return;

        }


        setLoading(true);

        showMessage(
            "Verifying agent credentials...",
            ""
        );


        try {

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            /*
             * VERY IMPORTANT:
             *
             * Authentication succeeded,
             * but the UID must also match
             * the authorized Agent UID.
             */

            if (
                user.uid !==
                AGENT_UID
            ) {

                await signOut(auth);


                showMessage(
                    "Access denied. This account is not authorized as an agent."
                );


                setLoading(false);

                return;

            }


            showMessage(
                "✓ Agent verified. Opening dashboard...",
                "success"
            );


            /*
             * Small delay so the user
             * can see the success message.
             */

            setTimeout(
                () => {

                    window.location.replace(
                        "agent.html"
                    );

                },
                500
            );


        } catch (error) {

            console.error(
                "Agent login error:",
                error
            );


            let message =
                "Unable to sign in.";


            switch (
                error.code
            ) {

                case "auth/invalid-credential":

                    message =
                        "Incorrect email or password.";

                    break;


                case "auth/user-not-found":

                    message =
                        "Agent account not found.";

                    break;


                case "auth/wrong-password":

                    message =
                        "Incorrect password.";

                    break;


                case "auth/too-many-requests":

                    message =
                        "Too many attempts. Please try again later.";

                    break;


                case "auth/network-request-failed":

                    message =
                        "Network error. Check your internet connection.";

                    break;


                case "auth/user-disabled":

                    message =
                        "This account has been disabled.";

                    break;


                default:

                    message =
                        error.message ||
                        "Login failed.";

            }


            showMessage(
                message
            );


            setLoading(false);

        }

    }
);


/* =========================================================
   CHECK EXISTING SESSION
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {
            return;
        }


        /*
         * If an authenticated account is already
         * logged in, only allow the exact Agent UID.
         */

        if (
            user.uid ===
            AGENT_UID
        ) {

            window.location.replace(
                "agent.html"
            );

            return;

        }


        /*
         * Someone else is logged in.
         * Sign them out so they cannot access
         * the agent dashboard.
         */

        signOut(auth).catch(
            console.error
        );

    }
);
