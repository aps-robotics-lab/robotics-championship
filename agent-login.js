import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


/* =========================================================
   HELP FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyCVfkLAc5EKDRUoHf4LgVhBFwTNmq2GMI0",

    authDomain:
        "robotics-championship-ab248.firebaseapp.com",

    databaseURL:
        "https://robotics-championship-ab248-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "robotics-championship",

    storageBucket:
        "robotics-championship-ab248.firebasestorage.app",

    messagingSenderId:
        "521981495733",

    appId:
        "1:521981495733:web:ecec2bc677a4450f19f1fc"

};


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* =========================================================
   ONLY THIS USER IS THE AGENT
========================================================= */

const AGENT_UID =
    "HgWiHPRx9gcXZtDTl0pDCpZlokt2";


/* =========================================================
   ELEMENTS
========================================================= */

const form =
    document.getElementById("loginForm");

const email =
    document.getElementById("email");

const password =
    document.getElementById("password");

const message =
    document.getElementById("loginMessage");

const togglePassword =
    document.getElementById("togglePassword");


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

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

        message.textContent =
            "Authenticating...";

        message.className =
            "message";


        try {

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email.value.trim(),
                    password.value
                );


            if (
                credential.user.uid !==
                AGENT_UID
            ) {

                message.textContent =
                    "Access denied.";

                message.className =
                    "message error";

                await auth.signOut();

                return;

            }


            message.textContent =
                "Access granted.";

            message.className =
                "message success";


            setTimeout(
                () => {

                    window.location.href =
                        "agent.html";

                },
                500
            );


        } catch (error) {

            console.error(error);

            message.textContent =
                "Invalid agent credentials.";

            message.className =
                "message error";

        }

    }
);


/* =========================================================
   EXISTING LOGIN
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        if (
            user &&
            user.uid === AGENT_UID
        ) {

            window.location.replace(
                "agent.html"
            );

        }

    }
);
