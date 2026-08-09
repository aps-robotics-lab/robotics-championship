import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

/*
  IMPORTANT:
  Replace ONLY appId below with the real Web App ID from:
  Firebase Console → Project settings → Your apps → Web app.
*/
const firebaseConfig = {
  apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",
  authDomain: "aps-robotics-championship.firebaseapp.com",
  databaseURL: "https://aps-robotics-championship-default-rtdb.firebaseio.com",
  projectId: "aps-robotics-championship",
  storageBucket: "aps-robotics-championship.firebasestorage.app",
  messagingSenderId: "1056582901838",
  appId: "1:1056582901838:web:REPLACE_WITH_REAL_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, m => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[m]));

let registrations = [];
let issues = [];
let currentUser = null;

function toast(message) {
  const el = $("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value ?? "";
}

function value(id) {
  return $(id)?.value ?? "";
}

function setValue(id, value) {
  if ($(id)) $(id).value = value ?? "";
}

function normalizeText(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return Object.values(value).join(", ");
  return String(value ?? "");
}

/* Supports the field names used by different versions of the registration form. */
function studentName(r) {
  return r.student_name ?? r.studentName ?? r.name ?? r.leaderName ?? r.leader_name ?? "";
}

function teamName(r) {
  return r.team_name ?? r.teamName ?? r.team ?? "";
}

function className(r) {
  return r.class ?? r.className ?? r.studentClass ?? "";
}

function sectionName(r) {
  return r.section ?? r.sectionName ?? "";
}

function mobile(r) {
  return r.mobile ?? r.mobileNumber ?? r.phone ?? r.phoneNumber ?? "";
}

function email(r) {
  return r.email ?? r.emailAddress ?? "";
}

function registrationId(r) {
  return r.registration_id ?? r.registrationId ?? r.id ?? r.registrationID ?? r.key ?? "";
}

function eventsText(r) {
  return normalizeText(
    r.events ??
    r.event ??
    r.selectedEvents ??
    r.selectedEvent ??
    r.eventSelection ??
    ""
  );
}

function membersText(r) {
  return normalizeText(
    r.members ??
    r.teamMembers ??
    r.memberNames ??
    r.team_members ??
    r.membersName ??
    ""
  );
}

function dateText(r) {
  const v =
    r.registration_date ??
    r.registrationDate ??
    r.date ??
    r.createdAt ??
    r.timestamp ??
    "";
  if (!v) return "";
  if (typeof v === "number") {
    try { return new Date(v).toLocaleString(); } catch {}
  }
  return String(v);
}

function pageName(page) {
  return ({
    dashboard: "Dashboard",
    registrations: "Registrations",
    events: "Events",
    home: "Home",
    about: "About",
    eventContent: "Events Content",
    team: "Our Team",
    contact: "Contact",
    rules: "Rules",
    issues: "Help / Issues"
  })[page] || "Dashboard";
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = $(page + "Page");
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.page === page);
  });

  setText("pageTitle", pageName(page));

  if (window.innerWidth < 900) {
    $("sidebar")?.classList.remove("open");
  }

  if (page === "registrations") renderRegistrations();
  if (page === "issues") renderIssues();
}

/* ---------- REGISTRATIONS ---------- */

async function loadRegistrations() {
  const body = $("registrationTableBody");
  if (body) {
    body.innerHTML = `<tr><td colspan="10" class="table-loading">Loading registrations...</td></tr>`;
  }

  try {
    /*
      PRIMARY PATH:
      registrations
      This matches the registration form used for this project.
    */
    const snap = await get(ref(db, "registrations"));

    if (!snap.exists()) {
      registrations = [];
      updateStats();
      renderRegistrations();
      renderRecent();
      toast("No data found at RTDB /registrations");
      return;
    }

    const data = snap.val();

    /*
      Handles:
      /registrations/{pushId}: {...}
      and a single registration object.
    */
    if (
      data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      Object.values(data).some(v => v && typeof v === "object" && !Array.isArray(v))
    ) {
      registrations = Object.entries(data).map(([key, val]) => ({
        key,
        ...(val && typeof val === "object" ? val : { value: val })
      }));
    } else {
      registrations = [{ key: "registration", ...data }];
    }

    registrations.sort((a, b) => {
      const da = dateValue(b);
      const dbv = dateValue(a);
      return dbv - da;
    });

    updateStats();
    renderRegistrations();
    renderRecent();

    toast(`${registrations.length} registration${registrations.length === 1 ? "" : "s"} loaded`);
  } catch (error) {
    console.error("Registration load error:", error);
    registrations = [];
    updateStats();
    renderRegistrations();

    let message = error.message || "Unknown Firebase error";
    if (error.code === "PERMISSION_DENIED") {
      message = "Firebase denied read access. Check Realtime Database Rules.";
    }
    toast("Registrations: " + message);
  }
}

