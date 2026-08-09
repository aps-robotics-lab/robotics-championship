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
   DATA
========================================================= */

let tickets = {};

let selectedTicketKey = null;


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
   DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "-";
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
   STATUS MESSAGE
========================================================= */

function showStatus(
    message,
    error = false
) {

    statusMessage.textContent =
        message;

    statusMessage.style.color =
        error
            ? "#ff5f6d"
            : "#32df9b";

}


/* =========================================================
   MODAL MESSAGE
========================================================= */

function showModalMessage(
    message,
    error = false
) {

    modalMessage.textContent =
        message;

    modalMessage.style.color =
        error
            ? "#ff5f6d"
            : "#32df9b";

}


/* =========================================================
   STATUS BADGE
========================================================= */

function getStatusClass(status) {

    switch (
        String(status || "Open")
    ) {

        case "Closed":
            return "badge-closed";

        case "In Progress":
            return "badge-progress";

        default:
            return "badge-open";

    }

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredTickets() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter.value;


    return Object.entries(
        tickets
    )
        .filter(
            ([key, ticket]) => {

                const status =
                    ticket.status ||
                    "Open";


                if (
                    selectedStatus !==
                    "All" &&
                    status !==
                    selectedStatus
                ) {

                    return false;

                }


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

                    ticket.priority

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return searchable.includes(
                    query
                );

            }
        )
        .sort(
            ([,a], [,b]) =>
                Number(
                    b.createdAt || 0
                ) -
                Number(
                    a.createdAt || 0
                )
        );

}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

    const all =
        Object.values(tickets);


    const open =
        all.filter(
            ticket =>
                (ticket.status || "Open") ===
                "Open"
        ).length;


    const progress =
        all.filter(
            ticket =>
                ticket.status ===
                "In Progress"
        ).length;


    const closed =
        all.filter(
            ticket =>
                ticket.status ===
                "Closed"
        ).length;


    totalTickets.textContent =
        all.length;

    openTickets.textContent =
        open;

    progressTickets.textContent =
        progress;

    closedTickets.textContent =
        closed;

}


/* =========================================================
   RENDER TICKETS
========================================================= */

