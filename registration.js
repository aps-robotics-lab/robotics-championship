import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

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

const EMAILJS_PUBLIC_KEY = "GnxniZ70ndujyjDpe";
const EMAILJS_SERVICE_ID = "service_5m4uzhb";
const EMAILJS_TEMPLATE_ID = "template_5qb8b2p";

const emailScript = document.createElement("script");
emailScript.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
emailScript.onload = () => {
    if (window.emailjs) window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
};
document.head.appendChild(emailScript);

const form = document.getElementById("registrationForm");
const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");
const successOverlay = document.getElementById("successOverlay");
const successRegistrationId = document.getElementById("successRegistrationId");
const continueBtn = document.getElementById("continueBtn");
const eventError = document.getElementById("eventError");
const remarks = document.getElementById("remarks");
const characterCount = document.getElementById("characterCount");
const participationType = document.getElementById("participationType");
const memberInstruction = document.getElementById("memberInstruction");
const memberCards = document.getElementById("memberCards");

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function getTeamSize() {
    const selected = document.querySelector('input[name="TeamSize"]:checked');
    return selected ? Number(selected.value) : 1;
}

function getSelectedEvents() {
    return Array.from(document.querySelectorAll('input[name="Events"]:checked')).map(input => input.value);
}

function generateRegistrationId() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `APS-RBC-${year}-${random}`;
}

