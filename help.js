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
   FIREBASE
========================================================= */

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
   AGENT NAV
=========================================================

   IMPORTANT:
   This does NOT give anyone Agent access.

   It is intentionally hidden.

   Actual Agent authorization happens inside
   agent.js using Firebase Authentication.
========================================================= */

const agentNavLink =
    document.getElementById("agentNavLink");

if (agentNavLink) {

    agentNavLink.hidden =
        true;

}


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
        "form-status " + type;

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
   GET VALUE
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   TICKET ID
========================================================= */

function createTicketId() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const random =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return `APS-${year}-${random}`;

}


/* =========================================================
   MESSAGE COUNTER
========================================================= */

function updateMessageCount() {

    if (!message || !messageCount) {
        return;
    }

    messageCount.textContent =
        message.value.length;

}


message?.addEventListener(
    "input",
    updateMessageCount
);


/* =========================================================
   VALIDATION
========================================================= */

function validateForm(data) {

    if (!data.name) {

        return "Please enter your name.";

    }


    if (!data.className) {

        return "Please select your class.";

    }


    if (!data.section) {

        return "Please enter your section.";

    }


    if (!data.email) {

        return "Please enter your email address.";

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            data.email
        )
    ) {

        return "Please enter a valid email address.";

    }


    if (!data.subject) {

        return "Please enter a subject.";

    }


    if (!data.message) {

        return "Please describe your issue.";

    }


    if (
        data.message.length < 5
    ) {

        return "Please provide a little more detail.";

    }


    return "";

}


/* =========================================================
   AUTHENTICATE PUBLIC USER
========================================================= */

async function ensureAnonymousUser() {

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


        if (
            submitBtn &&
            submitBtn.disabled
        ) {

            return;

        }


        const data = {

            registrationId:
                getValue(
                    "registrationId"
                ),

            name:
                getValue(
                    "name"
                ),

            className:
                getValue(
                    "className"
                ),

            section:
                getValue(
                    "section"
                ),

            email:
                getValue(
                    "email"
                ).toLowerCase(),

            category:
                getValue(
                    "category"
                ) || "Other",

            subject:
                getValue(
                    "subject"
                ),

            message:
                getValue(
                    "message"
                )

        };


        /* ================================================
           VALIDATE
        ================================================ */

        const validationError =
            validateForm(data);


        if (validationError) {

            showStatus(
                validationError,
                "error"
            );

            return;

        }


        /* ================================================
           LOADING
        ================================================ */

        if (submitBtn) {

            submitBtn.disabled =
                true;

        }


        submitText?.classList.add(
            "hidden"
        );

        submitLoading?.classList.remove(
            "hidden"
        );


        try {

            /* ============================================
               ANONYMOUS FIREBASE LOGIN
            ============================================ */

            const user =
                await ensureAnonymousUser();


            if (!user) {

                throw new Error(
                    "Unable to authenticate with Firebase."
                );

            }


            /* ============================================
               CREATE TICKET
            ============================================ */

            const ticketsRef =
                ref(
                    db,
                    "tickets"
                );


            const ticketRef =
                push(
                    ticketsRef
                );


            const ticketId =
                createTicketId();


            const ticketData = {

                ticketId:

                    ticketId,


                registrationId:

                    data.registrationId ||
                    "",


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


                priority:

                    "Normal",


                createdAt:

                    serverTimestamp(),


                updatedAt:

                    serverTimestamp(),


                createdBy:

                    user.uid,


                assignedTo:

                    "",


                agentReply:

                    "",


                closedAt:

                    "",


                closedBy:

                    ""

            };


            await set(
                ticketRef,
                ticketData
            );


            /* ============================================
               SAVE LOCALLY
            ============================================ */

            sessionStorage.setItem(
                "apsHelpTicketId",
                ticketId
            );


            sessionStorage.setItem(
                "apsHelpRegistrationId",
                data.registrationId || ""
            );


            /* ============================================
               REDIRECT
            ============================================ */

            window.location.href =
                "sorry.html?ticket=" +
                encodeURIComponent(
                    ticketId
                );

        }

        catch (error) {

            console.error(
                "Firebase support error:",
                error
            );


            let messageText =
                "Unable to submit your request.";


            if (
                error?.code ===
                "PERMISSION_DENIED"
            ) {

                messageText =
                    "Unable to submit your request. Please check Firebase Rules.";

            }

            else if (
                error?.code ===
                "auth/operation-not-allowed"
            ) {

                messageText =
                    "Anonymous sign-in is disabled. Enable Anonymous Authentication in Firebase.";

            }

            else if (
                error?.message
            ) {

                messageText =
                    error.message;

            }


            showStatus(
                messageText,
                "error"
            );

        }


        finally {

            if (submitBtn) {

                submitBtn.disabled =
                    false;

            }


            submitText?.classList.remove(
                "hidden"
            );


            submitLoading?.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   INITIAL
========================================================= */

updateMessageCount();
