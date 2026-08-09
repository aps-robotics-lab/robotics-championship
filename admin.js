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
    set,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =====================================================
   FIREBASE
===================================================== */

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


/* =====================================================
   ELEMENT HELPER
===================================================== */

const $ = id => document.getElementById(id);


/* =====================================================
   STATE
===================================================== */

let registrations = {};
let filteredRegistrations = {};

let siteContent = {
    home: {},
    events: {},
    contact: {},
    team: {},
    rules: {}
};


/* =====================================================
   LOGIN
===================================================== */

const loginScreen = $("loginScreen");
const adminApp = $("adminApp");

const loginForm = $("loginForm");
const loginEmail = $("loginEmail");
const loginPassword = $("loginPassword");

const loginError = $("loginError");
const loginBtn = $("loginBtn");


onAuthStateChanged(auth, async user => {

    if (!user) {

        loginScreen.classList.remove("hidden");
        adminApp.classList.add("hidden");

        return;
    }


    loginScreen.classList.add("hidden");
    adminApp.classList.remove("hidden");

    $("adminEmail").textContent =
        user.email || "Authenticated Admin";


    await loadEverything();

});


loginForm.addEventListener("submit", async event => {

    event.preventDefault();

    loginError.textContent = "";

    loginBtn.disabled = true;

    loginBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';


    try {

        await signInWithEmailAndPassword(
            auth,
            loginEmail.value.trim(),
            loginPassword.value
        );

    } catch (error) {

        console.error(error);

        loginError.textContent =
            firebaseAuthError(error.code);

    }


    loginBtn.disabled = false;

    loginBtn.innerHTML =
        '<i class="fa-solid fa-right-to-bracket"></i> Login to Dashboard';

});


function firebaseAuthError(code) {

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
            "Too many login attempts. Try again later.",

        "auth/network-request-failed":
            "Network error. Check your internet connection."

    };

    return errors[code] ||
        "Login failed. Check Firebase Authentication.";
}


/* PASSWORD */

$("togglePassword").addEventListener("click", () => {

    const icon =
        $("togglePassword").querySelector("i");

    if (loginPassword.type === "password") {

        loginPassword.type = "text";

        icon.className =
            "fa-solid fa-eye-slash";

    } else {

        loginPassword.type = "password";

        icon.className =
            "fa-solid fa-eye";

    }

});


/* LOGOUT */

$("logoutBtn").addEventListener("click", async () => {

    await signOut(auth);

});


/* =====================================================
   NAVIGATION
===================================================== */

document.querySelectorAll(".nav").forEach(button => {

    button.addEventListener("click", () => {

        showPage(button.dataset.page);

    });

});


document
    .querySelectorAll("[data-page-target]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.pageTarget);

        });

    });


$("sidebarToggle").addEventListener("click", () => {

    $("sidebar").classList.toggle("open");

});


function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove("active");

        });


    const target = $(`${page}Page`);

    if (!target) return;

    target.classList.add("active");


    document
        .querySelectorAll(".nav")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    const titles = {

        dashboard: "Dashboard",

        registrations: "Registrations",

        home: "Home Page",

        events: "02 / Events",

        contact: "04 / Contact",

        team: "05 / Our Team",

        rules: "Rules"

    };


    $("pageTitle").textContent =
        titles[page] || "Dashboard";


    $("sidebar").classList.remove("open");

}


/* =====================================================
   LOAD EVERYTHING
===================================================== */

async function loadEverything() {

    await Promise.all([
        loadRegistrations(),
        loadSiteContent()
    ]);

}


/* =====================================================
   REGISTRATIONS
===================================================== */

async function loadRegistrations() {

    try {

        const snapshot =
            await get(ref(db, "registrations"));


        if (
            snapshot.exists() &&
            typeof snapshot.val() === "object"
        ) {

            registrations = snapshot.val();

        } else {

            registrations = {};

        }


        filteredRegistrations =
            { ...registrations };


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


        showToast(
            "Could not load registrations. Check Firebase Database Rules.",
            true
        );

    }

}


/* =====================================================
   NORMALIZE
===================================================== */

