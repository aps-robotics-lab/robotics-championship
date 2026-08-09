/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   AGENT DASHBOARD
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
   INITIALIZE FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getDatabase(app);


/* =========================================================
   AGENT AUTHORIZATION
   ONLY THIS UID IS ALLOWED
========================================================= */

const AGENT_UID =
    "HgWiHPRx9gcXZtDTl0pDCpZlokt2";


/* =========================================================
   STATE
========================================================= */

let registrations = {};

let firebaseListener = null;

let authorizedAgent = false;

let saving = false;

let deleting = false;


/* =========================================================
   ELEMENTS
========================================================= */

const body =
    document.getElementById(
        "registrationBody"
    );

const search =
    document.getElementById(
        "search"
    );

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const status =
    document.getElementById(
        "status"
    );

const totalRegistrations =
    document.getElementById(
        "totalRegistrations"
    );

const soloCount =
    document.getElementById(
        "soloCount"
    );

const teamCount =
    document.getElementById(
        "teamCount"
    );

const participantCount =
    document.getElementById(
        "participantCount"
    );


/* =========================================================
   EDIT ELEMENTS
========================================================= */

const editOverlay =
    document.getElementById(
        "editOverlay"
    );

const closeEdit =
    document.getElementById(
        "closeEdit"
    );

const cancelEdit =
    document.getElementById(
        "cancelEdit"
    );

const editForm =
    document.getElementById(
        "editForm"
    );

const editKey =
    document.getElementById(
        "editKey"
    );

const editStudentName =
    document.getElementById(
        "editStudentName"
    );

const editStudentClass =
    document.getElementById(
        "editStudentClass"
    );

const editStudentSection =
    document.getElementById(
        "editStudentSection"
    );

const editMobileNumber =
    document.getElementById(
        "editMobileNumber"
    );

const editEmailAddress =
    document.getElementById(
        "editEmailAddress"
    );

const editTeamName =
    document.getElementById(
        "editTeamName"
    );

const editMembers =
    document.getElementById(
        "editMembers"
    );

const editRemarks =
    document.getElementById(
        "editRemarks"
    );

const editMessage =
    document.getElementById(
        "editMessage"
    );


/* =========================================================
   HELPERS
========================================================= */

function clean(value) {

    return String(
        value ?? ""
    ).trim();

}


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


function normalize(value) {

    return clean(
        value
    ).toLowerCase();

}


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
        `status ${type}`.trim();

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
   MEMBERS
========================================================= */

function getMembers(data) {

    const members = [];

    if (!data) {
        return members;
    }


    for (
        let i = 2;
        i <= 5;
        i++
    ) {

        const name =
            clean(
                data[
                    `Member${i}Name`
                ]
            );


        if (!name) {
            continue;
        }


        members.push({

            name,

            className:
                clean(
                    data[
                        `Member${i}Class`
                    ]
                ) || "-",

            section:
                clean(
                    data[
                        `Member${i}Section`
                    ]
                ) || "-"

        });

    }


    return members;

}


/* =========================================================
   EVENTS
========================================================= */

function getEvents(data) {

    if (
        Array.isArray(
            data?.Events
        )
    ) {

        return data.Events
            .filter(Boolean)
            .map(
                event =>
                    clean(event)
            );

    }


    if (
        typeof data?.Events === "string"
    ) {

        return data.Events
            .split(",")
            .map(
                event =>
                    clean(event)
            )
            .filter(Boolean);

    }


    return [];

}


/* =========================================================
   TEAM SIZE
========================================================= */

function getTeamSize(data) {

    const size =
        Number(
            data?.TeamSize
        );


    if (
        Number.isFinite(size) &&
        size >= 1
    ) {

        return Math.min(
            Math.floor(size),
            5
        );

    }


    const members =
        getMembers(data).length;


    return Math.max(
        1,
        Math.min(
            members + 1,
            5
        )
    );

}


/* =========================================================
   PARTICIPATION TYPE
========================================================= */

function getParticipationType(data) {

    const type =
        clean(
            data?.ParticipationType
        );


    if (type) {
        return type;
    }


    const size =
        getTeamSize(data);


    return size === 1
        ? "Solo"
        : `Team of ${size}`;

}


