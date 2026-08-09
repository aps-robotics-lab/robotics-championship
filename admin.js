/* =========================================================
   AGENT.JS
   APS ROBOTICS CHAMPIONSHIP 2026
   SUPPORT / HELP CENTER AGENT
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
   SECURITY
   ONLY THIS UID CAN USE AGENT DASHBOARD
========================================================= */

const AGENT_UID =
    "HgWiHPRx9gcXZtDTl0pDCpZlokt2";


/* =========================================================
   FIREBASE HELP PATH
=========================================================

   Your help form should save requests like:

   help
      ├── ticketKey1
      │    ├── registrationId
      │    ├── name
      │    ├── className
      │    ├── section
      │    ├── email
      │    ├── category
      │    ├── subject
      │    ├── message
      │    └── timestamp
      │
      └── ticketKey2

========================================================= */

const HELP_PATH = "help";


/* =========================================================
   ELEMENTS
========================================================= */

const issueBody =
    document.getElementById(
        "issueBody"
    );

const search =
    document.getElementById(
        "search"
    );

const status =
    document.getElementById(
        "status"
    );

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const totalIssues =
    document.getElementById(
        "totalIssues"
    );

const openIssues =
    document.getElementById(
        "openIssues"
    );

const solvedIssues =
    document.getElementById(
        "solvedIssues"
    );


/* =========================================================
   MODAL ELEMENTS
========================================================= */

const issueOverlay =
    document.getElementById(
        "issueOverlay"
    );

const closeIssue =
    document.getElementById(
        "closeIssue"
    );

const cancelIssue =
    document.getElementById(
        "cancelIssue"
    );

const issueForm =
    document.getElementById(
        "issueForm"
    );

const issueKey =
    document.getElementById(
        "issueKey"
    );

const issueStatus =
    document.getElementById(
        "issueStatus"
    );

const issueReply =
    document.getElementById(
        "issueReply"
    );

const issueMessage =
    document.getElementById(
        "issueMessage"
    );

const issueDetails =
    document.getElementById(
        "issueDetails"
    );


/* =========================================================
   DATA
========================================================= */

let tickets = {};

let firebaseListener = null;


/* =========================================================
   STATUS MESSAGE
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
   HTML ESCAPE
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
   GET VALUE
========================================================= */

