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
    update,
    remove
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
   FIREBASE INITIALIZATION
========================================================= */

const app =
    initializeApp(
        firebaseConfig
    );

const auth =
    getAuth(app);

const db =
    getDatabase(app);


/* =========================================================
   AGENT UID LIST
=========================================================

   These are the 5 accounts you supplied.

   This list is ONLY for agent.html.

   It is completely separate from admin.js.
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

const agentIdentity =
    document.getElementById(
        "agentIdentity"
    );

const pageStatus =
    document.getElementById(
        "pageStatus"
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

const closeTicket =
    document.getElementById(
        "closeTicket"
    );

const cancelTicket =
    document.getElementById(
        "cancelTicket"
    );

const saveTicket =
    document.getElementById(
        "saveTicket"
    );

const modalTicketId =
    document.getElementById(
        "modalTicketId"
    );

const modalName =
    document.getElementById(
        "modalName"
    );

const modalClass =
    document.getElementById(
        "modalClass"
    );

const modalEmail =
    document.getElementById(
        "modalEmail"
    );

const modalRegistration =
    document.getElementById(
        "modalRegistration"
    );

const modalCategory =
    document.getElementById(
        "modalCategory"
    );

const modalCreated =
    document.getElementById(
        "modalCreated"
    );

const modalSubject =
    document.getElementById(
        "modalSubject"
    );

const modalMessage =
    document.getElementById(
        "modalMessage"
    );

const agentReply =
    document.getElementById(
        "agentReply"
    );

const modalStatus =
    document.getElementById(
        "modalStatus"
    );

const modalMessageStatus =
    document.getElementById(
        "modalMessageStatus"
    );


/* =========================================================
   DATA
========================================================= */

let tickets = {};

let currentTicketKey =
    null;

let currentUser =
    null;

let ticketsListener =
    null;


/* =========================================================
   STATUS
========================================================= */

function showPageStatus(
    message,
    type = ""
) {

    if (!pageStatus) {
        return;
    }

    pageStatus.textContent =
        message;

    pageStatus.className =
        "page-status " + type;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

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


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "—";
    }


    let date;


    if (
        typeof value ===
        "number"
    ) {

        date =
            new Date(value);

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
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    switch (
        String(
            status || "Open"
        )
    ) {

        case "In Progress":

            return "status-progress";


        case "Closed":

            return "status-closed";


        default:

            return "status-open";

    }

}


/* =========================================================
   FILTER
========================================================= */

