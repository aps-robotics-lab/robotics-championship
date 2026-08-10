/* =========================================================
   ADMIN.JS
   APS ROBOTICS CHAMPIONSHIP 2026
   Firebase Project: aps-robotic-champs-2026
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

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
    apiKey: "AIzaSyD83i25yCvb17M66YILnPISTrP3p4ZND6I",

    authDomain:
        "aps-robotic-champs-2026.firebaseapp.com",

    databaseURL:
        "https://aps-robotic-champs-2026-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "aps-robotic-champs-2026",

    storageBucket:
        "aps-robotic-champs-2026.firebasestorage.app",

    messagingSenderId:
        "583098137656",

    appId:
        "1:583098137656:web:b59467faab54a67271facd",

    measurementId:
        "G-1G58X0KSD0"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


/* =========================================================
   ADMIN SECURITY
========================================================= */

/*
   IMPORTANT:

   Replace this with the UID of your administrator
   from:

   Firebase Console
   → aps-robotic-champs-2026
   → Authentication
   → Users
*/

const ADMIN_UID =
    "REPLACE_WITH_NEW_PROJECT_ADMIN_UID";


/* =========================================================
   DATABASE PATH
========================================================= */

const REGISTRATIONS_PATH =
    "registrations";


/* =========================================================
   ELEMENTS
========================================================= */

const loadingScreen =
    document.getElementById("loadingScreen");

const appShell =
    document.getElementById("app");


const adminName =
    document.getElementById("adminName");

const adminEmail =
    document.getElementById("adminEmail");


const logoutBtn =
    document.getElementById("logoutBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const exportBtn =
    document.getElementById("exportBtn");


const search =
    document.getElementById("search");

const clearSearch =
    document.getElementById("clearSearch");

const typeFilter =
    document.getElementById("typeFilter");

const eventFilter =
    document.getElementById("eventFilter");


const registrationBody =
    document.getElementById("registrationBody");

const mobileRegistrations =
    document.getElementById("mobileRegistrations");


const status =
    document.getElementById("status");


/* =========================================================
   DASHBOARD STATS
========================================================= */

const totalRegistrations =
    document.getElementById("totalRegistrations");

const soloCount =
    document.getElementById("soloCount");

const teamCount =
    document.getElementById("teamCount");

const eventEntries =
    document.getElementById("eventEntries");


const raceCount =
    document.getElementById("raceCount");

const warCount =
    document.getElementById("warCount");

const tugCount =
    document.getElementById("tugCount");

const soccerCount =
    document.getElementById("soccerCount");


/* =========================================================
   DETAIL MODAL
========================================================= */

const detailOverlay =
    document.getElementById("detailOverlay");

const closeDetail =
    document.getElementById("closeDetail");

const detailId =
    document.getElementById("detailId");

const detailContent =
    document.getElementById("detailContent");


/* =========================================================
   EDIT MODAL
========================================================= */

const editOverlay =
    document.getElementById("editOverlay");

const closeEdit =
    document.getElementById("closeEdit");

const cancelEdit =
    document.getElementById("cancelEdit");

const editForm =
    document.getElementById("editForm");

const editKey =
    document.getElementById("editKey");

const editStudentName =
    document.getElementById("editStudentName");

const editStudentClass =
    document.getElementById("editStudentClass");

const editStudentSection =
    document.getElementById("editStudentSection");

const editMobileNumber =
    document.getElementById("editMobileNumber");

const editEmailAddress =
    document.getElementById("editEmailAddress");

const editTeamName =
    document.getElementById("editTeamName");

const editMembers =
    document.getElementById("editMembers");

const editRemarks =
    document.getElementById("editRemarks");

const editMessage =
    document.getElementById("editMessage");


/* =========================================================
   DELETE CONFIRM MODAL
========================================================= */

const confirmOverlay =
    document.getElementById("confirmOverlay");

const confirmMessage =
    document.getElementById("confirmMessage");

const cancelDeleteBtn =
    document.getElementById("cancelDelete");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");


let pendingDeleteKey =
    null;


/* =========================================================
   TOAST
========================================================= */

const toast =
    document.getElementById("toast");

const toastText =
    document.getElementById("toastText");


/* =========================================================
   DATA
========================================================= */

let registrations = {};

let firebaseListener = null;


/* =========================================================
   STATUS
========================================================= */

function showStatus(message, type = "") {

    if (!status) {
        return;
    }

    status.textContent =
        message;

    status.className =
        "status " + type;
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!toast || !toastText) {
        return;
    }

    toastText.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);
}


