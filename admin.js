/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN CONTROL CENTER
========================================================= */

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
    set,
    update,
    remove,
    push
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =========================================================
   FIREBASE
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


const firebaseApp =
    initializeApp(firebaseConfig);

const auth =
    getAuth(firebaseApp);

const db =
    getDatabase(firebaseApp);


/* =========================================================
   HELPERS
========================================================= */

const $ = id =>
    document.getElementById(id);


let registrations = {};
let filteredRegistrations = {};
let rules = [];

let toastTimer;


/* =========================================================
   SAFE TEXT
========================================================= */

function safe(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function normalize(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }

    if (Array.isArray(value)) {

        return value
            .map(normalize)
            .join(", ");

    }

    if (typeof value === "object") {

        return Object.values(value)
            .map(normalize)
            .join(", ");

    }

    return String(value);
}


function dateValue(data) {

    const value =
        data?.registrationDate ||
        data?.createdAt ||
        "";

    const date =
        new Date(value);

    return isNaN(date.getTime())
        ? 0
        : date.getTime();
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

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


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (user) {

            $("loginScreen")
                .classList.add(
                    "hidden"
                );

            $("adminApp")
                .classList.remove(
                    "hidden"
                );

            $("adminEmail")
                .textContent =
                user.email ||
                "Authenticated Admin";

            await initializeAdmin();

        } else {

            $("loginScreen")
                .classList.remove(
                    "hidden"
                );

            $("adminApp")
                .classList.add(
                    "hidden"
                );

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

$("loginForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const email =
                $("loginEmail")
                    .value
                    .trim();

            const password =
                $("loginPassword")
                    .value;

            $("loginError")
                .textContent = "";

            $("loginBtn")
                .disabled = true;

            $("loginBtn")
                .textContent =
                "Signing in...";


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            } catch (error) {

                $("loginError")
                    .textContent =
                    getAuthError(
                        error.code
                    );

            } finally {

                $("loginBtn")
                    .disabled = false;

                $("loginBtn")
                    .textContent =
                    "Login to Dashboard";

            }

        }
    );


function getAuthError(
    code
) {

    const errors = {

        "auth/invalid-credential":
            "Invalid email or password.",

        "auth/user-not-found":
            "Admin account not found.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/invalid-email":
            "Enter a valid email address.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/network-request-failed":
            "Network error. Check your internet connection."

    };

    return errors[code] ||
        "Login failed. Check Firebase Authentication.";
}


$("togglePassword")
    .addEventListener(
        "click",
        () => {

            const input =
                $("loginPassword");

            input.type =
                input.type === "password"
                    ? "text"
                    : "password";

        }
    );


$("logoutBtn")
    .addEventListener(
        "click",
        () => {

            signOut(auth);

        }
    );


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(
        ".nav-item"
    )
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
    .querySelectorAll(
        "[data-page-target]"
    )
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


function showPage(
    page
) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const target =
        $(`${page}Page`);

    if (target) {

        target.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".nav-item"
        )
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

        homeEditor:
            "Home Page Editor",

        rulesEditor:
            "Rules Page Editor",

        events:
            "Events"

    };


    $("pageTitle")
        .textContent =
        titles[page] ||
        "Dashboard";


    $("sidebar")
        .classList.remove(
            "open"
        );


    if (
        page ===
        "registrations"
    ) {

        renderRegistrationTable();

    }


    if (
        page ===
        "homeEditor"
    ) {

        loadHomeEditor();

    }


    if (
        page ===
        "rulesEditor"
    ) {

        loadRulesEditor();

    }

}


/* =========================================================
   SIDEBAR
========================================================= */

$("sidebarToggle")
    .addEventListener(
        "click",
        () => {

            $("sidebar")
                .classList.toggle(
                    "open"
                );

        }
    );


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeAdmin() {

    try {

        await loadRegistrations();

        await loadSiteContent();

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Some data could not be loaded."
        );

    }

}


/* =========================================================
   REGISTRATIONS
========================================================= */

async function loadRegistrations() {

    try {

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

            const value =
                snapshot.val();

            registrations =
                value &&
                typeof value === "object"
                    ? value
                    : {};

        } else {

            registrations = {};

        }


        filteredRegistrations =
            {
                ...registrations
            };


        populateFilters();

        updateDashboard();

        renderRecent();

        renderRegistrationTable();

        updateEventCounts();

        $("registrationBadge")
            .textContent =
            Object.keys(
                registrations
            ).length;


    } catch (error) {

        console.error(
            "Registration loading error:",
            error
        );

        showToast(
            "Could not load registrations. Check Firebase Database Rules."
        );

    }

}


