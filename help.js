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
   STATUS
========================================================= */

function showStatus(message, type) {

  formStatus.textContent =
    message;

  formStatus.className =
    "form-status " +
    (type || "error");

}


function clearStatus() {

  formStatus.textContent =
    "";

  formStatus.className =
    "form-status";

}


/* =========================================================
   GET VALUE
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
   EMAILJS LOADER
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
   SEND EMAIL TO ADMIN
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
   SUBMIT FORM
========================================================= */

form.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    clearStatus();


    /*
     * IMPORTANT:
     *
     * Registration ID is NOT checked here.
     */

    if (
      !getValue("name") ||
      !getValue("className") ||
      !getValue("section") ||
      !getValue("email") ||
      !getValue("subject") ||
      !getValue("message")
    ) {

      showStatus(
        "Please fill in all required fields.",
        "error"
      );

      return;

    }


    if (
      !submitBtn ||
      submitBtn.disabled
    ) {

      return;

    }


    const data = {

      /*
       * OPTIONAL
       */
      registrationId:
        getValue("registrationId"),

      name:
        getValue("name"),

      className:
        getValue("className"),

      section:
        getValue("section"),

      email:
        getValue("email")
          .toLowerCase(),

      category:
        getValue("category") ||
        "Other",

      subject:
        getValue("subject"),

      message:
        getValue("message")

    };


    submitBtn.disabled =
      true;


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
       * Build API parameters.
       *
       * Registration ID is allowed
       * to be completely empty.
       */

      const params =
        new URLSearchParams();


      params.set(
        "action",
        "createTicket"
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


      /*
       * Only send registrationId if
       * the user actually entered one.
       */

      if (data.registrationId) {

        params.set(
          "registrationId",
          data.registrationId
        );

      }


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
          "Unable to connect to the support server."
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


      /*
       * Send EmailJS notification.
       */

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
         * Ticket is already saved.
         * Email failure does not cancel it.
         */

      }


      /*
       * Save ticket information.
       */

      sessionStorage.setItem(
        "apsHelpTicketId",
        result.ticketId
      );


      sessionStorage.setItem(
        "apsHelpRegistrationId",
        data.registrationId
      );


      /*
       * Redirect to sorry page.
       */

      window.location.href =
        "sorry.html?ticket=" +
        encodeURIComponent(
          result.ticketId
        );


    } catch (error) {

      console.error(
        "HELP FORM ERROR:",
        error
      );


      showStatus(
        error.message ||
        "Something went wrong. Please try again.",
        "error"
      );


    } finally {

      submitBtn.disabled =
        false;


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