function norm(value) {

    if (value === null || value === undefined)
        return "";

    if (Array.isArray(value))
        return value.join(", ");

    if (typeof value === "object")
        return Object.values(value).join(", ");

    return String(value);

}


function safe(value) {

    return norm(value)
        .replace(/[&<>"']/g, character => {

            const map = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            };

            return map[character];

        });

}


function getEvents(data) {

    const value =
        data?.Events ??
        data?.events ??
        data?.Event ??
        data?.event;


    if (!value)
        return [];


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


function getEmail(data) {

    return norm(
        data?.EmailAddress ??
        data?.Email ??
        data?.email
    );

}


function getTeamSize(data) {

    const explicit =
        Number(data?.TeamSize);


    if (explicit > 0)
        return explicit;


    let count = 1;


    for (let i = 2; i <= 5; i++) {

        if (
            norm(data?.[`Member${i}Name`])
        ) {

            count++;

        }

    }


    return count;

}


function getDate(data) {

    return new Date(
        data?.registrationDate ||
        data?.createdAt ||
        0
    );

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const list =
        Object.values(registrations);


    $("totalRegistrations").textContent =
        list.length;


    $("totalTeams").textContent =
        list.length;


    const counts =
        countEvents();


    $("raceCount").textContent =
        counts.race;

    $("warCount").textContent =
        counts.war;

    $("tugCount").textContent =
        counts.tug;

    $("soccerCount").textContent =
        counts.soccer;


    $("navRegistrationCount").textContent =
        list.length;

}


function countEvents() {

    const result = {

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

                    const value =
                        event
                            .toLowerCase()
                            .trim();


                    if (value === "robo race")
                        result.race++;

                    if (value === "robo war")
                        result.war++;

                    if (value === "robo tug of war")
                        result.tug++;

                    if (value === "robo soccer")
                        result.soccer++;

                });

        });


    return result;

}


function updateEventStatistics() {

    const counts =
        countEvents();


    /* Kept here for compatibility with older dashboards. */

}


/* =====================================================
   RECENT REGISTRATIONS
===================================================== */

function renderRecentRegistrations() {

    const container =
        $("recentRegistrations");


    const entries =
        Object
            .entries(registrations)
            .sort(
                (a, b) =>
                    getDate(b[1]) -
                    getDate(a[1])
            )
            .slice(0, 8);


    if (!entries.length) {

        container.innerHTML =
            `<div class="empty">
                <i class="fa-solid fa-users-slash"></i>
                <h3>No registrations yet</h3>
             </div>`;

        return;

    }


    container.innerHTML =
        entries.map(([key, data]) => {

            return `
                <div class="recent">

                    <div class="recent-info">

                        <strong>
                            ${safe(data.StudentName || "Unknown")}
                        </strong>

                        <small>
                            ${safe(data.TeamName || "Unnamed Team")}
                            •
                            ${safe(data.registrationId || key)}
                        </small>

                    </div>

                    <button
                        class="small-btn"
                        data-view-registration="${safe(key)}">

                        View

                    </button>

                </div>
            `;

        }).join("");


    container
        .querySelectorAll("[data-view-registration]")
        .forEach(button => {

            button.addEventListener("click", () => {

                viewRegistration(
                    button.dataset.viewRegistration
                );

            });

        });

}


/* =====================================================
   FILTERS
===================================================== */

function populateFilters() {

    const classes =
        [
            ...new Set(
                Object
                    .values(registrations)
                    .map(data => norm(data.Class))
                    .filter(Boolean)
            )
        ].sort();


    const sections =
        [
            ...new Set(
                Object
                    .values(registrations)
                    .map(data => norm(data.Section))
                    .filter(Boolean)
            )
        ].sort();


    $("classFilter").innerHTML =
        `<option value="all">All Classes</option>` +
        classes
            .map(value =>
                `<option value="${safe(value)}">
                    ${safe(value)}
                 </option>`
            )
            .join("");


    $("sectionFilter").innerHTML =
        `<option value="all">All Sections</option>` +
        sections
            .map(value =>
                `<option value="${safe(value)}">
                    ${safe(value)}
                 </option>`
            )
            .join("");

}


