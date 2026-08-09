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


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getDatabase(app);


/* =========================================================
   AGENT UID LIST
========================================================= */

/*
 * IMPORTANT:
 *
 * These are NOT Admin UIDs.
 *
 * Put ONLY your support-agent Firebase Auth UIDs here.
 */

const AGENT_UIDS = new Set([

    /*
     * Example:
     *
     * "YOUR_AGENT_UID_1",
     * "YOUR_AGENT_UID_2"
     *
     */

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

const agentStatus =
    document.getElementById(
        "agentStatus"
    );


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

const modalSubject =
    document.getElementById(
        "modalSubject"
    );

const modalMessage =
    document.getElementById(
        "modalMessage"
    );

const modalStatus =
    document.getElementById(
        "modalStatus"
    );

const modalReply =
    document.getElementById(
        "modalReply"
    );

const saveTicketBtn =
    document.getElementById(
        "saveTicketBtn"
    );

const modalMessageStatus =
    document.getElementById(
        "modalMessageStatus"
    );


/* =========================================================
   DATA
========================================================= */

let tickets = {};

let selectedTicketId = null;

let ticketListener = null;


/* =========================================================
   STATUS
========================================================= */

function showStatus(
    message,
    type = ""
) {

    if (!agentStatus) {
        return;
    }

    agentStatus.textContent =
        message;

    agentStatus.className =
        `agent-status ${type}`;

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
   SEARCH
========================================================= */

function ticketMatches(
    ticketId,
    ticket
) {

    const query =
        searchInput?.value
            ?.trim()
            .toLowerCase() || "";


    const filter =
        statusFilter?.value ||
        "all";


    if (
        filter !== "all" &&
        ticket.status !== filter
    ) {

        return false;

    }


    if (!query) {
        return true;
    }


    const text = [

        ticketId,

        ticket.ticketId,

        ticket.registrationId,

        ticket.name,

        ticket.className,

        ticket.section,

        ticket.email,

        ticket.category,

        ticket.subject,

        ticket.message,

        ticket.status

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

    if (!ticketList) {
        return;
    }


    const all =
        Object.values(tickets);


    const open =
        all.filter(
            ticket =>
                ticket.status === "Open"
        ).length;


    const progress =
        all.filter(
            ticket =>
                ticket.status === "In Progress"
        ).length;


    const closed =
        all.filter(
            ticket =>
                ticket.status === "Closed"
        ).length;


    totalTickets.textContent =
        all.length;

    openTickets.textContent =
        open;

    progressTickets.textContent =
        progress;

    closedTickets.textContent =
        closed;


    const entries =
        Object.entries(tickets)
            .filter(
                ([id, ticket]) =>
                    ticketMatches(
                        id,
                        ticket
                    )
            )
            .reverse();


    if (!entries.length) {

        ticketList.innerHTML = `

            <div
                style="
                    padding:50px;
                    text-align:center;
                    color:#8fa4bb;
                ">

                No support tickets found.

            </div>

        `;

        return;

    }


    ticketList.innerHTML =
        entries
            .map(
                ([id, ticket]) => {

                    let statusClass =
                        "status-open";


                    if (
                        ticket.status ===
                        "In Progress"
                    ) {

                        statusClass =
                            "status-progress";

                    }


                    if (
                        ticket.status ===
                        "Closed"
                    ) {

                        statusClass =
                            "status-closed";

                    }


                    const registration =
                        ticket.registrationId ||
                        "Not provided";


                    return `

                        <div
                            class="ticket-item"
                            data-ticket="${escapeHTML(id)}">

                            <div
                                class="ticket-top">

                                <span
                                    class="ticket-id">

                                    ${escapeHTML(
                                        ticket.ticketId ||
                                        id
                                    )}

                                </span>


                                <span
                                    class="ticket-status ${statusClass}">

                                    ${escapeHTML(
                                        ticket.status ||
                                        "Open"
                                    )}

                                </span>

                            </div>


                            <h3>

                                ${escapeHTML(
                                    ticket.subject ||
                                    "No subject"
                                )}

                            </h3>


                            <div
                                class="ticket-info">

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
                                    ID:
                                    ${escapeHTML(
                                        registration
                                    )}
                                </span>

                            </div>


                            <div
                                class="ticket-preview">

                                ${escapeHTML(
                                    ticket.message ||
                                    ""
                                )}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    ticketList
        .querySelectorAll(".ticket-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    openTicket(
                        item.dataset.ticket
                    );

                }
            );

        });

}


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


    if (ticketListener) {
        ticketListener();
    }


    ticketListener =
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
                    "Permission denied. Check the Agent Firebase Rules.",
                    "error"
                );

            }

        );

}


/* =========================================================
   OPEN TICKET
========================================================= */

function openTicket(ticketId) {

    const ticket =
        tickets[ticketId];


    if (!ticket) {
        return;
    }


    selectedTicketId =
        ticketId;


    modalTicketId.textContent =
        ticket.ticketId ||
        ticketId;


    modalName.textContent =
        ticket.name ||
        "-";


    modalClass.textContent =
        `${ticket.className || "-"} / ${
            ticket.section || "-"
        }`;


    modalEmail.textContent =
        ticket.email ||
        "-";


    modalRegistration.textContent =
        ticket.registrationId ||
        "Not provided";


    modalSubject.textContent =
        ticket.subject ||
        "-";


    modalMessage.textContent =
        ticket.message ||
        "-";


    modalStatus.value =
        ticket.status ||
        "Open";


    modalReply.value =
        ticket.agentReply ||
        "";


    modalMessageStatus.textContent =
        "";


    ticketOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE
========================================================= */

function closeTicketModal() {

    ticketOverlay.classList.add(
        "hidden"
    );

    selectedTicketId =
        null;

}


closeTicket?.addEventListener(
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

saveTicketBtn?.addEventListener(
    "click",
    async () => {

        if (!selectedTicketId) {
            return;
        }


        const ticket =
            tickets[selectedTicketId];


        if (!ticket) {
            return;
        }


        saveTicketBtn.disabled =
            true;


        modalMessageStatus.textContent =
            "Saving...";


        try {

            const updates = {

                status:
                    modalStatus.value,

                agentReply:
                    modalReply.value.trim(),

                updatedAt:
                    Date.now(),

                updatedBy:
                    auth.currentUser?.uid ||
                    ""

            };


            await update(

                ref(
                    db,
                    `tickets/${selectedTicketId}`
                ),

                updates

            );


            modalMessageStatus.textContent =
                "✓ Ticket updated successfully.";


            showStatus(
                "Ticket updated successfully.",
                "success"
            );


            setTimeout(
                closeTicketModal,
                700
            );


        } catch (error) {

            console.error(error);


            modalMessageStatus.textContent =
                "Unable to save ticket.";


            showStatus(
                "Permission denied while updating ticket.",
                "error"
            );

        } finally {

            saveTicketBtn.disabled =
                false;

        }

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
                "login.html";

        } catch (error) {

            console.error(error);

        }

    }
);


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(

    auth,

    user => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        /*
         * Agent page is intentionally separate
         * from the Admin page.
         */

        if (
            !AGENT_UIDS.has(
                user.uid
            )
        ) {

            alert(
                "Access denied. This account is not a support agent."
            );


            signOut(auth);

            return;

        }


        showStatus(
            `Agent authenticated: ${
                user.email || "Support Agent"
            }`,
            "success"
        );


        loadTickets();

    }

);
