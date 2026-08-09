/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   REGISTRATION SYSTEM
   Firebase Realtime Database + EmailJS
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
   FIREBASE CONFIG
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

let app;
let db;

try {

    app = initializeApp(firebaseConfig);
    db = getDatabase(app);

    console.log("Firebase initialized successfully.");

} catch (error) {

    console.error(
        "Firebase initialization failed:",
        error
    );

}


/* =========================================================
   EMAILJS CONFIG
========================================================= */

const EMAILJS_PUBLIC_KEY =
    "GnxniZ70ndujyjDpe";

const EMAILJS_SERVICE_ID =
    "service_5m4uzhb";

const EMAILJS_TEMPLATE_ID =
    "template_5qb8b2p";


/* =========================================================
   LOAD EMAILJS
========================================================= */

const emailScript =
    document.createElement("script");

emailScript.src =
    "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

emailScript.onload = () => {

    try {

        if (window.emailjs) {

            window.emailjs.init({
                publicKey:
                    EMAILJS_PUBLIC_KEY
            });

            console.log(
                "EmailJS initialized successfully."
            );

        }

    } catch (error) {

        console.error(
            "EmailJS initialization error:",
            error
        );

    }

};

emailScript.onerror = () => {

    console.warn(
        "EmailJS could not be loaded. Registration will still work."
    );

};

document.head.appendChild(
    emailScript
);


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

const remarks =
    document.getElementById(
        "remarks"
    );

const characterCount =
    document.getElementById(
        "characterCount"
    );

const participationType =
    document.getElementById(
        "participationType"
    );

const memberInstruction =
    document.getElementById(
        "memberInstruction"
    );


/* =========================================================
   BASIC UTILITY
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return String(element.value || "").trim();

}


/* =========================================================
   GET TEAM SIZE
========================================================= */

function getTeamSize() {

    const selected =
        document.querySelector(
            'input[name="TeamSize"]:checked'
        );

    if (!selected) {
        return 1;
    }

    return Number(selected.value);

}


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
   GENERATE REGISTRATION ID
========================================================= */

function generateRegistrationId() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const random =
        Math.floor(
            10000 +
            Math.random() * 90000
        );

    return `APS-RBC-${year}-${random}`;

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type = "error"
) {

    if (!formMessage) {
        return;
    }

    formMessage.textContent =
        message;

    formMessage.className =
        `form-message ${type}`;

    formMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function clearMessage() {

    if (!formMessage) {
        return;
    }

    formMessage.textContent =
        "";

    formMessage.className =
        "form-message";

}


/* =========================================================
   TEAM MEMBER FIELD HELPERS
========================================================= */

function clearMemberFields(number) {

    const fields = [

        `member${number}Name`,
        `member${number}Class`,
        `member${number}Section`

    ];

    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });

}


/* =========================================================
   UPDATE TEAM SIZE
========================================================= */

function updateTeamSize() {

    const size =
        getTeamSize();


    /*
       PARTICIPATION TYPE
    */

    if (participationType) {

        participationType.value =
            size === 1
                ? "Solo"
                : `Team of ${size}`;

    }


    /*
       INSTRUCTION
    */

    if (memberInstruction) {

        const instructions = {

            1:
                "Solo participation selected. No additional members required.",

            2:
                "Team of 2 selected. Participant 02 details are required.",

            3:
                "Team of 3 selected. Participants 02 and 03 details are required.",

            4:
                "Team of 4 selected. Participants 02, 03 and 04 details are required.",

            5:
                "Team of 5 selected. Participants 02, 03, 04 and 05 details are required."

        };

        memberInstruction.textContent =
            instructions[size];

    }


    /*
       SHOW/HIDE MEMBER CARDS
    */

    document
        .querySelectorAll(
            ".additional-member"
        )
        .forEach(card => {

            const number =
                Number(
                    card.dataset.memberCard
                );


            const shouldShow =
                number <= size;


            if (shouldShow) {

                card.classList.remove(
                    "hidden-member"
                );

            } else {

                card.classList.add(
                    "hidden-member"
                );

                clearMemberFields(
                    number
                );

            }

        });


    /*
       REQUIRED FIELDS
    */

    for (
        let number = 2;
        number <= 5;
        number++
    ) {

        const name =
            document.getElementById(
                `member${number}Name`
            );

        const memberClass =
            document.getElementById(
                `member${number}Class`
            );

        const section =
            document.getElementById(
                `member${number}Section`
            );


        const required =
            number <= size;


        if (name) {
            name.required =
                required;
        }

        if (memberClass) {
            memberClass.required =
                required;
        }

        if (section) {
            section.required =
                required;
        }

    }

}


