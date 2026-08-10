/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   AGENT HELP CENTER
   ---------------------------------------------------------
   IMPORTANT:
   This file MUST use the Firebase project used by help.js.
   Database path:
       /tickets

   ONLY THIS UID IS ALLOWED:
       HgWiHPRx9gcXZtDTl0pDCpZlokt2
========================================================= */

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
   HELP FIREBASE CONFIG
   =========================================================

   ⚠️ PUT THE CONFIG FROM THE FIREBASE PROJECT USED BY help.js

   DO NOT USE YOUR REGISTRATION FIREBASE HERE IF HELP
   HAS A DIFFERENT FIREBASE PROJECT.
========================================================= */

const firebaseConfig = {

    apiKey: "PUT_HELP_FIREBASE_API_KEY_HERE",

    authDomain: "PUT_HELP_PROJECT.firebaseapp.com",

    databaseURL:
        "PUT_HELP_FIREBASE_DATABASE_URL_HERE",

    projectId:
        "PUT_HELP_PROJECT_ID_HERE",

    storageBucket:
        "PUT_HELP_PROJECT.appspot.com",

    messagingSenderId:
        "PUT_HELP_SENDER_ID_HERE",

    appId:
        "PUT_HELP_APP_ID_HERE"

};


/* =========================================================
   FIREBASE INITIALIZATION
========================================================= */

let app;

let auth;

let db;

try {

    app = initializeApp(firebaseConfig);

    auth = getAuth(app);

    db = getDatabase(app);

} catch (error) {

    console.error(
        "Firebase initialization error:",
        error
    );

}


/* =========================================================
   ONLY AUTHORIZED AGENT
========================================================= */

const ALLOWED_AGENT_UID =
    "HgWiHPRx9gcXZtDTl0pDCpZlokt2";


/* =========================================================
   DATA
========================================================= */

let tickets = {};

let selectedTicketKey = null;

let firebaseUnsubscribe = null;


/* =========================================================
   ELEMENTS
========================================================= */

const ticketList =
    document.getElementById(
        "ticketList"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );


/* =========================================================
   STATS
========================================================= */

const totalTickets =
    document.getElementById(
        "totalTickets"
    );

const openTickets =
    document.getElementById(
        "openTickets"
    );

const progressTickets =
    document.getElementById(
        "progressTickets"
    );

const closedTickets =
    document.getElementById(
        "closedTickets"
    );


/* =========================================================
   MODAL
========================================================= */

