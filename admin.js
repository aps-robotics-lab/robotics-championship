/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN PANEL
   Firebase Authentication + Realtime Database
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
   FIREBASE CONFIG
========================================================= */

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


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const database = getDatabase(firebaseApp);


/* =========================================================
   GLOBAL STATE
========================================================= */

let registrations = {};

let filteredRegistrations = {};

let currentRegistrationKey = null;


/* =========================================================
   HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen = $("loginScreen");

const adminApp = $("adminApp");

const loginForm = $("loginForm");

const loginEmail = $("loginEmail");

const loginPassword = $("loginPassword");

const loginBtn = $("loginBtn");

const loginButtonText = $("loginButtonText");

const loginSpinner = $("loginSpinner");

const loginError = $("loginError");


/* =========================================================
   AUTH STATE
========================================================= */

/*
   THIS IS IMPORTANT.

   Firebase decides whether the user is logged in.

   If logged in:
       Login screen hidden
       Admin panel shown
       Registrations loaded

   If logged out:
       Admin panel hidden
       Login screen shown
*/

onAuthStateChanged(auth, async (user) => {

    console.log("Firebase auth state:", user);

    if (user) {

        loginScreen.classList.add("hidden");

        adminApp.classList.remove("hidden");

        $("adminEmail").textContent =
            user.email || "Authenticated Admin";

        showToast("Admin login successful.");

        await loadRegistrations();

    } else {

        adminApp.classList.add("hidden");

        loginScreen.classList.remove("hidden");

        $("adminEmail").textContent = "Admin";

    }

});


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    loginError.textContent = "";

    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value;


    if (!email || !password) {

        loginError.textContent =
            "Please enter your email and password.";

        return;

    }


    loginBtn.disabled = true;

    loginButtonText.textContent =
        "Signing in...";

    loginSpinner.classList.remove("hidden");


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        /*
           DO NOT manually open dashboard here.

           onAuthStateChanged() will open
           the admin panel automatically.
        */

    } catch (error) {

        console.error(
            "Firebase login error:",
            error
        );

        loginError.textContent =
            getAuthErrorMessage(error);

    } finally {

        loginBtn.disabled = false;

        loginButtonText.textContent =
            "Login to Dashboard";

        loginSpinner.classList.add("hidden");

    }

});


/* =========================================================
   AUTH ERROR MESSAGES
========================================================= */

function getAuthErrorMessage(error) {

    const code = error?.code || "";

    switch (code) {

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-not-found":
            return "No Firebase admin account exists with this email.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please wait and try again.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        case "auth/operation-not-allowed":
            return "Email/Password login is not enabled in Firebase Authentication.";

        case "auth/user-disabled":
            return "This Firebase admin account has been disabled.";

        default:
            return "Login failed: " + code;

    }

}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

$("togglePassword").addEventListener(
    "click",
    () => {

        if (
            loginPassword.type ===
            "password"
        ) {

            loginPassword.type =
                "text";

            $("togglePassword").textContent =
                "🙈";

        } else {

            loginPassword.type =
                "password";

            $("togglePassword").textContent =
                "👁";

        }

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
                "You have been logged out."
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
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

        $("sidebar").classList.toggle(
            "open"
        );

    }
);


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
    .querySelectorAll("[data-open-page]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.openPage
                );

            }
        );

    });


function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const target =
        $(page + "Page");

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


    $("pageTitle").textContent =
        page.charAt(0).toUpperCase() +
        page.slice(1);


    $("sidebar").classList.remove(
        "open"
    );


    if (page === "registrations") {

        renderRegistrationTable();

    }

}


/* =========================================================
   LOAD REGISTRATIONS
========================================================= */

async function loadRegistrations() {

    showToast(
        "Loading registrations..."
    );

    try {

        console.log(
            "Reading Firebase path: /registrations"
        );


        const registrationRef =
            ref(database, "registrations");


        const snapshot =
            await get(registrationRef);


        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.val();


            if (
                data &&
                typeof data === "object"
            ) {

                registrations = data;

            } else {

                registrations = {};

            }

        } else {

            registrations = {};

        }


        filteredRegistrations =
            { ...registrations };


        console.log(
            "Registrations loaded:",
            registrations
        );


        populateFilters();

        updateDashboard();

        renderRecentRegistrations();

        renderRegistrationTable();

        updateEventStatistics();


        showToast(
            `${Object.keys(registrations).length} registration(s) loaded.`
        );


    } catch (error) {

        console.error(
            "DATABASE ERROR:",
            error
        );


        registrations = {};

        filteredRegistrations = {};


        renderRegistrationTable();


        showToast(
            getDatabaseErrorMessage(error)
        );

    }

}


