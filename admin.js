/* ============================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN PANEL
   ------------------------------------------------------------
   Firebase Authentication
   Firebase Realtime Database
   Firebase Firestore
   Firebase Trigger Email / mail collection
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
    onValue,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


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

const firestore = getFirestore(app);


/* ============================================================
   APPLICATION STATE
   ============================================================ */

let registrations = {};

let filteredRegistrations = {};

let currentRegistrationKey = null;

let databaseUnsubscribe = null;

let toastTimer = null;

let isLoading = false;


/* ============================================================
   DOM HELPER
   ============================================================ */

function $(id) {
    return document.getElementById(id);
}


function exists(element) {
    return !!element;
}


/* ============================================================
   DOM ELEMENTS
   ============================================================ */

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


/* ============================================================
   OPTIONAL DASHBOARD ELEMENTS
   ============================================================ */

const dashboardElements = {

    totalRegistrations:
        $("totalRegistrations"),

    totalTeams:
        $("totalTeams"),

    raceCount:
        $("raceCount"),

    warCount:
        $("warCount"),

    tugCount:
        $("tugCount"),

    soccerCount:
        $("soccerCount"),

    eventRaceCount:
        $("eventRaceCount"),

    eventWarCount:
        $("eventWarCount"),

    eventTugCount:
        $("eventTugCount"),

    eventSoccerCount:
        $("eventSoccerCount"),

    recentRegistrations:
        $("recentRegistrations"),

    pageTitle:
        $("pageTitle")

};


/* ============================================================
   EVENT DEFINITIONS
   ============================================================ */

const EVENTS = [

    {
        name: "Robo Race",
        key: "race",
        icon: "fa-solid fa-flag-checkered"
    },

    {
        name: "Robo War",
        key: "war",
        icon: "fa-solid fa-shield-halved"
    },

    {
        name: "Robo Tug of War",
        key: "tug",
        icon: "fa-solid fa-people-arrows"
    },

    {
        name: "Robo Soccer",
        key: "soccer",
        icon: "fa-solid fa-futbol"
    }

];


/* ============================================================
   AUTH STATE
   ============================================================ */

onAuthStateChanged(auth, user => {

    if (user) {

        showAdmin();

        if (adminEmail) {
            adminEmail.textContent =
                user.email || "Authenticated Admin";
        }

        startDatabaseListener();

    } else {

        showLogin();

        stopDatabaseListener();

    }

});


/* ============================================================
   SHOW LOGIN
   ============================================================ */

function showLogin() {

    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (adminApp) {
        adminApp.classList.add("hidden");
    }

}


/* ============================================================
   SHOW ADMIN
   ============================================================ */

function showAdmin() {

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (adminApp) {
        adminApp.classList.remove("hidden");
    }

}


/* ============================================================
   LOGIN
   ============================================================ */

if (loginForm) {

    loginForm.addEventListener("submit", async event => {

        event.preventDefault();

        if (!loginEmail || !loginPassword) {
            return;
        }

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;

        if (!email || !password) {

            setLoginError(
                "Please enter your email and password."
            );

            return;

        }

        clearLoginError();

        setLoginLoading(true);

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            if (loginForm) {
                loginForm.reset();
            }

        } catch (error) {

            console.error(
                "Firebase login error:",
                error
            );

            setLoginError(
                getAuthErrorMessage(error.code)
            );

        } finally {

            setLoginLoading(false);

        }

    });

}


/* ============================================================
   LOGIN ERROR
   ============================================================ */

function setLoginError(message) {

    if (!loginError) {
        return;
    }

    loginError.textContent = message;

    loginError.classList.remove("hidden");

}


function clearLoginError() {

    if (!loginError) {
        return;
    }

    loginError.textContent = "";

    loginError.classList.add("hidden");

}


/* ============================================================
   LOGIN BUTTON STATE
   ============================================================ */

