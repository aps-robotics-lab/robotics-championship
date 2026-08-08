/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN PANEL
   COMPLETE FIREBASE VERSION

   FEATURES:
   - Firebase Email/Password Authentication
   - Realtime Database
   - Dashboard
   - Registration management
   - Search
   - Event/Class/Section filters
   - View details
   - Edit
   - Delete
   - CSV export
   - Responsive sidebar
   - Mobile navigation
   - Toast notifications
===================================================== */


/* =====================================================
   FIREBASE IMPORTS
===================================================== */

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


/* =====================================================
   FIREBASE CONFIG
===================================================== */

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


/* =====================================================
   FIREBASE INITIALIZATION
===================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);


/* =====================================================
   GLOBAL STATE
===================================================== */

let registrations = {};

let filteredRegistrations = {};

let currentRegistrationKey = null;

let toastTimer = null;

let isLoading = false;


/* =====================================================
   DOM
===================================================== */

const $ = id => document.getElementById(id);

const loginScreen = $("loginScreen");
const adminApp = $("adminApp");

const loginForm = $("loginForm");
const loginEmail = $("loginEmail");
const loginPassword = $("loginPassword");
const loginBtn = $("loginBtn");
const loginError = $("loginError");
const togglePassword = $("togglePassword");

const adminEmail = $("adminEmail");
const logoutBtn = $("logoutBtn");

const sidebar = $("sidebar");
const sidebarToggle = $("sidebarToggle");
const sidebarOverlay = $("sidebarOverlay");

const tableBody = $("registrationTableBody");
const tableEmpty = $("tableEmpty");

const resultCount = $("resultCount");
const tableStatus = $("tableStatus");

const searchInput = $("searchInput");
const eventFilter = $("eventFilter");
const classFilter = $("classFilter");
const sectionFilter = $("sectionFilter");

const clearFilters = $("clearFilters");

const detailsModal = $("detailsModal");
const editModal = $("editModal");

const detailsContent = $("detailsContent");
const modalDeleteBtn = $("modalDeleteBtn");

const editForm = $("editForm");
const editKey = $("editKey");

const editStudentName = $("editStudentName");
const editTeamName = $("editTeamName");
const editClass = $("editClass");
const editSection = $("editSection");
const editMobile = $("editMobile");
const editEmail = $("editEmail");
const editRemarks = $("editRemarks");

const toast = $("toast");
const toastMessage = $("toastMessage");

const firebaseStatus = $("firebaseStatus");

const navRegistrationCount =
    $("navRegistrationCount");


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
    auth,
    async user => {

        if (user) {

            loginScreen.classList.add("hidden");

            adminApp.classList.remove("hidden");

            adminEmail.textContent =
                user.email ||
                "Authenticated Admin";

            if (firebaseStatus) {
                firebaseStatus.textContent =
                    "Firebase Connected";
            }

            await loadRegistrations();

        } else {

            loginScreen.classList.remove("hidden");

            adminApp.classList.add("hidden");

            registrations = {};

            filteredRegistrations = {};

            closeAllModals();

        }

    }
);


/* =====================================================
   LOGIN
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;

            loginError.textContent = "";

            if (!email || !password) {

                loginError.textContent =
                    "Please enter your email and password.";

                return;

            }

            setLoginLoading(true);

            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                loginPassword.value = "";

            } catch (error) {

                console.error(
                    "Firebase login error:",
                    error
                );

                loginError.textContent =
                    getAuthError(error);

            } finally {

                setLoginLoading(false);

            }

        }
    );

}


/* =====================================================
   LOGIN BUTTON STATE
===================================================== */

function setLoginLoading(loading) {

    if (!loginBtn) return;

    loginBtn.disabled = loading;

    loginBtn.innerHTML = loading

        ? `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Signing In...</span>
        `

        : `
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Login to Dashboard</span>
        `;

}


/* =====================================================
   AUTH ERRORS
===================================================== */

function getAuthError(error) {

    const code =
        error?.code || "";

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
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        case "auth/user-disabled":
            return "This admin account has been disabled.";

        case "auth/operation-not-allowed":
            return "Email/password authentication is disabled.";

        default:
            return "Login failed. Please check your credentials.";

    }

}