function dateValue(r) {
  const v =
    r.registration_date ??
    r.registrationDate ??
    r.createdAt ??
    r.timestamp ??
    r.date ??
    0;

  if (typeof v === "number") return v;

  const parsed = Date.parse(String(v));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function updateStats() {
  const total = registrations.length;
  setText("totalRegistrations", total);

  const teamValues = registrations
    .map(teamName)
    .map(x => x.trim())
    .filter(Boolean);

  setText("totalTeams", new Set(teamValues).size || (total ? total : 0));

  const counts = {
    "Robo Race": 0,
    "Robo War": 0,
    "Robo Tug of War": 0,
    "Robo Soccer": 0
  };

  registrations.forEach(r => {
    const text = eventsText(r).toLowerCase();
    Object.keys(counts).forEach(event => {
      if (text.includes(event.toLowerCase())) counts[event]++;
    });
  });

  setText("raceCount", counts["Robo Race"]);
  setText("warCount", counts["Robo War"]);
  setText("tugCount", counts["Robo Tug of War"]);
  setText("soccerCount", counts["Robo Soccer"]);

  setText("eventRaceCount", counts["Robo Race"]);
  setText("eventWarCount", counts["Robo War"]);
  setText("eventTugCount", counts["Robo Tug of War"]);
  setText("eventSoccerCount", counts["Robo Soccer"]);

  const classes = [...new Set(registrations.map(className).filter(Boolean))].sort();
  const sections = [...new Set(registrations.map(sectionName).filter(Boolean))].sort();

  fillSelect("classFilter", classes, "All Classes");
  fillSelect("sectionFilter", sections, "All Sections");
}

function fillSelect(id, items, first) {
  const select = $(id);
  if (!select) return;

  const old = select.value;
  select.innerHTML =
    `<option value="all">${esc(first)}</option>` +
    items.map(item => `<option value="${esc(item)}">${esc(item)}</option>`).join("");

  if (items.includes(old)) select.value = old;
}

function renderRecent() {
  const box = $("recentRegistrations");
  if (!box) return;

  box.innerHTML = registrations.slice(0, 5).map(r => `
    <div class="registration-mini">
      <strong>${esc(studentName(r) || "Unnamed")}</strong>
      <small>${esc(teamName(r) || "No team")} • ${esc(eventsText(r) || "No event")}</small>
    </div>
  `).join("") || `<div class="loading">No registrations yet.</div>`;
}

function filteredRegistrations() {
  const q = value("searchInput").trim().toLowerCase();
  const event = value("eventFilter");
  const cls = value("classFilter");
  const section = value("sectionFilter");

  return registrations.filter(r => {
    const blob = JSON.stringify(r).toLowerCase();

    return (
      (!q || blob.includes(q)) &&
      (event === "all" || eventsText(r).toLowerCase().includes(event.toLowerCase())) &&
      (cls === "all" || className(r) === cls) &&
      (section === "all" || sectionName(r) === section)
    );
  });
}

function renderRegistrations() {
  const body = $("registrationTableBody");
  const empty = $("tableEmpty");
  if (!body) return;

  const rows = filteredRegistrations();

  setText(
    "resultCount",
    `${rows.length} registration${rows.length === 1 ? "" : "s"}`
  );

  body.innerHTML = rows.map(r => `
    <tr>
      <td>${esc(registrationId(r))}</td>
      <td>${esc(studentName(r))}</td>
      <td>${esc(teamName(r) || "—")}</td>
      <td>${esc(className(r))}</td>
      <td>${esc(sectionName(r))}</td>
      <td>${esc(mobile(r))}</td>
      <td>${esc(eventsText(r))}</td>
      <td>${esc(membersText(r))}</td>
      <td>${esc(dateText(r))}</td>
      <td><button class="table-action" data-view-reg="${esc(r.key)}">View</button></td>
    </tr>
  `).join("");

  if (empty) empty.classList.toggle("hidden", rows.length !== 0);
}

function openRegistration(key) {
  const r = registrations.find(item => item.key === key);
  if (!r) return;

  $("modalContent").innerHTML = `
    <h2>Registration Details</h2>
    <div class="detail-grid">
      ${Object.entries(r)
        .filter(([k]) => k !== "key")
        .map(([k, v]) => `
          <div class="detail-item">
            <small>${esc(k.replace(/_/g, " ").toUpperCase())}</small>
            <strong>${esc(
              Array.isArray(v)
                ? v.join(", ")
                : typeof v === "object" && v
                  ? JSON.stringify(v)
                  : v
            )}</strong>
          </div>
        `).join("")}
    </div>
  `;

  $("modal").classList.remove("hidden");
}

/* ---------- ISSUES ---------- */

async function loadIssues() {
  try {
    const snap = await get(ref(db, "issues"));
    const data = snap.val() || {};

    issues = Object.entries(data).map(([key, value]) => ({
      key,
      ...(value || {})
    }));

    issues.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

    updateIssueSummary();
    renderIssues();
    renderRecentIssues();
  } catch (error) {
    console.error(error);
    toast("Could not load issues: " + error.message);
  }
}

function updateIssueSummary() {
  const open = issues.filter(i => (i.status || "Open") === "Open").length;
  const progress = issues.filter(i => i.status === "In Progress").length;
  const resolved = issues.filter(i => i.status === "Resolved").length;

  setText("openIssues", open);
  setText("progressIssues", progress);
  setText("resolvedIssues", resolved);
  setText("totalIssues", issues.length);
  setText("issueBadge", open);
}

function issueFiltered() {
  const q = value("issueSearch").toLowerCase();
  const status = value("issueStatusFilter");
  const category = value("issueCategoryFilter");

  return issues.filter(i => {
    const blob = `${i.name || ""} ${i.email || ""} ${i.subject || ""} ${i.message || ""} ${i.key}`.toLowerCase();

    return (
      (!q || blob.includes(q)) &&
      (status === "all" || (i.status || "Open") === status) &&
      (category === "all" || (i.category || "Other") === category)
    );
  });
}

function renderIssues() {
  const box = $("issuesContainer");
  if (!box) return;

  const arr = issueFiltered();

  box.innerHTML = arr.map(i => {
    const status = i.status || "Open";
    const cls =
      status === "Resolved"
        ? "status-resolved"
        : status === "In Progress"
          ? "status-progress"
          : "status-open";

    return `
      <article class="issue-card">
        <div class="issue-card-top">
          <div>
            <div class="issue-title">${esc(i.subject || "Untitled Issue")}</div>
            <div class="issue-meta">
              ${esc(i.name || "Anonymous")} •
              ${esc(i.email || "No email")} •
              ${esc(i.category || "Other")}
            </div>
          </div>
          <span class="status-pill ${cls}">${esc(status)}</span>
        </div>

        <div class="issue-message">${esc(i.message || "No description provided.")}</div>

        <div class="issue-actions">
          <button data-issue-view="${esc(i.key)}">View</button>
          <button data-issue-status="${esc(i.key)}|In Progress">In Progress</button>
          <button data-issue-status="${esc(i.key)}|Resolved">Resolve</button>
          <button data-issue-delete="${esc(i.key)}">Delete</button>
        </div>
      </article>
    `;
  }).join("") || `<div class="loading">No issues match your filters.</div>`;
}

function renderRecentIssues() {
  const box = $("recentIssues");
  if (!box) return;

  box.innerHTML = issues.slice(0, 5).map(i => `
    <div class="issue-mini">
      <strong>${esc(i.subject || "Untitled")}</strong>
      <small>${esc(i.status || "Open")} • ${esc(i.category || "Other")}</small>
    </div>
  `).join("") || `<div class="loading">No issues submitted.</div>`;
}

function openIssue(key) {
  const i = issues.find(item => item.key === key);
  if (!i) return;

  $("issueModalContent").innerHTML = `
    <h2>${esc(i.subject || "Issue")}</h2>
    <div class="detail-grid">
      <div class="detail-item"><small>ISSUE ID</small><strong>${esc(i.issueId || i.key)}</strong></div>
      <div class="detail-item"><small>STATUS</small><strong>${esc(i.status || "Open")}</strong></div>
      <div class="detail-item"><small>NAME</small><strong>${esc(i.name || "")}</strong></div>
      <div class="detail-item"><small>EMAIL</small><strong>${esc(i.email || "")}</strong></div>
      <div class="detail-item"><small>CATEGORY</small><strong>${esc(i.category || "Other")}</strong></div>
      <div class="detail-item"><small>DATE</small><strong>${esc(i.createdAt ? new Date(i.createdAt).toLocaleString() : i.date || "")}</strong></div>
      <div class="detail-item full"><small>MESSAGE</small><strong>${esc(i.message || "")}</strong></div>
    </div>
  `;

  $("issueModal").classList.remove("hidden");
}

async function setIssueStatus(key, status) {
  try {
    await update(ref(db, "issues/" + key), {
      status,
      updatedAt: Date.now(),
      updatedBy: currentUser?.email || "admin"
    });

    toast("Issue updated");
    await loadIssues();
  } catch (error) {
    toast("Update failed: " + error.message);
  }
}

async function deleteIssue(key) {
  if (!confirm("Delete this issue permanently?")) return;

  try {
    await remove(ref(db, "issues/" + key));
    toast("Issue deleted");
    await loadIssues();
  } catch (error) {
    toast("Delete failed: " + error.message);
  }
}

/* ---------- WEBSITE CONTENT ---------- */

const contentDefaults = {
  home: {
    homeBadge: "APS ROBOTICS CHAMPIONSHIP 2026",
    homeTitle: "APS Robotics Championship 2026",
    homeDescription: "Build. Battle. Innovate.",
    homeDate: "",
    homeVenue: ""
  },
  about: {
    aboutLabel: "ABOUT THE CHAMPIONSHIP",
    aboutTitle: "About APS Robotics Championship",
    aboutDescription: ""
  },
  events: {
    eventRaceTitle: "Robo Race",
    eventRaceDescription: "Speed, control and precision on the track.",
    eventWarTitle: "Robo War",
    eventWarDescription: "Strategy, engineering and controlled robotic combat.",
    eventTugTitle: "Robo Tug of War",
    eventTugDescription: "Power, traction and mechanical strength.",
    eventSoccerTitle: "Robo Soccer",
    eventSoccerDescription: "Team coordination meets robotic football."
  },
  team: {
    team1Name: "", team1Role: "", team1Description: "",
    team2Name: "", team2Role: "", team2Description: "",
    team3Name: "", team3Role: "", team3Description: "",
    team4Name: "", team4Role: "", team4Description: ""
  },
  contact: {
    contactAddress: "",
    contactPhone: "",
    contactEmail: "",
    contactFacebook: "",
    contactInstagram: "",
    contactYoutube: ""
  },
  rules: {
    ruleRaceWeight: "4 kg",
    ruleRaceDimension: "30 × 30 × 30 cm",
    ruleRaceVoltage: "12 V",
    ruleSoccerWeight: "5 kg",
    ruleSoccerDimension: "30 × 30 × 30 cm",
    ruleSoccerVoltage: "12 V",
    ruleWarWeight: "5.5 kg",
    ruleWarDimension: "30 × 30 × 30 cm",
    ruleWarVoltage: "12 V",
    ruleTugWeight: "4 kg",
    ruleTugDimension: "30 × 30 × 30 cm",
    ruleTugVoltage: "12 V",
    generalRules: ""
  }
};

const contentMap = Object.fromEntries(
  Object.entries(contentDefaults).map(([section, data]) => [
    section,
    Object.keys(data)
  ])
);

async function loadContent() {
  for (const [section, ids] of Object.entries(contentMap)) {
    try {
      const snap = await get(ref(db, "siteContent/" + section));
      const data = snap.val() || {};

      ids.forEach(id => {
        setValue(
          id,
          data[id] ?? contentDefaults[section][id] ?? ""
        );
      });
    } catch (error) {
      console.warn("Content load:", section, error);
    }
  }
}

async function saveContent(section) {
  const data = {};
  contentMap[section].forEach(id => {
    data[id] = value(id);
  });

  try {
    await set(ref(db, "siteContent/" + section), data);
    toast(`${pageName(section === "events" ? "eventContent" : section)} content saved`);
  } catch (error) {
    toast("Save failed: " + error.message);
  }
}

/* ---------- CSV ---------- */

function exportCSV() {
  const rows = filteredRegistrations();

  const fields = [
    "registration_id",
    "student_name",
    "team_name",
    "class",
    "section",
    "mobile",
    "email",
    "events",
    "members",
    "registration_date"
  ];

  const csv = [
    fields.join(","),
    ...rows.map(r =>
      fields.map(field => {
        let v = "";

        if (field === "registration_id") v = registrationId(r);
        else if (field === "student_name") v = studentName(r);
        else if (field === "team_name") v = teamName(r);
        else if (field === "class") v = className(r);
        else if (field === "section") v = sectionName(r);
        else if (field === "mobile") v = mobile(r);
        else if (field === "email") v = email(r);
        else if (field === "events") v = eventsText(r);
        else if (field === "members") v = membersText(r);
        else if (field === "registration_date") v = dateText(r);
        else v = r[field] ?? "";

        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(",")
    )
  ].join("\n");

  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );

  const a = document.createElement("a");
  a.href = url;
  a.download = "aps-robotics-registrations.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- EVENTS ---------- */

function bind() {
  $("loginForm")?.addEventListener("submit", async event => {
    event.preventDefault();

    const button = $("loginBtn");
    button.disabled = true;
    $("loginError").textContent = "";

    try {
      await signInWithEmailAndPassword(
        auth,
        value("loginEmail").trim(),
        value("loginPassword")
      );
    } catch (error) {
      console.error(error);

      $("loginError").textContent =
        error.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : error.message;

      button.disabled = false;
    }
  });

  $("togglePassword")?.addEventListener("click", () => {
    const input = $("loginPassword");
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
    }
  });

  $("logoutBtn")?.addEventListener("click", () => signOut(auth));

  $("sidebarToggle")?.addEventListener("click", () => {
    $("sidebar")?.classList.toggle("open");
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  document.querySelectorAll("[data-page-target]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.pageTarget));
  });

  document.querySelectorAll(".save-button").forEach(button => {
    button.addEventListener("click", () => saveContent(button.dataset.contentSave));
  });

  ["searchInput", "eventFilter", "classFilter", "sectionFilter"].forEach(id => {
    $(id)?.addEventListener("input", renderRegistrations);
    $(id)?.addEventListener("change", renderRegistrations);
  });

  ["issueSearch", "issueStatusFilter", "issueCategoryFilter"].forEach(id => {
    $(id)?.addEventListener("input", renderIssues);
    $(id)?.addEventListener("change", renderIssues);
  });

  $("clearFilters")?.addEventListener("click", () => {
    setValue("searchInput", "");
    setValue("eventFilter", "all");
    setValue("classFilter", "all");
    setValue("sectionFilter", "all");
    renderRegistrations();
  });

  $("refreshRegistrations")?.addEventListener("click", loadRegistrations);

  $("dashboardRefresh")?.addEventListener("click", async () => {
    await loadRegistrations();
    await loadIssues();
  });

  $("refreshIssues")?.addEventListener("click", loadIssues);

  $("exportCsv")?.addEventListener("click", exportCSV);
  $("exportDashboard")?.addEventListener("click", exportCSV);

  $("closeModal")?.addEventListener("click", () => {
    $("modal")?.classList.add("hidden");
  });

  $("closeIssueModal")?.addEventListener("click", () => {
    $("issueModal")?.classList.add("hidden");
  });

  document.addEventListener("click", event => {
    const viewReg = event.target.closest("[data-view-reg]");
    if (viewReg) openRegistration(viewReg.dataset.viewReg);

    const viewIssue = event.target.closest("[data-issue-view]");
    if (viewIssue) openIssue(viewIssue.dataset.issueView);

    const status = event.target.closest("[data-issue-status]");
    if (status) {
      const [key, newStatus] = status.dataset.issueStatus.split("|");
      setIssueStatus(key, newStatus);
    }

    const deleteButton = event.target.closest("[data-issue-delete]");
    if (deleteButton) deleteIssue(deleteButton.dataset.issueDelete);
  });
}

onAuthStateChanged(auth, async user => {
  currentUser = user;

  const loginScreen = $("loginScreen");
  const adminApp = $("adminApp");

  if (user) {
    loginScreen?.classList.add("hidden");
    adminApp?.classList.remove("hidden");
    setText("adminEmail", user.email || "Admin");

    await Promise.all([
      loadRegistrations(),
      loadIssues(),
      loadContent()
    ]);
  } else {
    loginScreen?.classList.remove("hidden");
    adminApp?.classList.add("hidden");
  }
});

bind();