/* =========================================================
   HTML ESCAPE
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
   VALUE HELPER
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
   MULTIPLE FIELD HELPER
========================================================= */

function firstValue(
    data,
    fields,
    fallback = ""
) {

    for (
        const field of fields
    ) {

        const value =
            valueOf(
                data,
                field,
                ""
            );

        if (
            value !== ""
        ) {

            return value;

        }

    }

    return fallback;
}


/* =========================================================
   REGISTRATION ID
========================================================= */

function getRegistrationId(
    data,
    key
) {

    return firstValue(
        data,
        [
            "registrationId",
            "registrationID",
            "regId",
            "id"
        ],
        key
    );
}


/* =========================================================
   STUDENT NAME
========================================================= */

function getName(data) {

    return firstValue(
        data,
        [
            "studentName",
            "name",
            "leaderName",
            "participantName"
        ],
        "—"
    );
}


/* =========================================================
   CLASS
========================================================= */

function getClassName(data) {

    return firstValue(
        data,
        [
            "studentClass",
            "className",
            "class"
        ],
        "—"
    );
}


/* =========================================================
   SECTION
========================================================= */

function getSection(data) {

    return firstValue(
        data,
        [
            "studentSection",
            "section"
        ],
        "—"
    );
}


/* =========================================================
   MOBILE
========================================================= */

function getMobile(data) {

    return firstValue(
        data,
        [
            "mobileNumber",
            "mobile",
            "phone",
            "phoneNumber"
        ],
        "—"
    );
}


/* =========================================================
   EMAIL
========================================================= */

function getEmail(data) {

    return firstValue(
        data,
        [
            "emailAddress",
            "email"
        ],
        "—"
    );
}


/* =========================================================
   TEAM
========================================================= */

function getTeamName(data) {

    return firstValue(
        data,
        [
            "teamName",
            "team"
        ],
        "—"
    );
}


/* =========================================================
   REMARKS
========================================================= */

function getRemarks(data) {

    return firstValue(
        data,
        [
            "remarks",
            "remark",
            "notes"
        ],
        ""
    );
}


/* =========================================================
   TIMESTAMP
========================================================= */

function getTimestamp(data) {

    return firstValue(
        data,
        [
            "timestamp",
            "createdAt",
            "created_at",
            "registeredAt"
        ],
        ""
    );
}


/* =========================================================
   MEMBERS
========================================================= */

function getMembers(data) {

    const raw =
        firstValue(
            data,
            [
                "members",
                "teamMembers",
                "memberList"
            ],
            []
        );


    if (
        Array.isArray(raw)
    ) {

        return raw;

    }


    if (
        raw &&
        typeof raw === "object"
    ) {

        return Object.values(raw);

    }


    if (
        typeof raw === "string"
    ) {

        return raw
            .split(/\r?\n|,/)
            .map(
                value =>
                    value.trim()
            )
            .filter(Boolean);

    }


    return [];

}


/* =========================================================
   EVENTS
========================================================= */