function renderTickets() {

    updateStats();


    const entries =
        getFilteredTickets();


    if (!entries.length) {

        ticketList.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    🎫
                </div>

                <strong>
                    No support tickets found
                </strong>

                <p>
                    New student requests will appear here.
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
                        ticket.status ||
                        "Open";


                    const priority =
                        ticket.priority ||
                        "Normal";


                    return `

                        <article
                            class="ticket-card"
                            data-key="${escapeHTML(key)}"
                        >

                            <div class="ticket-number">
                                🎫
                            </div>


                            <div class="ticket-main">

                                <div class="ticket-top">

                                    <span class="ticket-subject">
                                        ${escapeHTML(
                                            ticket.subject ||
                                            "No subject"
                                        )}
                                    </span>

                                    <span
                                        class="ticket-badge ${getStatusClass(status)}"
                                    >
                                        ${escapeHTML(status)}
                                    </span>

                                </div>


                                <div class="ticket-preview">

                                    ${escapeHTML(
                                        ticket.message ||
                                        "No message"
                                    )}

                                </div>


                                <div class="ticket-meta">

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
                                        ${escapeHTML(
                                            ticket.category ||
                                            "General"
                                        )}
                                    </span>

                                    <span>
                                        ${escapeHTML(
                                            priority
                                        )}
                                    </span>

                                </div>

                            </div>


                            <div class="ticket-right">

                                <div class="ticket-date">

                                    ${escapeHTML(
                                        formatDate(
                                            ticket.createdAt
                                        )
                                    )}

                                </div>

                            </div>

                        </article>

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
        return;
    }


    selectedTicketKey =
        key;


    modalSubject.textContent =
        ticket.subject ||
        "Support Ticket";


    modalTicketId.textContent =
        `Ticket ID: ${
            ticket.ticketId ||
            key
        }`;


    modalName.textContent =
        ticket.name ||
        "-";


    modalRegistrationId.textContent =
        ticket.registrationId ||
        "Not provided";


    modalClass.textContent =
        ticket.className ||
        "-";


    modalSection.textContent =
        ticket.section ||
        "-";


    modalEmail.textContent =
        ticket.email ||
        "-";


    modalCategory.textContent =
        ticket.category ||
        "-";


    problemSubject.textContent =
        ticket.subject ||
        "-";


    problemMessage.textContent =
        ticket.message ||
        "No problem description provided.";


    modalStatus.textContent =
        ticket.status ||
        "Open";


    modalPriority.textContent =
        ticket.priority ||
        "Normal";


    modalCreated.textContent =
        formatDate(
            ticket.createdAt
        );


    modalUpdated.textContent =
        formatDate(
            ticket.updatedAt
        );


    agentReply.value =
        ticket.agentReply ||
        "";


    showModalMessage("");


    ticketOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeTicket() {

    ticketOverlay.classList.add(
        "hidden"
    );

    selectedTicketKey =
        null;

}


closeModal?.addEventListener(
    "click",
    closeTicket
);


ticketOverlay?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            ticketOverlay
        ) {

            closeTicket();

        }

    }
);


/* =========================================================
   UPDATE TICKET
========================================================= */

async function updateTicket(
    newStatus = null,
    saveReply = false
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


    const updates = {

        updatedAt:
            Date.now(),

        assignedTo:
            auth.currentUser?.uid ||
            AGENT_UID

    };


    if (newStatus) {

        updates.status =
            newStatus;

    }


    if (saveReply) {

        updates.agentReply =
            agentReply.value.trim();

    }


    if (
        newStatus ===
        "Closed"
    ) {

        updates.closedAt =
            Date.now();

        updates.closedBy =
            auth.currentUser?.uid ||
            AGENT_UID;

    }


    if (
        newStatus &&
        newStatus !==
        "Closed"
    ) {

        updates.closedAt =
            null;

        updates.closedBy =
            null;

    }


    try {

        showModalMessage(
            "Saving changes..."
        );


        await update(

            ref(
                db,
                `tickets/${selectedTicketKey}`
            ),

            updates

        );


        showModalMessage(
            "✓ Ticket updated successfully."
        );


        showStatus(
            "Ticket updated successfully."
        );


    } catch (error) {

        console.error(
            "Ticket update error:",
            error
        );


        showModalMessage(
            "Firebase denied this update.",
            true
        );


        showStatus(
            "Unable to update ticket.",
            true
        );

    }

}


/* =========================================================
   BUTTONS
========================================================= */

setOpenBtn?.addEventListener(
    "click",
    () => {

        updateTicket(
            "Open",
            false
        );

    }
);


setProgressBtn?.addEventListener(
    "click",
    () => {

        updateTicket(
            "In Progress",
            false
        );

    }
);


setClosedBtn?.addEventListener(
    "click",
    () => {

        const reply =
            agentReply.value.trim();


        if (!reply) {

            showModalMessage(
                "Please write a response before marking the ticket solved.",
                true
            );

            agentReply.focus();

            return;

        }


        updateTicket(
            "Closed",
            true
        );

    }
);


saveReplyBtn?.addEventListener(
    "click",
    () => {

        const reply =
            agentReply.value.trim();


        if (!reply) {

            showModalMessage(
                "Write a reply first.",
                true
            );

            return;

        }


        updateTicket(
            null,
            true
        );

    }
);


/* =========================================================
   SEARCH
========================================================= */

searchInput?.addEventListener(
    "input",
    renderTickets
);


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
            "Ticket list refreshed."
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
                "Logout error:",
                error
            );

        }

    }
);


/* =========================================================
   LOAD TICKETS
========================================================= */

function loadTickets() {

    showStatus(
        "Connecting to support tickets..."
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

                `${Object.keys(tickets).length} support ticket(s) loaded.`

            );

        },

        error => {

            console.error(
                "Ticket read error:",
                error
            );


            showStatus(
                "Unable to load support tickets. Check Firebase rules.",
                true
            );

        }

    );

}


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
         * ONLY THIS UID IS ALLOWED
         */

        if (
            user.uid !==
            AGENT_UID
        ) {

            alert(
                "Access denied. This account is not an authorized agent."
            );


            signOut(auth);

            return;

        }


        showStatus(
            `Agent authenticated: ${
                user.email ||
                "Authorized Agent"
            }`
        );


        loadTickets();

    }

);