/* =====================================================
   PASSWORD TOGGLE
===================================================== */

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const show =
                loginPassword.type === "password";

            loginPassword.type =
                show
                    ? "text"
                    : "password";

            togglePassword.innerHTML =
                show
                    ? '<i class="fa-solid fa-eye-slash"></i>'
                    : '<i class="fa-solid fa-eye"></i>';

            togglePassword.setAttribute(
                "aria-label",
                show
                    ? "Hide password"
                    : "Show password"
            );

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

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
                    "Logout error:",
                    error
                );

                showToast(
                    "Logout failed.",
                    "error"
                );

            }

        }
    );

}


/* =====================================================
   SIDEBAR
===================================================== */

if (sidebarToggle) {

    sidebarToggle.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("open");

            sidebarOverlay.classList.toggle(
                "show",
                sidebar.classList.contains("open")
            );

        }
    );

}

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}

function closeSidebar() {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("show");

}


/* =====================================================
   NAVIGATION
===================================================== */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                showPage(page);

                closeSidebar();

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


function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    const target =
        $(`${pageName}Page`);

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
        $("pageTitle");

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


/* =====================================================
   LOAD REGISTRATIONS
===================================================== */

async function loadRegistrations() {

    if (isLoading) return;

    isLoading = true;

    setTableStatus("Loading...");

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "registrations"
                )
            );


        if (snapshot.exists()) {

            const data =
                snapshot.val();

            registrations =
                data &&
                typeof data === "object"
                    ? data
                    : {};

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

        updateNavigationCount();

        setTableStatus(
            "Database synced"
        );


    } catch (error) {

        console.error(
            "Database loading error:",
            error
        );

        registrations = {};

        filteredRegistrations = {};

        setTableStatus(
            "Database error"
        );

        renderTable();

        updateDashboard();

        renderRecent();

        updateEventPage();

        showToast(
            getDatabaseError(error),
            "error"
        );

    } finally {

        isLoading = false;

    }

}


/* =====================================================
   DATABASE ERROR
===================================================== */

function getDatabaseError(error) {

    if (
        error?.code ===
        "PERMISSION_DENIED"
    ) {

        return (
            "Database permission denied. " +
            "Check Firebase Realtime Database rules."
        );

    }

    if (
        error?.code ===
        "NETWORK_ERROR"
    ) {

        return "Network error while loading database.";

    }

    return "Unable to load registrations.";

}


/* =====================================================
   NORMALIZE
===================================================== */

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


/* =====================================================
   EVENTS
===================================================== */

function getEvents(data) {

    if (!data) return [];

    const possible =
        data.Events ??
        data.events ??
        data.Event ??
        data.event ??
        data.selectedEvents ??
        data.SelectedEvents;


    if (!possible) return [];


    if (Array.isArray(possible)) {

        return possible
            .flatMap(event =>
                normalize(event)
                    .split(/\s*(?:,|\||;)\s*/)
            )
            .map(cleanEventName)
            .filter(Boolean);

    }


    if (
        typeof possible === "object"
    ) {

        return Object
            .values(possible)
            .flatMap(event =>
                normalize(event)
                    .split(/\s*(?:,|\||;)\s*/)
            )
            .map(cleanEventName)
            .filter(Boolean);

    }


    return normalize(possible)
        .split(/\s*(?:,|\||;)\s*/)
        .map(cleanEventName)
        .filter(Boolean);

}


/* =====================================================
   CLEAN EVENT NAME
===================================================== */

function cleanEventName(value) {

    const text =
        normalize(value)
            .trim();

    if (!text) return "";

    const lower =
        text.toLowerCase();

    if (lower.includes("tug")) {
        return "Robo Tug of War";
    }

    if (lower.includes("soccer")) {
        return "Robo Soccer";
    }

    if (
        lower.includes("race")
    ) {
        return "Robo Race";
    }

    if (
        lower.includes("war")
    ) {
        return "Robo War";
    }

    return text;

}


/* =====================================================
   EMAIL
===================================================== */

function getRegistrationEmail(data) {

    return normalize(
        data?.EmailAddress ??
        data?.emailAddress ??
        data?.Email ??
        data?.email
    ).trim();

}


/* =====================================================
   TEAM SIZE
===================================================== */

function getTeamSize(data) {

    if (!data) return 0;


    const teamSize =
        Number(
            data.TeamSize ??
            data.teamSize
        );


    if (
        Number.isFinite(teamSize) &&
        teamSize > 0
    ) {

        return teamSize;

    }


    let count = 1;


    for (
        let i = 2;
        i <= 10;
        i++
    ) {

        const member =
            data[`Member${i}Name`] ??
            data[`member${i}Name`] ??
            data[`TeamMember${i}`];


        if (
            normalize(member).trim()
        ) {

            count++;

        }

    }


    return count;

}


