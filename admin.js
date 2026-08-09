/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN PANEL
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",
    authDomain: "aps-robotics-championship.firebaseapp.com",
    databaseURL: "https://aps-robotics-championship-default-rtdb.firebaseio.com",
    projectId: "aps-robotics-championship",
    storageBucket: "aps-robotics-championship.firebasestorage.app",
    messagingSenderId: "1063542904891",
    appId: "1:1063542904891:web:82ff9bb3fba0b87384a41e"
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const db = getDatabase(firebaseApp);


/* =========================================================
   GLOBAL STATE
========================================================= */

let registrations = {};
let filteredRegistrations = {};
let currentRegistrationKey = null;

let currentUser = null;


/* =========================================================
   HELPERS
========================================================= */

const $ = id => document.getElementById(id);

function safe(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function normal(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (Array.isArray(value)) {
        return value.join(", ");
    }

    if (typeof value === "object") {
        return Object.values(value).join(", ");
    }

    return String(value);
}


function getEmail(data) {

    return normal(
        data?.EmailAddress ||
        data?.Email ||
        data?.email ||
        ""
    );
}


function getEvents(data) {

    const value =
        data?.Events ??
        data?.events ??
        data?.Event ??
        data?.event;

    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value
            .map(normal)
            .map(x => x.trim())
            .filter(Boolean);
    }

    if (typeof value === "object") {
        return Object.values(value)
            .map(normal)
            .map(x => x.trim())
            .filter(Boolean);
    }

    return normal(value)
        .split(/\s*(?:,|\||;)\s*/)
        .map(x => x.trim())
        .filter(Boolean);
}


function getTeamSize(data) {

    const declaredSize = Number(data?.TeamSize);

    if (declaredSize > 0) {
        return declaredSize;
    }

    let members = 1;

    for (let i = 2; i <= 10; i++) {

        const name =
            data?.[`Member${i}Name`] ||
            data?.[`member${i}Name`];

        if (normal(name).trim()) {
            members++;
        }
    }

    return members;
}


function getDate(data) {

    const value =
        data?.registrationDate ||
        data?.createdAt ||
        data?.timestamp ||
        "";

    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}


function formatDate(data) {

    const date = getDate(data);

    if (!date) {
        return "-";
    }

    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


function showToast(
    message,
    type = "success"
) {

    const toast = $("toast");

    toast.textContent = message;

    toast.className =
        `toast show ${type}`;

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3200);
}


/* =========================================================
   AUTHENTICATION
========================================================= */

const loginScreen = $("loginScreen");
const adminApp = $("adminApp");

const loginForm = $("loginForm");

const loginEmail = $("loginEmail");
const loginPassword = $("loginPassword");

const loginBtn = $("loginBtn");

const loginError = $("loginError");


loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        loginError.textContent = "";

        loginBtn.disabled = true;

        loginBtn.textContent =
            "AUTHENTICATING...";

        try {

            await signInWithEmailAndPassword(
                auth,
                loginEmail.value.trim(),
                loginPassword.value
            );

        } catch (error) {

            console.error(error);

            loginError.textContent =
                getAuthError(error.code);

        } finally {

            loginBtn.disabled = false;

            loginBtn.textContent =
                "LOGIN TO DASHBOARD";
        }
    }
);


function getAuthError(code) {

    const messages = {

        "auth/invalid-credential":
            "Invalid email or password.",

        "auth/user-not-found":
            "Admin account was not found.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/invalid-email":
            "Enter a valid email address.",

        "auth/too-many-requests":
            "Too many attempts. Try again later.",

        "auth/network-request-failed":
            "Network error. Check your internet connection.",

        "auth/user-disabled":
            "This account has been disabled."

    };

    return messages[code] ||
        "Unable to login. Check Firebase Authentication.";
}


$("togglePassword").addEventListener(
    "click",
    () => {

        const isPassword =
            loginPassword.type === "password";

        loginPassword.type =
            isPassword
                ? "text"
                : "password";

        $("togglePassword").textContent =
            isPassword
                ? "🙈"
                : "👁";
    }
);


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            currentUser = null;

            loginScreen.classList.remove("hidden");

            adminApp.classList.add("hidden");

            return;
        }

        currentUser = user;

        /*
         * The authenticated Firebase account is allowed
         * to open the admin application.
         *
         * For production, use Firebase Database Rules
         * to restrict /registrations and /adminRules to
         * your administrator account(s).
         */

        loginScreen.classList.add("hidden");

        adminApp.classList.remove("hidden");

        $("adminEmail").textContent =
            user.email || "Authenticated administrator";

        await loadRegistrations();

        await loadRules();

    }
);


