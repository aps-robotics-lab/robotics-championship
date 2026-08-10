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
   INITIALIZE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getDatabase(app);


/* =========================================================
   ONLY AUTHORIZED AGENT
========================================================= */

const ALLOWED_AGENT_UID =
    "HgWiHPRx9gcXZtDTl0pDCpZlokt2";


/* =========================================================
   ELEMENTS
========================================================= */

const ticketBody =
    document.getElementById("ticketBody");

const search =
    document.getElementById("search");

const statusFilter =
    document.getElementById("statusFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const refreshBtn =
    document.getElementById("refreshBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const status =
    document.getElementById("status");


/* =========================================================
   STATS
========================================================= */

const totalTickets =
    document.getElementById("totalTickets");

const openTickets =
    document.getElementById("openTickets");

const pendingTickets =
    document.getElementById("pendingTickets");

const solvedTickets =
    document.getElementById("solvedTickets");


/* =========================================================
   TICKET MODAL
========================================================= */

const ticketOverlay =
    document.getElementById("ticketOverlay");

const closeTicket =
    document.getElementById("closeTicket");

const ticketDetails =
    document.getElementById("ticketDetails");

const replyForm =
    document.getElementById("replyForm");

const replyTicketId =
    document.getElementById("replyTicketId");

const agentReply =
    document.getElementById("agentReply");

const ticketStatus =
    document.getElementById("ticketStatus");

const replyMessage =
    document.getElementById("replyMessage");


/* =========================================================
   DATA
========================================================= */

let tickets = {};

let firebaseListener = null;


/* =========================================================
   STATUS
========================================================= */

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


/* =========================================================
   ESCAPE HTML
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
   DATE FORMAT
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

        return "-";

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
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(value) {

    const s =
        String(
            value || "Open"
        ).toLowerCase();

    if (s === "solved") {
        return "Solved";
    }

    if (s === "pending") {
        return "Pending";
    }

    return "Open";

}


/* =========================================================
   SEARCH
========================================================= */

function matchesSearch(
    data,
    key
) {

    const query =
        search?.value
            ?.trim()
            .toLowerCase() || "";


    if (!query) {
        return true;
    }


    const searchable = [

        key,

        data.ticketId,

        data.registrationId,

        data.name,

        data.className,

        data.section,

        data.email,

        data.category,

        data.subject,

        data.message,

        data.agentReply,

        data.status

    ]
        .filter(
            value =>
                value !== undefined &&
                value !== null
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

function matchesFilters(data) {

    const selectedStatus =
        statusFilter?.value || "All";

    const selectedCategory =
        categoryFilter?.value || "All";


    const currentStatus =
        normalizeStatus(
            data.status
        );


    if (
        selectedStatus !== "All" &&
        currentStatus !== selectedStatus
    ) {

        return false;

    }


    if (
        selectedCategory !== "All" &&
        String(
            data.category || "Other"
        ) !== selectedCategory
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   RENDER
========================================================= */

function renderTickets() {

    if (!ticketBody) {
        return;
    }


    const allEntries =
        Object.entries(
            tickets
        );


    /* =====================================================
       STATS
    ===================================================== */

    const total =
        allEntries.length;


    const open =
        allEntries.filter(
            ([, data]) =>
                normalizeStatus(
                    data.status
                ) === "Open"
        ).length;


    const pending =
        allEntries.filter(
            ([, data]) =>
                normalizeStatus(
                    data.status
                ) === "Pending"
        ).length;


    const solved =
        allEntries.filter(
            ([, data]) =>
                normalizeStatus(
                    data.status
                ) === "Solved"
        ).length;


    if (totalTickets) {
        totalTickets.textContent =
            total;
    }


    if (openTickets) {
        openTickets.textContent =
            open;
    }


    if (pendingTickets) {
        pendingTickets.textContent =
            pending;
    }


    if (solvedTickets) {
        solvedTickets.textContent =
            solved;
    }


    /* =====================================================
       FILTERED
    ===================================================== */

    const entries =
        allEntries
            .filter(
                ([key, data]) =>
                    matchesSearch(
                        data,
                        key
                    ) &&
                    matchesFilters(data)
            )
            .sort(
                ([, a], [, b]) =>
                    Number(
                        b.createdAt || 0
                    ) -
                    Number(
                        a.createdAt || 0
                    )
            );


    /* =====================================================
       EMPTY
    ===================================================== */

    if (!entries.length) {

        ticketBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:50px;
                    "
                >

                    <div style="font-size:30px;">
                        🎫
                    </div>

                    <div style="margin-top:10px;">
                        No support tickets found.
                    </div>

                </td>

            </tr>

        `;

        return;

    }


    /* =====================================================
       TABLE
    ===================================================== */

    ticketBody.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const currentStatus =
                        normalizeStatus(
                            data.status
                        );


                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${escapeHTML(
                                        data.ticketId ||
                                        key
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        formatDate(
                                            data.createdAt
                                        )
                                    )}
                                </small>

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(
                                        data.name ||
                                        "-"
                                    )}
                                </strong>

                                <small>
                                    Class ${escapeHTML(
                                        data.className ||
                                        "-"
                                    )}
                                    -
                                    ${escapeHTML(
                                        data.section ||
                                        "-"
                                    )}
                                </small>

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(
                                        data.subject ||
                                        "-"
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        data.category ||
                                        "Other"
                                    )}
                                </small>

                            </td>


                            <td>

                                <small>
                                    Registration ID
                                </small>

                                <strong>
                                    ${escapeHTML(
                                        data.registrationId ||
                                        "Not provided"
                                    )}
                                </strong>

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(
                                        data.email ||
                                        "-"
                                    )}
                                </strong>

                            </td>


                            <td>

                                <span
                                    class="
                                        ticket-status
                                        status-${currentStatus.toLowerCase()}
                                    "
                                >
                                    ${currentStatus}
                                </span>

                            </td>


                            <td>

                                <small>
                                    ${escapeHTML(
                                        String(
                                            data.message ||
                                            ""
                                        ).slice(
                                            0,
                                            80
                                        )
                                    )}
                                    ${
                                        String(
                                            data.message ||
                                            ""
                                        ).length > 80
                                            ? "..."
                                            : ""
                                    }
                                </small>

                            </td>


                            <td>

                                <button
                                    class="view-btn"
                                    data-key="${escapeHTML(
                                        key
                                    )}"
                                >
                                    View
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    /* =====================================================
       VIEW BUTTONS
    ===================================================== */

    ticketBody
        .querySelectorAll(
            ".view-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openTicket(
                            button.dataset.key
                        );

                    }
                );

            }
        );

}


/* =========================================================
   LOAD TICKETS
========================================================= */

function loadTickets() {

    showStatus(
        "Connecting to Help Center Firebase..."
    );


    /*
     * IMPORTANT:
     *
     * help.js writes to:
     *
     * /tickets
     *
     */

    const ticketsRef =
        ref(
            db,
            "tickets"
        );


    if (firebaseListener) {

        firebaseListener();

    }


    firebaseListener =
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
                    "HELP FIREBASE READ ERROR:",
                    error
                );


                showStatus(

                    "Unable to load support tickets. Check Firebase Realtime Database Rules.",

                    "error"

                );

            }

        );

}


/* =========================================================
   OPEN TICKET
========================================================= */

function openTicket(key) {

    const data =
        tickets[key];


    if (!data) {
        return;
    }


    if (replyTicketId) {

        replyTicketId.value =
            key;

    }


    if (agentReply) {

        agentReply.value =
            data.agentReply || "";

    }


    if (ticketStatus) {

        ticketStatus.value =
            normalizeStatus(
                data.status
            );

    }


    if (ticketDetails) {

        ticketDetails.innerHTML = `

            <div class="ticket-detail-grid">

                <div>

                    <span>
                        TICKET ID
                    </span>

                    <strong>
                        ${escapeHTML(
                            data.ticketId ||
                            key
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        STATUS
                    </span>

                    <strong>
                        ${escapeHTML(
                            normalizeStatus(
                                data.status
                            )
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        STUDENT
                    </span>

                    <strong>
                        ${escapeHTML(
                            data.name ||
                            "-"
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        CLASS
                    </span>

                    <strong>
                        ${escapeHTML(
                            data.className ||
                            "-"
                        )}
                        -
                        ${escapeHTML(
                            data.section ||
                            "-"
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        EMAIL
                    </span>

                    <strong>
                        ${escapeHTML(
                            data.email ||
                            "-"
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        REGISTRATION ID
                    </span>

                    <strong>
                        ${escapeHTML(
                            data.registrationId ||
                            "Not provided"
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        CATEGORY
                    </span>

                    <strong>
                        ${escapeHTML(
                            data.category ||
                            "Other"
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        CREATED
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                data.createdAt
                            )
                        )}
                    </strong>

                </div>

            </div>


            <div class="ticket-message">

                <h3>
                    SUBJECT
                </h3>

                <p>
                    ${escapeHTML(
                        data.subject ||
                        "-"
                    )}
                </p>

            </div>


            <div class="ticket-message">

                <h3>
                    STUDENT MESSAGE
                </h3>

                <p>
                    ${escapeHTML(
                        data.message ||
                        "-"
                    )}
                </p>

            </div>


            ${
                data.agentReply
                ?
                `

                    <div class="ticket-message">

                        <h3>
                            PREVIOUS AGENT REPLY
                        </h3>

                        <p>
                            ${escapeHTML(
                                data.agentReply
                            )}
                        </p>

                    </div>

                `
                :
                ""
            }

        `;

    }


    replyMessage.textContent =
        "";


    ticketOverlay?.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE TICKET
========================================================= */

function closeTicketModal() {

    ticketOverlay?.classList.add(
        "hidden"
    );

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
   SAVE REPLY
========================================================= */

replyForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const key =
            replyTicketId?.value;


        if (!key) {

            return;

        }


        const data =
            tickets[key];


        if (!data) {

            return;

        }


        const reply =
            agentReply?.value
                ?.trim() || "";


        const newStatus =
            ticketStatus?.value ||
            "Open";


        try {

            if (replyMessage) {

                replyMessage.textContent =
                    "Saving...";

            }


            await update(

                ref(
                    db,
                    `tickets/${key}`
                ),

                {

                    agentReply:
                        reply,

                    status:
                        newStatus,

                    updatedAt:
                        Date.now(),

                    solvedBy:
                        auth.currentUser?.uid ||
                        ALLOWED_AGENT_UID

                }

            );


            if (replyMessage) {

                replyMessage.textContent =
                    "✓ Ticket updated successfully.";

            }


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
                "TICKET UPDATE ERROR:",
                error
            );


            if (replyMessage) {

                replyMessage.textContent =
                    "Unable to update ticket.";

            }


            showStatus(

                "Firebase denied this update. Check your Realtime Database Rules.",

                "error"

            );

        }

    }
);


/* =========================================================
   DELETE TICKET
========================================================= */

async function deleteTicket(key) {

    const data =
        tickets[key];


    if (!data) {
        return;
    }


    const confirmed =
        confirm(

            `DELETE SUPPORT TICKET?\n\n` +
            `Ticket: ${
                data.ticketId || key
            }\n` +
            `Student: ${
                data.name || "-"
            }\n\n` +
            `This cannot be undone.`

        );


    if (!confirmed) {
        return;
    }


    try {

        showStatus(
            "Deleting ticket..."
        );


        await remove(

            ref(
                db,
                `tickets/${key}`
            )

        );


        showStatus(
            "Ticket deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "DELETE TICKET ERROR:",
            error
        );


        showStatus(

            "Firebase denied ticket deletion.",

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
   FILTERS
========================================================= */

statusFilter?.addEventListener(
    "change",
    renderTickets
);


categoryFilter?.addEventListener(
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
                "LOGOUT ERROR:",
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
           UID CHECK
        ----------------------------------------------- */

        if (
            user.uid !==
            ALLOWED_AGENT_UID
        ) {

            alert(
                "Access denied. You are not authorized to access the Agent Portal."
            );


            signOut(auth);

            return;

        }


        /* -----------------------------------------------
           AUTHORIZED
        ----------------------------------------------- */

        showStatus(

            `Agent authenticated: ${
                user.email ||
                user.uid
            }`,

            "success"

        );


        loadTickets();

    }

);
