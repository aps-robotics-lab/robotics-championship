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


/* =====================================================
   FIREBASE CONFIG
===================================================== */

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


/* =====================================================
   FIREBASE
===================================================== */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getDatabase(app);


/* =====================================================
   AUTHORIZED AGENTS
===================================================== */

const ADMIN_UIDS = new Set([

    "crfLkH7qlofZBea5GEwLMEtL92X2",

    "5lBbcuD2BjRdDya7Lo9uRXdBIp92",

    "jd7b5KYmivhYpCJzLyQ005BFmCn2",

    "spzBLVusBfcqCCSmK923QmhmcAN2",

    "1PhsiGhletVZYliDKKKVKV2G9tu2"

]);


/* =====================================================
   ELEMENTS
===================================================== */

const ticketBody =
    document.getElementById(
        "ticketBody"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const agentEmail =
    document.getElementById(
        "agentEmail"
    );

const status =
    document.getElementById(
        "status"
    );


const totalTickets =
    document.getElementById(
        "totalTickets"
    );

const openTickets =
    document.getElementById(
        "openTickets"
    );

const pendingTickets =
    document.getElementById(
        "pendingTickets"
    );

const resolvedTickets =
    document.getElementById(
        "resolvedTickets"
    );


/* =====================================================
   MODAL ELEMENTS
===================================================== */

const ticketOverlay =
    document.getElementById(
        "ticketOverlay"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const cancelModal =
    document.getElementById(
        "cancelModal"
    );

const modalTicketId =
    document.getElementById(
        "modalTicketId"
    );

const modalName =
    document.getElementById(
        "modalName"
    );

const modalEmail =
    document.getElementById(
        "modalEmail"
    );

const modalClass =
    document.getElementById(
        "modalClass"
    );

const modalSection =
    document.getElementById(
        "modalSection"
    );

const modalRegistrationId =
    document.getElementById(
        "modalRegistrationId"
    );

const modalCategory =
    document.getElementById(
        "modalCategory"
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

const modalRemarks =
    document.getElementById(
        "modalRemarks"
    );

const modalMessageStatus =
    document.getElementById(
        "modalMessageStatus"
    );

const saveTicketBtn =
    document.getElementById(
        "saveTicketBtn"
    );

const deleteTicketBtn =
    document.getElementById(
        "deleteTicketBtn"
    );


/* =====================================================
   DATA
===================================================== */

let tickets = {};

let currentTicketKey = null;

let activeFilter = "all";

let unsubscribeTickets = null;


/* =====================================================
   HELPERS
===================================================== */

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


function showStatus(
    message,
    type = ""
) {

    if (!status) {
        return;
    }

    status.textContent =
        message;

    status.className =
        "status " + type;

}


function normalizeStatus(value) {

    const status =
        String(
            value || "Open"
        ).trim().toLowerCase();

    if (status === "pending") {
        return "Pending";
    }

    if (
        status === "resolved" ||
        status === "closed"
    ) {
        return "Resolved";
    }

    return "Open";

}


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

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   SEARCH
===================================================== */

function matchesSearch(
    data,
    key
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

        data.ticketId,

        data.registrationId,

        data.name,

        data.StudentName,

        data.email,

        data.EmailAddress,

        data.className,

        data.Class,

        data.section,

        data.Section,

        data.category,

        data.subject,

        data.message,

        data.status,

        data.remarks

    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return text.includes(query);

}


/* =====================================================
   FILTER
===================================================== */

function matchesFilter(data) {

    if (
        activeFilter === "all"
    ) {
        return true;
    }

    return (
        normalizeStatus(
            data.status ||
            data.ticketStatus
        ) === activeFilter
    );

}


/* =====================================================
   RENDER
===================================================== */

function renderTickets() {

    if (!ticketBody) {
        return;
    }


    const entries =
        Object.entries(
            tickets
        )
            .filter(
                ([key, data]) =>
                    matchesFilter(data) &&
                    matchesSearch(data, key)
            )
            .sort(
                ([, a], [, b]) =>
                    Number(
                        b.createdAt ||
                        b.timestamp ||
                        0
                    ) -
                    Number(
                        a.createdAt ||
                        a.timestamp ||
                        0
                    )
            );


    if (!entries.length) {

        ticketBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="loading-cell">

                    🔎
                    <br><br>

                    No support tickets found.

                </td>

            </tr>

        `;

        return;

    }


    ticketBody.innerHTML =
        entries.map(
            ([key, data]) => {

                const ticketId =
                    data.ticketId ||
                    key;

                const studentName =
                    data.name ||
                    data.StudentName ||
                    "-";

                const email =
                    data.email ||
                    data.EmailAddress ||
                    "-";

                const subject =
                    data.subject ||
                    "-";

                const category =
                    data.category ||
                    "Other";

                const ticketStatus =
                    normalizeStatus(
                        data.status ||
                        data.ticketStatus
                    );

                const date =
                    formatDate(
                        data.createdAt ||
                        data.timestamp ||
                        data.date
                    );


                return `

                    <tr>

                        <td>

                            <span class="ticket-id">

                                ${escapeHTML(
                                    ticketId
                                )}

                            </span>

                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    studentName
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    email
                                )}
                            </small>

                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    subject
                                )}
                            </strong>

                        </td>


                        <td>

                            ${escapeHTML(
                                category
                            )}

                        </td>


                        <td>

                            <span
                                class="status-badge ${ticketStatus.toLowerCase()}">

                                ${
                                    ticketStatus === "Open"
                                        ? "●"
                                        : ticketStatus === "Pending"
                                            ? "●"
                                            : "●"
                                }

                                ${ticketStatus}

                            </span>

                        </td>


                        <td>
                            ${escapeHTML(date)}
                        </td>


                        <td>

                            <button
                                class="view-btn"
                                data-key="${escapeHTML(key)}">

                                View

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    ticketBody
        .querySelectorAll(".view-btn")
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


/* =====================================================
   STATS
===================================================== */

function updateStats() {

    const all =
        Object.values(
            tickets
        );


    const open =
        all.filter(
            ticket =>
                normalizeStatus(
                    ticket.status ||
                    ticket.ticketStatus
                ) === "Open"
        ).length;


    const pending =
        all.filter(
            ticket =>
                normalizeStatus(
                    ticket.status ||
                    ticket.ticketStatus
                ) === "Pending"
        ).length;


    const resolved =
        all.filter(
            ticket =>
                normalizeStatus(
                    ticket.status ||
                    ticket.ticketStatus
                ) === "Resolved"
        ).length;


    totalTickets.textContent =
        all.length;

    openTickets.textContent =
        open;

    pendingTickets.textContent =
        pending;

    resolvedTickets.textContent =
        resolved;

}


/* =====================================================
   LOAD TICKETS
===================================================== */

function loadTickets() {

    showStatus(
        "Connecting to Firebase..."
    );


    const ticketsRef =
        ref(
            db,
            "tickets"
        );


    if (unsubscribeTickets) {

        unsubscribeTickets();

    }


    unsubscribeTickets =
        onValue(

            ticketsRef,

            snapshot => {

                tickets =
                    snapshot.val() || {};

                updateStats();

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
                    "Permission denied. Check Firebase Realtime Database Rules and make sure the signed-in UID is authorized.",
                    "error"
                );

            }

        );

}


