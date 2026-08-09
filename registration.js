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

    apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",

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

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);


/* =========================================================
   DOM ELEMENTS
========================================================= */

const form =
    document.getElementById("registrationForm");

const submitBtn =
    document.getElementById("submitBtn");

const formMessage =
    document.getElementById("formMessage");

const eventError =
    document.getElementById("eventError");

const successOverlay =
    document.getElementById("successOverlay");

const successRegistrationId =
    document.getElementById("successRegistrationId");

const continueBtn =
    document.getElementById("continueBtn");

const remarks =
    document.getElementById("remarks");

const characterCount =
    document.getElementById("characterCount");

const participationType =
    document.getElementById("participationType");

const memberInstruction =
    document.getElementById("memberInstruction");


/* =========================================================
   BASIC HELPERS
========================================================= */

function getValue(id) {

    const element = document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}


function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.value =
            value ?? "";

    }
}


function escapeText(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   TEAM SIZE
========================================================= */

const teamSizeInputs =
    document.querySelectorAll(
        'input[name="TeamSize"]'
    );


function updateTeamSize() {

    const selected =
        document.querySelector(
            'input[name="TeamSize"]:checked'
        );

    if (!selected) return;

    const size =
        Number(selected.value);

    const cards =
        document.querySelectorAll(
            ".additional-member"
        );


    /* Participation type */

    if (size === 1) {

        participationType.value =
            "Solo";

        memberInstruction.textContent =
            "Solo participation selected. No additional members required.";

    } else {

        participationType.value =
            `Team of ${size}`;

        memberInstruction.textContent =
            `${size - 1} additional member${size - 1 > 1 ? "s" : ""} required for this team.`;

    }


    /* Show / hide member cards */

    cards.forEach(card => {

        const memberNumber =
            Number(
                card.dataset.memberCard
            );

        if (memberNumber <= size) {

            card.classList.remove(
                "hidden-member"
            );

            enableMemberFields(
                memberNumber,
                true
            );

        } else {

            card.classList.add(
                "hidden-member"
            );

            enableMemberFields(
                memberNumber,
                false
            );

            clearMemberFields(
                memberNumber
            );
        }

    });


    updateMemberRequiredState(size);
}


function enableMemberFields(
    memberNumber,
    enabled
) {

    const ids = [

        `member${memberNumber}Name`,
        `member${memberNumber}Class`,
        `member${memberNumber}Section`

    ];

    ids.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.disabled =
                !enabled;

        }

    });
}


function clearMemberFields(
    memberNumber
) {

    setValue(
        `member${memberNumber}Name`,
        ""
    );

    setValue(
        `member${memberNumber}Class`,
        ""
    );

    setValue(
        `member${memberNumber}Section`,
        ""
    );
}


function updateMemberRequiredState(
    teamSize
) {

    for (
        let number = 2;
        number <= 5;
        number++
    ) {

        const nameInput =
            document.getElementById(
                `member${number}Name`
            );

        const classInput =
            document.getElementById(
                `member${number}Class`
            );

        const sectionInput =
            document.getElementById(
                `member${number}Section`
            );


        const required =
            number <= teamSize;


        if (nameInput)
            nameInput.required = required;

        if (classInput)
            classInput.required = required;

        if (sectionInput)
            sectionInput.required = required;
    }
}


teamSizeInputs.forEach(input => {

    input.addEventListener(
        "change",
        updateTeamSize
    );

});


/* =========================================================
   EVENT SELECTION
========================================================= */

const eventCheckboxes =
    document.querySelectorAll(
        'input[name="Events"]'
    );


function getSelectedEvents() {

    return Array.from(
        document.querySelectorAll(
            'input[name="Events"]:checked'
        )
    ).map(
        checkbox => checkbox.value
    );
}


function validateEvents() {

    const selected =
        getSelectedEvents();


    if (selected.length === 0) {

        eventError.textContent =
            "Please select at least one championship event.";

        document
            .getElementById("eventSelection")
            ?.classList.add(
                "event-error-active"
            );

        return false;
    }


    eventError.textContent = "";

    document
        .getElementById("eventSelection")
        ?.classList.remove(
            "event-error-active"
        );

    return true;
}


eventCheckboxes.forEach(
    checkbox => {

        checkbox.addEventListener(
            "change",
            validateEvents
        );

    }
);


/* =========================================================
   MOBILE NUMBER
========================================================= */

const mobileInput =
    document.getElementById(
        "mobileNumber"
    );


mobileInput?.addEventListener(
    "input",
    () => {

        mobileInput.value =
            mobileInput.value
                .replace(/\D/g, "")
                .slice(0, 10);

    }
);


/* =========================================================
   SECTION INPUT
========================================================= */

const sectionInputs =
    document.querySelectorAll(
        'input[name$="Section"]'
    );


sectionInputs.forEach(input => {

    input.addEventListener(
        "input",
        () => {

            input.value =
                input.value
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .slice(0, 5)
                    .toUpperCase();

        }
    );

});


/* =========================================================
   REMARKS COUNTER
========================================================= */

remarks?.addEventListener(
    "input",
    () => {

        characterCount.textContent =
            remarks.value.length;

    }
);


/* =========================================================
   FORM MESSAGE
========================================================= */

function showMessage(
    message,
    type = "error"
) {

    formMessage.textContent =
        message;

    formMessage.className =
        `form-message ${type}`;

}


function clearMessage() {

    formMessage.textContent = "";

    formMessage.className =
        "form-message";

}


/* =========================================================
   SUBMIT BUTTON STATE
========================================================= */

