import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


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

const charCount =
    document.getElementById("charCount");


/* =========================================================
   HELPERS
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? String(element.value || "").trim()
        : "";

}


function showStatus(
    text,
    type = "error"
) {

    if (!formStatus) return;

    formStatus.textContent =
        text;

    formStatus.className =
        "form-status " + type;

}


function createTicketId() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return `APS-HLP-${year}-${random}`;

}


/* =========================================================
   CHARACTER COUNTER
========================================================= */

message?.addEventListener(
    "input",
    () => {

        if (charCount) {

            charCount.textContent =
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

        showStatus("");


        const registrationId =
            getValue("registrationId");

        const name =
            getValue("name");

        const email =
            getValue("email")
                .toLowerCase();

        const className =
            getValue("className");

        const section =
            getValue("section");

        const category =
            getValue("category") ||
            "Other";

        const subject =
            getValue("subject");

        const messageText =
            getValue("message");


        /* Registration ID is intentionally optional. */

        if (!name) {
            showStatus(
                "Please enter your name."
            );
            return;
        }

        if (!email) {
            showStatus(
                "Please enter your email."
            );
            return;
        }

        if (!className) {
            showStatus(
                "Please select your class."
            );
            return;
        }

        if (!section) {
            showStatus(
                "Please enter your section."
            );
            return;
        }

        if (!subject) {
            showStatus(
                "Please enter a subject."
            );
            return;
        }

        if (!messageText) {
            showStatus(
                "Please describe your issue."
            );
            return;
        }


        const ticketId =
            createTicketId();


        try {

            submitBtn.disabled =
                true;

            submitText.classList.add(
                "hidden"
            );

            submitLoading.classList.remove(
                "hidden"
            );


            const ticketRef =
                ref(
                    db,
                    `tickets/${ticketId}`
                );


            await set(
                ticketRef,
                {

                    ticketId,

                    registrationId:
                        registrationId || "",

                    name,

                    email,

                    className,

                    section,

                    category,

                    subject,

                    message:
                        messageText,

                    status:
                        "Open",

                    agent:
                        "",

                    reply:
                        "",

                    createdAt:
                        Date.now(),

                    updatedAt:
                        Date.now()

                }
            );


            sessionStorage.setItem(
                "apsHelpTicketId",
                ticketId
            );


            sessionStorage.setItem(
                "apsHelpRegistrationId",
                registrationId
            );


            window.location.href =
                "sorry.html?ticket=" +
                encodeURIComponent(ticketId);


        } catch (error) {

            console.error(
                "Firebase ticket error:",
                error
            );

            showStatus(
                "Unable to submit your request. Please check your Firebase Rules and try again.",
                "error"
            );

        } finally {

            submitBtn.disabled =
                false;

            submitText.classList.remove(
                "hidden"
            );

            submitLoading.classList.add(
                "hidden"
            );

        }

    }
);
/* =========================================================
   SECRET AGENT ACCESS
   Tap APS logo 5 times
========================================================= */

const agentNav =
    document.getElementById("agentNav");

/*
 * Change this selector if your logo has
 * a different ID/class.
 */
const apsLogo =
    document.querySelector(
        ".brand img, .logo img, header img"
    );

let logoTapCount = 0;
let logoTapTimer = null;

if (apsLogo) {

    apsLogo.addEventListener(
        "click",
        () => {

            logoTapCount++;

            clearTimeout(logoTapTimer);

            logoTapTimer =
                setTimeout(() => {

                    logoTapCount = 0;

                }, 1500);


            if (logoTapCount >= 5) {

                logoTapCount = 0;

                if (agentNav) {

                    agentNav.classList.add(
                        "show"
                    );

                    sessionStorage.setItem(
                        "apsAgentAccessVisible",
                        "true"
                    );

                }

            }

        }
    );

}


/* =========================================================
   KEEP SECRET BUTTON VISIBLE DURING SESSION
========================================================= */

if (
    sessionStorage.getItem(
        "apsAgentAccessVisible"
    ) === "true"
) {

    agentNav?.classList.add(
        "show"
    );

}