const ticketOverlay =
    document.getElementById(
        "ticketOverlay"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const modalSubject =
    document.getElementById(
        "modalSubject"
    );

const modalTicketId =
    document.getElementById(
        "modalTicketId"
    );

const modalName =
    document.getElementById(
        "modalName"
    );

const modalRegistrationId =
    document.getElementById(
        "modalRegistrationId"
    );

const modalClass =
    document.getElementById(
        "modalClass"
    );

const modalSection =
    document.getElementById(
        "modalSection"
    );

const modalEmail =
    document.getElementById(
        "modalEmail"
    );

const modalCategory =
    document.getElementById(
        "modalCategory"
    );

const problemSubject =
    document.getElementById(
        "problemSubject"
    );

const problemMessage =
    document.getElementById(
        "problemMessage"
    );

const modalStatus =
    document.getElementById(
        "modalStatus"
    );

const modalPriority =
    document.getElementById(
        "modalPriority"
    );

const modalCreated =
    document.getElementById(
        "modalCreated"
    );

const modalUpdated =
    document.getElementById(
        "modalUpdated"
    );

const agentReply =
    document.getElementById(
        "agentReply"
    );

const modalMessage =
    document.getElementById(
        "modalMessage"
    );


/* =========================================================
   ACTION BUTTONS
========================================================= */

const setOpenBtn =
    document.getElementById(
        "setOpenBtn"
    );

const setProgressBtn =
    document.getElementById(
        "setProgressBtn"
    );

const saveReplyBtn =
    document.getElementById(
        "saveReplyBtn"
    );

const setClosedBtn =
    document.getElementById(
        "setClosedBtn"
    );


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
   STATUS MESSAGE
========================================================= */

function showStatus(
    message,
    type = ""
) {

    if (!statusMessage) {
        return;
    }

    statusMessage.textContent =
        message;

    statusMessage.className =
        `status-message ${type}`;

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";

    }


    let date;


    if (
        typeof value === "number"
    ) {

        date =
            new Date(value);

    }

    else if (
        typeof value === "object" &&
        value.seconds
    ) {

        date =
            new Date(
                value.seconds * 1000
            );

    }

    else {

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
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   GET STATUS
========================================================= */

function getTicketStatus(ticket) {

    return (
        ticket?.status ||
        "Open"
    );

}


/* =========================================================
   GET PRIORITY
========================================================= */

function getPriority(ticket) {

    return (
        ticket?.priority ||
        "Normal"
    );

}


/* =========================================================
   SEARCH MATCH
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


    const searchable = [

        key,

        ticket.ticketId,

        ticket.registrationId,

        ticket.name,

        ticket.className,

        ticket.section,

        ticket.email,

        ticket.category,

        ticket.subject,

        ticket.message,

        ticket.status,

        ticket.agentReply

    ]
        .filter(
            value =>
                value !== null &&
                value !== undefined
        )
        .join(" ")
        .toLowerCase();


    return searchable.includes(
        query
    );

}


/* =========================================================
   FILTER
========================================================= */

function matchesFilter(
    ticket
) {

    const selected =
        statusFilter?.value || "All";


    if (
        selected === "All"
    ) {

        return true;

    }


    return (
        getTicketStatus(ticket)
        === selected
    );

}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

    const list =
        Object.values(
            tickets
        );


    const total =
        list.length;


    const open =
        list.filter(
            ticket =>
                getTicketStatus(ticket)
                === "Open"
        ).length;


    const progress =
        list.filter(
            ticket =>
                getTicketStatus(ticket)
                === "In Progress"
        ).length;


    const closed =
        list.filter(
            ticket =>
                getTicketStatus(ticket)
                === "Closed"
        ).length;


    if (totalTickets) {

        totalTickets.textContent =
            total;

    }


    if (openTickets) {

        openTickets.textContent =
            open;

    }


    if (progressTickets) {

        progressTickets.textContent =
            progress;

    }


    if (closedTickets) {

        closedTickets.textContent =
            closed;

    }

}


/* =========================================================
   RENDER TICKETS
========================================================= */

function renderTickets() {

    if (!ticketList) {
        return;
    }


    updateStats();


    const entries =
        Object.entries(
            tickets
        )
        .filter(
            ([key, ticket]) =>
                matchesSearch(
                    key,
                    ticket
                )
                &&
                matchesFilter(
                    ticket
                )
        )
        .sort(
            ([, a], [, b]) => {

                const dateA =
                    Number(
                        a.updatedAt ||
                        a.createdAt ||
                        0
                    );

                const dateB =
                    Number(
                        b.updatedAt ||
                        b.createdAt ||
                        0
                    );

                return dateB - dateA;

            }
        );


    if (!entries.length) {

        ticketList.innerHTML = `

            <div class="empty-state">

                <div>
                    🎫
                </div>

                <h3>
                    No tickets found
                </h3>

                <p>
                    There are no support requests
                    matching your search.
                </p>

            </div>

        `;

        return;

    }


    ticketList.innerHTML =
        entries
            .map(
                ([key, ticket]) => {

                    const status =
                        getTicketStatus(
                            ticket
                        );


                    const priority =
                        getPriority(
                            ticket
                        );


                    const statusClass =
                        status
                            .toLowerCase()
                            .replace(
                                /\s+/g,
                                "-"
                            );


                    return `

                        <button
                            type="button"
                            class="ticket-card"
                            data-key="${escapeHTML(key)}"
                        >

                            <div class="ticket-card-top">

                                <span class="ticket-number">

                                    #${escapeHTML(
                                        ticket.ticketId ||
                                        key
                                    )}

                                </span>


                                <span
                                    class="ticket-status ${escapeHTML(
                                        statusClass
                                    )}"
                                >

                                    ${escapeHTML(
                                        status
                                    )}

                                </span>

                            </div>


                            <h3>

                                ${escapeHTML(
                                    ticket.subject ||
                                    "No subject"
                                )}

                            </h3>


                            <p class="ticket-preview">

                                ${escapeHTML(
                                    ticket.message ||
                                    "No message"
                                )}

                            </p>


                            <div class="ticket-card-info">

                                <span>

                                    👤
                                    ${escapeHTML(
                                        ticket.name ||
                                        "-"
                                    )}

                                </span>


                                <span>

                                    ✉
                                    ${escapeHTML(
                                        ticket.email ||
                                        "-"
                                    )}

                                </span>


                                <span>

                                    🏷
                                    ${escapeHTML(
                                        ticket.category ||
                                        "General"
                                    )}

                                </span>


                                <span>

                                    ⚡
                                    ${escapeHTML(
                                        priority
                                    )}

                                </span>

                            </div>


                            <div class="ticket-card-bottom">

                                <span>

                                    ${
                                        ticket.registrationId
                                            ? `Registration:
                                               ${escapeHTML(
                                                   ticket.registrationId
                                               )}`
                                            : "No Registration ID"
                                    }

                                </span>


                                <span>

                                    ${escapeHTML(
                                        formatDate(
                                            ticket.updatedAt ||
                                            ticket.createdAt
                                        )
                                    )}

                                </span>

                            </div>

                        </button>

                    `;

                }
            )
            .join("");


    ticketList
        .querySelectorAll(
            ".ticket-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        openTicket(
                            card.dataset.key
                        );

                    }
                );

            }
        );

}


