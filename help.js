/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   HELP CENTER
   ---------------------------------------------------------
   Firebase:

       /tickets
       /ticketStatusLookup

   Anonymous users can create tickets.

   Agents can manage tickets.

   Reference format:

       APS-XXXXX
========================================================= */


import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getAuth,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    getDatabase,
    ref,
    update,
    get
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


import {
    helpFirebaseConfig
} from "./firebase-config.js";


/* =========================================================
   FIREBASE
========================================================= */

const app =
    initializeApp(
        helpFirebaseConfig
    );


const auth =
    getAuth(app);


const db =
    getDatabase(app);


/* =========================================================
   ELEMENTS
========================================================= */

const form =
    document.getElementById(
        "helpForm"
    );


const submitBtn =
    document.getElementById(
        "submitBtn"
    );


const formStatus =
    document.getElementById(
        "formStatus"
    );


const submitText =
    document.getElementById(
        "submitText"
    );


const submitLoading =
    document.getElementById(
        "submitLoading"
    );


/* =========================================================
   TRACKER
========================================================= */

const trackerForm =
    document.getElementById(
        "helpTrackerForm"
    );


const trackerInput =
    document.getElementById(
        "trackerReference"
    );


const trackerStatus =
    document.getElementById(
        "trackerStatus"
    );


const trackerResult =
    document.getElementById(
        "trackerResult"
    );


const trackerProgress =
    document.getElementById(
        "trackerProgress"
    );


const trackerProgressText =
    document.getElementById(
        "trackerProgressText"
    );


const trackerStatusText =
    document.getElementById(
        "trackerStatusText"
    );


const trackerUpdated =
    document.getElementById(
        "trackerUpdated"
    );


const trackerNote =
    document.getElementById(
        "trackerNote"
    );


/* =========================================================
   FORM STATUS
========================================================= */

function showFormStatus(
    text,
    type = ""
) {

    if (!formStatus) {

        return;

    }


    formStatus.textContent =
        text;


    formStatus.className =
        `form-status ${type}`.trim();

}


/* =========================================================
   GENERATE REFERENCE ID
========================================================= */

function generateReferenceId() {

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


    let result = "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        result +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

    }


    return `APS-${result}`;

}


/* =========================================================
   UNIQUE REFERENCE
========================================================= */

async function createUniqueReference() {

    for (
        let attempt = 0;
        attempt < 10;
        attempt++
    ) {

        const referenceId =
            generateReferenceId();


        const snap =
            await get(

                ref(
                    db,
                    `ticketStatusLookup/${referenceId}`
                )

            );


        if (!snap.exists()) {

            return referenceId;

        }

    }


    throw new Error(
        "Could not generate a unique help reference ID."
    );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";

    }


    let date;


    if (typeof value === "number") {

        date =
            new Date(value);

    }

    else {

        date =
            new Date(value);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(

        "en-IN",

        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }

    );

}


/* =========================================================
   TRACK HELP REQUEST
========================================================= */

trackerForm?.addEventListener(

    "submit",

    async event => {

        event.preventDefault();


        const referenceId =

            trackerInput
                ?.value
                .trim()
                .toUpperCase() || "";


        /* ---------------------------------------------
           VALIDATE
        --------------------------------------------- */

        if (
            !/^APS-[A-Z0-9]{5}$/
                .test(referenceId)
        ) {

            if (trackerStatus) {

                trackerStatus.textContent =
                    "Enter a valid reference such as APS-A1B2C.";

            }


            trackerResult
                ?.classList
                .add("hidden");


            return;

        }


        if (trackerStatus) {

            trackerStatus.textContent =
                "Checking progress...";

        }


        try {

            const snap =

                await get(

                    ref(

                        db,

                        `ticketStatusLookup/${referenceId}`

                    )

                );


            if (!snap.exists()) {

                if (trackerStatus) {

                    trackerStatus.textContent =
                        "Reference not found. Check the ID and try again.";

                }


                trackerResult
                    ?.classList
                    .add("hidden");


                return;

            }


            const data =
                snap.val() || {};


            const progress =

                Math.max(

                    0,

                    Math.min(

                        100,

                        Number(
                            data.progress || 0
                        )

                    )

                );


            /* -----------------------------------------
               STATUS
            ----------------------------------------- */

            if (trackerStatusText) {

                trackerStatusText.textContent =
                    data.status ||
                    "Waiting for Approval";

            }


            /* -----------------------------------------
               PROGRESS %
            ----------------------------------------- */

            if (trackerProgressText) {

                trackerProgressText.textContent =
                    `${progress}%`;

            }


            /* -----------------------------------------
               PROGRESS BAR
            ----------------------------------------- */

            if (trackerProgress) {

                trackerProgress.style.width =
                    `${progress}%`;

            }


            /* -----------------------------------------
               UPDATED
            ----------------------------------------- */

            if (trackerUpdated) {

                trackerUpdated.textContent =
                    formatDate(
                        data.updatedAt
                    );

            }


            /* -----------------------------------------
               NOTE
            ----------------------------------------- */

            if (trackerNote) {

                trackerNote.textContent =

                    data.statusNote ||

                    "Our team will review your request and contact you soon.";

            }


            trackerResult
                ?.classList
                .remove("hidden");


            if (trackerStatus) {

                trackerStatus.textContent =
                    "";

            }

        }

        catch (error) {

            console.error(
                "Tracker error:",
                error
            );


            if (trackerStatus) {

                trackerStatus.textContent =
                    "Unable to check progress right now.";

            }


            trackerResult
                ?.classList
                .add("hidden");

        }

    }

);


