/* ============================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN PANEL
   Firebase Authentication + Realtime Database

   VERSION: IMPROVED / STABLE

   FEATURES
   ------------------------------------------------------------
   ✓ Firebase Email/Password Authentication
   ✓ Realtime Database
   ✓ Dashboard statistics
   ✓ Registration management
   ✓ Search
   ✓ Event filter
   ✓ Class filter
   ✓ Section filter
   ✓ View registration details
   ✓ Edit registration
   ✓ Delete registration
   ✓ CSV export
   ✓ Event statistics
   ✓ Recent registrations
   ✓ Responsive sidebar
   ✓ Modal management
   ✓ Toast notifications
   ✓ Safe HTML rendering
   ✓ Multiple Firebase data formats supported
   ============================================================ */


/* ============================================================
   FIREBASE IMPORTS
   ============================================================ */

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


/* ============================================================
   FIREBASE CONFIG
   ============================================================ */

const firebaseConfig = {

    apiKey:
        "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",

    authDomain:
        "aps-robotics-championship.firebaseapp.com",

    databaseURL:
        "https://aps-robotics-championship-default-rtdb.firebaseio.com",

    projectId:
        "aps-robotics-championship",

    storageBucket:
        "aps-robotics-championship.firebasestorage.app",

    messagingSenderId:
        "1063542904891",

    appId:
        "1:1063542904891:web:82ff9bb3fba0b87384a41e"
};


/* ============================================================
   INITIALIZE FIREBASE
   ============================================================ */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);


/* ============================================================
   GLOBAL STATE
   ============================================================ */

let registrations = {};

let filteredRegistrations = {};

let currentRegistrationKey = null;

let toastTimer = null;

let isLoading = false;


/* ============================================================
   DOM REFERENCES
   ============================================================ */

const loginScreen =
    document.getElementById("loginScreen");

const adminApp =
    document.getElementById("adminApp");

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginBtn =
    document.getElementById("loginBtn");

const loginError =
    document.getElementById("loginError");

const togglePassword =
    document.getElementById("togglePassword");

const adminEmail =
    document.getElementById("adminEmail");

const logoutBtn =
    document.getElementById("logoutBtn");

const sidebar =
    document.getElementById("sidebar");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const tableBody =
    document.getElementById("registrationTableBody");

const tableEmpty =
    document.getElementById("tableEmpty");

const resultCount =
    document.getElementById("resultCount");

const tableStatus =
    document.getElementById("tableStatus");

const searchInput =
    document.getElementById("searchInput");

const eventFilter =
    document.getElementById("eventFilter");

const classFilter =
    document.getElementById("classFilter");

const sectionFilter =
    document.getElementById("sectionFilter");

const clearFilters =
    document.getElementById("clearFilters");

const detailsModal =
    document.getElementById("detailsModal");

const editModal =
    document.getElementById("editModal");

const detailsContent =
    document.getElementById("detailsContent");

const modalDeleteBtn =
    document.getElementById("modalDeleteBtn");

const editForm =
    document.getElementById("editForm");

const editKey =
    document.getElementById("editKey");

const editStudentName =
    document.getElementById("editStudentName");

const editTeamName =
    document.getElementById("editTeamName");

const editClass =
    document.getElementById("editClass");

const editSection =
    document.getElementById("editSection");

const editMobile =
    document.getElementById("editMobile");

const editEmail =
    document.getElementById("editEmail");

const editRemarks =
    document.getElementById("editRemarks");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* ============================================================
   SAFE ELEMENT CHECK
   ============================================================ */

function exists(element) {
    return !!element;
}


/* ============================================================
   AUTH STATE
   ============================================================ */

onAuthStateChanged(
    auth,
    async user => {

        if (user) {

            loginScreen?.classList.add("hidden");

            adminApp?.classList.remove("hidden");

            if (adminEmail) {
                adminEmail.textContent =
                    user.email ||
                    "Authenticated Admin";
            }

            await loadRegistrations();

        } else {

            loginScreen?.classList.remove("hidden");

            adminApp?.classList.add("hidden");

            registrations = {};

            filteredRegistrations = {};

        }

    }
);


