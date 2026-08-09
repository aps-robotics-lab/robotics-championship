import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
    apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",
    authDomain: "aps-robotics-championship.firebaseapp.com",
    databaseURL: "https://aps-robotics-championship-default-rtdb.firebaseio.com",
    projectId: "aps-robotics-championship",
    storageBucket: "aps-robotics-championship.firebasestorage.app",
    messagingSenderId: "1063542904891",
    appId: "1:1063542904891:web:82ff9bb3fba0b87384a41e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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

const successOverlay =
    document.getElementById("successOverlay");

const successRegistrationId =
    document.getElementById("successRegistrationId");

const continueBtn =
    document.getElementById("continueBtn");

const eventError =
    document.getElementById("eventError");

const remarks =
    document.getElementById("remarks");

const characterCount =
    document.getElementById("characterCount");

const participationType =
    document.getElementById("participationType");

const memberInstruction =
    document.getElementById("memberInstruction");


/* =========================
   HELPERS
========================= */

function getValue(id) {
    return (
        document.getElementById(id)?.value || ""
    ).trim();
}


function getTeamSize() {
    return Number(
        document.querySelector(
            'input[name="TeamSize"]:checked'
        )?.value || 1
    );
}


function getSelectedEvents() {
    return Array.from(
        document.querySelectorAll(
            'input[name="Events"]:checked'
        )
    ).map(input => input.value);
}


function generateRegistrationId() {

    const year = new Date().getFullYear();

    const random =
        Math.floor(
            1000 + Math.random() * 9000
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
   TEAM SIZE
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

    document
        .querySelectorAll(".additional-member")
        .forEach(card => {

            const number =
                Number(card.dataset.memberCard);

            const hidden =
                number > size;

            card.classList.toggle(
                "hidden-member",
                hidden
            );

            if (hidden) {
                clearMemberFields(number);
            }
        });


    if (participationType) {

        participationType.value =
            size === 1
                ? "Solo"
                : `Team of ${size}`;
    }


    const messages = {
        1: "Solo participation selected. No additional members required.",
        2: "Team of 2 selected. Please enter details for Participant 02.",
        3: "Team of 3 selected. Please enter details for Participants 02 and 03.",
        4: "Team of 4 selected. Please enter details for Participants 02–04.",
        5: "Team of 5 selected. Please enter details for Participants 02–05."
    };


    if (memberInstruction) {
        memberInstruction.textContent =
            messages[size];
    }


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

        if (name) {
            name.required = i <= size;
        }

        if (studentClass) {
            studentClass.required = i <= size;
        }

        if (section) {
            section.required = i <= size;
        }
    }
}


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
   INPUTS
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
   EVENTS
========================= */

function validateEvents() {

    const selected =
        getSelectedEvents();

    const valid =
        selected.length > 0;

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

    return {

        registrationId:
            generateRegistrationId(),

        TeamSize:
            getTeamSize(),

        ParticipationType:
            getValue("participationType"),

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
            getValue("member2Name"),

        Member2Class:
            getValue("member2Class"),

        Member2Section:
            getValue("member2Section"),

        Member3Name:
            getValue("member3Name"),

        Member3Class:
            getValue("member3Class"),

        Member3Section:
            getValue("member3Section"),

        Member4Name:
            getValue("member4Name"),

        Member4Class:
            getValue("member4Class"),

        Member4Section:
            getValue("member4Section"),

        Member5Name:
            getValue("member5Name"),

        Member5Class:
            getValue("member5Class"),

        Member5Section:
            getValue("member5Section"),

        Remarks:
            getValue("remarks"),

        registrationDate:
            now.toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            )

    };
}


/* =========================
   FIREBASE AUTH
========================= */

async function ensureAnonymousLogin() {

    if (auth.currentUser) {
        return auth.currentUser;
    }

    const result =
        await signInAnonymously(auth);

    return result.user;
}


/* =========================
   SAVE
========================= */

async function saveRegistration(data) {

    await ensureAnonymousLogin();

    const registrationRef =
        push(
            ref(
                db,
                "registrations"
            )
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
            "EmailJS SDK failed to load."
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
                data.TeamName ||
                "Not specified",

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
                data.Member2Name ||
                "Not applicable",

            Member2Class:
                data.Member2Class || "",

            Member2Section:
                data.Member2Section || "",

            Member3Name:
                data.Member3Name ||
                "Not applicable",

            Member3Class:
                data.Member3Class || "",

            Member3Section:
                data.Member3Section || "",

            Member4Name:
                data.Member4Name ||
                "Not applicable",

            Member4Class:
                data.Member4Class || "",

            Member4Section:
                data.Member4Section || "",

            Member5Name:
                data.Member5Name ||
                "Not applicable",

            Member5Class:
                data.Member5Class || "",

            Member5Section:
                data.Member5Section || "",

            Remarks:
                data.Remarks ||
                "No additional remarks.",

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
        submitBtn.classList.add("loading");

        try {

            await saveRegistration(data);

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

            if (
                error?.code ===
                "auth/operation-not-allowed"
            ) {

                showMessage(
                    "Registration authentication is disabled in Firebase. Enable Anonymous Authentication in Firebase Console.",
                    "error"
                );

            } else if (
                error?.code ===
                "PERMISSION_DENIED"
            ) {

                showMessage(
                    "Firebase denied the registration. Please check your Realtime Database rules.",
                    "error"
                );

            } else {

                showMessage(
                    "Registration could not be completed. Please try again.",
                    "error"
                );
            }

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