/* =========================================================
   CREATE HELP TICKET
========================================================= */

form?.addEventListener(

    "submit",

    async event => {

        event.preventDefault();


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!form.checkValidity()) {

            form.reportValidity();

            return;

        }


        /* ---------------------------------------------
           BUTTON LOADING
        --------------------------------------------- */

        if (submitBtn) {

            submitBtn.disabled =
                true;

        }


        submitText
            ?.classList
            .add("hidden");


        submitLoading
            ?.classList
            .remove("hidden");


        showFormStatus(
            ""
        );


        try {

            /* -----------------------------------------
               ANONYMOUS AUTH
            ----------------------------------------- */

            if (!auth.currentUser) {

                await signInAnonymously(
                    auth
                );

            }


            /* -----------------------------------------
               REFERENCE ID
            ----------------------------------------- */

            const referenceId =
                await createUniqueReference();


            /* -----------------------------------------
               TICKET KEY
            ----------------------------------------- */

            const ticketKey =

                typeof crypto !== "undefined" &&

                typeof crypto.randomUUID === "function"

                    ?

                    crypto.randomUUID()

                    :

                    `${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2)}`;


            /* -----------------------------------------
               TIME
            ----------------------------------------- */

            const createdAt =
                Date.now();


            /* -----------------------------------------
               FORM VALUES
            ----------------------------------------- */

            const registrationId =

                document
                    .getElementById(
                        "registrationId"
                    )
                    ?.value
                    .trim() || "";


            const name =

                document
                    .getElementById(
                        "name"
                    )
                    ?.value
                    .trim() || "";


            const className =

                document
                    .getElementById(
                        "className"
                    )
                    ?.value || "";


            const section =

                document
                    .getElementById(
                        "section"
                    )
                    ?.value
                    .trim()
                    .toUpperCase() || "";


            const email =

                document
                    .getElementById(
                        "email"
                    )
                    ?.value
                    .trim()
                    .toLowerCase() || "";


            const category =

                document
                    .getElementById(
                        "category"
                    )
                    ?.value ||

                "General";


            const messageRecipient =

                document
                    .getElementById(
                        "messageRecipient"
                    )
                    ?.value ||

                "General Help";


            const subject =

                document
                    .getElementById(
                        "subject"
                    )
                    ?.value
                    .trim() || "";


            const message =

                document
                    .getElementById(
                        "message"
                    )
                    ?.value
                    .trim() || "";


            /* -----------------------------------------
               TICKET
            ----------------------------------------- */

            const ticket = {

                ticketId:
                    ticketKey,

                referenceId:
                    referenceId,

                registrationId:
                    registrationId,

                name:
                    name,

                className:
                    className,

                section:
                    section,

                email:
                    email,

                category:
                    category,

                messageRecipient:
                    messageRecipient,

                subject:
                    subject,

                message:
                    message,

                status:
                    "Waiting for Approval",

                progress:
                    0,

                statusNote:
                    "Our team will review your request and contact you soon.",

                assignedAgentUid:
                    "",

                assignedAgentName:
                    "",

                agentReply:
                    "",

                createdBy:
                    auth.currentUser.uid,

                createdAt:
                    createdAt,

                updatedAt:
                    createdAt

            };


            /* -----------------------------------------
               TRACKING LOOKUP
            ----------------------------------------- */

            const lookup = {

                referenceId:
                    referenceId,

                status:
                    "Waiting for Approval",

                progress:
                    0,

                statusNote:
                    "Our team will review your request and contact you soon.",

                updatedAt:
                    createdAt

            };


            /* -----------------------------------------
               MULTI-PATH UPDATE
            ----------------------------------------- */

            await update(

                ref(db),

                {

                    [`tickets/${ticketKey}`]:
                        ticket,

                    [`ticketStatusLookup/${referenceId}`]:
                        lookup

                }

            );


            /* -----------------------------------------
               SAVE LOCALLY
            ----------------------------------------- */

            sessionStorage.setItem(
                "apsHelpReferenceId",
                referenceId
            );


            sessionStorage.setItem(
                "apsHelpTicketId",
                ticketKey
            );


            /* -----------------------------------------
               THANK YOU PAGE
            ----------------------------------------- */

            window.location.href =

                `help-thankyou.html?reference=${
                    encodeURIComponent(
                        referenceId
                    )
                }`;

        }

        catch (error) {

            console.error(
                "Help ticket error:",
                error
            );


            showFormStatus(

                "Error submitting your request. Please try again.",

                "error"

            );


            if (submitBtn) {

                submitBtn.disabled =
                    false;

            }


            submitText
                ?.classList
                .remove("hidden");


            submitLoading
                ?.classList
                .add("hidden");

        }

    }

);


/* =========================================================
   END
========================================================= */
