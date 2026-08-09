import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

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
   INITIALIZE FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);

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
   VALUE
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
   TICKET ID
========================================================= */

function generateTicketId() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let random =
        "";

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        random +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

    }

    return (
        "APS-" +
        new Date().getFullYear() +
        "-" +
        random
    );

}


/* =========================================================
   CHARACTER COUNT
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
   SUBMIT
========================================================= */

form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        clearStatus();


        /* =================================================
           COLLECT DATA
        ================================================= */

        const data = {

            /*
             * OPTIONAL
             */
            registrationId:
                getValue(
                    "registrationId"
                ),

            /*
             * REQUIRED
             */
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

            /*
             * OPTIONAL
             */
            category:
                getValue(
                    "category"
                ) || "General",

            /*
             * REQUIRED
             */
            subject:
                getValue(
                    "subject"
                ),

            message:
                getValue(
                    "message"
                )

        };


        /* =================================================
           VALIDATION
        ================================================= */

        if (!data.name) {

            showStatus(
                "Please enter your name."
            );

            document
                .getElementById("name")
                ?.focus();

            return;

        }


        if (!data.className) {

            showStatus(
                "Please select your class."
            );

            document
                .getElementById("className")
                ?.focus();

            return;

        }


        if (!data.section) {

            showStatus(
                "Please enter your section."
            );

            document
                .getElementById("section")
                ?.focus();

            return;

        }


        if (!data.email) {

            showStatus(
                "Please enter your email address."
            );

            document
                .getElementById("email")
                ?.focus();

            return;

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                data.email
            )
        ) {

            showStatus(
                "Please enter a valid email address."
            );

            return;

        }


        if (!data.subject) {

            showStatus(
                "Please enter a subject."
            );

            document
                .getElementById("subject")
                ?.focus();

            return;

        }


        if (!data.message) {

            showStatus(
                "Please describe your issue."
            );

            message?.focus();

            return;

        }


        if (
            data.message.length >
            2000
        ) {

            showStatus(
                "Message must be 2000 characters or less."
            );

            return;

        }


        /* =================================================
           LOADING
        ================================================= */

        if (submitBtn) {

            submitBtn.disabled =
                true;

        }


        if (submitText) {

            submitText.classList.add(
                "hidden"
            );

        }


        if (submitLoading) {

            submitLoading.classList.remove(
                "hidden"
            );

        }


        try {

            /* =================================================
               CREATE FIREBASE KEY
            ================================================= */

            const ticketRef =
                push(
                    ref(
                        db,
                        "tickets"
                    )
                );


            /* =================================================
               GENERATE TICKET ID
            ================================================= */

            const ticketId =
                generateTicketId();


            /* =================================================
               SAVE TICKET
            ================================================= */

            await set(
                ticketRef,
                {

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

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


            /* =================================================
               SAVE SESSION
            ================================================= */

            sessionStorage.setItem(
                "apsHelpTicketId",
                ticketId
            );


            sessionStorage.setItem(
                "apsHelpRegistrationId",
                data.registrationId || ""
            );


            /* =================================================
               SUCCESS
            ================================================= */

            window.location.href =
                "sorry.html?ticket=" +
                encodeURIComponent(
                    ticketId
                );

        }


        catch (error) {

            console.error(
                "Firebase Help Error:",
                error
            );


            let message =
                "Unable to submit your request.";


            if (
                error?.code ===
                "PERMISSION_DENIED"
            ) {

                message =
                    "Permission denied. Please check your Firebase Realtime Database Rules.";

            }


            showStatus(
                message,
                "error"
            );

        }


        finally {

            if (submitBtn) {

                submitBtn.disabled =
                    false;

            }


            if (submitText) {

                submitText.classList.remove(
                    "hidden"
                );

            }


            if (submitLoading) {

                submitLoading.classList.add(
                    "hidden"
                );

            }

        }

    }
);
