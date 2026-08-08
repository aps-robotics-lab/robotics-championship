/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN PANEL
   FIREBASE AUTH + REALTIME DATABASE

   COMPLETE REPLACEMENT

   Features:
   - Firebase Authentication
   - Realtime Database
   - Database connection testing
   - Dashboard
   - Registrations
   - Search
   - Filters
   - Details
   - Edit
   - Delete
   - CSV Export
   - Responsive navigation
===================================================== */


/* =====================================================
   FIREBASE
===================================================== */

import {
    initializeApp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    getDatabase,
    ref,
    get,
    update,
    remove
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


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
   INITIALIZE
===================================================== */

let firebaseApp;

let auth;

let database;


try {

    firebaseApp =
        initializeApp(
            firebaseConfig
        );

    auth =
        getAuth(
            firebaseApp
        );

    database =
        getDatabase(
            firebaseApp
        );

}
catch (error) {

    console.error(
        "Firebase initialization failed:",
        error
    );

    showFatalError(
        "Firebase initialization failed. Check your Firebase configuration."
    );

}


/* =====================================================
   GLOBAL STATE
===================================================== */

let registrations = {};

let filteredRegistrations = {};

let currentRegistrationKey = null;

let toastTimer = null;

let loadingRegistrations = false;


/* =====================================================
   DOM
===================================================== */

const $ = id =>
    document.getElementById(id);


const loginScreen =
    $("loginScreen");


const adminApp =
    $("adminApp");


const loginForm =
    $("loginForm");


const loginEmail =
    $("loginEmail");


const loginPassword =
    $("loginPassword");


const loginBtn =
    $("loginBtn");


const loginError =
    $("loginError");


const togglePassword =
    $("togglePassword");


const adminEmail =
    $("adminEmail");


const logoutBtn =
    $("logoutBtn");


const sidebar =
    $("sidebar");


const sidebarToggle =
    $("sidebarToggle");


const tableBody =
    $("registrationTableBody");


const tableEmpty =
    $("tableEmpty");


const resultCount =
    $("resultCount");


const tableStatus =
    $("tableStatus");


const searchInput =
    $("searchInput");


const eventFilter =
    $("eventFilter");


const classFilter =
    $("classFilter");


const sectionFilter =
    $("sectionFilter");


const clearFilters =
    $("clearFilters");


const detailsModal =
    $("detailsModal");


const editModal =
    $("editModal");


const detailsContent =
    $("detailsContent");


const modalDeleteBtn =
    $("modalDeleteBtn");


const editForm =
    $("editForm");


const editKey =
    $("editKey");


const editStudentName =
    $("editStudentName");


const editTeamName =
    $("editTeamName");


const editClass =
    $("editClass");


const editSection =
    $("editSection");


const editMobile =
    $("editMobile");


const editEmail =
    $("editEmail");


const editRemarks =
    $("editRemarks");


const toast =
    $("toast");


const toastMessage =
    $("toastMessage");


const databaseError =
    $("databaseError");


const databaseErrorText =
    $("databaseErrorText");


const databaseErrorCode =
    $("databaseErrorCode");


const databaseRetry =
    $("databaseRetry");


const connectionText =
    $("connectionText");


const topConnection =
    $("topConnection");


/* =====================================================
   AUTH STATE
===================================================== */

if (auth) {

    onAuthStateChanged(
        auth,
        async user => {

            if (user) {

                loginScreen
                    .classList
                    .add("hidden");


                adminApp
                    .classList
                    .remove("hidden");


                adminEmail.textContent =
                    user.email ||
                    "Authenticated Admin";


                setConnection(
                    "authenticated"
                );


                await loadRegistrations();

            }
            else {

                loginScreen
                    .classList
                    .remove("hidden");


                adminApp
                    .classList
                    .add("hidden");


                setConnection(
                    "offline"
                );

            }

        }
    );

}


/* =====================================================
   LOGIN
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            loginError.textContent = "";


            const email =
                loginEmail
                    .value
                    .trim();


            const password =
                loginPassword.value;


            if (!email || !password) {

                loginError.textContent =
                    "Please enter your email and password.";

                return;

            }


            loginBtn.disabled = true;


            loginBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Signing In...</span>
            `;


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            }
            catch (error) {

                console.error(
                    "Firebase login error:",
                    error
                );


                loginError.textContent =
                    getAuthError(
                        error.code
                    );

            }
            finally {

                loginBtn.disabled =
                    false;


                loginBtn.innerHTML = `
                    <i class="fa-solid fa-right-to-bracket"></i>
                    <span>Login to Dashboard</span>
                `;

            }

        }
    );

}


/* =====================================================
   AUTH ERROR
===================================================== */

function getAuthError(code) {

    switch (code) {

        case "auth/invalid-credential":

        case "auth/invalid-login-credentials":

            return "Invalid admin email or password.";


        case "auth/user-not-found":

            return "No Firebase Authentication account exists for this email.";


        case "auth/wrong-password":

            return "Incorrect password.";


        case "auth/invalid-email":

            return "Please enter a valid email address.";


        case "auth/too-many-requests":

            return "Too many login attempts. Please wait and try again.";


        case "auth/network-request-failed":

            return "Network error. Check your internet connection.";


        case "auth/user-disabled":

            return "This Firebase account has been disabled.";


        default:

            return
                `Login failed: ${code || "unknown error"}`;

    }

}


/* =====================================================
   PASSWORD TOGGLE
===================================================== */

if (togglePassword) {

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

                await signOut(
                    auth
                );


                showToast(
                    "Logged out successfully.",
                    "success"
                );

            }
            catch (error) {

                console.error(
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

            sidebar.classList.toggle(
                "open"
            );

        }
    );

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

                showPage(
                    button.dataset.page
                );


                sidebar.classList.remove(
                    "open"
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

    if (loadingRegistrations) {

        return;

    }


    loadingRegistrations = true;


    hideDatabaseError();


    setConnection(
        "loading"
    );


    if (tableStatus) {

        tableStatus.textContent =
            "Connecting to database...";

    }


    if (tableBody) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    style="text-align:center;padding:40px">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    &nbsp; Loading registrations...

                </td>

            </tr>

        `;

    }


    try {

        /*
         * IMPORTANT:
         *
         * This is the exact database path.
         *
         * Your registration form must save data like:
         *
         * registrations
         *     |- record1
         *     |- record2
         *     |- record3
         *
         */

        const registrationsRef =
            ref(
                database,
                "registrations"
            );


        console.log(
            "Reading Firebase path:",
            "registrations"
        );


        const snapshot =
            await get(
                registrationsRef
            );


        console.log(
            "Firebase snapshot:",
            snapshot
        );


        if (snapshot.exists()) {

            const value =
                snapshot.val();


            if (
                value &&
                typeof value === "object"
            ) {

                registrations =
                    value;

            }
            else {

                registrations = {};

            }

        }
        else {

            registrations = {};

        }


        filteredRegistrations =
            {
                ...registrations
            };


        populateFilters();

        updateDashboard();

        renderRecent();

        renderTable();

        updateEventPage();


        setConnection(
            "connected"
        );


        if (tableStatus) {

            tableStatus.textContent =
                `Database synced • ${
                    Object.keys(
                        registrations
                    ).length
                } record(s)`;

        }


        console.log(
            "Registrations loaded:",
            registrations
        );

    }
    catch (error) {

        console.error(
            "FULL FIREBASE DATABASE ERROR:",
            error
        );


        registrations = {};

        filteredRegistrations = {};


        renderTable();


        setConnection(
            "error"
        );


        showDatabaseError(
            error
        );


        if (tableStatus) {

            tableStatus.textContent =
                "Database error";

        }

    }
    finally {

        loadingRegistrations =
            false;

    }

}


/* =====================================================
   DATABASE ERROR
===================================================== */

function showDatabaseError(error) {

    if (!databaseError) {

        return;

    }


    databaseError
        .classList
        .remove("hidden");


    let message =
        "Unable to load registrations.";


    let code =
        "";


    if (error) {

        code =
            error.code ||
            "unknown";


        if (
            code.includes(
                "permission-denied"
            )
        ) {

            message =
                "Firebase denied access to the registrations database.";

        }
        else if (
            code.includes(
                "network"
            )
        ) {

            message =
                "Cannot reach Firebase. Check your internet connection.";

        }
        else {

            message =
                error.message ||
                "Firebase returned an unknown database error.";

        }

    }


    databaseErrorText.textContent =
        message;


    databaseErrorCode.textContent =
        `Firebase error: ${code}`;

}


/* =====================================================
   HIDE DATABASE ERROR
===================================================== */

function hideDatabaseError() {

    if (!databaseError) {

        return;

    }


    databaseError
        .classList
        .add("hidden");

}


/* =====================================================
   CONNECTION STATUS
===================================================== */

function setConnection(status) {

    if (!connectionText) {

        return;

    }


    const states = {

        loading: {

            text:
                "Firebase Connecting...",

            color:
                "#ff9f43"

        },

        connected: {

            text:
                "Firebase Connected",

            color:
                "#00e69a"

        },

        authenticated: {

            text:
                "Authenticated",

            color:
                "#38a9ff"

        },

        error: {

            text:
                "Firebase Error",

            color:
                "#ff536b"

        },

        offline: {

            text:
                "Offline",

            color:
                "#8d9ab1"

        }

    };


    const state =
        states[status] ||
        states.offline;


    connectionText.textContent =
        state.text;


    const dot =
        document.querySelector(
            ".status-dot"
        );


    if (dot) {

        dot.style.background =
            state.color;

        dot.style.color =
            state.color;

    }


    if (topConnection) {

        const span =
            topConnection.querySelector(
                "span"
            );


        if (span) {

            span.style.background =
                state.color;

            span.style.boxShadow =
                `0 0 10px ${state.color}`;

        }


        topConnection.style.color =
            state.color;

    }

}


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    if (Array.isArray(value)) {

        return value
            .map(normalize)
            .filter(Boolean)
            .join(", ");

    }


    if (
        typeof value === "object"
    ) {

        return Object
            .values(value)
            .map(normalize)
            .filter(Boolean)
            .join(", ");

    }


    return String(value);

}


/* =====================================================
   GET EVENTS
===================================================== */

function getEvents(data) {

    if (!data) {

        return [];

    }


    let events =
        data.Events ??
        data.events ??
        data.Event ??
        data.event ??
        data.SelectedEvents ??
        data.selectedEvents;


    if (!events) {

        return [];

    }


    if (Array.isArray(events)) {

        return events
            .map(normalize)
            .map(x => x.trim())
            .filter(Boolean);

    }


    if (
        typeof events === "object"
    ) {

        return Object
            .values(events)
            .map(normalize)
            .map(x => x.trim())
            .filter(Boolean);

    }


    return String(events)
        .split(
            /\s*(?:,|\||;|\n)\s*/
        )
        .map(x => x.trim())
        .filter(Boolean);

}


/* =====================================================
   EVENT MATCH
===================================================== */

function normalizeEvent(event) {

    return normalize(event)
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =====================================================
   EMAIL
===================================================== */

function getRegistrationEmail(data) {

    if (!data) {

        return "";

    }


    return normalize(
        data.EmailAddress ??
        data.Email ??
        data.email ??
        data.emailAddress
    ).trim();

}


/* =====================================================
   TEAM SIZE
===================================================== */

function getTeamSize(data) {

    if (!data) {

        return 0;

    }


    const explicit =
        Number(
            data.TeamSize ??
            data.teamSize
        );


    if (
        Number.isFinite(explicit) &&
        explicit > 0
    ) {

        return explicit;

    }


    let count = 1;


    for (
        let i = 2;
        i <= 10;
        i++
    ) {

        const name =
            data[
                `Member${i}Name`
            ] ??
            data[
                `member${i}Name`
            ];


        if (
            normalize(name).trim()
        ) {

            count++;

        }

    }


    return count;

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
                        normalizeEvent(
                            event
                        );


                    if (
                        clean === "robo race"
                    ) {

                        counts.race++;

                    }


                    if (
                        clean === "robo war"
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


    if (!container) {

        return;

    }


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
                        getRegistrationId(
                            data,
                            key
                        );


                    const name =
                        getStudentName(
                            data
                        ) ||
                        "Unknown";


                    const team =
                        getTeamName(
                            data
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
                                data-view="${escapeAttr(key)}">

                                <i class="fa-solid fa-eye"></i>

                            </button>

                        </div>

                    `;

                }
            )
            .join("");


    container
        .querySelectorAll(
            "[data-view]"
        )
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
    ) {

        return;

    }


    const classes =
        new Set();


    const sections =
        new Set();


    Object
        .values(registrations)
        .forEach(data => {

            const className =
                getClass(
                    data
                );


            const section =
                getSection(
                    data
                );


            if (className) {

                classes.add(
                    className
                );

            }


            if (section) {

                sections.add(
                    section
                );

            }

        });


    const oldClass =
        classFilter.value;


    const oldSection =
        sectionFilter.value;


    classFilter.innerHTML =
        `
            <option value="all">
                All Classes
            </option>
        `;


    [...classes]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b
                )
        )
        .forEach(value => {

            classFilter.innerHTML += `

                <option
                    value="${escapeAttr(value)}">

                    ${escapeHTML(value)}

                </option>

            `;

        });


    sectionFilter.innerHTML =
        `
            <option value="all">
                All Sections
            </option>
        `;


    [...sections]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b
                )
        )
        .forEach(value => {

            sectionFilter.innerHTML += `

                <option
                    value="${escapeAttr(value)}">

                    ${escapeHTML(value)}

                </option>

            `;

        });


    if (
        [...classes]
            .includes(oldClass)
    ) {

        classFilter.value =
            oldClass;

    }


    if (
        [...sections]
            .includes(oldSection)
    ) {

        sectionFilter.value =
            oldSection;

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
   FILTER
===================================================== */

function applyFilters() {

    const search =
        normalize(
            searchInput.value
        )
            .toLowerCase()
            .trim();


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

                    getRegistrationId(
                        data,
                        key
                    ),

                    getStudentName(
                        data
                    ),

                    getTeamName(
                        data
                    ),

                    getClass(
                        data
                    ),

                    getSection(
                        data
                    ),

                    getMobile(
                        data
                    ),

                    getRegistrationEmail(
                        data
                    ),

                    events.join(" ")

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
                            normalizeEvent(
                                event
                            ) ===
                            normalizeEvent(
                                selectedEvent
                            )
                    );


                const matchesClass =
                    selectedClass === "all" ||
                    getClass(data) ===
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

            }
        );


    renderTable();

}


