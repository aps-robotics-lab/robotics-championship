/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN PANEL
   Firebase Authentication + Realtime Database
========================================================= */

import { initializeApp } from
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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


/* =========================================================
   ELEMENTS
========================================================= */

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

const adminEmail =
    document.getElementById("adminEmail");


/* =========================================================
   DATA
========================================================= */

let registrations = {};

let filtered = {};

let currentKey = null;


/* =========================================================
   HELPER
========================================================= */

const $ = id =>
    document.getElementById(id);


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(auth, async user => {

    console.log("Firebase auth state:", user);

    if (user) {

        /*
         * USER IS LOGGED IN
         */

        loginScreen.classList.add("hidden");

        adminApp.classList.remove("hidden");

        adminApp.style.display = "flex";

        if (adminEmail) {

            adminEmail.textContent =
                user.email || "Authenticated Admin";

        }

        /*
         * Load registrations after login.
         */

        await loadRegistrations();

        /*
         * Make dashboard visible.
         */

        showPage("dashboard");

    } else {

        /*
         * USER IS NOT LOGGED IN
         */

        loginScreen.classList.remove("hidden");

        adminApp.classList.add("hidden");

        adminApp.style.display = "none";

    }

});


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener("submit", async event => {

    event.preventDefault();

    loginError.textContent = "";

    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value;

    if (!email || !password) {

        loginError.textContent =
            "Enter your admin email and password.";

        return;

    }

    loginBtn.disabled = true;

    loginBtn.textContent =
        "Signing in...";

    try {

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        console.log(
            "Login successful:",
            credential.user.email
        );

        /*
         * DO NOT manually redirect here.
         *
         * onAuthStateChanged() above will open
         * the admin dashboard.
         */

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        loginError.textContent =
            getAuthError(error.code);

    } finally {

        loginBtn.disabled = false;

        loginBtn.textContent =
            "Login to Dashboard";

    }

});


/* =========================================================
   AUTH ERROR
========================================================= */

function getAuthError(code) {

    const errors = {

        "auth/invalid-credential":
            "Invalid email or password.",

        "auth/user-not-found":
            "Admin account was not found.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/too-many-requests":
            "Too many login attempts. Please try again later.",

        "auth/network-request-failed":
            "Network error. Check your internet connection.",

        "auth/user-disabled":
            "This admin account has been disabled."

    };

    return errors[code] ||
        "Login failed. Please check Firebase Authentication.";
}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

const togglePassword =
    $("togglePassword");

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            if (
                loginPassword.type ===
                "password"
            ) {

                loginPassword.type =
                    "text";

                togglePassword.textContent =
                    "🙈";

            } else {

                loginPassword.type =
                    "password";

                togglePassword.textContent =
                    "👁";

            }

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

const logoutBtn =
    $("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   SIDEBAR
========================================================= */

const sidebarToggle =
    $("sidebarToggle");

const sidebar =
    $("sidebar");

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


/* =========================================================
   PAGE NAVIGATION
========================================================= */

document
    .querySelectorAll(".nav")
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

            section.classList.remove(
                "active"
            );

        });


    const target =
        document.getElementById(
            page + "Page"
        );

    if (target) {

        target.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".nav")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    const pageTitle =
        $("pageTitle");

    if (pageTitle) {

        pageTitle.textContent =
            page.charAt(0).toUpperCase() +
            page.slice(1);

    }


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (page === "registrations") {

        renderTable();

    }

}


/* =========================================================
   LOAD REGISTRATIONS
========================================================= */