function getEvents(data) {

    const raw =
        firstValue(
            data,
            [
                "events",
                "event",
                "selectedEvents"
            ],
            []
        );


    if (
        Array.isArray(raw)
    ) {

        return raw;

    }


    if (
        raw &&
        typeof raw === "object"
    ) {

        return Object.values(raw);

    }


    if (
        typeof raw === "string"
    ) {

        return raw
            .split(/\r?\n|,/)
            .map(
                value =>
                    value.trim()
            )
            .filter(Boolean);

    }


    return [];

}


/* =========================================================
   EVENT CHECK
========================================================= */

function hasEvent(
    data,
    eventName
) {

    return getEvents(data)
        .some(
            event =>
                String(event)
                    .trim()
                    .toLowerCase() ===
                eventName
                    .toLowerCase()
        );
}


/* =========================================================
   TYPE
========================================================= */

function normalizeType(data) {

    const raw =
        String(
            firstValue(
                data,
                [
                    "type",
                    "registrationType",
                    "participantType"
                ],
                ""
            )
        )
        .trim()
        .toLowerCase();


    if (
        raw.includes("team")
    ) {

        return "team";

    }


    if (
        raw.includes("solo")
    ) {

        return "solo";

    }


    const members =
        getMembers(data);


    return members.length > 0
        ? "team"
        : "solo";
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
        typeof value === "number"
    ) {

        date =
            new Date(value);

    }

    else if (
        !Number.isNaN(
            Number(value)
        ) &&
        String(value).trim() !== ""
    ) {

        date =
            new Date(
                Number(value)
            );

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

        getRegistrationId(
            data,
            key
        ),

        getName(data),

        getClassName(data),

        getSection(data),

        getMobile(data),

        getEmail(data),

        getTeamName(data),

        getRemarks(data),

        ...getEvents(data),

        ...getMembers(data)

    ]
        .join(" ")
        .toLowerCase();


    return searchable.includes(
        query
    );

}


/* =========================================================
   FILTERS
========================================================= */

