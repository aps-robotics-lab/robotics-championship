/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   REGISTRATION SYSTEM
   Firebase Realtime Database + EmailJS
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

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
   EMAILJS CONFIGURATION
========================================================= */

const EMAILJS_PUBLIC_KEY =
    "GnxniZ70ndujyjDpe";

const EMAILJS_SERVICE_ID =
    "service_5m4uzhb";

const EMAILJS_TEMPLATE_ID =
    "template_5qb8b2p";


/* =========================================================
   INITIALIZE SERVICES
========================================================= */

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);


/*
    Initialize EmailJS immediately.
*/

emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
});


/* =========================================================
   DOM ELEMENTS
========================================================= */

const form =
    document.getElementById("registrationForm");

const submitBtn =
    document.getElementById("submitBtn");

const formMessage =
    document.getElementById("formMessage");

const successOverlay =
    document.getElementById("successOverlay");

const successRegistrationId =
    document.getElementById("successRegistrationId");

const continueBtn =
    document.getElementById("continueBtn");

const eventError =
    document.getElementById("eventError");

const participationType =
    document.getElementById("participationType");

const memberInstruction =
    document.getElementById("memberInstruction");

const remarks =
    document.getElementById("remarks");

const characterCount =
    document.getElementById("characterCount");


/* =========================================================
   BASIC SAFETY CHECK
========================================================= */

if (!form) {
    console.error(
        "Registration form was not found."
    );
}


/* =========================================================
   TEAM SIZE MANAGEMENT
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

    /*
        Update participation type.
    */

    participationType.value =
        teamSize === 1
            ? "Solo"
            : `Team of ${teamSize}`;


    /*
        Show/hide member cards.
    */

    for (let i = 2; i <= 5; i++) {

        const card =
            document.querySelector(
                `[data-member-card="${i}"]`
            );

        if (!card) continue;

        const shouldShow =
            i <= teamSize;

        card.classList.toggle(
            "hidden-member",
            !shouldShow
        );


        /*
            Make additional member fields
            required only when visible.
        */

        const nameInput =
            document.getElementById(
                `member${i}Name`
            );

        const classInput =
            document.getElementById(
                `member${i}Class`
            );

        const sectionInput =
            document.getElementById(
                `member${i}Section`
            );


        if (nameInput) {
            nameInput.required = shouldShow;
        }

        if (classInput) {
            classInput.required = shouldShow;
        }

        if (sectionInput) {
            sectionInput.required = shouldShow;
        }
    }


    /*
        Update instruction text.
    */

    if (teamSize === 1) {

        memberInstruction.textContent =
            "Solo participation selected. No additional members required.";

    } else {

        memberInstruction.textContent =
            `Team of ${teamSize} selected. Please enter details for all ${teamSize - 1} additional participant(s).`;

    }
}


/*
    Run once when page loads.
*/

updateTeamMembers();


/* =========================================================
   REMARKS CHARACTER COUNTER
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
   MOBILE NUMBER VALIDATION
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
   SECTION INPUT CLEANUP
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
   FORM MESSAGE
========================================================= */

function showMessage(
    message,
    type = "error"
) {

    if (!formMessage) return;

    formMessage.textContent =
        message;

    formMessage.className =
        `form-message ${type}`;

}


/* =========================================================
   EVENT VALIDATION
========================================================= */

function getSelectedEvents() {

    return Array.from(
        document.querySelectorAll(
            'input[name="Events"]:checked'
        )
    ).map(input => input.value);

}


function validateEvents() {

    const selectedEvents =
        getSelectedEvents();


    if (selectedEvents.length === 0) {

        if (eventError) {

            eventError.textContent =
                "Please select at least one championship event.";

        }

        return false;
    }


    if (eventError) {

        eventError.textContent = "";

    }

    return true;
}


/*
    Remove event error as soon as
    user selects an event.
*/

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
   FORM VALIDATION
