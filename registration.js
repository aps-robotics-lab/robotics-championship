import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  set
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyD83i25yCvb17M66YILnPISTrP3p4ZND6I",

    authDomain:
        "aps-robotic-champs-2026.firebaseapp.com",

    databaseURL:
        "https://aps-robotic-champs-2026-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "aps-robotic-champs-2026",

    storageBucket:
        "aps-robotic-champs-2026.firebasestorage.app",

    messagingSenderId:
        "583098137656",

    appId:
        "1:583098137656:web:b59467faab54a67271facd",

    measurementId:
        "G-1G58X0KSD0"
};



const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =========================
   EMAILJS
========================= */

const EMAILJS_PUBLIC_KEY = "GnxniZ70ndujyjDpe";
const EMAILJS_SERVICE_ID = "service_5m4uzhb";
const EMAILJS_TEMPLATE_ID = "template_5qb8b2p";

const emailScript = document.createElement("script");

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


/* =========================
   ELEMENTS
========================= */

const form = document.getElementById("registrationForm");
const submitBtn = document.getElementById("submitBtn");

const formMessage = document.getElementById("formMessage");
const successOverlay = document.getElementById("successOverlay");
const successRegistrationId =
  document.getElementById("successRegistrationId");

const continueBtn = document.getElementById("continueBtn");

const eventError = document.getElementById("eventError");

const remarks = document.getElementById("remarks");
const characterCount = document.getElementById("characterCount");

const participationType =
  document.getElementById("participationType");

const memberInstruction =
  document.getElementById("memberInstruction");


/* =========================
   TEAM SECTION
========================= */

const memberSection =
  document.querySelector("#memberInstruction")?.closest(".form-section");


/* =========================
   HELPERS
========================= */

const getValue = (id) => {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
};


const getTeamSize = () => {
  return Number(
    document.querySelector(
      'input[name="TeamSize"]:checked'
    )?.value || 1
  );
};


const getSelectedEvents = () => {
  return Array.from(
    document.querySelectorAll(
      'input[name="Events"]:checked'
    )
  ).map(input => input.value);
};


function generateRegistrationId() {

  const year = new Date().getFullYear();

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `APS-RBC-${year}-${random}`;
}


/* =========================
   MESSAGES
========================= */

function showMessage(message, type = "error") {

  if (!formMessage) return;

  formMessage.textContent = message;

  formMessage.className =
    `form-message ${type}`;
}


function clearMessage() {

  if (!formMessage) return;

  formMessage.textContent = "";

  formMessage.className =
    "form-message";
}


/* =========================
   MEMBER FIELDS
========================= */

function clearMemberFields(number) {

  [
    `member${number}Name`,
    `member${number}Class`,
    `member${number}Section`
  ].forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });

}


function updateTeamSize() {

  const size = getTeamSize();

  /*
     IMPORTANT:
     Solo users completely hide the
     Team Members section.
  */

  if (memberSection) {

    memberSection.style.display =
      size === 1 ? "none" : "";

  }


  document
    .querySelectorAll(".additional-member")
    .forEach(card => {

      const number =
        Number(card.dataset.memberCard);

      const visible =
        number <= size;

      card.classList.toggle(
        "hidden-member",
        !visible
      );

      if (!visible) {
        clearMemberFields(number);
      }

    });


  if (participationType) {

    participationType.value =
      size === 1
        ? "Solo"
        : `Team of ${size}`;

  }


  if (memberInstruction) {

    const messages = {

      1:
        "Solo participation selected.",

      2:
        "Team of 2 selected. Please enter Participant 02 details.",

      3:
        "Team of 3 selected. Please enter Participants 02 and 03 details.",

      4:
        "Team of 4 selected. Please enter Participants 02–04 details.",

      5:
        "Team of 5 selected. Please enter Participants 02–05 details."

    };

    memberInstruction.textContent =
      messages[size];

  }


  /*
     Required fields only for
     members actually participating.
  */

  for (let i = 2; i <= 5; i++) {

    const name =
      document.getElementById(
        `member${i}Name`
      );

    const studentClass =
      document.getElementById(
        `member${i}Class`
      );

    const section =
      document.getElementById(
        `member${i}Section`
      );

    const required =
      i <= size;

    if (name) name.required = required;
    if (studentClass) studentClass.required = required;
    if (section) section.required = required;
  }
}


/* =========================
   TEAM SIZE EVENTS
========================= */

document
  .querySelectorAll('input[name="TeamSize"]')
  .forEach(input => {

    input.addEventListener(
      "change",
      updateTeamSize
    );

  });

updateTeamSize();


/* =========================
   REMARKS
========================= */

remarks?.addEventListener(
  "input",
  () => {

    if (characterCount) {

      characterCount.textContent =
        remarks.value.length;

    }

  }
);


/* =========================
   MOBILE
========================= */

document
  .getElementById("mobileNumber")
  ?.addEventListener(
    "input",
    event => {

      event.target.value =
        event.target.value
          .replace(/\D/g, "")
          .slice(0, 10);

    }
  );