function matchesFilters(data) {

    const selectedType =
        typeFilter?.value ||
        "all";

    const selectedEvent =
        eventFilter?.value ||
        "all";


    if (
        selectedType !== "all" &&
        normalizeType(data) !== selectedType
    ) {

        return false;

    }


    if (
        selectedEvent !== "all" &&
        !hasEvent(
            data,
            selectedEvent
        )
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   FILTERED DATA
========================================================= */

function filteredEntries() {

    return Object.entries(
        registrations
    )

        .filter(
            ([key, data]) =>
                matchesSearch(
                    data,
                    key
                )
        )

        .filter(
            ([, data]) =>
                matchesFilters(data)
        )

        .reverse();

}


/* =========================================================
   DASHBOARD STATS
========================================================= */

function renderStats() {

    const entries =
        Object.entries(
            registrations
        );


    const solo =
        entries.filter(
            ([, data]) =>
                normalizeType(data) ===
                "solo"
        ).length;


    const team =
        entries.filter(
            ([, data]) =>
                normalizeType(data) ===
                "team"
        ).length;


    const race =
        entries.filter(
            ([, data]) =>
                hasEvent(
                    data,
                    "Robo Race"
                )
        ).length;


    const war =
        entries.filter(
            ([, data]) =>
                hasEvent(
                    data,
                    "Robo War"
                )
        ).length;


    const tug =
        entries.filter(
            ([, data]) =>
                hasEvent(
                    data,
                    "Robo Tug of War"
                )
        ).length;


    const soccer =
        entries.filter(
            ([, data]) =>
                hasEvent(
                    data,
                    "Robo Soccer"
                )
        ).length;


    const totalEventEntries =
        entries.reduce(
            (
                total,
                [, data]
            ) =>
                total +
                getEvents(data).length,
            0
        );


    if (totalRegistrations) {

        totalRegistrations.textContent =
            entries.length;

    }


    if (soloCount) {

        soloCount.textContent =
            solo;

    }


    if (teamCount) {

        teamCount.textContent =
            team;

    }


    if (eventEntries) {

        eventEntries.textContent =
            totalEventEntries;

    }


    if (raceCount) {

        raceCount.textContent =
            race;

    }


    if (warCount) {

        warCount.textContent =
            war;

    }


    if (tugCount) {

        tugCount.textContent =
            tug;

    }


    if (soccerCount) {

        soccerCount.textContent =
            soccer;

    }

}


/* =========================================================
   ROW ACTION HANDLER
========================================================= */

function handleRowAction(button) {

    const key =
        button.dataset.key;


    if (
        button.classList.contains(
            "edit-btn"
        )
    ) {

        openEdit(key);

    }

    else if (
        button.classList.contains(
            "delete-btn"
        )
    ) {

        openConfirmDelete(key);

    }

    else {

        openDetail(key);

    }

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable() {

    if (!registrationBody) {
        return;
    }


    const entries =
        filteredEntries();


    if (
        entries.length === 0
    ) {

        registrationBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:50px 20px;
                    "
                >

                    <div
                        style="
                            font-size:35px;
                        "
                    >
                        🤖
                    </div>

                    <div
                        style="
                            margin-top:10px;
                            font-weight:600;
                        "
                    >
                        No registrations found.
                    </div>

                    <div
                        style="
                            margin-top:5px;
                            opacity:.6;
                            font-size:11px;
                        "
                    >
                        Try changing the search
                        or filters.
                    </div>

                </td>

            </tr>

        `;


        if (mobileRegistrations) {

            mobileRegistrations.innerHTML =
                "";

        }


        return;

    }


    registrationBody.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const id =
                        getRegistrationId(
                            data,
                            key
                        );

                    const name =
                        getName(data);

                    const team =
                        getTeamName(data);

                    const type =
                        normalizeType(data);

                    const members =
                        getMembers(data);

                    const mobile =
                        getMobile(data);

                    const email =
                        getEmail(data);

                    const events =
                        getEvents(data);


                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${escapeHTML(id)}
                                </strong>

                                <small>
                                    ${escapeHTML(key)}
                                </small>

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(name)}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        getClassName(data)
                                    )}
                                    -
                                    ${escapeHTML(
                                        getSection(data)
                                    )}
                                </small>

                            </td>


                            <td>
                                ${escapeHTML(team)}
                            </td>


                            <td>

                                <span
                                    class="type-badge ${type}"
                                >
                                    ${
                                        type === "team"
                                            ? "Team"
                                            : "Solo"
                                    }
                                </span>

                            </td>


                            <td>
                                ${members.length}
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

                                <div class="event-list">

                                    ${
                                        events.length
                                            ? events
                                                .map(
                                                    event => `
                                                        <span
                                                            class="event-pill"
                                                        >
                                                            ${escapeHTML(event)}
                                                        </span>
                                                    `
                                                )
                                                .join("")
                                            : "—"
                                    }

                                </div>

                            </td>


                            <td>

                                <div class="action-buttons">

                                    <button
                                        type="button"
                                        class="view-btn"
                                        data-key="${escapeHTML(key)}"
                                    >
                                        View
                                    </button>


                                    <button
                                        type="button"
                                        class="edit-btn"
                                        data-key="${escapeHTML(key)}"
                                    >
                                        Edit
                                    </button>


                                    <button
                                        type="button"
                                        class="delete-btn"
                                        data-key="${escapeHTML(key)}"
                                        title="Delete registration"
                                    >
                                        <i class="fa-solid fa-trash"></i>
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    registrationBody
        .querySelectorAll(
            "[data-key]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        handleRowAction(
                            button
                        )
                );

            }
        );


    renderMobile(
        entries
    );

}


/* =========================================================
   MOBILE CARDS
========================================================= */

function renderMobile(entries) {

    if (!mobileRegistrations) {
        return;
    }


    mobileRegistrations.innerHTML =
        entries
            .map(
                ([key, data]) => {

                    const id =
                        getRegistrationId(
                            data,
                            key
                        );

                    const name =
                        getName(data);

                    const type =
                        normalizeType(data);

                    const events =
                        getEvents(data);


                    return `

                        <article
                            class="registration-card"
                        >

                            <div
                                class="registration-card-head"
                            >

                                <div>

                                    <small>
                                        REGISTRATION
                                    </small>

                                    <strong>
                                        ${escapeHTML(id)}
                                    </strong>

                                </div>


                                <span
                                    class="type-badge ${type}"
                                >
                                    ${
                                        type === "team"
                                            ? "Team"
                                            : "Solo"
                                    }
                                </span>

                            </div>


                            <div
                                class="registration-card-body"
                            >

                                <strong>
                                    ${escapeHTML(name)}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        getTeamName(data)
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        getEmail(data)
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        getMobile(data)
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        events.join(", ") ||
                                        "No events"
                                    )}
                                </span>

                            </div>


                            <div
                                class="registration-card-actions"
                            >

                                <button
                                    type="button"
                                    class="view-btn"
                                    data-key="${escapeHTML(key)}"
                                >
                                    View
                                </button>


                                <button
                                    type="button"
                                    class="edit-btn"
                                    data-key="${escapeHTML(key)}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="delete-btn"
                                    data-key="${escapeHTML(key)}"
                                >
                                    <i class="fa-solid fa-trash"></i>
                                </button>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    mobileRegistrations
        .querySelectorAll(
            "[data-key]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        handleRowAction(
                            button
                        )
                );

            }
        );

}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function render() {

    renderStats();

    renderTable();

}