/* =========================================================
   LOGOUT
========================================================= */

$("logoutBtn").addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            showToast(
                "Logged out successfully.",
                "success"
            );

        } catch (error) {

            console.error(error);

            showToast(
                "Logout failed.",
                "error"
            );
        }
    }
);


/* =========================================================
   SIDEBAR
========================================================= */

$("sidebarToggle").addEventListener(
    "click",
    () => {

        $("sidebar").classList.toggle("open");

        $("sidebarOverlay").classList.toggle(
            "show"
        );
    }
);


$("mobileClose").addEventListener(
    "click",
    closeSidebar
);


$("sidebarOverlay").addEventListener(
    "click",
    closeSidebar
);


function closeSidebar() {

    $("sidebar").classList.remove("open");

    $("sidebarOverlay").classList.remove(
        "show"
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.page
                );
            }
        );
    });


document
    .querySelectorAll("[data-page-target]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.pageTarget
                );
            }
        );
    });


function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove("active");

        });


    const target =
        $(`${page}Page`);

    if (!target) {
        return;
    }

    target.classList.add("active");


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    const titles = {

        dashboard:
            "Dashboard",

        registrations:
            "Registrations",

        events:
            "Events",

        rules:
            "Rules & Details"

    };


    $("pageTitle").textContent =
        titles[page] || "Admin Panel";


    closeSidebar();


    if (page === "registrations") {
        renderRegistrationTable();
    }

    if (page === "rules") {
        loadRules();
    }
}


/* =========================================================
   LOAD REGISTRATIONS
========================================================= */

async function loadRegistrations() {

    try {

        const snapshot =
            await get(
                ref(db, "registrations")
            );


        if (
            snapshot.exists() &&
            typeof snapshot.val() === "object"
        ) {

            registrations =
                snapshot.val();

        } else {

            registrations = {};
        }


        filteredRegistrations = {
            ...registrations
        };


        populateFilters();

        updateDashboard();

        renderRecentRegistrations();

        renderRegistrationTable();

        updateEventStatistics();

    } catch (error) {

        console.error(
            "Registration loading error:",
            error
        );

        registrations = {};

        filteredRegistrations = {};

        showToast(
            "Unable to load registrations. Check Firebase Database Rules.",
            "error"
        );

        renderRegistrationTable();
    }
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const list =
        Object.values(registrations);

    const counts =
        countEvents();


    $("totalRegistrations").textContent =
        list.length;

    $("totalTeams").textContent =
        list.length;

    $("raceCount").textContent =
        counts.race;

    $("warCount").textContent =
        counts.war;

    $("tugCount").textContent =
        counts.tug;

    $("soccerCount").textContent =
        counts.soccer;
}


function countEvents() {

    const counts = {

        race: 0,
        war: 0,
        tug: 0,
        soccer: 0

    };


    Object.values(registrations)
        .forEach(data => {

            getEvents(data)
                .forEach(event => {

                    const value =
                        event
                            .toLowerCase()
                            .trim();


                    if (
                        value === "robo race"
                    ) {
                        counts.race++;
                    }

                    else if (
                        value === "robo war"
                    ) {
                        counts.war++;
                    }

                    else if (
                        value === "robo tug of war"
                    ) {
                        counts.tug++;
                    }

                    else if (
                        value === "robo soccer"
                    ) {
                        counts.soccer++;
                    }

                });

        });


    return counts;
}


function updateEventStatistics() {

    const counts =
        countEvents();


    $("eventRaceCount").textContent =
        counts.race;

    $("eventWarCount").textContent =
        counts.war;

    $("eventTugCount").textContent =
        counts.tug;

    $("eventSoccerCount").textContent =
        counts.soccer;
}


/* =========================================================
   RECENT REGISTRATIONS
========================================================= */

function renderRecentRegistrations() {

    const container =
        $("recentRegistrations");


    const entries =
        Object.entries(registrations)
            .sort(
                (a, b) => {

                    const dateA =
                        getDate(a[1])?.getTime() || 0;

                    const dateB =
                        getDate(b[1])?.getTime() || 0;

                    return dateB - dateA;
                }
            )
            .slice(0, 7);


    if (!entries.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>⌕</div>
                <h3>No registrations yet</h3>
                <p>New registrations will appear here.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const id =
                        data.registrationId ||
                        key;

                    return `
                        <div class="recent-item">

                            <div class="recent-info">

                                <strong>
                                    ${safe(
                                        data.StudentName ||
                                        "Unknown Student"
                                    )}
                                </strong>

                                <span>
                                    ${safe(
                                        data.TeamName ||
                                        "Unnamed Team"
                                    )}
                                    •
                                    ${safe(id)}
                                </span>

                            </div>

                            <button
                                class="small-button"
                                data-view-key="${safe(key)}">
                                View
                            </button>

                        </div>
                    `;
                }
            )
            .join("");


    container
        .querySelectorAll("[data-view-key]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    viewRegistration(
                        button.dataset.viewKey
                    );

                }
            );

        });
}