/* =========================================================
   OPEN TICKET
========================================================= */

function openTicket(key) {

    const ticket =
        tickets[key];


    if (!ticket) {

        showStatus(
            "Ticket could not be found.",
            "error"
        );

        return;

    }


    selectedTicketKey =
        key;


    if (modalSubject) {

        modalSubject.textContent =
            ticket.subject ||
            "Support Ticket";

    }


    if (modalTicketId) {

        modalTicketId.textContent =
            ticket.ticketId ||
            key;

    }


    if (modalName) {

        modalName.textContent =
            ticket.name ||
            "-";

    }


    if (modalRegistrationId) {

        modalRegistrationId.textContent =
            ticket.registrationId ||
            "-";

    }


    if (modalClass) {

        modalClass.textContent =
            ticket.className ||
            "-";

    }


    if (modalSection) {

        modalSection.textContent =
            ticket.section ||
            "-";

    }


    if (modalEmail) {

        modalEmail.textContent =
            ticket.email ||
            "-";

    }


    if (modalCategory) {

        modalCategory.textContent =
            ticket.category ||
            "General";

    }


    if (problemSubject) {

        problemSubject.textContent =
            ticket.subject ||
            "-";

    }


    if (problemMessage) {

        problemMessage.textContent =
            ticket.message ||
            "No message provided.";

    }


    if (modalStatus) {

        modalStatus.textContent =
            getTicketStatus(
                ticket
            );

    }


    if (modalPriority) {

        modalPriority.textContent =
            getPriority(
                ticket
            );

    }


    if (modalCreated) {

        modalCreated.textContent =
            formatDate(
                ticket.createdAt
            );

    }


    if (modalUpdated) {

        modalUpdated.textContent =
            formatDate(
                ticket.updatedAt
            );

    }


    if (agentReply) {

        agentReply.value =
            ticket.agentReply ||
            "";

    }


    if (modalMessage) {

        modalMessage.textContent =
            "";

    }


    ticketOverlay
        ?.classList
        .remove("hidden");

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeTicketModal() {

    ticketOverlay
        ?.classList
        .add("hidden");

    selectedTicketKey =
        null;

}


closeModal?.addEventListener(
    "click",
    closeTicketModal
);


ticketOverlay?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            ticketOverlay
        ) {

            closeTicketModal();

        }

    }
);


/* =========================================================
   UPDATE TICKET
========================================================= */

