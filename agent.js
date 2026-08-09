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
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyCVfkLAc5EKDRUoHf4LgVhBFwTNmq2GMI0",

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


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getDatabase(app);


/* =========================================================
   SUPPORT AGENTS
========================================================= */

const AGENT_UIDS = new Set([

    "crfLkH7qlofZBea5GEwLMEtL92X2",

    "5lBbcuD2BjRdDya7Lo9uRXdBIp92",

    "jd7b5KYmivhYpCJzLyQ005BFmCn2",

    "spzBLVusBfcqCCSmK923QmhmcAN2",

    "1PhsiGhletVZYliDKKKVKV2G9tu2"

]);


/* =========================================================
   ELEMENTS
========================================================= */

const logoutBtn =
    document.getElementById("logoutBtn");

const status =
    document.getElementById("status");

const ticketBody =
    document.getElementById("ticketBody");

const searchInput =
    document.getElementById("search");

const filterSelect =
    document.getElementById("ticketFilter");

const refreshBtn =
    document.getElementById("refreshBtn");


/* =========================================================
   DATA
========================================================= */

let tickets = {};

let currentUser = null;


/* =========================================================
   STATUS
========================================================= */

function showStatus(
    message,
    type = ""
) {

    if (!status) return;

    status.textContent =
        message;

    status.className =
        "status " + type;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            window.location.href =
                "agent-login.html";

            return;

        }


        console.log(
            "Logged-in Agent UID:",
            user.uid
        );


        /* =============================================
           AGENT CHECK
        ============================================= */

        if (!AGENT_UIDS.has(user.uid)) {

            console.error(
                "Unauthorized Agent UID:",
                user.uid
            );

            alert(
                "Access denied. This account is not a support agent."
            );

            signOut(auth);

            return;

        }


        /* =============================================
           AUTHORIZED
        ============================================= */

        currentUser =
            user;


        showStatus(
            `Agent authenticated: ${
                user.email || "Support Agent"
            }`,
            "success"
        );


        loadTickets();

    }
);


/* =========================================================
   LOAD TICKETS
========================================================= */

function loadTickets() {

    showStatus(
        "Connecting to Firebase..."
    );


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


            renderTickets();


            showStatus(
                `${Object.keys(tickets).length} ticket(s) loaded.`,
                "success"
            );

        },

        error => {

            console.error(
                "Firebase ticket error:",
                error
            );


            showStatus(

                "Firebase denied ticket access. Check the tickets Rules and Agent UID.",

                "error"

            );

        }

    );

}


/* =========================================================
   SEARCH
========================================================= */

function matchesSearch(
    key,
    ticket
) {

    const query =
        searchInput?.value
            ?.trim()
            .toLowerCase() || "";


    if (!query) {
        return true;
    }


    const text = [

        key,

        ticket.ticketId,

        ticket.registrationId,

        ticket.name,

        ticket.StudentName,

        ticket.email,

        ticket.EmailAddress,

        ticket.subject,

        ticket.message,

        ticket.category,

        ticket.status

    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


    return text.includes(query);

}


/* =========================================================
   FILTER
========================================================= */

function matchesFilter(ticket) {

    const filter =
        filterSelect?.value || "all";


    if (
        filter === "all"
    ) {

        return true;

    }


    return String(
        ticket.status || ""
    )
        .toLowerCase() ===
        filter.toLowerCase();

}


/* =========================================================
   RENDER TICKETS
========================================================= */

function renderTickets() {

    if (!ticketBody) {
        return;
    }


    const entries =
        Object.entries(
            tickets
        )
        .filter(
            ([key, ticket]) =>
                matchesSearch(
                    key,
                    ticket
                ) &&
                matchesFilter(ticket)
        )
        .reverse();


    if (!entries.length) {

        ticketBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-state">

                    <div class="empty-icon">
                        🎫
                    </div>

                    <strong>
                        No tickets found
                    </strong>

                    <small>
                        There are no support tickets matching your search.
                    </small>

                </td>

            </tr>

        `;

        return;

    }


    ticketBody.innerHTML =
        entries.map(
            ([key, ticket]) => {

                const ticketId =
                    ticket.ticketId ||
                    key;


                const student =
                    ticket.name ||
                    ticket.StudentName ||
                    "-";


                const email =
                    ticket.email ||
                    ticket.EmailAddress ||
                    "-";


                const registrationId =
                    ticket.registrationId ||
                    "Not provided";


                const ticketStatus =
                    ticket.status ||
                    "Open";


                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(ticketId)}
                            </strong>

                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(student)}
                            </strong>

                            <small>
                                ${escapeHTML(email)}
                            </small>

                        </td>


                        <td>

                            ${escapeHTML(
                                registrationId
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                ticket.category || "Other"
                            )}

                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    ticket.subject || "-"
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    ticket.message || ""
                                )}
                            </small>

                        </td>


                        <td>

                            <span
                                class="ticket-status ${String(
                                    ticketStatus
                                ).toLowerCase()}">

                                ${escapeHTML(
                                    ticketStatus
                                )}

                            </span>

                        </td>


                        <td>

                            ${escapeHTML(
                                ticket.agentReply || "—"
                            )}

                        </td>


                        <td>

                            <button
                                class="open-ticket"
                                data-key="${escapeHTML(key)}">

                                Open

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    ticketBody
        .querySelectorAll(
            ".open-ticket"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openTicket(
                        button.dataset.key
                    );

                }
            );

        });

}


/* =========================================================
   OPEN TICKET
========================================================= */

function openTicket(key) {

    const ticket =
        tickets[key];


    if (!ticket) {
        return;
    }


    const reply =
        prompt(

            `Support Ticket: ${
                ticket.ticketId || key
            }\n\n` +

            `Student: ${
                ticket.name ||
                ticket.StudentName ||
                "-"
            }\n\n` +

            `Subject: ${
                ticket.subject || "-"
            }\n\n` +

            `Message:\n${
                ticket.message || "-"
            }\n\n` +

            `Enter agent reply:`

        );


    if (
        reply === null
    ) {

        return;

    }


    updateTicket(
        key,
        reply
    );

}


/* =========================================================
   UPDATE TICKET
========================================================= */

async function updateTicket(
    key,
    reply
) {

    try {

        showStatus(
            "Saving ticket response..."
        );


        await update(

            ref(
                db,
                `tickets/${key}`
            ),

            {

                agentReply:
                    reply.trim(),

                status:
                    "Answered",

                updatedAt:
                    Date.now(),

                handledBy:
                    currentUser?.email ||
                    currentUser?.uid ||
                    "Support Agent"

            }

        );


        showStatus(
            "Ticket updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Ticket update error:",
            error
        );


        showStatus(

            "Unable to update ticket. Check Firebase Rules.",

            "error"

        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

searchInput?.addEventListener(
    "input",
    renderTickets
);


/* =========================================================
   FILTER
========================================================= */

filterSelect?.addEventListener(
    "change",
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
            "Ticket list refreshed.",
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

            window.location.href =
                "agent-login.html";

        } catch (error) {

            console.error(
                error
            );

        }

    }
);