/* =========================
   EMAIL
========================= */

document
  .getElementById("emailAddress")
  ?.addEventListener(
    "blur",
    event => {

      event.target.value =
        event.target.value
          .trim()
          .toLowerCase();

    }
  );


/* =========================
   EVENT VALIDATION
========================= */

function validateEvents() {

  const events =
    getSelectedEvents();

  const valid =
    events.length > 0;

  if (eventError) {

    eventError.textContent =
      valid
        ? ""
        : "Please select at least one event.";

  }

  return valid;
}


document
  .querySelectorAll('input[name="Events"]')
  .forEach(input => {

    input.addEventListener(
      "change",
      validateEvents
    );

  });


/* =========================
   COLLECT DATA
========================= */

function collectRegistrationData() {

  const now = new Date();

  const teamSize =
    getTeamSize();

  return {

    registrationId:
      generateRegistrationId(),

    TeamSize:
      teamSize,

    ParticipationType:
      teamSize === 1
        ? "Solo"
        : `Team of ${teamSize}`,

    StudentName:
      getValue("studentName"),

    Class:
      getValue("studentClass"),

    Section:
      getValue("studentSection"),

    MobileNumber:
      getValue("mobileNumber"),

    EmailAddress:
      getValue("emailAddress"),

    TeamName:
      getValue("teamName"),

    Events:
      getSelectedEvents(),

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
      getValue("remarks"),

    registrationDate:
      now.toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short"
        }
      ),

    timestamp:
      Date.now()
  };
}


/* =========================
   FIREBASE SAVE
========================= */

async function saveRegistration(data) {

  const registrationRef =
    push(
      ref(db, "registrations")
    );

  await set(
    registrationRef,
    data
  );

  return registrationRef.key;
}


/* =========================
   EMAILJS
========================= */

async function waitForEmailJS() {

  for (
    let i = 0;
    !window.emailjs && i < 40;
    i++
  ) {

    await new Promise(
      resolve =>
        setTimeout(resolve, 250)
    );

  }

  if (!window.emailjs) {

    throw new Error(
      "EmailJS failed to load."
    );

  }
}


async function sendConfirmationEmail(data) {

  await waitForEmailJS();

  return window.emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {

      StudentName:
        data.StudentName,

      EmailAddress:
        data.EmailAddress,

      registrationId:
        data.registrationId,

      TeamName:
        data.TeamName || "Not specified",

      TeamSize:
        String(data.TeamSize),

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
        data.Member2Name || "Not applicable",

      Member2Class:
        data.Member2Class || "",

      Member2Section:
        data.Member2Section || "",

      Member3Name:
        data.Member3Name || "Not applicable",

      Member3Class:
        data.Member3Class || "",

      Member3Section:
        data.Member3Section || "",

      Member4Name:
        data.Member4Name || "Not applicable",

      Member4Class:
        data.Member4Class || "",

      Member4Section:
        data.Member4Section || "",

      Member5Name:
        data.Member5Name || "Not applicable",

      Member5Class:
        data.Member5Class || "",

      Member5Section:
        data.Member5Section || "",

      Remarks:
        data.Remarks || "No additional remarks.",

      registrationDate:
        data.registrationDate

    }
  );
}


/* =========================
   SUCCESS
========================= */

function showSuccess(id) {

  if (successRegistrationId) {

    successRegistrationId.textContent =
      id;

  }

  if (successOverlay) {

    successOverlay.classList.remove(
      "hidden"
    );

  }
}


/* =========================
   SUBMIT
========================= */

form?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    clearMessage();

    if (!form.checkValidity()) {

      form.reportValidity();

      return;

    }

    if (!validateEvents()) {
      return;
    }

    if (submitBtn?.disabled) {
      return;
    }

    const data =
      collectRegistrationData();

    submitBtn.disabled = true;

    submitBtn.classList.add(
      "loading"
    );

    try {

      /*
         STEP 1
         Firebase is the important operation.
      */

      const key =
        await saveRegistration(data);

      console.log(
        "Registration saved:",
        key,
        data
      );


      /*
         STEP 2
         Email is secondary.
         Even if EmailJS fails,
         registration remains saved.
      */

      try {

        await sendConfirmationEmail(
          data
        );

      } catch (emailError) {

        console.error(
          "EmailJS failed:",
          emailError
        );

      }


      sessionStorage.setItem(
        "apsRegistrationId",
        data.registrationId
      );

      sessionStorage.setItem(
        "apsRegistrationName",
        data.StudentName
      );


      showSuccess(
        data.registrationId
      );

    } catch (error) {

      console.error(
        "REGISTRATION ERROR:",
        error
      );

      showMessage(
        "Registration could not be saved. Please check your internet connection and try again.",
        "error"
      );

    } finally {

      submitBtn.disabled = false;

      submitBtn.classList.remove(
        "loading"
      );

    }

  }
);


/* =========================
   CONTINUE
========================= */

continueBtn?.addEventListener(
  "click",
  () => {

    window.location.href =
      "thankyou.html";

  }
);