/* =========================================================
   SEARCH
========================================================= */

function matchesSearch(
    data,
    key
) {

    const query =
        normalize(
            search?.value
        );


    if (!query) {
        return true;
    }


    const searchable = [

        key,

        data?.registrationId,

        data?.StudentName,

        data?.Class,

        data?.Section,

        data?.MobileNumber,

        data?.EmailAddress,

        data?.TeamName,

        data?.ParticipationType,

        data?.TeamSize,

        data?.Remarks,

        ...getEvents(data),

        data?.Member2Name,
        data?.Member2Class,
        data?.Member2Section,

        data?.Member3Name,
        data?.Member3Class,
        data?.Member3Section,

        data?.Member4Name,
        data?.Member4Class,
        data?.Member4Section,

        data?.Member5Name,
        data?.Member5Class,
        data?.Member5Section

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
   UPDATE STATS
========================================================= */

function updateStats() {

    const entries =
        Object.values(
            registrations || {}
        );


    const total =
        entries.length;


    let solo = 0;

    let teams = 0;

    let participants = 0;


    entries.forEach(
        data => {

            const size =
                getTeamSize(data);


            participants +=
                size;


            if (size === 1) {

                solo++;

            } else {

                teams++;

            }

        }
    );


    if (totalRegistrations) {

        totalRegistrations.textContent =
            total;

    }


    if (soloCount) {

        soloCount.textContent =
            solo;

    }


    if (teamCount) {

        teamCount.textContent =
            teams;

    }


    if (participantCount) {

        participantCount.textContent =
            participants;

    }

}


/* =========================================================
   EMPTY STATE
========================================================= */

function renderEmpty(
    message = "No registrations found."
) {

    if (!body) {
        return;
    }


    body.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="empty-state"
            >

                <div class="empty-icon">
                    🔎
                </div>

                <strong>
                    ${escapeHTML(message)}
                </strong>

                <small>
                    Try changing your search or refresh the dashboard.
                </small>

            </td>

        </tr>

    `;

}


/* =========================================================
   RENDER
========================================================= */

function renderRegistrations() {

    if (!body) {
        return;
    }


    updateStats();


    const entries =
        Object.entries(
            registrations || {}
        )
        .filter(
            ([key, data]) => {

                return (
                    data &&
                    matchesSearch(
                        data,
                        key
                    )
                );

            }
        )
        .sort(
            (
                [, a],
                [, b]
            ) => {

                const dateA =
                    Number(
                        a?.registrationDate ||
                        a?.timestamp ||
                        a?.createdAt ||
                        0
                    );


                const dateB =
                    Number(
                        b?.registrationDate ||
                        b?.timestamp ||
                        b?.createdAt ||
                        0
                    );


                return dateB - dateA;

            }
        );


    if (!entries.length) {

        renderEmpty();

        return;

    }


    body.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const members =
                        getMembers(data);


                    const events =
                        getEvents(data);


                    const type =
                        getParticipationType(
                            data
                        );


                    const id =
                        clean(
                            data.registrationId
                        ) ||
                        key;


                    const student =
                        clean(
                            data.StudentName
                        ) ||
                        "-";


                    const className =
                        clean(
                            data.Class
                        );


                    const section =
                        clean(
                            data.Section
                        );


                    const team =
                        clean(
                            data.TeamName
                        ) ||
                        "—";


                    const mobile =
                        clean(
                            data.MobileNumber
                        ) ||
                        "-";


                    const email =
                        clean(
                            data.EmailAddress
                        ) ||
                        "-";


                    const date =
                        data.registrationDate ||
                        data.timestamp ||
                        data.createdAt;


                    return `

                        <tr>

                            <td>

                                <span class="registration-id">
                                    ${escapeHTML(id)}
                                </span>

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(student)}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        [
                                            className,
                                            section
                                        ]
                                        .filter(Boolean)
                                        .join(" • ")
                                    )}
                                </small>

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(team)}
                                </strong>

                            </td>


                            <td>

                                <span class="type-badge">
                                    ${escapeHTML(type)}
                                </span>

                            </td>


                            <td>

                                ${
                                    members.length

                                    ?

                                    members
                                        .map(
                                            member => `

                                                <div class="member-item">

                                                    <strong>
                                                        ${escapeHTML(
                                                            member.name
                                                        )}
                                                    </strong>

                                                    <small>
                                                        ${escapeHTML(
                                                            [
                                                                member.className,
                                                                member.section
                                                            ]
                                                            .filter(Boolean)
                                                            .join(" • ")
                                                        )}
                                                    </small>

                                                </div>

                                            `
                                        )
                                        .join("")

                                    :

                                    `<span class="muted">
                                        Solo participant
                                    </span>`
                                }

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(mobile)}
                                </strong>

                                <small>
                                    ${escapeHTML(email)}
                                </small>

                            </td>


                            <td>

                                ${
                                    events.length

                                    ?

                                    events
                                        .map(
                                            event => `

                                                <span class="event-chip">
                                                    ${escapeHTML(event)}
                                                </span>

                                            `
                                        )
                                        .join(" ")

                                    :

                                    "—"
                                }

                            </td>


                            <td>

                                <span class="date-text">
                                    ${escapeHTML(
                                        formatDate(date)
                                    )}
                                </span>

                            </td>


                            <td>

                                <div class="action-buttons">

                                    <button
                                        type="button"
                                        class="edit-btn"
                                        data-key="${escapeHTML(key)}"
                                    >
                                        ✏️ Edit
                                    </button>


                                    <button
                                        type="button"
                                        class="delete-btn"
                                        data-key="${escapeHTML(key)}"
                                    >
                                        🗑️ Delete
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    attachActions();

}


