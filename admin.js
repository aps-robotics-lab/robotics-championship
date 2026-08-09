/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN DASHBOARD
   Firebase Authentication + Realtime Database
===================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    get
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
   INITIALIZE FIREBASE
===================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


/* =====================================================
   ADMIN.HTML ELEMENTS
===================================================== */

const loginCard =
    document.getElementById("loginCard");

const dashboard =
    document.getElementById("dashboard");

const logoutBtn =
    document.getElementById("logoutBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const searchInput =
    document.getElementById("search");

const statusBox =
    document.getElementById("status");

const registrationBody =
    document.getElementById("registrationBody");


/* =====================================================
   DATA
===================================================== */

let allRegistrations = [];


/* =====================================================
   START
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /*
     * Do not display the dashboard until Firebase
     * confirms that a user is authenticated.
     */

    if (dashboard) {
        dashboard.classList.add("hidden");
    }

});


/* =====================================================
   FIREBASE AUTH STATE
===================================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        /*
         * No Firebase user is logged in.
         * Send them back to your existing login.html.
         */

        window.location.replace("login.html");

        return;
    }


    /*
     * User is authenticated.
     */

    console.log(
        "Admin authenticated:",
        user.email
    );


    /*
     * Hide login card if it exists.
     * Your current admin.html contains this element,
     * although login itself happens on login.html.
     */

    if (loginCard) {
        loginCard.classList.add("hidden");
    }


    /*
     * Show dashboard.
     */

    if (dashboard) {
        dashboard.classList.remove("hidden");
    }


    /*
     * Show logged-in status.
     */

    setStatus(
        `Logged in as ${user.email}`,
        false
    );


    /*
     * Load registration data.
     */

    await loadRegistrations();

});


/* =====================================================
   LOAD REGISTRATIONS
===================================================== */

async function loadRegistrations() {

    setStatus(
        "Loading registrations...",
        false
    );


    if (!registrationBody) {
        console.error(
            "registrationBody element not found."
        );

        return;
    }


    try {

        /*
         * This matches the expected Firebase path:
         *
         * registrations
         */

        const registrationsRef =
            ref(db, "registrations");


        const snapshot =
            await get(registrationsRef);


        allRegistrations = [];


        if (!snapshot.exists()) {

            renderRegistrations();

            setStatus(
                "No registrations found.",
                false
            );

            return;
        }


        const data =
            snapshot.val();


        /*
         * Firebase Realtime Database normally returns:
         *
         * {
         *   registrationKey1: {...},
         *   registrationKey2: {...}
         * }
         */

        Object.entries(data).forEach(
            ([firebaseKey, registration]) => {

                if (
                    registration &&
                    typeof registration === "object"
                ) {

                    allRegistrations.push({

                        firebaseKey,

                        ...registration

                    });

                }

            }
        );


        /*
         * Newest registrations first.
         */

        allRegistrations.sort(
            (a, b) => {

                const dateA =
                    getRegistrationDate(a);

                const dateB =
                    getRegistrationDate(b);

                return dateB - dateA;

            }
        );


        renderRegistrations();


        setStatus(
            `${allRegistrations.length} registration(s) found.`,
            false
        );


    } catch (error) {

        console.error(
            "Firebase database error:",
            error
        );


        if (
            error.code ===
            "PERMISSION_DENIED"
        ) {

            setStatus(
                "Permission denied. Check your Firebase Realtime Database rules.",
                true
            );

        } else {

            setStatus(
                error.message ||
                "Unable to load registrations.",
                true
            );

        }

    }

}


/* =====================================================
   RENDER REGISTRATIONS
===================================================== */