/* =====================================================
   TEAM MEMBER FIELDS
===================================================== */

function getMemberName(data, number) {

    return normalize(
        data?.[`Member${number}Name`] ??
        data?.[`member${number}Name`] ??
        data?.[`TeamMember${number}Name`] ??
        data?.[`TeamMember${number}`]
    ).trim();

}


function getMemberClass(data, number) {

    return normalize(
        data?.[`Member${number}Class`] ??
        data?.[`member${number}Class`]
    ).trim();

}


function getMemberSection(data, number) {

    return normalize(
        data?.[`Member${number}Section`] ??
        data?.[`member${number}Section`]
    ).trim();

}


/* =====================================================
   DASHBOARD
===================================================== */

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


    updateEventPage();

    updateNavigationCount();

}


/* =====================================================
   EVENT COUNTS
===================================================== */

function calculateEventCounts() {

    const counts = {

        race: 0,

        war: 0,

        tug: 0,

        soccer: 0

    };


    Object
        .values(registrations)
        .forEach(data => {

            getEvents(data)
                .forEach(event => {

                    const clean =
                        event
                            .toLowerCase()
                            .trim();


                    if (
                        clean ===
                        "robo race"
                    ) {

                        counts.race++;

                    }


                    if (
                        clean ===
                        "robo war"
                    ) {

                        counts.war++;

                    }


                    if (
                        clean ===
                        "robo tug of war"
                    ) {

                        counts.tug++;

                    }


                    if (
                        clean ===
                        "robo soccer"
                    ) {

                        counts.soccer++;

                    }

                });

        });


    return counts;

}


/* =====================================================
   RECENT
===================================================== */

