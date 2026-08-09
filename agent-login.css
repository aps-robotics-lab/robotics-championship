import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

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


/* =====================================================
   FIREBASE
===================================================== */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* =====================================================
   AGENT UID LIST
=====================================================

   Put ONLY the users who should have Agent access here.

   Do NOT automatically give every Firebase user
   access to the Agent panel.
===================================================== */

const AGENT_UIDS = new Set([

    "crfLkH7qlofZBea5GEwLMEtL92X2",

    "5lBbcuD2BjRdDya7Lo9uRXdBIp92",

    "jd7b5KYmivhYpCJzLyQ005BFmCn2",

    "spzBLVusBfcqCCSmK923QmhmcAN2",

    "1PhsiGhletVZYliDKKKVKV2G9tu2"

]);


/* =====================================================
   ELEMENTS
===================================================== */

const form =
    document.getElementById(
        "agentLoginForm"
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

const loginStatus =
    document.getElementById(
        "loginStatus"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );


/* =====================================================
   STATUS
===================================================== */

function showStatus(
    message,
    type = "error"
) {

    loginStatus.textContent =
        message;

    loginStatus.className =
        "login-status " + type;

}


/* =====================================================
   PASSWORD TOGGLE
===================================================== */

togglePassword?.addEventListener(
    "click",
    () => {

        const isPassword =
            password.type === "password";


        password.type =
            isPassword
                ? "text"
                : "password";


        togglePassword.textContent =
            isPassword
                ? "◉"
                : "◉";

    }
);


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {
            return;
        }


        /*
         * If a previously logged-in account
         * is not an Agent, immediately remove
         * its session.
         */

        if (!AGENT_UIDS.has(user.uid)) {

            signOut(auth);

            showStatus(
                "This account is not authorized for the Agent Portal.",
                "error"
            );

            return;

        }


        /*
         * Already authenticated Agent.
         */

        window.location.href =
            "agent.html";

    }
);


/* =====================================================
   LOGIN
===================================================== */

form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const emailValue =
            email.value
                .trim()
                .toLowerCase();


        const passwordValue =
            password.value;


        if (!emailValue ||
            !passwordValue) {

            showStatus(
                "Please enter your email and password.",
                "error"
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

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    emailValue,
                    passwordValue
                );


            const user =
                credential.user;


            /*
             * Firebase login succeeded,
             * but UID authorization is checked
             * separately.
             */

            if (
                !AGENT_UIDS.has(
                    user.uid
                )
            ) {

                await signOut(auth);

                throw new Error(
                    "This account is not authorized for the Agent Portal."
                );

            }


            showStatus(
                "Authentication successful. Opening Agent Portal...",
                "success"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "agent.html";

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
                        "No account exists with this email.";

                    break;


                case "auth/wrong-password":

                    message =
                        "Incorrect password.";

                    break;


                case "auth/invalid-email":

                    message =
                        "Please enter a valid email address.";

                    break;


                case "auth/too-many-requests":

                    message =
                        "Too many attempts. Please try again later.";

                    break;


                default:

                    message =
                        error.message ||
                        message;

            }


            showStatus(
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
