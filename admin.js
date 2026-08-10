/* =========================================================
   ADMIN.JS
   APS ROBOTICS CHAMPIONSHIP 2026

   FIREBASE STRUCTURE USED:

   /registrations

   StudentName
   Class
   Section
   MobileNumber
   EmailAddress
   TeamName
   TeamSize

   Member2Name
   Member2Class
   Member2Section

   Member3Name
   Member3Class
   Member3Section

   Member4Name
   Member4Class
   Member4Section

   Member5Name
   Member5Class
   Member5Section

   Events
   Remarks
   registrationId
   registrationDate

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
    remove,
    get
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

import {
    mainFirebaseConfig,
    ADMIN_UID
} from "./firebase-config.js";


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(mainFirebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


/* =========================================================
   DATABASE PATH
========================================================= */

const REGISTRATIONS_PATH = "registrations";


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
   MESSAGE TARGET
========================================================= */

const messageTarget =
    document.getElementById("messageTarget");

if (messageTarget) {

    messageTarget.addEventListener("change", () => {

        document
            .querySelectorAll("[data-message-panel]")
            .forEach(panel => {

                panel.classList.toggle(
                    "hidden",
                    panel.dataset.messagePanel !==
                    messageTarget.value
                );

            });

    });

}


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
   DELETE MODAL
========================================================= */

const confirmOverlay =
    document.getElementById("confirmOverlay");

const confirmMessage =
    document.getElementById("confirmMessage");

const cancelDeleteBtn =
    document.getElementById("cancelDelete");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");

let pendingDeleteKey = null;


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
   WEBSITE CONTENT EDITOR
========================================================= */

const saveContentBtn =
    document.getElementById("saveContentBtn");

const contentStatus =
    document.getElementById("contentStatus");


function loadWebsiteContent() {

    get(ref(db, "siteContent/messages"))
        .then(snapshot => {

            if (!snapshot.exists()) {
                return;
            }

            const data = snapshot.val() || {};


            const principalText =
                document.getElementById("editPrincipalText");

            const principalName =
                document.getElementById("editPrincipalName");

            const mentorText =
                document.getElementById("editMentorText");

            const mentorName =
                document.getElementById("editMentorName");

            const coordText =
                document.getElementById("editCoordText");

            const coordName =
                document.getElementById("editCoordName");

            const teamText =
                document.getElementById("editTeamText");

            const teamName =
                document.getElementById("editTeamName");


            if (principalText) {
                principalText.value =
                    data.principalText || "";
            }

            if (principalName) {
                principalName.value =
                    data.principalName ||
                    "Sadhna Devi";
            }

            if (mentorText) {
                mentorText.value =
                    data.mentorText || "";
            }

            if (mentorName) {
                mentorName.value =
                    data.mentorName ||
                    "Akansha Rani";
            }

            if (coordText) {
                coordText.value =
                    data.coordText || "";
            }

            if (coordName) {
                coordName.value =
                    data.coordName &&
                    data.coordName !==
                    "Ayush Kumar Singh"
                        ? data.coordName
                        : "Championship Coordination Team";
            }

            if (teamText) {
                teamText.value =
                    data.teamText || "";
            }

            if (teamName) {
                teamName.value =
                    data.teamName ||
                    "APS Robotics Championship Team";
            }

        })
        .catch(error => {

            console.error(
                "Website content load error:",
                error
            );

        });

}


/* =========================================================
   SAVE WEBSITE CONTENT
========================================================= */

saveContentBtn?.addEventListener(
    "click",
    async () => {

        if (contentStatus) {
            contentStatus.textContent =
                "Saving...";
        }

        try {

            await update(
                ref(db, "siteContent/messages"),
                {

                    principalText:
                        document.getElementById(
                            "editPrincipalText"
                        )?.value || "",

                    principalName:
                        document.getElementById(
                            "editPrincipalName"
                        )?.value || "",

                    mentorText:
                        document.getElementById(
                            "editMentorText"
                        )?.value || "",

                    mentorName:
                        document.getElementById(
                            "editMentorName"
                        )?.value || "",

                    coordText:
                        document.getElementById(
                            "editCoordText"
                        )?.value || "",

                    coordName:
                        document.getElementById(
                            "editCoordName"
                        )?.value || "",

                    teamText:
                        document.getElementById(
                            "editTeamText"
                        )?.value || "",

                    teamName:
                        document.getElementById(
                            "editTeamName"
                        )?.value || ""

                }
            );


            if (contentStatus) {

                contentStatus.textContent =
                    "✓ Website content updated successfully.";

                contentStatus.style.color =
                    "#4ee7a1";

            }

        } catch (error) {

            console.error(error);

            if (contentStatus) {

                contentStatus.textContent =
                    "Error saving content.";

                contentStatus.style.color =
                    "#ff6464";

            }

        }

    }
);