========================================================= */

function validateForm() {

    /*
        Browser validation.
    */

    if (!form.checkValidity()) {

        form.reportValidity();

        return false;
    }


    /*
        Event validation.
    */

    if (!validateEvents()) {

        return false;
    }


    /*
        Mobile validation.
    */

    const mobile =
        mobileInput?.value.trim() || "";


    if (!/^[6-9]\d{9}$/.test(mobile)) {

        showMessage(
            "Please enter a valid 10-digit Indian mobile number.",
            "error"
        );

        mobileInput?.focus();

        return false;
    }


    /*
        Email validation.
    */

    const email =
        document
            .getElementById("emailAddress")
            ?.value
            .trim();


    if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        return false;
    }


    return true;
}


/* =========================================================
   REGISTRATION ID
========================================================= */

function generateRegistrationId() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return `APSRC-${year}-${random}`;
}


/* =========================================================
   GET INPUT VALUE
========================================================= */

function valueOf(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}


/* =========================================================
   COLLECT MEMBER DATA
========================================================= */

function getMemberData(teamSize) {

    const members = {};


    for (
        let i = 2;
        i <= teamSize;
        i++
    ) {

        members[`Member${i}Name`] =
            valueOf(`member${i}Name`);

        members[`Member${i}Class`] =
            valueOf(`member${i}Class`);

        members[`Member${i}Section`] =
            valueOf(`member${i}Section`);
    }


    /*
        Keep empty fields for consistency.
    */

    for (
        let i = teamSize + 1;
        i <= 5;
        i++
    ) {

        members[`Member${i}Name`] = "";

        members[`Member${i}Class`] = "";

        members[`Member${i}Section`] = "";
    }


    return members;
}


/* =========================================================
   BUILD REGISTRATION DATA
========================================================= */

function buildRegistrationData(
    registrationId
) {

    const selectedTeamSize =
        Number(
            document.querySelector(
                'input[name="TeamSize"]:checked'
            )?.value || 1
        );


    const selectedEvents =
        getSelectedEvents();


    const data = {

        registrationId,

        TeamSize:
            selectedTeamSize,

        ParticipationType:
            participationType.value,

        StudentName:
            valueOf("studentName"),

        Class:
            valueOf("studentClass"),

        Section:
            valueOf("studentSection"),

        MobileNumber:
            valueOf("mobileNumber"),

        EmailAddress:
            valueOf("emailAddress"),

        TeamName:
            valueOf("teamName"),

        Events:
            selectedEvents,

        Remarks:
            valueOf("remarks"),

        registrationDate:
            new Date().toISOString(),

        createdAt:
            Date.now(),

        ...getMemberData(
            selectedTeamSize
        )
    };


    return data;
}


/* =========================================================
   EMAIL DATA
========================================================= */

function buildEmailData(
    registration
) {

    return {

        /*
            IMPORTANT:
            Your EmailJS template must use
            {{to_email}} in the recipient field.
        */

        to_email:
            registration.EmailAddress,

        email:
            registration.EmailAddress,

        reply_to:
            registration.EmailAddress,

        to_name:
            registration.StudentName,

        student_name:
            registration.StudentName,

        team_name:
            registration.TeamName ||
            "Not provided",

        registration_id:
            registration.registrationId,

        team_size:
            registration.TeamSize,

        participation_type:
            registration.ParticipationType,

        student_class:
            registration.Class,

        section:
            registration.Section,

        mobile:
            registration.MobileNumber,

        events:
            registration.Events.join(", "),

        member2:
            registration.Member2Name ||
            "",

        member3:
            registration.Member3Name ||
            "",

        member4:
            registration.Member4Name ||
            "",

        member5:
            registration.Member5Name ||
            "",

        remarks:
            registration.Remarks ||
            "None",

        registration_date:
            new Date(
                registration.registrationDate
            ).toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            )
    };
}


