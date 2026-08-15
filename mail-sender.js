/* =========================================================
   ROBOKRITI 2026
   COMMUNICATION CENTER
========================================================= */

const EMAILJS_SERVICE = "service_i9s33xx";

const REGISTRATION_TEMPLATE =
    "template_ivt641m";

const HELP_TEMPLATE =
    "template_0we1e06";


/* =========================================================
   ELEMENTS
========================================================= */

const mailTypeInputs =
    document.querySelectorAll(
        'input[name="mailType"]'
    );

const registrationSection =
    document.getElementById(
        "registrationSection"
    );

const helpSection =
    document.getElementById(
        "helpSection"
    );

const sendBtn =
    document.getElementById(
        "sendBtn"
    );

const clearBtn =
    document.getElementById(
        "clearBtn"
    );

const mailStatus =
    document.getElementById(
        "mailStatus"
    );


/* =========================================================
   GET CURRENT MAIL TYPE
========================================================= */

function getMailType() {

    const selected =
        document.querySelector(
            'input[name="mailType"]:checked'
        );

    return selected
        ? selected.value
        : "registration";
}


/* =========================================================
   SWITCH BETWEEN TEMPLATES
========================================================= */

function updateMailType() {

    const type =
        getMailType();

    if (type === "help") {

        registrationSection.classList.add(
            "hidden-section"
        );

        registrationSection.classList.remove(
            "active"
        );

        helpSection.classList.add(
            "active"
        );

    } else {

        helpSection.classList.remove(
            "active"
        );

        registrationSection.classList.remove(
            "hidden-section"
        );

        registrationSection.classList.add(
            "active"
        );
    }

    clearStatus();
}


mailTypeInputs.forEach(
    input => {

        input.addEventListener(
            "change",
            updateMailType
        );

    }
);


/* =========================================================
   VALUE HELPER
========================================================= */

function value(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}


/* =========================================================
   STATUS
========================================================= */

function showStatus(
    message,
    type
) {

    mailStatus.textContent =
        message;

    mailStatus.className =
        "mail-status show " + type;
}


function clearStatus() {

    mailStatus.textContent = "";

    mailStatus.className =
        "mail-status";
}


/* =========================================================
   REGISTRATION TEMPLATE PARAMETERS
========================================================= */

function getRegistrationParams() {

    return {

        to_email:
            value("registrationEmail"),

        student_name:
            value("registrationName"),

        registration_id:
            value("registrationId"),

        team_name:
            value("teamName"),

        team_size:
            value("teamSize"),

        participation_type:
            value("participationType"),

        events:
            value("events"),

        mobile_number:
            value("mobileNumber"),

        status:
            value("registrationStatus"),

        remarks:
            value("registrationRemarks")
    };
}


/* =========================================================
   HELP TEMPLATE PARAMETERS
========================================================= */

function getHelpParams() {

    return {

        email:
            value("helpEmail"),

        student_name:
            value("helpStudentName"),

        registration_id:
            value("helpRegistrationId"),

        help_reference:
            value("helpReference"),

        category:
            value("helpCategory"),

        subject:
            value("helpSubject"),

        original_message:
            value("originalMessage"),

        reply_message:
            value("replyMessage"),

        status:
            value("helpStatus")
    };
}


/* =========================================================
   VALIDATION
========================================================= */

function validateRegistration() {

    if (!value("registrationEmail")) {

        return "Participant email is required.";

    }

    if (!value("registrationName")) {

        return "Participant name is required.";

    }

    if (!value("registrationId")) {

        return "Registration ID is required.";

    }

    return null;
}


function validateHelp() {

    if (!value("helpEmail")) {

        return "Participant email is required.";

    }

    if (!value("helpStudentName")) {

        return "Student name is required.";

    }

    if (!value("helpReference")) {

        return "Help Reference ID is required.";

    }

    if (!value("replyMessage")) {

        return "Please enter your response.";

    }

    return null;
}


/* =========================================================
   SEND EMAIL
========================================================= */

async function sendMail() {

    clearStatus();

    const type =
        getMailType();

    let templateID;

    let params;

    let validationError;


    if (type === "help") {

        templateID =
            HELP_TEMPLATE;

        params =
            getHelpParams();

        validationError =
            validateHelp();

    } else {

        templateID =
            REGISTRATION_TEMPLATE;

        params =
            getRegistrationParams();

        validationError =
            validateRegistration();
    }


    if (validationError) {

        showStatus(
            validationError,
            "error"
        );

        return;
    }


    sendBtn.disabled = true;

    sendBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';


    try {

        await emailjs.send(
            EMAILJS_SERVICE,
            templateID,
            params
        );


        showStatus(
            type === "help"
                ? "Help reply sent successfully."
                : "Registration confirmation sent successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "EmailJS error:",
            error
        );

        showStatus(
            "Unable to send the email. Please check your EmailJS template variables and configuration.",
            "error"
        );

    } finally {

        sendBtn.disabled = false;

        sendBtn.innerHTML =
            'Send Email <i class="fa-solid fa-paper-plane"></i>';

    }
}


/* =========================================================
   CLEAR
========================================================= */

function clearForm() {

    document
        .querySelectorAll(
            "input:not([type='radio']), textarea"
        )
        .forEach(
            element => {

                if (
                    element.id ===
                    "registrationStatus"
                ) {

                    element.value =
                        "Registration Confirmed";

                } else if (
                    element.id ===
                    "helpStatus"
                ) {

                    element.value =
                        "Resolved";

                } else {

                    element.value = "";
                }
            }
        );

    clearStatus();
}


/* =========================================================
   EVENTS
========================================================= */

sendBtn.addEventListener(
    "click",
    sendMail
);

clearBtn.addEventListener(
    "click",
    clearForm
);


/* =========================================================
   INITIAL STATE
========================================================= */

updateMailType();