/* =========================================================
   DATABASE ERROR
========================================================= */

function getDatabaseErrorMessage(error) {

    if (
        error?.code ===
        "PERMISSION_DENIED"
    ) {

        return "Database permission denied. Check Firebase Realtime Database Rules.";

    }

    if (
        error?.code ===
        "NETWORK_ERROR"
    ) {

        return "Database network error.";

    }

    return (
        "Could not load registrations: " +
        (error?.message || "Unknown error")
    );

}


/* =========================================================
   NORMALIZE VALUES
========================================================= */

function normalize(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    if (Array.isArray(value)) {

        return value.join(", ");

    }


    if (
        typeof value ===
        "object"
    ) {

        return Object.values(value).join(", ");

    }


    return String(value);

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return normalize(value)
        .replace(
            /[&<>"']/g,
            character => {

                const map = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return map[character];

            }
        );

}


/* =========================================================
   EMAIL
========================================================= */

function getEmail(data) {

    return normalize(
        data.EmailAddress ??
        data.Email ??
        data.email
    );

}


/* =========================================================
   EVENTS
========================================================= */

function getEvents(data) {

    const value =
        data.Events ??
        data.events ??
        data.Event ??
        data.event;


    if (!value) {
        return [];
    }


    if (Array.isArray(value)) {

        return value
            .map(normalize)
            .filter(Boolean);

    }


    if (
        typeof value ===
        "object"
    ) {

        return Object.values(value)
            .map(normalize)
            .filter(Boolean);

    }


    return normalize(value)
        .split(
            /\s*(?:,|\||;)\s*/
        )
        .filter(Boolean);

}


/* =========================================================
   TEAM SIZE
========================================================= */

function getTeamSize(data) {

    const saved =
        Number(data.TeamSize);


    if (
        saved >= 1 &&
        saved <= 5
    ) {

        return saved;

    }


    let count = 1;


    for (
        let i = 2;
        i <= 5;
        i++
    ) {

        if (
            normalize(
                data[`Member${i}Name`]
            )
        ) {

            count++;

        }

    }


    return count;

}


/* =========================================================
   DATE
========================================================= */

function getDate(data) {

    const value =
        data.registrationDate ??
        data.createdAt ??
        data.timestamp;


    if (!value) {

        return null;

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const list =
        Object.values(registrations);


    $("totalRegistrations")
        .textContent =
        list.length;


    $("totalTeams")
        .textContent =
        list.length;


    const counts =
        countEvents();


    $("raceCount")
        .textContent =
        counts.race;


    $("warCount")
        .textContent =
        counts.war;


    $("tugCount")
        .textContent =
        counts.tug;


    $("soccerCount")
        .textContent =
        counts.soccer;

}


/* =========================================================
   EVENT COUNT
========================================================= */

function countEvents() {

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

                    const name =
                        event
                            .toLowerCase()
                            .trim();


                    if (
                        name ===
                        "robo race"
                    ) {

                        counts.race++;

                    }


                    else if (
                        name ===
                        "robo war"
                    ) {

                        counts.war++;

                    }


                    else if (
                        name ===
                        "robo tug of war"
                    ) {

                        counts.tug++;

                    }


                    else if (
                        name ===
                        "robo soccer"
                    ) {

                        counts.soccer++;

                    }

                });

        });


    return counts;

}


/* =========================================================
   EVENT STATISTICS
========================================================= */

function updateEventStatistics() {

    const counts =
        countEvents();


    $("eventRaceCount")
        .textContent =
        counts.race;


    $("eventWarCount")
        .textContent =
        counts.war;


    $("eventTugCount")
        .textContent =
        counts.tug;


    $("eventSoccerCount")
        .textContent =
        counts.soccer;

}


/* =========================================================
   RECENT REGISTRATIONS
========================================================= */

