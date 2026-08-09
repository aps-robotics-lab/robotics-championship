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
    apiKey: "AIzaSyCVfkLAc5EKDRUoHf4LgVhBFwTNmq2GMI0",

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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


/* =========================================================
   ONLY AUTHORIZED AGENT
========================================================= */

const AGENT_UID =
    "HgWiHPRx9gcXZtDTl0pDCpZlokt2";


/* =========================================================
   ELEMENTS
========================================================= */

const issueBody =
    document.getElementById("issueBody");

const search =
    document.getElementById("search");

const status =
    document.getElementById("status");

const refreshBtn =
    document.getElementById("refreshBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const totalIssues =
    document.getElementById("totalIssues");

const openIssues =
    document.getElementById("openIssues");

const solvedIssues =
    document.getElementById("solvedIssues");

const issueOverlay =
    document.getElementById("issueOverlay");

const closeIssue =
    document.getElementById("closeIssue");

const cancelIssue =
    document.getElementById("cancelIssue");

const issueForm =
    document.getElementById("issueForm");

const issueKey =
    document.getElementById("issueKey");

const issueStatus =
    document.getElementById("issueStatus");

const issueReply =
    document.getElementById("issueReply");

const issueMessage =
    document.getElementById("issueMessage");


/* =========================================================
   DATA
========================================================= */

let issues = {};

let firebaseListener = null;


/* =========================================================
   STATUS
========================================================= */

function showStatus(message, type = "") {

    if (!status) return;

    status.textContent = message;

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
   DATE
========================================================= */

function formatDate(value) {

    if (!value) return "—";

    let date;

    if (
        typeof value === "number" ||
        !isNaN(Number(value))
    ) {

        date = new Date(Number(value));

    } else {

        date = new Date(value);

    }

    if (isNaN(date.getTime())) {

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
   SEARCH
========================================================= */

function matchesSearch(data, key) {

    const query =
        search?.value
            ?.trim()
            .toLowerCase() || "";

    if (!query) return true;

    const searchable = [

        key,

        data.name,
        data.Name,

        data.studentName,
        data.StudentName,

        data.email,
        data.Email,
        data.EmailAddress,

        data.mobile,
        data.Mobile,
        data.MobileNumber,

        data.subject,
        data.Subject,

        data.issue,
        data.Issue,

        data.message,
        data.Message,

        data.description,
        data.Description,

        data.reply,
        data.agentReply,

        data.status

    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return searchable.includes(query);
}


/* =========================================================
   GET FIELD
========================================================= */

function getField(data, ...names) {

    for (const name of names) {

        if (
            data &&
            data[name] !== undefined &&
            data[name] !== null &&
            data[name] !== ""
        ) {

            return data[name];

        }

    }

    return "";
}


/* =========================================================
   RENDER
========================================================= */

function renderIssues() {

    if (!issueBody) return;


    const allEntries =
        Object.entries(issues);


    const entries =
        allEntries
            .filter(([key, data]) =>
                matchesSearch(data, key)
            )
            .reverse();


    /* =====================================================
       STATS
    ===================================================== */

    const total =
        allEntries.length;


    const solved =
        allEntries.filter(
            ([key, data]) =>
                String(
                    getField(
                        data,
                        "status",
                        "Status"
                    )
                ).toLowerCase() === "solved"
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

    if (!entries.length) {

        issueBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:50px;
                    "
                >

                    <div style="font-size:30px;">
                        🔎
                    </div>

                    <div style="margin-top:10px;">
                        No help requests found.
                    </div>

                </td>

            </tr>

        `;

        return;
    }


    /* =====================================================
       ROWS
    ===================================================== */

    issueBody.innerHTML =
        entries
            .map(([key, data]) => {

                const name =
                    getField(
                        data,
                        "name",
                        "Name",
                        "studentName",
                        "StudentName"
                    ) || "—";


                const email =
                    getField(
                        data,
                        "email",
                        "Email",
                        "EmailAddress"
                    ) || "—";


                const mobile =
                    getField(
                        data,
                        "mobile",
                        "Mobile",
                        "MobileNumber"
                    ) || "—";


                const subject =
                    getField(
                        data,
                        "subject",
                        "Subject",
                        "issue",
                        "Issue"
                    ) || "Help Request";


                const message =
                    getField(
                        data,
                        "message",
                        "Message",
                        "description",
                        "Description"
                    ) || "—";


                const currentStatus =
                    getField(
                        data,
                        "status",
                        "Status"
                    ) || "Open";


                const date =
                    getField(
                        data,
                        "timestamp",
                        "createdAt",
                        "date",
                        "created",
                        "time"
                    );


                const statusClass =
                    String(currentStatus)
                        .toLowerCase() === "solved"
                        ? "solved"
                        : "open";


                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(key)}
                            </strong>

                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <small>
                                ${escapeHTML(email)}
                            </small>

                        </td>


                        <td>

                            ${escapeHTML(mobile)}

                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(subject)}
                            </strong>

                            <small>
                                ${escapeHTML(message)}
                            </small>

                        </td>


                        <td>

                            <span
                                class="issue-status ${statusClass}"
                            >
                                ${escapeHTML(
                                    currentStatus
                                )}
                            </span>

                        </td>


                        <td>

                            ${escapeHTML(
                                formatDate(date)
                            )}

                        </td>


                        <td>

                            <button
                                class="solve-btn"
                                data-key="${escapeHTML(key)}"
                            >
                                ${
                                    statusClass === "solved"
                                    ? "View"
                                    : "Solve"
                                }
                            </button>

                        </td>

                    </tr>

                `;

            })
            .join("");


    document
        .querySelectorAll(".solve-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openIssue(
                        button.dataset.key
                    );

                }
            );

        });
}


/* =========================================================
   LOAD HELP REQUESTS
========================================================= */

function loadIssues() {

    showStatus(
        "Connecting to help database..."
    );


    /*
     * IMPORTANT:
     *
     * This reads:
     *
     * help
     *
     * Change this ONE path if your
     * help form stores data somewhere else.
     */

    const helpRef =
        ref(
            db,
            "help"
        );


    if (firebaseListener) {

        firebaseListener();

    }


    firebaseListener =
        onValue(

            helpRef,

            snapshot => {

                issues =
                    snapshot.val() || {};


                console.log(
                    "HELP DATA:",
                    issues
                );


                renderIssues();


                showStatus(

                    `${Object.keys(
                        issues
                    ).length} help request(s) loaded.`,

                    "success"

                );

            },

            error => {

                console.error(
                    "Help Firebase error:",
                    error
                );


                showStatus(

                    "Unable to read help requests. Check Firebase Database Rules and the help database path.",

                    "error"

                );

            }

        );
}


/* =========================================================
   OPEN ISSUE
========================================================= */

function openIssue(key) {

    const data =
        issues[key];


    if (!data) return;


    if (issueKey) {

        issueKey.value = key;

    }


    if (issueStatus) {

        issueStatus.value =
            getField(
                data,
                "status",
                "Status"
            ) || "Open";

    }


    if (issueReply) {

        issueReply.value =
            getField(
                data,
                "agentReply",
                "reply",
                "Reply"
            ) || "";

    }


    const details =
        document.getElementById(
            "issueDetails"
        );


    if (details) {

        const name =
            getField(
                data,
                "name",
                "Name",
                "studentName",
                "StudentName"
            );


        const email =
            getField(
                data,
                "email",
                "Email",
                "EmailAddress"
            );


        const mobile =
            getField(
                data,
                "mobile",
                "Mobile",
                "MobileNumber"
            );


        const subject =
            getField(
                data,
                "subject",
                "Subject",
                "issue",
                "Issue"
            );


        const message =
            getField(
                data,
                "message",
                "Message",
                "description",
                "Description"
            );


        details.innerHTML = `

            <div class="detail-item">

                <span>Name</span>

                <strong>
                    ${escapeHTML(name || "—")}
                </strong>

            </div>


            <div class="detail-item">

                <span>Email</span>

                <strong>
                    ${escapeHTML(email || "—")}
                </strong>

            </div>


            <div class="detail-item">

                <span>Mobile</span>

                <strong>
                    ${escapeHTML(mobile || "—")}
                </strong>

            </div>


            <div class="detail-item">

                <span>Subject</span>

                <strong>
                    ${escapeHTML(subject || "—")}
                </strong>

            </div>


            <div class="detail-message">

                <span>MESSAGE / ISSUE</span>

                <p>
                    ${escapeHTML(message || "—")}
                </p>

            </div>

        `;

    }


    issueMessage.textContent = "";


    issueOverlay?.classList.remove(
        "hidden"
    );
}


/* =========================================================
   CLOSE ISSUE
========================================================= */

function closeIssueModal() {

    issueOverlay?.classList.add(
        "hidden"
    );
}


closeIssue?.addEventListener(
    "click",
    closeIssueModal
);


cancelIssue?.addEventListener(
    "click",
    closeIssueModal
);


issueOverlay?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            issueOverlay
        ) {

            closeIssueModal();

        }

    }
);


