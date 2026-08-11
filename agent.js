/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   AGENT HELP CENTER
   ---------------------------------------------------------
   DATABASE:

       /agents
       /tickets
       /ticketStatusLookup

   CURRENT AGENT STRUCTURE:

       agents/
           UID: true

   AUTHORIZED EXAMPLE:

       HgWiHPRx9gcXZtDTl0pDCpZlokt2: true

   IMPORTANT:
   This file uses the SAME Firebase project as help.js.
========================================================= */

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
    onValue,
    update,
    get
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

import {
    helpFirebaseConfig
} from "./firebase-config.js";


/* =========================================================
   FIREBASE
========================================================= */

let app = null;
let auth = null;
let db = null;


try {

    app =
        initializeApp(
            helpFirebaseConfig
        );

    auth =
        getAuth(
            app
        );

    db =
        getDatabase(
            app
        );

}

catch (error) {

    console.error(
        "Firebase initialization error:",
        error
    );

}


/* =========================================================
   CONSTANTS
========================================================= */

const TICKETS_PATH =
    "tickets";

const AGENTS_PATH =
    "agents";

const LOOKUP_PATH =
    "ticketStatusLookup";


/* =========================================================
   DATA
========================================================= */

let tickets = {};

let selectedTicketKey =
    null;

let firebaseUnsubscribe =
    null;

let currentAgentProfile =
    null;


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