async function updateTicket(
    changes,
    successMessage
) {

    if (!selectedTicketKey) {

        return;

    }


    const ticket =
        tickets[
            selectedTicketKey
        ];


    if (!ticket) {

        return;

    }


    try {

        if (modalMessage) {

            modalMessage.textContent =
                "Saving...";

        }


        await update(

            ref(
                db,
                `tickets/${selectedTicketKey}`
            ),

            {

                ...changes,

                updatedAt:
                    Date.now(),

                updatedBy:
                    auth.currentUser?.uid ||
                    ALLOWED_AGENT_UID

            }

        );


        if (modalMessage) {

            modalMessage.textContent =
                successMessage;

        }


        showStatus(
            successMessage,
            "success"
        );


    } catch (error) {

        console.error(
            "Ticket update error:",
            error
        );


        if (modalMessage) {

            modalMessage.textContent =
                "Unable to save changes.";

        }


        showStatus(

            "Unable to update ticket. Check Firebase Database Rules.",

            "error"

        );

    }

}


/* =========================================================
   SAVE AGENT REPLY
========================================================= */

saveReplyBtn?.addEventListener(
    "click",
    async () => {

        if (!selectedTicketKey) {

            return;

        }


        const reply =
            agentReply?.value
                ?.trim() || "";


        if (!reply) {

            if (modalMessage) {

                modalMessage.textContent =
                    "Please write a reply first.";

            }

            return;

        }


        await updateTicket(

            {

                agentReply:
                    reply

            },

            "✓ Agent reply saved."

        );

    }
);


/* =========================================================
   SET OPEN
========================================================= */

setOpenBtn?.addEventListener(
    "click",
    async () => {

        await updateTicket(

            {

                status:
                    "Open"

            },

            "✓ Ticket marked Open."

        );

    }
);


/* =========================================================
   SET IN PROGRESS
========================================================= */

setProgressBtn?.addEventListener(
    "click",
    async () => {

        await updateTicket(

            {

                status:
                    "In Progress"

            },

            "✓ Ticket marked In Progress."

        );

    }
);


/* =========================================================
   SET CLOSED
========================================================= */

setClosedBtn?.addEventListener(
    "click",
    async () => {

        await updateTicket(

            {

                status:
                    "Closed",

                resolvedAt:
                    Date.now(),

                resolvedBy:
                    auth.currentUser?.uid ||
                    ALLOWED_AGENT_UID

            },

            "✓ Ticket marked as solved."

        );

    }
);


/* =========================================================
   LOAD TICKETS
========================================================= */

function loadTickets() {

    if (!db) {

        showStatus(
            "Firebase is not initialized.",
            "error"
        );

        return;

    }


    showStatus(
        "Connecting to support database..."
    );


    const ticketsRef =
        ref(
            db,
            "tickets"
        );


    if (firebaseUnsubscribe) {

        firebaseUnsubscribe();

    }


    firebaseUnsubscribe =
        onValue(

            ticketsRef,

            snapshot => {

                tickets =
                    snapshot.val() || {};


                renderTickets();


                showStatus(

                    `${Object.keys(
                        tickets
                    ).length} support ticket(s) loaded.`,

                    "success"

                );

            },

            error => {

                console.error(
                    "TICKETS READ ERROR:",
                    error
                );


                showStatus(

                    "Unable to load support tickets. Check the Help Firebase Database Rules.",

                    "error"

                );

            }

        );

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

statusFilter?.addEventListener(
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
            "Tickets refreshed.",
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

            await signOut(
                auth
            );


            window.location.replace(
                "agent-login.html"
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
   AUTHORIZATION
========================================================= */

onAuthStateChanged(

    auth,

    user => {

        /* -----------------------------------------------
           NOT LOGGED IN
        ----------------------------------------------- */

        if (!user) {

            window.location.replace(
                "agent-login.html"
            );

            return;

        }


        /* -----------------------------------------------
           ONLY ONE AGENT
        ----------------------------------------------- */

        if (
            user.uid !==
            ALLOWED_AGENT_UID
        ) {

            console.error(
                "Unauthorized UID:",
                user.uid
            );


            alert(
                "Access denied. You are not an authorized support agent."
            );


            signOut(
                auth
            )
            .finally(
                () => {

                    window.location.replace(
                        "agent-login.html"
                    );

                }
            );


            return;

        }


        /* -----------------------------------------------
           AUTHORIZED
        ----------------------------------------------- */

        console.log(
            "Authorized support agent:",
            user.uid
        );


        showStatus(
            `Agent authenticated: ${
                user.email ||
                "Authorized Agent"
            }`,
            "success"
        );


        loadTickets();

    }

);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeTicketModal();

        }

    }
);