function applyFilters() {

    const query =
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
        .forEach(([key, data]) => {

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
                event === "all" ||
                eventList.some(
                    item =>
                        item.toLowerCase() ===
                        event.toLowerCase()
                );


            const matchesClass =
                classValue === "all" ||
                norm(data.Class) === classValue;


            const matchesSection =
                section === "all" ||
                norm(data.Section) === section;


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


    renderRegistrationTable();

}


[
    "searchInput",
    "eventFilter",
    "classFilter",
    "sectionFilter"
].forEach(id => {

    $(id).addEventListener(
        id === "searchInput"
            ? "input"
            : "change",
        applyFilters
    );

});


$("clearFilters").addEventListener("click", () => {

    $("searchInput").value = "";

    $("eventFilter").value = "all";

    $("classFilter").value = "all";

    $("sectionFilter").value = "all";

    applyFilters();

});


/* =====================================================
   REGISTRATION TABLE
===================================================== */

function renderRegistrationTable() {

    const entries =
        Object
            .entries(filteredRegistrations)
            .sort(
                (a, b) =>
                    getDate(b[1]) -
                    getDate(a[1])
            );


    $("resultCount").textContent =
        `${entries.length} registration${entries.length === 1 ? "" : "s"}`;


    $("tableEmpty")
        .classList
        .toggle(
            "hidden",
            entries.length > 0
        );


    $("registrationTableBody").innerHTML =
        entries
            .map(([key, data]) => {

                const eventTags =
                    getEvents(data)
                        .map(
                            event =>
                                `<span class="tag">
                                    ${safe(event)}
                                 </span>`
                        )
                        .join("");


                const date =
                    getDate(data);


                const formattedDate =
                    date.getTime()
                        ? date.toLocaleString(
                            "en-IN",
                            {
                                dateStyle:"medium",
                                timeStyle:"short"
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
                            ${eventTags || "-"}
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
                                    title="View"
                                    data-view="${safe(key)}">
                                    <i class="fa-solid fa-eye"></i>
                                </button>

                                <button
                                    title="Edit"
                                    data-edit="${safe(key)}">
                                    <i class="fa-solid fa-pen"></i>
                                </button>

                                <button
                                    class="delete"
                                    title="Delete"
                                    data-delete="${safe(key)}">
                                    <i class="fa-solid fa-trash"></i>
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            })
            .join("");


    $("registrationTableBody")
        .querySelectorAll("[data-view]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    viewRegistration(
                        button.dataset.view
                    )
            );

        });


    $("registrationTableBody")
        .querySelectorAll("[data-edit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    editRegistration(
                        button.dataset.edit
                    )
            );

        });


    $("registrationTableBody")
        .querySelectorAll("[data-delete]")
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


/* =====================================================
   VIEW REGISTRATION
===================================================== */

function viewRegistration(key) {

    const data =
        registrations[key];


    if (!data)
        return;


    const entries =
        Object.entries(data);


    $("modalContent").innerHTML = `

        <span class="eyebrow">
            REGISTRATION DETAILS
        </span>

        <h2>
            ${safe(
                data.TeamName ||
                data.StudentName ||
                "Registration"
            )}
        </h2>

        <p>
            Registration ID:
            <strong>
                ${safe(
                    data.registrationId ||
                    key
                )}
            </strong>
        </p>

        <div class="detail-grid">

            ${entries
                .map(([field, value]) => {

                    return `
                        <div class="detail-item">

                            <small>
                                ${safe(field)}
                            </small>

                            <strong>
                                ${safe(norm(value) || "-")}
                            </strong>

                        </div>
                    `;

                })
                .join("")}

        </div>

    `;


    $("modal").classList.remove("hidden");

}


/* =====================================================
   EDIT REGISTRATION
===================================================== */