/* =====================================================
   TABLE
===================================================== */

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

        tableEmpty
            .classList
            .remove("hidden");

        return;

    }


    tableEmpty
        .classList
        .add("hidden");


    entries.sort(
        ([, a], [, b]) =>
            getTimestamp(b) -
            getTimestamp(a)
    );


    entries.forEach(
        ([key, data]) => {

            const id =
                getRegistrationId(
                    data,
                    key
                );


            const name =
                getStudentName(
                    data
                ) ||
                "-";


            const team =
                getTeamName(
                    data
                ) ||
                "Unnamed Team";


            const className =
                getClass(
                    data
                ) ||
                "-";


            const section =
                getSection(
                    data
                ) ||
                "-";


            const mobile =
                getMobile(
                    data
                ) ||
                "-";


            const teamSize =
                getTeamSize(
                    data
                );


            const events =
                getEvents(
                    data
                );


            const date =
                formatDate(
                    getRegistrationDate(
                        data
                    )
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
                            class="action-btn view"
                            data-view="${escapeAttr(key)}"
                            title="View">

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            class="action-btn edit"
                            data-edit="${escapeAttr(key)}"
                            title="Edit">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="action-btn delete"
                            data-delete="${escapeAttr(key)}"
                            title="Delete">

                            <i class="fa-solid fa-trash"></i>

                        </button>


                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    bindTableActions();

}


/* =====================================================
   TABLE ACTIONS
===================================================== */

function bindTableActions() {

    tableBody
        .querySelectorAll(
            "[data-view]"
        )
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
        .querySelectorAll(
            "[data-edit]"
        )
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
        .querySelectorAll(
            "[data-delete]"
        )
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


    const events =
        getEvents(data);


    let membersHTML = "";


    for (
        let i = 2;
        i <= 10;
        i++
    ) {

        const name =
            normalize(
                data[
                    `Member${i}Name`
                ] ??
                data[
                    `member${i}Name`
                ]
            );


        if (!name) {

            continue;

        }


        const memberClass =
            normalize(
                data[
                    `Member${i}Class`
                ] ??
                data[
                    `member${i}Class`
                ]
            );


        const memberSection =
            normalize(
                data[
                    `Member${i}Section`
                ] ??
                data[
                    `member${i}Section`
                ]
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
                            ${escapeHTML(name)}
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
                        ${escapeHTML(
                            getRegistrationId(
                                data,
                                key
                            )
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Registration Date
                    </label>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                getRegistrationDate(
                                    data
                                )
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
                            getStudentName(data)
                            || "-"
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
                            || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Class
                    </label>

                    <strong>
                        ${escapeHTML(
                            getClass(data)
                            || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Section
                    </label>

                    <strong>
                        ${escapeHTML(
                            getSection(data)
                            || "-"
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
                            || "-"
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
                        : "No event selected"
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


    detailsModal
        .classList
        .remove("hidden");

}


/* =====================================================
   EDIT
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
        getStudentName(
            data
        );


    editTeamName.value =
        getTeamName(
            data
        );


    editClass.value =
        getClass(
            data
        );


    editSection.value =
        getSection(
            data
        );


    editMobile.value =
        getMobile(
            data
        );


    editEmail.value =
        getRegistrationEmail(
            data
        );


    editRemarks.value =
        normalize(
            data.Remarks ??
            data.remarks
        );


    editModal
        .classList
        .remove("hidden");

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
                        editStudentName.value
                            .trim(),

                    TeamName:
                        editTeamName.value
                            .trim(),

                    Class:
                        editClass.value
                            .trim(),

                    Section:
                        editSection.value
                            .trim(),

                    MobileNumber:
                        editMobile.value
                            .trim(),

                    EmailAddress:
                        editEmail.value
                            .trim(),

                    Remarks:
                        editRemarks.value
                            .trim()

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


                filteredRegistrations[key] =
                    registrations[key];


                editModal
                    .classList
                    .add("hidden");


                updateDashboard();

                renderRecent();

                renderTable();

                populateFilters();

                updateEventPage();


                showToast(
                    "Registration updated successfully.",
                    "success"
                );

            }
            catch (error) {

                console.error(
                    "Update error:",
                    error
                );


                showToast(
                    `Update failed: ${
                        error.code ||
                        error.message
                    }`,
                    "error"
                );

            }
            finally {

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

        return;

    }


    const name =
        getStudentName(
            data
        ) ||
        "this registration";


    const confirmed =
        window.confirm(
            `Delete registration for ${name}?\n\nThis action cannot be undone.`
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


        detailsModal
            .classList
            .add("hidden");


        updateDashboard();

        renderRecent();

        renderTable();

        populateFilters();

        updateEventPage();


        showToast(
            "Registration deleted successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showToast(
            `Delete failed: ${
                error.code ||
                error.message
            }`,
            "error"
        );

    }

}


/* =====================================================
   EVENTS
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


if (databaseRetry) {

    databaseRetry.addEventListener(
        "click",
        loadRegistrations
    );

}


/* =====================================================
   CSV
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
   EXPORT CSV
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

                getRegistrationId(
                    data,
                    key
                ),

                getStudentName(
                    data
                ),

                getTeamName(
                    data
                ),

                getClass(
                    data
                ),

                getSection(
                    data
                ),

                getMobile(
                    data
                ),

                getRegistrationEmail(
                    data
                ),

                getEvents(
                    data
                ).join(" | "),

                getTeamSize(
                    data
                ),

                normalize(
                    data.Member2Name
                ),

                normalize(
                    data.Member3Name
                ),

                normalize(
                    data.Member4Name
                ),

                normalize(
                    data.Member5Name
                ),

                normalize(
                    data.Remarks ??
                    data.remarks
                ),

                getRegistrationDate(
                    data
                )

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


    link.href =
        url;


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
            closeModals
        );

    });


function closeModals() {

    detailsModal
        .classList
        .add("hidden");


    editModal
        .classList
        .add("hidden");

}


detailsModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            detailsModal
        ) {

            closeModals();

        }

    }
);


editModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            editModal
        ) {

            closeModals();

        }

    }
);


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
   ESC
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeModals();

            sidebar.classList.remove(
                "open"
            );

        }

    }
);


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
    ) {

        return;

    }


    toastMessage.textContent =
        message;


    const icon =
        toast.querySelector(
            "i"
        );


    if (icon) {

        icon.className =
            type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";


        icon.style.color =
            type === "error"
                ? "#ff536b"
                : "#00e69a";

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
            3500
        );

}


/* =====================================================
   DATE
===================================================== */

function getRegistrationDate(data) {

    if (!data) {

        return "";

    }


    return data.registrationDate ??
        data.RegistrationDate ??
        data.createdAt ??
        data.created_at ??
        data.timestamp ??
        "";

}


function getTimestamp(data) {

    const value =
        getRegistrationDate(
            data
        );


    if (!value) {

        return 0;

    }


    if (
        typeof value === "number"
    ) {

        return value < 10000000000
            ? value * 1000
            : value;

    }


    const timestamp =
        new Date(
            value
        ).getTime();


    return Number.isNaN(
        timestamp
    )
        ? 0
        : timestamp;

}


function formatDate(value) {

    if (!value) {

        return "-";

    }


    if (
        typeof value === "number"
    ) {

        const milliseconds =
            value < 10000000000
                ? value * 1000
                : value;


        const date =
            new Date(
                milliseconds
            );


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


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return normalize(
            value
        );

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


/* =====================================================
   FIELD HELPERS
===================================================== */

function getRegistrationId(
    data,
    fallback = ""
) {

    return normalize(
        data?.registrationId ??
        data?.RegistrationID ??
        data?.registrationID ??
        data?.registration_id ??
        data?.id ??
        fallback
    );

}


function getStudentName(data) {

    return normalize(
        data?.StudentName ??
        data?.studentName ??
        data?.TeamLeader ??
        data?.teamLeader ??
        data?.name ??
        ""
    );

}


function getTeamName(data) {

    return normalize(
        data?.TeamName ??
        data?.teamName ??
        data?.team ??
        ""
    );

}


function getClass(data) {

    return normalize(
        data?.Class ??
        data?.class ??
        data?.className ??
        ""
    )
        .trim();

}


function getSection(data) {

    return normalize(
        data?.Section ??
        data?.section ??
        ""
    )
        .trim();

}


function getMobile(data) {

    return normalize(
        data?.MobileNumber ??
        data?.mobileNumber ??
        data?.Mobile ??
        data?.mobile ??
        data?.phone ??
        ""
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
   SECURITY
===================================================== */

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

    return escapeHTML(
        value
    );

}


/* =====================================================
   FATAL ERROR
===================================================== */

function showFatalError(message) {

    console.error(
        message
    );

}


/* =====================================================
   INITIAL STATE
===================================================== */

filteredRegistrations = {};

setConnection(
    "loading"
);