function setLoginLoading(loading) {

    if (!loginBtn) {
        return;
    }

    loginBtn.disabled = loading;

    if (loading) {

        loginBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Signing In...
        `;

    } else {

        loginBtn.innerHTML = `
            <i class="fa-solid fa-right-to-bracket"></i>
            Login to Dashboard
        `;

    }

}


/* ============================================================
   AUTH ERROR MESSAGE
   ============================================================ */

function getAuthErrorMessage(code) {

    switch (code) {

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/invalid-login-credentials":
            return "Invalid email or password.";

        case "auth/user-not-found":
            return "Admin account was not found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-disabled":
            return "This account has been disabled.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        default:
            return "Login failed. Please check your credentials.";

    }

}


/* ============================================================
   PASSWORD TOGGLE
   ============================================================ */

if (togglePassword && loginPassword) {

    togglePassword.addEventListener("click", () => {

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

    });

}


/* ============================================================
   LOGOUT
   ============================================================ */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

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

    });

}


/* ============================================================
   START DATABASE LISTENER
   ============================================================ */

function startDatabaseListener() {

    if (databaseUnsubscribe) {
        return;
    }

    isLoading = true;

    setTableStatus("Connecting to database...");

    const registrationsRef =
        ref(database, "registrations");

    databaseUnsubscribe =
        onValue(
            registrationsRef,
            snapshot => {

                isLoading = false;

                if (snapshot.exists()) {

                    registrations =
                        snapshot.val() || {};

                } else {

                    registrations = {};

                }

                filteredRegistrations =
                    filterRegistrationsLocally();

                populateFilters();

                updateDashboard();

                renderRecentRegistrations();

                renderTable();

                updateEventStatistics();

                setTableStatus(
                    "Database synced"
                );

            },

            error => {

                isLoading = false;

                console.error(
                    "Realtime Database error:",
                    error
                );

                registrations = {};

                filteredRegistrations = {};

                renderTable();

                setTableStatus(
                    "Database connection error"
                );

                showToast(
                    "Unable to connect to the registrations database.",
                    "error"
                );

            }
        );

}


/* ============================================================
   STOP DATABASE LISTENER
   ============================================================ */

function stopDatabaseListener() {

    if (databaseUnsubscribe) {

        databaseUnsubscribe();

        databaseUnsubscribe = null;

    }

    registrations = {};

    filteredRegistrations = {};

}


/* ============================================================
   MANUAL DATABASE LOAD
   ============================================================ */

async function loadRegistrations() {

    if (!auth.currentUser) {

        showToast(
            "Please login first.",
            "error"
        );

        return;

    }

    /*
     * The realtime listener already keeps the dashboard
     * synchronized. This function simply displays a
     * refresh state.
     */

    setTableStatus(
        "Refreshing database..."
    );

    try {

        await new Promise(resolve => {
            setTimeout(resolve, 350);
        });

        setTableStatus(
            "Database synced"
        );

        showToast(
            "Dashboard refreshed.",
            "success"
        );

    } catch (error) {

        console.error(error);

        setTableStatus(
            "Refresh failed"
        );

    }

}


/* ============================================================
   SET TABLE STATUS
   ============================================================ */

function setTableStatus(message) {

    if (tableStatus) {
        tableStatus.textContent = message;
    }

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

    if (typeof value === "object") {

        return Object.values(value)
            .map(item => normalize(item))
            .filter(Boolean)
            .join(", ");

    }

    return String(value);

}


/* ============================================================
   GET FIRST AVAILABLE FIELD
   ============================================================ */

function getField(data, fields) {

    if (!data) {
        return "";
    }

    for (const field of fields) {

        const value =
            normalize(data[field]).trim();

        if (value) {
            return value;
        }

    }

    return "";

}


/* ============================================================
   GET REGISTRATION ID
   ============================================================ */

function getRegistrationId(key, data) {

    return (
        getField(data, [
            "registrationId",
            "RegistrationID",
            "RegistrationId",
            "registrationID",
            "id"
        ]) || key
    );

}


/* ============================================================
   GET STUDENT NAME
   ============================================================ */

function getStudentName(data) {

    return getField(data, [
        "StudentName",
        "studentName",
        "TeamLeader",
        "teamLeader",
        "Name",
        "name"
    ]);

}


/* ============================================================
   GET TEAM NAME
   ============================================================ */

function getTeamName(data) {

    return getField(data, [
        "TeamName",
        "teamName",
        "team"
    ]);

}


/* ============================================================
   GET CLASS
   ============================================================ */

function getClassName(data) {

    return getField(data, [
        "Class",
        "class",
        "className"
    ]);

}


/* ============================================================
   GET SECTION
   ============================================================ */

function getSection(data) {

    return getField(data, [
        "Section",
        "section"
    ]);

}


/* ============================================================
   GET MOBILE
   ============================================================ */

function getMobile(data) {

    return getField(data, [
        "MobileNumber",
        "mobileNumber",
        "Mobile",
        "mobile",
        "Phone",
        "phone"
    ]);

}


/* ============================================================
   GET EMAIL
   ============================================================ */

function getRegistrationEmail(data) {

    return getField(data, [
        "EmailAddress",
        "Email",
        "email",
        "emailAddress"
    ]);

}


/* ============================================================
   GET REMARKS
   ============================================================ */

function getRemarks(data) {

    return getField(data, [
        "Remarks",
        "remarks",
        "Remark",
        "remark"
    ]);

}


/* ============================================================
   GET REGISTRATION DATE
   ============================================================ */

function getRegistrationDate(data) {

    return getField(data, [
        "registrationDate",
        "RegistrationDate",
        "registeredAt",
        "createdAt",
        "timestamp"
    ]);

}


/* ============================================================
   GET EVENTS
   ============================================================ */

function getEvents(data) {

    if (!data) {
        return [];
    }

    let value =
        data.Events ??
        data.events ??
        data.SelectedEvents ??
        data.selectedEvents ??
        data.Event ??
        data.event;

    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {

        return value
            .map(normalizeEventName)
            .filter(Boolean);

    }

    if (typeof value === "object") {

        return Object.entries(value)
            .filter(([, selected]) => {

                return (
                    selected === true ||
                    selected === "true" ||
                    selected === 1
                );

            })
            .map(([event]) =>
                normalizeEventName(event)
            )
            .filter(Boolean);

    }

    return String(value)
        .split(/\s*(?:,|\||;|\n)\s*/)
        .map(normalizeEventName)
        .filter(Boolean);

}


/* ============================================================
   NORMALIZE EVENT NAME
   ============================================================ */

function normalizeEventName(value) {

    const text =
        normalize(value)
            .trim()
            .toLowerCase();

    if (!text) {
        return "";
    }

    if (
        text === "robo race" ||
        text === "race"
    ) {

        return "Robo Race";

    }

    if (
        text === "robo war" ||
        text === "war"
    ) {

        return "Robo War";

    }

    if (
        text === "robo tug of war" ||
        text === "tug of war" ||
        text === "tug"
    ) {

        return "Robo Tug of War";

    }

    if (
        text === "robo soccer" ||
        text === "soccer"
    ) {

        return "Robo Soccer";

    }

    return normalize(value).trim();

}


/* ============================================================
   GET TEAM SIZE
   ============================================================ */

function getTeamSize(data) {

    if (!data) {
        return 0;
    }

    const explicitSize =
        Number(
            getField(data, [
                "TeamSize",
                "teamSize",
                "team_size"
            ])
        );

    if (
        Number.isFinite(explicitSize) &&
        explicitSize > 0
    ) {

        return explicitSize;

    }

    /*
     * Team leader = 1
     */

    let count = getStudentName(data)
        ? 1
        : 0;

    /*
     * Supports Member2Name ... Member10Name
     */

    for (let i = 2; i <= 10; i++) {

        const memberName =
            getField(data, [
                `Member${i}Name`,
                `member${i}Name`,
                `TeamMember${i}`,
                `teamMember${i}`
            ]);

        if (memberName) {
            count++;
        }

    }

    return count;

}


/* ============================================================
   GET TEAM MEMBERS
   ============================================================ */

function getTeamMembers(data) {

    const members = [];

    for (let i = 2; i <= 10; i++) {

        const name =
            getField(data, [
                `Member${i}Name`,
                `member${i}Name`,
                `TeamMember${i}`,
                `teamMember${i}`
            ]);

        if (!name) {
            continue;
        }

        const className =
            getField(data, [
                `Member${i}Class`,
                `member${i}Class`
            ]);

        const section =
            getField(data, [
                `Member${i}Section`,
                `member${i}Section`
            ]);

        members.push({
            number: i,
            name,
            className,
            section
        });

    }

    return members;

}


/* ============================================================
   UPDATE DASHBOARD
   ============================================================ */

function updateDashboard() {

    const list =
        Object.values(registrations);

    const total =
        list.length;

    setText(
        dashboardElements.totalRegistrations,
        total
    );

    setText(
        dashboardElements.totalTeams,
        total
    );

    const counts =
        getEventCounts();

    setText(
        dashboardElements.raceCount,
        counts.race
    );

    setText(
        dashboardElements.warCount,
        counts.war
    );

    setText(
        dashboardElements.tugCount,
        counts.tug
    );

    setText(
        dashboardElements.soccerCount,
        counts.soccer
    );

    setText(
        dashboardElements.eventRaceCount,
        counts.race
    );

    setText(
        dashboardElements.eventWarCount,
        counts.war
    );

    setText(
        dashboardElements.eventTugCount,
        counts.tug
    );

    setText(
        dashboardElements.eventSoccerCount,
        counts.soccer
    );

}


/* ============================================================
   EVENT COUNTS
   ============================================================ */

function getEventCounts() {

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
   UPDATE EVENT STATISTICS
   ============================================================ */

function updateEventStatistics() {

    const counts =
        getEventCounts();

    setText(
        dashboardElements.eventRaceCount,
        counts.race
    );

    setText(
        dashboardElements.eventWarCount,
        counts.war
    );

    setText(
        dashboardElements.eventTugCount,
        counts.tug
    );

    setText(
        dashboardElements.eventSoccerCount,
        counts.soccer
    );

}


/* ============================================================
   SET TEXT
   ============================================================ */

function setText(element, value) {

    if (element) {
        element.textContent =
            normalize(value);
    }

}


/* ============================================================
   RECENT REGISTRATIONS
   ============================================================ */

function renderRecentRegistrations() {

    const container =
        dashboardElements.recentRegistrations;

    if (!container) {
        return;
    }

    const entries =
        Object.entries(registrations)
            .sort((a, b) => {

                return (
                    getTimestamp(b[1]) -
                    getTimestamp(a[1])
                );

            })
            .slice(0, 6);

    if (!entries.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <span>No registrations found.</span>
            </div>
        `;

        return;

    }

    container.innerHTML =
        entries.map(([key, data]) => {

            const id =
                getRegistrationId(
                    key,
                    data
                );

            const name =
                getStudentName(data) ||
                "Unknown Student";

            const team =
                getTeamName(data) ||
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

                        <small>
                            ${escapeHTML(id)}
                        </small>

                    </div>

                    <button
                        type="button"
                        class="action-btn view"
                        title="View Registration"
                        data-view="${escapeAttr(key)}">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </div>
            `;

        })
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
   POPULATE FILTERS
   ============================================================ */

function populateFilters() {

    if (!classFilter && !sectionFilter) {
        return;
    }

    const classes =
        new Set();

    const sections =
        new Set();

    Object.values(registrations)
        .forEach(data => {

            const className =
                getClassName(data);

            const section =
                getSection(data);

            if (className) {
                classes.add(className);
            }

            if (section) {
                sections.add(section);
            }

        });

    const currentClass =
        classFilter
            ? classFilter.value
            : "all";

    const currentSection =
        sectionFilter
            ? sectionFilter.value
            : "all";

    if (classFilter) {

        classFilter.innerHTML =
            `<option value="all">All Classes</option>`;

        [...classes]
            .sort((a, b) =>
                a.localeCompare(b, undefined, {
                    numeric: true
                })
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

        if (
            [...classes].includes(
                currentClass
            )
        ) {

            classFilter.value =
                currentClass;

        }

    }

    if (sectionFilter) {

        sectionFilter.innerHTML =
            `<option value="all">All Sections</option>`;

        [...sections]
            .sort()
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
            [...sections].includes(
                currentSection
            )
        ) {

            sectionFilter.value =
                currentSection;

        }

    }

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

    Object.entries(registrations)
        .forEach(([key, data]) => {

            const events =
                getEvents(data);

            const searchable = [

                getRegistrationId(
                    key,
                    data
                ),

                getStudentName(data),

                getTeamName(data),

                getClassName(data),

                getSection(data),

                getMobile(data),

                getRegistrationEmail(data),

                getRemarks(data),

                events.join(" ")

            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !search ||
                searchable.includes(search);

            const matchesEvent =
                selectedEvent === "all" ||
                events.includes(
                    selectedEvent
                );

            const matchesClass =
                selectedClass === "all" ||
                getClassName(data) ===
                    selectedClass;

            const matchesSection =
                selectedSection === "all" ||
                getSection(data) ===
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

        });

    renderTable();

}


/* ============================================================
   LOCAL FILTER
   ============================================================ */

function filterRegistrationsLocally() {

    /*
     * Preserve currently selected filters after
     * realtime database synchronization.
     */

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

    const result = {};

    Object.entries(registrations)
        .forEach(([key, data]) => {

            const events =
                getEvents(data);

            const searchable = [

                getRegistrationId(
                    key,
                    data
                ),

                getStudentName(data),

                getTeamName(data),

                getClassName(data),

                getSection(data),

                getMobile(data),

                getRegistrationEmail(data),

                events.join(" ")

            ]
                .join(" ")
                .toLowerCase();

            if (
                search &&
                !searchable.includes(search)
            ) {
                return;
            }

            if (
                selectedEvent !== "all" &&
                !events.includes(selectedEvent)
            ) {
                return;
            }

            if (
                selectedClass !== "all" &&
                getClassName(data) !== selectedClass
            ) {
                return;
            }

            if (
                selectedSection !== "all" &&
                getSection(data) !== selectedSection
            ) {
                return;
            }

            result[key] = data;

        });

    return result;

}


/* ============================================================
   FILTER EVENT LISTENERS
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

            showToast(
                "Filters cleared.",
                "success"
            );

        }
    );

}


/* ============================================================
   RENDER REGISTRATION TABLE
   ============================================================ */

function renderTable() {

    if (!tableBody) {
        return;
    }

    const entries =
        Object.entries(
            filteredRegistrations
        );

    entries.sort((a, b) => {

        return (
            getTimestamp(b[1]) -
            getTimestamp(a[1])
        );

    });

    if (resultCount) {

        resultCount.textContent =
            `${entries.length} registration${
                entries.length === 1
                    ? ""
                    : "s"
            }`;

    }

    tableBody.innerHTML = "";

    if (!entries.length) {

        if (tableEmpty) {
            tableEmpty.classList.remove(
                "hidden"
            );
        }

        return;

    }

    if (tableEmpty) {
        tableEmpty.classList.add(
            "hidden"
        );
    }

    entries.forEach(
        ([key, data]) => {

            tableBody.appendChild(
                createRegistrationRow(
                    key,
                    data
                )
            );

        }
    );

    attachTableActions();

}


/* ============================================================
   CREATE REGISTRATION ROW
   ============================================================ */

function createRegistrationRow(key, data) {

    const row =
        document.createElement("tr");

    const id =
        getRegistrationId(
            key,
            data
        );

    const studentName =
        getStudentName(data) ||
        "-";

    const teamName =
        getTeamName(data) ||
        "Unnamed Team";

    const className =
        getClassName(data) ||
        "-";

    const section =
        getSection(data) ||
        "-";

    const mobile =
        getMobile(data) ||
        "-";

    const email =
        getRegistrationEmail(data);

    const events =
        getEvents(data);

    const teamSize =
        getTeamSize(data);

    const date =
        formatDate(
            getRegistrationDate(data)
        );

    const eventsHTML =
        events.length

            ? events.map(event => {

                return `
                    <span class="event-tag">
                        ${escapeHTML(event)}
                    </span>
                `;

            }).join("")

            : `
                <span class="muted-text">
                    No event
                </span>
            `;

    const emailButton =
        email

            ? `
                <button
                    type="button"
                    class="action-btn email"
                    title="Send Confirmation Email"
                    data-email="${escapeAttr(key)}">

                    <i class="fa-solid fa-envelope"></i>

                </button>
            `

            : "";

    row.innerHTML = `

        <td>

            <span class="registration-id">
                ${escapeHTML(id)}
            </span>

        </td>

        <td>

            <strong class="team-name">
                ${escapeHTML(studentName)}
            </strong>

        </td>

        <td>
            ${escapeHTML(teamName)}
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

                ${eventsHTML}

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
                    data-view="${escapeAttr(key)}">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button
                    type="button"
                    class="action-btn edit"
                    title="Edit Registration"
                    data-edit="${escapeAttr(key)}">

                    <i class="fa-solid fa-pen"></i>

                </button>

                ${emailButton}

                <button
                    type="button"
                    class="action-btn delete"
                    title="Delete Registration"
                    data-delete="${escapeAttr(key)}">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </td>

    `;

    return row;

}


/* ============================================================
   ATTACH TABLE ACTIONS
   ============================================================ */

function attachTableActions() {

    if (!tableBody) {
        return;
    }

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
        .querySelectorAll("[data-email]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    sendConfirmationEmail(
                        button.dataset.email
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


/* ============================================================
   OPEN DETAILS MODAL
   ============================================================ */

function openDetails(key) {

    const data =
        registrations[key];

    if (!data || !detailsModal) {
        return;
    }

    currentRegistrationKey =
        key;

    const id =
        getRegistrationId(
            key,
            data
        );

    const studentName =
        getStudentName(data) ||
        "-";

    const teamName =
        getTeamName(data) ||
        "-";

    const className =
        getClassName(data) ||
        "-";

    const section =
        getSection(data) ||
        "-";

    const mobile =
        getMobile(data) ||
        "-";

    const email =
        getRegistrationEmail(data) ||
        "";

    const remarks =
        getRemarks(data) ||
        "No remarks.";

    const events =
        getEvents(data);

    const members =
        getTeamMembers(data);

    const teamSize =
        getTeamSize(data);

    const date =
        formatDate(
            getRegistrationDate(data)
        );

    const membersHTML =
        members.length

            ? members.map(member => {

                return `
                    <div class="member-detail">

                        <div class="member-heading">

                            <strong>
                                Team Member ${member.number}
                            </strong>

                        </div>

                        <div class="detail-grid">

                            <div class="detail-item">

                                <label>
                                    Name
                                </label>

                                <strong>
                                    ${escapeHTML(
                                        member.name
                                    )}
                                </strong>

                            </div>

                            <div class="detail-item">

                                <label>
                                    Class
                                </label>

                                <strong>
                                    ${escapeHTML(
                                        member.className || "-"
                                    )}
                                </strong>

                            </div>

                            <div class="detail-item">

                                <label>
                                    Section
                                </label>

                                <strong>
                                    ${escapeHTML(
                                        member.section || "-"
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>
                `;

            }).join("")

            : `
                <div class="empty-state">
                    <i class="fa-solid fa-user-group"></i>
                    <span>
                        No additional team members.
                    </span>
                </div>
            `;

    const eventsHTML =
        events.length

            ? events.map(event => {

                return `
                    <span class="event-tag">
                        ${escapeHTML(event)}
                    </span>
                `;

            }).join("")

            : `
                <span class="muted-text">
                    No event selected.
                </span>
            `;

    detailsContent.innerHTML = `

        <div class="detail-section">

            <h3>
                <i class="fa-solid fa-id-card"></i>
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
                        ${escapeHTML(date)}
                    </strong>

                </div>

            </div>

        </div>


        <div class="detail-section">

            <h3>
                <i class="fa-solid fa-users"></i>
                Team Information
            </h3>

            <div class="detail-grid">

                <div class="detail-item">

                    <label>
                        Team Leader
                    </label>

                    <strong>
                        ${escapeHTML(studentName)}
                    </strong>

                </div>

                <div class="detail-item">

                    <label>
                        Team Name
                    </label>

                    <strong>
                        ${escapeHTML(teamName)}
                    </strong>

                </div>

                <div class="detail-item">

                    <label>
                        Class
                    </label>

                    <strong>
                        ${escapeHTML(className)}
                    </strong>

                </div>

                <div class="detail-item">

                    <label>
                        Section
                    </label>

                    <strong>
                        ${escapeHTML(section)}
                    </strong>

                </div>

                <div class="detail-item">

                    <label>
                        Mobile
                    </label>

                    <strong>
                        ${escapeHTML(mobile)}
                    </strong>

                </div>

                <div class="detail-item">

                    <label>
                        Email
                    </label>

                    <strong>
                        ${escapeHTML(email || "-")}
                    </strong>

                </div>

                <div class="detail-item">

                    <label>
                        Team Size
                    </label>

                    <strong>
                        ${teamSize} Member(s)
                    </strong>

                </div>

            </div>

        </div>


        <div class="detail-section">

            <h3>
                <i class="fa-solid fa-trophy"></i>
                Selected Events
            </h3>

            <div class="event-tags">

                ${eventsHTML}

            </div>

        </div>


        <div class="detail-section">

            <h3>
                <i class="fa-solid fa-user-group"></i>
                Team Members
            </h3>

            ${membersHTML}

        </div>


        <div class="detail-section">

            <h3>
                <i class="fa-solid fa-comment"></i>
                Remarks
            </h3>

            <div class="detail-item">

                <strong>
                    ${escapeHTML(remarks)}
                </strong>

            </div>

        </div>


        <div class="detail-section email-section">

            <h3>
                <i class="fa-solid fa-envelope"></i>
                Confirmation Email
            </h3>

            <div class="email-admin-box">

                ${
                    email

                        ? `
                            <p>
                                <i class="fa-solid fa-envelope"></i>
                                ${escapeHTML(email)}
                            </p>

                            <button
                                type="button"
                                class="send-email-detail-btn"
                                id="sendDetailEmailBtn">

                                <i class="fa-solid fa-paper-plane"></i>

                                Send Confirmation Email

                            </button>
                        `

                        : `
                            <p class="email-warning">

                                <i class="fa-solid fa-triangle-exclamation"></i>

                                No email address is available.

                            </p>
                        `
                }

            </div>

        </div>

    `;

    detailsModal.classList.remove(
        "hidden"
    );

    const sendButton =
        $("sendDetailEmailBtn");

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            () => {

                sendConfirmationEmail(
                    key
                );

            }
        );

    }

}


/* ============================================================
   OPEN EDIT MODAL
   ============================================================ */

function openEdit(key) {

    const data =
        registrations[key];

    if (!data || !editModal) {
        return;
    }

    if (editKey) {
        editKey.value = key;
    }

    if (editStudentName) {
        editStudentName.value =
            getStudentName(data);
    }

    if (editTeamName) {
        editTeamName.value =
            getTeamName(data);
    }

    if (editClass) {
        editClass.value =
            getClassName(data);
    }

    if (editSection) {
        editSection.value =
            getSection(data);
    }

    if (editMobile) {
        editMobile.value =
            getMobile(data);
    }

    if (editEmail) {
        editEmail.value =
            getRegistrationEmail(data);
    }

    if (editRemarks) {
        editRemarks.value =
            getRemarks(data);
    }

    editModal.classList.remove(
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
                editKey
                    ? editKey.value
                    : "";

            if (!key) {
                return;
            }

            const saveButton =
                $("saveEditBtn");

            if (saveButton) {

                saveButton.disabled = true;

                saveButton.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Saving...
                `;

            }

            const updates = {

                StudentName:
                    editStudentName
                        ? editStudentName.value.trim()
                        : "",

                TeamName:
                    editTeamName
                        ? editTeamName.value.trim()
                        : "",

                Class:
                    editClass
                        ? editClass.value.trim()
                        : "",

                Section:
                    editSection
                        ? editSection.value.trim()
                        : "",

                MobileNumber:
                    editMobile
                        ? editMobile.value.trim()
                        : "",

                EmailAddress:
                    editEmail
                        ? editEmail.value.trim()
                        : "",

                Remarks:
                    editRemarks
                        ? editRemarks.value.trim()
                        : ""

            };

            try {

                await update(

                    ref(
                        database,
                        `registrations/${key}`
                    ),

                    updates

                );

                if (editModal) {

                    editModal.classList.add(
                        "hidden"
                    );

                }

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

    const studentName =
        getStudentName(data) ||
        "this registration";

    const registrationId =
        getRegistrationId(
            key,
            data
        );

    const confirmed =
        confirm(
            `Delete registration?\n\n` +
            `Student: ${studentName}\n` +
            `Registration ID: ${registrationId}\n\n` +
            `This action cannot be undone.`
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

        if (
            currentRegistrationKey === key
        ) {

            closeModal(
                detailsModal
            );

            currentRegistrationKey =
                null;

        }

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


/* ============================================================
   DELETE FROM DETAILS MODAL
   ============================================================ */

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


/* ============================================================
   SEND CONFIRMATION EMAIL
   ============================================================ */

async function sendConfirmationEmail(key) {

    const data =
        registrations[key];

    if (!data) {

        showToast(
            "Registration not found.",
            "error"
        );

        return;

    }

    const email =
        getRegistrationEmail(data);

    if (!email) {

        showToast(
            "No email address found.",
            "error"
        );

        return;

    }

    const registrationId =
        getRegistrationId(
            key,
            data
        );

    const studentName =
        getStudentName(data) ||
        "Participant";

    const teamName =
        getTeamName(data) ||
        "Not provided";

    const className =
        getClassName(data) ||
        "-";

    const section =
        getSection(data) ||
        "-";

    const mobile =
        getMobile(data) ||
        "-";

    const events =
        getEvents(data);

    const teamSize =
        getTeamSize(data);

    const registrationDate =
        formatDate(
            getRegistrationDate(data)
        );

    const members =
        getTeamMembers(data);

    const confirmed =
        confirm(
            `Send confirmation email?\n\n` +
            `To: ${email}\n` +
            `Registration ID: ${registrationId}`
        );

    if (!confirmed) {
        return;
    }

    try {

        showToast(
            "Preparing confirmation email...",
            "success"
        );

        const subject =
            `APS Robotics Championship 2026 – Registration Confirmed (${registrationId})`;

        const text =
`Dear ${studentName},

Your registration for APS Robotics Championship 2026 has been successfully received.

Registration ID: ${registrationId}

Team Leader: ${studentName}
Team Name: ${teamName}
Class: ${className}
Section: ${section}
Mobile: ${mobile}
Email: ${email}
Team Size: ${teamSize}

Selected Events:
${events.length
    ? events.join(", ")
    : "No event selected"}

Registration Date:
${registrationDate}

Please keep your Registration ID for future communication.

Regards,
APS Tinkering Lab
Army Public School
Lal Bahadur Shastri Marg
Lucknow, Uttar Pradesh`;


        const eventsHTML =
            events.length

                ? events.map(event => {

                    return `
                        <span style="
                            display:inline-block;
                            background:#e8fbff;
                            color:#087f8c;
                            border:1px solid #b8edf3;
                            border-radius:20px;
                            padding:7px 13px;
                            margin:4px;
                            font-size:13px;
                            font-weight:600;
                        ">
                            ${escapeHTML(event)}
                        </span>
                    `;

                }).join("")

                : `
                    <span>
                        No event selected
                    </span>
                `;


        const membersHTML =
            members.length

                ? `
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                            border-collapse:collapse;
                            margin-top:12px;
                        ">

                        <thead>

                            <tr>

                                <th style="
                                    text-align:left;
                                    padding:9px;
                                    background:#f1f5f9;
                                    border:1px solid #e2e8f0;
                                ">
                                    Member
                                </th>

                                <th style="
                                    text-align:left;
                                    padding:9px;
                                    background:#f1f5f9;
                                    border:1px solid #e2e8f0;
                                ">
                                    Name
                                </th>

                                <th style="
                                    text-align:left;
                                    padding:9px;
                                    background:#f1f5f9;
                                    border:1px solid #e2e8f0;
                                ">
                                    Class
                                </th>

                                <th style="
                                    text-align:left;
                                    padding:9px;
                                    background:#f1f5f9;
                                    border:1px solid #e2e8f0;
                                ">
                                    Section
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            ${members.map(member => {

                                return `
                                    <tr>

                                        <td style="
                                            padding:9px;
                                            border:1px solid #e2e8f0;
                                        ">
                                            Member ${member.number}
                                        </td>

                                        <td style="
                                            padding:9px;
                                            border:1px solid #e2e8f0;
                                        ">
                                            ${escapeHTML(
                                                member.name
                                            )}
                                        </td>

                                        <td style="
                                            padding:9px;
                                            border:1px solid #e2e8f0;
                                        ">
                                            ${escapeHTML(
                                                member.className || "-"
                                            )}
                                        </td>

                                        <td style="
                                            padding:9px;
                                            border:1px solid #e2e8f0;
                                        ">
                                            ${escapeHTML(
                                                member.section || "-"
                                            )}
                                        </td>

                                    </tr>
                                `;

                            }).join("")}

                        </tbody>

                    </table>
                `

                : `
                    <p>
                        No additional team members were registered.
                    </p>
                `;


        const html =
`
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width,initial-scale=1.0">

<title>
APS Robotics Championship 2026
</title>

</head>

<body style="
    margin:0;
    padding:0;
    background:#eef4f8;
    font-family:Arial,Helvetica,sans-serif;
    color:#172033;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="padding:30px 10px;">

<tr>

<td align="center">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
    max-width:680px;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
">

<tr>

<td style="
    background:#061a2d;
    padding:28px;
    text-align:center;
">

<img
src="https://i.ibb.co/spL8t7cv/Army-Welfare-Education-Society-logo-1.png"
alt="APS Logo"
style="
    width:80px;
    height:auto;
    margin-bottom:12px;
">

<h1 style="
    margin:0;
    color:#00d9ff;
    font-size:24px;
">

APS ROBOTICS

</h1>

<p style="
    margin:6px 0 0;
    color:#ffffff;
    font-size:14px;
">

CHAMPIONSHIP 2026

</p>

</td>

</tr>


<tr>

<td style="
    padding:32px 30px 15px;
">

<h2 style="
    margin:0 0 10px;
    color:#087f8c;
">

Registration Confirmed! ✓

</h2>

<p style="
    line-height:1.7;
">

Dear
<strong>
${escapeHTML(studentName)}
</strong>,

</p>

<p style="
    line-height:1.7;
">

Thank you for registering for
<strong>
APS Robotics Championship 2026
</strong>.

Your registration has been successfully received by
<strong>
APS Tinkering Lab
</strong>.

</p>

</td>

</tr>


<tr>

<td style="
    padding:0 30px 20px;
">

<table width="100%" style="
    background:#f0fbfd;
    border:1px solid #c8eef3;
    border-radius:12px;
">

<tr>

<td style="
    padding:18px;
    text-align:center;
">

<p style="
    margin:0 0 5px;
    color:#64748b;
    font-size:12px;
    text-transform:uppercase;
">

Registration ID

</p>

<strong style="
    font-size:22px;
    color:#087f8c;
">

${escapeHTML(registrationId)}

</strong>

</td>

</tr>

</table>

</td>

</tr>


<tr>

<td style="
    padding:0 30px 25px;
">

<h3>
Registration Details
</h3>

<table width="100%" style="
    border-collapse:collapse;
">

<tr>

<td style="
    padding:9px 0;
    color:#64748b;
    width:40%;
">
Team Leader
</td>

<td style="
    padding:9px 0;
    font-weight:bold;
">
${escapeHTML(studentName)}
</td>

</tr>


<tr>

<td style="
    padding:9px 0;
    color:#64748b;
">
Team Name
</td>

<td style="
    padding:9px 0;
    font-weight:bold;
">
${escapeHTML(teamName)}
</td>

</tr>


<tr>

<td style="
    padding:9px 0;
    color:#64748b;
">
Class
</td>

<td style="
    padding:9px 0;
">
${escapeHTML(className)}
</td>

</tr>


<tr>

<td style="
    padding:9px 0;
    color:#64748b;
">
Section
</td>

<td style="
    padding:9px 0;
">
${escapeHTML(section)}
</td>

</tr>


<tr>

<td style="
    padding:9px 0;
    color:#64748b;
">
Mobile
</td>

<td style="
    padding:9px 0;
">
${escapeHTML(mobile)}
</td>

</tr>


<tr>

<td style="
    padding:9px 0;
    color:#64748b;
">
Team Size
</td>

<td style="
    padding:9px 0;
">
${teamSize} Member(s)
</td>

</tr>


<tr>

<td style="
    padding:9px 0;
    color:#64748b;
">
Registration Date
</td>

<td style="
    padding:9px 0;
">
${escapeHTML(registrationDate)}
</td>

</tr>

</table>

</td>

</tr>


<tr>

<td style="
    padding:0 30px 25px;
">

<h3>
Selected Events
</h3>

<div>

${eventsHTML}

</div>

</td>

</tr>


<tr>

<td style="
    padding:0 30px 25px;
">

<h3>
Team Members
</h3>

${membersHTML}

</td>

</tr>


<tr>

<td style="
    padding:0 30px 25px;
">

<table width="100%" style="
    background:#fff8e8;
    border:1px solid #f5d78e;
    border-radius:12px;
">

<tr>

<td style="
    padding:16px;
    line-height:1.6;
">

<strong>
Important:
</strong>

Please save your Registration ID
<strong>
${escapeHTML(registrationId)}
</strong>
for future communication regarding the championship.

</td>

</tr>

</table>

</td>

</tr>


<tr>

<td style="
    background:#061a2d;
    padding:25px;
    text-align:center;
    color:#ffffff;
">

<strong>
APS Tinkering Lab
</strong>

<br>

Army Public School

<br>

Lal Bahadur Shastri Marg

<br>

Lucknow, Uttar Pradesh

<br><br>

<span style="
    color:#8ca5b8;
    font-size:12px;
">

APS Robotics Championship 2026

</span>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;


        await addDoc(
            collection(
                firestore,
                "mail"
            ),
            {

                to: email,

                message: {

                    subject,

                    text,

                    html

                },

                registrationId,

                emailType:
                    "registration_confirmation",

                createdBy:
                    auth.currentUser
                        ? auth.currentUser.uid
                        : "admin",

                createdAt:
                    serverTimestamp()

            }
        );


        if (detailsModal) {

            detailsModal.classList.add(
                "hidden"
            );

        }

        showToast(
            `Confirmation email queued for ${email}.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Confirmation email error:",
            error
        );

        showToast(
            "Could not queue the confirmation email.",
            "error"
        );

    }

}


/* ============================================================
   NAVIGATION
   ============================================================ */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                if (page) {
                    showPage(page);
                }

                if (sidebar) {
                    sidebar.classList.remove(
                        "open"
                    );
                }

            }
        );

    });


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
   SHOW PAGE
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
        $(pageName + "Page");

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

    if (dashboardElements.pageTitle) {

        dashboardElements.pageTitle.textContent =
            titles[pageName] ||
            "Dashboard";

    }

    if (pageName === "registrations") {

        renderTable();

    }

    if (pageName === "events") {

        updateEventStatistics();

    }

}