function renderRecent() {

    const container =
        $("recentRegistrations");

    if (!container) return;


    const entries =
        Object
            .entries(registrations)
            .sort(
                ([, a], [, b]) =>
                    getTimestamp(b) -
                    getTimestamp(a)
            )
            .slice(0, 6);


    if (!entries.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                No registrations found.
            </div>
        `;

        return;

    }


    container.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const id =
                        normalize(
                            data.registrationId ??
                            data.RegistrationId ??
                            data.registrationID
                        ) ||
                        key;


                    const name =
                        normalize(
                            data.StudentName ??
                            data.studentName ??
                            data.TeamLeader
                        ) ||
                        "Unknown";


                    const team =
                        normalize(
                            data.TeamName ??
                            data.teamName
                        ) ||
                        "Unnamed Team";


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
                            >
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


/* =====================================================
   FILTER OPTIONS
===================================================== */

function populateFilters() {

    if (
        !classFilter ||
        !sectionFilter
    ) return;


    const classes =
        new Set();

    const sections =
        new Set();


    Object
        .values(registrations)
        .forEach(data => {

            const className =
                normalize(
                    data.Class ??
                    data.class
                ).trim();


            const section =
                normalize(
                    data.Section ??
                    data.section
                ).trim();


            if (className) {
                classes.add(className);
            }

            if (section) {
                sections.add(section);
            }

        });


    const previousClass =
        classFilter.value;

    const previousSection =
        sectionFilter.value;


    classFilter.innerHTML = `
        <option value="all">
            All Classes
        </option>
    `;


    [...classes]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    undefined,
                    {
                        numeric: true
                    }
                )
        )
        .forEach(value => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = value;

            option.textContent = value;

            classFilter.appendChild(
                option
            );

        });


    sectionFilter.innerHTML = `
        <option value="all">
            All Sections
        </option>
    `;


    [...sections]
        .sort()
        .forEach(value => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = value;

            option.textContent = value;

            sectionFilter.appendChild(
                option
            );

        });


    if (
        [...classes]
            .includes(previousClass)
    ) {

        classFilter.value =
            previousClass;

    }


    if (
        [...sections]
            .includes(previousSection)
    ) {

        sectionFilter.value =
            previousSection;

    }

}


/* =====================================================
   FILTER LISTENERS
===================================================== */

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

            searchInput.value = "";

            eventFilter.value =
                "all";

            classFilter.value =
                "all";

            sectionFilter.value =
                "all";

            applyFilters();

        }
    );

}


/* =====================================================
   APPLY FILTERS
===================================================== */

function applyFilters() {

    const search =
        normalize(
            searchInput.value
        )
            .trim()
            .toLowerCase();


    const selectedEvent =
        eventFilter.value;


    const selectedClass =
        classFilter.value;


    const selectedSection =
        sectionFilter.value;


    filteredRegistrations = {};


    Object
        .entries(registrations)
        .forEach(
            ([key, data]) => {

                const events =
                    getEvents(data);


                const searchable = [

                    data.registrationId,

                    data.RegistrationId,

                    data.StudentName,

                    data.TeamLeader,

                    data.TeamName,

                    data.Class,

                    data.Section,

                    data.MobileNumber,

                    data.Mobile,

                    data.EmailAddress,

                    data.Email,

                    ...events

                ]
                    .map(normalize)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(
                        search
                    );


                const matchesEvent =
                    selectedEvent === "all" ||
                    events.some(
                        event =>
                            event
                                .toLowerCase() ===
                            selectedEvent
                                .toLowerCase()
                    );


                const classValue =
                    normalize(
                        data.Class ??
                        data.class
                    ).trim();


                const sectionValue =
                    normalize(
                        data.Section ??
                        data.section
                    ).trim();


                const matchesClass =
                    selectedClass === "all" ||
                    classValue ===
                    selectedClass;


                const matchesSection =
                    selectedSection === "all" ||
                    sectionValue ===
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


/* =====================================================
   RENDER TABLE
===================================================== */

function renderTable() {

    if (
        !tableBody ||
        !tableEmpty ||
        !resultCount
    ) return;


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

        return;

    }


    tableEmpty.classList.add(
        "hidden"
    );


    entries.sort(
        ([, a], [, b]) =>
            getTimestamp(b) -
            getTimestamp(a)
    );


    entries.forEach(
        ([key, data]) => {

            const id =
                normalize(
                    data.registrationId ??
                    data.RegistrationId
                ) ||
                key;


            const name =
                normalize(
                    data.StudentName ??
                    data.studentName ??
                    data.TeamLeader
                ) ||
                "-";


            const team =
                normalize(
                    data.TeamName ??
                    data.teamName
                ) ||
                "Unnamed Team";


            const className =
                normalize(
                    data.Class ??
                    data.class
                ) ||
                "-";


            const section =
                normalize(
                    data.Section ??
                    data.section
                ) ||
                "-";


            const mobile =
                normalize(
                    data.MobileNumber ??
                    data.Mobile ??
                    data.mobile
                ) ||
                "-";


            const events =
                getEvents(data);


            const teamSize =
                getTeamSize(data);


            const date =
                formatDate(
                    getRegistrationDate(data)
                );


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

                    : "-";


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
                    ${teamSize}
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
                            data-view="${escapeAttr(key)}"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn edit"
                            title="Edit Registration"
                            data-edit="${escapeAttr(key)}"
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn delete"
                            title="Delete Registration"
                            data-delete="${escapeAttr(key)}"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    bindTableActions();

}


/* =====================================================
   TABLE ACTIONS
===================================================== */

function bindTableActions() {

    tableBody
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


    tableBody
        .querySelectorAll("[data-edit]")
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
        .querySelectorAll("[data-delete]")
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


/* =====================================================
   DETAILS
===================================================== */

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
        normalize(
            data.registrationId ??
            data.RegistrationId
        ) ||
        key;


    const events =
        getEvents(data);


    let membersHTML = "";


    for (
        let i = 2;
        i <= 10;
        i++
    ) {

        const name =
            getMemberName(
                data,
                i
            );


        if (!name) continue;


        const memberClass =
            getMemberClass(
                data,
                i
            );


        const memberSection =
            getMemberSection(
                data,
                i
            );


        membersHTML += `

            <div class="member-detail">

                <strong>
                    Team Member ${i}
                </strong>

                <div class="detail-grid">

                    <div class="detail-item">

                        <label>Name</label>

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                    </div>

                    <div class="detail-item">

                        <label>Class</label>

                        <strong>
                            ${escapeHTML(
                                memberClass || "-"
                            )}
                        </strong>

                    </div>

                    <div class="detail-item">

                        <label>Section</label>

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
                            normalize(
                                data.StudentName ??
                                data.studentName ??
                                data.TeamLeader
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Team Name
                    </label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.TeamName ??
                                data.teamName
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Class
                    </label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.Class ??
                                data.class
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Section
                    </label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.Section ??
                                data.section
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Mobile
                    </label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.MobileNumber ??
                                data.Mobile ??
                                data.mobile
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Email
                    </label>

                    <strong>
                        ${escapeHTML(
                            getRegistrationEmail(data)
                            || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Team Size
                    </label>

                    <strong>
                        ${getTeamSize(data)}
                        Member(s)
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
                            <span>
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
                        normalize(
                            data.Remarks ??
                            data.remarks
                        ) ||
                        "No remarks."
                    )}
                </strong>

            </div>

        </div>

    `;


    detailsModal.classList.remove(
        "hidden"
    );

}


/* =====================================================
   DETAILS DELETE
===================================================== */

if (modalDeleteBtn) {

    modalDeleteBtn.addEventListener(
        "click",
        () => {

            if (
                currentRegistrationKey
            ) {

                deleteRegistration(
                    currentRegistrationKey
                );

            }

        }
    );

}


/* =====================================================
   OPEN EDIT
===================================================== */

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


    editKey.value =
        key;


    editStudentName.value =
        normalize(
            data.StudentName ??
            data.studentName ??
            data.TeamLeader
        );


    editTeamName.value =
        normalize(
            data.TeamName ??
            data.teamName
        );


    editClass.value =
        normalize(
            data.Class ??
            data.class
        );


    editSection.value =
        normalize(
            data.Section ??
            data.section
        );


    editMobile.value =
        normalize(
            data.MobileNumber ??
            data.Mobile ??
            data.mobile
        );


    editEmail.value =
        getRegistrationEmail(data);


    editRemarks.value =
        normalize(
            data.Remarks ??
            data.remarks
        );


    editModal.classList.remove(
        "hidden"
    );

}


/* =====================================================
   SAVE EDIT
===================================================== */

if (editForm) {

    editForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const key =
                editKey.value;


            if (!key) {

                showToast(
                    "Invalid registration.",
                    "error"
                );

                return;

            }


            const saveButton =
                $("saveEditBtn");


            saveButton.disabled =
                true;


            saveButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Saving...
            `;


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

                updateDashboard();

                renderRecent();

                updateEventPage();

                populateFilters();

                editModal.classList.add(
                    "hidden"
                );


                showToast(
                    "Registration updated successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Update error:",
                    error
                );


                showToast(
                    "Unable to update registration.",
                    "error"
                );

            } finally {

                saveButton.disabled =
                    false;


                saveButton.innerHTML = `
                    <i class="fa-solid fa-floppy-disk"></i>
                    Save Changes
                `;

            }

        }
    );

}