async function loadRegistrations() {

    try {

        console.log(
            "Loading registrations..."
        );

        const snapshot =
            await get(
                ref(
                    db,
                    "registrations"
                )
            );


        if (
            snapshot.exists()
        ) {

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


        filtered = {
            ...registrations
        };


        console.log(
            "Registrations loaded:",
            registrations
        );


        populateFilters();

        updateDashboard();

        renderRecent();

        renderTable();

        updateEvents();


    } catch (error) {

        console.error(
            "Database error:",
            error
        );

        showToast(
            "Unable to load registrations. Check Firebase Realtime Database rules.",
            "error"
        );

    }

}


/* =========================================================
   VALUE NORMALIZER
========================================================= */

function norm(value) {

    if (value === null ||
        value === undefined) {

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


/* =========================================================
   EVENTS
========================================================= */

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
            .map(norm)
            .filter(Boolean);

    }


    if (typeof value === "object") {

        return Object
            .values(value)
            .map(norm)
            .filter(Boolean);

    }


    return norm(value)
        .split(/\s*(?:,|\||;)\s*/)
        .filter(Boolean);

}


/* =========================================================
   EMAIL
========================================================= */

function getEmail(data) {

    return norm(
        data?.EmailAddress ||
        data?.Email ||
        data?.email
    );

}


/* =========================================================
   TEAM SIZE
========================================================= */

function getTeamSize(data) {

    const teamSize =
        Number(data?.TeamSize);

    if (
        teamSize >= 1 &&
        teamSize <= 5
    ) {

        return teamSize;

    }


    let count = 1;

    for (
        let i = 2;
        i <= 5;
        i++
    ) {

        if (
            norm(
                data?.[`Member${i}Name`]
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

    return new Date(
        data?.registrationDate ||
        data?.createdAt ||
        0
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function safe(value) {

    return norm(value)
        .replace(
            /[&<>"']/g,
            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[character])
        );

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const list =
        Object.values(
            registrations
        );


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


/* =========================================================
   EVENT COUNTS
========================================================= */

function countEvents() {

    const counts = {

        race: 0,

        war: 0,

        tug: 0,

        soccer: 0

    };


    Object.values(
        registrations
    ).forEach(data => {

        getEvents(data)
            .forEach(event => {

                const value =
                    event
                        .toLowerCase()
                        .trim();


                if (
                    value ===
                    "robo race"
                ) {

                    counts.race++;

                }

                else if (
                    value ===
                    "robo war"
                ) {

                    counts.war++;

                }

                else if (
                    value ===
                    "robo tug of war"
                ) {

                    counts.tug++;

                }

                else if (
                    value ===
                    "robo soccer"
                ) {

                    counts.soccer++;

                }

            });

    });


    return counts;

}


/* =========================================================
   EVENT PAGE
========================================================= */

function updateEvents() {

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

function renderRecent() {

    const box =
        $("recentRegistrations");

    if (!box) return;


    const entries =
        Object.entries(
            registrations
        )
        .sort(
            (a, b) =>
                getDate(b[1]) -
                getDate(a[1])
        )
        .slice(0, 6);


    if (!entries.length) {

        box.innerHTML =
            "No registrations found.";

        return;

    }


    box.innerHTML =
        entries
            .map(
                ([key, data]) => `

                <div class="recent">

                    <div>

                        <b>
                            ${safe(
                                data.StudentName ||
                                "Unknown"
                            )}
                        </b>

                        <span>
                            ${safe(
                                data.TeamName ||
                                "Unnamed Team"
                            )}
                            •
                            ${safe(
                                data.registrationId ||
                                key
                            )}
                        </span>

                    </div>

                    <button
                        type="button"
                        onclick="window.viewRegistration('${key}')">

                        View

                    </button>

                </div>

            `
            )
            .join("");

    }


/* =========================================================
   FILTER DROPDOWNS
========================================================= */

function populateFilters() {

    const classes =
        [
            ...new Set(
                Object.values(
                    registrations
                )
                .map(
                    data =>
                        norm(data.Class)
                )
                .filter(Boolean)
            )
        ].sort();


    const sections =
        [
            ...new Set(
                Object.values(
                    registrations
                )
                .map(
                    data =>
                        norm(data.Section)
                )
                .filter(Boolean)
            )
        ].sort();


    const classFilter =
        $("classFilter");

    const sectionFilter =
        $("sectionFilter");


    if (classFilter) {

        classFilter.innerHTML =
            '<option value="all">All Classes</option>' +

            classes
                .map(
                    value =>
                        `<option value="${safe(value)}">${safe(value)}</option>`
                )
                .join("");

    }


    if (sectionFilter) {

        sectionFilter.innerHTML =
            '<option value="all">All Sections</option>' +

            sections
                .map(
                    value =>
                        `<option value="${safe(value)}">${safe(value)}</option>`
                )
                .join("");

    }

}


/* =========================================================
   FILTER REGISTRATIONS
========================================================= */

function applyFilters() {

    const query =
        $("searchInput")
            .value
            .toLowerCase()
            .trim();


    const eventFilter =
        $("eventFilter").value;

    const classFilter =
        $("classFilter").value;

    const sectionFilter =
        $("sectionFilter").value;


    filtered = {};


    Object.entries(
        registrations
    ).forEach(
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
                .map(norm)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !query ||
                searchable.includes(query);


            const matchesEvent =
                eventFilter === "all" ||
                eventList.some(
                    event =>
                        event.toLowerCase() ===
                        eventFilter.toLowerCase()
                );


            const matchesClass =
                classFilter === "all" ||
                norm(data.Class) ===
                classFilter;


            const matchesSection =
                sectionFilter === "all" ||
                norm(data.Section) ===
                sectionFilter;


            if (
                matchesSearch &&
                matchesEvent &&
                matchesClass &&
                matchesSection
            ) {

                filtered[key] = data;

            }

        }
    );


    renderTable();

}


/* =========================================================
   FILTER EVENTS
========================================================= */

[
    "searchInput",
    "eventFilter",
    "classFilter",
    "sectionFilter"
]
.forEach(id => {

    const element =
        $(id);

    if (!element) return;


    element.addEventListener(
        id === "searchInput"
            ? "input"
            : "change",
        applyFilters
    );

});


/* =========================================================
   CLEAR FILTERS
========================================================= */

$("clearFilters")?.addEventListener(
    "click",
    () => {

        $("searchInput").value = "";

        $("eventFilter").value =
            "all";

        $("classFilter").value =
            "all";

        $("sectionFilter").value =
            "all";

        applyFilters();

    }
);


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable() {

    const body =
        $("registrationTableBody");

    if (!body) return;


    const entries =
        Object.entries(
            filtered
        )
        .sort(
            (a, b) =>
                getDate(b[1]) -
                getDate(a[1])
        );


    const resultCount =
        $("resultCount");

    if (resultCount) {

        resultCount.textContent =
            `${entries.length} registration${
                entries.length === 1
                    ? ""
                    : "s"
            }`;

    }


    const empty =
        $("tableEmpty");

    if (empty) {

        empty.classList.toggle(
            "hidden",
            entries.length > 0
        );

    }


    body.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const eventHTML =
                        getEvents(data)
                            .map(
                                event =>
                                    `<span class="tag">${safe(event)}</span>`
                            )
                            .join("");


                    const date =
                        getDate(data);


                    const formattedDate =
                        date.getTime()
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
                                    "-"
                                )}
                            </td>

                            <td>
                                ${eventHTML || "-"}
                            </td>

                            <td>
                                ${getTeamSize(data)}
                            </td>

                            <td>
                                ${formattedDate}
                            </td>

                            <td>

                                <div class="actions">

                                    <button
                                        type="button"
                                        onclick="window.viewRegistration('${key}')">

                                        👁

                                    </button>

                                    <button
                                        type="button"
                                        onclick="window.editRegistration('${key}')">

                                        ✎

                                    </button>

                                    <button
                                        type="button"
                                        class="del"
                                        onclick="window.deleteRegistration('${key}')">

                                        ×

                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   VIEW REGISTRATION
========================================================= */

window.viewRegistration =
    key => {

        const data =
            registrations[key];

        if (!data) return;


        currentKey =
            key;


        const content =
            $("modalContent");


        content.innerHTML = `

            <h2>
                ${safe(
                    data.TeamName ||
                    "Registration"
                )}
            </h2>

            <p>
                <b>Registration ID:</b>
                ${safe(
                    data.registrationId ||
                    key
                )}
            </p>

            <div class="detail">

                ${Object.entries(data)
                    .map(
                        ([name, value]) => `

                            <div>

                                <small>
                                    ${safe(name)}
                                </small>

                                <b>
                                    ${safe(
                                        norm(value) ||
                                        "-"
                                    )}
                                </b>

                            </div>

                        `
                    )
                    .join("")}

            </div>

        `;


        $("modal")
            .classList
            .remove("hidden");

    };


/* =========================================================
   EDIT REGISTRATION
========================================================= */

window.editRegistration =
    async key => {

        const data =
            registrations[key];

        if (!data) return;


        const name =
            prompt(
                "Team Leader:",
                data.StudentName || ""
            );


        if (name === null) return;


        const team =
            prompt(
                "Team Name:",
                data.TeamName || ""
            );


        if (team === null) return;


        try {

            await update(
                ref(
                    db,
                    `registrations/${key}`
                ),
                {

                    StudentName:
                        name.trim(),

                    TeamName:
                        team.trim()

                }
            );


            registrations[key]
                .StudentName =
                    name.trim();


            registrations[key]
                .TeamName =
                    team.trim();


            filtered[key] =
                registrations[key];


            renderTable();

            renderRecent();

            showToast(
                "Registration updated successfully."
            );


        } catch (error) {

            console.error(
                error
            );

            showToast(
                "Unable to update registration.",
                "error"
            );

        }

    };


/* =========================================================
   DELETE REGISTRATION
========================================================= */

window.deleteRegistration =
    async key => {

        const data =
            registrations[key];

        if (!data) return;


        const confirmed =
            confirm(
                `Delete ${
                    data.StudentName ||
                    "this registration"
                }?`
            );


        if (!confirmed) return;


        try {

            await remove(
                ref(
                    db,
                    `registrations/${key}`
                )
            );


            delete registrations[key];

            delete filtered[key];


            updateDashboard();

            renderRecent();

            renderTable();

            updateEvents();


            showToast(
                "Registration deleted successfully."
            );


        } catch (error) {

            console.error(
                error
            );

            showToast(
                "Delete failed. Check Firebase database permissions.",
                "error"
            );

        }

    };


/* =========================================================
   MODAL
========================================================= */

$("closeModal")?.addEventListener(
    "click",
    () => {

        $("modal")
            .classList
            .add("hidden");

    }
);


$("modal")?.addEventListener(
    "click",
    event => {

        if (
            event.target.id ===
            "modal"
        ) {

            $("modal")
                .classList
                .add("hidden");

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
                ?.classList
                .add("hidden");

        }

    }
);


/* =========================================================
   REFRESH
========================================================= */

$("dashboardRefresh")?.addEventListener(
    "click",
    loadRegistrations
);


$("refreshRegistrations")?.addEventListener(
    "click",
    loadRegistrations
);


/* =========================================================
   CSV EXPORT
========================================================= */

function csvEscape(value) {

    return `"${norm(value)
        .replace(/"/g, '""')}"`;

}


function exportCSV(data) {

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


    Object.entries(data)
        .forEach(
            ([key, record]) => {

                rows.push([

                    record.registrationId ||
                        key,

                    record.StudentName,

                    record.TeamName,

                    record.Class,

                    record.Section,

                    record.MobileNumber,

                    getEmail(record),

                    getEvents(record)
                        .join(" | "),

                    getTeamSize(record),

                    record.Member2Name,

                    record.Member3Name,

                    record.Member4Name,

                    record.Member5Name,

                    record.Remarks,

                    record.registrationDate

                ].map(csvEscape));

            }
        );


    const blob =
        new Blob(
            [
                "\ufeff" +
                rows
                    .map(
                        row =>
                            row.join(",")
                    )
                    .join("\n")
            ],
            {
                type:
                    "text/csv;charset=utf-8"
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


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

}


/* =========================================================
   EXPORT BUTTONS
========================================================= */

$("exportCsv")?.addEventListener(
    "click",
    () => exportCSV(filtered)
);


$("exportDashboard")?.addEventListener(
    "click",
    () => exportCSV(registrations)
);


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        $("toast");

    if (!toast) {

        alert(message);

        return;

    }


    toast.textContent =
        message;


    toast.className =
        type;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}