/* ============================================================
   SIDEBAR
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
   SIDEBAR OVERLAY SUPPORT
   ============================================================ */

document
    .querySelectorAll(".sidebar-overlay")
    .forEach(overlay => {

        overlay.addEventListener(
            "click",
            () => {

                if (sidebar) {

                    sidebar.classList.remove(
                        "open"
                    );

                }

            }
        );

    });


/* ============================================================
   REFRESH BUTTONS
   ============================================================ */

const dashboardRefresh =
    $("dashboardRefresh");

if (dashboardRefresh) {

    dashboardRefresh.addEventListener(
        "click",
        loadRegistrations
    );

}


const refreshRegistrations =
    $("refreshRegistrations");

if (refreshRegistrations) {

    refreshRegistrations.addEventListener(
        "click",
        loadRegistrations
    );

}


/* ============================================================
   EXPORT CSV BUTTONS
   ============================================================ */

const exportCsv =
    $("exportCsv");

if (exportCsv) {

    exportCsv.addEventListener(
        "click",
        () => {

            exportCSV(
                filteredRegistrations,
                "APS_Robotics_Filtered_Registrations_2026.csv"
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
                registrations,
                "APS_Robotics_All_Registrations_2026.csv"
            );

        }
    );

}


/* ============================================================
   EXPORT CSV
   ============================================================ */