function renderRegistrations() {

    if (!registrationBody) {
        return;
    }


    const searchText =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";


    const filtered =
        allRegistrations.filter(
            registration => {

                if (!searchText) {
                    return true;
                }


                /*
                 * Search through all registration fields.
                 *
                 * This allows searching:
                 * name
                 * team
                 * email
                 * event
                 * registration ID
                 * members
                 * etc.
                 */

                return JSON.stringify(
                    registration
                )
                .toLowerCase()
                .includes(searchText);

            }
        );


    registrationBody.innerHTML = "";


    if (filtered.length === 0) {

        registrationBody.innerHTML = `
            <tr>
                <td
                    colspan="11"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#8fa5bf;
                    "
                >
                    No registrations found.
                </td>
            </tr>
        `;

        return;
    }


    filtered.forEach(
        registration => {

            const row =
                document.createElement("tr");


            const registrationId =
                firstValue(
                    registration,
                    [
                        "RegistrationId",
                        "RegistrationID",
                        "registrationId",
                        "registrationID"
                    ]
                ) ||
                registration.firebaseKey ||
                "-";


            const leader =
                firstValue(
                    registration,
                    [
                        "StudentName",
                        "studentName",
                        "LeaderName",
                        "leaderName"
                    ]
                ) || "-";


            const team =
                firstValue(
                    registration,
                    [
                        "TeamName",
                        "teamName"
                    ]
                ) || "-";


            const teamSize =
                firstValue(
                    registration,
                    [
                        "TeamSize",
                        "teamSize"
                    ]
                ) || "-";


            const studentClass =
                firstValue(
                    registration,
                    [
                        "Class",
                        "studentClass",
                        "StudentClass"
                    ]
                ) || "-";


            const section =
                firstValue(
                    registration,
                    [
                        "Section",
                        "studentSection",
                        "StudentSection"
                    ]
                ) || "-";


            const mobile =
                firstValue(
                    registration,
                    [
                        "MobileNumber",
                        "mobileNumber",
                        "Mobile"
                    ]
                ) || "-";


            const email =
                firstValue(
                    registration,
                    [
                        "EmailAddress",
                        "emailAddress",
                        "Email"
                    ]
                ) || "-";


            const events =
                getEvents(registration);


            const members =
                getMembers(registration);


            const date =
                formatDate(
                    getDateValue(registration)
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(registrationId)}
                </td>

                <td>
                    ${escapeHtml(leader)}
                </td>

                <td>
                    ${escapeHtml(team)}
                </td>

                <td>
                    ${escapeHtml(teamSize)}
                </td>

                <td>
                    ${escapeHtml(studentClass)}
                </td>

                <td>
                    ${escapeHtml(section)}
                </td>

                <td>
                    ${escapeHtml(mobile)}
                </td>

                <td>
                    ${escapeHtml(email)}
                </td>

                <td>
                    ${escapeHtml(events)}
                </td>

                <td>
                    ${escapeHtml(members)}
                </td>

                <td>
                    ${escapeHtml(date)}
                </td>

            `;


            registrationBody.appendChild(row);

        }
    );

}


/* =====================================================
   GET FIRST AVAILABLE VALUE
===================================================== */

function firstValue(
    object,
    keys
) {

    for (const key of keys) {

        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {

            return String(
                object[key]
            );

        }

    }

    return "";
}


/* =====================================================
   EVENTS
===================================================== */

function getEvents(registration) {

    const events =
        registration.Events ??
        registration.events ??
        "";


    if (!events) {
        return "-";
    }


    if (Array.isArray(events)) {

        return events.join(", ");

    }


    if (
        typeof events === "object"
    ) {

        return Object.values(events)
            .filter(
                value =>
                    value !== null &&
                    value !== undefined &&
                    value !== ""
            )
            .join(", ");

    }


    return String(events);

}


/* =====================================================
   MEMBERS
===================================================== */

function getMembers(registration) {

    const members = [];


    /*
     * Participant 2–5.
     *
     * Participant 1 is the team leader and is already
     * shown in the Leader column.
     */

    for (
        let number = 2;
        number <= 5;
        number++
    ) {

        const name =
            firstValue(
                registration,
                [
                    `Member${number}Name`,
                    `member${number}Name`
                ]
            );


        if (name) {

            members.push(name);

        }

    }


    if (members.length === 0) {
        return "-";
    }


    return members.join(", ");

}


/* =====================================================
   DATE VALUE
===================================================== */

function getDateValue(registration) {

    return (
        registration.Timestamp ??
        registration.timestamp ??
        registration.CreatedAt ??
        registration.createdAt ??
        registration.SubmittedAt ??
        registration.submittedAt ??
        ""
    );

}


/* =====================================================
   DATE CONVERSION
===================================================== */

function getRegistrationDate(
    registration
) {

    const value =
        getDateValue(registration);


    if (!value) {
        return 0;
    }


    /*
     * Firebase server timestamps can sometimes be numbers.
     */

    if (
        typeof value === "number"
    ) {

        return value;

    }


    const parsed =
        new Date(value).getTime();


    return Number.isNaN(parsed)
        ? 0
        : parsed;

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(value) {

    if (!value) {
        return "-";
    }


    let date;


    if (
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

        return String(value);

    }


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


/* =====================================================
   SEARCH
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            renderRegistrations();

        }
    );

}


/* =====================================================
   REFRESH
===================================================== */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async () => {

            /*
             * Make sure the user is still authenticated.
             */

            if (!auth.currentUser) {

                window.location.replace(
                    "login.html"
                );

                return;
            }


            refreshBtn.disabled = true;

            const originalText =
                refreshBtn.textContent;

            refreshBtn.textContent =
                "Loading...";


            try {

                await loadRegistrations();

            } finally {

                refreshBtn.disabled = false;

                refreshBtn.textContent =
                    originalText;

            }

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

            logoutBtn.disabled = true;

            logoutBtn.textContent =
                "Logging out...";


            try {

                await signOut(auth);

                /*
                 * onAuthStateChanged will detect that
                 * the user is signed out and redirect
                 * to login.html.
                 */

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                logoutBtn.disabled = false;

                logoutBtn.textContent =
                    "Logout";

                setStatus(
                    "Could not log out. Please try again.",
                    true
                );

            }

        }
    );

}


/* =====================================================
   STATUS MESSAGE
===================================================== */

function setStatus(
    message,
    isError
) {

    if (!statusBox) {
        return;
    }


    statusBox.textContent =
        message;


    statusBox.style.color =
        isError
            ? "#ff9dad"
            : "#86ffc9";

}


/* =====================================================
   HTML ESCAPING
===================================================== */

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
