
/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   HELP CENTER
   Firebase: NOT USED
   FormSubmit: Support request delivery
   EmailJS: Student confirmation
   ========================================================= */


/* -----------------------------
   EMAILJS CONFIGURATION
------------------------------ */

const EMAILJS_PUBLIC_KEY = "GnxniZ70ndujyjDpe";
const EMAILJS_SERVICE_ID = "service_5m4uzhb";
const EMAILJS_TEMPLATE_ID = "template_5qb8b2p";


/* -----------------------------
   ELEMENTS
------------------------------ */

const form = document.getElementById("helpForm");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const formStatus = document.getElementById("formStatus");

const registrationIdInput =
    document.getElementById("registrationId");

const emailInput =
    document.getElementById("email");


/* -----------------------------
   INITIALIZE EMAILJS
------------------------------ */

if (window.emailjs) {

    emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY
    });

}


/* -----------------------------
   AUTO-FILL REGISTRATION ID
------------------------------ */

const savedRegistrationId =
    sessionStorage.getItem("apsRegistrationId");

const savedRegistrationName =
    sessionStorage.getItem("apsRegistrationName");


if (
    savedRegistrationId &&
    registrationIdInput &&
    !registrationIdInput.value
) {

    registrationIdInput.value =
        savedRegistrationId;

}


if (
    savedRegistrationName &&
    document.getElementById("name") &&
    !document.getElementById("name").value
) {

    document.getElementById("name").value =
        savedRegistrationName;

}


/* -----------------------------
   EMAIL NORMALIZATION
------------------------------ */

emailInput?.addEventListener(
    "blur",
    () => {

        emailInput.value =
            emailInput.value
            .trim()
            .toLowerCase();

    }
);


/* -----------------------------
   SECTION NORMALIZATION
------------------------------ */

document
.getElementById("section")
?.addEventListener(
    "input",
    event => {

        event.target.value =
            event.target.value
            .toUpperCase()
            .replace(/\s/g, "")
            .slice(0, 5);

    }
);


/* -----------------------------
   STATUS
------------------------------ */

function showStatus(message, type) {

    if (!formStatus) return;

    formStatus.textContent = message;

    formStatus.className =
        `form-status ${type}`;

}


/* -----------------------------
   EMAILJS CONFIRMATION
------------------------------ */

async function sendStudentConfirmation(data) {

    if (!window.emailjs) {

        throw new Error(
            "EmailJS is not available."
        );

    }


    return emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {

            StudentName:
                data.studentName,

            EmailAddress:
                data.email,

            Class:
                data.className,

            Section:
                data.section,

            registrationId:
                data.registrationId,

            Category:
                data.category,

            Subject:
                data.subject,

            Message:
                data.message,

            SupportEmail:
                "ayusshh@outlook.in"

        }
    );

}


/* -----------------------------
   FORM SUBMISSION
------------------------------ */

form?.addEventListener(
    "submit",
    async event => {

        /*
         * We allow FormSubmit to handle the actual
         * form POST, so do not preventDefault().
         *
         * EmailJS is triggered before navigation.
         */

        if (!form.checkValidity()) {

            event.preventDefault();

            form.reportValidity();

            return;

        }


        const data = {

            studentName:
                document
                .getElementById("name")
                .value
                .trim(),

            className:
                document
                .getElementById("class")
                .value,

            section:
                document
                .getElementById("section")
                .value
                .trim(),

            email:
                document
                .getElementById("email")
                .value
                .trim()
                .toLowerCase(),

            registrationId:
                document
                .getElementById("registrationId")
                .value
                .trim(),

            category:
                document
                .getElementById("category")
                .value,

            subject:
                document
                .getElementById("subject")
                .value
                .trim(),

            message:
                document
                .getElementById("message")
                .value
                .trim()

        };


        /*
         * Prevent double-click submissions.
         */

        submitBtn.disabled = true;

        submitText.textContent =
            "Sending Request...";


        showStatus(
            "Sending your support request...",
            "loading"
        );


        /*
         * EmailJS confirmation.
         *
         * We don't stop FormSubmit if EmailJS fails.
         * The important support request still goes
         * to your Outlook address through FormSubmit.
         */

        try {

            await sendStudentConfirmation(data);

        }

        catch (error) {

            console.error(
                "EmailJS confirmation failed:",
                error
            );

        }


        /*
         * Give FormSubmit a moment to process the
         * form before allowing the browser to navigate.
         */

        setTimeout(
            () => {

                /*
                 * FormSubmit will now receive the
                 * normal POST request.
                 */

            },
            250
        );

    }
);