/* =========================================================
   TEAM SIZE LISTENERS
========================================================= */

document
    .querySelectorAll(
        'input[name="TeamSize"]'
    )
    .forEach(input => {

        input.addEventListener(
            "change",
            updateTeamSize
        );

    });


/*
   Run immediately.
*/

updateTeamSize();


/* =========================================================
   REMARKS COUNTER
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
   MOBILE VALIDATION
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
   EMAIL LOWERCASE
========================================================= */

const emailInput =
    document.getElementById(
        "emailAddress"
    );


if (emailInput) {

    emailInput.addEventListener(
        "input",
        () => {

            emailInput.value =
                emailInput.value
                    .toLowerCase();

        }
    );

}


/* =========================================================
   EVENT VALIDATION
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

        eventError.textContent =
            "";

    }


    return true;

}


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
   VALIDATE TEAM MEMBERS
========================================================= */

function validateTeamMembers() {

    const size =
        getTeamSize();


    for (
        let number = 2;
        number <= size;
        number++
    ) {

        const name =
            getValue(
                `member${number}Name`
            );

        const memberClass =
            getValue(
                `member${number}Class`
            );

        const section =
            getValue(
                `member${number}Section`
            );


        if (!name) {

            showMessage(
                `Please enter Participant ${number} name.`,
                "error"
            );

            document
                .getElementById(
                    `member${number}Name`
                )
                ?.focus();

            return false;

        }


        if (!memberClass) {

            showMessage(
                `Please select the class for Participant ${number}.`,
                "error"
            );

            document
                .getElementById(
                    `member${number}Class`
                )
                ?.focus();

            return false;

        }


        if (!section) {

            showMessage(
                `Please enter the section for Participant ${number}.`,
                "error"
            );

            document
                .getElementById(
                    `member${number}Section`
                )
                ?.focus();

            return false;

        }

    }


    return true;

}


/* =========================================================
   COLLECT DATA
========================================================= */

function collectRegistrationData() {

    const now =
        new Date();


    const registrationId =
        generateRegistrationId();


    const registrationDate =
        now.toLocaleString(
            "en-IN",
            {
                dateStyle:
                    "medium",

                timeStyle:
                    "short"
            }
        );


    const data = {

        registrationId:

            registrationId,


        TeamSize:

            getTeamSize(),


        ParticipationType:

            getValue(
                "participationType"
            ),


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

            getSelectedEvents(),


        Remarks:

            getValue(
                "remarks"
            ),


        registrationDate:

            registrationDate,


        timestamp:

            Date.now()

    };


    /*
       Add members dynamically.
    */

    for (
        let number = 2;
        number <= 5;
        number++
    ) {

        data[`Member${number}Name`] =
            getValue(
                `member${number}Name`
            );

        data[`Member${number}Class`] =
            getValue(
                `member${number}Class`
            );

        data[`Member${number}Section`] =
            getValue(
                `member${number}Section`
            );

    }


    return data;

}


/* =========================================================
   SAVE TO FIREBASE
========================================================= */

async function saveRegistration(
    data
) {

    if (!db) {

        throw new Error(
            "Firebase is not initialized."
        );

    }


    const registrationsRef =
        ref(
            db,
            "registrations"
        );


    const newRegistrationRef =
        push(
            registrationsRef
        );


    await set(
        newRegistrationRef,
        data
    );


    return newRegistrationRef.key;

}


/* =========================================================
   WAIT FOR EMAILJS
========================================================= */

async function waitForEmailJS() {

    let attempts = 0;


    while (
        !window.emailjs &&
        attempts < 40
    ) {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    250
                )
        );

        attempts++;

    }


    return Boolean(
        window.emailjs
    );

}


/* =========================================================
   SEND EMAIL
========================================================= */