const modalReferenceId =
    document.getElementById(
        "modalReferenceId"
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

const modalProgress =
    document.getElementById(
        "modalProgress"
    );

const claimTicketBtn =
    document.getElementById(
        "claimTicketBtn"
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

function escapeHTML(
    value
) {

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
   FIRST VALUE
========================================================= */

function firstValue(
    object,
    fields,
    fallback = ""
) {

    if (!object) {

        return fallback;

    }


    for (
        const field of fields
    ) {

        const value =
            object[field];


        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return value;

        }

    }


    return fallback;

}


/* =========================================================
   REGISTRATION ID
========================================================= */

function getRegistrationReference(
    ticket
) {

    return firstValue(

        ticket,

        [

            "registrationId",
            "registrationID",

            "RegistrationId",
            "RegistrationID",

            "regId",
            "regID",

            "registrationRef",
            "registrationReference",

            "referenceId",
            "referenceID",

            "registrationReferenceId",
            "registrationReferenceID",

            "registrationNumber",
            "registrationNo",

            "registration",

            "regNumber",
            "regNo"

        ],

        ""

    );

}


/* =========================================================
   TICKET ID
========================================================= */

function getTicketId(
    ticket,
    key
) {

    return firstValue(

        ticket,

        [
            "ticketId",
            "ticketID",
            "TicketId",
            "TicketID",
            "id"
        ],

        key

    );

}


/* =========================================================
   NAME
========================================================= */

function getName(
    ticket
) {

    return firstValue(

        ticket,

        [
            "name",
            "studentName",
            "student",
            "leaderName",
            "participantName",
            "fullName"
        ],

        "-"

    );

}


/* =========================================================
   CLASS
========================================================= */

function getClassName(
    ticket
) {

    return firstValue(

        ticket,

        [
            "className",
            "studentClass",
            "class",
            "Class"
        ],

        "-"

    );

}


/* =========================================================
   SECTION
========================================================= */

function getSection(
    ticket
) {

    return firstValue(

        ticket,

        [
            "section",
            "studentSection",
            "Section"
        ],

        "-"

    );

}


/* =========================================================
   EMAIL
========================================================= */

function getEmail(
    ticket
) {

    return firstValue(

        ticket,

        [
            "email",
            "emailAddress",
            "Email",
            "EmailAddress"
        ],

        "-"

    );

}


/* =========================================================
   CATEGORY
========================================================= */

function getCategory(
    ticket
) {

    return firstValue(

        ticket,

        [
            "category",
            "issueCategory",
            "type"
        ],

        "General"

    );

}


/* =========================================================
   SUBJECT
========================================================= */

function getSubject(
    ticket
) {

    return firstValue(

        ticket,

        [
            "subject",
            "title",
            "problemSubject"
        ],

        "Support Ticket"

    );

}


/* =========================================================
   MESSAGE
========================================================= */

function getMessage(
    ticket
) {

    return firstValue(

        ticket,

        [
            "message",
            "problemMessage",
            "description",
            "issue",
            "details"
        ],

        "No message provided."

    );

}


/* =========================================================
   STATUS
========================================================= */

function getTicketStatus(
    ticket
) {

    return firstValue(

        ticket,

        [
            "status",
            "ticketStatus"
        ],

        "Waiting for Approval"

    );

}


/* =========================================================
   PRIORITY
========================================================= */

function getPriority(
    ticket
) {

    return firstValue(

        ticket,

        [
            "priority",
            "ticketPriority"
        ],

        "Normal"

    );

}


/* =========================================================
   CREATED
========================================================= */

function getCreatedAt(
    ticket
) {

    return firstValue(

        ticket,

        [
            "createdAt",
            "created_at",
            "timestamp",
            "submittedAt",
            "date"
        ],

        ""

    );

}


/* =========================================================
   UPDATED
========================================================= */

function getUpdatedAt(
    ticket
) {

    return firstValue(

        ticket,

        [
            "updatedAt",
            "updated_at",
            "lastUpdated"
        ],

        getCreatedAt(
            ticket
        )

    );

}


/* =========================================================
   DATE TO NUMBER
========================================================= */

function timestampNumber(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return 0;

    }


    if (
        typeof value === "number"
    ) {

        return value;

    }


    if (
        typeof value === "object" &&
        value.seconds
    ) {

        return Number(
            value.seconds
        ) * 1000;

    }


    const numeric =
        Number(
            value
        );


    if (
        Number.isFinite(
            numeric
        )
    ) {

        return numeric;

    }


    const date =
        new Date(
            value
        );


    return Number.isNaN(
        date.getTime()
    )

        ?

        0

        :

        date.getTime();

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    const timestamp =
        timestampNumber(
            value
        );


    if (!timestamp) {

        return "-";

    }


    return new Date(
        timestamp
    ).toLocaleString(

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
    type = ""
) {

    if (!statusMessage) {

        return;

    }


    statusMessage.textContent =
        message;

    statusMessage.className =
        `status-message ${type}`.trim();

}


/* =========================================================
   AGENT CHECK
=========================================================

   IMPORTANT:

   Your Firebase database currently contains:

       UID: true

   This function supports both:

       UID: true

   AND:

       UID:
         active: true
         name: "Agent"

========================================================= */

async function isAuthorizedAgent(
    user
) {

    if (
        !user ||
        !db
    ) {

        return false;

    }


    try {

        const agentRef =
            ref(
                db,
                `${AGENTS_PATH}/${user.uid}`
            );


        const snapshot =
            await get(
                agentRef
            );


        if (
            !snapshot.exists()
        ) {

            return false;

        }


        const value =
            snapshot.val();


        /* ---------------------------------------------
           CURRENT STRUCTURE

               UID: true
        --------------------------------------------- */

        if (
            value === true
        ) {

            currentAgentProfile = {

                uid:
                    user.uid,

                active:
                    true,

                name:
                    user.email ||
                    "Support Agent",

                role:
                    "Support Agent"

            };


            return true;

        }


        /* ---------------------------------------------
           FUTURE STRUCTURE

               UID:
                 active: true
                 name: ...
        --------------------------------------------- */

        if (
            typeof value === "object" &&
            value !== null
        ) {

            if (
                value.active === true
            ) {

                currentAgentProfile = {

                    uid:
                        user.uid,

                    ...value

                };


                return true;

            }

        }


        return false;

    }

    catch (error) {

        console.error(
            "Agent authorization error:",
            error
        );

        return false;

    }

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
            .toLowerCase() ||
        "";


    if (!query) {

        return true;

    }


    const searchable = [

        key,

        getTicketId(
            ticket,
            key
        ),

        getRegistrationReference(
            ticket
        ),

        getName(
            ticket
        ),

        getClassName(
            ticket
        ),

        getSection(
            ticket
        ),

        getEmail(
            ticket
        ),

        getCategory(
            ticket
        ),

        getSubject(
            ticket
        ),

        getMessage(
            ticket
        ),

        getTicketStatus(
            ticket
        ),

        getPriority(
            ticket
        ),

        ticket.agentReply ||
            "",

        ticket.referenceId ||
            ""

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
        statusFilter?.value ||
        "All";


    if (
        selected === "All"
    ) {

        return true;

    }


    return (
        getTicketStatus(
            ticket
        ) === selected
    );

}


/* =========================================================
   STATS
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
            ticket => {

                const status =
                    getTicketStatus(
                        ticket
                    );

                return (
                    status === "Open" ||
                    status === "Waiting for Approval"
                );

            }
        ).length;


    const progress =
        list.filter(
            ticket =>
                getTicketStatus(
                    ticket
                ) === "In Progress"
        ).length;


    const closed =
        list.filter(
            ticket =>
                getTicketStatus(
                    ticket
                ) === "Closed"
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
   RENDER
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

                return (
                    timestampNumber(
                        getUpdatedAt(
                            b
                        )
                    )

                    -

                    timestampNumber(
                        getUpdatedAt(
                            a
                        )
                    )
                );

            }
        );


    if (
        !entries.length
    ) {

        ticketList.innerHTML = `

            <div class="empty-state">

                <div>🎫</div>

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


                    const ticketId =
                        getTicketId(
                            ticket,
                            key
                        );


                    const reference =
                        ticket.referenceId ||
                        getRegistrationReference(
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
                            data-key="${escapeHTML(
                                key
                            )}"
                        >

                            <div
                                class="ticket-card-top"
                            >

                                <span
                                    class="ticket-number"
                                >
                                    #${escapeHTML(
                                        ticketId
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
                                    getSubject(
                                        ticket
                                    )
                                )}
                            </h3>


                            <p
                                class="ticket-preview"
                            >
                                ${escapeHTML(
                                    getMessage(
                                        ticket
                                    )
                                )}
                            </p>


                            <div
                                class="ticket-card-info"
                            >

                                <span>
                                    👤
                                    ${escapeHTML(
                                        getName(
                                            ticket
                                        )
                                    )}
                                </span>

                                <span>
                                    ✉
                                    ${escapeHTML(
                                        getEmail(
                                            ticket
                                        )
                                    )}
                                </span>

                                <span>
                                    🏷
                                    ${escapeHTML(
                                        getCategory(
                                            ticket
                                        )
                                    )}
                                </span>

                                <span>
                                    ⚡
                                    ${escapeHTML(
                                        priority
                                    )}
                                </span>

                            </div>


                            <div
                                class="ticket-card-bottom"
                            >

                                <span>
                                    Reference:
                                    ${escapeHTML(
                                        reference ||
                                        "Not available"
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        formatDate(
                                            getUpdatedAt(
                                                ticket
                                            )
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

function openTicket(
    key
) {

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


    const ticketId =
        getTicketId(
            ticket,
            key
        );


    const registrationReference =
        getRegistrationReference(
            ticket
        );


    const referenceId =
        ticket.referenceId ||
        "Not available";


    if (modalSubject) {

        modalSubject.textContent =
            getSubject(
                ticket
            );

    }


    if (modalTicketId) {

        modalTicketId.textContent =
            ticketId;

    }


    if (modalName) {

        modalName.textContent =
            getName(
                ticket
            );

    }


    if (modalReferenceId) {

        modalReferenceId.textContent =
            referenceId;

    }


    if (modalRegistrationId) {

        modalRegistrationId.textContent =
            registrationReference ||
            "Not provided";

    }


    if (modalClass) {

        modalClass.textContent =
            getClassName(
                ticket
            );

    }


    if (modalSection) {

        modalSection.textContent =
            getSection(
                ticket
            );

    }


    if (modalEmail) {

        modalEmail.textContent =
            getEmail(
                ticket
            );

    }


    if (modalCategory) {

        modalCategory.textContent =
            getCategory(
                ticket
            );

    }


    if (problemSubject) {

        problemSubject.textContent =
            getSubject(
                ticket
            );

    }


    if (problemMessage) {

        problemMessage.textContent =
            getMessage(
                ticket
            );

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


    const progress =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    ticket.progress || 0
                )
            )
        );


    if (modalProgress) {

        modalProgress.textContent =
            `${progress}%`;

    }


    if (claimTicketBtn) {

        const assignedUid =
            ticket.assignedAgentUid ||
            "";


        if (!assignedUid) {

            claimTicketBtn.textContent =
                "Claim Ticket";

            claimTicketBtn.disabled =
                false;

        }

        else if (
            assignedUid ===
            auth.currentUser?.uid
        ) {

            claimTicketBtn.textContent =
                "✓ Assigned to me";

            claimTicketBtn.disabled =
                true;

        }

        else {

            claimTicketBtn.textContent =
                "Assigned to another agent";

            claimTicketBtn.disabled =
                true;

        }

    }


    if (modalCreated) {

        modalCreated.textContent =
            formatDate(
                getCreatedAt(
                    ticket
                )
            );

    }


    if (modalUpdated) {

        modalUpdated.textContent =
            formatDate(
                getUpdatedAt(
                    ticket
                )
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
        .remove(
            "hidden"
        );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeTicketModal() {

    ticketOverlay
        ?.classList
        .add(
            "hidden"
        );

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

    if (
        !selectedTicketKey
    ) {

        return;

    }


    const ticket =
        tickets[
            selectedTicketKey
        ];


    if (!ticket) {

        return;

    }


    if (
        !auth.currentUser
    ) {

        return;

    }


    try {

        if (modalMessage) {

            modalMessage.textContent =
                "Saving...";

        }


        const now =
            Date.now();


        const next =
            {
                ...ticket,
                ...changes,
                updatedAt:
                    now,
                updatedBy:
                    auth.currentUser.uid
            };


        const referenceId =
            next.referenceId ||
            getTicketId(
                next,
                selectedTicketKey
            );


        let progress =
            Number(
                next.progress
            );


        if (
            !Number.isFinite(
                progress
            )
        ) {

            progress =
                0;

        }


        progress =
            Math.max(
                0,
                Math.min(
                    100,
                    progress
                )
            );


        const status =
            next.status ||
            "Waiting for Approval";


        const lookup = {

            referenceId:
                referenceId,

            status:
                status,

            progress:
                progress,

            statusNote:
                next.statusNote ||
                "Our team will review your request and contact you soon.",

            updatedAt:
                now

        };


        await update(
            ref(db),
            {

                [`${TICKETS_PATH}/${selectedTicketKey}`]:
                    {
                        ...next,
                        progress
                    },

                [`${LOOKUP_PATH}/${referenceId}`]:
                    lookup

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

    }

    catch (error) {

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
   SAVE REPLY
========================================================= */

saveReplyBtn?.addEventListener(
    "click",
    async () => {

        if (
            !selectedTicketKey
        ) {

            return;

        }


        const reply =
            agentReply?.value
                ?.trim() ||
            "";


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
   OPEN
========================================================= */

setOpenBtn?.addEventListener(
    "click",
    async () => {

        await updateTicket(

            {

                status:
                    "Open",

                progress:
                    0,

                statusNote:
                    "Your request is in the support queue. Our team will contact you soon."

            },

            "✓ Ticket marked Open."

        );

    }
);


/* =========================================================
   IN PROGRESS
========================================================= */

setProgressBtn?.addEventListener(
    "click",
    async () => {

        await updateTicket(

            {

                status:
                    "In Progress",

                progress:
                    50,

                statusNote:
                    "A support agent is currently reviewing your request."

            },

            "✓ Ticket marked In Progress."

        );

    }
);


/* =========================================================
   CLOSED
========================================================= */

setClosedBtn?.addEventListener(
    "click",
    async () => {

        await updateTicket(

            {

                status:
                    "Closed",

                progress:
                    100,

                statusNote:
                    "Your support request has been resolved. Please contact the Help Center again if you need further assistance.",

                resolvedAt:
                    Date.now(),

                resolvedBy:
                    auth.currentUser?.uid ||
                    ""

            },

            "✓ Ticket marked as solved."

        );

    }
);


/* =========================================================
   CLAIM TICKET
========================================================= */

claimTicketBtn?.addEventListener(
    "click",
    async () => {

        if (
            !selectedTicketKey ||
            !auth.currentUser
        ) {

            return;

        }


        const ticket =
            tickets[
                selectedTicketKey
            ];


        if (!ticket) {

            return;

        }


        const existingAgent =
            ticket.assignedAgentUid;


        if (
            existingAgent &&
            existingAgent !==
            auth.currentUser.uid
        ) {

            if (modalMessage) {

                modalMessage.textContent =
                    "This ticket is already assigned to another agent.";

            }

            return;

        }


        const agentName =
            currentAgentProfile?.name ||
            auth.currentUser.email ||
            "Support Agent";


        await updateTicket(

            {

                assignedAgentUid:
                    auth.currentUser.uid,

                assignedAgentName:
                    agentName

            },

            "✓ Ticket assigned to you."

        );


        if (claimTicketBtn) {

            claimTicketBtn.textContent =
                "✓ Assigned to me";

            claimTicketBtn.disabled =
                true;

        }

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
            TICKETS_PATH
        );


    if (
        firebaseUnsubscribe
    ) {

        firebaseUnsubscribe();

        firebaseUnsubscribe =
            null;

    }


    firebaseUnsubscribe =
        onValue(

            ticketsRef,

            snapshot => {

                const data =
                    snapshot.val();


                tickets =
                    data &&
                    typeof data === "object"

                        ?

                        data

                        :

                        {};


                console.log(
                    "HELP CENTER TICKETS:",
                    tickets
                );


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


                tickets =
                    {};


                renderTickets();


                showStatus(

                    "Unable to load support tickets. Check Firebase Rules.",

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

        loadTickets();

    }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn?.addEventListener(
    "click",
    async () => {

        try {

            if (
                firebaseUnsubscribe
            ) {

                firebaseUnsubscribe();

                firebaseUnsubscribe =
                    null;

            }


            await signOut(
                auth
            );


            window.location.replace(
                "agent-login.html"
            );

        }

        catch (error) {

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

    async user => {

        /* ---------------------------------------------
           NOT LOGGED IN
        --------------------------------------------- */

        if (!user) {

            window.location.replace(
                "agent-login.html"
            );

            return;

        }


        /* ---------------------------------------------
           CHECK AGENT NODE
        --------------------------------------------- */

        const authorized =
            await isAuthorizedAgent(
                user
            );


        if (!authorized) {

            console.error(
                "Unauthorized agent:",
                user.uid
            );


            showStatus(
                "Access denied. This account is not an authorized support agent.",
                "error"
            );


            await signOut(
                auth
            )
                .catch(
                    () => {}
                );


            window.location.replace(
                "agent-login.html"
            );

            return;

        }


        /* ---------------------------------------------
           AUTHORIZED
        --------------------------------------------- */

        console.log(
            "AUTHORIZED AGENT:",
            user.uid
        );


        console.log(
            "AGENT PROFILE:",
            currentAgentProfile
        );


        const agentName =
            currentAgentProfile?.name ||
            user.email ||
            "Support Agent";


        showStatus(
            `Agent authenticated: ${agentName}`,
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