/* =========================================================
   EVENTS
========================================================= */

function getEvents(
    data
) {

    const value =
        data?.Events ??
        data?.events ??
        data?.Event ??
        data?.event;


    if (!value)
        return [];


    if (
        Array.isArray(value)
    ) {

        return value
            .map(normalize)
            .filter(Boolean);

    }


    if (
        typeof value === "object"
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
                    )
                        counts.race++;


                    if (
                        name ===
                        "robo war"
                    )
                        counts.war++;


                    if (
                        name ===
                        "robo tug of war"
                    )
                        counts.tug++;


                    if (
                        name ===
                        "robo soccer"
                    )
                        counts.soccer++;

                });

        });


    return counts;
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        Object.keys(
            registrations
        ).length;


    $("totalRegistrations")
        .textContent =
        total;


    $("totalTeams")
        .textContent =
        total;


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


function updateEventCounts() {

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

function renderRecent() {

    const box =
        $("recentRegistrations");


    const entries =
        Object.entries(
            registrations
        )
        .sort(
            (a, b) =>
                dateValue(b[1]) -
                dateValue(a[1])
        )
        .slice(0, 7);


    if (!entries.length) {

        box.innerHTML =
            `<div class="empty">
                No registrations found.
            </div>`;

        return;

    }


    box.innerHTML =
        entries
            .map(
                ([key, data]) => `

                <div class="recent-row">

                    <div>

                        <div class="recent-name">
                            ${safe(
                                data.StudentName ||
                                "Unknown"
                            )}
                        </div>

                        <div class="recent-meta">
                            ${safe(
                                data.TeamName ||
                                "Unnamed Team"
                            )}
                            •
                            ${safe(
                                data.registrationId ||
                                key
                            )}
                        </div>

                    </div>

                    <button
                        class="text-btn"
                        data-view-key="${safe(key)}">

                        View

                    </button>

                </div>

            `
            )
            .join("");


    box
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
   FILTERS
========================================================= */

function populateFilters() {

    const classes =
        [
            ...new Set(
                Object
                    .values(
                        registrations
                    )
                    .map(
                        data =>
                            normalize(
                                data.Class
                            )
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    const sections =
        [
            ...new Set(
                Object
                    .values(
                        registrations
                    )
                    .map(
                        data =>
                            normalize(
                                data.Section
                            )
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    $("classFilter")
        .innerHTML =
        `<option value="all">
            All Classes
        </option>` +
        classes
            .map(
                value =>
                    `<option value="${safe(value)}">
                        ${safe(value)}
                    </option>`
            )
            .join("");


    $("sectionFilter")
        .innerHTML =
        `<option value="all">
            All Sections
        </option>` +
        sections
            .map(
                value =>
                    `<option value="${safe(value)}">
                        ${safe(value)}
                    </option>`
            )
            .join("");

}


/* =========================================================
   APPLY FILTERS
========================================================= */

function applyFilters() {

    const query =
        $("searchInput")
            .value
            .trim()
            .toLowerCase();


    const event =
        $("eventFilter")
            .value;


    const classValue =
        $("classFilter")
            .value;


    const section =
        $("sectionFilter")
            .value;


    filteredRegistrations = {};


    Object
        .entries(
            registrations
        )
        .forEach(
            ([key, data]) => {

                const events =
                    getEvents(data);


                const searchable =
                    [

                        data.registrationId,
                        data.StudentName,
                        data.TeamName,
                        data.Class,
                        data.Section,
                        data.MobileNumber,
                        data.EmailAddress,
                        ...events

                    ]
                    .map(normalize)
                    .join(" ")
                    .toLowerCase();


                const matchesQuery =
                    !query ||
                    searchable.includes(
                        query
                    );


                const matchesEvent =
                    event === "all" ||
                    events.some(
                        item =>
                            item.toLowerCase() ===
                            event.toLowerCase()
                    );


                const matchesClass =
                    classValue === "all" ||
                    normalize(data.Class) ===
                    classValue;


                const matchesSection =
                    section === "all" ||
                    normalize(data.Section) ===
                    section;


                if (
                    matchesQuery &&
                    matchesEvent &&
                    matchesClass &&
                    matchesSection
                ) {

                    filteredRegistrations[
                        key
                    ] = data;

                }

            }
        );


    renderRegistrationTable();

}


$("searchInput")
    .addEventListener(
        "input",
        applyFilters
    );


[
    "eventFilter",
    "classFilter",
    "sectionFilter"
]
.forEach(id => {

    $(id)
        .addEventListener(
            "change",
            applyFilters
        );

});


$("clearFilters")
    .addEventListener(
        "click",
        () => {

            $("searchInput")
                .value = "";

            $("eventFilter")
                .value = "all";

            $("classFilter")
                .value = "all";

            $("sectionFilter")
                .value = "all";

            applyFilters();

        }
    );


/* =========================================================
   TABLE
========================================================= */

function getTeamSize(data) {

    const value =
        Number(
            data.TeamSize
        );


    if (
        value >= 1 &&
        value <= 5
    ) {

        return value;

    }


    let count = 1;


    for (
        let i = 2;
        i <= 5;
        i++
    ) {

        if (
            normalize(
                data[
                    `Member${i}Name`
                ]
            )
        ) {

            count++;

        }

    }


    return count;
}


function renderRegistrationTable() {

    const body =
        $("registrationTableBody");


    const entries =
        Object
            .entries(
                filteredRegistrations
            )
            .sort(
                (a, b) =>
                    dateValue(b[1]) -
                    dateValue(a[1])
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


    body.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const events =
                        getEvents(data);


                    const date =
                        dateValue(data)
                            ? new Date(
                                dateValue(data)
                            ).toLocaleString(
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
                            ${
                                events
                                    .map(
                                        event =>
                                            `<span class="tag">
                                                ${safe(event)}
                                            </span>`
                                    )
                                    .join("")
                                ||
                                "-"
                            }
                        </td>

                        <td>
                            ${getTeamSize(data)}
                        </td>

                        <td>
                            ${safe(date)}
                        </td>

                        <td>

                            <div class="actions">

                                <button
                                    data-action="view"
                                    data-key="${safe(key)}">
                                    👁
                                </button>

                                <button
                                    data-action="edit"
                                    data-key="${safe(key)}">
                                    ✎
                                </button>

                                <button
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


    body
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const key =
                        button.dataset.key;

                    const action =
                        button.dataset.action;


                    if (
                        action ===
                        "view"
                    )
                        viewRegistration(key);


                    if (
                        action ===
                        "edit"
                    )
                        editRegistration(key);


                    if (
                        action ===
                        "delete"
                    )
                        deleteRegistration(key);

                }
            );

        });

}


/* =========================================================
   VIEW REGISTRATION
========================================================= */

function viewRegistration(
    key
) {

    const data =
        registrations[key];


    if (!data)
        return;


    const fields =
        Object.entries(
            data
        );


    $("modalContent")
        .innerHTML = `

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

            ${fields
                .map(
                    ([name, value]) => `

                    <div class="detail-item">

                        <small>
                            ${safe(name)}
                        </small>

                        <strong>
                            ${safe(
                                normalize(value) ||
                                "-"
                            )}
                        </strong>

                    </div>

                `
                )
                .join("")}

        </div>

    `;


    $("modal")
        .classList.remove(
            "hidden"
        );

}


/* =========================================================
   EDIT REGISTRATION
========================================================= */

async function editRegistration(
    key
) {

    const data =
        registrations[key];


    if (!data)
        return;


    const leader =
        prompt(
            "Team Leader Name:",
            data.StudentName || ""
        );


    if (
        leader ===
        null
    )
        return;


    const team =
        prompt(
            "Team Name:",
            data.TeamName || ""
        );


    if (
        team ===
        null
    )
        return;


    const mobile =
        prompt(
            "Mobile Number:",
            data.MobileNumber || ""
        );


    if (
        mobile ===
        null
    )
        return;


    try {

        await update(
            ref(
                db,
                `registrations/${key}`
            ),
            {

                StudentName:
                    leader.trim(),

                TeamName:
                    team.trim(),

                MobileNumber:
                    mobile.trim()

            }
        );


        registrations[key]
            .StudentName =
            leader.trim();


        registrations[key]
            .TeamName =
            team.trim();


        registrations[key]
            .MobileNumber =
            mobile.trim();


        filteredRegistrations[key] =
            registrations[key];


        renderRegistrationTable();

        renderRecent();

        updateDashboard();

        showToast(
            "Registration updated successfully."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Update failed. Check Firebase permissions."
        );

    }

}


/* =========================================================
   DELETE REGISTRATION
========================================================= */

async function deleteRegistration(
    key
) {

    const data =
        registrations[key];


    if (!data)
        return;


    const confirmed =
        confirm(
            `Delete registration for ${
                data.StudentName ||
                "this participant"
            }?`
        );


    if (!confirmed)
        return;


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

        updateEventCounts();

        renderRecent();

        renderRegistrationTable();


        $("registrationBadge")
            .textContent =
            Object.keys(
                registrations
            ).length;


        showToast(
            "Registration deleted."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Delete failed. Check Firebase permissions."
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


/* =========================================================
   HOME PAGE CMS
========================================================= */

const defaultHome = {

    eyebrow:
        "APS TINKERING LAB",

    title:
        "APS ROBOTICS CHAMPIONSHIP 2026",

    subtitle:
        "Build. Compete. Innovate.",

    description:
        "A futuristic robotics championship where young innovators build, compete and showcase their engineering skills.",

    buttonText:
        "Register Now",

    buttonLink:
        "registration.html",

    aboutTitle:
        "About APS Robotics Championship",

    aboutDescription:
        "APS Robotics Championship 2026 is a robotics competition organised by APS Tinkering Lab. Students can participate in exciting robotics challenges including Robo Race, Robo War, Robo Tug of War and Robo Soccer."

};


let homeContent = {};


/* =========================================================
   SITE CONTENT LOAD
========================================================= */

async function loadSiteContent() {

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "siteContent"
                )
            );


        const value =
            snapshot.exists()
                ? snapshot.val()
                : {};


        homeContent =
            {
                ...defaultHome,
                ...(value.home || {})
            };


        rules =
            Array.isArray(
                value.rules?.items
            )
                ? value.rules.items
                : [];


        loadHomeEditor();

        loadRulesEditor();


    } catch (error) {

        console.error(
            "Site content error:",
            error
        );

        homeContent =
            {
                ...defaultHome
            };

        rules = [];

        loadHomeEditor();

        loadRulesEditor();

    }

}


/* =========================================================
   HOME EDITOR LOAD
========================================================= */

function loadHomeEditor() {

    if (!homeContent)
        return;


    $("homeEyebrow")
        .value =
        homeContent.eyebrow ||
        "";


    $("homeTitle")
        .value =
        homeContent.title ||
        "";


    $("homeSubtitle")
        .value =
        homeContent.subtitle ||
        "";


    $("homeDescription")
        .value =
        homeContent.description ||
        "";


    $("homeButtonText")
        .value =
        homeContent.buttonText ||
        "";


    $("homeButtonLink")
        .value =
        homeContent.buttonLink ||
        "";


    $("aboutTitle")
        .value =
        homeContent.aboutTitle ||
        "";


    $("aboutDescription")
        .value =
        homeContent.aboutDescription ||
        "";

}


/* =========================================================
   SAVE HOME
========================================================= */

$("homeForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const data = {

                eyebrow:
                    $("homeEyebrow")
                        .value
                        .trim(),

                title:
                    $("homeTitle")
                        .value
                        .trim(),

                subtitle:
                    $("homeSubtitle")
                        .value
                        .trim(),

                description:
                    $("homeDescription")
                        .value
                        .trim(),

                buttonText:
                    $("homeButtonText")
                        .value
                        .trim(),

                buttonLink:
                    $("homeButtonLink")
                        .value
                        .trim(),

                aboutTitle:
                    $("aboutTitle")
                        .value
                        .trim(),

                aboutDescription:
                    $("aboutDescription")
                        .value
                        .trim()

            };


            try {

                await update(
                    ref(
                        db,
                        "siteContent/home"
                    ),
                    data
                );


                homeContent =
                    {
                        ...homeContent,
                        ...data
                    };


                $("homeSaveStatus")
                    .textContent =
                    "Saved successfully ✓";


                showToast(
                    "Home page updated successfully."
                );


            } catch (error) {

                console.error(error);

                $("homeSaveStatus")
                    .textContent =
                    "Save failed";


                showToast(
                    "Could not save homepage content."
                );

            }

        }
    );


/* =========================================================
   RULES EDITOR
========================================================= */

function loadRulesEditor() {

    const list =
        $("rulesList");


    $("rulesTitle")
        .value =
        window.currentRulesTitle ||
        "Championship Rules";


    $("rulesIntro")
        .value =
        window.currentRulesIntro ||
        "";


    renderRulesEditor();

}


/* =========================================================
   RENDER RULES
========================================================= */

function renderRulesEditor() {

    const list =
        $("rulesList");


    if (!rules.length) {

        list.innerHTML = `

            <div class="editor-card">

                <p style="
                    color:#718097;
                    font-size:11px;
                    margin:0;
                ">

                    No rules added yet.
                    Click "Add Rule" to create the first rule.

                </p>

            </div>

        `;

        return;

    }


    list.innerHTML =
        rules
            .map(
                (rule, index) => `

                <div
                    class="rule-admin-card"
                    data-rule-index="${index}">

                    <div class="rule-admin-top">

                        <strong class="rule-number">
                            RULE ${String(
                                index + 1
                            ).padStart(2, "0")}
                        </strong>

                        <button
                            type="button"
                            class="delete-rule"
                            data-delete-rule="${index}">

                            Delete Rule

                        </button>

                    </div>


                    <div class="field">

                        <label>
                            Rule Title
                        </label>

                        <input
                            class="rule-title-input"
                            type="text"
                            value="${safe(
                                rule.title || ""
                            )}"
                            placeholder="Rule title">

                    </div>


                    <div class="field">

                        <label>
                            Rule Description
                        </label>

                        <textarea
                            class="rule-description-input"
                            rows="4"
                            placeholder="Rule details">${safe(
                                rule.description || ""
                            )}</textarea>

                    </div>

                </div>

            `
            )
            .join("");


    list
        .querySelectorAll(
            "[data-delete-rule]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.deleteRule
                        );


                    if (
                        !confirm(
                            "Delete this rule?"
                        )
                    )
                        return;


                    rules.splice(
                        index,
                        1
                    );


                    renderRulesEditor();


                    $("rulesSaveStatus")
                        .textContent =
                        "Unsaved changes";

                }
            );

        });

}