function exportCSV(
    dataObject,
    filename
) {

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
        "Member 6",
        "Remarks",
        "Registration Date"

    ];

    const rows = [
        headers
    ];

    entries.forEach(
        ([key, data]) => {

            const members =
                getTeamMembers(data);

            const memberNames = {

                2: "",
                3: "",
                4: "",
                5: "",
                6: ""

            };

            members.forEach(member => {

                if (
                    member.number >= 2 &&
                    member.number <= 6
                ) {

                    memberNames[
                        member.number
                    ] = member.name;

                }

            });

            rows.push([

                getRegistrationId(
                    key,
                    data
                ),

                getStudentName(data),

                getTeamName(data),

                getClassName(data),

                getSection(data),

                getMobile(data),

                getRegistrationEmail(data),

                getEvents(data)
                    .join(" | "),

                getTeamSize(data),

                memberNames[2],

                memberNames[3],

                memberNames[4],

                memberNames[5],

                memberNames[6],

                getRemarks(data),

                getRegistrationDate(data)

            ]);

        }
    );

    const csv =
        rows
            .map(row =>
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
        filename ||
        "APS_Robotics_Registrations_2026.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(
        () => URL.revokeObjectURL(url),
        500
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
   MODAL CLOSE BUTTONS
   ============================================================ */

document
    .querySelectorAll("[data-close-modal]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const modalId =
                    button.dataset.closeModal;

                if (modalId) {

                    closeModal(
                        $(modalId)
                    );

                } else {

                    closeModal(
                        detailsModal
                    );

                    closeModal(
                        editModal
                    );

                }

            }
        );

    });


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

                closeModal(
                    detailsModal
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

                closeModal(
                    editModal
                );

            }

        }
    );

}


