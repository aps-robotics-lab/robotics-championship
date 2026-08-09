import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

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

const loginView = document.getElementById("loginView");
const appView = document.getElementById("appView");
const errorBox = document.getElementById("error");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const exportBtn = document.getElementById("exportBtn");
const search = document.getElementById("search");
const rows = document.getElementById("rows");

let data = [];

loginBtn.addEventListener("click", async () => {
  errorBox.textContent = "";
  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in...";

  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      throw new Error("Enter your admin email and password.");
    }

    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    errorBox.textContent = friendlyAuthError(error);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign in";
  }
});

document.getElementById("password").addEventListener("keydown", e => {
  if (e.key === "Enter") loginBtn.click();
});

logoutBtn.addEventListener("click", () => signOut(auth));
refreshBtn.addEventListener("click", loadRegistrations);
search.addEventListener("input", render);

onAuthStateChanged(auth, async user => {
  if (!user) {
    appView.classList.add("hidden");
    loginView.classList.remove("hidden");
    return;
  }

  // Force-refresh the ID token so the admin custom claim is current.
  try {
    await user.getIdToken(true);
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    await loadRegistrations();
  } catch (error) {
    console.error(error);
    await signOut(auth);
    errorBox.textContent = "Your admin account is not authorized. Check the Firebase admin setup.";
  }
});

async function loadRegistrations() {
  const snap = await get(ref(db, "registrations"));
  const obj = snap.val() || {};

  data = Object.values(obj).map(x => ({
    ...x,
    Events: Array.isArray(x.Events) ? x.Events : [],
    _members: [2,3,4,5]
      .map(n => {
        const name = x[`Member${n}Name`] || "";
        const cls = x[`Member${n}Class`] || "";
        const section = x[`Member${n}Section`] || "";
        return [name, cls, section].filter(Boolean).join(" / ");
      })
      .filter(Boolean)
  }));

  render();
}

function friendlyAuthError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/invalid-login-credentials": "Incorrect email or password.",
    "auth/user-not-found": "No Firebase admin account exists with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/operation-not-allowed": "Email/Password sign-in is not enabled in Firebase Authentication."
  };
  return messages[code] || error?.message || "Sign-in failed.";
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[m]);
}

function render() {
  const q = search.value.trim().toLowerCase();
  const filtered = data.filter(x => JSON.stringify(x).toLowerCase().includes(q));

  document.getElementById("count").textContent = data.length;
  document.getElementById("solo").textContent =
    data.filter(x => Number(x.TeamSize) === 1).length;
  document.getElementById("teams").textContent =
    data.filter(x => Number(x.TeamSize) > 1).length;

  rows.innerHTML = filtered.map(x => `<tr>
    <td>${esc(x.registrationId)}</td>
    <td>${esc(x.registrationDate)}</td>
    <td><span class="badge">${esc(x.ParticipationType)}</span></td>
    <td>${esc(x.StudentName)}</td>
    <td>${esc(x.Class)} / ${esc(x.Section)}</td>
    <td>${esc(x.MobileNumber)}<br>${esc(x.EmailAddress)}</td>
    <td>${esc(x.TeamName || "—")}</td>
    <td>${esc(x._members.join(" | ") || "Solo")}</td>
    <td>${esc(x.Events.join(", "))}</td>
    <td>${esc(x.Remarks || "")}</td>
  </tr>`).join("");
}

exportBtn.addEventListener("click", () => {
  const cols = [
    "registrationId","registrationDate","ParticipationType","TeamSize",
    "StudentName","Class","Section","MobileNumber","EmailAddress","TeamName",
    "Events","Member2Name","Member2Class","Member2Section",
    "Member3Name","Member3Class","Member3Section",
    "Member4Name","Member4Class","Member4Section",
    "Member5Name","Member5Class","Member5Section","Remarks"
  ];

  const csv = [
    cols.join(","),
    ...data.map(x => cols.map(c => {
      const value = Array.isArray(x[c]) ? x[c].join("; ") : (x[c] ?? "");
      return '"' + String(value).replaceAll('"','""') + '"';
    }).join(","))
  ].join("\n");

  const blob = new Blob(["\\ufeff", csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aps-robotics-registrations.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