async function editRegistration(key) {

    const data =
        registrations[key];


    if (!data)
        return;


    const leader =
        prompt(
            "Team Leader Name:",
            data.StudentName || ""
        );


    if (leader === null)
        return;


    const team =
        prompt(
            "Team Name:",
            data.TeamName || ""
        );


    if (team === null)
        return;


    const mobile =
        prompt(
            "Mobile Number:",
            data.MobileNumber || ""
        );


    if (mobile === null)
        return;


    const email =
        prompt(
            "Email:",
            getEmail(data)
        );


    if (email === null)
        return;


    try {

        await update(
            ref(db, `registrations/${key}`),
            {
                StudentName: leader.trim(),
                TeamName: team.trim(),
                MobileNumber: mobile.trim(),
                EmailAddress: email.trim()
            }
        );


        registrations[key].StudentName =
            leader.trim();

        registrations[key].TeamName =
            team.trim();

        registrations[key].MobileNumber =
            mobile.trim();

        registrations[key].EmailAddress =
            email.trim();


        filteredRegistrations =
            { ...registrations };


        renderRegistrationTable();

        renderRecentRegistrations();

        updateDashboard();


        showToast(
            "Registration updated successfully."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Registration update failed.",
            true
        );

    }

}


/* =====================================================
   DELETE
===================================================== */

async function deleteRegistration(key) {

    const data =
        registrations[key];


    if (!data)
        return;


    const name =
        data.StudentName ||
        "this registration";


    if (
        !confirm(
            `Delete registration for ${name}?`
        )
    ) {

        return;

    }


    try {

        await remove(
            ref(db, `registrations/${key}`)
        );


        delete registrations[key];

        delete filteredRegistrations[key];


        updateDashboard();

        renderRecentRegistrations();

        renderRegistrationTable();


        showToast(
            "Registration deleted."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Delete failed. Check Firebase permissions.",
            true
        );

    }

}


/* =====================================================
   SITE CONTENT
===================================================== */

async function loadSiteContent() {

    try {

        const snapshot =
            await get(
                ref(db, "siteContent")
            );


        if (snapshot.exists()) {

            siteContent =
                snapshot.val();

        }


        siteContent.home ??= {};

        siteContent.events ??= {};

        siteContent.contact ??= {};

        siteContent.team ??= {};

        siteContent.rules ??= {};


        populateHomeEditor();

        populateEventsEditor();

        populateContactEditor();

        renderTeamEditor();

        populateRulesEditor();


    } catch (error) {

        console.error(
            "Site content error:",
            error
        );


        showToast(
            "Unable to load website content.",
            true
        );

    }

}


/* =====================================================
   HOME
===================================================== */

function populateHomeEditor() {

    const home =
        siteContent.home;


    $("homeBadge").value =
        home.badge ||
        "APS TINKERING LAB";


    $("homeTitle").value =
        home.title ||
        "APS ROBOTICS";


    $("homeTitleHighlight").value =
        home.titleHighlight ||
        "CHAMPIONSHIP 2026";


    $("homeDescription").value =
        home.description ||
        "";


    $("homePrimaryButton").value =
        home.primaryButton ||
        "Register Now";


    $("homeSecondaryButton").value =
        home.secondaryButton ||
        "Explore Events";


    $("homeWelcomeLabel").value =
        home.welcomeLabel ||
        "WELCOME";


    $("homeWelcomeTitle").value =
        home.welcomeTitle ||
        "Welcome to APS Robotics";


    $("homeWelcomeDescription").value =
        home.welcomeDescription ||
        "";

}


/* =====================================================
   EVENTS
===================================================== */

function populateEventsEditor() {

    const events =
        siteContent.events;


    const defaults = [

        {
            name:"Robo Race",
            label:"Speed & precision",
            description:"A high-speed robotics challenge."
        },

        {
            name:"Robo War",
            label:"Strength & strategy",
            description:"Robots compete using strength and strategy."
        },

        {
            name:"Robo Tug of War",
            label:"Power & teamwork",
            description:"A test of robot power and teamwork."
        },

        {
            name:"Robo Soccer",
            label:"Control & coordination",
            description:"Robots compete in an exciting soccer challenge."
        }

    ];


    for (
        let i = 1;
        i <= 4;
        i++
    ) {

        const event =
            events[`event${i}`] ||
            defaults[i - 1];


        $(`event${i}Name`).value =
            event.name || "";


        $(`event${i}Label`).value =
            event.label || "";


        $(`event${i}Description`).value =
            event.description || "";

    }

}