function renderRecentRegistrations() {

    const container =
        $("recentRegistrations");


    const entries =
        Object.entries(
            registrations
        )
        .sort(
            (a, b) =>
                getDate(b[1])?.getTime() || 0 -
                (getDate(a[1])?.getTime() || 0)
        )
        .slice(0, 6);


    if (!entries.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📭</div>
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

                            <div>

                                <div class="recent-name">
                                    ${escapeHTML(
                                        data.StudentName ||
                                        "Unknown Student"
                                    )}
                                </div>

                                <div class="recent-meta">

                                    ${escapeHTML(
                                        data.TeamName ||
                                        "Unnamed Team"
                                    )}

                                    •

                                    ${escapeHTML(id)}

                                </div>

                            </div>

                            <button
                                class="small-button"
                                data-view-key="${escapeHTML(key)}">

                                View

                            </button>

                        </div>

                    `;

                }
            )
            .join("");


    container
        .querySelectorAll(
            "[data-view-key]"
        )
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
   FILTER OPTIONS
========================================================= */

function populateFilters() {

    const classes =
        [
            ...new Set(
                Object.values(registrations)
                    .map(
                        data =>
                            normalize(data.Class)
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
                            normalize(data.Section)
                    )
                    .filter(Boolean)
            )
        ].sort();


    $("classFilter").innerHTML =
        `<option value="all">
            All Classes
        </option>` +
        classes
            .map(
                value =>
                    `<option value="${escapeHTML(value)}">
                        ${escapeHTML(value)}
                    </option>`
            )
            .join("");


    $("sectionFilter").innerHTML =
        `<option value="all">
            All Sections
        </option>` +
        sections
            .map(
                value =>
                    `<option value="${escapeHTML(value)}">
                        ${escapeHTML(value)}
                    </option>`
            )
            .join("");

}


/* =========================================================
   FILTERING
========================================================= */

function applyFilters() {

    const search =
        $("searchInput")
            .value
            .toLowerCase()
            .trim();


    const selectedEvent =
        $("eventFilter").value;


    const selectedClass =
        $("classFilter").value;


    const selectedSection =
        $("sectionFilter").value;


    filteredRegistrations = {};


    Object.entries(
        registrations
    )
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
            .map(normalize)
            .join(" ")
            .toLowerCase();


            const matchesSearch =
                !search ||
                searchable.includes(search);


            const matchesEvent =
                selectedEvent === "all" ||
                eventList.some(
                    event =>
                        event.toLowerCase() ===
                        selectedEvent.toLowerCase()
                );


            const matchesClass =
                selectedClass === "all" ||
                normalize(data.Class) ===
                selectedClass;


            const matchesSection =
                selectedSection === "all" ||
                normalize(data.Section) ===
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


    renderRegistrationTable();

}


/* =========================================================
   FILTER LISTENERS
========================================================= */

$("searchInput")
    .addEventListener(
        "input",
        applyFilters
    );


$("eventFilter")
    .addEventListener(
        "change",
        applyFilters
    );


$("classFilter")
    .addEventListener(
        "change",
        applyFilters
    );


$("sectionFilter")
    .addEventListener(
        "change",
        applyFilters
    );


$("clearFilters")
    .addEventListener(
        "click",
        () => {

            $("searchInput").value =
                "";

            $("eventFilter").value =
                "all";

            $("classFilter").value =
                "all";

            $("sectionFilter").value =
                "all";


            filteredRegistrations =
                { ...registrations };


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
        Object.entries(
            filteredRegistrations
        )
        .sort(
            (a, b) => {

                const dateA =
                    getDate(a[1])?.getTime() || 0;

                const dateB =
                    getDate(b[1])?.getTime() || 0;

                return dateB - dateA;

            }
        );


    $("resultCount")
        .textContent =
        `${entries.length} registration${
            entries.length === 1
                ? ""
                : "s"
        }`;


    $("tableEmpty")
        .classList.toggle(
            "hidden",
            entries.length > 0
        );


    tbody.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const eventList =
                        getEvents(data);


                    const date =
                        getDate(data);


                    const formattedDate =
                        date
                            ? date.toLocaleString(
                                "en-IN",
                                {
                                    dateStyle:
                                        "medium",
                                    timeStyle:
                                        "short"
                                }
                            )
                            : "-";


                    return `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    data.registrationId ||
                                    key
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    data.StudentName ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    data.TeamName ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    data.Class ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    data.Section ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    data.MobileNumber ||
                                    "-"
                                )}
                            </td>

                            <td>

                                ${
                                    eventList.length

                                        ? eventList
                                            .map(
                                                event =>
                                                    `<span class="tag">
                                                        ${escapeHTML(event)}
                                                    </span>`
                                            )
                                            .join("")

                                        : "-"
                                }

                            </td>

                            <td>
                                ${getTeamSize(data)}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formattedDate
                                )}
                            </td>

                            <td>

                                <div class="actions">

                                    <button
                                        class="action-button"
                                        data-view="${escapeHTML(key)}">
                                        👁
                                    </button>

                                    <button
                                        class="action-button"
                                        data-edit="${escapeHTML(key)}">
                                        ✎
                                    </button>

                                    <button
                                        class="action-button delete"
                                        data-delete="${escapeHTML(key)}">
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
        .querySelectorAll(
            "[data-view]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    viewRegistration(
                        button.dataset.view
                    )
            );

        });


    tbody
        .querySelectorAll(
            "[data-edit]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    editRegistration(
                        button.dataset.edit
                    )
            );

        });


    tbody
        .querySelectorAll(
            "[data-delete]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    deleteRegistration(
                        button.dataset.delete
                    )
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

        showToast(
            "Registration not found."
        );

        return;

    }


    currentRegistrationKey =
        key;


    const title =
        data.TeamName ||
        data.StudentName ||
        "Registration";


    let fields = "";


    Object.entries(data)
        .forEach(
            ([name, value]) => {

                if (
                    name === "createdAt"
                ) {

                    return;

                }


                fields += `

                    <div class="detail-item">

                        <small>
                            ${escapeHTML(name)}
                        </small>

                        <strong>
                            ${escapeHTML(
                                normalize(value) ||
                                "-"
                            )}
                        </strong>

                    </div>

                `;

            }
        );


    $("modalContent").innerHTML = `

        <h2 class="modal-title">
            ${escapeHTML(title)}
        </h2>

        <p class="modal-subtitle">
            Registration ID:
            ${escapeHTML(
                data.registrationId ||
                key
            )}
        </p>

        <div class="detail-grid">
            ${fields}
        </div>

    `;


    $("modal")
        .classList.remove("hidden");

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
            "Team Leader Name:",
            data.StudentName || ""
        );


    if (
        studentName === null
    ) {

        return;

    }


    const teamName =
        prompt(
            "Team Name:",
            data.TeamName || ""
        );


    if (
        teamName === null
    ) {

        return;

    }


    const mobile =
        prompt(
            "Mobile Number:",
            data.MobileNumber || ""
        );


    if (
        mobile === null
    ) {

        return;

    }


    const email =
        prompt(
            "Email Address:",
            getEmail(data)
        );


    if (
        email === null
    ) {

        return;

    }


    try {

        const updates = {

            StudentName:
                studentName.trim(),

            TeamName:
                teamName.trim(),

            MobileNumber:
                mobile.trim(),

            EmailAddress:
                email.trim()

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


        updateDashboard();

        renderRecentRegistrations();

        renderRegistrationTable();

        showToast(
            "Registration updated successfully."
        );


    } catch (error) {

        console.error(
            "Edit error:",
            error
        );


        showToast(
            "Update failed. Check Firebase database permissions."
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
        data.StudentName ||
        "this registration";


    const confirmed =
        confirm(
            `Delete registration for ${name}?`
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


        updateDashboard();

        updateEventStatistics();

        renderRecentRegistrations();

        renderRegistrationTable();

        showToast(
            "Registration deleted."
        );


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showToast(
            "Delete failed. Check Firebase database permissions."
        );

    }

}


/* =========================================================
   MODAL
========================================================= */

$("closeModal")
    .addEventListener(
        "click",
        () => {

            $("modal")
                .classList.add(
                    "hidden"
                );

        }
    );


$("modal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "modal"
            ) {

                $("modal")
                    .classList.add(
                        "hidden"
                    );

            }

        }
    );


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            $("modal")
                .classList.add(
                    "hidden"
                );

        }

    }
);


