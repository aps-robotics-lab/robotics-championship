import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    onValue,
    update
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";


/* =========================================================
   HELP FIREBASE
========================================================= */

const firebaseConfig = {

    apiKey:
        "YOUR_HELP_FIREBASE_API_KEY",

    authDomain:
        "YOUR_HELP_PROJECT.firebaseapp.com",

    databaseURL:
        "YOUR_HELP_DATABASE_URL",

    projectId:
        "YOUR_HELP_PROJECT_ID",

    storageBucket:
        "YOUR_HELP_STORAGE_BUCKET",

    messagingSenderId:
        "YOUR_HELP_SENDER_ID",

    appId:
        "YOUR_HELP_APP_ID"

};


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getDatabase(app);


/* =========================================================
   ONLY AGENT
========================================================= */

const AGENT_UID =
    "HgWiHPRx9gcXZtDTl0pDCpZlokt2";


/* =========================================================
   ELEMENTS
========================================================= */

const body =
    document.getElementById("ticketBody");

const search =
    document.getElementById("search");

const refreshBtn =
    document.getElementById("refreshBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const status =
    document.getElementById("status");

const totalTickets =
    document.getElementById("totalTickets");

const openTickets =
    document.getElementById("openTickets");

const solvedTickets =
    document.getElementById("solvedTickets");


let tickets = {};


/* =========================================================
   STATUS
========================================================= */

function showStatus(
    message,
    type = ""
) {

    status.textContent =
        message;

    status.className =
        "status " + type;

}


/* =========================================================
   ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   DATE / TIME
========================================================= */

function formatDate(value) {

    if (!value) {
        return "—";
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


/* =========================================================
   SEARCH
========================================================= */

function matchesSearch(
    data,
    key
) {

    const query =
        search.value
            .trim()
            .toLowerCase();

    if (!query) {
        return true;
    }

    const text = [

        key,

        data.registrationId,

        data.StudentName,
        data.studentName,

        data.Class,
        data.Section,

        data.EmailAddress,
        data.Email,

        data.Category,
        data.category,

        data.Subject,
        data.subject,

        data.Message,
        data.message,

        data.Status,
        data.status

    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return text.includes(query);
}


/* =========================================================
   RENDER
========================================================= */

function renderTickets() {

    const entries =
        Object.entries(tickets);


    const filtered =
        entries
            .filter(
                ([key, data]) =>
                    matchesSearch(
                        data,
                        key
                    )
            )
            .reverse();


    /* COUNTS */

    const total =
        entries.length;


    const solved =
        entries.filter(
            ([, data]) =>
                String(
                    data.Status ||
                    data.status ||
                    "Open"
                ).toLowerCase() ===
                "solved"
        ).length;


    const open =
        total - solved;


    totalTickets.textContent =
        total;

    openTickets.textContent =
        open;

    solvedTickets.textContent =
        solved;


    /* EMPTY */

    if (!filtered.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:60px;
                    "
                >

                    <div style="
                        font-size:40px;
                    ">
                        🎫
                    </div>

                    <strong>
                        No help requests found
                    </strong>

                    <div style="
                        margin-top:8px;
                        color:#71859c;
                    ">
                        New Help submissions will appear here.
                    </div>

                </td>

            </tr>

        `;

        return;
    }


    /* ROWS */

    body.innerHTML =
        filtered
            .map(
                ([key, data]) => {

                    const id =
                        data.registrationId ||
                        data.RegistrationID ||
                        "—";


                    const name =
                        data.StudentName ||
                        data.studentName ||
                        data.Name ||
                        "—";


                    const className =
                        data.Class ||
                        "—";


                    const section =
                        data.Section ||
                        "—";


                    const email =
                        data.EmailAddress ||
                        data.Email ||
                        "—";


                    const category =
                        data.Category ||
                        data.category ||
                        "General";


                    const subject =
                        data.Subject ||
                        data.subject ||
                        "—";


                    const message =
                        data.Message ||
                        data.message ||
                        "—";


                    const currentStatus =
                        data.Status ||
                        data.status ||
                        "Open";


                    const normalized =
                        String(
                            currentStatus
                        ).toLowerCase();


                    const statusClass =
                        normalized === "solved"
                            ? "solved"
                            : normalized ===
                              "in progress"
                                ? "progress"
                                : "open";


                    const date =
                        data.createdAt ||
                        data.timestamp ||
                        data.created_at;


                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${escapeHTML(id)}
                                </strong>

                                <small>
                                    Ticket:
                                    ${escapeHTML(key)}
                                </small>

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(name)}
                                </strong>

                                <small>
                                    Class
                                    ${escapeHTML(className)}
                                    -
                                    ${escapeHTML(section)}
                                </small>

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(subject)}
                                </strong>

                                <small>
                                    ${escapeHTML(category)}
                                </small>

                            </td>


                            <td>

                                <div class="message-preview">

                                    ${escapeHTML(message)}

                                </div>

                            </td>


                            <td>

                                ${escapeHTML(email)}

                            </td>


                            <td>

                                <span
                                    class="ticket-status ${statusClass}"
                                >

                                    ${escapeHTML(
                                        currentStatus
                                    )}

                                </span>

                            </td>


                            <td>

                                ${escapeHTML(
                                    formatDate(date)
                                )}

                            </td>


                            <td>

                                <div class="action-buttons">

                                    <button
                                        class="progress-btn"
                                        data-key="${escapeHTML(key)}"
                                    >
                                        In Progress
                                    </button>

                                    <button
                                        class="solve-btn"
                                        data-key="${escapeHTML(key)}"
                                    >
                                        ✓ Solve
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    /* BUTTONS */

    body
        .querySelectorAll(".progress-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    updateTicket(
                        button.dataset.key,
                        "In Progress"
                    );

                }
            );

        });


    body
        .querySelectorAll(".solve-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    updateTicket(
                        button.dataset.key,
                        "Solved"
                    );

                }
            );

        });

}


/* =========================================================
   LOAD HELP DATA
========================================================= */

function loadTickets() {

    showStatus(
        "Loading Help requests..."
    );


    /*
     * IMPORTANT
     *
     * Your Help form must save submissions
     * inside:
     *
     * tickets/
     */

    const ticketsRef =
        ref(
            db,
            "tickets"
        );


    onValue(

        ticketsRef,

        snapshot => {

            tickets =
                snapshot.val() || {};


            console.log(
                "FIREBASE HELP DATA:",
                tickets
            );


            renderTickets();


            showStatus(
                `${Object.keys(tickets).length} help request(s) loaded.`,
                "success"
            );

        },

        error => {

            console.error(
                "Firebase error:",
                error
            );


            showStatus(
                "Unable to read Help requests. Check Firebase Rules and database path.",
                "error"
            );

        }

    );

}


/* =========================================================
   UPDATE STATUS
========================================================= */

async function updateTicket(
    key,
    newStatus
) {

    try {

        await update(

            ref(
                db,
                `tickets/${key}`
            ),

            {

                Status:
                    newStatus,

                updatedAt:
                    Date.now(),

                solvedBy:
                    auth.currentUser?.uid || ""

            }

        );


        showStatus(
            `Ticket marked ${newStatus}.`,
            "success"
        );


    } catch (error) {

        console.error(
            error
        );

        showStatus(
            "Unable to update ticket.",
            "error"
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

search?.addEventListener(
    "input",
    renderTickets
);


/* =========================================================
   REFRESH
========================================================= */

refreshBtn?.addEventListener(
    "click",
    renderTickets
);


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn?.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        window.location.replace(
            "agent-login.html"
        );

    }
);


/* =========================================================
   AUTHORIZATION
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            window.location.replace(
                "agent-login.html"
            );

            return;

        }


        if (
            user.uid !== AGENT_UID
        ) {

            alert(
                "Access denied."
            );

            signOut(auth);

            return;

        }


        showStatus(
            `Agent authenticated: ${
                user.email || user.uid
            }`,
            "success"
        );


        loadTickets();

    }
);
