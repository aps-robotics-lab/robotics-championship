import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { helpFirebaseConfig, mainFirebaseConfig, ADMIN_UID, AGENT_UID, AGENT_UIDS } from "./firebase-config.js";

const SERVICE_ID = "service_i9s33xx";
const TEMPLATE_ID = "template_ivt641m";
const PUBLIC_KEY = "GnxniZ70ndujyjDpe";

const mainApp = getApps().find(a => a.name === "mail-main") || initializeApp(mainFirebaseConfig, "mail-main");
const helpApp = getApps().find(a => a.name === "mail-help") || initializeApp(helpFirebaseConfig, "mail-help");
const mainAuth = getAuth(mainApp);
const helpAuth = getAuth(helpApp);
const mainDb = getDatabase(mainApp);
const helpDb = getDatabase(helpApp);

const form = document.getElementById("mailForm");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const status = document.getElementById("mailStatus");
const statusField = document.getElementById("registration_status");

function setStatus(message, type = "") { status.textContent = message; status.className = `status ${type}`; }

async function isMainAdmin(user) {
  if (!user) return false;
  const configured = ADMIN_UID && ADMIN_UID !== "REPLACE_WITH_MAIN_PROJECT_ADMIN_UID" && user.uid === ADMIN_UID;
  if (configured) return true;
  try { const snap = await get(ref(mainDb, `admins/${user.uid}`)); return snap.exists() && snap.val() === true; }
  catch { return false; }
}

async function isHelpingAgent(user) {
  if (!user) return false;
  if (Array.isArray(AGENT_UIDS) && AGENT_UIDS.includes(user.uid)) return true;
  if (AGENT_UID && user.uid === AGENT_UID) return true;
  try {
    const snap = await get(ref(helpDb, `agents/${user.uid}`));
    const value = snap.val();
    return snap.exists() && (value === true || (value && value.active === true));
  } catch { return false; }
}

function hasFiveClickPass() {
  try {
    const raw = sessionStorage.getItem("robokriti_mail_access");
    if (!raw) return false;
    const pass = JSON.parse(raw);
    const validRole = pass?.role === "registration" || pass?.role === "helping";
    const validTime = Number.isFinite(pass?.issuedAt) && (Date.now() - pass.issuedAt) <= 10 * 60 * 1000;
    return validRole && validTime;
  } catch {
    return false;
  }
}

async function verifyAccess() {
  // The intended access method is the hidden 5-click entry from either
  // authorized department dashboard. Firebase checks are retained as a
  // secondary path for existing authenticated department sessions.
  if (hasFiveClickPass()) return true;

  const users = [];
  await Promise.all([
    new Promise(resolve => onAuthStateChanged(mainAuth, async user => { if (user && await isMainAdmin(user)) users.push("registration"); resolve(); })),
    new Promise(resolve => onAuthStateChanged(helpAuth, async user => { if (user && await isHelpingAgent(user)) users.push("helping"); resolve(); }))
  ]);
  if (!users.length) {
    document.body.innerHTML = `<main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#03070d;color:#fff;font-family:Poppins,sans-serif;text-align:center"><div><h1 style="font-family:Orbitron,sans-serif">ACCESS DENIED</h1><p style="color:#9aaaba">Use the 5-click access from the Registration or Helping Department dashboard.</p><a href="index.html" style="color:#00c8ff">Return to RoboKriti</a></div></main>`;
    return false;
  }
  return true;
}

async function init() {
  if (!window.emailjs) { setStatus("Email service could not load. Check your connection.", "err"); return; }
  window.emailjs.init({ publicKey: PUBLIC_KEY, limitRate: { id: "robokriti-manual-mail", throttle: 10000 } });
  const allowed = await verifyAccess();
  if (!allowed) return;

  // Consume the short-lived 5-click pass after successful entry.
  sessionStorage.removeItem("robokriti_mail_access");
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  sendBtn.disabled = true;
  setStatus("Sending confirmation…");
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await window.emailjs.send(SERVICE_ID, TEMPLATE_ID, data);
    setStatus(`Confirmation sent to ${data.to_email}`, "ok");
    form.reset();
    statusField.value = "Registration Confirmed";
  } catch (error) {
    console.error(error);
    setStatus("Could not send the confirmation. Please check the EmailJS template/service and try again.", "err");
  } finally { sendBtn.disabled = false; }
});

clearBtn.addEventListener("click", () => { form.reset(); statusField.value = "Registration Confirmed"; setStatus(""); });
init();