/* =========================================================
   SEND CONFIRMATION EMAIL
========================================================= */

async function sendConfirmationEmail(
    registration
) {

    const templateParams =
        buildEmailData(
            registration
        );


    console.log(
        "Sending EmailJS confirmation:",
        templateParams
    );


    try {

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


        return {
            success: true,
            response
        };

    } catch (error) {

        console.error(
            "EmailJS failed:",
            error
        );


        return {
            success: false,
            error
        };
    }
}


/* =========================================================
   SUCCESS SCREEN
========================================================= */

function showSuccess(
    registrationId,
    emailSent
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


    /*
        Do not show technical EmailJS
        errors to the participant.

        Firebase registration is already
        successfully stored.
    */

    if (!emailSent) {

        console.warn(
            "Registration saved, but confirmation email was not sent."
        );

    }
}


/* =========================================================
   SUBMIT BUTTON STATE
========================================================= */

function setSubmitting(
    submitting
) {

    if (!submitBtn) return;


    submitBtn.disabled =
        submitting;


    submitBtn.classList.toggle(
        "loading",
        submitting
    );


    const normal =
        submitBtn.querySelector(
            ".submit-normal"
        );

    const loading =
        submitBtn.querySelector(
            ".submit-loading"
        );


    if (normal) {

        normal.style.display =
            submitting
                ? "none"
                : "inline-flex";

    }


    if (loading) {

        loading.style.display =
            submitting
                ? "inline-flex"
                : "none";

    }
}


/* =========================================================
   MAIN FORM SUBMISSION
========================================================= */

form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        /*
            Prevent double submission.
        */

        if (
            submitBtn?.disabled
        ) {

            return;

        }


        showMessage(
            "",
            ""
        );


        /*
            Validate everything.
        */

        if (!validateForm()) {

            return;

        }


        setSubmitting(true);


        try {

            /*
                Generate registration ID.
            */

            const registrationId =
                generateRegistrationId();


            /*
                Build registration object.
            */

            const registration =
                buildRegistrationData(
                    registrationId
                );


            console.log(
                "Registration data:",
                registration
            );


            /*
                STEP 1
                Save registration to Firebase.
            */

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
                registration
            );


            console.log(
                "Firebase registration saved:",
                newRegistrationRef.key
            );


            /*
                STEP 2
                Send confirmation email.
            */

            const emailResult =
                await sendConfirmationEmail(
                    registration
                );


            /*
                STEP 3
                Show success.
            */

            showSuccess(
                registrationId,
                emailResult.success
            );


            /*
                STEP 4
                Optional success message.
            */

            if (emailResult.success) {

                showMessage(
                    "Registration submitted successfully. A confirmation email has been sent.",
                    "success"
                );

            } else {

                showMessage(
                    "Registration submitted successfully. Your registration is saved, but the confirmation email could not be sent.",
                    "success"
                );

            }

        } catch (error) {

            console.error(
                "Registration submission error:",
                error
            );


            let message =
                "Registration could not be completed. Please try again.";


            /*
                Firebase-specific messages.
            */

            if (
                error?.code ===
                "PERMISSION_DENIED"
            ) {

                message =
                    "Registration is currently unavailable. Please contact the organisers.";

            }


            if (
                error?.message
                    ?.toLowerCase()
                    .includes("network")
            ) {

                message =
                    "Network error. Please check your internet connection and try again.";

            }


            showMessage(
                message,
                "error"
            );

        } finally {

            setSubmitting(false);

        }
    }
);


/* =========================================================
   CONTINUE BUTTON
========================================================= */

continueBtn?.addEventListener(
    "click",
    () => {

        window.location.href =
            "thankyou.html";

    }
);


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
    "Firebase:",
    "Connected configuration loaded"
);

console.log(
    "EmailJS Service:",
    EMAILJS_SERVICE_ID
);

console.log(
    "EmailJS Template:",
    EMAILJS_TEMPLATE_ID
);
