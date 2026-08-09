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


const emailScript =
document.createElement("script");

emailScript.src =
"https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

emailScript.onload = () => {

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
   STATUS
========================================================= */

function showStatus(message, type = "error") {

  formStatus.textContent =
    message;

  formStatus.className =
    `form-status ${type}`;
}


function clearStatus() {

  formStatus.textContent = "";

  formStatus.className =
    "form-status";
}


/* =========================================================
   VALUE
========================================================= */

function value(id) {

  return (
    document.getElementById(id)?.value || ""
  ).trim();
}


/* =========================================================
   EMAILJS WAIT
========================================================= */

async function waitForEmailJS() {

  for (
    let i = 0;
    i < 40 && !window.emailjs;
    i++
  ) {

    await new Promise(
      resolve => setTimeout(resolve, 250)
    );

  }

  return !!window.emailjs;
}


/* =========================================================
   SEND ADMIN EMAIL
========================================================= */

async function sendAdminEmail(data) {

  const loaded =
    await waitForEmailJS();

  if (!loaded) {

    throw new Error(
      "EmailJS could not be loaded."
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

      /*
       * Registration ID is OPTIONAL.
       * If empty, EmailJS receives "Not provided".
       */

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
   SUBMIT
========================================================= */

form?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    clearStatus();


    if (!form.checkValidity()) {

      form.reportValidity();

      return;
    }


    if (submitBtn.disabled) {

      return;
    }


    const data = {

      /*
       * OPTIONAL
       *
       * Empty value is allowed.
       */

      registrationId:
        value("registrationId"),

      name:
        value("name"),

      className:
        value("className"),

      section:
        value("section"),

      email:
        value("email").toLowerCase(),

      category:
        value("category"),

      subject:
        value("subject"),

      message:
        value("message")

    };


    submitBtn.disabled = true;

    submitText.classList.add(
      "hidden"
    );

    submitLoading.classList.remove(
      "hidden"
    );


    try {

      const params =
        new URLSearchParams({

          action:
            "createTicket",

          /*
           * Can be empty.
           */

          registrationId:
            data.registrationId,

          name:
            data.name,

          className:
            data.className,

          section:
            data.section,

          email:
            data.email,

          category:
            data.category,

          subject:
            data.subject,

          message:
            data.message

        });


      const response =
        await fetch(
          `${HELP_API_URL}?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store"
          }
        );


      const result =
        await response.json();


      if (!result.success) {

        throw new Error(
          result.message ||
          "Unable to submit support request."
        );

      }


      /* ---------------------------------------------
         EMAIL ADMIN
      --------------------------------------------- */

      try {

        await sendAdminEmail({

          ...data,

          ticketId:
            result.ticketId

        });

      } catch (emailError) {

        /*
         * Do not block ticket creation if
         * EmailJS has a temporary problem.
         */

        console.error(
          "EmailJS admin notification failed:",
          emailError
        );

      }


      /* ---------------------------------------------
         SAVE TICKET INFORMATION
      --------------------------------------------- */

      sessionStorage.setItem(
        "apsHelpTicketId",
        result.ticketId
      );


      sessionStorage.setItem(
        "apsHelpRegistrationId",
        result.registrationId || ""
      );


      /* ---------------------------------------------
         REDIRECT
      --------------------------------------------- */

      window.location.href =
        `sorry.html?ticket=${encodeURIComponent(
          result.ticketId
        )}`;


    } catch (error) {

      console.error(error);

      showStatus(
        error.message ||
        "Something went wrong. Please try again.",
        "error"
      );

    } finally {

      submitBtn.disabled = false;

      submitText.classList.remove(
        "hidden"
      );

      submitLoading.classList.add(
        "hidden"
      );

    }

  }
);