/* =========================================================
   DETAIL MODAL
========================================================= */

function openDetail(key) {

    const data =
        registrations[key];


    if (!data) {

        showStatus(
            "Registration no longer exists.",
            "error"
        );

        return;

    }


    const id =
        getRegistrationId(
            data,
            key
        );

    const members =
        getMembers(data);

    const events =
        getEvents(data);


    if (detailId) {

        detailId.textContent =
            id;

    }


    if (detailContent) {

        detailContent.innerHTML = `

            <div
                class="detail-grid"
            >

                <div class="detail-item">

                    <span>
                        REGISTRATION ID
                    </span>

                    <strong>
                        ${escapeHTML(id)}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        LEADER NAME
                    </span>

                    <strong>
                        ${escapeHTML(
                            getName(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        CLASS
                    </span>

                    <strong>
                        ${escapeHTML(
                            getClassName(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        SECTION
                    </span>

                    <strong>
                        ${escapeHTML(
                            getSection(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        MOBILE
                    </span>

                    <strong>
                        ${escapeHTML(
                            getMobile(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        EMAIL
                    </span>

                    <strong>
                        ${escapeHTML(
                            getEmail(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        TEAM
                    </span>

                    <strong>
                        ${escapeHTML(
                            getTeamName(data)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        TYPE
                    </span>

                    <strong>
                        ${escapeHTML(
                            normalizeType(data)
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
                                getTimestamp(data)
                            )
                        )}
                    </strong>

                </div>

            </div>


            <div class="detail-block">

                <span>
                    EVENTS
                </span>

                <p>

                    ${
                        events.length
                            ? events
                                .map(
                                    event =>
                                        escapeHTML(event)
                                )
                                .join(", ")
                            : "—"
                    }

                </p>

            </div>


            <div class="detail-block">

                <span>
                    TEAM MEMBERS
                </span>

                <p>

                    ${
                        members.length

                            ? members
                                .map(
                                    (
                                        member,
                                        index
                                    ) => `

                                        ${
                                            index + 1
                                        }.

                                        ${escapeHTML(
                                            typeof member ===
                                            "object"

                                                ? JSON.stringify(
                                                    member
                                                )

                                                : member
                                        )}

                                    `
                                )
                                .join("<br>")

                            : "No additional members."
                    }

                </p>

            </div>


            <div class="detail-block">

                <span>
                    REMARKS
                </span>

                <p>
                    ${escapeHTML(
                        getRemarks(data) ||
                        "—"
                    )}
                </p>

            </div>

        `;

    }


    detailOverlay?.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE DETAIL
========================================================= */

function closeDetailModal() {

    detailOverlay?.classList.add(
        "hidden"
    );

}


closeDetail?.addEventListener(
    "click",
    closeDetailModal
);


detailOverlay?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            detailOverlay
        ) {

            closeDetailModal();

        }

    }
);


