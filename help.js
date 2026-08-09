const HELP_API_URL =
"https://script.google.com/macros/s/AKfycbzvOYOxu2gT2uPAucMN6bb2H9bdCMDrGhSa1eE4jDVcuwMs6QSqLfm2m9cnDkk1wJ50Xw/exec";


/* =========================================================
   EMAILJS
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

emailScript.onload = function () {

    if (window.emailjs) {

        window.emailjs.init({
            publicKey: EMAILJS_PUBLIC_KEY
        });

    }

};

document.head.appendChild(emailScript);


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
   VALUE HELPER
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


/* =========================================================
   STATUS
========================================================= */

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
        "form-status " + type;

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


/* =========================================================
   EMAILJS READY
========================================================= */

async function waitForEmailJS() {

    for (
        let i = 0;
        i < 40;
        i++
    ) {

        if (window.emailjs) {
            return true;
        }

        await new Promise(
            resolve =>
                setTimeout(resolve, 250)
        );

    }

    return false;

}


/* =========================================================
   EMAIL ADMIN
========================================================= */

async function sendAdminEmail(data) {

    const ready =
        await waitForEmailJS();

    if (!ready) {

        throw new Error(
            "EmailJS is not available."
        );

    }


    return window.emailjs.send(

        EMAILJS_SERVICE_ID,

        EMAILJS_TEMPLATE_ID,

        {

            to_email:
                "ayusshh@outlook.in",

            StudentName:
                data.name,

            EmailAddress:
                data.email,

            registrationId:
                data.registrationId ||
                "Not provided",

            TicketID:
                data.ticketId,

            Class:
                data.className,

            Section:
                data.section,

            Category:
                data.category,

            Subject:
                data.subject,

            Message:
                data.message,

            ticketStatus:
                "Open"

        }

    );

}


/* =========================================================
   FORM
========================================================= */

form?.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearStatus();


        /*
         * Browser validation.
         *
         * Registration ID is NOT required.
         */

        if (!form.checkValidity()) {

            form.reportValidity();

            return;

        }


        if (
            submitBtn &&
            submitBtn.disabled
        ) {

            return;

        }


        const data = {

            /*
             * OPTIONAL
             */

            registrationId:
                getValue(
                    "registrationId"
                ),

            name:
                getValue(
                    "name"
                ),

            className:
                getValue(
                    "className"
                ),

            section:
                getValue(
                    "section"
                ),

            email:
                getValue(
                    "email"
                ).toLowerCase(),

            category:
                getValue(
                    "category"
                ) || "Other",

            subject:
                getValue(
                    "subject"
                ),

            message:
                getValue(
                    "message"
                )

        };


        /*
         * Extra validation.
         */

        if (!data.name) {

            showStatus(
                "Please enter your name.",
                "error"
            );

            return;

        }

        if (!data.className) {

            showStatus(
                "Please enter your class.",
                "error"
            );

            return;

        }

        if (!data.section) {

            showStatus(
                "Please enter your section.",
                "error"
            );

            return;

        }

        if (!data.email) {

            showStatus(
                "Please enter your email address.",
                "error"
            );

            return;

        }

        if (!data.subject) {

            showStatus(
                "Please enter a subject.",
                "error"
            );

            return;

        }

        if (!data.message) {

            showStatus(
                "Please describe your issue.",
                "error"
            );

            return;

        }


        /* =================================================
           LOADING
        ================================================= */

        if (submitBtn) {

            submitBtn.disabled =
                true;

        }

        if (submitText) {

            submitText.classList.add(
                "hidden"
            );

        }

        if (submitLoading) {

            submitLoading.classList.remove(
                "hidden"
            );

        }


        try {

            /*
             * Send request to Google Apps Script.
             */

            const params =
                new URLSearchParams();


            params.set(
                "action",
                "createTicket"
            );


            /*
             * Registration ID is optional.
             *
             * Empty string is intentionally sent.
             */

            params.set(
                "registrationId",
                data.registrationId
            );


            params.set(
                "name",
                data.name
            );

            params.set(
                "className",
                data.className
            );

            params.set(
                "section",
                data.section
            );

            params.set(
                "email",
                data.email
            );

            params.set(
                "category",
                data.category
            );

            params.set(
                "subject",
                data.subject
            );

            params.set(
                "message",
                data.message
            );


            const response =
                await fetch(

                    HELP_API_URL +
                    "?" +
                    params.toString(),

                    {
                        method: "GET",
                        cache: "no-store"
                    }

                );


            if (!response.ok) {

                throw new Error(
                    "Unable to connect to support server."
                );

            }


            const result =
                await response.json();


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Unable to submit support request."
                );

            }


            /* =================================================
               EMAILJS
            ================================================= */

            try {

                await sendAdminEmail({

                    ...data,

                    ticketId:
                        result.ticketId

                });

            } catch (emailError) {

                console.error(
                    "EmailJS error:",
                    emailError
                );

                /*
                 * Ticket has already been created.
                 * Do not show an error to the user.
                 */

            }


            /* =================================================
               SAVE TICKET
            ================================================= */

            sessionStorage.setItem(
                "apsHelpTicketId",
                result.ticketId
            );


            sessionStorage.setItem(
                "apsHelpRegistrationId",
                result.registrationId || ""
            );


            /* =================================================
               SUCCESS PAGE
            ================================================= */

            window.location.href =
                "sorry.html?ticket=" +
                encodeURIComponent(
                    result.ticketId
                );

        }


        catch (error) {

            console.error(
                "Support error:",
                error
            );


            showStatus(

                error.message ||
                "Something went wrong. Please try again.",

                "error"

            );

        }


        finally {

            if (submitBtn) {

                submitBtn.disabled =
                    false;

            }

            if (submitText) {

                submitText.classList.remove(
                    "hidden"
                );

            }

            if (submitLoading) {

                submitLoading.classList.add(
                    "hidden"
                );

            }

        }

    }
);