/* =========================================================
   TAB SWITCHING
========================================================= */

const navLinks =
    document.querySelectorAll(".nav-link");

const sections =
    document.querySelectorAll(".page-section");


navLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();


        navLinks.forEach(item => {
            item.classList.remove("active");
        });


        sections.forEach(section => {
            section.classList.add("hidden");
        });


        link.classList.add("active");


        const href =
            link.getAttribute("href") || "";

        const targetId =
            href.startsWith("#")
                ? href.substring(1)
                : href;


        const targetSection =
            document.getElementById(targetId);


        if (
            targetId === "registrations" ||
            targetId === "dashboard" ||
            targetId === "events"
        ) {

            const dashboard =
                document.getElementById("dashboard");

            const registrationsSection =
                document.getElementById("registrations");

            const eventsSection =
                document.getElementById("events");


            if (dashboard) {

                dashboard.classList.toggle(
                    "hidden",
                    targetId !== "dashboard"
                );

            }


            if (registrationsSection) {

                registrationsSection.classList.toggle(
                    "hidden",
                    targetId !== "registrations"
                );

            }


            if (eventsSection) {

                eventsSection.classList.toggle(
                    "hidden",
                    targetId !== "events"
                );

            }

        } else {

            targetSection?.classList.remove(
                "hidden"
            );

        }

    });

});


/* =========================================================
   STATUS
========================================================= */

function showStatus(message, type = "") {

    if (!status) {
        return;
    }

    status.textContent = message;

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
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   GENERIC VALUE HELPERS
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


function firstValue(
    data,
    fields,
    fallback = ""
) {

    for (const field of fields) {

        const value =
            valueOf(
                data,
                field,
                ""
            );

        if (value !== "") {
            return value;
        }

    }

    return fallback;

}


/* =========================================================
   REGISTRATION FIELDS
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


function getName(data) {

    return firstValue(
        data,
        [
            "StudentName",
            "studentName",
            "name",
            "leaderName",
            "participantName"
        ],
        "—"
    );

}


function getClassName(data) {

    return firstValue(
        data,
        [
            "Class",
            "studentClass",
            "className",
            "class"
        ],
        "—"
    );

}


function getSection(data) {

    return firstValue(
        data,
        [
            "Section",
            "studentSection",
            "section"
        ],
        "—"
    );

}


function getMobile(data) {

    return firstValue(
        data,
        [
            "MobileNumber",
            "mobileNumber",
            "mobile",
            "phone",
            "phoneNumber"
        ],
        "—"
    );

}


function getEmail(data) {

    return firstValue(
        data,
        [
            "EmailAddress",
            "emailAddress",
            "email"
        ],
        "—"
    );

}


function getTeamName(data) {

    return firstValue(
        data,
        [
            "TeamName",
            "teamName",
            "team"
        ],
        "—"
    );

}


function getRemarks(data) {

    return firstValue(
        data,
        [
            "Remarks",
            "remarks",
            "remark",
            "notes"
        ],
        ""
    );

}


function getTimestamp(data) {

    return firstValue(
        data,
        [
            "registrationDate",
            "timestamp",
            "createdAt",
            "created_at",
            "registeredAt"
        ],
        ""
    );

}


/* =========================================================
   TEAM SIZE

   IMPORTANT:
   TeamSize is the PRIMARY source of truth.
========================================================= */

function getTeamSize(data) {

    if (!data || typeof data !== "object") {
        return 1;
    }


    const raw =
        data.TeamSize ??
        data.teamSize ??
        data.team_size ??
        data.memberCount ??
        data.numberOfMembers ??
        "";


    const size =
        parseInt(
            String(raw),
            10
        );


    if (
        Number.isFinite(size) &&
        size >= 1
    ) {

        return size;

    }


    return 1;

}


/* =========================================================
   TEAM MEMBERS

   Firebase format:

   Member2Name
   Member2Class
   Member2Section

   Member3Name
   Member3Class
   Member3Section

   Member4Name
   Member4Class
   Member4Section

   Member5Name
   Member5Class
   Member5Section
========================================================= */

function getMembers(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return [];

    }


    const members = [];


    for (
        let i = 2;
        i <= 5;
        i++
    ) {

        const name =
            data[`Member${i}Name`] ??
            data[`member${i}Name`] ??
            data[`member${i}name`] ??
            "";


        const className =
            data[`Member${i}Class`] ??
            data[`member${i}Class`] ??
            data[`member${i}class`] ??
            "";


        const section =
            data[`Member${i}Section`] ??
            data[`member${i}Section`] ??
            data[`member${i}section`] ??
            "";


        if (
            String(name).trim() !== ""
        ) {

            members.push({

                name:
                    String(name).trim(),

                className:
                    String(className ?? "").trim(),

                section:
                    String(section ?? "").trim()

            });

        }

    }


    return members;

}


