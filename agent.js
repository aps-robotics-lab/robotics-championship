import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    getDatabase,
    ref,
    onValue,
    update,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";



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


const database =
    getDatabase(app);



/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen =
    document.getElementById("loginScreen");


const dashboardScreen =
    document.getElementById("dashboardScreen");


const loginForm =
    document.getElementById("loginForm");


const agentEmail =
    document.getElementById("agentEmail");


const agentPassword =
    document.getElementById("agentPassword");


const loginStatus =
    document.getElementById("loginStatus");


const loginBtn =
    document.getElementById("loginBtn");


const logoutBtn =
    document.getElementById("logoutBtn");


const agentName =
    document.getElementById("agentName");


const ticketBody =
    document.getElementById("ticketBody");


const searchInput =
    document.getElementById("searchInput");


const statusFilter =
    document.getElementById("statusFilter");


const refreshBtn =
    document.getElementById("refreshBtn");


const dashboardStatus =
    document.getElementById("dashboardStatus");


const totalCount =
    document.getElementById("totalCount");


const openCount =
    document.getElementById("openCount");


const progressCount =
    document.getElementById("progressCount");


const resolvedCount =
    document.getElementById("resolvedCount");


const ticketModal =
    document.getElementById("ticketModal");


const modalContent =
    document.getElementById("modalContent");


const closeModal =
    document.getElementById("closeModal");



/* =========================================================
   DATA
========================================================= */

let tickets = {};

let currentUser = null;



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")

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
   LOGIN STATUS
========================================================= */

function showLoginStatus(message) {

    loginStatus.textContent =
        message;


    loginStatus.classList.add(
        "show"
    );

}


function clearLoginStatus() {

    loginStatus.textContent =
        "";


    loginStatus.classList.remove(
        "show"
    );

}



/* =========================================================
   LOGIN
========================================================= */

loginForm?.addEventListener(
    "submit",

    async function(event) {

        event.preventDefault();

        clearLoginStatus();


        const email =
            agentEmail.value
            .trim()
            .toLowerCase();


        const password =
            agentPassword.value;


        if (!email || !password) {

            showLoginStatus(
                "Please enter your email and password."
            );

            return;

        }


        loginBtn.disabled =
            true;


        loginBtn.textContent =
            "Signing in...";


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        } catch (error) {

            console.error(
                error
            );


            let message =
                "Unable to sign in.";


            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                message =
                    "Incorrect email or password.";

            }


            if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "Please enter a valid email address.";

            }


            showLoginStatus(
                message
            );

        } finally {

            loginBtn.disabled =
                false;


            loginBtn.textContent =
                "Sign In";

        }

    }
);



/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,

    user => {

        currentUser =
            user || null;


        if (!user) {

            loginScreen.classList.remove(
                "hidden"
            );


            dashboardScreen.classList.add(
                "hidden"
            );


            return;

        }


        loginScreen.classList.add(
            "hidden"
        );


        dashboardScreen.classList.remove(
            "hidden"
        );


        agentName.textContent =
            user.email ||
            "Support Agent";


        loadTickets();

    }
);



/* =========================================================
   LOAD TICKETS
========================================================= */

function loadTickets() {

    dashboardStatus.textContent =
        "Loading tickets...";


    const ticketsRef =
        ref(
            database,
            "tickets"
        );


    onValue(

        ticketsRef,


        snapshot => {

            tickets =
                snapshot.val() || {};


            renderTickets();


            dashboardStatus.textContent =
                `${Object.keys(tickets).length} ticket(s) loaded.`;

        },


        error => {

            console.error(
                error
            );


            dashboardStatus.textContent =
                "Unable to load tickets. Check Firebase Database Rules.";

        }

    );

}



/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {

    if (!value) {

        return "-";

    }


    try {

        return new Date(value)
            .toLocaleString();

    } catch (error) {

        return "-";

    }

}



/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {

    if (status === "Open") {

        return "status-open";

    }


    if (status === "In Progress") {

        return "status-progress";

    }


    if (status === "Resolved") {

        return "status-resolved";

    }


    return "status-closed";

}



/* =========================================================
   FILTER
========================================================= */

