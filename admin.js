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
   FIREBASE INITIALIZATION
===================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


/* =====================================================
   ELEMENTS
===================================================== */

const loginCard =
    document.getElementById("loginCard");

const dashboard =
    document.getElementById("dashboard");

const loginError =
    document.getElementById("loginError");

const logoutBtn =
    document.getElementById("logoutBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const searchInput =
    document.getElementById("search");

const registrationBody =
    document.getElementById("registrationBody");

const statusBox =
    document.getElementById("status");


/* =====================================================
   DATA
===================================================== */

let registrations = [];


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");

        return;
    }

    console.log(
        "Authenticated admin:",
        user.email
    );

    loginCard?.classList.add("hidden");

    dashboard?.classList.remove("hidden");

    await loadRegistrations();

});


/* =====================================================
   LOAD REGISTRATIONS
===================================================== */

async function loadRegistrations() {

    setStatus("Loading registrations...", false);

    try {

        const registrationsRef =
            ref(db, "registrations");

        const snapshot =
            await get(registrationsRef);

        registrations = [];

        if (snapshot.exists()) {

            const data =
                snapshot.val();

            Object.entries(data).forEach(
                ([key, value]) => {

                    registrations.push({
                        firebaseKey: key,
                        ...value
                    });

                }
            );

        }

        registrations.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.Timestamp ||
                        a.timestamp ||
                        a.createdAt ||
                        0
                    ).getTime();

                const dateB =
                    new Date(
                        b.Timestamp ||
                        b.timestamp ||
                        b.createdAt ||
                        0
                    ).getTime();

                return dateB - dateA;
            }
        );

        renderRegistrations();

        setStatus(
            `${registrations.length} registration(s) found.`,
            false
        );

    } catch (error) {

        console.error(
            "Database error:",
            error
        );

        if (error.code === "PERMISSION_DENIED") {

            setStatus(
                "Database permission denied. Check Firebase Realtime Database Rules.",
                true
            );

        } else {

            setStatus(
                error.message ||
                "Could not load registrations.",
                true
            );
        }

    }

}


/* =====================================================
   RENDER
===================================================== */

function renderRegistrations() {

    if (!registrationBody) {
        return;
    }

    const query =
        searchInput?.value
            ?.trim()
            .toLowerCase() || "";

    const filtered =
        registrations.filter(item => {

            if (!query) {
                return true;
            }

            return JSON.stringify(item)
                .toLowerCase()
                .includes(query);

        });


    registrationBody.innerHTML = "";


    if (!filtered.length) {

        registrationBody.innerHTML = `
            <tr>
                <td colspan="11"
                    style="text-align:center;padding:30px;">
                    No registrations found.
                </td>
            </tr>
        `;

        return;
    }


    filtered.forEach(item => {

        const row =
            document.createElement("tr");

        const members =
            getMembers(item);

        row.innerHTML = `

            <td>
                ${escapeHtml(
                    item.RegistrationId ||
                    item.registrationId ||
                    item.firebaseKey ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.StudentName ||
                    item.studentName ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.TeamName ||
                    item.teamName ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    String(
                        item.TeamSize ||
                        item.teamSize ||
                        "-"
                    )
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.Class ||
                    item.studentClass ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.Section ||
                    item.studentSection ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.MobileNumber ||
                    item.mobileNumber ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.EmailAddress ||
                    item.emailAddress ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    formatEvents(item.Events)
                )}
            </td>

            <td>
                ${escapeHtml(
                    members
                )}
            </td>

            <td>
                ${escapeHtml(
                    formatDate(
                        item.Timestamp ||
                        item.timestamp ||
                        item.createdAt
                    )
                )}
            </td>
        `;

        registrationBody.appendChild(row);

    });

}


/* =====================================================
   MEMBERS
===================================================== */

function getMembers(item) {

    const names = [];

    for (let i = 2; i <= 5; i++) {

        const name =
            item[`Member${i}Name`];

        if (name) {
            names.push(name);
        }
    }

    return names.length
        ? names.join(", ")
        : "-";
}


/* =====================================================
   EVENTS
===================================================== */

function formatEvents(events) {

    if (!events) {
        return "-";
    }

    if (Array.isArray(events)) {
        return events.join(", ");
    }

    if (typeof events === "object") {

        return Object.values(events)
            .filter(Boolean)
            .join(", ");
    }

    return String(events);
}


/* =====================================================
   DATE
===================================================== */

function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
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
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================
   STATUS
===================================================== */

function setStatus(message, error = false) {

    if (!statusBox) {
        return;
    }

    statusBox.textContent = message;

    statusBox.style.color =
        error
            ? "#ff9dad"
            : "#86ffc9";
}


/* =====================================================
   SEARCH
===================================================== */

searchInput?.addEventListener(
    "input",
    renderRegistrations
);


/* =====================================================
   REFRESH
===================================================== */

refreshBtn?.addEventListener(
    "click",
    loadRegistrations
);


/* =====================================================
   LOGOUT
===================================================== */

logoutBtn?.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.replace(
                "login.html"
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);