function ticketMatches(
    ticket,
    key
) {

    const query =
        searchInput?.value
            ?.trim()
            .toLowerCase() || "";


    const filter =
        statusFilter?.value ||
        "all";


    const ticketStatus =
        ticket.status ||
        "Open";


    if (
        filter !== "all" &&
        ticketStatus !== filter
    ) {

        return false;

    }


    if (!query) {
        return true;
    }


    const text = [

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

        .filter(Boolean)

        .join(" ")

        .toLowerCase();


    return text.includes(
        query
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


    let open =
        0;

    let progress =
        0;

    let closed =
        0;


    list.forEach(ticket => {

        const status =
            ticket.status ||
            "Open";


        if (
            status === "Closed"
        ) {

            closed++;

        }

        else if (
            status === "In Progress"
        ) {

            progress++;

        }

        else {

            open++;

        }

    });


    if (totalTickets) {

        totalTickets.textContent =
            list.length;

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
   RENDER
========================================================= */

function renderTickets() {

    updateStats();


    if (!ticketList) {
        return;
    }


    const entries =
        Object.entries(
            tickets
        )

        .filter(
            ([key, ticket]) =>
                ticketMatches(
                    ticket,
                    key
                )
        )

        .sort(
            (a, b) => {

                const aTime =
                    Number(
                        a[1].createdAt ||
                        0
                    );

                const bTime =
                    Number(
                        b[1].createdAt ||
                        0
                    );

                return bTime - aTime;

            }
        );


    if (!entries.length) {

        ticketList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🎫
                </div>

                <strong>
                    No support tickets found
                </strong>

                <p style="margin-top:6px;font-size:11px;">
                    Try changing your search or filter.
                </p>

            </div>

        `;

        return;

    }


    ticketList.innerHTML =
        entries.map(
            ([key, ticket]) => {

                const status =
                    ticket.status ||
                    "Open";


                const preview =
                    ticket.message ||
                    "No message";


                return `

                    <article
                        class="ticket-card"
                        data-key="${escapeHTML(key)}">

                        <div class="ticket-top">

                            <div>

                                <div class="ticket-id">
                                    ${escapeHTML(
                                        ticket.ticketId ||
                                        key
                                    )}
                                </div>

                                <div class="ticket-subject">
                                    ${escapeHTML(
                                        ticket.subject ||
                                        "No subject"
                                    )}
                                </div>

                            </div>


                            <span
                                class="status-badge ${getStatusClass(status)}">

                                ${escapeHTML(status)}

                            </span>

                        </div>


                        <div class="ticket-meta">

                            <span>
                                👤
                                ${escapeHTML(
                                    ticket.name ||
                                    "Unknown"
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
                                📁
                                ${escapeHTML(
                                    ticket.category ||
                                    "Other"
                                )}
                            </span>

                            <span>
                                🕒
                                ${escapeHTML(
                                    formatDate(
                                        ticket.createdAt
                                    )
                                )}
                            </span>

                        </div>


                        <div class="ticket-preview">

                            ${escapeHTML(preview)}

                        </div>

                    </article>

                `;

            }
        ).join("");


    ticketList
        .querySelectorAll(
            ".ticket-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    openTicket(
                        card.dataset.key
                    );

                }
            );

        });

}


/* =========================================================
   LOAD TICKETS
========================================================= */

function loadTickets() {

    showPageStatus(
        "Connecting to Firebase..."
    );


    const ticketsRef =
        ref(
            db,
            "tickets"
        );


    if (ticketsListener) {

        ticketsListener();

        ticketsListener =
            null;

    }


    ticketsListener =
        onValue(

            ticketsRef,

            snapshot => {

                tickets =
                    snapshot.val() ||
                    {};

                renderTickets();


                showPageStatus(
                    `${Object.keys(tickets).length} ticket(s) loaded.`,
                    ""
                );

            },


            error => {

                console.error(
                    "Ticket Firebase error:",
                    error
                );


                showPageStatus(
                    "Unable to load tickets. Check your Firebase Rules.",
                    "error"
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


    currentTicketKey =
        key;


    modalTicketId.textContent =
        ticket.ticketId ||
        key;


    modalName.textContent =
        ticket.name ||
        "-";


    modalClass.textContent =
        `${ticket.className || "-"} / ${ticket.section || "-"}`;


    modalEmail.textContent =
        ticket.email ||
        "-";


    modalRegistration.textContent =
        ticket.registrationId ||
        "Not provided";


    modalCategory.textContent =
        ticket.category ||
        "Other";


    modalCreated.textContent =
        formatDate(
            ticket.createdAt
        );


    modalSubject.textContent =
        ticket.subject ||
        "No subject";


    modalMessage.textContent =
        ticket.message ||
        "No message";


    agentReply.value =
        ticket.agentReply ||
        "";


    modalStatus.value =
        ticket.status ||
        "Open";


    modalMessageStatus.textContent =
        "";


    ticketOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE TICKET
========================================================= */

function closeTicketModal() {

    ticketOverlay.classList.add(
        "hidden"
    );

    currentTicketKey =
        null;

}


closeTicket?.addEventListener(
    "click",
    closeTicketModal
);


cancelTicket?.addEventListener(
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
   SAVE TICKET
========================================================= */

saveTicket?.addEventListener(
    "click",
    async () => {

        if (!currentTicketKey) {
            return;
        }


        if (
            !currentUser
        ) {

            modalMessageStatus.textContent =
                "Authentication expired. Please log in again.";

            modalMessageStatus.className =
                "modal-status error";

            return;

        }


        const status =
            modalStatus.value;


        const reply =
            agentReply.value.trim();


        saveTicket.disabled =
            true;


        modalMessageStatus.className =
            "modal-status";


        modalMessageStatus.textContent =
            "Saving ticket...";


        try {

            const updates = {

                status:
                    status,

                agentReply:
                    reply,

                updatedAt:
                    Date.now(),

                assignedTo:
                    currentUser.uid

            };


            if (
                status === "Closed"
            ) {

                updates.closedAt =
                    Date.now();

                updates.closedBy =
                    currentUser.uid;

            }

            else {

                updates.closedAt =
                    "";

                updates.closedBy =
                    "";

            }


            await update(

                ref(
                    db,
                    `tickets/${currentTicketKey}`
                ),

                updates

            );


            modalMessageStatus.textContent =
                "✓ Ticket updated successfully.";

            modalMessageStatus.className =
                "modal-status";


            showPageStatus(
                "Ticket updated successfully."
            );


            setTimeout(
                closeTicketModal,
                700
            );

        }

        catch (error) {

            console.error(
                "Ticket update error:",
                error
            );


            modalMessageStatus.textContent =
                "Unable to update ticket. Check Firebase Rules.";

            modalMessageStatus.className =
                "modal-status error";

        }

        finally {

            saveTicket.disabled =
                false;

        }

    }
);


/* =========================================================
   DELETE TICKET
=========================================================

   Not shown as a button in the UI by default.

   Function retained for future use.
========================================================= */

async function deleteTicket(key) {

    const ticket =
        tickets[key];


    if (!ticket) {
        return;
    }


    const confirmed =
        confirm(

            `Delete ticket ${ticket.ticketId || key}?\n\n` +
            `This action cannot be undone.`

        );


    if (!confirmed) {
        return;
    }


    try {

        await remove(

            ref(
                db,
                `tickets/${key}`
            )

        );


        showPageStatus(
            "Ticket deleted successfully."
        );

    }

    catch (error) {

        console.error(
            error
        );


        showPageStatus(
            "Unable to delete ticket.",
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

        showPageStatus(
            "Dashboard refreshed."
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


            window.location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                error
            );

        }

    }
);


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(

    auth,

    user => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        /* ================================================
           AGENT ONLY
        ================================================ */

        if (
            !AGENT_UIDS.has(
                user.uid
            )
        ) {

            alert(
                "Access denied. This account is not an authorized support agent."
            );


            signOut(
                auth
            );


            return;

        }


        currentUser =
            user;


        agentIdentity.textContent =
            user.email ||
            "Authorized Agent";


        showPageStatus(
            "Agent authenticated."
        );


        loadTickets();

    }

);