function getFilteredTickets() {

    const query =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    const filter =
        statusFilter?.value ||
        "All";


    return Object.entries(tickets)

        .filter(
            ([key, ticket]) => {

                if (
                    filter !== "All" &&
                    ticket.status !== filter
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

                    ticket.email,

                    ticket.className,

                    ticket.section,

                    ticket.category,

                    ticket.subject,

                    ticket.message,

                    ticket.status

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
            (a, b) => {

                return (
                    (b[1].createdAt || 0) -
                    (a[1].createdAt || 0)
                );

            }
        );

}



/* =========================================================
   RENDER TICKETS
========================================================= */

function renderTickets() {

    const allTickets =
        Object.values(tickets);


    const filteredTickets =
        getFilteredTickets();


    totalCount.textContent =
        allTickets.length;


    openCount.textContent =
        allTickets.filter(
            ticket =>
                ticket.status === "Open"
        ).length;


    progressCount.textContent =
        allTickets.filter(
            ticket =>
                ticket.status === "In Progress"
        ).length;


    resolvedCount.textContent =
        allTickets.filter(
            ticket =>
                ticket.status === "Resolved"
        ).length;


    if (!filteredTickets.length) {

        ticketBody.innerHTML = `

            <tr>

                <td
                colspan="7"
                style="
                    text-align:center;
                    padding:45px;
                    color:#91a3ba;
                ">

                    No support tickets found.

                </td>

            </tr>

        `;


        return;

    }


    ticketBody.innerHTML =
        filteredTickets.map(
            ([key, ticket]) => {

                const status =
                    ticket.status ||
                    "Open";


                return `

                    <tr>

                        <td>

                            <span
                            class="ticket-id">

                                ${escapeHTML(
                                    ticket.ticketId || key
                                )}

                            </span>

                        </td>


                        <td>

                            <span
                            class="student-name">

                                ${escapeHTML(
                                    ticket.name || "-"
                                )}

                            </span>

                            <span
                            class="student-email">

                                ${escapeHTML(
                                    ticket.email || "-"
                                )}

                            </span>

                        </td>


                        <td>

                            ${escapeHTML(
                                ticket.category || "-"
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                ticket.subject || "-"
                            )}

                        </td>


                        <td>

                            <span
                            class="
                            status-badge
                            ${getStatusClass(status)}
                            ">

                                ${escapeHTML(status)}

                            </span>

                        </td>


                        <td>

                            ${escapeHTML(
                                formatDate(
                                    ticket.createdAt
                                )
                            )}

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
        )
        .join("");


    document
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
   OPEN TICKET
========================================================= */

function openTicket(key) {

    const ticket =
        tickets[key];


    if (!ticket) {

        return;

    }


    const status =
        ticket.status ||
        "Open";


    modalContent.innerHTML = `

        <div class="detail-header">

            <span class="badge">
                SUPPORT REQUEST
            </span>

            <h2>
                ${escapeHTML(
                    ticket.ticketId || key
                )}
            </h2>

        </div>


        <div class="detail-grid">


            <div class="detail-box">

                <small>
                    STUDENT NAME
                </small>

                <strong>
                    ${escapeHTML(
                        ticket.name || "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <small>
                    EMAIL
                </small>

                <strong>
                    ${escapeHTML(
                        ticket.email || "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <small>
                    CLASS / SECTION
                </small>

                <strong>
                    ${escapeHTML(
                        `${ticket.className || "-"} / ${ticket.section || "-"}`
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <small>
                    REGISTRATION ID
                </small>

                <strong>
                    ${escapeHTML(
                        ticket.registrationId ||
                        "Not provided"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <small>
                    CATEGORY
                </small>

                <strong>
                    ${escapeHTML(
                        ticket.category || "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <small>
                    CREATED
                </small>

                <strong>
                    ${escapeHTML(
                        formatDate(
                            ticket.createdAt
                        )
                    )}
                </strong>

            </div>


        </div>


        <div class="issue-box">

            <h4>
                Subject
            </h4>

            <p>
                ${escapeHTML(
                    ticket.subject || "-"
                )}
            </p>

        </div>


        <div class="issue-box">

            <h4>
                Student's Message
            </h4>

            <p>
                ${escapeHTML(
                    ticket.message || "-"
                )}
            </p>

        </div>


        <div class="reply-area">

            <label
            for="ticketReply">

                Agent Reply

            </label>


            <textarea
            id="ticketReply"
            placeholder="Write your reply to the student...">${escapeHTML(
                ticket.reply || ""
            )}</textarea>

        </div>


        <div class="modal-actions">

            <select
            id="ticketStatusSelect">

                <option
                value="Open"
                ${status === "Open" ? "selected" : ""}>

                    Open

                </option>

                <option
                value="In Progress"
                ${status === "In Progress" ? "selected" : ""}>

                    In Progress

                </option>

                <option
                value="Resolved"
                ${status === "Resolved" ? "selected" : ""}>

                    Resolved

                </option>

                <option
                value="Closed"
                ${status === "Closed" ? "selected" : ""}>

                    Closed

                </option>

            </select>


            <button
            id="saveTicketBtn"
            class="save-ticket-btn">

                Save Changes

            </button>

        </div>

    `;


    ticketModal.classList.remove(
        "hidden"
    );


    document
        .getElementById(
            "saveTicketBtn"
        )
        .addEventListener(

            "click",

            async function() {

                await saveTicket(
                    key
                );

            }

        );

}



/* =========================================================
   SAVE TICKET
========================================================= */

async function saveTicket(key) {

    const reply =
        document
        .getElementById(
            "ticketReply"
        )
        .value
        .trim();


    const status =
        document
        .getElementById(
            "ticketStatusSelect"
        )
        .value;


    const button =
        document.getElementById(
            "saveTicketBtn"
        );


    button.disabled =
        true;


    button.textContent =
        "Saving...";


    try {

        await update(

            ref(
                database,
                `tickets/${key}`
            ),

            {

                reply:
                    reply,

                status:
                    status,

                agent:
                    currentUser?.email ||
                    "Support Agent",

                updatedAt:
                    serverTimestamp()

            }

        );


        button.textContent =
            "Saved ✓";


        setTimeout(

            () => {

                ticketModal.classList.add(
                    "hidden"
                );

            },

            600

        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "Unable to save ticket changes. Check your Firebase Rules."
        );


        button.disabled =
            false;


        button.textContent =
            "Save Changes";

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

        dashboardStatus.textContent =
            "Dashboard refreshed.";

    }
);



/* =========================================================
   CLOSE MODAL
========================================================= */

closeModal?.addEventListener(
    "click",

    () => {

        ticketModal.classList.add(
            "hidden"
        );

    }
);


ticketModal?.addEventListener(
    "click",

    event => {

        if (
            event.target ===
            ticketModal
        ) {

            ticketModal.classList.add(
                "hidden"
            );

        }

    }
);



/* =========================================================
   LOGOUT
========================================================= */

logoutBtn?.addEventListener(
    "click",

    async function() {

        try {

            await signOut(
                auth
            );

        } catch (error) {

            console.error(
                error
            );

        }

    }
);