/* =========================================================
   SOLVE ISSUE
========================================================= */

issueForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const key =
            issueKey?.value;


        if (!key) return;


        try {

            if (issueMessage) {

                issueMessage.textContent =
                    "Saving response...";

            }


            await update(

                ref(
                    db,
                    `help/${key}`
                ),

                {

                    status:
                        issueStatus.value,

                    agentReply:
                        issueReply.value.trim(),

                    repliedAt:
                        Date.now(),

                    repliedBy:
                        auth.currentUser?.uid || ""

                }

            );


            if (issueMessage) {

                issueMessage.textContent =
                    "✓ Response saved successfully.";

            }


            showStatus(
                "Help request updated successfully.",
                "success"
            );


            setTimeout(
                closeIssueModal,
                700
            );


        } catch (error) {

            console.error(
                "Update help request error:",
                error
            );


            if (issueMessage) {

                issueMessage.textContent =
                    "Unable to save response.";

            }


            showStatus(
                "Firebase denied the update. Check your Database Rules.",
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
    renderIssues
);


/* =========================================================
   REFRESH
========================================================= */

refreshBtn?.addEventListener(
    "click",
    () => {

        renderIssues();

        showStatus(
            "Help dashboard refreshed.",
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

        await signOut(auth);

        window.location.replace(
            "agent-login.html"
        );

    }
);


/* =========================================================
   AUTH
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
         * ONLY THIS UID
         */

        if (
            user.uid !== AGENT_UID
        ) {

            alert(
                "Access denied. You are not an authorized support agent."
            );


            signOut(auth);

            return;

        }


        showStatus(

            `Agent authenticated: ${
                user.email || user.uid
            }`,

            "success"

        );


        loadIssues();

    }
);