/* =========================================================
   REFRESH
========================================================= */

$("dashboardRefresh")
    .addEventListener(
        "click",
        loadRegistrations
    );


$("refreshRegistrations")
    .addEventListener(
        "click",
        loadRegistrations
    );


/* =========================================================
   CSV
========================================================= */

function csvEscape(value) {

    return `"${normalize(value)
        .replace(
            /"/g,
            '""'
        )}"`;

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


    Object.entries(
        dataObject
    )
    .forEach(
        ([key, data]) => {

            rows.push([

                data.registrationId ||
                    key,

                data.StudentName,

                data.TeamName,

                data.Class,

                data.Section,

                data.MobileNumber,

                getEmail(data),

                getEvents(data).join(
                    " | "
                ),

                getTeamSize(data),

                data.Member2Name,

                data.Member3Name,

                data.Member4Name,

                data.Member5Name,

                data.Remarks,

                data.registrationDate ||
                    data.createdAt

            ].map(csvEscape));

        }
    );


    const csv =
        "\ufeff" +
        rows
            .map(
                row =>
                    row.join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        "APS_Robotics_Registrations_2026.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

}


/* =========================================================
   EXPORT BUTTONS
========================================================= */

$("exportCsv")
    .addEventListener(
        "click",
        () =>
            exportCSV(
                filteredRegistrations
            )
    );


$("exportDashboard")
    .addEventListener(
        "click",
        () =>
            exportCSV(
                registrations
            )
    );


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        $("toast");


    toast.textContent =
        message;


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
            3000
        );

}