function showMessage(message, type = "error") {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type} show`;
}

function clearMessage() {
    formMessage.textContent = "";
    formMessage.className = "form-message";
}

function classOptions() {
    return `<option value="">Select Class</option>
        <option value="VI">VI</option><option value="VII">VII</option>
        <option value="VIII">VIII</option><option value="IX">IX</option>
        <option value="X">X</option><option value="XI">XI</option><option value="XII">XII</option>`;
}

function renderMemberCards() {
    memberCards.innerHTML = "";
    for (let i = 2; i <= 5; i++) {
        memberCards.insertAdjacentHTML("beforeend", `
            <div class="member-card additional-member hidden-member" data-member-card="${i}">
                <div class="member-card-header">
                    <div class="member-icon"><i class="fa-solid fa-user"></i></div>
                    <div><span>PARTICIPANT 0${i}</span><h3>Team Member ${i}</h3></div>
                </div>
                <div class="field-grid">
                    <div class="field full-field">
                        <label for="member${i}Name"><i class="fa-solid fa-user"></i> Full Name</label>
                        <input type="text" id="member${i}Name" name="Member${i}Name" placeholder="Enter member ${i} name">
                    </div>
                    <div class="field">
                        <label for="member${i}Class"><i class="fa-solid fa-graduation-cap"></i> Class</label>
                        <select id="member${i}Class" name="Member${i}Class">${classOptions()}</select>
                    </div>
                    <div class="field">
                        <label for="member${i}Section"><i class="fa-solid fa-layer-group"></i> Section</label>
                        <input type="text" id="member${i}Section" name="Member${i}Section" placeholder="e.g. A" maxlength="5">
                    </div>
                </div>
            </div>`);
    }
}

function clearMemberFields(number) {
    [`member${number}Name`, `member${number}Class`, `member${number}Section`].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = "";
    });
}

function updateTeamSize() {
    const size = getTeamSize();
    document.querySelectorAll(".additional-member").forEach(card => {
        const number = Number(card.dataset.memberCard);
        const active = number <= size;
        card.classList.toggle("hidden-member", !active);
        if (!active) clearMemberFields(number);
    });

    participationType.value = size === 1 ? "Solo" : `Team of ${size}`;

    const instructions = {
        1: "Solo participation selected. No additional members required.",
        2: "Team of 2 selected. Please enter details for Participant 02.",
        3: "Team of 3 selected. Please enter details for Participants 02 and 03.",
        4: "Team of 4 selected. Please enter details for Participants 02–04.",
        5: "Team of 5 selected. Please enter details for Participants 02–05."
    };
    memberInstruction.textContent = instructions[size];

    for (let i = 2; i <= 5; i++) {
        document.getElementById(`member${i}Name`).required = i <= size;
        document.getElementById(`member${i}Class`).required = i <= size;
        document.getElementById(`member${i}Section`).required = i <= size;
    }
}

async function initializeAuthentication() {
    if (!auth.currentUser) await signInAnonymously(auth);
    return auth.currentUser;
}

function collectRegistrationData() {
    const size = getTeamSize();
    const data = {
        registrationId: generateRegistrationId(),
        TeamSize: size,
        ParticipationType: participationType.value,
        StudentName: getValue("studentName"),
        Class: getValue("studentClass"),
        Section: getValue("studentSection"),
        MobileNumber: getValue("mobileNumber"),
        EmailAddress: getValue("emailAddress").toLowerCase(),
        TeamName: getValue("teamName"),
        Events: getSelectedEvents(),
        Remarks: getValue("remarks"),
        registrationDate: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    };

    for (let i = 2; i <= 5; i++) {
        data[`Member${i}Name`] = i <= size ? getValue(`member${i}Name`) : "";
        data[`Member${i}Class`] = i <= size ? getValue(`member${i}Class`) : "";
        data[`Member${i}Section`] = i <= size ? getValue(`member${i}Section`) : "";
    }
    return data;
}

async function saveRegistration(data) {
    await initializeAuthentication();
    if (!auth.currentUser) throw new Error("Firebase authentication unavailable.");

    const newRef = push(ref(db, "registrations"));
    await set(newRef, data);
    return newRef.key;
}

async function waitForEmailJS() {
    let attempts = 0;
    while (!window.emailjs && attempts < 40) {
        await new Promise(resolve => setTimeout(resolve, 250));
        attempts++;
    }
    if (!window.emailjs) throw new Error("EmailJS SDK failed to load.");
}

async function sendConfirmationEmail(data) {
    await waitForEmailJS();

    const params = {
        StudentName: data.StudentName,
        EmailAddress: data.EmailAddress,
        registrationId: data.registrationId,
        TeamName: data.TeamName || "Not specified",
        TeamSize: String(data.TeamSize),
        ParticipationType: data.ParticipationType,
        Class: data.Class,
        Section: data.Section,
        MobileNumber: data.MobileNumber,
        Events: data.Events.join(", "),
        Remarks: data.Remarks || "No additional remarks.",
        registrationDate: data.registrationDate
    };

    for (let i = 2; i <= 5; i++) {
        params[`Member${i}Name`] = data[`Member${i}Name`] || "Not applicable";
        params[`Member${i}Class`] = data[`Member${i}Class`] || "";
        params[`Member${i}Section`] = data[`Member${i}Section`] || "";
    }

    return window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
}

function showSuccess(id) {
    sessionStorage.setItem("apsRegistrationId", id);
    sessionStorage.setItem("apsRegistrationName", getValue("studentName"));
    successRegistrationId.textContent = id;
    successOverlay.classList.remove("hidden");
}

function validateEvents() {
    const valid = getSelectedEvents().length > 0;
    eventError.textContent = valid ? "" : "Please select at least one event.";
    return valid;
}

renderMemberCards();
document.querySelectorAll('input[name="TeamSize"]').forEach(input => input.addEventListener("change", updateTeamSize));
updateTeamSize();

remarks.addEventListener("input", () => characterCount.textContent = remarks.value.length);

document.getElementById("mobileNumber").addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
});

document.getElementById("emailAddress").addEventListener("blur", e => {
    e.target.value = e.target.value.trim().toLowerCase();
});

document.querySelectorAll('input[name="Events"]').forEach(input => input.addEventListener("change", validateEvents));

initializeAuthentication().catch(error => {
    console.error("Firebase authentication error:", error);
    showMessage("Secure connection to the registration system could not be established. Please refresh and try again.", "error");
});

form.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (!validateEvents()) return;
    if (submitBtn.disabled) return;

    const data = collectRegistrationData();
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    try {
        await saveRegistration(data);

        try {
            await sendConfirmationEmail(data);
        } catch (emailError) {
            console.error("EmailJS failed after Firebase save:", emailError);
        }

        showSuccess(data.registrationId);
    } catch (error) {
        console.error("Registration failed:", error);
        showMessage("Registration could not be completed. Please try again.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
    }
});

continueBtn.addEventListener("click", () => {
    window.location.href = "thankyou.html";
});