/* =========================================================
   ADD RULE
========================================================= */

$("addRuleBtn")
    .addEventListener(
        "click",
        () => {

            rules.push({

                title:
                    "New Rule",

                description:
                    "Enter rule details here."

            });


            renderRulesEditor();


            $("rulesSaveStatus")
                .textContent =
                "Unsaved changes";


            setTimeout(
                () => {

                    const cards =
                        document
                            .querySelectorAll(
                                ".rule-admin-card"
                            );


                    cards[
                        cards.length - 1
                    ]?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "center"
                    });

                },
                50
            );

        }
    );


/* =========================================================
   SAVE RULES
========================================================= */

$("rulesForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const cards =
                document
                    .querySelectorAll(
                        ".rule-admin-card"
                    );


            const updatedRules =
                [];


            cards.forEach(card => {

                const title =
                    card
                        .querySelector(
                            ".rule-title-input"
                        )
                        .value
                        .trim();


                const description =
                    card
                        .querySelector(
                            ".rule-description-input"
                        )
                        .value
                        .trim();


                if (
                    title ||
                    description
                ) {

                    updatedRules.push({

                        title,
                        description

                    });

                }

            });


            const rulesData = {

                title:
                    $("rulesTitle")
                        .value
                        .trim(),

                intro:
                    $("rulesIntro")
                        .value
                        .trim(),

                items:
                    updatedRules

            };


            try {

                await set(
                    ref(
                        db,
                        "siteContent/rules"
                    ),
                    rulesData
                );


                rules =
                    updatedRules;


                window.currentRulesTitle =
                    rulesData.title;


                window.currentRulesIntro =
                    rulesData.intro;


                $("rulesSaveStatus")
                    .textContent =
                    "Saved successfully ✓";


                showToast(
                    "Rules page updated successfully."
                );


            } catch (error) {

                console.error(error);

                $("rulesSaveStatus")
                    .textContent =
                    "Save failed";


                showToast(
                    "Could not save rules."
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
        async () => {

            await loadRegistrations();

            await loadSiteContent();

            showToast(
                "Dashboard refreshed."
            );

        }
    );


$("refreshRegistrations")
    .addEventListener(
        "click",
        async () => {

            await loadRegistrations();

            showToast(
                "Registrations refreshed."
            );

        }
    );


/* =========================================================
   CSV
========================================================= */

function csvEscape(
    value
) {

    return `"${normalize(value)
        .replace(/"/g, '""')}"`;

}


function exportCSV(
    object
) {

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


    Object
        .entries(object)
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

                    data.EmailAddress,

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

    link.click();


    URL.revokeObjectURL(
        url
    );

}


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
   ESCAPE
========================================================= */

document
    .addEventListener(
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