/* =====================================================
   DELETE
===================================================== */

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
        normalize(
            data.StudentName ??
            data.studentName ??
            data.TeamLeader
        ) ||
        "this registration";


    const confirmed =
        window.confirm(
            `Are you sure you want to delete the registration for ${name}?\n\nThis action cannot be undone.`
        );


    if (!confirmed) return;


    try {

        await remove(
            ref(
                database,
                `registrations/${key}`
            )
        );


        delete registrations[key];

        delete filteredRegistrations[key];


        closeAllModals();

        updateDashboard();

        populateFilters();

        renderRecent();

        renderTable();

        updateEventPage();


        showToast(
            "Registration deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showToast(
            "Unable to delete registration.",
            "error"
        );

    }

}


/* =====================================================
   EVENT PAGE
===================================================== */

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


/* =====================================================
   REFRESH BUTTONS
===================================================== */

const dashboardRefresh =
    $("dashboardRefresh");

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
    $("refreshRegistrations");

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


/* =====================================================
   EXPORT BUTTONS
===================================================== */

const exportCsv =
    $("exportCsv");

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
    $("exportDashboard");

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


/* =====================================================
   CSV EXPORT
===================================================== */

function exportCSV(dataObject) {

    const entries =
        Object.entries(
            dataObject
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

                normalize(
                    data.registrationId ??
                    data.RegistrationId
                ) ||
                key,

                normalize(
                    data.StudentName ??
                    data.studentName ??
                    data.TeamLeader
                ),

                normalize(
                    data.TeamName ??
                    data.teamName
                ),

                normalize(
                    data.Class ??
                    data.class
                ),

                normalize(
                    data.Section ??
                    data.section
                ),

                normalize(
                    data.MobileNumber ??
                    data.Mobile ??
                    data.mobile
                ),

                getRegistrationEmail(data),

                getEvents(data)
                    .join(" | "),

                getTeamSize(data),

                getMemberName(data, 2),

                getMemberName(data, 3),

                getMemberName(data, 4),

                getMemberName(data, 5),

                normalize(
                    data.Remarks ??
                    data.remarks
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
            .join("\n");


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
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        "APS_Robotics_Registrations_2026.csv";


    document.body.appendChild(
        link
    );


    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );


    showToast(
        "CSV exported successfully.",
        "success"
    );

}


/* =====================================================
   CSV ESCAPE
===================================================== */

function csvEscape(value) {

    const string =
        normalize(value);


    return `"${string.replace(
        /"/g,
        '""'
    )}"`;

}


/* =====================================================
   MODAL CLOSE
===================================================== */

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


if (detailsModal) {

    detailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                detailsModal
            ) {

                detailsModal.classList.add(
                    "hidden"
                );

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

                editModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


function closeAllModals() {

    if (detailsModal) {

        detailsModal.classList.add(
            "hidden"
        );

    }

    if (editModal) {

        editModal.classList.add(
            "hidden"
        );

    }

    currentRegistrationKey =
        null;

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
) {

    if (
        !toast ||
        !toastMessage
    ) return;


    toastMessage.textContent =
        message;


    const icon =
        toast.querySelector("i");


    if (icon) {

        icon.className =
            type === "error"

                ? "fa-solid fa-circle-exclamation"

                : "fa-solid fa-circle-check";

    }


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
            3200
        );

}


/* =====================================================
   DATE FIELD
===================================================== */

function getRegistrationDate(data) {

    return (
        data?.registrationDate ??
        data?.RegistrationDate ??
        data?.registeredAt ??
        data?.createdAt ??
        ""
    );

}


/* =====================================================
   TIMESTAMP
===================================================== */

function getTimestamp(data) {

    const value =
        getRegistrationDate(data);


    if (!value) return 0;


    if (
        typeof value === "number"
    ) {

        return value;

    }


    const date =
        new Date(value);


    const timestamp =
        date.getTime();


    return Number.isNaN(timestamp)
        ? 0
        : timestamp;

}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(value) {

    if (!value) return "-";


    if (
        typeof value === "number"
    ) {

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }

        return formatDateObject(
            date
        );

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return formatDateObject(
        date
    );

}


function formatDateObject(date) {

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =====================================================
   SET TEXT
===================================================== */

function setText(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* =====================================================
   NAV COUNT
===================================================== */

function updateNavigationCount() {

    if (
        navRegistrationCount
    ) {

        navRegistrationCount.textContent =
            Object.keys(
                registrations
            ).length;

    }

}


/* =====================================================
   TABLE STATUS
===================================================== */

function setTableStatus(
    message
) {

    if (tableStatus) {

        tableStatus.textContent =
            message;

    }

}


/* =====================================================
   HTML SECURITY
===================================================== */

function escapeHTML(value) {

    return normalize(value)
        .replace(
            /[&<>"']/g,
            character => {

                const entities = {

                    "&": "&amp;",

                    "<": "&lt;",

                    ">": "&gt;",

                    '"': "&quot;",

                    "'": "&#039;"

                };


                return entities[
                    character
                ];

            }
        );

}


function escapeAttr(value) {

    return escapeHTML(value);

}


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeAllModals();

            closeSidebar();

        }

    }
);


/* =====================================================
   INITIAL STATE
===================================================== */

filteredRegistrations = {};


/* =====================================================
   PREVENT BODY SCROLL WHEN MODAL OPEN
===================================================== */

const modalObserver =
    new MutationObserver(
        () => {

            const modalOpen =
                !detailsModal.classList.contains(
                    "hidden"
                ) ||
                !editModal.classList.contains(
                    "hidden"
                );


            document.body.style.overflow =
                modalOpen
                    ? "hidden"
                    : "";

        }
    );


if (detailsModal) {

    modalObserver.observe(
        detailsModal,
        {
            attributes: true,
            attributeFilter: [
                "class"
            ]
        }
    );

}


if (editModal) {

    modalObserver.observe(
        editModal,
        {
            attributes: true,
            attributeFilter: [
                "class"
            ]
        }
    );

}