/* =========================================================
   FILTERS
========================================================= */

function populateFilters() {

    const classes =
        [
            ...new Set(
                Object.values(registrations)
                    .map(
                        data =>
                            normal(data.Class).trim()
                    )
                    .filter(Boolean)
            )
        ].sort();


    const sections =
        [
            ...new Set(
                Object.values(registrations)
                    .map(
                        data =>
                            normal(data.Section).trim()
                    )
                    .filter(Boolean)
            )
        ].sort();


    $("classFilter").innerHTML =
        `<option value="all">
            All Classes
        </option>`;


    classes.forEach(value => {

        $("classFilter").insertAdjacentHTML(
            "beforeend",
            `
                <option value="${safe(value)}">
                    ${safe(value)}
                </option>
            `
        );

    });


    $("sectionFilter").innerHTML =
        `<option value="all">
            All Sections
        </option>`;


    sections.forEach(value => {

        $("sectionFilter").insertAdjacentHTML(
            "beforeend",
            `
                <option value="${safe(value)}">
                    ${safe(value)}
                </option>
            `
        );

    });
}


/* =========================================================
   FILTER EVENTS
========================================================= */

$("searchInput").addEventListener(
    "input",
    applyFilters
);

$("eventFilter").addEventListener(
    "change",
    applyFilters
);

$("classFilter").addEventListener(
    "change",
    applyFilters
);

$("sectionFilter").addEventListener(
    "change",
    applyFilters
);


function applyFilters() {

    const search =
        $("searchInput")
            .value
            .toLowerCase()
            .trim();

    const event =
        $("eventFilter").value;

    const classValue =
        $("classFilter").value;

    const section =
        $("sectionFilter").value;


    filteredRegistrations = {};


    Object.entries(registrations)
        .forEach(
            ([key, data]) => {

                const eventList =
                    getEvents(data);


                const searchable = [

                    data.registrationId,

                    data.StudentName,

                    data.TeamName,

                    data.Class,

                    data.Section,

                    data.MobileNumber,

                    getEmail(data),

                    ...eventList

                ]
                    .map(normal)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(search);


                const matchesEvent =
                    event === "all" ||
                    eventList.some(
                        item =>
                            item.toLowerCase() ===
                            event.toLowerCase()
                    );


                const matchesClass =
                    classValue === "all" ||
                    normal(data.Class) ===
                    classValue;


                const matchesSection =
                    section === "all" ||
                    normal(data.Section) ===
                    section;


                if (
                    matchesSearch &&
                    matchesEvent &&
                    matchesClass &&
                    matchesSection
                ) {

                    filteredRegistrations[key] =
                        data;
                }

            }
        );


    renderRegistrationTable();
}


$("clearFilters").addEventListener(
    "click",
    () => {

        $("searchInput").value = "";

        $("eventFilter").value =
            "all";

        $("classFilter").value =
            "all";

        $("sectionFilter").value =
            "all";


        filteredRegistrations = {
            ...registrations
        };


        renderRegistrationTable();
    }
);


/* =========================================================
   REGISTRATION TABLE
========================================================= */