/* =====================================================
   CONTACT
===================================================== */

function populateContactEditor() {

    const contact =
        siteContent.contact;


    $("contactAddress").value =
        contact.address || "";


    $("contactPhone").value =
        contact.phone || "";


    $("contactEmail").value =
        contact.email ||
        "tinkeringlab@aps.edu.in";


    $("contactFacebook").value =
        contact.facebook || "";


    $("contactInstagram").value =
        contact.instagram || "";


    $("contactYoutube").value =
        contact.youtube || "";


    $("contactWebsite").value =
        contact.website || "";

}


/* =====================================================
   TEAM
===================================================== */

function renderTeamEditor() {

    const list =
        $("teamEditorList");


    const team =
        siteContent.team;


    let members = [];


    if (Array.isArray(team)) {

        members = team;

    } else if (team && typeof team === "object") {

        members =
            Object.values(team);

    }


    list.innerHTML = "";


    if (!members.length) {

        list.innerHTML = `
            <div class="card empty">

                <i class="fa-solid fa-people-group"></i>

                <h3>No team members yet</h3>

                <p>
                    Click "Add Member" to create your first team member.
                </p>

            </div>
        `;

        return;

    }


    members.forEach(
        (member, index) => {

            list.insertAdjacentHTML(
                "beforeend",
                createTeamEditor(
                    member,
                    index
                )
            );

        }
    );

}


function createTeamEditor(member, index) {

    return `

        <div
            class="card team-editor-card"
            data-team-index="${index}">

            <div class="team-number">
                ${String(index + 1).padStart(2,"0")}
            </div>

            <div>

                <h3>
                    Team Member ${index + 1}
                </h3>

                <div class="form-grid">

                    <label>
                        Name
                        <input
                            class="team-name"
                            value="${safe(member.name || "")}"
                            placeholder="Full name">
                    </label>

                    <label>
                        Role
                        <input
                            class="team-role"
                            value="${safe(member.role || "")}"
                            placeholder="Role / Position">
                    </label>

                    <label>
                        Photo URL
                        <input
                            class="team-photo"
                            value="${safe(member.photo || "")}"
                            placeholder="https://...">
                    </label>

                    <label>
                        LinkedIn / Profile URL
                        <input
                            class="team-link"
                            value="${safe(member.link || "")}"
                            placeholder="https://...">
                    </label>

                    <label class="full">
                        Description
                        <textarea
                            class="team-description"
                            rows="4"
                            placeholder="Short description">${safe(member.description || "")}</textarea>
                    </label>

                </div>

            </div>

            <button
                class="remove-team"
                type="button">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>
    `;

}


/* ADD TEAM MEMBER */

$("addTeamMember").addEventListener(
    "click",
    () => {

        const list =
            $("teamEditorList");


        const empty =
            list.querySelector(".empty");


        if (empty)
            empty.remove();


        const index =
            list.querySelectorAll(
                ".team-editor-card"
            ).length;


        list.insertAdjacentHTML(
            "beforeend",
            createTeamEditor(
                {
                    name:"",
                    role:"",
                    photo:"",
                    link:"",
                    description:""
                },
                index
            )
        );

    }
);


/* REMOVE TEAM */

$("teamEditorList").addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".remove-team"
            );


        if (!button)
            return;


        const card =
            button.closest(
                ".team-editor-card"
            );


        card.remove();

    }
);


/* =====================================================
   RULES
===================================================== */

function populateRulesEditor() {

    const rules =
        siteContent.rules;


    $("rulesLabel").value =
        rules.label ||
        "RULES & GUIDELINES";


    $("rulesTitle").value =
        rules.title ||
        "Championship Rules";


    $("rulesIntroduction").value =
        rules.introduction ||
        "";


    renderRulesSections(
        Array.isArray(rules.sections)
            ? rules.sections
            : []
    );

}


function renderRulesSections(sections) {

    const container =
        $("rulesEditorList");


    container.innerHTML = "";


    sections.forEach(
        (section, index) => {

            addRuleEditor(
                section,
                index
            );

        }
    );

}