/* =========================================================
   ACTION BUTTONS
========================================================= */

function attachActions() {

    body
        ?.querySelectorAll(
            ".edit-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const key =
                            button.dataset.key;

                        if (key) {
                            openEdit(key);
                        }

                    }
                );

            }
        );


    body
        ?.querySelectorAll(
            ".delete-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const key =
                            button.dataset.key;

                        if (key) {
                            deleteRegistration(key);
                        }

                    }
                );

            }
        );

}


/* =========================================================
   LOAD REGISTRATIONS
========================================================= */

function loadRegistrations() {

    if (!authorizedAgent) {
        return;
    }


    if (firebaseListener) {

        firebaseListener();

        firebaseListener =
            null;

    }


    showStatus(
        "Connecting to registrations...",
        ""
    );


    const registrationsRef =
        ref(
            db,
            "registrations"
        );


    firebaseListener =
        onValue(

            registrationsRef,

            snapshot => {

                registrations =
                    snapshot.val() || {};


                renderRegistrations();


                const count =
                    Object.keys(
                        registrations
                    ).length;


                showStatus(

                    `${count} registration${count === 1 ? "" : "s"} loaded.`,

                    "success"

                );

            },

            error => {

                console.error(
                    "Firebase read error:",
                    error
                );


                registrations = {};

                renderRegistrations();


                showStatus(

                    "Firebase denied access to registrations. Check the agent Firebase Rules.",

                    "error"

                );

            }

        );

}


/* =========================================================
   OPEN EDIT
========================================================= */