/* =========================================================
   SOLO / TEAM DETECTION

   PRIORITY:

   1. TeamSize
   2. Member2-5
   3. Old type field
========================================================= */

function normalizeType(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return "solo";

    }


    /* -----------------------------------------------------
       FIRST: TeamSize
    ----------------------------------------------------- */

    const teamSize =
        getTeamSize(data);


    if (teamSize > 1) {

        return "team";

    }


    /* -----------------------------------------------------
       SECOND: Actual team members
    ----------------------------------------------------- */

    const members =
        getMembers(data);


    if (members.length > 0) {

        return "team";

    }


    /* -----------------------------------------------------
       THIRD: Legacy type field
    ----------------------------------------------------- */

    const rawType =
        String(
            data.type ??
            data.registrationType ??
            data.participantType ??
            data.ParticipationType ??
            ""
        )
        .trim()
        .toLowerCase();


    if (
        rawType.includes("team") ||
        rawType.includes("group")
    ) {

        return "team";

    }


    return "solo";

}


/* =========================================================
   EVENTS
========================================================= */

function getEvents(data) {

    const raw =
        data?.Events ??
        data?.events ??
        data?.event ??
        data?.selectedEvents ??
        "";


    if (Array.isArray(raw)) {

        return raw
            .map(v => String(v).trim())
            .filter(Boolean);

    }


    if (
        raw &&
        typeof raw === "object"
    ) {

        return Object.values(raw)
            .map(v => String(v).trim())
            .filter(Boolean);

    }


    if (
        typeof raw === "string"
    ) {

        return raw
            .split(/\r?\n|,/)
            .map(v => v.trim())
            .filter(Boolean);

    }


    return [];

}


/* =========================================================
   EVENT MATCHING
========================================================= */

function hasEvent(
    data,
    eventName
) {

    const target =
        eventName
            .trim()
            .toLowerCase();


    return getEvents(data)
        .some(event =>
            String(event)
                .trim()
                .toLowerCase()
                === target
        );

}


/* =========================================================
   DATE FORMAT
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

    } else if (
        !Number.isNaN(
            Number(value)
        ) &&
        String(value).trim() !== ""
    ) {

        date =
            new Date(
                Number(value)
            );

    } else {

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
   MEMBER DISPLAY
========================================================= */

function formatMemberHTML(
    member,
    index
) {

    if (!member) {
        return "";
    }


    const name =
        member.name ||
        "Unnamed Member";


    const className =
        member.className ||
        "—";


    const section =
        member.section ||
        "—";


    return `
        <div class="team-member-detail"
             style="
                padding:12px 14px;
                margin:8px 0;
                border-radius:12px;
                background:rgba(255,255,255,.04);
                border:1px solid rgba(255,255,255,.08);
             ">

            <strong style="
                display:block;
                font-size:14px;
                margin-bottom:5px;
            ">
                ${index}. ${escapeHTML(name)}
            </strong>

            <small style="
                opacity:.75;
            ">
                Class: ${escapeHTML(className)}
                &nbsp; • &nbsp;
                Section: ${escapeHTML(section)}
            </small>

        </div>
    `;

}