function addRuleEditor(
    section = {},
    index = null
) {

    const container =
        $("rulesEditorList");


    if (index === null) {

        index =
            container.querySelectorAll(
                ".rule-editor"
            ).length;

    }


    container.insertAdjacentHTML(
        "beforeend",
        `

        <div class="card rule-editor">

            <div class="rule-number">
                ${String(index + 1).padStart(2,"0")}
            </div>

            <div>

                <h3>
                    Rule Section
                </h3>

                <div class="form-grid">

                    <label>
                        Heading
                        <input
                            class="rule-title"
                            value="${safe(section.title || "")}"
                            placeholder="Safety Rules">
                    </label>

                    <label>
                        Short Label
                        <input
                            class="rule-label"
                            value="${safe(section.label || "")}"
                            placeholder="01 / SAFETY">
                    </label>

                    <label class="full">
                        Rules / Content
                        <textarea
                            class="rule-content"
                            rows="7"
                            placeholder="Enter rules here...">${safe(section.content || "")}</textarea>
                    </label>

                </div>

            </div>

            <button
                class="remove-rule"
                type="button">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

        `
    );

}


/* ADD RULE */

$("addRuleSection").addEventListener(
    "click",
    () => addRuleEditor()
);


/* REMOVE RULE */

$("rulesEditorList").addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".remove-rule"
            );


        if (!button)
            return;


        button
            .closest(".rule-editor")
            .remove();

    }
);


/* =====================================================
   SAVE CONTENT
===================================================== */

document
    .querySelectorAll(".save-content")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const type =
                    button.dataset.content;


                if (type === "home")
                    saveHome(button);

                if (type === "events")
                    saveEvents(button);

                if (type === "contact")
                    saveContact(button);

                if (type === "rules")
                    saveRules(button);

            }
        );

    });


/* SAVE HOME */

async function saveHome(button) {

    const content = {

        badge:
            $("homeBadge").value.trim(),

        title:
            $("homeTitle").value.trim(),

        titleHighlight:
            $("homeTitleHighlight").value.trim(),

        description:
            $("homeDescription").value.trim(),

        primaryButton:
            $("homePrimaryButton").value.trim(),

        secondaryButton:
            $("homeSecondaryButton").value.trim(),

        welcomeLabel:
            $("homeWelcomeLabel").value.trim(),

        welcomeTitle:
            $("homeWelcomeTitle").value.trim(),

        welcomeDescription:
            $("homeWelcomeDescription").value.trim()

    };


    await saveContent(
        "home",
        content,
        button
    );

}


/* SAVE EVENTS */

async function saveEvents(button) {

    const events = {};


    for (
        let i = 1;
        i <= 4;
        i++
    ) {

        events[`event${i}`] = {

            name:
                $(`event${i}Name`).value.trim(),

            label:
                $(`event${i}Label`).value.trim(),

            description:
                $(`event${i}Description`)
                    .value
                    .trim()

        };

    }


    await saveContent(
        "events",
        events,
        button
    );

}


/* SAVE CONTACT */

async function saveContact(button) {

    const contact = {

        address:
            $("contactAddress").value.trim(),

        phone:
            $("contactPhone").value.trim(),

        email:
            $("contactEmail").value.trim(),

        facebook:
            $("contactFacebook").value.trim(),

        instagram:
            $("contactInstagram").value.trim(),

        youtube:
            $("contactYoutube").value.trim(),

        website:
            $("contactWebsite").value.trim()

    };


    await saveContent(
        "contact",
        contact,
        button
    );

}


/* SAVE TEAM */

async function saveTeam() {

    const cards =
        document.querySelectorAll(
            ".team-editor-card"
        );


    const members = [];


    cards.forEach(card => {

        members.push({

            name:
                card
                    .querySelector(".team-name")
                    .value
                    .trim(),

            role:
                card
                    .querySelector(".team-role")
                    .value
                    .trim(),

            photo:
                card
                    .querySelector(".team-photo")
                    .value
                    .trim(),

            link:
                card
                    .querySelector(".team-link")
                    .value
                    .trim(),

            description:
                card
                    .querySelector(".team-description")
                    .value
                    .trim()

        });

    });


    try {

        await set(
            ref(db, "siteContent/team"),
            members
        );


        siteContent.team =
            members;


        showToast(
            "Our Team saved successfully."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to save Our Team.",
            true
        );

    }

}