function openEdit(key) {

    if (!authorizedAgent) {
        return;
    }


    const data =
        registrations[key];


    if (!data) {

        showStatus(
            "Registration not found.",
            "error"
        );

        return;

    }


    if (!editOverlay) {
        return;
    }


    if (editKey) {
        editKey.value = key;
    }


    if (editStudentName) {

        editStudentName.value =
            clean(
                data.StudentName
            );

    }


    if (editStudentClass) {

        editStudentClass.value =
            clean(
                data.Class
            );

    }


    if (editStudentSection) {

        editStudentSection.value =
            clean(
                data.Section
            );

    }


    if (editMobileNumber) {

        editMobileNumber.value =
            clean(
                data.MobileNumber
            );

    }


    if (editEmailAddress) {

        editEmailAddress.value =
            clean(
                data.EmailAddress
            );

    }


    if (editTeamName) {

        editTeamName.value =
            clean(
                data.TeamName
            );

    }


    if (editRemarks) {

        editRemarks.value =
            clean(
                data.Remarks
            );

    }


    if (editMembers) {

        editMembers.innerHTML = "";


        const teamSize =
            getTeamSize(data);


        for (
            let i = 2;
            i <= teamSize;
            i++
        ) {

            createMemberEditor(
                data,
                i
            );

        }

    }


    if (editMessage) {

        editMessage.textContent = "";

    }


    editOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   MEMBER EDITOR
========================================================= */

function createMemberEditor(
    data,
    index
) {

    if (!editMembers) {
        return;
    }


    const name =
        clean(
            data[
                `Member${index}Name`
            ]
        );


    const selectedClass =
        clean(
            data[
                `Member${index}Class`
            ]
        );


    const section =
        clean(
            data[
                `Member${index}Section`
            ]
        );


    editMembers.insertAdjacentHTML(

        "beforeend",

        `

            <div class="edit-member-card">

                <h4>
                    PARTICIPANT ${String(index).padStart(2, "0")}
                </h4>


                <label>

                    Name

                    <input
                        type="text"
                        id="editMember${index}Name"
                        value="${escapeHTML(name)}"
                    >

                </label>


                <label>

                    Class

                    <select
                        id="editMember${index}Class"
                    >

                        <option value="">
                            Select Class
                        </option>

                        ${
                            [
                                "VI",
                                "VII",
                                "VIII",
                                "IX",
                                "X",
                                "XI",
                                "XII"
                            ]
                            .map(
                                cls => `

                                    <option
                                        value="${cls}"
                                        ${
                                            selectedClass === cls
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${cls}
                                    </option>

                                `
                            )
                            .join("")
                        }

                    </select>

                </label>


                <label>

                    Section

                    <input
                        type="text"
                        id="editMember${index}Section"
                        value="${escapeHTML(section)}"
                    >

                </label>

            </div>

        `

    );

}


/* =========================================================
   CLOSE EDIT
========================================================= */

function closeEditModal() {

    if (
        isSaving ||
        !editOverlay
    ) {

        return;

    }


    editOverlay.classList.add(
        "hidden"
    );

}


closeEdit?.addEventListener(
    "click",
    closeEditModal
);


cancelEdit?.addEventListener(
    "click",
    closeEditModal
);


editOverlay?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            editOverlay
        ) {

            closeEditModal();

        }

    }
);


/* =========================================================
   SAVE EDIT
========================================================= */

editForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (
            !authorizedAgent ||
            saving
        ) {

            return;

        }


        const key =
            clean(
                editKey?.value
            );


        if (!key) {

            showStatus(
                "Invalid registration.",
                "error"
            );

            return;

        }


        const oldData =
            registrations[key];


        if (!oldData) {

            showStatus(
                "Registration no longer exists.",
                "error"
            );

            closeEditModal();

            return;

        }


        saving = true;


        if (editMessage) {

            editMessage.textContent =
                "Saving changes...";

        }


        showStatus(
            "Saving registration...",
            ""
        );


        try {

            const updatedData = {

                StudentName:
                    clean(
                        editStudentName?.value
                    ),

                Class:
                    clean(
                        editStudentClass?.value
                    ),

                Section:
                    clean(
                        editStudentSection?.value
                    ),

                MobileNumber:
                    clean(
                        editMobileNumber?.value
                    ),

                EmailAddress:
                    clean(
                        editEmailAddress?.value
                    ).toLowerCase(),

                TeamName:
                    clean(
                        editTeamName?.value
                    ),

                Remarks:
                    clean(
                        editRemarks?.value
                    ),

                updatedAt:
                    Date.now()

            };


            const teamSize =
                getTeamSize(oldData);


            for (
                let i = 2;
                i <= 5;
                i++
            ) {

                if (i <= teamSize) {

                    updatedData[
                        `Member${i}Name`
                    ] =
                        clean(
                            document.getElementById(
                                `editMember${i}Name`
                            )?.value
                        );


                    updatedData[
                        `Member${i}Class`
                    ] =
                        clean(
                            document.getElementById(
                                `editMember${i}Class`
                            )?.value
                        );


                    updatedData[
                        `Member${i}Section`
                    ] =
                        clean(
                            document.getElementById(
                                `editMember${i}Section`
                            )?.value
                        );

                }

            }


            await update(

                ref(
                    db,
                    `registrations/${key}`
                ),

                updatedData

            );


            if (editMessage) {

                editMessage.textContent =
                    "✓ Changes saved successfully.";

            }


            showStatus(
                "Registration updated successfully.",
                "success"
            );


            setTimeout(
                () => {

                    saving = false;

                    closeEditModal();

                },
                700
            );


        } catch (error) {

            console.error(
                "Agent update error:",
                error
            );


            saving = false;


            if (editMessage) {

                editMessage.textContent =
                    "Unable to save changes.";

            }


            showStatus(

                "Firebase denied the update. Check your agent Firebase Rules.",

                "error"

            );

        }

    }
);