function renderRegistrationTable() {

    const tbody =
        $("registrationTableBody");

    const entries =
        Object.entries(filteredRegistrations)
            .sort(
                (a, b) => {

                    const dateA =
                        getDate(a[1])?.getTime() || 0;

                    const dateB =
                        getDate(b[1])?.getTime() || 0;

                    return dateB - dateA;
                }
            );


    $("resultCount").textContent =
        `${entries.length} registration${entries.length === 1 ? "" : "s"}`;


    $("tableEmpty")
        .classList
        .toggle(
            "hidden",
            entries.length !== 0
        );


    tbody.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const eventTags =
                        getEvents(data)
                            .map(
                                event =>
                                    `<span class="tag">
                                        ${safe(event)}
                                    </span>`
                            )
                            .join("");


                    return `
                        <tr>

                            <td>
                                ${safe(
                                    data.registrationId ||
                                    key
                                )}
                            </td>

                            <td>
                                ${safe(
                                    data.StudentName ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${safe(
                                    data.TeamName ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${safe(
                                    data.Class ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${safe(
                                    data.Section ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${safe(
                                    data.MobileNumber ||
                                    data.Mobile ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${eventTags || "-"}
                            </td>

                            <td>
                                ${getTeamSize(data)}
                            </td>

                            <td>
                                ${safe(
                                    formatDate(data)
                                )}
                            </td>

                            <td>

                                <div class="actions">

                                    <button
                                        title="View"
                                        data-action="view"
                                        data-key="${safe(key)}">
                                        👁
                                    </button>

                                    <button
                                        title="Edit"
                                        data-action="edit"
                                        data-key="${safe(key)}">
                                        ✎
                                    </button>

                                    <button
                                        title="Delete"
                                        class="delete"
                                        data-action="delete"
                                        data-key="${safe(key)}">
                                        ×
                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;
                }
            )
            .join("");


    tbody
        .querySelectorAll("[data-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;

                    const key =
                        button.dataset.key;


                    if (action === "view") {
                        viewRegistration(key);
                    }

                    if (action === "edit") {
                        editRegistration(key);
                    }

                    if (action === "delete") {
                        deleteRegistration(key);
                    }

                }
            );

        });
}


/* =========================================================
   VIEW REGISTRATION
========================================================= */

function viewRegistration(key) {

    const data =
        registrations[key];

    if (!data) {
        return;
    }


    currentRegistrationKey = key;


    const details =
        Object.entries(data)
            .filter(
                ([field]) =>
                    field !== "createdAt"
            )
            .map(
                ([field, value]) => {

                    return `
                        <div class="detail-item">

                            <small>
                                ${safe(field)}
                            </small>

                            <strong>
                                ${safe(
                                    normal(value) ||
                                    "-"
                                )}
                            </strong>

                        </div>
                    `;
                }
            )
            .join("");


    $("modalContent").innerHTML = `

        <h2>
            ${safe(
                data.TeamName ||
                "Registration Details"
            )}
        </h2>

        <p>
            <strong>Registration ID:</strong>
            ${safe(
                data.registrationId ||
                key
            )}
        </p>

        <div class="detail-grid">
            ${details}
        </div>
    `;


    $("modal").classList.remove(
        "hidden"
    );
}


/* =========================================================
   EDIT REGISTRATION
========================================================= */

async function editRegistration(key) {

    const data =
        registrations[key];

    if (!data) {
        return;
    }


    const studentName =
        prompt(
            "Team Leader / Student Name:",
            data.StudentName || ""
        );


    if (studentName === null) {
        return;
    }


    const teamName =
        prompt(
            "Team Name:",
            data.TeamName || ""
        );


    if (teamName === null) {
        return;
    }


    try {

        await update(
            ref(
                db,
                `registrations/${key}`
            ),
            {

                StudentName:
                    studentName.trim(),

                TeamName:
                    teamName.trim()

            }
        );


        registrations[key].StudentName =
            studentName.trim();

        registrations[key].TeamName =
            teamName.trim();


        filteredRegistrations[key] =
            registrations[key];


        renderRegistrationTable();

        renderRecentRegistrations();

        showToast(
            "Registration updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Update failed. Check Firebase permissions.",
            "error"
        );
    }
}


/* =========================================================
   DELETE REGISTRATION
========================================================= */

async function deleteRegistration(key) {

    const data =
        registrations[key];

    if (!data) {
        return;
    }


    const name =
        data.TeamName ||
        data.StudentName ||
        "this registration";


    const confirmed =
        confirm(
            `Delete ${name}?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        await remove(
            ref(
                db,
                `registrations/${key}`
            )
        );


        delete registrations[key];

        delete filteredRegistrations[key];


        updateDashboard();

        updateEventStatistics();

        renderRecentRegistrations();

        renderRegistrationTable();

        populateFilters();


        showToast(
            "Registration deleted.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Delete failed. Check Firebase Database Rules.",
            "error"
        );
    }
}


/* =========================================================
   RULES & DETAILS
========================================================= */

const ruleFields = {

    title: "ruleTitle",

    description:
        "ruleDescription",

    venue:
        "ruleVenue",

    date:
        "ruleDate",

    registration:
        "registrationRules",

    race:
        "raceRules",

    war:
        "warRules",

    tug:
        "tugRules",

    soccer:
        "soccerRules",

    important:
        "importantInstructions"

};


