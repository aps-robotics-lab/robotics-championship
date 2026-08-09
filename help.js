import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
    getAuth,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    push,
    set,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";


/* =========================================================
   FIREBASE
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


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getDatabase(app);


/* =========================================================
   ELEMENTS
========================================================= */

const form =
    document.getElementById("helpForm");

const submitBtn =
    document.getElementById("submitBtn");

const submitText =
    document.getElementById("submitText");

const submitLoading =
    document.getElementById("submitLoading");

const formStatus =
    document.getElementById("formStatus");

const message =
    document.getElementById("message");

const messageCount =
    document.getElementById("messageCount");


/* =========================================================
   STATUS
========================================================= */

function showStatus(
    text,
    type = "error"
) {

    if (!formStatus) {
        return;
    }

    formStatus.textContent =
        text;

    formStatus.className =
        `form-status ${type}`;

}


function clearStatus() {

    if (!formStatus) {
        return;
    }

    formStatus.textContent =
        "";

    formStatus.className =
        "form-status";

}


/* =========================================================
   VALUE
========================================================= */

function value(id) {

    const element =
        document.getElementById(id);

    return String(
        element?.value || ""
    ).trim();

}


/* =========================================================
   MESSAGE COUNTER
========================================================= */

message?.addEventListener(
    "input",
    () => {

        if (messageCount) {

            messageCount.textContent =
                message.value.length;

        }

    }
);


/* =========================================================
   AUTHENTICATE
========================================================= */

async function ensureAuthentication() {

    if (auth.currentUser) {
        return auth.currentUser;
    }

    const credential =
        await signInAnonymously(auth);

    return credential.user;

}


/* =========================================================
   SUBMIT
========================================================= */

form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        clearStatus();


        const data = {

            /*
             * OPTIONAL
             */

            registrationId:
                value("registrationId"),

            /*
             * REQUIRED
             */

            name:
                value("name"),

            className:
                value("className"),

            section:
                value("section"),

            email:
                value("email").toLowerCase(),

            category:
                value("category") || "Other",

            subject:
                value("subject"),

            message:
                value("message")

        };


        /* =================================================
           VALIDATION
        ================================================= */

        if (!data.name) {

            showStatus(
                "Please enter your name."
            );

            return;

        }


        if (!data.className) {

            showStatus(
                "Please select your class."
            );

            return;

        }


        if (!data.section) {

            showStatus(
                "Please enter your section."
            );

            return;

        }


        if (!data.email) {

            showStatus(
                "Please enter your email address."
            );

            return;

        }


        if (!data.subject) {

            showStatus(
                "Please enter a subject."
            );

            return;

        }


        if (!data.message) {

            showStatus(
                "Please describe your issue."
            );

            return;

        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(data.email)
        ) {

            showStatus(
                "Please enter a valid email address."
            );

            return;

        }


        /* =================================================
           LOADING
        ================================================= */

        if (submitBtn) {
            submitBtn.disabled = true;
        }

        submitText?.classList.add("hidden");
        submitLoading?.classList.remove("hidden");


        try {

            /* =============================================
               AUTH
            ============================================= */

            await ensureAuthentication();


            /* =============================================
               CREATE TICKET
            ============================================= */

            const ticketRef =
                push(
                    ref(db, "tickets")
                );


            const ticketId =
                ticketRef.key;


            const ticket = {

                ticketId:

                    ticketId,

                registrationId:

                    data.registrationId || "",

                name:

                    data.name,

                className:

                    data.className,

                section:

                    data.section,

                email:

                    data.email,

                category:

                    data.category,

                subject:

                    data.subject,

                message:

                    data.message,

                status:

                    "Open",

                agentReply:

                    "",

                createdBy:

                    auth.currentUser.uid,

                createdAt:

                    serverTimestamp(),

                updatedAt:

                    serverTimestamp()

            };


            await set(
                ticketRef,
                ticket
            );


            /* =============================================
               SAVE
            ============================================= */

            sessionStorage.setItem(
                "apsHelpTicketId",
                ticketId
            );


            sessionStorage.setItem(
                "apsHelpRegistrationId",
                data.registrationId
            );


            /* =============================================
               SUCCESS
            ============================================= */

            window.location.href =
                `sorry.html?ticket=${encodeURIComponent(ticketId)}`;


        } catch (error) {

            console.error(
                "HELP FIREBASE ERROR:",
                error
            );


            if (
                error.code ===
                "auth/admin-restricted-operation"
            ) {

                showStatus(
                    "Anonymous Authentication is disabled. Enable Anonymous sign-in in Firebase Authentication.",
                    "error"
                );

            }

            else if (
                error.code ===
                "PERMISSION_DENIED"
            ) {

                showStatus(
                    "Firebase denied this ticket submission. Check the tickets Firebase Rules.",
                    "error"
                );

            }

            else {

                showStatus(
                    error.message ||
                    "Unable to submit your request.",
                    "error"
                );

            }


        } finally {

            if (submitBtn) {
                submitBtn.disabled = false;
            }

            submitText?.classList.remove("hidden");
            submitLoading?.classList.add("hidden");

        }

    }
);
