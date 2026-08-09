/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   REGISTRATION SYSTEM
   Firebase Realtime Database
   + EmailJS Confirmation Email

   IMPORTANT:
   Firebase remains the PRIMARY registration system.
   EmailJS only sends the confirmation email AFTER
   Firebase successfully stores the registration.
========================================================= */


/* =========================================================
   FIREBASE
========================================================= */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set
} from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =========================================================
   EMAILJS
========================================================= */

import emailjs from
    "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";


/* =========================================================
   FIREBASE CONFIGURATION
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",

    authDomain:
        "aps-robotics-championship.firebaseapp.com",

    databaseURL:
        "https://aps-robotics-championship-default-rtdb.firebaseio.com",

    projectId:
        "aps-robotics-championship",

    storageBucket:
        "aps-robotics-championship.firebasestorage.app",

    messagingSenderId:
        "1063542904891",

    appId:
        "1:1063542904891:web:82ff9bb3fba0b87384a41e"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const db =
    getDatabase(app);


/* =========================================================
   EMAILJS CONFIGURATION
========================================================= */

const EMAILJS_SERVICE_ID =
    "service_5m4uzhb";

const EMAILJS_TEMPLATE_ID =
    "template_5qb8b2p";

const EMAILJS_PUBLIC_KEY =
    "GnxniZ70ndujyjDpe";


/* =========================================================
   INITIALIZE EMAILJS
========================================================= */

emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
});


/* =========================================================
   DOM ELEMENTS
========================================================= */

const form =
    document.getElementById(
        "registrationForm"
    );

const submitBtn =
    document.getElementById(
        "submitBtn"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );

const successOverlay =
    document.getElementById(
        "successOverlay"
    );

const successRegistrationId =
    document.getElementById(
        "successRegistrationId"
    );

const continueBtn =
    document.getElementById(
        "continueBtn"
    );

const eventError =
    document.getElementById(
        "eventError"
    );

const participationType =
    document.getElementById(
        "participationType"
    );

const memberInstruction =
    document.getElementById(
        "memberInstruction"
    );

const remarks =
    document.getElementById(
        "remarks"
    );

const characterCount =
    document.getElementById(
        "characterCount"
    );

const mobileInput =
    document.getElementById(
        "mobileNumber"
    );


/* =========================================================
   TEAM SIZE
========================================================= */

const teamSizeInputs =
    document.querySelectorAll(
        'input[name="TeamSize"]'
    );


teamSizeInputs.forEach(input => {

    input.addEventListener(
        "change",
        updateTeamMembers
    );

});


function updateTeamMembers() {

    const selected =
        document.querySelector(
            'input[name="TeamSize"]:checked'
        );

    if (!selected) return;

    const teamSize =
        Number(selected.value);


    /* Participation type */

    participationType.value =
        teamSize === 1
            ? "Solo"
            : `Team of ${teamSize}`;


    /* Show / hide member cards */

    for (let i = 2; i <= 5; i++) {

        const card =
            document.querySelector(
                `[data-member-card="${i}"]`
            );

        if (!card) continue;


        if (i <= teamSize) {

            card.classList.remove(
                "hidden-member"
            );

        } else {

            card.classList.add(
                "hidden-member"
            );

        }

    }


    /* Instruction */

    if (teamSize === 1) {

        memberInstruction.textContent =
            "Solo participation selected. No additional members required.";

    } else {

        memberInstruction.textContent =
            `Team of ${teamSize} selected. Please enter details for ${teamSize - 1} additional participant(s).`;

    }

}


/* =========================================================
   INITIAL TEAM STATE
========================================================= */

updateTeamMembers();


/* =========================================================
   REMARKS CHARACTER COUNT
========================================================= */

if (remarks && characterCount) {

    remarks.addEventListener(
        "input",
        () => {

            characterCount.textContent =
                remarks.value.length;

        }
    );

}


/* =========================================================
   MOBILE NUMBER
========================================================= */

if (mobileInput) {

    mobileInput.addEventListener(
        "input",
        () => {

            mobileInput.value =
                mobileInput.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

        }
    );

}


/* =========================================================
   SECTION INPUT
========================================================= */

document
    .querySelectorAll(
        'input[id$="Section"]'
    )
    .forEach(input => {

        input.addEventListener(
            "input",
            () => {

                input.value =
                    input.value
                        .toUpperCase()
                        .replace(/\s/g, "");

            }
        );

    });


/* =========================================================
   GET SELECTED EVENTS
========================================================= */