/* =========================================================
   MEMBER COUNT
========================================================= */

function getDisplayedMemberCount(data) {

    const size =
        getTeamSize(data);


    if (size > 1) {
        return size;
    }


    const members =
        getMembers(data);


    if (members.length > 0) {

        return members.length + 1;

    }


    return 1;

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
            .toLowerCase() ||
        "";


    if (!query) {
        return true;
    }


    const members =
        getMembers(data);


    const memberText =
        members
            .map(member =>
                [
                    member.name,
                    member.className,
                    member.section
                ].join(" ")
            )
            .join(" ");


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

        getTeamSize(data),

        ...getEvents(data),

        memberText

    ]
    .join(" ")
    .toLowerCase();


    return searchable.includes(query);

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
        normalizeType(data) !==
        selectedType
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
   FILTERED ENTRIES
========================================================= */

function filteredEntries() {

    return Object
        .entries(registrations)
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
   DASHBOARD STATISTICS
========================================================= */

function renderStats() {

    const entries =
        Object.entries(
            registrations
        );


    const solo =
        entries.filter(
            ([, data]) =>
                normalizeType(data)
                === "solo"
        ).length;


    const team =
        entries.filter(
            ([, data]) =>
                normalizeType(data)
                === "team"
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
   ROW ACTION
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

    } else if (
        button.classList.contains(
            "delete-btn"
        )
    ) {

        openConfirmDelete(key);

    } else {

        openDetail(key);

    }

}


/* =========================================================
   RENDER DESKTOP TABLE
========================================================= */

function renderTable() {

    if (!registrationBody) {
        return;
    }


    const entries =
        filteredEntries();


    if (entries.length === 0) {

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
                        Try changing the search or filters.
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
        entries.map(
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


                const memberCount =
                    getDisplayedMemberCount(
                        data
                    );


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
                            <strong>
                                ${memberCount}
                            </strong>
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

                            <div
                                class="event-list"
                            >

                                ${
                                    events.length
                                        ? events.map(
                                            event =>
                                                `<span class="event-pill">
                                                    ${escapeHTML(event)}
                                                </span>`
                                          ).join("")
                                        : "—"
                                }

                            </div>

                        </td>


                        <td>

                            <div
                                class="action-buttons"
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
                                    title="Delete registration"
                                >
                                    <i
                                        class="fa-solid fa-trash"
                                    ></i>
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    registrationBody
        .querySelectorAll(
            "[data-key]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    handleRowAction(
                        button
                    )
            );

        });


    renderMobile(entries);

}


/* =========================================================
   MOBILE REGISTRATIONS
========================================================= */

