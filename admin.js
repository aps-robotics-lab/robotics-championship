/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   REGISTRATION SYSTEM
   Firebase Realtime Database
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


    participationType.value =
        teamSize === 1
            ? "Solo"
            : `Team of ${teamSize}`;


    for (
        let i = 2;
        i <= 5;
        i++
    ) {

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

if (
    remarks &&
    characterCount
) {

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

const mobileInput =
    document.getElementById(
        "mobileNumber"
    );


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
   GET EVENTS
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
   VALIDATE EVENTS
========================================================= */

function validateEvents() {

    const selectedEvents =
        getSelectedEvents();


    if (
        selectedEvents.length === 0
    ) {

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
   EVENT VALIDATION LISTENER
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
   GENERATE REGISTRATION ID
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

function value(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


/* =========================================================
   SUBMIT
========================================================= */

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (
            submitBtn.disabled
        ) {

            return;

        }


        formMessage.textContent = "";

        formMessage.className =
            "form-message";


        /* HTML validation */

        if (!form.checkValidity()) {

            form.reportValidity();

            return;

        }


        /* Event validation */

        if (!validateEvents()) {

            return;

        }


        /* Mobile validation */

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


        /* Loading */

        submitBtn.disabled = true;

        submitBtn.classList.add(
            "loading"
        );


        try {


            /* =============================================
               REGISTRATION ID
            ============================================= */

            const registrationId =
                generateRegistrationId();


            /* =============================================
               TEAM SIZE
            ============================================= */

            const teamSize =
                Number(
                    document.querySelector(
                        'input[name="TeamSize"]:checked'
                    )?.value || 1
                );


            /* =============================================
               EVENTS
            ============================================= */

            const selectedEvents =
                getSelectedEvents();


            /* =============================================
               DATA
            ============================================= */

            const registrationData = {

                registrationId:
                    registrationId,

                TeamSize:
                    teamSize,

                ParticipationType:
                    participationType.value,

                StudentName:
                    value(
                        "studentName"
                    ),

                Class:
                    value(
                        "studentClass"
                    ),

                Section:
                    value(
                        "studentSection"
                    ),

                MobileNumber:
                    value(
                        "mobileNumber"
                    ),

                EmailAddress:
                    value(
                        "emailAddress"
                    ),

                TeamName:
                    value(
                        "teamName"
                    ),

                Events:
                    selectedEvents,

                Remarks:
                    value(
                        "remarks"
                    ),

                registrationDate:
                    new Date()
                        .toISOString(),

                createdAt:
                    Date.now()

            };


            /* =============================================
               MEMBERS
            ============================================= */

            for (
                let i = 2;
                i <= 5;
                i++
            ) {

                registrationData[
                    `Member${i}Name`
                ] =
                    value(
                        `member${i}Name`
                    );


                registrationData[
                    `Member${i}Class`
                ] =
                    value(
                        `member${i}Class`
                    );


                registrationData[
                    `Member${i}Section`
                ] =
                    value(
                        `member${i}Section`
                    );

            }


            /* =============================================
               FIREBASE PATH

               KEEP THIS EXACTLY THE SAME
            ============================================= */

            const registrationsRef =
                ref(
                    db,
                    "registrations"
                );


            /* =============================================
               CREATE RECORD
            ============================================= */

            const newRegistrationRef =
                push(
                    registrationsRef
                );


            /* =============================================
               SAVE RECORD
            ============================================= */

            await set(
                newRegistrationRef,
                registrationData
            );


            console.log(
                "Registration saved:",
                registrationData
            );


            /* =============================================
               SUCCESS ID
            ============================================= */

            if (
                successRegistrationId
            ) {

                successRegistrationId
                    .textContent =
                    registrationId;

            }


            /* =============================================
               SUCCESS MESSAGE
            ============================================= */

            formMessage.textContent =
                "Registration submitted successfully.";

            formMessage.classList.add(
                "success"
            );


            /* =============================================
               SUCCESS OVERLAY
            ============================================= */

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

            console.error(
                "Registration error:",
                error
            );


            formMessage.textContent =
                "Registration is currently unavailable. Please contact the organizers.";

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


/* =========================================================
   CONTINUE
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
   ESCAPE
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
   DEBUG
========================================================= */

console.log(
    "APS Robotics Registration System loaded successfully."
);

console.log(
    "Firebase path: /registrations"
);
