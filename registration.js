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

    if (window.emailjs) {

        window.emailjs.init({

            publicKey:
                EMAILJS_PUBLIC_KEY

        });

        console.log(
            "EmailJS initialized successfully."
        );

    }

};

emailScript.onerror = () => {

    console.error(
        "Unable to load EmailJS."
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
   UTILITY
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {

        return "";

    }

    return element.value.trim();

}


function getTeamSize() {

    const selected =
        document.querySelector(
            'input[name="TeamSize"]:checked'
        );

    if (!selected) {

        return 1;

    }

    return Number(
        selected.value
    );

}


function getSelectedEvents() {

    return Array.from(
        document.querySelectorAll(
            'input[name="Events"]:checked'
        )
    ).map(
        input => input.value
    );

}


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

    return `APS-RBC-${year}-${random}`;

}


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
   TEAM SIZE
========================================================= */

function updateTeamSize() {

    const size =
        getTeamSize();


    const memberCards =
        document.querySelectorAll(
            ".additional-member"
        );


    memberCards.forEach(card => {

        const memberNumber =
            Number(
                card.dataset.memberCard
            );


        if (memberNumber <= size) {

            card.classList.remove(
                "hidden-member"
            );

        } else {

            card.classList.add(
                "hidden-member"
            );

            clearMemberFields(
                memberNumber
            );

        }

    });


    /*
       Update participation type.
    */

    if (participationType) {

        participationType.value =
            size === 1
                ? "Solo"
                : `Team of ${size}`;

    }


    /*
       Update instruction text.
    */

    if (memberInstruction) {

        const instructions = {

            1:
                "Solo participation selected. No additional members required.",

            2:
                "Team of 2 selected. Please enter details for Participant 02.",

            3:
                "Team of 3 selected. Please enter details for Participants 02 and 03.",

            4:
                "Team of 4 selected. Please enter details for Participants 02–04.",

            5:
                "Team of 5 selected. Please enter details for Participants 02–05."

        };

        memberInstruction.textContent =
            instructions[size] || "";

    }


    /*
       Required fields.
    */

    for (
        let i = 2;
        i <= 5;
        i++
    ) {

        const name =
            document.getElementById(
                `member${i}Name`
            );

        const memberClass =
            document.getElementById(
                `member${i}Class`
            );

        const section =
            document.getElementById(
                `member${i}Section`
            );


        const required =
            i <= size;


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

            element.value =
                "";

        }

    });

}


/* =========================================================
   TEAM SIZE EVENTS
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


updateTeamSize();


/* =========================================================
   REMARKS CHARACTER COUNTER
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
   EMAIL LOWERCASE
========================================================= */

const emailInput =
    document.getElementById(
        "emailAddress"
    );


if (emailInput) {

    emailInput.addEventListener(
        "blur",
        () => {

            emailInput.value =
                emailInput.value
                    .trim()
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
   COLLECT REGISTRATION DATA
========================================================= */

function collectRegistrationData() {

    const selectedEvents =
        getSelectedEvents();


    const registrationId =
        generateRegistrationId();


    const now =
        new Date();


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


    return {

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

            selectedEvents,


        Member2Name:

            getValue(
                "member2Name"
            ),


        Member2Class:

            getValue(
                "member2Class"
            ),


        Member2Section:

            getValue(
                "member2Section"
            ),


        Member3Name:

            getValue(
                "member3Name"
            ),


        Member3Class:

            getValue(
                "member3Class"
            ),


        Member3Section:

            getValue(
                "member3Section"
            ),


        Member4Name:

            getValue(
                "member4Name"
            ),


        Member4Class:

            getValue(
                "member4Class"
            ),


        Member4Section:

            getValue(
                "member4Section"
            ),


        Member5Name:

            getValue(
                "member5Name"
            ),


        Member5Class:

            getValue(
                "member5Class"
            ),


        Member5Section:

            getValue(
                "member5Section"
            ),


        Remarks:

            getValue(
                "remarks"
            ),


        registrationDate:

            registrationDate

    };

}


/* =========================================================
   SAVE TO FIREBASE
========================================================= */

async function saveRegistration(
    registrationData
) {

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
        registrationData
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


    if (!window.emailjs) {

        throw new Error(
            "EmailJS SDK failed to load."
        );

    }

}


/* =========================================================
   SEND CONFIRMATION EMAIL
========================================================= */

async function sendConfirmationEmail(
    data
) {

    await waitForEmailJS();


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
            data.Events.join(
                ", "
            ),


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


    const result =
        await window.emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );


    console.log(
        "EmailJS:",
        result.status,
        result.text
    );


    return result;

}


/* =========================================================
   SHOW SUCCESS
========================================================= */

function showSuccess(
    registrationId
) {

    if (
        successRegistrationId
    ) {

        successRegistrationId.textContent =
            registrationId;

    }


    if (
        successOverlay
    ) {

        successOverlay.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   SUBMIT FORM
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearMessage();


            /*
               Browser validation.
            */

            if (
                !form.checkValidity()
            ) {

                form.reportValidity();

                return;

            }


            /*
               Event validation.
            */

            if (
                !validateEvents()
            ) {

                return;

            }


            /*
               Prevent double submission.
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
               Disable submit.
            */

            if (submitBtn) {

                submitBtn.disabled =
                    true;

                submitBtn.classList.add(
                    "loading"
                );

            }


            try {

                /* -----------------------------------------
                   STEP 1
                   SAVE TO FIREBASE
                ----------------------------------------- */

                await saveRegistration(
                    registrationData
                );


                console.log(
                    "Registration saved to Firebase."
                );


                /* -----------------------------------------
                   STEP 2
                   SEND EMAIL
                ----------------------------------------- */

                try {

                    await sendConfirmationEmail(
                        registrationData
                    );


                    console.log(
                        "Confirmation email sent."
                    );


                } catch (emailError) {

                    /*
                       IMPORTANT:
                       Firebase registration has already
                       succeeded. Do NOT delete it just
                       because EmailJS failed.
                    */

                    console.error(
                        "EmailJS failed:",
                        emailError
                    );

                }


                /* -----------------------------------------
                   STEP 3
                   SHOW SUCCESS
                ----------------------------------------- */

                showSuccess(
                    registrationData.registrationId
                );


            } catch (error) {

                console.error(
                    "Registration failed:",
                    error
                );


                showMessage(
                    "Registration could not be completed. Please try again.",
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