function renderMobile(entries) {

    if (!mobileRegistrations) {
        return;
    }


    mobileRegistrations.innerHTML =
        entries.map(
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


                const memberCount =
                    getDisplayedMemberCount(
                        data
                    );


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
                                Team:
                                ${escapeHTML(
                                    getTeamName(data)
                                )}
                            </span>


                            <span>
                                Members:
                                ${memberCount}
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
                                ${
                                    escapeHTML(
                                        events.join(", ")
                                    ) ||
                                    "No events"
                                }
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
                                <i
                                    class="fa-solid fa-trash"
                                ></i>
                            </button>

                        </div>

                    </article>

                `;

            }
        ).join("");


    mobileRegistrations
        .querySelectorAll(
            "[data-key]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    handleRowAction(
                        button
                    )
            );

        });

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


    const type =
        normalizeType(data);


    const teamSize =
        getDisplayedMemberCount(data);


    if (detailId) {

        detailId.textContent =
            id;

    }


    if (detailContent) {

        detailContent.innerHTML = `

            <div class="detail-grid">


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
                        ${
                            type === "team"
                                ? "Team"
                                : "Solo"
                        }
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        TEAM SIZE
                    </span>

                    <strong>
                        ${teamSize}
                        Member${teamSize === 1 ? "" : "s"}
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
                                        escapeHTML(
                                            event
                                        )
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


                ${
                    members.length
                        ? members
                            .map(
                                (member, index) =>
                                    formatMemberHTML(
                                        member,
                                        index + 2
                                    )
                            )
                            .join("")
                        : `
                            <p>
                                No additional team members.
                            </p>
                        `
                }

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
   EDIT MODAL
========================================================= */

function openEdit(key) {

    const data =
        registrations[key];


    if (!data) {
        return;
    }


    if (editKey) {
        editKey.value = key;
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

        const teamName =
            getTeamName(data);

        editTeamName.value =
            teamName === "—"
                ? ""
                : teamName;

    }


    if (editRemarks) {

        editRemarks.value =
            getRemarks(data);

    }


    /*
     * Display team members in edit modal
     */

    if (editMembers) {

        const members =
            getMembers(data);


        editMembers.innerHTML =
            members.length
                ? members
                    .map(
                        (member, index) => `

                            <div
                                style="
                                    padding:10px;
                                    margin-bottom:8px;
                                    border-radius:10px;
                                    border:1px solid
                                        rgba(255,255,255,.1);
                                "
                            >

                                <strong>
                                    Member ${index + 2}
                                </strong>

                                <div>
                                    ${escapeHTML(
                                        member.name
                                    )}
                                </div>

                                <small>
                                    Class:
                                    ${escapeHTML(
                                        member.className ||
                                        "—"
                                    )}

                                    &nbsp; • &nbsp;

                                    Section:
                                    ${escapeHTML(
                                        member.section ||
                                        "—"
                                    )}
                                </small>

                            </div>

                        `
                    )
                    .join("")
                : "<p>No additional members.</p>";

    }


    if (editMessage) {

        editMessage.textContent =
            "";

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


/* =========================================================
   EDIT FORM SUBMIT
========================================================= */

editForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const key =
            editKey?.value;


        if (!key) {
            return;
        }


        const originalText =
            editMessage?.textContent ||
            "";


        try {

            if (editMessage) {

                editMessage.textContent =
                    "Saving...";

            }


            const current =
                registrations[key];


            if (!current) {

                throw new Error(
                    "Registration not found."
                );

            }


            await update(
                ref(
                    db,
                    `${REGISTRATIONS_PATH}/${key}`
                ),
                {

                    StudentName:
                        editStudentName?.value
                            ?.trim() ||
                        "",

                    Class:
                        editStudentClass?.value
                            ?.trim() ||
                        "",

                    Section:
                        editStudentSection?.value
                            ?.trim() ||
                        "",

                    MobileNumber:
                        editMobileNumber?.value
                            ?.trim() ||
                        "",

                    EmailAddress:
                        editEmailAddress?.value
                            ?.trim() ||
                        "",

                    TeamName:
                        editTeamName?.value
                            ?.trim() ||
                        "",

                    Remarks:
                        editRemarks?.value
                            ?.trim() ||
                        ""

                }
            );


            if (editMessage) {

                editMessage.textContent =
                    "✓ Registration updated successfully.";

            }


            showToast(
                "Registration updated successfully."
            );


            setTimeout(
                closeEditModal,
                800
            );


        } catch (error) {

            console.error(
                "Edit error:",
                error
            );


            if (editMessage) {

                editMessage.textContent =
                    "Firebase denied the update.";

            }


            showStatus(
                "Could not update registration.",
                "error"
            );

        }

    }
);


/* =========================================================
   DELETE CONFIRMATION
========================================================= */

function openConfirmDelete(key) {

    const data =
        registrations[key];


    if (!data) {
        return;
    }


    pendingDeleteKey =
        key;


    if (confirmMessage) {

        confirmMessage.textContent =
            `This will permanently delete registration ${
                getRegistrationId(data, key)
            } (${
                getName(data)
            }) from the database.`;

    }


    confirmOverlay?.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

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


/* =========================================================
   CONFIRM DELETE
========================================================= */

confirmDeleteBtn?.addEventListener(
    "click",
    async () => {

        const key =
            pendingDeleteKey;


        if (!key) {
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


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );


            showStatus(
                "Firebase denied the registration delete.",
                "error"
            );

        } finally {

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


    if (firebaseListener) {

        firebaseListener();

        firebaseListener =
            null;

    }


    firebaseListener =
        onValue(
            ref(
                db,
                REGISTRATIONS_PATH
            ),

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
                    `${Object.keys(registrations).length} registration(s) loaded.`,
                    "success"
                );

            },

            error => {

                console.error(
                    "Firebase load error:",
                    error
                );


                registrations =
                    {};


                render();


                showStatus(
                    "Firebase could not load registrations.",
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
   CSV EXPORT
========================================================= */

function exportCSV() {

    const entries =
        filteredEntries();


    if (!entries.length) {

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
        "Team Size",
        "Members",
        "Events",
        "Remarks",
        "Submitted"

    ];


    const rows =
        entries.map(
            ([key, data]) => {

                const members =
                    getMembers(data);


                const memberText =
                    members
                        .map(
                            member =>
                                `${member.name} | Class ${member.className || "—"} | Section ${member.section || "—"}`
                        )
                        .join("; ");


                return [

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

                    getDisplayedMemberCount(
                        data
                    ),

                    memberText,

                    getEvents(data)
                        .join("; "),

                    getRemarks(data),

                    formatDate(
                        getTimestamp(data)
                    )

                ];

            }
        );


    const csv =
        [
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
                "\uFEFF" +
                csv
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

let searchTimeout;


search?.addEventListener(
    "input",
    () => {

        clearTimeout(
            searchTimeout
        );


        searchTimeout =
            setTimeout(
                renderTable,
                300
            );

    }
);


typeFilter?.addEventListener(
    "change",
    renderTable
);


eventFilter?.addEventListener(
    "change",
    renderTable
);


clearSearch?.addEventListener(
    "click",
    () => {

        if (search) {
            search.value = "";
        }


        renderTable();


        search?.focus();

    }
);


refreshBtn?.addEventListener(
    "click",
    loadRegistrations
);


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

            await signOut(auth);


            window.location.replace(
                "admin-login.html"
            );


        } catch (error) {

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

        if (!user) {

            window.location.replace(
                "admin-login.html"
            );

            return;

        }


        /*
         * ADMIN UID SECURITY
         */

        if (
            ADMIN_UID !==
            "REPLACE_WITH_MAIN_PROJECT_ADMIN_UID"
        ) {

            if (
                user.uid !==
                ADMIN_UID
            ) {

                alert(
                    "Access denied. This account is not authorized as an administrator."
                );


                signOut(auth)
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


        loadRegistrations();


        loadWebsiteContent();

    }
);


/* =========================================================
   ADMIN MOBILE MENU
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const menuToggle =
            document.getElementById(
                "menuToggle"
            );


        const adminSidebar =
            document.getElementById(
                "adminSidebar"
            );


        const sidebarOverlay =
            document.getElementById(
                "sidebarOverlay"
            );


        if (
            !menuToggle ||
            !adminSidebar ||
            !sidebarOverlay
        ) {

            console.error(
                "Admin menu: Required elements were not found."
            );


            return;

        }


        function openMenu() {

            adminSidebar.classList.add(
                "active"
            );


            sidebarOverlay.classList.add(
                "active"
            );


            menuToggle.classList.add(
                "active"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );


            menuToggle.setAttribute(
                "aria-label",
                "Close navigation"
            );

        }


        function closeMenu() {

            adminSidebar.classList.remove(
                "active"
            );


            sidebarOverlay.classList.remove(
                "active"
            );


            menuToggle.classList.remove(
                "active"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );


            menuToggle.setAttribute(
                "aria-label",
                "Open navigation"
            );

        }


        function toggleMenu() {

            if (
                adminSidebar.classList.contains(
                    "active"
                )
            ) {

                closeMenu();

            } else {

                openMenu();

            }

        }


        menuToggle.addEventListener(
            "click",
            toggleMenu
        );


        sidebarOverlay.addEventListener(
            "click",
            closeMenu
        );


        const sidebarLinks =
            adminSidebar.querySelectorAll(
                ".sidebar-link"
            );


        sidebarLinks.forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        if (
                            window.innerWidth <= 900
                        ) {

                            closeMenu();

                        }

                    }
                );

            }
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeMenu();

                }

            }
        );


        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth > 900
                ) {

                    closeMenu();

                }

            }
        );

    }
);
