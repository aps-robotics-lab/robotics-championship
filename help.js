import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getDatabase,
    ref,
    push,
    set,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";



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


const database =
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



/* =========================================================
   HELPERS
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



function showStatus(
    message,
    type = "error"
) {

    if (!formStatus) {

        return;

    }


    formStatus.textContent =
        message;


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



function setLoading(loading) {

    if (submitBtn) {

        submitBtn.disabled =
            loading;

    }


    if (submitText) {

        submitText.classList.toggle(
            "hidden",
            loading
        );

    }


    if (submitLoading) {

        submitLoading.classList.toggle(
            "hidden",
            !loading
        );

    }

}



/* =========================================================
   TICKET ID
========================================================= */

function createTicketId(firebaseKey) {

    const cleanKey =
        String(firebaseKey || "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();


    const uniquePart =
        cleanKey
        .slice(-8)
        .padStart(8, "0");


    return (
        "APS-HLP-2026-" +
        uniquePart
    );

}



/* =========================================================
   FORM SUBMIT
========================================================= */

form?.addEventListener(
    "submit",

    async function(event) {

        event.preventDefault();

        clearStatus();


        const data = {

            /*
             * OPTIONAL
             */

            registrationId:
                getValue("registrationId"),


            name:
                getValue("name"),


            className:
                getValue("className"),


            section:
                getValue("section"),


            email:
                getValue("email")
                .toLowerCase(),


            category:
                getValue("category"),


            subject:
                getValue("subject"),


            message:
                getValue("message")

        };



        /* =============================================
           VALIDATION
        ============================================= */

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


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(data.email)
        ) {

            showStatus(
                "Please enter a valid email address."
            );

            return;

        }


        if (!data.category) {

            showStatus(
                "Please select an issue category."
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


        /* =============================================
           CREATE TICKET
        ============================================= */

        setLoading(true);


        try {

            const ticketsRef =
                ref(
                    database,
                    "tickets"
                );


            const newTicketRef =
                push(ticketsRef);


            const ticketId =
                createTicketId(
                    newTicketRef.key
                );


            const ticketData = {

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


                agent:
                    "",


                reply:
                    "",


                createdAt:
                    serverTimestamp(),


                updatedAt:
                    serverTimestamp()

            };


            await set(
                newTicketRef,
                ticketData
            );


            /* =========================================
               SAVE LOCAL INFORMATION
            ========================================= */

            sessionStorage.setItem(
                "apsHelpTicketId",
                ticketId
            );


            sessionStorage.setItem(
                "apsHelpTicketKey",
                newTicketRef.key
            );


            /* =========================================
               REDIRECT
            ========================================= */

            window.location.href =
                "sorry.html?ticket=" +
                encodeURIComponent(ticketId);


        } catch (error) {

            console.error(
                "Ticket creation error:",
                error
            );


            if (
                error.code ===
                "PERMISSION_DENIED"
            ) {

                showStatus(
                    "Permission denied. Please check your Firebase Realtime Database Rules."
                );

            } else {

                showStatus(
                    "Unable to submit your support request. Please try again."
                );

            }

        } finally {

            setLoading(false);

        }

    }
);
