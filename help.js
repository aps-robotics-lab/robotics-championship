import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, push, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
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
const trackerStatus = document.getElementById("trackerStatus");
const trackerResult = document.getElementById("trackerResult");

function setStatus(text, type="") {
  if (!formStatus) return;
  formStatus.textContent = text;
  formStatus.className = `form-status ${type}`;
}

function makeReferenceId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return "APS-" + [...bytes].map(b => chars[b % chars.length]).join("");
}

async function sha256(value) {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2,"0")).join("");
}

function escapeText(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

form?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const email = document.getElementById("email")?.value.trim().toLowerCase() || "";
  if (!email) return;
  const lock = "apsHelpSubmitLock";
  if (sessionStorage.getItem(lock) === "1") return;
  sessionStorage.setItem(lock,"1");

  if (submitBtn) submitBtn.disabled = true;
  submitText?.classList.add("hidden");
  submitLoading?.classList.remove("hidden");

  try {
    if (!auth.currentUser) await signInAnonymously(auth);
    const ticketRef = push(ref(db, "tickets"));
    const referenceId = makeReferenceId();
    const emailHash = await sha256(email + "|" + referenceId);

    const ticket = {
      ticketId: ticketRef.key,
      referenceId,
      registrationId: document.getElementById("registrationId")?.value.trim() || "",
      name: document.getElementById("name").value.trim(),
      className: document.getElementById("className").value.trim(),
      section: document.getElementById("section").value.trim().toUpperCase(),
      email,
      category: document.getElementById("category").value,
      messageRecipient: document.getElementById("messageRecipient")?.value || "General Help",
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim(),
      status: "Waiting for Approval",
      progress: 10,
      publicMessage: "Your request is received. Our team will review it and contact you soon.",
      createdBy: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await set(ticketRef, ticket);
    await set(ref(db, `ticketStatusLookup/${referenceId}/${emailHash}`), {
      status: ticket.status, progress: ticket.progress, message: ticket.publicMessage, updatedAt: serverTimestamp()
    });

    sessionStorage.setItem("apsHelpReferenceId", referenceId);
    sessionStorage.setItem("apsHelpEmail", email);
    window.location.href = `help-thankyou.html?ref=${encodeURIComponent(referenceId)}`;
  } catch (error) {
    console.error("Help submission error:", error);
    sessionStorage.removeItem(lock);
    setStatus("Error submitting request. Please try again.", "error");
    submitBtn && (submitBtn.disabled = false);
    submitText?.classList.remove("hidden");
    submitLoading?.classList.add("hidden");
  }
});

trackerForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const reference = document.getElementById("trackReference")?.value.trim().toUpperCase() || "";
  const email = document.getElementById("trackEmail")?.value.trim().toLowerCase() || "";
  if (!/^APS-[A-Z0-9]{5}$/.test(reference) || !email) {
    if (trackerStatus) trackerStatus.textContent = "Enter a valid APS-XXXXX reference ID and the email used for the request.";
    return;
  }
  if (trackerStatus) trackerStatus.textContent = "Checking progress...";
  if (trackerResult) trackerResult.innerHTML = "";
  try {
    const emailHash = await sha256(email + "|" + reference);
    const snap = await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js").then(({get}) => get(ref(db, `ticketStatusLookup/${reference}/${emailHash}`)));
    if (!snap.exists()) {
      if (trackerStatus) trackerStatus.textContent = "No matching request was found. Check your reference ID and email.";
      return;
    }
    const s = snap.val() || {};
    if (trackerStatus) trackerStatus.textContent = "Request found.";
    if (trackerResult) trackerResult.innerHTML = `<div class="track-card"><strong>${escapeText(s.status || "In Review")}</strong><div class="progress"><span style="width:${Math.max(0,Math.min(100,Number(s.progress)||0))}%"></span></div><p>${escapeText(s.message || "Our team is reviewing your request.")}</p></div>`;
  } catch (err) {
    console.error(err);
    if (trackerStatus) trackerStatus.textContent = "Unable to check progress right now.";
  }
});