/* ============================================================
   CLOSE MODAL
   ============================================================ */

function closeModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.add(
        "hidden"
    );

}


/* ============================================================
   ESCAPE KEY
   ============================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }

        closeModal(
            detailsModal
        );

        closeModal(
            editModal
        );

    }
);


/* ============================================================
   TOAST
   ============================================================ */

function showToast(
    message,
    type = "success"
) {

    if (!toast || !toastMessage) {
        return;
    }

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

    toast.classList.remove(
        "success",
        "error"
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
   DATE / TIMESTAMP
   ============================================================ */

function getTimestamp(data) {

    if (!data) {
        return 0;
    }

    const value =
        getRegistrationDate(data);

    if (!value) {
        return 0;
    }

    if (
        typeof value === "number"
    ) {

        return value;

    }

    if (
        typeof value === "object" &&
        value.seconds
    ) {

        return (
            Number(value.seconds) * 1000
        );

    }

    const timestamp =
        new Date(value).getTime();

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
        typeof value === "object" &&
        value.seconds
    ) {

        date =
            new Date(
                Number(value.seconds) * 1000
            );

    } else if (
        typeof value === "number"
    ) {

        date =
            new Date(value);

    } else {

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
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ============================================================
   HTML SECURITY
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

                return entities[
                    character
                ];

            }
        );

}


function escapeAttr(value) {

    return escapeHTML(value);

}


/* ============================================================
   INITIAL UI
   ============================================================ */

filteredRegistrations = {};

updateDashboard();

updateEventStatistics();

showPage("dashboard");


/* ============================================================
   GLOBAL ERROR HANDLING
   ============================================================ */

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled Promise:",
            event.reason
        );

    }
);


/* ============================================================
   ADMIN JS READY
   ============================================================ */

console.log(
    "%cAPS Robotics Championship 2026 Admin Panel",
    "font-size:16px;font-weight:bold;"
);

console.log(
    "%cFirebase Admin Dashboard initialized.",
    "font-size:13px;"
);