async function sendConfirmationEmail(
    data
) {

    const emailReady =
        await waitForEmailJS();


    if (!emailReady) {

        console.warn(
            "EmailJS unavailable. Skipping email."
        );

        return;

    }


    const templateParams = {

        StudentName:
            data.StudentName,

        EmailAddress:
            data.EmailAddress,

        registrationId:
            data.registrationId,

        TeamName:
            data.TeamName ||
            "Not specified",

        TeamSize:
            String(
                data.TeamSize
            ),

        ParticipationType:
            data.ParticipationType,

        Class:
            data.Class,

        Section:
            data.Section,

        MobileNumber:
            data.MobileNumber,

        Events:
            data.Events.join(", "),

        Member2Name:
            data.Member2Name ||
            "Not applicable",

        Member2Class:
            data.Member2Class ||
            "",

        Member2Section:
            data.Member2Section ||
            "",

        Member3Name:
            data.Member3Name ||
            "Not applicable",

        Member3Class:
            data.Member3Class ||
            "",

        Member3Section:
            data.Member3Section ||
            "",

        Member4Name:
            data.Member4Name ||
            "Not applicable",

        Member4Class:
            data.Member4Class ||
            "",

        Member4Section:
            data.Member4Section ||
            "",

        Member5Name:
            data.Member5Name ||
            "Not applicable",

        Member5Class:
            data.Member5Class ||
            "",

        Member5Section:
            data.Member5Section ||
            "",

        Remarks:
            data.Remarks ||
            "No additional remarks.",

        registrationDate:
            data.registrationDate

    };


    return window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
    );

}


/* =========================================================
   SAVE SESSION INFORMATION
========================================================= */

function saveSessionData(data) {

    sessionStorage.setItem(
        "apsRegistrationId",
        data.registrationId
    );

    sessionStorage.setItem(
        "apsRegistrationName",
        data.StudentName
    );

    sessionStorage.setItem(
        "apsRegistrationEmail",
        data.EmailAddress
    );

    sessionStorage.setItem(
        "apsRegistrationTeam",
        data.TeamName ||
        ""
    );

}


/* =========================================================
   SHOW SUCCESS MODAL
========================================================= */

function showSuccess(
    registrationId
) {

    if (successRegistrationId) {

        successRegistrationId.textContent =
            registrationId;

    }


    if (successOverlay) {

        successOverlay.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   FORM SUBMISSION
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearMessage();


            /*
               HTML validation.
            */

            if (!form.checkValidity()) {

                form.reportValidity();

                return;

            }


            /*
               Event validation.
            */

            if (!validateEvents()) {

                return;

            }


            /*
               Team member validation.
            */

            if (!validateTeamMembers()) {

                return;

            }


            /*
               Prevent double-click.
            */

            if (
                submitBtn &&
                submitBtn.disabled
            ) {

                return;

            }


            const registrationData =
                collectRegistrationData();


            /*
               Loading state.
            */

            if (submitBtn) {

                submitBtn.disabled =
                    true;

                submitBtn.classList.add(
                    "loading"
                );

            }


            try {

                /* =========================================
                   FIREBASE
                ========================================= */

                console.log(
                    "Saving registration...",
                    registrationData
                );


                await saveRegistration(
                    registrationData
                );


                console.log(
                    "Registration successfully saved."
                );


                /*
                   Save ID for thankyou.html
                */

                saveSessionData(
                    registrationData
                );


                /* =========================================
                   EMAILJS
                ========================================= */

                try {

                    await sendConfirmationEmail(
                        registrationData
                    );


                    console.log(
                        "Confirmation email sent."
                    );

                } catch (emailError) {

                    /*
                       Email failure must NOT
                       cancel registration.
                    */

                    console.warn(
                        "EmailJS failed, but registration was saved:",
                        emailError
                    );

                }


                /* =========================================
                   SUCCESS
                ========================================= */

                showSuccess(
                    registrationData.registrationId
                );


            } catch (error) {

                console.error(
                    "REGISTRATION ERROR:",
                    error
                );


                /*
                   Display the actual reason.
                */

                let message =
                    "Registration failed. ";


                if (
                    error &&
                    error.code ===
                    "PERMISSION_DENIED"
                ) {

                    message +=
                        "Firebase denied permission. Please check your Realtime Database Rules.";

                } else if (
                    error &&
                    error.code
                ) {

                    message +=
                        `Error: ${error.code}`;

                } else if (
                    error &&
                    error.message
                ) {

                    message +=
                        error.message;

                } else {

                    message +=
                        "Please check your internet connection and try again.";

                }


                showMessage(
                    message,
                    "error"
                );


            } finally {

                if (submitBtn) {

                    submitBtn.disabled =
                        false;

                    submitBtn.classList.remove(
                        "loading"
                    );

                }

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

            /*
               Registration ID has already
               been stored in sessionStorage.
            */

            window.location.href =
                "thankyou.html";

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

console.log(
    "APS Robotics Championship 2026 registration system ready."
);
