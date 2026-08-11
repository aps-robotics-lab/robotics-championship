import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, update, serverTimestamp, get } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { helpFirebaseConfig } from "./firebase-config.js";

const app = initializeApp(helpFirebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const form = document.getElementById("helpForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");
const submitText = document.getElementById("submitText");
const submitLoading = document.getElementById("submitLoading");
const trackerForm = document.getElementById("helpTrackerForm");
const trackerInput = document.getElementById("trackerReference");
const trackerStatus = document.getElementById("trackerStatus");
const trackerResult = document.getElementById("trackerResult");
const trackerProgress = document.getElementById("trackerProgress");
const trackerProgressText = document.getElementById("trackerProgressText");
const trackerStatusText = document.getElementById("trackerStatusText");
const trackerUpdated = document.getElementById("trackerUpdated");
const trackerNote = document.getElementById("trackerNote");

function showFormStatus(text, type="") {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.className = `form-status ${type}`.trim();
}

function generateReferenceId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i=0;i<5;i++) result += chars[Math.floor(Math.random()*chars.length)];
    return `APS-${result}`;
}

async function createUniqueReference() {
    for (let attempt=0; attempt<5; attempt++) {
        const referenceId = generateReferenceId();
        const snap = await get(ref(db, `ticketStatusLookup/${referenceId}`));
        if (!snap.exists()) return referenceId;
    }
    throw new Error("Could not generate a unique help reference ID.");
}

function formatDate(value) {
    const date = typeof value === "number" ? new Date(value) : new Date(value || 0);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-IN", {day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"});
}

trackerForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const referenceId = trackerInput?.value.trim().toUpperCase() || "";
    if (!/^APS-[A-Z0-9]{5}$/.test(referenceId)) {
        if (trackerStatus) trackerStatus.textContent = "Enter a valid reference such as APS-A1B2C.";
        trackerResult?.classList.add("hidden");
        return;
    }
    if (trackerStatus) trackerStatus.textContent = "Checking progress...";
    try {
        const snap = await get(ref(db, `ticketStatusLookup/${referenceId}`));
        if (!snap.exists()) {
            if (trackerStatus) trackerStatus.textContent = "Reference not found. Check the ID and try again.";
            trackerResult?.classList.add("hidden");
            return;
        }
        const data = snap.val() || {};
        const progress = Math.max(0, Math.min(100, Number(data.progress || 0)));
        if (trackerStatusText) trackerStatusText.textContent = data.status || "Waiting for Approval";
        if (trackerProgressText) trackerProgressText.textContent = `${progress}%`;
        if (trackerProgress) trackerProgress.style.width = `${progress}%`;
        if (trackerUpdated) trackerUpdated.textContent = formatDate(data.updatedAt);
        if (trackerNote) trackerNote.textContent = data.statusNote || "Our team will review your request and contact you soon.";
        trackerResult?.classList.remove("hidden");
        if (trackerStatus) trackerStatus.textContent = "";
    } catch (error) {
        console.error(error);
        if (trackerStatus) trackerStatus.textContent = "Unable to check progress right now.";
        trackerResult?.classList.add("hidden");
    }
});

form?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (submitBtn) submitBtn.disabled = true;
    submitText?.classList.add("hidden");
    submitLoading?.classList.remove("hidden");
    showFormStatus("");
    try {
        if (!auth.currentUser) await signInAnonymously(auth);
        const referenceId = await createUniqueReference();
        const ticketKey = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const createdAt = Date.now();
        const ticket = {
            ticketId: ticketKey,
            referenceId,
            registrationId: document.getElementById("registrationId")?.value.trim() || "",
            name: document.getElementById("name")?.value.trim() || "",
            className: document.getElementById("className")?.value || "",
            section: document.getElementById("section")?.value.trim().toUpperCase() || "",
            email: document.getElementById("email")?.value.trim().toLowerCase() || "",
            category: document.getElementById("category")?.value || "General",
            messageRecipient: document.getElementById("messageRecipient")?.value || "General Help",
            subject: document.getElementById("subject")?.value.trim() || "",
            message: document.getElementById("message")?.value.trim() || "",
            status: "Waiting for Approval",
            progress: 0,
            statusNote: "Our team will review your request and contact you soon.",
            assignedAgentUid: "",
            createdBy: auth.currentUser.uid,
            createdAt,
            updatedAt: createdAt
        };
        const lookup = {
            referenceId,
            status: ticket.status,
            progress: 0,
            statusNote: ticket.statusNote,
            updatedAt: createdAt
        };
        await update(ref(db), {
            [`tickets/${ticketKey}`]: ticket,
            [`ticketStatusLookup/${referenceId}`]: lookup
        });
        sessionStorage.setItem("apsHelpReferenceId", referenceId);
        sessionStorage.setItem("apsHelpTicketId", ticketKey);
        window.location.href = `help-thankyou.html?reference=${encodeURIComponent(referenceId)}`;
    } catch (error) {
        console.error("Help ticket error:", error);
        showFormStatus("Error submitting your request. Please try again.", "error");
        if (submitBtn) submitBtn.disabled = false;
        submitText?.classList.remove("hidden");
        submitLoading?.classList.add("hidden");
    }
});

// Hidden portal access is intentionally not the security boundary; Firebase Auth + rules are.