function setSubmitting(
    state
) {

    submitBtn.disabled =
        state;

    if (state) {

        submitBtn.classList.add(
            "loading"
        );

    } else {

        submitBtn.classList.remove(
            "loading"
        );

    }

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
            1000 +
            Math.random() * 9000
        );

    return `APS-RBC-${year}-${random}`;
}


/* =========================================================
   DATE
========================================================= */

function getRegistrationDate() {

    return new Date()
        .toISOString();

}


/* =========================================================
   BUILD REGISTRATION DATA
========================================================= */

function collectRegistrationData() {

    const selectedTeamSize =
        document.querySelector(
            'input[name="TeamSize"]:checked'
        );


    const teamSize =
        selectedTeamSize
            ? Number(selectedTeamSize.value)
            : 1;


    const selectedEvents =
        getSelectedEvents();


    const registrationId =
        generateRegistrationId();


    const registrationDate =
        getRegistrationDate();


    const data = {

        registrationId:

            registrationId,

        registrationDate:

            registrationDate,

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

        TeamSize:

            teamSize,

        ParticipationType:

            participationType.value,

        Events:

            selectedEvents,

        Member2Name:

            teamSize >= 2
                ? getValue("member2Name")
                : "",

        Member2Class:

            teamSize >= 2
                ? getValue("member2Class")
                : "",

        Member2Section:

            teamSize >= 2
                ? getValue("member2Section")
                : "",

        Member3Name:

            teamSize >= 3
                ? getValue("member3Name")
                : "",

        Member3Class:

            teamSize >= 3
                ? getValue("member3Class")
                : "",

        Member3Section:

            teamSize >= 3
                ? getValue("member3Section")
                : "",

        Member4Name:

            teamSize >= 4
                ? getValue("member4Name")
                : "",

        Member4Class:

            teamSize >= 4
                ? getValue("member4Class")
                : "",

        Member4Section:

            teamSize >= 4
                ? getValue("member4Section")
                : "",

        Member5Name:

            teamSize >= 5
                ? getValue("member5Name")
                : "",

        Member5Class:

            teamSize >= 5
                ? getValue("member5Class")
                : "",

        Member5Section:

            teamSize >= 5
                ? getValue("member5Section")
                : "",

        Remarks:

            getValue(
                "remarks"
            )

    };


    return data;
}


/* =========================================================
   VALIDATE FORM
========================================================= */

function validateForm() {

    clearMessage();


    /* Browser validation */

    if (!form.checkValidity()) {

        form.reportValidity();

        return false;

    }


    /* Events */

    if (!validateEvents()) {

        showMessage(
            "Please select at least one event.",
            "error"
        );

        document
            .getElementById(
                "eventSelection"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        return false;

    }


    /* Mobile */

    const mobile =
        getValue(
            "mobileNumber"
        );


    if (!/^[6-9]\d{9}$/.test(mobile)) {

        showMessage(
            "Please enter a valid 10-digit Indian mobile number.",
            "error"
        );

        mobileInput.focus();

        return false;

    }


    /* Terms */

    const terms =
        document.getElementById(
            "agreeTerms"
        );


    if (!terms.checked) {

        showMessage(
            "Please accept the rules and guidelines before submitting.",
            "error"
        );

        terms.focus();

        return false;

    }


    return true;
}


/* =========================================================
   SAVE TO FIREBASE
========================================================= */

async function saveRegistration(
    data
) {

    /*
       IMPORTANT:

       Every registration is stored at:

       /registrations/<generated-key>

       This is the same location used
       by admin.js.
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
        data
    );


    return newRegistrationRef.key;
}


/* =========================================================
   SUBMIT REGISTRATION
========================================================= */

form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!validateForm()) {

            return;

        }


        setSubmitting(true);


        showMessage(
            "Submitting your registration...",
            "loading"
        );


        try {

            const data =
                collectRegistrationData();


            /*
               Firebase write
            */

            await saveRegistration(
                data
            );


            /*
               Successful registration
            */

            successRegistrationId.textContent =
                data.registrationId;


            successOverlay.classList.remove(
                "hidden"
            );


            form.reset();


            /*
               Restore default team size
            */

            const solo =
                document.querySelector(
                    'input[name="TeamSize"][value="1"]'
                );


            if (solo) {

                solo.checked = true;

            }


            updateTeamSize();


            /*
               Reset remarks counter
            */

            if (characterCount) {

                characterCount.textContent =
                    "0";

            }


            clearMessage();


        } catch (error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );


            let message =
                "Registration could not be submitted.";


            /*
               Firebase permission error
            */

            if (
                error &&
                error.code ===
                "PERMISSION_DENIED"
            ) {

                message =
                    "Registration is currently unavailable because Firebase Database permissions are blocking submissions.";

            }


            /*
               Network error
            */

            else if (
                error &&
                (
                    error.code ===
                    "NETWORK_ERROR" ||

                    error.message
                        ?.toLowerCase()
                        .includes(
                            "network"
                        )
                )
            ) {

                message =
                    "Unable to connect to the registration server. Please check your internet connection.";

            }


            /*
               Generic Firebase error
            */

            else if (
                error &&
                error.message
            ) {

                message =
                    `Registration failed: ${error.message}`;

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
   SUCCESS → THANK YOU PAGE
========================================================= */

continueBtn?.addEventListener(
    "click",
    () => {

        /*
           Your previous setup uses thankyou.html.
        */

        window.location.href =
            "thankyou.html";

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

updateTeamSize();


/* =========================================================
   FIREBASE CONNECTION TEST
========================================================= */

console.log(
    "APS Robotics Registration initialized."
);

console.log(
    "Firebase project:",
    firebaseConfig.projectId
);

console.log(
    "Realtime Database:",
    firebaseConfig.databaseURL
);

console.log(
    "Registration path: /registrations"
);