/* =====================================================
   OPEN TICKET
===================================================== */

function openTicket(key) {

    const data =
        tickets[key];

    if (!data) {
        return;
    }


    currentTicketKey =
        key;


    modalTicketId.textContent =
        data.ticketId ||
        key;

    modalName.textContent =
        data.name ||
        data.StudentName ||
        "-";

    modalEmail.textContent =
        data.email ||
        data.EmailAddress ||
        "-";

    modalClass.textContent =
        data.className ||
        data.Class ||
        "-";

    modalSection.textContent =
        data.section ||
        data.Section ||
        "-";

    modalRegistrationId.textContent =
        data.registrationId ||
        "Not provided";

    modalCategory.textContent =
        data.category ||
        "Other";

    modalSubject.textContent =
        data.subject ||
        "-";

    modalMessage.textContent =
        data.message ||
        "-";

    modalStatus.value =
        normalizeStatus(
            data.status ||
            data.ticketStatus
        );

    modalRemarks.value =
        data.remarks ||
        data.agentRemarks ||
        "";


    modalMessageStatus.textContent =
        "";


    ticketOverlay.classList.remove(
        "hidden"
    );

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeTicketModal() {

    ticketOverlay.classList.add(
        "hidden"
    );

    currentTicketKey =
        null;

}


closeModal?.addEventListener(
    "click",
    closeTicketModal
);


cancelModal?.addEventListener(
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


/* =====================================================
   SAVE TICKET
===================================================== */

saveTicketBtn?.addEventListener(
    "click",
    async () => {

        if (!currentTicketKey) {
            return;
        }


        const data =
            tickets[
                currentTicketKey
            ];


        if (!data) {
            return;
        }


        try {

            saveTicketBtn.disabled =
                true;

            saveTicketBtn.textContent =
                "Saving...";


            const updatedData = {

                ...data,

                status:
                    modalStatus.value,

                ticketStatus:
                    modalStatus.value,

                remarks:
                    modalRemarks.value.trim(),

                agentRemarks:
                    modalRemarks.value.trim(),

                updatedAt:
                    Date.now(),

                updatedBy:
                    auth.currentUser?.email ||
                    auth.currentUser?.uid ||
                    "Agent"

            };


            await update(

                ref(
                    db,
                    `tickets/${currentTicketKey}`
                ),

                updatedData

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

            console.error(
                "Save ticket error:",
                error
            );

            modalMessageStatus.textContent =
                "Unable to save ticket. Check Firebase Rules.";

            showStatus(
                "Permission denied while updating ticket.",
                "error"
            );

        } finally {

            saveTicketBtn.disabled =
                false;

            saveTicketBtn.textContent =
                "Save Changes";

        }

    }
);


/* =====================================================
   DELETE TICKET
===================================================== */

deleteTicketBtn?.addEventListener(
    "click",
    async () => {

        if (!currentTicketKey) {
            return;
        }


        const data =
            tickets[
                currentTicketKey
            ];


        if (!data) {
            return;
        }


        const ticketId =
            data.ticketId ||
            currentTicketKey;


        const confirmed =
            confirm(

                `Delete this support ticket?\n\n` +
                `Ticket: ${ticketId}\n` +
                `Student: ${
                    data.name ||
                    data.StudentName ||
                    "-"
                }\n\n` +
                `This action cannot be undone.`

            );


        if (!confirmed) {
            return;
        }


        try {

            deleteTicketBtn.disabled =
                true;

            deleteTicketBtn.textContent =
                "Deleting...";


            await remove(

                ref(
                    db,
                    `tickets/${currentTicketKey}`
                )

            );


            closeTicketModal();


            showStatus(
                "Ticket deleted successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "Delete ticket error:",
                error
            );

            showStatus(
                "Permission denied while deleting ticket.",
                "error"
            );

        } finally {

            deleteTicketBtn.disabled =
                false;

            deleteTicketBtn.textContent =
                "Delete Ticket";

        }

    }
);


/* =====================================================
   SEARCH
===================================================== */

searchInput?.addEventListener(
    "input",
    renderTickets
);


/* =====================================================
   FILTER
===================================================== */

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".filter-btn"
                    )
                    .forEach(
                        btn =>
                            btn.classList.remove(
                                "active"
                            )
                    );


                button.classList.add(
                    "active"
                );


                activeFilter =
                    button.dataset.filter ||
                    "all";


                renderTickets();

            }
        );

    });


/* =====================================================
   REFRESH
===================================================== */

refreshBtn?.addEventListener(
    "click",
    () => {

        renderTickets();

        updateStats();

        showStatus(
            "Dashboard refreshed.",
            "success"
        );

    }
);


/* =====================================================
   LOGOUT
===================================================== */

logoutBtn?.addEventListener(
    "click",
    async () => {

        try {

            await signOut(
                auth
            );

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


/* =====================================================
   AUTHENTICATION
===================================================== */

onAuthStateChanged(

    auth,

    user => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        if (
            !ADMIN_UIDS.has(
                user.uid
            )
        ) {

            alert(
                "Access denied. Your account is not authorized as an agent."
            );


            signOut(
                auth
            );

            return;

        }


        agentEmail.textContent =
            user.email ||
            "Authorized Agent";


        showStatus(
            "Authenticated successfully.",
            "success"
        );


        loadTickets();

    }

);