async function loadRules() {

    try {

        const snapshot =
            await get(
                ref(db, "adminRules")
            );


        const data =
            snapshot.exists()
                ? snapshot.val()
                : {};


        $("ruleTitle").value =
            data.title ||
            "APS Robotics Championship 2026";


        $("ruleDescription").value =
            data.description || "";


        $("ruleVenue").value =
            data.venue || "";


        $("ruleDate").value =
            data.date || "";


        $("registrationRules").value =
            data.registration || "";


        $("raceRules").value =
            data.race || "";


        $("warRules").value =
            data.war || "";


        $("tugRules").value =
            data.tug || "";


        $("soccerRules").value =
            data.soccer || "";


        $("importantInstructions").value =
            data.important || "";

    } catch (error) {

        console.error(
            "Rules loading error:",
            error
        );

        showToast(
            "Unable to load rules from Firebase.",
            "error"
        );
    }
}


/* =========================================================
   SAVE RULES
========================================================= */

$("saveRules").addEventListener(
    "click",
    saveRules
);


async function saveRules() {

    const saveButton =
        $("saveRules");


    const rules = {

        title:
            $("ruleTitle").value.trim(),

        description:
            $("ruleDescription").value.trim(),

        venue:
            $("ruleVenue").value.trim(),

        date:
            $("ruleDate").value.trim(),

        registration:
            $("registrationRules").value.trim(),

        race:
            $("raceRules").value.trim(),

        war:
            $("warRules").value.trim(),

        tug:
            $("tugRules").value.trim(),

        soccer:
            $("soccerRules").value.trim(),

        important:
            $("importantInstructions").value.trim(),

        updatedAt:
            new Date().toISOString(),

        updatedBy:
            currentUser?.email || ""

    };


    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";


    try {

        await update(
            ref(db, "adminRules"),
            rules
        );


        showToast(
            "Rules & details saved successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to save rules. Check Firebase permissions.",
            "error"
        );

    } finally {

        saveButton.disabled = false;

        saveButton.textContent =
            "✓ Save Changes";
    }
}


$("reloadRules").addEventListener(
    "click",
    async () => {

        await loadRules();

        showToast(
            "Rules reloaded.",
            "success"
        );
    }
);


/* =========================================================
   EXPORT CSV
========================================================= */

function csvEscape(value) {

    return `"${normal(value)
        .replace(/"/g, '""')}"`;
}


function exportCSV(dataObject) {

    const rows = [

        [
            "Registration ID",
            "Team Leader",
            "Team Name",
            "Class",
            "Section",
            "Mobile",
            "Email",
            "Events",
            "Team Size",
            "Member 2",
            "Member 3",
            "Member 4",
            "Member 5",
            "Remarks",
            "Registration Date"
        ]

    ];


    Object.entries(dataObject)
        .forEach(
            ([key, data]) => {

                rows.push([

                    data.registrationId ||
                    key,

                    data.StudentName,

                    data.TeamName,

                    data.Class,

                    data.Section,

                    data.MobileNumber ||
                    data.Mobile,

                    getEmail(data),

                    getEvents(data)
                        .join(" | "),

                    getTeamSize(data),

                    data.Member2Name,

                    data.Member3Name,

                    data.Member4Name,

                    data.Member5Name,

                    data.Remarks,

                    data.registrationDate

                ].map(csvEscape));

            }
        );


    const csv =
        "\ufeff" +
        rows
            .map(row => row.join(","))
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "APS_Robotics_Registrations_2026.csv";


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);


    showToast(
        "CSV export completed.",
        "success"
    );
}


$("exportCsv").addEventListener(
    "click",
    () => {

        exportCSV(
            filteredRegistrations
        );

    }
);


$("exportDashboard").addEventListener(
    "click",
    () => {

        exportCSV(
            registrations
        );

    }
);


/* =========================================================
   REFRESH
========================================================= */

$("dashboardRefresh").addEventListener(
    "click",
    async () => {

        await loadRegistrations();

        showToast(
            "Dashboard refreshed.",
            "success"
        );
    }
);


$("refreshRegistrations").addEventListener(
    "click",
    async () => {

        await loadRegistrations();

        showToast(
            "Registrations refreshed.",
            "success"
        );
    }
);


/* =========================================================
   MODAL
========================================================= */

$("closeModal").addEventListener(
    "click",
    closeModal
);


$("modal").addEventListener(
    "click",
    event => {

        if (
            event.target === $("modal")
        ) {

            closeModal();
        }
    }
);


function closeModal() {

    $("modal")
        .classList
        .add("hidden");

    currentRegistrationKey = null;
}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   INITIAL UI
========================================================= */

filteredRegistrations = {};

renderRegistrationTable();