function getSelectedEvents() {

    return Array.from(
        document.querySelectorAll(
            'input[name="Events"]:checked'
        )
    ).map(
        input => input.value
    );

}


/* =========================================================
   EVENT VALIDATION
========================================================= */

function validateEvents() {

    const selectedEvents =
        getSelectedEvents();


    if (selectedEvents.length === 0) {

        if (eventError) {

            eventError.textContent =
                "Please select at least one event.";

        }

        return false;

    }


    if (eventError) {

        eventError.textContent = "";

    }


    return true;

}


/* =========================================================
   EVENT ERROR CLEAR
========================================================= */

document
    .querySelectorAll(
        'input[name="Events"]'
    )
    .forEach(input => {

        input.addEventListener(
            "change",
            validateEvents
        );

    });


/* =========================================================
   REGISTRATION ID
========================================================= */

function generateRegistrationId() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return `APSRC-${year}-${random}`;

}


/* =========================================================
   HELPER
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


/* =========================================================
   SEND CONFIRMATION EMAIL
=========================================================

   IMPORTANT:

   This function is called ONLY after Firebase
   successfully saves the registration.

   If EmailJS fails, the registration remains
   safely stored in Firebase.
========================================================= */

async function sendConfirmationEmail(
    registrationData
) {

    const templateParams = {

        /* Recipient */

        to_email:
            registrationData.EmailAddress,

        email:
            registrationData.EmailAddress,


        /* Registration */

        registration_id:
            registrationData.registrationId,

        registrationId:
            registrationData.registrationId,


        /* Team */

        student_name:
            registrationData.StudentName,

        StudentName:
            registrationData.StudentName,

        team_name:
            registrationData.TeamName ||
            "Not specified",

        TeamName:
            registrationData.TeamName ||
            "Not specified",

        team_size:
            registrationData.TeamSize,

        TeamSize:
            registrationData.TeamSize,

        participation_type:
            registrationData.ParticipationType,


        /* School information */

        class:
            registrationData.Class,

        section:
            registrationData.Section,


        /* Contact */

        mobile:
            registrationData.MobileNumber,

        mobile_number:
            registrationData.MobileNumber,


        /* Events */

        events:
            registrationData.Events.join(", "),

        Events:
            registrationData.Events.join(", "),


        /* Remarks */

        remarks:
            registrationData.Remarks ||
            "None",

        Remarks:
            registrationData.Remarks ||
            "None",


        /* Date */

        registration_date:
            new Date(
                registrationData.registrationDate
            ).toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            )

    };


    console.log(
        "Sending confirmation email...",
        templateParams
    );


    const response =
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );


    console.log(
        "EmailJS success:",
        response
    );


    return response;

}


