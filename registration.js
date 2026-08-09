import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
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
const db = getDatabase(app);

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

const getValue = id => document.getElementById(id)?.value.trim() || "";

function getTeamSize() {
  const selected = document.querySelector('input[name="TeamSize"]:checked');
  return selected ? Number(selected.value) : 1;
}

function getSelectedEvents() {
  return [...document.querySelectorAll('input[name="Events"]:checked')].map(x => x.value);
}

function generateRegistrationId() {
  return `APS-RBC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function showMessage(message, type="error") {
  formMessage.textContent = message;
  formMessage.className = `form-message show ${type}`;
}

function updateTeamSize() {
  const size = getTeamSize();
  document.querySelectorAll(".additional-member").forEach(card => {
    const n = Number(card.dataset.memberCard);
    const active = n <= size;
    card.classList.toggle("hidden-member", !active);
    [ `member${n}Name`, `member${n}Class`, `member${n}Section` ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.required = active;
      if (!active && el) el.value = "";
    });
  });
  participationType.value = size === 1 ? "Solo" : `Team of ${size}`;
  const text = {
    1:"Solo participation selected. No additional members required.",
    2:"Team of 2 selected. Please enter details for Participant 02.",
    3:"Team of 3 selected. Please enter details for Participants 02 and 03.",
    4:"Team of 4 selected. Please enter details for Participants 02–04.",
    5:"Team of 5 selected. Please enter details for Participants 02–05."
  };
  memberInstruction.textContent = text[size];
}

document.querySelectorAll('input[name="TeamSize"]').forEach(x => x.addEventListener("change", updateTeamSize));
updateTeamSize();

document.querySelectorAll('input[name="Events"]').forEach(x => x.addEventListener("change", () => {
  eventError.textContent = getSelectedEvents().length ? "" : "Please select at least one event.";
}));

remarks?.addEventListener("input", () => characterCount.textContent = remarks.value.length);

document.getElementById("mobileNumber")?.addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g,"").slice(0,10);
});

document.getElementById("emailAddress")?.addEventListener("blur", e => {
  e.target.value = e.target.value.trim().toLowerCase();
});

function collectData() {
  const d = {
    registrationId: generateRegistrationId(),
    TeamSize: getTeamSize(),
    ParticipationType: participationType.value,
    StudentName: getValue("studentName"),
    Class: getValue("studentClass"),
    Section: getValue("studentSection"),
    MobileNumber: getValue("mobileNumber"),
    EmailAddress: getValue("emailAddress"),
    TeamName: getValue("teamName"),
    Events: getSelectedEvents(),
    Remarks: getValue("remarks"),
    registrationDate: new Date().toLocaleString("en-IN", {dateStyle:"medium", timeStyle:"short"})
  };
  for (let i=2;i<=5;i++) {
    d[`Member${i}Name`] = getValue(`member${i}Name`);
    d[`Member${i}Class`] = getValue(`member${i}Class`);
    d[`Member${i}Section`] = getValue(`member${i}Section`);
  }
  return d;
}

form?.addEventListener("submit", async e => {
  e.preventDefault();
  formMessage.className = "form-message";
  if (!form.checkValidity()) { form.reportValidity(); return; }
  if (!getSelectedEvents().length) { eventError.textContent="Please select at least one event."; return; }
  if (submitBtn.disabled) return;

  const data = collectData();
  submitBtn.disabled = true;
  submitBtn.classList.add("loading");

  try {
    const r = push(ref(db, "registrations"));
    await set(r, data);

    sessionStorage.setItem("apsRegistrationId", data.registrationId);
    sessionStorage.setItem("apsRegistrationName", data.StudentName);

    successRegistrationId.textContent = data.registrationId;
    successOverlay.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    showMessage("Registration could not be completed. Please try again.","error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }
});

continueBtn?.addEventListener("click", () => location.href="thankyou.html");