/* =========================================================
   DELETE
========================================================= */

async function deleteRegistration(key) {

    if (
        !authorizedAgent ||
        deleting
    ) {

        return;

    }


    const data =
        registrations[key];


    if (!data) {

        showStatus(
            "Registration not found.",
            "error"
        );

        return;

    }


    const id =
        clean(
            data.registrationId
        ) ||
        key;


    const name =
        clean(
            data.StudentName
        ) ||
        "this participant";


    const confirmed =
        confirm(

            `DELETE REGISTRATION?\n\n` +

            `Registration ID: ${id}\n` +

            `Student: ${name}\n\n` +

            `This action cannot be undone.`

        );


    if (!confirmed) {
        return;
    }


    deleting = true;


    try {

        showStatus(
            "Deleting registration...",
            ""
        );


        await remove(

            ref(
                db,
                `registrations/${key}`
            )

        );


        showStatus(
            "Registration deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Agent delete error:",
            error
        );


        showStatus(

            "Firebase denied deletion. Check your agent Firebase Rules.",

            "error"

        );

    } finally {

        deleting = false;

    }

}


/* =========================================================
   SEARCH
========================================================= */

search?.addEventListener(
    "input",
    renderRegistrations
);


/* =========================================================
   REFRESH
========================================================= */

refreshBtn?.addEventListener(
    "click",
    () => {

        if (!authorizedAgent) {

            showStatus(
                "You are not authorized as an agent.",
                "error"
            );

            return;

        }


        loadRegistrations();

    }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn?.addEventListener(
    "click",
    async () => {

        if (firebaseListener) {

            firebaseListener();

            firebaseListener =
                null;

        }


        authorizedAgent = false;


        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "Agent logout error:",
                error
            );

        }


        window.location.replace(
            "agent-login.html"
        );

    }
);


/* =========================================================
   AUTHENTICATION + AGENT AUTHORIZATION
========================================================= */

onAuthStateChanged(

    auth,

    async user => {

        /*
         * NO LOGIN
         */

        if (!user) {

            authorizedAgent = false;

            registrations = {};


            if (firebaseListener) {

                firebaseListener();

                firebaseListener =
                    null;

            }


            window.location.replace(
                "agent-login.html"
            );

            return;

        }


        /*
         * ONLY ONE UID IS ALLOWED
         */

        if (
            user.uid !== AGENT_UID
        ) {

            authorizedAgent = false;


            console.warn(
                "Unauthorized agent login:",
                user.uid
            );


            alert(
                "Access denied.\n\nThis account is not authorized as an agent."
            );


            try {

                await signOut(auth);

            } catch (error) {

                console.error(
                    "Unauthorized logout error:",
                    error
                );

            }


            window.location.replace(
                "agent-login.html"
            );

            return;

        }


        /*
         * AUTHORIZED AGENT
         */

        authorizedAgent = true;


        console.log(
            "Authorized agent:",
            user.uid
        );


        showStatus(
            "Agent authenticated successfully.",
            "success"
        );


        loadRegistrations();

    }

);


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (firebaseListener) {

            firebaseListener();

        }

    }
);