/* =========================================================
   FORM SUBMISSION
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* ---------------------------------------------
               PREVENT DOUBLE SUBMISSION
            --------------------------------------------- */

            if (submitBtn.disabled) {

                return;

            }


            /* ---------------------------------------------
               CLEAR OLD MESSAGE
            --------------------------------------------- */

            formMessage.textContent = "";

            formMessage.className =
                "form-message";


            /* ---------------------------------------------
               HTML VALIDATION
            --------------------------------------------- */

            if (!form.checkValidity()) {

                form.reportValidity();

                return;

            }


            /* ---------------------------------------------
               EVENT VALIDATION
            --------------------------------------------- */

            if (!validateEvents()) {

                return;

            }


            /* ---------------------------------------------
               MOBILE VALIDATION
            --------------------------------------------- */

            const mobile =
                mobileInput.value.trim();


            if (
                !/^[6-9]\d{9}$/.test(
                    mobile
                )
            ) {

                formMessage.textContent =
                    "Please enter a valid 10-digit mobile number.";

                formMessage.classList.add(
                    "error"
                );

                mobileInput.focus();

                return;

            }


            /* ---------------------------------------------
               START LOADING
            --------------------------------------------- */

            submitBtn.disabled =
                true;

            submitBtn.classList.add(
                "loading"
            );


            try {

                /* =========================================
                   GENERATE REGISTRATION ID
                ========================================= */

                const registrationId =
                    generateRegistrationId();


                /* =========================================
                   TEAM SIZE
                ========================================= */

                const teamSize =
                    Number(
                        document.querySelector(
                            'input[name="TeamSize"]:checked'
                        )?.value || 1
                    );


                /* =========================================
                   EVENTS
                ========================================= */

                const selectedEvents =
                    getSelectedEvents();


                /* =========================================
                   REGISTRATION DATA
                ========================================= */

                const registrationData = {

                    registrationId:
                        registrationId,


                    TeamSize:
                        teamSize,


                    ParticipationType:
                        participationType.value,


                    StudentName:
                        getValue(
                            "studentName"
                        ),


                    Class:
                        getValue(
                            "studentClass"
                        ),


                    Section:
                        getValue(
                            "studentSection"
                        ),


                    MobileNumber:
                        getValue(
                            "mobileNumber"
                        ),


                    EmailAddress:
                        getValue(
                            "emailAddress"
                        ),


                    TeamName:
                        getValue(
                            "teamName"
                        ),


                    Events:
                        selectedEvents,


                    Remarks:
                        getValue(
                            "remarks"
                        ),


                    registrationDate:
                        new Date().toISOString(),


                    createdAt:
                        Date.now()

                };


                /* =========================================
                   MEMBER INFORMATION
                ========================================= */

                for (
                    let i = 2;
                    i <= 5;
                    i++
                ) {

                    registrationData[
                        `Member${i}Name`
                    ] =
                        getValue(
                            `member${i}Name`
                        );


                    registrationData[
                        `Member${i}Class`
                    ] =
                        getValue(
                            `member${i}Class`
                        );


                    registrationData[
                        `Member${i}Section`
                    ] =
                        getValue(
                            `member${i}Section`
                        );

                }


                /* =========================================
                   FIREBASE LOCATION

                   DO NOT CHANGE THIS.

                   Your admin panel reads:

                   registrations
                ========================================= */

                const registrationsRef =
                    ref(
                        db,
                        "registrations"
                    );


                /* =========================================
                   CREATE FIREBASE RECORD
                ========================================= */

                const newRegistrationRef =
                    push(
                        registrationsRef
                    );


                /* =========================================
                   SAVE TO FIREBASE FIRST

                   This keeps your existing admin
                   panel completely compatible.
                ========================================= */

                await set(
                    newRegistrationRef,
                    registrationData
                );


                console.log(
                    "Registration saved to Firebase:",
                    registrationData
                );


                /* =========================================
                   SEND EMAILJS CONFIRMATION

                   IMPORTANT:

                   Email failure DOES NOT delete or
                   invalidate the Firebase registration.
                ========================================= */

                let emailSent = false;


                try {

                    await sendConfirmationEmail(
                        registrationData
                    );

                    emailSent = true;


                } catch (emailError) {

                    console.error(
                        "EmailJS error:",
                        emailError
                    );

                    /*
                       DO NOT throw this error.

                       Firebase registration has already
                       succeeded.
                    */

                    emailSent = false;

                }


                /* =========================================
                   SHOW REGISTRATION ID
                ========================================= */

                if (
                    successRegistrationId
                ) {

                    successRegistrationId
                        .textContent =
                        registrationId;

                }


                /* =========================================
                   SUCCESS MESSAGE
                ========================================= */

                if (emailSent) {

                    formMessage.textContent =
                        "Registration submitted successfully. A confirmation email has been sent to your email address.";

                } else {

                    formMessage.textContent =
                        "Registration submitted successfully. Your registration has been saved, but the confirmation email could not be sent.";

                }


                formMessage.classList.add(
                    "success"
                );


                /* =========================================
                   SUCCESS OVERLAY
                ========================================= */

                if (
                    successOverlay
                ) {

                    successOverlay
                        .classList
                        .remove(
                            "hidden"
                        );

                }


            } catch (error) {

                /* =========================================
                   FIREBASE ERROR

                   This is ONLY reached if Firebase
                   itself failed.
                ========================================= */

                console.error(
                    "Firebase registration error:",
                    error
                );


                formMessage.textContent =
                    "Registration could not be submitted. Please check your internet connection and try again.";

                formMessage.classList.add(
                    "error"
                );


            } finally {

                submitBtn.disabled =
                    false;

                submitBtn.classList.remove(
                    "loading"
                );

            }

        }
    );

}


/* =========================================================
   CONTINUE BUTTON
========================================================= */

if (continueBtn) {

    continueBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "thankyou.html";

        }
    );

}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            successOverlay
        ) {

            successOverlay.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   DEBUG INFORMATION
========================================================= */

console.log(
    "APS Robotics Registration System loaded."
);

console.log(
    "Firebase path: /registrations"
);

console.log(
    "EmailJS enabled."
);