/* =========================================================
   EDIT REGISTRATION
========================================================= */

function openEdit(key) {

    const data =
        registrations[key];


    if (!data) {

        showStatus(
            "Registration no longer exists.",
            "error"
        );

        return;

    }


    const members =
        getMembers(data);


    if (editKey) {

        editKey.value =
            key;

    }


    if (editStudentName) {

        editStudentName.value =
            getName(data);

    }


    if (editStudentClass) {

        editStudentClass.value =
            getClassName(data);

    }


    if (editStudentSection) {

        editStudentSection.value =
            getSection(data);

    }


    if (editMobileNumber) {

        const mobile =
            getMobile(data);

        editMobileNumber.value =
            mobile === "—"
                ? ""
                : mobile;

    }


    if (editEmailAddress) {

        const email =
            getEmail(data);

        editEmailAddress.value =
            email === "—"
                ? ""
                : email;

    }


    if (editTeamName) {

        const team =
            getTeamName(data);

        editTeamName.value =
            team === "—"
                ? ""
                : team;

    }


    if (editRemarks) {

        editRemarks.value =
            getRemarks(data);

    }


    if (editMessage) {

        editMessage.textContent =
            "";

    }


    if (editMembers) {

        if (
            members.length
        ) {

            editMembers.innerHTML =
                members
                    .map(
                        (
                            member,
                            index
                        ) => `

                            <label>

                                Member
                                ${index + 1}

                                <input
                                    class="edit-member-input"
                                    data-index="${index}"
                                    value="${escapeHTML(
                                        typeof member ===
                                        "object"

                                            ? firstValue(
                                                member,
                                                [
                                                    "name",
                                                    "studentName"
                                                ],
                                                JSON.stringify(
                                                    member
                                                )
                                            )

                                            : member
                                    )}"
                                >

                            </label>

                        `
                    )
                    .join("");

        }

        else {

            editMembers.innerHTML = `

                <p
                    style="
                        opacity:.65;
                    "
                >
                    No team members recorded.
                </p>

            `;

        }

    }


    editOverlay?.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE EDIT
========================================================= */

function closeEditModal() {

    editOverlay?.classList.add(
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


        const key =
            editKey?.value;


        if (
            !key ||
            !registrations[key]
        ) {

            return;

        }


        const memberInputs = [

            ...(editMembers
                ?.querySelectorAll(
                    ".edit-member-input"
                ) || [])

        ];


        const members =
            memberInputs

                .map(
                    input =>
                        input.value.trim()
                )

                .filter(Boolean);


        const current =
            registrations[key];


        const payload = {

            ...current,

            studentName:
                editStudentName
                    ?.value
                    .trim() || "",

            studentClass:
                editStudentClass
                    ?.value || "",

            studentSection:
                editStudentSection
                    ?.value
                    .trim() || "",

            mobileNumber:
                editMobileNumber
                    ?.value
                    .trim() || "",

            emailAddress:
                editEmailAddress
                    ?.value
                    .trim() || "",

            teamName:
                editTeamName
                    ?.value
                    .trim() || "",

            members,

            remarks:
                editRemarks
                    ?.value
                    .trim() || "",

            updatedAt:
                Date.now(),

            updatedBy:
                auth.currentUser?.uid || ""

        };


        try {

            if (editMessage) {

                editMessage.textContent =
                    "Saving changes...";

            }


            await update(

                ref(
                    db,
                    `${REGISTRATIONS_PATH}/${key}`
                ),

                payload

            );


            if (editMessage) {

                editMessage.textContent =
                    "✓ Changes saved successfully.";

            }


            showToast(
                "Registration updated successfully."
            );


            setTimeout(
                closeEditModal,
                700
            );


        }

        catch (error) {

            console.error(
                "Registration update error:",
                error
            );


            if (editMessage) {

                editMessage.textContent =
                    "Unable to save changes. Check Firebase Database Rules.";

            }


            showStatus(
                "Firebase denied the registration update.",
                "error"
            );

        }

    }
);


/* =========================================================
   DELETE REGISTRATION
========================================================= */

function openConfirmDelete(key) {

    const data =
        registrations[key];


    if (!data) {

        showStatus(
            "Registration no longer exists.",
            "error"
        );

        return;

    }


    pendingDeleteKey =
        key;


    if (confirmMessage) {

        const id =
            getRegistrationId(
                data,
                key
            );

        const name =
            getName(data);


        confirmMessage.textContent =

            `This will permanently delete registration ${id} (${name}) from the database. This action cannot be undone.`;

    }


    confirmOverlay?.classList.remove(
        "hidden"
    );

}


function closeConfirmModal() {

    confirmOverlay?.classList.add(
        "hidden"
    );

    pendingDeleteKey =
        null;

}


cancelDeleteBtn?.addEventListener(
    "click",
    closeConfirmModal
);


confirmOverlay?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            confirmOverlay
        ) {

            closeConfirmModal();

        }

    }
);


