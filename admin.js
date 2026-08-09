import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",
  authDomain: "aps-robotics-championship.firebaseapp.com",
  databaseURL: "https://aps-robotics-championship-default-rtdb.firebaseio.com",
  projectId: "aps-robotics-championship",
  storageBucket: "aps-robotics-championship.firebasestorage.app",
  messagingSenderId: "1063542904891",
  appId: "1:1063542904891:web:82ff9bb3fba0b87384a41e"
};

// Paste ONLY the Firebase Authentication UID of your admin user here.
const ADMIN_UID = "PASTE_ADMIN_UID_HERE";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const body = document.getElementById("registrationBody");
const status = document.getElementById("status");
const search = document.getElementById("search");

let registrations = {};

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loginError.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
  } catch (err) {
    loginError.textContent = friendlyError(err);
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => signOut(auth));
document.getElementById("refreshBtn").addEventListener("click", loadRegistrations);
search.addEventListener("input", () => render(search.value.trim().toLowerCase()));

onAuthStateChanged(auth, async user => {
  if (!user) {
    loginCard.classList.remove("hidden");
    dashboard.classList.add("hidden");
    return;
  }
  if (ADMIN_UID === "PASTE_ADMIN_UID_HERE" || user.uid !== ADMIN_UID) {
    loginError.textContent = "This account is not authorized as the admin.";
    await signOut(auth);
    return;
  }
  loginCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
  await loadRegistrations();
});

async function loadRegistrations() {
  status.textContent = "Loading registrations...";
  try {
    const snapshot = await get(ref(db, "registrations"));
    registrations = snapshot.exists() ? snapshot.val() : {};
    render(search.value.trim().toLowerCase());
    status.textContent = `${Object.keys(registrations).length} registration(s) loaded.`;
  } catch (err) {
    console.error(err);
    status.textContent = "Could not load registrations. Check Firebase Rules and ADMIN_UID.";
  }
}

function render(filter="") {
  body.innerHTML = "";
  Object.entries(registrations)
    .filter(([key, r]) => {
      const text = JSON.stringify(r).toLowerCase();
      return !filter || text.includes(filter);
    })
    .sort((a,b) => String(b[1].registrationDate||"").localeCompare(String(a[1].registrationDate||"")))
    .forEach(([key,r]) => {
      const members = [];
      for (let i=2;i<=5;i++) {
        if (r[`Member${i}Name`]) members.push(`${r[`Member${i}Name`]} (${r[`Member${i}Class`]||"-"}-${r[`Member${i}Section`]||"-"})`);
      }
      const tr=document.createElement("tr");
      tr.innerHTML = `
        <td>${esc(r.registrationId||key)}</td>
        <td>${esc(r.StudentName||"")}</td>
        <td>${esc(r.TeamName||"—")}</td>
        <td>${esc(r.ParticipationType||r.TeamSize||"")}</td>
        <td>${esc(r.Class||"")}</td>
        <td>${esc(r.Section||"")}</td>
        <td>${esc(r.MobileNumber||"")}</td>
        <td>${esc(r.EmailAddress||"")}</td>
        <td>${esc(Array.isArray(r.Events)?r.Events.join(", "):r.Events||"")}</td>
        <td class="members">${members.length ? members.map(esc).join("<br>") : "Solo"}</td>
        <td>${esc(r.registrationDate||"")}</td>`;
      body.appendChild(tr);
    });
}

function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#039;"}[c]));}
function friendlyError(e){
  const m={ "auth/invalid-credential":"Incorrect email or password.","auth/invalid-email":"Enter a valid email address.","auth/too-many-requests":"Too many attempts. Try again later.","auth/user-disabled":"This account is disabled." };
  return m[e.code] || e.message || "Login failed.";
}