function valueOf(
    data,
    field,
    fallback = ""
) {

    if (
        data &&
        data[field] !== undefined &&
        data[field] !== null &&
        data[field] !== ""
    ) {

        return data[field];

    }

    return fallback;

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    value
) {

    if (!value) {
        return "—";
    }


    let date;


    /*
     * Firebase timestamp
     */

    if (
        typeof value === "number"
    ) {

        date =
            new Date(value);

    }


    /*
     * Numeric string timestamp
     */

    else if (
        !Number.isNaN(
            Number(value)
        )
    ) {

        date =
            new Date(
                Number(value)
            );

    }


    /*
     * ISO/date string
     */

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
   NORMALIZE STATUS
========================================================= */

function getStatus(
    data
) {

    const current =
        String(
            valueOf(
                data,
                "status",
                "Open"
            )
        )
        .trim()
        .toLowerCase();


    if (
        current === "solved" ||
        current === "closed"
    ) {

        return "Solved";

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

        valueOf(
            data,
            "registrationId"
        ),

        valueOf(
            data,
            "name"
        ),

        valueOf(
            data,
            "className"
        ),

        valueOf(
            data,
            "section"
        ),

        valueOf(
            data,
            "email"
        ),

        valueOf(
            data,
            "category"
        ),

        valueOf(
            data,
            "subject"
        ),

        valueOf(
            data,
            "message"
        ),

        valueOf(
            data,
            "status"
        )

    ]
        .join(" ")
        .toLowerCase();


    return searchable.includes(
        query
    );

}


/* =========================================================
   RENDER DASHBOARD
========================================================= */

function renderTickets() {

    if (!issueBody) {
        return;
    }


    const allEntries =
        Object.entries(
            tickets
        );


    const filteredEntries =
        allEntries
            .filter(
                ([key, data]) =>
                    matchesSearch(
                        data,
                        key
                    )
            )
            .reverse();


    /* =====================================================
       STATISTICS
    ===================================================== */

    const total =
        allEntries.length;


    const solved =
        allEntries.filter(
            ([key, data]) =>
                getStatus(data) === "Solved"
        ).length;


    const open =
        total - solved;


    if (totalIssues) {

        totalIssues.textContent =
            total;

    }


    if (openIssues) {

        openIssues.textContent =
            open;

    }


    if (solvedIssues) {

        solvedIssues.textContent =
            solved;

    }


    /* =====================================================
       EMPTY
    ===================================================== */

    if (
        filteredEntries.length === 0
    ) {

        issueBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:55px 20px;
                    "
                >

                    <div
                        style="
                            font-size:35px;
                        "
                    >
                        🎫
                    </div>

                    <div
                        style="
                            margin-top:10px;
                            font-weight:600;
                        "
                    >
                        No support requests found.
                    </div>

                    <div
                        style="
                            margin-top:5px;
                            opacity:.6;
                            font-size:11px;
                        "
                    >
                        New requests submitted through
                        the Help Center will appear here.
                    </div>

                </td>

            </tr>

        `;

        return;

    }


    /* =====================================================
       CREATE ROWS
    ===================================================== */

    issueBody.innerHTML =
        filteredEntries
            .map(
                ([key, data]) => {

                    const registrationId =
                        valueOf(
                            data,
                            "registrationId",
                            "—"
                        );


                    const name =
                        valueOf(
                            data,
                            "name",
                            "—"
                        );


                    const className =
                        valueOf(
                            data,
                            "className",
                            ""
                        );


                    const section =
                        valueOf(
                            data,
                            "section",
                            ""
                        );


                    const email =
                        valueOf(
                            data,
                            "email",
                            "—"
                        );


                    const category =
                        valueOf(
                            data,
                            "category",
                            "General"
                        );


                    const subject =
                        valueOf(
                            data,
                            "subject",
                            "No subject"
                        );


                    const message =
                        valueOf(
                            data,
                            "message",
                            "—"
                        );


                    const date =
                        valueOf(
                            data,
                            "timestamp",
                            valueOf(
                                data,
                                "createdAt",
                                valueOf(
                                    data,
                                    "created_at",
                                    ""
                                )
                            )
                        );


                    const currentStatus =
                        getStatus(
                            data
                        );


                    const statusClass =
                        currentStatus === "Solved"
                            ? "solved"
                            : "open";


                    return `

                        <tr>

                            <!-- TICKET -->

                            <td>

                                <strong>
                                    ${escapeHTML(
                                        registrationId
                                    )}
                                </strong>

                                <small>
                                    Ticket:
                                    ${escapeHTML(
                                        key
                                    )}
                                </small>

                            </td>


                            <!-- STUDENT -->

                            <td>

                                <strong>
                                    ${escapeHTML(
                                        name
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        className
                                    )}
                                    ${
                                        section
                                            ? " - " +
                                              escapeHTML(
                                                  section
                                              )
                                            : ""
                                    }
                                </small>

                            </td>


                            <!-- CONTACT -->

                            <td>

                                <strong>
                                    ${escapeHTML(
                                        email
                                    )}
                                </strong>

                            </td>


                            <!-- CATEGORY -->

                            <td>

                                <span
                                    class="category-badge"
                                >
                                    ${escapeHTML(
                                        category
                                    )}
                                </span>

                            </td>


                            <!-- ISSUE -->

                            <td>

                                <strong>
                                    ${escapeHTML(
                                        subject
                                    )}
                                </strong>

                                <small
                                    class="message-preview"
                                    title="${escapeHTML(
                                        message
                                    )}"
                                >
                                    ${escapeHTML(
                                        message.length > 80
                                            ? message.substring(
                                                  0,
                                                  80
                                              ) + "..."
                                            : message
                                    )}
                                </small>

                            </td>


                            <!-- STATUS -->

                            <td>

                                <span
                                    class="
                                        issue-status
                                        ${statusClass}
                                    "
                                >
                                    ${escapeHTML(
                                        currentStatus
                                    )}
                                </span>

                            </td>


                            <!-- DATE -->

                            <td>

                                ${escapeHTML(
                                    formatDate(
                                        date
                                    )
                                )}

                            </td>


                            <!-- ACTION -->

                            <td>

                                <button
                                    type="button"
                                    class="solve-btn"
                                    data-key="${escapeHTML(
                                        key
                                    )}"
                                >

                                    ${
                                        currentStatus ===
                                        "Solved"
                                            ? "View"
                                            : "Solve"
                                    }

                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    issueBody
        .querySelectorAll(
            ".solve-btn"
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
        "Connecting to Firebase Help Center..."
    );


    const helpRef =
        ref(
            db,
            HELP_PATH
        );


    /*
     * Remove previous realtime listener.
     */

    if (firebaseListener) {

        firebaseListener();

        firebaseListener = null;

    }


    /*
     * Realtime listener.
     */

    firebaseListener =
        onValue(

            helpRef,

            snapshot => {

                const data =
                    snapshot.val();


                tickets =
                    data &&
                    typeof data === "object"
                        ? data
                        : {};


                console.log(
                    "HELP CENTER DATA:",
                    tickets
                );


                renderTickets();


                showStatus(

                    `${Object.keys(
                        tickets
                    ).length} support request(s) loaded.`,

                    "success"

                );

            },

            error => {

                console.error(
                    "Firebase Help Center read error:",
                    error
                );


                tickets = {};

                renderTickets();


                showStatus(

                    "Firebase could not load help requests. Check your Firebase Database Rules and HELP_PATH.",

                    "error"

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

    const data =
        tickets[key];


    if (!data) {

        showStatus(
            "Ticket no longer exists.",
            "error"
        );

        return;

    }


    /* =====================================================
       BASIC FIELDS
    ===================================================== */

    const registrationId =
        valueOf(
            data,
            "registrationId",
            "—"
        );


    const name =
        valueOf(
            data,
            "name",
            "—"
        );


    const className =
        valueOf(
            data,
            "className",
            "—"
        );


    const section =
        valueOf(
            data,
            "section",
            "—"
        );


    const email =
        valueOf(
            data,
            "email",
            "—"
        );


    const category =
        valueOf(
            data,
            "category",
            "General"
        );


    const subject =
        valueOf(
            data,
            "subject",
            "—"
        );


    const message =
        valueOf(
            data,
            "message",
            "—"
        );


    const date =
        valueOf(
            data,
            "timestamp",
            valueOf(
                data,
                "createdAt",
                ""
            )
        );


    /* =====================================================
       HIDDEN KEY
    ===================================================== */

    if (issueKey) {

        issueKey.value =
            key;

    }


    /* =====================================================
       STATUS
    ===================================================== */

    if (issueStatus) {

        issueStatus.value =
            getStatus(data);

    }


    /* =====================================================
       PREVIOUS REPLY
    ===================================================== */

    if (issueReply) {

        issueReply.value =
            valueOf(
                data,
                "agentReply",
                valueOf(
                    data,
                    "reply",
                    ""
                )
            );

    }


    /* =====================================================
       DETAILS
    ===================================================== */

    if (issueDetails) {

        issueDetails.innerHTML = `

            <div class="detail-grid">

                <div class="detail-item">

                    <span>
                        REGISTRATION ID
                    </span>

                    <strong>
                        ${escapeHTML(
                            registrationId
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        STUDENT NAME
                    </span>

                    <strong>
                        ${escapeHTML(
                            name
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        CLASS
                    </span>

                    <strong>
                        ${escapeHTML(
                            className
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        SECTION
                    </span>

                    <strong>
                        ${escapeHTML(
                            section
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        EMAIL
                    </span>

                    <strong>
                        ${escapeHTML(
                            email
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        CATEGORY
                    </span>

                    <strong>
                        ${escapeHTML(
                            category
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        SUBMITTED
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                date
                            )
                        )}
                    </strong>

                </div>

            </div>


            <div class="detail-block">

                <span>
                    SUBJECT
                </span>

                <h3>
                    ${escapeHTML(
                        subject
                    )}
                </h3>

            </div>


            <div class="detail-block">

                <span>
                    STUDENT MESSAGE
                </span>

                <p>
                    ${escapeHTML(
                        message
                    )}
                </p>

            </div>

        `;

    }


    if (issueMessage) {

        issueMessage.textContent =
            "";

    }


    issueOverlay?.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeTicketModal() {

    issueOverlay?.classList.add(
        "hidden"
    );

}


closeIssue?.addEventListener(
    "click",
    closeTicketModal
);


cancelIssue?.addEventListener(
    "click",
    closeTicketModal
);


issueOverlay?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            issueOverlay
        ) {

            closeTicketModal();

        }

    }
);