/* SAVE RULES */

async function saveRules(button) {

    const sections = [];


    document
        .querySelectorAll(".rule-editor")
        .forEach(card => {

            sections.push({

                title:
                    card
                        .querySelector(".rule-title")
                        .value
                        .trim(),

                label:
                    card
                        .querySelector(".rule-label")
                        .value
                        .trim(),

                content:
                    card
                        .querySelector(".rule-content")
                        .value
                        .trim()

            });

        });


    const rules = {

        label:
            $("rulesLabel").value.trim(),

        title:
            $("rulesTitle").value.trim(),

        introduction:
            $("rulesIntroduction")
                .value
                .trim(),

        sections

    };


    await saveContent(
        "rules",
        rules,
        button
    );

}


/* SAVE */

async function saveContent(
    type,
    content,
    button
) {

    const original =
        button.innerHTML;


    button.disabled = true;

    button.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';


    try {

        await set(
            ref(db, `siteContent/${type}`),
            content
        );


        siteContent[type] =
            content;


        showToast(
            `${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully.`
        );


    } catch (error) {

        console.error(error);

        showToast(
            `Could not save ${type}. Check Firebase permissions.`,
            true
        );

    }


    button.disabled = false;

    button.innerHTML = original;

}


/* TEAM SAVE WHEN LEAVING TEAM PAGE */

const teamNav =
    document.querySelector(
        '.nav[data-page="team"]'
    );


if (teamNav) {

    teamNav.addEventListener(
        "click",
        () => {

            setTimeout(() => {

                const existing =
                    $("teamSaveButton");


                if (existing)
                    return;


                const heading =
                    document
                        .querySelector(
                            "#teamPage .page-heading"
                        );


                const button =
                    document.createElement(
                        "button"
                    );


                button.id =
                    "teamSaveButton";

                button.className =
                    "primary-btn";

                button.innerHTML =
                    '<i class="fa-solid fa-cloud-arrow-up"></i> Save Team';


                button.addEventListener(
                    "click",
                    saveTeam
                );


                heading.appendChild(button);

            }, 50);

        }
    );

}


/* =====================================================
   EXPORT CSV
===================================================== */

$("exportCsv").addEventListener(
    "click",
    () => {

        exportCSV(
            filteredRegistrations
        );

    }
);


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


    Object
        .entries(data)
        .forEach(([key, item]) => {

            rows.push([

                item.registrationId || key,

                item.StudentName,

                item.TeamName,

                item.Class,

                item.Section,

                item.MobileNumber,

                getEmail(item),

                getEvents(item).join(" | "),

                getTeamSize(item),

                item.Member2Name,

                item.Member3Name,

                item.Member4Name,

                item.Member5Name,

                item.Remarks,

                item.registrationDate

            ].map(csvEscape));

        });


    const blob =
        new Blob(
            [
                "\ufeff" +
                rows
                    .map(row => row.join(","))
                    .join("\n")
            ],
            {
                type:"text/csv;charset=utf-8;"
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

}


/* =====================================================
   REFRESH
===================================================== */

$("dashboardRefresh")
    .addEventListener(
        "click",
        loadEverything
    );


$("refreshRegistrations")
    .addEventListener(
        "click",
        loadRegistrations
    );


/* =====================================================
   MODAL
===================================================== */

$("closeModal")
    .addEventListener(
        "click",
        () =>
            $("modal")
                .classList
                .add("hidden")
    );


$("modal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("modal")
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

        if (event.key === "Escape") {

            $("modal")
                .classList
                .add("hidden");

        }

    }
);


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(
    message,
    error = false
) {

    const toast =
        $("toast");


    toast.textContent =
        message;


    toast.style.borderColor =
        error
            ? "var(--danger)"
            : "var(--cyan)";


    toast.classList.add("show");


    clearTimeout(toastTimer);


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
