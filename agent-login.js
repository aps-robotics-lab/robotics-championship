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
   INITIALIZE FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* =========================================================
   YOUR FIVE ADMIN UIDS
========================================================= */

const ADMIN_UIDS = new Set([

    "crfLkH7qlofZBea5GEwLMEtL92X2",

    "5lBbcuD2BjRdDya7Lo9uRXdBIp92",

    "jd7b5KYmivhYpCJzLyQ005BFmCn2",

    "spzBLVusBfcqCCSmK923QmhmcAN2",

    "1PhsiGhletVZYliDKKKVKV2G9tu2"

]);


/* =========================================================
   ELEMENTS
========================================================= */

const form =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const loginText =
    document.getElementById("loginText");

const loginLoading =
    document.getElementById("loginLoading");

const loginStatus =
    document.getElementById("loginStatus");

const togglePassword =
    document.getElementById("togglePassword");


/* =========================================================
   STATUS
========================================================= */

function showStatus(
    message,
    type = "error"
) {

    loginStatus.textContent =
        message;

    loginStatus.className =
        "login-status " + type;

}


/* =========================================================
   LOADING
========================================================= */

function setLoading(isLoading) {

    if (loginBtn) {

        loginBtn.disabled =
            isLoading;

    }

    if (loginText) {

        loginText.classList.toggle(
            "hidden",
            isLoading
        );

    }

    if (loginLoading) {

        loginLoading.classList.toggle(
            "hidden",
            !isLoading
        );

    }

}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

togglePassword?.addEventListener(
    "click",
    () => {

        if (
            passwordInput.type ===
            "password"
        ) {

            passwordInput.type =
                "text";

            togglePassword.textContent =
                "🙈";

        } else {

            passwordInput.type =
                "password";

            togglePassword.textContent =
                "👁";

        }

    }
);


/* =========================================================
   FIREBASE ERROR MESSAGE
========================================================= */

function firebaseError(error) {

    console.error(
        "Firebase Authentication Error:",
        error
    );


    switch (error.code) {

        case "auth/invalid-credential":

        case "auth/invalid-login-credentials":

            return "Incorrect email or password.";

        case "auth/user-not-found":

            return "No administrator account was found with this email.";

        case "auth/wrong-password":

            return "Incorrect password.";

        case "auth/invalid-email":

            return "Please enter a valid email address.";

        case "auth/too-many-requests":

            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":

            return "Network error. Check your internet connection.";

        case "auth/user-disabled":

            return "This Firebase account has been disabled.";

        case "auth/operation-not-allowed":

            return "Email/Password authentication is disabled in Firebase.";

        default:

            return error.message ||
                "Unable to sign in.";

    }

}


/* =========================================================
   LOGIN
========================================================= */

form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        const password =
            passwordInput.value;


        if (!email) {

            showStatus(
                "Please enter your administrator email."
            );

            return;

        }


        if (!password) {

            showStatus(
                "Please enter your password."
            );

            return;

        }


        setLoading(true);

        showStatus(
            "Connecting to secure Firebase authentication...",
            "success"
        );


        try {

            /*
             * Sign in using Firebase Authentication.
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
                "Authenticated UID:",
                user.uid
            );


            /*
             * Check UID.
             */

            if (
                !ADMIN_UIDS.has(
                    user.uid
                )
            ) {

                await signOut(auth);


                showStatus(
                    "Access denied. This Firebase account is not an administrator.",
                    "error"
                );


                setLoading(false);

                return;

            }


            /*
             * Correct administrator.
             */

            showStatus(
                "Authentication successful. Opening Admin Panel...",
                "success"
            );


            /*
             * Small delay so user sees success.
             */

            setTimeout(
                () => {

                    window.location.replace(
                        "admin.html"
                    );

                },
                500
            );

        }

        catch (error) {

            setLoading(false);

            showStatus(
                firebaseError(error),
                "error"
            );

        }

    }
);


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {
            return;
        }


        /*
         * If already logged in and
         * authorized, go directly to admin.
         */

        if (
            ADMIN_UIDS.has(
                user.uid
            )
        ) {

            window.location.replace(
                "admin.html"
            );

        }

    }
);
