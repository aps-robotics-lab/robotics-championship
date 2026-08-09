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
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCVfkLAc5EKDRUoHf4LgVhBFwTNmq2GMI0",

    authDomain:
        "robotics-championship-ab248.firebaseapp.com",

    databaseURL:
        "https://robotics-championship-ab248-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "robotics-championship-ab248",

    storageBucket:
        "robotics-championship-ab248.firebasestorage.app",

    messagingSenderId:
        "521981495733",

    appId:
        "1:521981495733:web:ecec2bc677a4450f19f1fc",

    measurementId:
        "G-NTBPB3MJ0E"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


/* =========================================================
   ONLY THIS AGENT CAN ACCESS AGENT PANEL
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


/* =========================================================
   DATA
========================================================= */

let tickets = {};

let unsubscribe = null;


/* =========================================================
   STATUS
========================================================= */

function showStatus(message, type = "") {

    if (!status) return;

    status.textContent = message;

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
   DATE
========================================================= */

function formatDate(value) {

    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================================
   SEARCH
========================================================= */

function matchesSearch(data, key) {

    const query =
        search?.value
            ?.trim()
            .toLowerCase() || "";

    if (!query) return true;

    const searchable = [

        key,

        data.ticketId,

        data.registrationId,

        data.RegistrationID,

        data.StudentName,

        data.studentName,

        data.Name,

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

    return searchable.includes(query);
}


/* =========================================================
   RENDER
========================================================= */

function renderTickets() {

    if (!body) return;


    const all =
        Object.entries(tickets);


    const filtered =
        all.filter(
            ([key, data]) =>
                matchesSearch(data, key)
        )
        .reverse();


    /* COUNTS */

    const total = all.length;


    const solved =
        all.filter(
            ([, data]) =>
                String(
                    data.Status ||
                    data.status ||
                    ""
                ).toLowerCase() === "solved"
        ).length;


    const open =
        total - solved;


    if (totalTickets)
        totalTickets.textContent = total;


    if (openTickets)
        openTickets.textContent = open;


    if (solvedTickets)
        solvedTickets.textContent = solved;


    /* EMPTY */

    if (!filtered.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="
                        text-align:center;
                        padding:60px 20px;
                    "
                >

                    <div style="
                        font-size:42px;
                        margin-bottom:12px;
                    ">
                        🎫
                    </div>

                    <strong>
                        No help requests found
                    </strong>

                    <div style="
                        margin-top:7px;
                        color:#71859c;
                    ">
                        New requests will appear here automatically.
                    </div>

                </td>

            </tr>

        `;

        return;
    }


    /* ROWS */

    body.innerHTML =
        filtered
            .map(([key, data]) => {

                const registrationId =
                    data.registrationId ||
                    data.RegistrationID ||
                    "—";


                const student =
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


                const normalizedStatus =
                    String(
                        currentStatus
                    ).toLowerCase();


                const statusClass =
                    normalizedStatus === "solved"
                        ? "solved"
                        : normalizedStatus === "in progress"
                            ? "progress"
                            : "open";


                const date =
                    data.timestamp ||
                    data.createdAt ||
                    data.registrationDate ||
                    data.created_at;


                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    registrationId
                                )}
                            </strong>

                            <small>
                                Ticket:
                                ${escapeHTML(key)}
                            </small>

                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(student)}
                            </strong>

                            <small>
                                Class ${escapeHTML(
                                    className
                                )}
                                -
                                ${escapeHTML(
                                    section
                                )}
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

                            <strong>
                                ${escapeHTML(email)}
                            </strong>

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

            })
            .join("");


    /* =====================================================
       IN PROGRESS
    ===================================================== */

    body
        .querySelectorAll(".progress-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    updateTicketStatus(
                        button.dataset.key,
                        "In Progress"
                    );

                }
            );

        });


    /* =====================================================
       SOLVE
    ===================================================== */

    body
        .querySelectorAll(".solve-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    updateTicketStatus(
                        button.dataset.key,
                        "Solved"
                    );

                }
            );

        });

}


/* =========================================================
   LOAD HELP REQUESTS
========================================================= */

function loadTickets() {

    showStatus(
        "Connecting to help requests..."
    );


    /*
     * IMPORTANT:
     * The Help form data must be stored under:
     *
     * tickets/
     */

    const ticketsRef =
        ref(
            db,
            "tickets"
        );


    if (unsubscribe) {
        unsubscribe();
    }


    unsubscribe =
        onValue(

            ticketsRef,

            snapshot => {

                tickets =
                    snapshot.val() || {};


                console.log(
                    "HELP REQUESTS FROM FIREBASE:",
                    tickets
                );


                renderTickets();


                showStatus(

                    `${Object.keys(
                        tickets
                    ).length} help request(s) loaded.`,

                    "success"

                );

            },

            error => {

                console.error(
                    "TICKET READ ERROR:",
                    error
                );


                showStatus(

                    "Firebase denied access to help requests. Check the tickets rules.",

                    "error"

                );

            }

        );

}


/* =========================================================
   UPDATE TICKET
========================================================= */

async function updateTicketStatus(
    key,
    newStatus
) {

    if (!key) return;


    try {

        showStatus(
            `Updating ticket to ${newStatus}...`
        );


        await update(

            ref(
                db,
                `tickets/${key}`
            ),

            {

                Status: newStatus,

                status: newStatus,

                updatedAt:
                    Date.now(),

                solvedBy:
                    auth.currentUser?.uid || ""

            }

        );


        showStatus(

            `Ticket marked as ${newStatus}.`,

            "success"

        );


    } catch (error) {

        console.error(
            "TICKET UPDATE ERROR:",
            error
        );


        showStatus(

            "Unable to update ticket. Check Firebase rules.",

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
    () => {

        renderTickets();

        showStatus(
            "Help dashboard refreshed.",
            "success"
        );

    }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn?.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.replace(
                "agent-login.html"
            );

        } catch (error) {

            console.error(
                error
            );

        }

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


        /*
         * ONLY HgWi... IS AGENT
         */

        if (
            user.uid !== AGENT_UID
        ) {

            alert(
                "Access denied. This account is not authorized as an agent."
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
