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
   INITIALIZE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* =========================================================
   ADMIN UID LIST
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
    document.getElementById(
        "adminLoginForm"
    );

const email =
    document.getElementById(
        "email"
    );

const password =
    document.getElementById(
        "password"
    );

const loginBtn =
    document.getElementById(
        "loginBtn"
    );

const loginText =
    document.getElementById(
        "loginText"
    );

const loginLoading =
    document.getElementById(
        "loginLoading"
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

    loginMessage.textContent =
        message;

    loginMessage.className =
        "login-message " + type;

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

togglePassword?.addEventListener(
    "click",
    () => {

        if (
            password.type ===
            "password"
        ) {

            password.type =
                "text";

            togglePassword.textContent =
                "🙈";

        } else {

            password.type =
                "password";

            togglePassword.textContent =
                "👁";

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
         * If already signed in,
         * verify UID before entering admin.
         */

        if (
            ADMIN_UIDS.has(
                user.uid
            )
        ) {

            window.location.replace(
                "admin.html"
            );

        } else {

            /*
             * User is authenticated
             * but is NOT an admin.
             */

            signOut(auth);

            showMessage(
                "This account is not authorized for the Admin Panel.",
                "error"
            );

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        showMessage("");


        const emailValue =
            email.value
                .trim()
                .toLowerCase();

        const passwordValue =
            password.value;


        if (!emailValue) {

            showMessage(
                "Please enter your administrator email."
            );

            return;

        }


        if (!passwordValue) {

            showMessage(
                "Please enter your password."
            );

            return;

        }


        loginBtn.disabled =
            true;

        loginText.classList.add(
            "hidden"
        );

        loginLoading.classList.remove(
            "hidden"
        );


        try {

            /*
             * Firebase Email/Password login.
             */

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    emailValue,
                    passwordValue
                );


            const user =
                credential.user;


            /*
             * UID authorization.
             *
             * Email alone is NOT enough.
             */

            if (
                !ADMIN_UIDS.has(
                    user.uid
                )
            ) {

                await signOut(auth);

                throw new Error(
                    "This account is not an authorized administrator."
                );

            }


            showMessage(
                "Authentication successful. Opening Admin Panel...",
                "success"
            );


            setTimeout(
                () => {

                    window.location.replace(
                        "admin.html"
                    );

                },
                500
            );


        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );


            let message =
                "Unable to sign in.";


            switch (
                error.code
            ) {

                case
                "auth/invalid-credential":

                    message =
                        "Incorrect email or password.";

                    break;


                case
                "auth/invalid-email":

                    message =
                        "Please enter a valid email address.";

                    break;


                case
                "auth/user-disabled":

                    message =
                        "This administrator account has been disabled.";

                    break;


                case
                "auth/too-many-requests":

                    message =
                        "Too many attempts. Please try again later.";

                    break;


                case
                "auth/network-request-failed":

                    message =
                        "Network error. Check your internet connection.";

                    break;


                case
                "auth/admin-restricted-operation":

                    message =
                        "Email/password authentication is not enabled in Firebase.";

                    break;


                default:

                    message =
                        error.message ||
                        message;

            }


            showMessage(
                message,
                "error"
            );


        } finally {

            loginBtn.disabled =
                false;

            loginText.classList.remove(
                "hidden"
            );

            loginLoading.classList.add(
                "hidden"
            );

        }

    }
);
