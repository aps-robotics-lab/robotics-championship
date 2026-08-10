import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { mainFirebaseConfig, ADMIN_UID } from "./firebase-config.js";

const app = initializeApp(mainFirebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const $ = id => document.getElementById(id);
let registrations = {};

const esc = v => String(v ?? "").replace(/[&<>"']/g, c =>
  ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c])
);

const first = (d, fields, fallback = "") => {
  for (const f of fields) {
    if (d?.[f] !== undefined && d?.[f] !== null && String(d[f]).trim() !== "") return d[f];
  }
  return fallback;
};

const events = d => {
  const raw = first(d, ["events", "selectedEvents", "event"], []);
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") return Object.values(raw);
  if (typeof raw === "string") return raw.split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
  return [];
};

const members = d => {
  const out = [];
  for (const field of ["members", "teamMembers", "memberList"]) {
    const raw = d?.[field];
    if (Array.isArray(raw)) out.push(...raw);
    else if (raw && typeof raw === "object") out.push(...Object.values(raw));
  }

  for (let i = 2; i <= 10; i++) {
    const n = first(d, [`Member${i}Name`, `member${i}Name`], "");
    if (n) out.push({
      name: n,
      class: first(d, [`Member${i}Class`, `member${i}Class`], ""),
      section: first(d, [`Member${i}Section`, `member${i}Section`], "")
    });
  }

  const seen = new Set();
  return out.filter(m => {
    const n = String(typeof m === "object" ? first(m, ["name","studentName","memberName","MemberName"], "") : m).trim().toLowerCase();
    if (!n || seen.has(n)) return false;
    seen.add(n);
    return true;
  });
};

const type = d => {
  const size = Number(first(d, ["teamSize","membersCount","memberCount"], 1));
  const teamName = String(first(d, ["teamName","team"], "")).trim().toLowerCase();
  const explicit = String(first(d, ["type","registrationType"], "")).toLowerCase();
  return size > 1 || members(d).length || (teamName && !["solo","individual","n/a","none"].includes(teamName)) || explicit.includes("team")
    ? "team" : "solo";
};

function render() {
  const entries = Object.entries(registrations);
  if ($("totalRegistrations")) $("totalRegistrations").textContent = entries.length;
  if ($("soloCount")) $("soloCount").textContent = entries.filter(([,d]) => type(d) === "solo").length;
  if ($("teamCount")) $("teamCount").textContent = entries.filter(([,d]) => type(d) === "team").length;

  const body = $("registrationBody");
  if (!body) return;

  body.innerHTML = entries.map(([key, d]) => `
    <tr>
      <td>${esc(first(d, ["registrationId","registrationID","regId"], key))}</td>
      <td><strong>${esc(first(d, ["studentName","name","leaderName"], "—"))}</strong><small>${esc(first(d, ["studentClass","class"], "—"))} - ${esc(first(d, ["studentSection","section"], "—"))}</small></td>
      <td>${esc(first(d, ["teamName","team"], "—"))}</td>
      <td><span class="type-badge ${type(d)}">${type(d) === "team" ? "Team" : "Solo"}</span></td>
      <td>${type(d) === "team" ? members(d).length + 1 : 1}</td>
      <td>${esc(first(d, ["mobileNumber","mobile","phone"], "—"))}<small>${esc(first(d, ["emailAddress","email"], "—"))}</small></td>
      <td>${events(d).map(e => `<span class="event-pill">${esc(e)}</span>`).join(" ") || "—"}</td>
      <td><button type="button" data-view="${esc(key)}">View</button><button type="button" data-delete="${esc(key)}">Delete</button></td>
    </tr>
  `).join("") || `<tr><td colspan="8">No registrations found.</td></tr>`;

  body.querySelectorAll("[data-view]").forEach(btn => {
    btn.onclick = () => alert(JSON.stringify(registrations[btn.dataset.view], null, 2));
  });

  body.querySelectorAll("[data-delete]").forEach(btn => {
    btn.onclick = async () => {
      if (!confirm("Permanently delete this registration?")) return;
      await remove(ref(db, `registrations/${btn.dataset.delete}`));
    };
  });
}

onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    signOut(auth).finally(() => location.replace("admin-login.html"));
    return;
  }

  if ($("adminName")) $("adminName").textContent = user.displayName || user.email?.split("@")[0] || "Administrator";
  if ($("adminEmail")) $("adminEmail").textContent = user.email || "";

  $("loadingScreen")?.classList.add("hidden");
  $("app")?.classList.remove("hidden");

  onValue(ref(db, "registrations"), snapshot => {
    registrations = snapshot.val() || {};
    render();
  });
});

$("logoutBtn")?.addEventListener("click", () =>
  signOut(auth).then(() => location.replace("admin-login.html"))
);