/* ============================================================
   LOGIN
   ============================================================ */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!loginEmail || !loginPassword || !loginBtn) {
                return;
            }

            loginError.textContent = "";

            loginBtn.disabled = true;

            loginBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Signing In...
            `;

            try {

                await signInWithEmailAndPassword(
                    auth,
                    loginEmail.value.trim(),
                    loginPassword.value
                );

                loginForm.reset();

            } catch (error) {

                console.error(
                    "Firebase Login Error:",
                    error
                );

                loginError.textContent =
                    getAuthError(error.code);

            } finally {

                loginBtn.disabled = false;

                loginBtn.innerHTML = `
                    <i class="fa-solid fa-right-to-bracket"></i>
                    Login to Dashboard
                `;

            }

        }
    );

}


/* ============================================================
   FIREBASE AUTH ERROR
   ============================================================ */

function getAuthError(code) {

    switch (code) {

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/user-not-found":
            return "Admin account was not found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        case "auth/user-disabled":
            return "This administrator account has been disabled.";

        default:
            return "Login failed. Please check your credentials.";

    }

}


/* ============================================================
   PASSWORD TOGGLE
   ============================================================ */

if (togglePassword && loginPassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const passwordVisible =
                loginPassword.type === "text";

            loginPassword.type =
                passwordVisible
                    ? "password"
                    : "text";

            togglePassword.innerHTML =
                passwordVisible
                    ? '<i class="fa-solid fa-eye"></i>'
                    : '<i class="fa-solid fa-eye-slash"></i>';

            togglePassword.setAttribute(
                "aria-label",
                passwordVisible
                    ? "Show password"
                    : "Hide password"
            );

        }
    );

}


/* ============================================================
   LOGOUT
   ============================================================ */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                showToast(
                    "Logged out successfully.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );

                showToast(
                    "Unable to logout.",
                    "error"
                );

            }

        }
    );

}


/* ============================================================
   SIDEBAR NAVIGATION
   ============================================================ */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                if (!page) {
                    return;
                }

                showPage(page);

                sidebar?.classList.remove("open");

            }
        );

    });


/* ============================================================
   DASHBOARD "VIEW ALL"
   ============================================================ */

document
    .querySelectorAll("[data-page-target]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.pageTarget;

                if (page) {
                    showPage(page);
                }

            }
        );

    });


/* ============================================================
   PAGE NAVIGATION
   ============================================================ */

function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    const target =
        document.getElementById(
            `${pageName}Page`
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === pageName
            );

        });


    const titles = {

        dashboard:
            "Dashboard",

        registrations:
            "Registrations",

        events:
            "Events"

    };


    const pageTitle =
        document.getElementById("pageTitle");


    if (pageTitle) {

        pageTitle.textContent =
            titles[pageName] ||
            "Dashboard";

    }


    if (pageName === "registrations") {

        renderTable();

    }


    if (pageName === "events") {

        updateEventPage();

    }

}


/* ============================================================
   SIDEBAR TOGGLE
   ============================================================ */

if (sidebarToggle && sidebar) {

    sidebarToggle.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


/* ============================================================
   LOAD REGISTRATIONS
   ============================================================ */

async function loadRegistrations() {

    if (isLoading) {
        return;
    }

    isLoading = true;

    if (tableStatus) {
        tableStatus.textContent =
            "Connecting to database...";
    }


    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "registrations"
                )
            );


        if (snapshot.exists()) {

            const value =
                snapshot.val();

            registrations =
                normalizeDatabase(value);

        } else {

            registrations = {};

        }


        filteredRegistrations = {
            ...registrations
        };


        populateFilters();

        updateDashboard();

        renderRecent();

        renderTable();

        updateEventPage();


        if (tableStatus) {
            tableStatus.textContent =
                "Database synced";
        }


    } catch (error) {

        console.error(
            "Database Load Error:",
            error
        );

        registrations = {};

        filteredRegistrations = {};

        if (tableStatus) {
            tableStatus.textContent =
                "Database error";
        }

        renderTable();

        showToast(
            getDatabaseError(error),
            "error"
        );

    } finally {

        isLoading = false;

    }

}


/* ============================================================
   DATABASE NORMALIZATION
   ============================================================ */

function normalizeDatabase(value) {

    if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {

        return {};

    }


    return value;

}


/* ============================================================
   DATABASE ERROR
   ============================================================ */

function getDatabaseError(error) {

    if (
        error &&
        error.code ===
        "PERMISSION_DENIED"
    ) {

        return "Database permission denied. Check Firebase Realtime Database rules.";

    }

    if (
        error &&
        error.code ===
        "NETWORK_ERROR"
    ) {

        return "Network error while connecting to Firebase.";

    }

    return "Unable to load registrations from Firebase.";

}


/* ============================================================
   NORMALIZE VALUE
   ============================================================ */

function normalize(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    if (Array.isArray(value)) {

        return value
            .map(item => normalize(item))
            .filter(Boolean)
            .join(", ");

    }


    if (
        typeof value === "object"
    ) {

        return Object
            .values(value)
            .map(item => normalize(item))
            .filter(Boolean)
            .join(", ");

    }


    return String(value);

}


/* ============================================================
   GET FIELD
   Supports several capitalization styles
   ============================================================ */

function getField(data, ...names) {

    if (!data) {
        return "";
    }


    for (const name of names) {

        if (
            data[name] !== undefined &&
            data[name] !== null
        ) {

            const value =
                normalize(data[name]).trim();

            if (value) {
                return value;
            }

        }

    }


    return "";

}


/* ============================================================
   GET EVENTS
   ============================================================ */

function getEvents(data) {

    if (!data) {
        return [];
    }


    let events =
        data.Events ??
        data.events ??
        data.Event ??
        data.event ??
        "";


    if (Array.isArray(events)) {

        return events
            .flatMap(event => {

                return normalizeEventValue(
                    event
                );

            })
            .filter(Boolean);

    }


    if (
        typeof events === "object" &&
        events !== null
    ) {

        return Object
            .values(events)
            .flatMap(event => {

                return normalizeEventValue(
                    event
                );

            })
            .filter(Boolean);

    }


    return normalizeEventValue(events);

}


/* ============================================================
   NORMALIZE EVENT VALUE
   ============================================================ */

function normalizeEventValue(value) {

    const string =
        normalize(value).trim();

    if (!string) {
        return [];
    }


    return string
        .split(/\s*(?:,|\||;|\n)\s*/)
        .map(event => event.trim())
        .filter(Boolean);

}


/* ============================================================
   EVENT NORMALIZATION
   ============================================================ */

function canonicalEvent(event) {

    const clean =
        normalize(event)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");


    if (
        clean === "robo race" ||
        clean.includes("robo race")
    ) {
        return "Robo Race";
    }


    if (
        clean === "robo war" ||
        clean.includes("robo war")
    ) {
        return "Robo War";
    }


    if (
        clean === "robo tug of war" ||
        clean.includes("robo tug")
    ) {
        return "Robo Tug of War";
    }


    if (
        clean === "robo soccer" ||
        clean.includes("robo soccer")
    ) {
        return "Robo Soccer";
    }


    return normalize(event).trim();

}


/* ============================================================
   REGISTRATION EMAIL
   ============================================================ */

function getRegistrationEmail(data) {

    return getField(
        data,
        "EmailAddress",
        "Email",
        "email",
        "emailAddress"
    );

}


/* ============================================================
   TEAM SIZE
   ============================================================ */

function getTeamSize(data) {

    if (!data) {
        return 0;
    }


    const explicitSize =
        Number(
            data.TeamSize ??
            data.teamSize
        );


    if (
        Number.isFinite(explicitSize) &&
        explicitSize > 0
    ) {

        return explicitSize;

    }


    let count = 1;


    for (
        let i = 2;
        i <= 5;
        i++
    ) {

        const memberName =
            getField(
                data,
                `Member${i}Name`,
                `member${i}Name`,
                `TeamMember${i}`,
                `teamMember${i}`
            );


        if (memberName) {
            count++;
        }

    }


    return count;

}


/* ============================================================
   GET REGISTRATION ID
   ============================================================ */

function getRegistrationId(key, data) {

    return (
        getField(
            data,
            "registrationId",
            "RegistrationID",
            "registrationID",
            "id"
        ) ||
        key ||
        "-"
    );

}


/* ============================================================
   GET TEAM LEADER
   ============================================================ */

function getTeamLeader(data) {

    return (
        getField(
            data,
            "StudentName",
            "studentName",
            "TeamLeader",
            "teamLeader",
            "LeaderName"
        ) ||
        "-"
    );

}


/* ============================================================
   GET TEAM NAME
   ============================================================ */

function getTeamName(data) {

    return (
        getField(
            data,
            "TeamName",
            "teamName"
        ) ||
        "Unnamed Team"
    );

}


/* ============================================================
   GET CLASS
   ============================================================ */

function getClassName(data) {

    return (
        getField(
            data,
            "Class",
            "class",
            "className"
        ) ||
        "-"
    );

}


/* ============================================================
   GET SECTION
   ============================================================ */

function getSectionName(data) {

    return (
        getField(
            data,
            "Section",
            "section"
        ) ||
        "-"
    );

}


/* ============================================================
   GET MOBILE
   ============================================================ */

function getMobile(data) {

    return (
        getField(
            data,
            "MobileNumber",
            "mobileNumber",
            "Mobile",
            "mobile",
            "Phone"
        ) ||
        "-"
    );

}


/* ============================================================
   DASHBOARD
   ============================================================ */

function updateDashboard() {

    const list =
        Object.values(
            registrations
        );


    setText(
        "totalRegistrations",
        list.length
    );


    setText(
        "totalTeams",
        list.length
    );


    const counts =
        calculateEventCounts();


    setText(
        "raceCount",
        counts.race
    );

    setText(
        "warCount",
        counts.war
    );

    setText(
        "tugCount",
        counts.tug
    );

    setText(
        "soccerCount",
        counts.soccer
    );


    setText(
        "eventRaceCount",
        counts.race
    );

    setText(
        "eventWarCount",
        counts.war
    );

    setText(
        "eventTugCount",
        counts.tug
    );

    setText(
        "eventSoccerCount",
        counts.soccer
    );

}


/* ============================================================
   EVENT COUNTS
   ============================================================ */

function calculateEventCounts() {

    const counts = {

        race: 0,

        war: 0,

        tug: 0,

        soccer: 0

    };


    Object.values(
        registrations
    )
    .forEach(data => {

        const events =
            getEvents(data)
                .map(canonicalEvent);


        events.forEach(event => {

            switch (event) {

                case "Robo Race":
                    counts.race++;
                    break;

                case "Robo War":
                    counts.war++;
                    break;

                case "Robo Tug of War":
                    counts.tug++;
                    break;

                case "Robo Soccer":
                    counts.soccer++;
                    break;

            }

        });

    });


    return counts;

}


/* ============================================================
   RECENT REGISTRATIONS
   ============================================================ */

function renderRecent() {

    const container =
        document.getElementById(
            "recentRegistrations"
        );


    if (!container) {
        return;
    }


    const entries =
        Object.entries(
            registrations
        )
        .sort(
            ([, a], [, b]) => {

                return (
                    getTimestamp(b) -
                    getTimestamp(a)
                );

            }
        )
        .slice(0, 6);


    if (!entries.length) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-folder-open"></i>

                <span>
                    No registrations found.
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const name =
                        getTeamLeader(data);

                    const team =
                        getTeamName(data);

                    const id =
                        getRegistrationId(
                            key,
                            data
                        );


                    return `

                        <div class="recent-item">

                            <div class="recent-avatar">

                                <i class="fa-solid fa-user"></i>

                            </div>


                            <div class="recent-details">

                                <strong>
                                    ${escapeHTML(name)}
                                </strong>

                                <span>
                                    ${escapeHTML(team)}
                                </span>

                                <span class="recent-id">
                                    ${escapeHTML(id)}
                                </span>

                            </div>


                            <button
                                type="button"
                                class="action-btn view"
                                data-view="${escapeAttr(key)}"
                                title="View Details"
                                aria-label="View registration details">

                                <i class="fa-solid fa-eye"></i>

                            </button>

                        </div>

                    `;

                }
            )
            .join("");


    container
        .querySelectorAll("[data-view]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openDetails(
                        button.dataset.view
                    );

                }
            );

        });

}


/* ============================================================
   POPULATE CLASS / SECTION FILTERS
   ============================================================ */

function populateFilters() {

    if (
        !classFilter ||
        !sectionFilter
    ) {

        return;

    }


    const classes =
        new Set();

    const sections =
        new Set();


    Object.values(
        registrations
    )
    .forEach(data => {

        const className =
            getClassName(data);

        const section =
            getSectionName(data);


        if (
            className &&
            className !== "-"
        ) {

            classes.add(
                className
            );

        }


        if (
            section &&
            section !== "-"
        ) {

            sections.add(
                section
            );

        }

    });


    const oldClass =
        classFilter.value;

    const oldSection =
        sectionFilter.value;


    classFilter.innerHTML = `
        <option value="all">
            All Classes
        </option>
    `;


    [...classes]
        .sort(
            naturalSort
        )
        .forEach(value => {

            classFilter.insertAdjacentHTML(
                "beforeend",
                `
                    <option value="${escapeAttr(value)}">
                        ${escapeHTML(value)}
                    </option>
                `
            );

        });


    sectionFilter.innerHTML = `
        <option value="all">
            All Sections
        </option>
    `;


    [...sections]
        .sort(
            naturalSort
        )
        .forEach(value => {

            sectionFilter.insertAdjacentHTML(
                "beforeend",
                `
                    <option value="${escapeAttr(value)}">
                        ${escapeHTML(value)}
                    </option>
                `
            );

        });


    if (
        [...classes].includes(oldClass)
    ) {

        classFilter.value =
            oldClass;

    }


    if (
        [...sections].includes(oldSection)
    ) {

        sectionFilter.value =
            oldSection;

    }

}


/* ============================================================
   NATURAL SORT
   ============================================================ */

function naturalSort(a, b) {

    return String(a)
        .localeCompare(
            String(b),
            undefined,
            {
                numeric: true,
                sensitivity: "base"
            }
        );

}


/* ============================================================
   FILTER EVENTS
   ============================================================ */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}

if (eventFilter) {

    eventFilter.addEventListener(
        "change",
        applyFilters
    );

}

if (classFilter) {

    classFilter.addEventListener(
        "change",
        applyFilters
    );

}

if (sectionFilter) {

    sectionFilter.addEventListener(
        "change",
        applyFilters
    );

}


if (clearFilters) {

    clearFilters.addEventListener(
        "click",
        () => {

            if (searchInput) {
                searchInput.value = "";
            }

            if (eventFilter) {
                eventFilter.value = "all";
            }

            if (classFilter) {
                classFilter.value = "all";
            }

            if (sectionFilter) {
                sectionFilter.value = "all";
            }

            applyFilters();

        }
    );

}


/* ============================================================
   APPLY FILTERS
   ============================================================ */

function applyFilters() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedEvent =
        eventFilter
            ? eventFilter.value
            : "all";


    const selectedClass =
        classFilter
            ? classFilter.value
            : "all";


    const selectedSection =
        sectionFilter
            ? sectionFilter.value
            : "all";


    filteredRegistrations = {};


    Object.entries(
        registrations
    )
    .forEach(
        ([key, data]) => {

            const events =
                getEvents(data)
                    .map(canonicalEvent);


            const searchable = [

                getRegistrationId(
                    key,
                    data
                ),

                getTeamLeader(data),

                getTeamName(data),

                getClassName(data),

                getSectionName(data),

                getMobile(data),

                getRegistrationEmail(data),

                events.join(" "),

                getField(
                    data,
                    "Member2Name"
                ),

                getField(
                    data,
                    "Member3Name"
                ),

                getField(
                    data,
                    "Member4Name"
                ),

                getField(
                    data,
                    "Member5Name"
                )

            ]
                .map(normalize)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchable.includes(search);


            const matchesEvent =
                selectedEvent === "all" ||
                events.some(
                    event =>
                        event.toLowerCase() ===
                        selectedEvent.toLowerCase()
                );


            const matchesClass =
                selectedClass === "all" ||
                getClassName(data) ===
                selectedClass;


            const matchesSection =
                selectedSection === "all" ||
                getSectionName(data) ===
                selectedSection;


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


    renderTable();

}


/* ============================================================
   RENDER REGISTRATION TABLE
   ============================================================ */

function renderTable() {

    if (
        !tableBody ||
        !tableEmpty ||
        !resultCount
    ) {

        return;

    }


    const entries =
        Object.entries(
            filteredRegistrations
        );


    resultCount.textContent =
        `${entries.length} registration${
            entries.length === 1
                ? ""
                : "s"
        }`;


    tableBody.innerHTML = "";


    if (!entries.length) {

        tableEmpty.classList.remove(
            "hidden"
        );

        if (tableStatus) {
            tableStatus.textContent =
                "No matching records";
        }

        return;

    }


    tableEmpty.classList.add(
        "hidden"
    );


    entries.sort(
        ([, a], [, b]) => {

            return (
                getTimestamp(b) -
                getTimestamp(a)
            );

        }
    );


    entries.forEach(
        ([key, data]) => {

            const id =
                getRegistrationId(
                    key,
                    data
                );


            const name =
                getTeamLeader(data);


            const team =
                getTeamName(data);


            const className =
                getClassName(data);


            const section =
                getSectionName(data);


            const mobile =
                getMobile(data);


            const teamSize =
                getTeamSize(data);


            const date =
                formatDate(
                    getRegistrationDate(data)
                );


            const events =
                getEvents(data)
                    .map(canonicalEvent);


            const eventHTML =
                events.length
                    ? events
                        .map(
                            event => `
                                <span class="event-tag">
                                    ${escapeHTML(event)}
                                </span>
                            `
                        )
                        .join("")
                    : `
                        <span class="muted-text">
                            No event
                        </span>
                    `;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <span class="registration-id">

                        ${escapeHTML(id)}

                    </span>

                </td>


                <td>

                    <strong class="team-name">

                        ${escapeHTML(name)}

                    </strong>

                </td>


                <td>

                    ${escapeHTML(team)}

                </td>


                <td>

                    ${escapeHTML(className)}

                </td>


                <td>

                    ${escapeHTML(section)}

                </td>


                <td>

                    ${escapeHTML(mobile)}

                </td>


                <td>

                    <div class="event-tags">

                        ${eventHTML}

                    </div>

                </td>


                <td>

                    <strong>
                        ${teamSize}
                    </strong>

                </td>


                <td>

                    ${escapeHTML(date)}

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="action-btn view"
                            title="View Details"
                            aria-label="View Details"
                            data-view="${escapeAttr(key)}">

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            type="button"
                            class="action-btn edit"
                            title="Edit Registration"
                            aria-label="Edit Registration"
                            data-edit="${escapeAttr(key)}">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            class="action-btn delete"
                            title="Delete Registration"
                            aria-label="Delete Registration"
                            data-delete="${escapeAttr(key)}">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    bindTableActions();


    if (tableStatus) {
        tableStatus.textContent =
            "Database synced";
    }

}


/* ============================================================
   TABLE ACTION BUTTONS
   ============================================================ */

function bindTableActions() {

    tableBody
        ?.querySelectorAll("[data-view]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openDetails(
                        button.dataset.view
                    );

                }
            );

        });


    tableBody
        ?.querySelectorAll("[data-edit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openEdit(
                        button.dataset.edit
                    );

                }
            );

        });


    tableBody
        ?.querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteRegistration(
                        button.dataset.delete
                    );

                }
            );

        });

}


/* ============================================================
   OPEN DETAILS MODAL
   ============================================================ */

function openDetails(key) {

    const data =
        registrations[key];


    if (!data) {

        showToast(
            "Registration not found.",
            "error"
        );

        return;

    }


    currentRegistrationKey =
        key;


    const id =
        getRegistrationId(
            key,
            data
        );


    const events =
        getEvents(data)
            .map(canonicalEvent);


    let membersHTML = "";


    for (
        let i = 2;
        i <= 5;
        i++
    ) {

        const memberName =
            getField(
                data,
                `Member${i}Name`,
                `member${i}Name`
            );


        if (!memberName) {
            continue;
        }


        const memberClass =
            getField(
                data,
                `Member${i}Class`,
                `member${i}Class`
            );


        const memberSection =
            getField(
                data,
                `Member${i}Section`,
                `member${i}Section`
            );


        membersHTML += `

            <div class="member-detail">

                <strong>
                    Team Member ${i}
                </strong>


                <div class="detail-grid">

                    <div class="detail-item">

                        <label>
                            Name
                        </label>

                        <strong>
                            ${escapeHTML(memberName)}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <label>
                            Class
                        </label>

                        <strong>
                            ${escapeHTML(
                                memberClass || "-"
                            )}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <label>
                            Section
                        </label>

                        <strong>
                            ${escapeHTML(
                                memberSection || "-"
                            )}
                        </strong>

                    </div>

                </div>

            </div>

        `;

    }


    detailsContent.innerHTML = `

        <div class="detail-section">

            <h3>
                Registration Information
            </h3>


            <div class="detail-grid">

                <div class="detail-item">

                    <label>
                        Registration ID
                    </label>

                    <strong>
                        ${escapeHTML(id)}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Registration Date
                    </label>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                getRegistrationDate(data)
                            )
                        )}
                    </strong>

                </div>

            </div>

        </div>


        <div class="detail-section">

            <h3>
                Team Information
            </h3>


            <div class="detail-grid">

                <div class="detail-item">

                    <label>
                        Team Leader
                    </label>

                    <strong>
                        ${escapeHTML(
                            getTeamLeader(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Team Name
                    </label>

                    <strong>
                        ${escapeHTML(
                            getTeamName(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Class
                    </label>

                    <strong>
                        ${escapeHTML(
                            getClassName(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Section
                    </label>

                    <strong>
                        ${escapeHTML(
                            getSectionName(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Mobile
                    </label>

                    <strong>
                        ${escapeHTML(
                            getMobile(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Email
                    </label>

                    <strong>
                        ${escapeHTML(
                            getRegistrationEmail(data) ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Team Size
                    </label>

                    <strong>
                        ${getTeamSize(data)} Member(s)
                    </strong>

                </div>

            </div>

        </div>


        <div class="detail-section">

            <h3>
                Selected Events
            </h3>


            <div class="event-tags">

                ${
                    events.length

                        ? events
                            .map(
                                event => `
                                    <span class="event-tag">
                                        ${escapeHTML(event)}
                                    </span>
                                `
                            )
                            .join("")

                        : `
                            <span class="muted-text">
                                No event selected
                            </span>
                        `
                }

            </div>

        </div>


        ${
            membersHTML

                ? `
                    <div class="detail-section">

                        <h3>
                            Team Members
                        </h3>

                        ${membersHTML}

                    </div>
                `

                : ""
        }


        <div class="detail-section">

            <h3>
                Remarks
            </h3>


            <div class="detail-item">

                <strong>
                    ${escapeHTML(
                        getField(
                            data,
                            "Remarks",
                            "remarks"
                        ) ||
                        "No remarks."
                    )}
                </strong>

            </div>

        </div>

    `;


    detailsModal?.classList.remove(
        "hidden"
    );

}


/* ============================================================
   DELETE FROM DETAILS MODAL
   ============================================================ */

if (modalDeleteBtn) {

    modalDeleteBtn.addEventListener(
        "click",
        () => {

            if (currentRegistrationKey) {

                deleteRegistration(
                    currentRegistrationKey
                );

            }

        }
    );

}


/* ============================================================
   OPEN EDIT MODAL
   ============================================================ */

function openEdit(key) {

    const data =
        registrations[key];


    if (!data) {

        showToast(
            "Registration not found.",
            "error"
        );

        return;

    }


    if (!editForm) {
        return;
    }


    editKey.value =
        key;


    editStudentName.value =
        getTeamLeader(data) === "-"
            ? ""
            : getTeamLeader(data);


    editTeamName.value =
        getTeamName(data) === "Unnamed Team"
            ? ""
            : getTeamName(data);


    editClass.value =
        getClassName(data) === "-"
            ? ""
            : getClassName(data);


    editSection.value =
        getSectionName(data) === "-"
            ? ""
            : getSectionName(data);


    editMobile.value =
        getMobile(data) === "-"
            ? ""
            : getMobile(data);


    editEmail.value =
        getRegistrationEmail(data);


    editRemarks.value =
        getField(
            data,
            "Remarks",
            "remarks"
        );


    editModal?.classList.remove(
        "hidden"
    );

}


/* ============================================================
   SAVE EDIT
   ============================================================ */

if (editForm) {

    editForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const key =
                editKey.value;


            if (!key) {

                showToast(
                    "Registration key is missing.",
                    "error"
                );

                return;

            }


            const saveButton =
                document.getElementById(
                    "saveEditBtn"
                );


            if (saveButton) {

                saveButton.disabled = true;

                saveButton.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Saving...
                `;

            }


            try {

                const updates = {

                    StudentName:
                        editStudentName.value.trim(),

                    TeamName:
                        editTeamName.value.trim(),

                    Class:
                        editClass.value.trim(),

                    Section:
                        editSection.value.trim(),

                    MobileNumber:
                        editMobile.value.trim(),

                    EmailAddress:
                        editEmail.value.trim(),

                    Remarks:
                        editRemarks.value.trim()

                };


                await update(
                    ref(
                        database,
                        `registrations/${key}`
                    ),
                    updates
                );


                registrations[key] = {

                    ...registrations[key],

                    ...updates

                };


                applyFilters();

                populateFilters();

                updateDashboard();

                renderRecent();

                updateEventPage();


                editModal?.classList.add(
                    "hidden"
                );


                showToast(
                    "Registration updated successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Update Error:",
                    error
                );


                showToast(
                    "Unable to update registration.",
                    "error"
                );


            } finally {

                if (saveButton) {

                    saveButton.disabled = false;

                    saveButton.innerHTML = `
                        <i class="fa-solid fa-floppy-disk"></i>
                        Save Changes
                    `;

                }

            }

        }
    );

}


/* ============================================================
   DELETE REGISTRATION
   ============================================================ */

async function deleteRegistration(key) {

    const data =
        registrations[key];


    if (!data) {

        showToast(
            "Registration not found.",
            "error"
        );

        return;

    }


    const name =
        getTeamLeader(data);


    const confirmed =
        window.confirm(
            `Are you sure you want to delete the registration for ${name}?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        await remove(
            ref(
                database,
                `registrations/${key}`
            )
        );


        delete registrations[key];

        delete filteredRegistrations[key];


        currentRegistrationKey =
            null;


        detailsModal?.classList.add(
            "hidden"
        );


        editModal?.classList.add(
            "hidden"
        );


        populateFilters();

        updateDashboard();

        renderRecent();

        renderTable();

        updateEventPage();


        showToast(
            "Registration deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete Error:",
            error
        );


        showToast(
            "Unable to delete registration.",
            "error"
        );

    }

}


/* ============================================================
   EVENT PAGE
   ============================================================ */

function updateEventPage() {

    const counts =
        calculateEventCounts();


    setText(
        "eventRaceCount",
        counts.race
    );

    setText(
        "eventWarCount",
        counts.war
    );

    setText(
        "eventTugCount",
        counts.tug
    );

    setText(
        "eventSoccerCount",
        counts.soccer
    );

}


/* ============================================================
   REFRESH BUTTONS
   ============================================================ */

const dashboardRefresh =
    document.getElementById(
        "dashboardRefresh"
    );

if (dashboardRefresh) {

    dashboardRefresh.addEventListener(
        "click",
        async () => {

            await loadRegistrations();

            showToast(
                "Dashboard refreshed.",
                "success"
            );

        }
    );

}


const refreshRegistrations =
    document.getElementById(
        "refreshRegistrations"
    );

if (refreshRegistrations) {

    refreshRegistrations.addEventListener(
        "click",
        async () => {

            await loadRegistrations();

            showToast(
                "Registrations refreshed.",
                "success"
            );

        }
    );

}


/* ============================================================
   EXPORT BUTTONS
   ============================================================ */

const exportCsv =
    document.getElementById(
        "exportCsv"
    );

if (exportCsv) {

    exportCsv.addEventListener(
        "click",
        () => {

            exportCSV(
                filteredRegistrations
            );

        }
    );

}


const exportDashboard =
    document.getElementById(
        "exportDashboard"
    );

if (exportDashboard) {

    exportDashboard.addEventListener(
        "click",
        () => {

            exportCSV(
                registrations
            );

        }
    );

}


/* ============================================================
   CSV EXPORT
   ============================================================ */

function exportCSV(dataObject) {

    const entries =
        Object.entries(
            dataObject || {}
        );


    if (!entries.length) {

        showToast(
            "There are no registrations to export.",
            "error"
        );

        return;

    }


    const headers = [

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

    ];


    const rows = [
        headers
    ];


    entries.forEach(
        ([key, data]) => {

            rows.push([

                getRegistrationId(
                    key,
                    data
                ),

                getTeamLeader(data),

                getTeamName(data),

                getClassName(data),

                getSectionName(data),

                getMobile(data),

                getRegistrationEmail(data),

                getEvents(data)
                    .map(canonicalEvent)
                    .join(" | "),

                getTeamSize(data),

                getField(
                    data,
                    "Member2Name",
                    "member2Name"
                ),

                getField(
                    data,
                    "Member3Name",
                    "member3Name"
                ),

                getField(
                    data,
                    "Member4Name",
                    "member4Name"
                ),

                getField(
                    data,
                    "Member5Name",
                    "member5Name"
                ),

                getField(
                    data,
                    "Remarks",
                    "remarks"
                ),

                getRegistrationDate(data)

            ]);

        }
    );


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(csvEscape)
                        .join(",")
            )
            .join("\r\n");


    const blob =
        new Blob(
            [
                "\ufeff",
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        `APS_Robotics_Registrations_2026_${getFileDate()}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {
            URL.revokeObjectURL(url);
        },
        1000
    );


    showToast(
        "CSV exported successfully.",
        "success"
    );

}


/* ============================================================
   CSV ESCAPE
   ============================================================ */

function csvEscape(value) {

    const string =
        normalize(value);


    return `"${string.replace(
        /"/g,
        '""'
    )}"`;

}


/* ============================================================
   FILE DATE
   ============================================================ */

function getFileDate() {

    const now =
        new Date();


    return [
        now.getFullYear(),
        String(
            now.getMonth() + 1
        ).padStart(2, "0"),
        String(
            now.getDate()
        ).padStart(2, "0")
    ].join("-");

}


/* ============================================================
   MODAL CLOSE BUTTONS
   ============================================================ */

document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            closeAllModals
        );

    });


/* ============================================================
   CLOSE MODALS
   ============================================================ */

function closeAllModals() {

    detailsModal?.classList.add(
        "hidden"
    );

    editModal?.classList.add(
        "hidden"
    );

    currentRegistrationKey =
        null;

}


/* ============================================================
   MODAL BACKDROP
   ============================================================ */

if (detailsModal) {

    detailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                detailsModal
            ) {

                closeAllModals();

            }

        }
    );

}


if (editModal) {

    editModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                editModal
            ) {

                closeAllModals();

            }

        }
    );

}


/* ============================================================
   KEYBOARD ESCAPE
   ============================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeAllModals();

        }

    }
);


/* ============================================================
   TOAST
   ============================================================ */

function showToast(
    message,
    type = "success"
) {

    if (
        !toast ||
        !toastMessage
    ) {

        return;

    }


    toastMessage.textContent =
        message;


    const icon =
        toast.querySelector("i");


    if (icon) {

        if (type === "error") {

            icon.className =
                "fa-solid fa-circle-exclamation";

        } else {

            icon.className =
                "fa-solid fa-circle-check";

        }

    }


    toast.classList.remove(
        "error",
        "success"
    );


    toast.classList.add(
        type
    );


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* ============================================================
   GET REGISTRATION DATE
   Supports:
   - ISO strings
   - Firebase timestamp
   - numeric timestamp
   - registrationDate
   - createdAt
   - timestamp
   ============================================================ */

function getRegistrationDate(data) {

    if (!data) {
        return "";
    }


    return (
        data.registrationDate ??
        data.RegistrationDate ??
        data.createdAt ??
        data.created_at ??
        data.timestamp ??
        data.Timestamp ??
        ""
    );

}


/* ============================================================
   GET TIMESTAMP
   ============================================================ */

function getTimestamp(data) {

    const value =
        getRegistrationDate(data);


    if (!value) {
        return 0;
    }


    if (
        typeof value === "number"
    ) {

        /*
         * Firebase / JavaScript timestamps
         * may be seconds or milliseconds.
         */

        return value < 10000000000
            ? value * 1000
            : value;

    }


    if (
        typeof value === "object" &&
        value.seconds !== undefined
    ) {

        return (
            Number(value.seconds) * 1000
        );

    }


    const date =
        new Date(value);


    const timestamp =
        date.getTime();


    return Number.isNaN(timestamp)
        ? 0
        : timestamp;

}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(value) {

    if (!value) {
        return "-";
    }


    let date;


    if (
        typeof value === "number"
    ) {

        date =
            new Date(
                value < 10000000000
                    ? value * 1000
                    : value
            );

    }

    else if (
        typeof value === "object" &&
        value.seconds !== undefined
    ) {

        date =
            new Date(
                Number(value.seconds) * 1000
            );

    }

    else {

        date =
            new Date(value);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return normalize(value);

    }


    return date.toLocaleString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


/* ============================================================
   SET TEXT
   ============================================================ */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* ============================================================
   HTML ESCAPE
   ============================================================ */

function escapeHTML(value) {

    return normalize(value)
        .replace(
            /[&<>"']/g,
            character => {

                const entities = {

                    "&":
                        "&amp;",

                    "<":
                        "&lt;",

                    ">":
                        "&gt;",

                    '"':
                        "&quot;",

                    "'":
                        "&#039;"

                };


                return (
                    entities[character]
                    || character
                );

            }
        );

}


/* ============================================================
   ATTRIBUTE ESCAPE
   ============================================================ */

function escapeAttr(value) {

    return escapeHTML(value);

}


/* ============================================================
   INITIAL STATE
   ============================================================ */

registrations = {};

filteredRegistrations = {};


/* ============================================================
   INITIAL PAGE
   ============================================================ */

showPage("dashboard");


/* ============================================================
   CONSOLE STATUS
   ============================================================ */

console.log(
    "%cAPS Robotics Championship 2026 Admin Panel",
    "font-size:16px;font-weight:bold;"
);

console.log(
    "%cFirebase Admin Panel initialized.",
    "font-size:13px;"
);