confirmDeleteBtn?.addEventListener(
    "click",
    async () => {

        const key =
            pendingDeleteKey;


        if (
            !key ||
            !registrations[key]
        ) {

            closeConfirmModal();

            return;

        }


        const originalLabel =
            confirmDeleteBtn.innerHTML;


        try {

            confirmDeleteBtn.disabled =
                true;

            confirmDeleteBtn.innerHTML =
                `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;


            await remove(

                ref(
                    db,
                    `${REGISTRATIONS_PATH}/${key}`
                )

            );


            showToast(
                "Registration deleted successfully."
            );


            closeConfirmModal();


        }

        catch (error) {

            console.error(
                "Registration delete error:",
                error
            );


            showStatus(
                "Firebase denied the registration delete. Check Database Rules.",
                "error"
            );

        }

        finally {

            confirmDeleteBtn.disabled =
                false;

            confirmDeleteBtn.innerHTML =
                originalLabel;

        }

    }
);


/* =========================================================
   LOAD REGISTRATIONS
========================================================= */

function loadRegistrations() {

    showStatus(
        "Connecting to Firebase registrations..."
    );


    if (
        firebaseListener
    ) {

        firebaseListener();

        firebaseListener =
            null;

    }


    const registrationsRef =
        ref(
            db,
            REGISTRATIONS_PATH
        );


    firebaseListener =
        onValue(

            registrationsRef,

            snapshot => {

                const data =
                    snapshot.val();


                registrations =
                    data &&
                    typeof data === "object"
                        ? data
                        : {};


                render();


                showStatus(

                    `${
                        Object.keys(
                            registrations
                        ).length
                    } registration(s) loaded.`,

                    "success"

                );

            },


            error => {

                console.error(
                    "Firebase registrations read error:",
                    error
                );


                registrations =
                    {};


                render();


                showStatus(

                    "Firebase could not load registrations. Check Database Rules and REGISTRATIONS_PATH.",

                    "error"

                );

            }

        );

}


/* =========================================================
   CSV ESCAPE
========================================================= */

function csvEscape(value) {

    return `"${String(
        value ?? ""
    ).replaceAll(
        '"',
        '""'
    )}"`;

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV() {

    const entries =
        filteredEntries();


    if (
        !entries.length
    ) {

        showToast(
            "There are no registrations to export."
        );

        return;

    }


    const headers = [

        "Registration ID",

        "Leader Name",

        "Class",

        "Section",

        "Mobile",

        "Email",

        "Team",

        "Type",

        "Members",

        "Events",

        "Remarks",

        "Submitted"

    ];


    const rows =
        entries.map(
            ([key, data]) => [

                getRegistrationId(
                    data,
                    key
                ),

                getName(data),

                getClassName(data),

                getSection(data),

                getMobile(data),

                getEmail(data),

                getTeamName(data),

                normalizeType(data),

                getMembers(data)
                    .map(
                        member =>

                            typeof member ===
                            "object"

                                ? firstValue(
                                    member,
                                    [
                                        "name",
                                        "studentName"
                                    ],
                                    JSON.stringify(
                                        member
                                    )
                                )

                                : member
                    )
                    .join("; "),

                getEvents(data)
                    .join("; "),

                getRemarks(data),

                formatDate(
                    getTimestamp(data)
                )

            ]
        );


    const csv = [

        headers,

        ...rows

    ]

        .map(
            row =>
                row
                    .map(csvEscape)
                    .join(",")
        )

        .join("\r\n");


    const blob =
        new Blob(
            [
                "\uFEFF" + csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `aps-robotics-registrations-${
            new Date()
                .toISOString()
                .slice(0, 10)
        }.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "CSV exported successfully."
    );

}


/* =========================================================
   SEARCH
========================================================= */

search?.addEventListener(
    "input",
    renderTable
);


/* =========================================================
   TYPE FILTER
========================================================= */

typeFilter?.addEventListener(
    "change",
    renderTable
);


/* =========================================================
   EVENT FILTER
========================================================= */

eventFilter?.addEventListener(
    "change",
    renderTable
);


/* =========================================================
   CLEAR SEARCH
========================================================= */

clearSearch?.addEventListener(
    "click",
    () => {

        if (search) {

            search.value =
                "";

        }


        renderTable();


        search?.focus();

    }
);


/* =========================================================
   REFRESH
========================================================= */

refreshBtn?.addEventListener(
    "click",
    () => {

        loadRegistrations();

    }
);


/* =========================================================
   EXPORT
========================================================= */

exportBtn?.addEventListener(
    "click",
    exportCSV
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
                "admin-login.html"
            );

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            showStatus(
                "Logout failed.",
                "error"
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
         * Not logged in
         */

        if (!user) {

            window.location.replace(
                "admin-login.html"
            );

            return;

        }


        /*
         * ADMIN UID CHECK
         */

        if (

            ADMIN_UID &&

            ADMIN_UID !==
                "REPLACE_WITH_NEW_PROJECT_ADMIN_UID"

        ) {

            if (
                user.uid !==
                ADMIN_UID
            ) {

                alert(
                    "Access denied. This account is not authorized as an administrator."
                );


                signOut(
                    auth
                )
                .finally(
                    () => {

                        window.location.replace(
                            "admin-login.html"
                        );

                    }
                );


                return;

            }

        }

        else {

            console.warn(
                "ADMIN_UID has not been configured. Any authenticated Firebase user can pass the client-side admin check."
            );

        }


        /*
         * ADMIN PROFILE
         */

        if (adminName) {

            adminName.textContent =

                user.displayName ||

                user.email
                    ?.split("@")[0] ||

                "Administrator";

        }


        if (adminEmail) {

            adminEmail.textContent =
                user.email ||
                user.uid;

        }


        /*
         * SHOW DASHBOARD
         */

        loadingScreen?.classList.add(
            "hidden"
        );


        appShell?.classList.remove(
            "hidden"
        );


        showStatus(

            `Administrator authenticated: ${
                user.email ||
                user.uid
            }`,

            "success"

        );


        /*
         * LOAD NEW FIREBASE DATABASE
         */

        loadRegistrations();

    }

);