/* =========================================================
   SAVE TICKET / AGENT RESPONSE
========================================================= */

issueForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const key =
            issueKey?.value;


        if (!key) {

            return;

        }


        const currentTicket =
            tickets[key];


        if (!currentTicket) {

            if (issueMessage) {

                issueMessage.textContent =
                    "Ticket no longer exists.";

            }

            return;

        }


        const selectedStatus =
            issueStatus?.value ||
            "Open";


        const reply =
            issueReply?.value
                ?.trim() || "";


        try {

            if (issueMessage) {

                issueMessage.textContent =
                    "Saving response...";

            }


            const ticketRef =
                ref(
                    db,
                    `${HELP_PATH}/${key}`
                );


            await update(

                ticketRef,

                {

                    status:
                        selectedStatus,

                    agentReply:
                        reply,

                    repliedAt:
                        Date.now(),

                    repliedBy:
                        AGENT_UID

                }

            );


            if (issueMessage) {

                issueMessage.textContent =
                    "✓ Response saved successfully.";

            }


            showStatus(

                "Support ticket updated successfully.",

                "success"

            );


            setTimeout(
                closeTicketModal,
                700
            );


        } catch (error) {

            console.error(
                "Firebase ticket update error:",
                error
            );


            if (issueMessage) {

                issueMessage.textContent =
                    "Unable to save response.";

            }


            showStatus(

                "Firebase denied this update. Check your Database Rules.",

                "error"

            );

        }

    }
);


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
   AUTHENTICATION
========================================================= */

onAuthStateChanged(

    auth,

    user => {

        /*
         * Not logged in.
         */

        if (!user) {

            window.location.replace(
                "agent-login.html"
            );

            return;

        }


        /*
         * ONLY ONE UID.
         */

        if (
            user.uid !== AGENT_UID
        ) {

            alert(
                "Access denied. This account is not authorized as a support agent."
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


        /*
         * Authorized.
         */

        showStatus(

            `Support agent authenticated: ${
                user.email || user.uid
            }`,

            "success"

        );


        loadTickets();

    }

);
