/* =========================================================
   ADMIN.JS
   APS ROBOTICS CHAMPIONSHIP 2026

   FIX:
   - Correctly detects Team registrations
   - Supports teamSize / Member2Name formats
   - Supports members / teamMembers / memberList
   - Shows team members with class + section
   - Correct Team/Solo dashboard statistics
   - Correct team member count
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
   DATABASE
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

const statusFilter =
    document.getElementById("statusFilter");

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

    get(
        ref(db, "siteContent/messages")
    )
        .then(snapshot => {

            if (!snapshot.exists()) {
                return;
            }

            const data = snapshot.val();

            const principalText =
                document.getElementById(
                    "editPrincipalText"
                );

            const principalName =
                document.getElementById(
                    "editPrincipalName"
                );

            const mentorText =
                document.getElementById(
                    "editMentorText"
                );

            const mentorName =
                document.getElementById(
                    "editMentorName"
                );

            const coordText =
                document.getElementById(
                    "editCoordText"
                );

            const coordName =
                document.getElementById(
                    "editCoordName"
                );

            const teamText =
                document.getElementById(
                    "editTeamText"
                );

            const teamName =
                document.getElementById(
                    "editTeamName"
                );
            const principalPhoto = document.getElementById("editPrincipalPhoto");
            const mentorPhoto = document.getElementById("editMentorPhoto");
            const coordinatorPhoto = document.getElementById("editCoordinatorPhoto");


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
                "Website content error:",
                error
            );

        });

}


get(ref(db,"siteContent/leadership")).then(snapshot=>{
    const d=snapshot.exists()?snapshot.val():{};
    const set=(id,v)=>{const el=document.getElementById(id); if(el) el.value=v||"";};
    set("editPrincipalPhoto",d.principalPhoto);
    set("editMentorPhoto",d.mentorPhoto);
    set("editCoordinatorPhoto",d.coordinatorPhoto);
}).catch(console.error);

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
                        )?.value ||
                        "APS Robotics Championship Team"

                }
            );

            await update(ref(db,"siteContent/leadership"), {
                principalPhoto: document.getElementById("editPrincipalPhoto")?.value.trim() || "assets/principal.svg",
                mentorPhoto: document.getElementById("editMentorPhoto")?.value.trim() || "assets/mentor.svg",
                coordinatorPhoto: document.getElementById("editCoordinatorPhoto")?.value.trim() || "assets/coordinator.svg",
                principalName: document.getElementById("editPrincipalName")?.value.trim() || "Sadhna Devi",
                mentorName: document.getElementById("editMentorName")?.value.trim() || "Akansha Rani",
                coordinatorName: document.getElementById("editCoordName")?.value.trim() || "Championship Coordination Team"
            });

            if (contentStatus) {

                contentStatus.textContent =
                    "✓ Website content updated successfully.";

                contentStatus.style.color =
                    "#4ee7a1";

            }

        }
        catch (error) {

            console.error(error);

            if (contentStatus) {

                contentStatus.textContent =
                    "Error saving content.";

                contentStatus.style.color =
                    "#ff6b6b";

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

    link.addEventListener(
        "click",
        event => {

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
                targetId === "registrations"
            ) {

                document
                    .getElementById("registrations")
                    ?.classList.remove("hidden");

            }
            else if (
                targetId === "dashboard"
            ) {

                document
                    .getElementById("dashboard")
                    ?.classList.remove("hidden");

            }
            else if (
                targetId === "events"
            ) {

                document
                    .getElementById("events")
                    ?.classList.remove("hidden");

            }
            else {

                targetSection
                    ?.classList.remove("hidden");

            }

        }
    );

});


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
   TOAST
========================================================= */

function showToast(message) {

    if (!toast || !toastText) {
        return;
    }

    toastText.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(
            () => {
                toast.classList.remove("show");
            },
            2500
        );

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
   BASIC VALUE HELPERS
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
   REGISTRATION FIELD HELPERS
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
            "studentName",
            "name",
            "leaderName",
            "teamLeaderName",
            "participantName",
            "StudentName"
        ],
        "—"
    );

}


function getClassName(data) {

    return firstValue(
        data,
        [
            "studentClass",
            "className",
            "class",
            "Class"
        ],
        "—"
    );

}


function getSection(data) {

    return firstValue(
        data,
        [
            "studentSection",
            "section",
            "Section"
        ],
        "—"
    );

}


function getMobile(data) {

    return firstValue(
        data,
        [
            "mobileNumber",
            "mobile",
            "phone",
            "phoneNumber",
            "MobileNumber"
        ],
        "—"
    );

}


function getEmail(data) {

    return firstValue(
        data,
        [
            "emailAddress",
            "email",
            "EmailAddress"
        ],
        "—"
    );

}


function getTeamName(data) {

    return firstValue(
        data,
        [
            "teamName",
            "team",
            "TeamName"
        ],
        "—"
    );

}


function getRegistrationStatus(data) {
    return firstValue(data, ["status","registrationStatus"], "Pending Approval");
}

function getRemarks(data) {

    return firstValue(
        data,
        [
            "remarks",
            "remark",
            "notes",
            "Remarks"
        ],
        ""
    );

}


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
   TEAM MEMBERS
========================================================= */

function getMembers(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return [];

    }


    const members = [];


    /* -----------------------------------------
       FORMAT 1
       members: [...]
    ----------------------------------------- */

    if (Array.isArray(data.members)) {

        data.members.forEach(member => {

            if (
                member &&
                typeof member === "object"
            ) {

                const name =
                    member.name ||
                    member.studentName ||
                    member.memberName ||
                    member.MemberName;

                if (name) {
                    members.push(member);
                }

            }
            else if (
                String(member).trim()
            ) {

                members.push(member);

            }

        });

    }


    /* -----------------------------------------
       FORMAT 2
       teamMembers: [...]
    ----------------------------------------- */

    if (Array.isArray(data.teamMembers)) {

        data.teamMembers.forEach(member => {

            if (
                member &&
                typeof member === "object"
            ) {

                const name =
                    member.name ||
                    member.studentName ||
                    member.memberName ||
                    member.MemberName;

                if (name) {
                    members.push(member);
                }

            }
            else if (
                String(member).trim()
            ) {

                members.push(member);

            }

        });

    }


    /* -----------------------------------------
       FORMAT 3
       memberList: [...]
    ----------------------------------------- */

    if (Array.isArray(data.memberList)) {

        data.memberList.forEach(member => {

            if (
                member &&
                typeof member === "object"
            ) {

                const name =
                    member.name ||
                    member.studentName ||
                    member.memberName ||
                    member.MemberName;

                if (name) {
                    members.push(member);
                }

            }
            else if (
                String(member).trim()
            ) {

                members.push(member);

            }

        });

    }


    /* -----------------------------------------
       FORMAT 4
       Firebase object
    ----------------------------------------- */

    [
        "members",
        "teamMembers",
        "memberList"
    ].forEach(field => {

        const value =
            data[field];

        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        ) {

            Object.values(value)
                .forEach(member => {

                    if (
                        member &&
                        typeof member === "object"
                    ) {

                        const name =
                            member.name ||
                            member.studentName ||
                            member.memberName ||
                            member.MemberName;

                        if (name) {
                            members.push(member);
                        }

                    }
                    else if (
                        String(member).trim()
                    ) {

                        members.push(member);

                    }

                });

        }

    });


    /* -----------------------------------------
       FORMAT 5
       Member2Name
       Member3Name
       etc.
    ----------------------------------------- */

    for (
        let i = 2;
        i <= 10;
        i++
    ) {

        const possibleNames = [

            `Member${i}Name`,

            `member${i}Name`,

            `member${i}`,

            `Member${i}`,

            `member${i}name`

        ];


        let name = "";


        for (
            const field of possibleNames
        ) {

            if (
                data[field] !== undefined &&
                data[field] !== null &&
                String(data[field]).trim() !== ""
            ) {

                name =
                    String(
                        data[field]
                    ).trim();

                break;

            }

        }


        if (!name) {
            continue;
        }


        const member = {

            name: name,

            class:
                data[`Member${i}Class`] ??
                data[`member${i}Class`] ??
                data[`member${i}class`] ??
                data[`Member${i}class`] ??
                "",

            section:
                data[`Member${i}Section`] ??
                data[`member${i}Section`] ??
                data[`member${i}section`] ??
                data[`Member${i}section`] ??
                ""

        };


        members.push(member);

    }


    /* -----------------------------------------
       FORMAT 6
       member2 object
    ----------------------------------------- */

    for (
        let i = 2;
        i <= 10;
        i++
    ) {

        const possibleFields = [

            `member${i}`,

            `Member${i}`,

            `member_${i}`,

            `Member_${i}`

        ];


        for (
            const field of possibleFields
        ) {

            const value =
                data[field];


            if (
                value &&
                typeof value === "object" &&
                !Array.isArray(value)
            ) {

                const name =
                    value.name ||
                    value.studentName ||
                    value.memberName ||
                    value.MemberName;


                if (name) {

                    members.push({

                        name: name,

                        class:
                            value.class ||
                            value.studentClass ||
                            value.className ||
                            "",

                        section:
                            value.section ||
                            value.studentSection ||
                            ""

                    });

                }

            }

        }

    }


    /* -----------------------------------------
       FORMAT 7
       memberNames string
    ----------------------------------------- */

    const memberNames =
        firstValue(
            data,
            [
                "memberNames",
                "teamMemberNames",
                "membersNames"
            ],
            ""
        );


    if (
        typeof memberNames === "string" &&
        memberNames.trim()
    ) {

        memberNames
            .split(/\r?\n|,/)
            .map(name => name.trim())
            .filter(Boolean)
            .forEach(name => {

                members.push({
                    name: name,
                    class: "",
                    section: ""
                });

            });

    }


    /* -----------------------------------------
       REMOVE DUPLICATES
    ----------------------------------------- */

    const unique = [];

    const seen = new Set();


    members.forEach(member => {

        let name = "";


        if (
            member &&
            typeof member === "object"
        ) {

            name =
                member.name ||
                member.studentName ||
                member.memberName ||
                member.MemberName ||
                "";

        }
        else {

            name =
                String(member);

        }


        const key =
            String(name)
                .trim()
                .toLowerCase();


        if (
            key &&
            !seen.has(key)
        ) {

            seen.add(key);

            unique.push(member);

        }

    });


    return unique;

}


/* =========================================================
   TEAM SIZE
========================================================= */

function getTeamSize(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return 1;

    }


    const possibleFields = [

        "teamSize",

        "TeamSize",

        "team_size",

        "membersCount",

        "memberCount",

        "numberOfMembers",

        "numberOfTeamMembers",

        "teamMembersCount",

        "participantCount",

        "participants",

        "TeamMembers"

    ];


    for (
        const field of possibleFields
    ) {

        if (
            data[field] === undefined ||
            data[field] === null ||
            String(data[field]).trim() === ""
        ) {

            continue;

        }


        const raw =
            String(data[field]).trim();


        const match =
            raw.match(/\d+/);


        if (match) {

            const number =
                parseInt(
                    match[0],
                    10
                );


            if (
                Number.isFinite(number) &&
                number > 0
            ) {

                return number;

            }

        }

    }


    /* -----------------------------------------
       If members are available:
       leader + additional members
    ----------------------------------------- */

    const members =
        getMembers(data);


    if (members.length > 0) {

        return members.length + 1;

    }


    /* -----------------------------------------
       Detect Member2Name etc.
    ----------------------------------------- */

    for (
        let i = 2;
        i <= 10;
        i++
    ) {

        const fields = [

            `Member${i}Name`,

            `member${i}Name`,

            `member${i}`,

            `Member${i}`

        ];


        for (
            const field of fields
        ) {

            if (
                data[field] !== undefined &&
                data[field] !== null &&
                String(data[field]).trim() !== ""
            ) {

                return i;

            }

        }

    }


    return 1;

}


/* =========================================================
   REGISTRATION TYPE

   IMPORTANT:
   Team size/member information has priority over
   a potentially incorrect "type: solo" field.
========================================================= */

function normalizeType(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return "solo";

    }


    /* -----------------------------------------
       1. TEAM SIZE
    ----------------------------------------- */

    const teamSize =
        getTeamSize(data);


    if (teamSize > 1) {

        return "team";

    }


    /* -----------------------------------------
       2. MEMBER DATA
    ----------------------------------------- */

    const members =
        getMembers(data);


    if (members.length > 0) {

        return "team";

    }


    /* -----------------------------------------
       3. Explicit member fields
    ----------------------------------------- */

    for (
        let i = 2;
        i <= 10;
        i++
    ) {

        const fields = [

            `Member${i}Name`,

            `member${i}Name`,

            `member${i}`,

            `Member${i}`

        ];


        for (
            const field of fields
        ) {

            if (
                data[field] !== undefined &&
                data[field] !== null &&
                String(data[field]).trim() !== ""
            ) {

                return "team";

            }

        }

    }


    /* -----------------------------------------
       4. Team name

       If a real team name exists, consider it
       a team registration unless it is obviously
       a placeholder.
    ----------------------------------------- */

    const teamName =
        String(
            getTeamName(data)
        )
            .trim()
            .toLowerCase();


    const placeholderTeams = [

        "",

        "—",

        "solo",

        "solo participant",

        "individual",

        "individual participant",

        "n/a",

        "na",

        "none"

    ];


    if (
        teamName &&
        !placeholderTeams.includes(teamName)
    ) {

        return "team";

    }


    /* -----------------------------------------
       5. Explicit type
    ----------------------------------------- */

    const rawType =
        String(
            firstValue(
                data,
                [
                    "type",
                    "registrationType",
                    "participantType",
                    "ParticipationType"
                ],
                ""
            )
        )
            .trim()
            .toLowerCase();


    if (
        rawType.includes("team")
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
        firstValue(
            data,
            [
                "events",
                "event",
                "selectedEvents",
                "Events"
            ],
            []
        );


    if (Array.isArray(raw)) {

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
            .map(v => v.trim())
            .filter(Boolean);

    }


    return [];

}


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
            .toLowerCase() ||
        "";


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

        normalizeType(data),

        String(
            getTeamSize(data)
        ),

        ...getEvents(data),

        ...getMembers(data)
            .map(member => {

                if (
                    member &&
                    typeof member === "object"
                ) {

                    return [

                        member.name ||
                        member.studentName ||
                        member.memberName ||
                        "",

                        member.class ||
                        member.studentClass ||
                        "",

                        member.section ||
                        member.studentSection ||
                        ""

                    ].join(" ");

                }

                return String(member);

            })

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

    const selectedStatus =
        statusFilter?.value ||
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

    if (selectedStatus !== "all" && getRegistrationStatus(data).toLowerCase() !== selectedStatus) {
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
            (total, [, data]) =>
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

    }
    else if (button.classList.contains("delete-btn")) {
        openConfirmDelete(key);
    }
    else if (button.classList.contains("approve-btn")) {
        setRegistrationStatus(key, "Approved");
    }
    else if (button.classList.contains("reject-btn")) {
        setRegistrationStatus(key, "Rejected");
    }
    else {

        openDetail(key);

    }

}


async function setRegistrationStatus(key, newStatus) {
    const data = registrations[key];
    if (!data) return;
    const registrationId = getRegistrationId(data, key);
    const note = newStatus === "Approved"
        ? "Registration approved. Our team will contact you soon with the next steps."
        : newStatus === "Rejected"
            ? "Registration was not approved. Please contact the Help Center if you need assistance."
            : "Our team will review your registration and contact you soon.";
    try {
        const now = Date.now();
        await update(ref(db), {
            [`registrations/${key}/status`]: newStatus,
            [`registrations/${key}/statusNote`]: note,
            [`registrations/${key}/statusUpdatedAt`]: now,
            [`registrationStatusLookup/${registrationId}`]: { registrationId, status:newStatus, statusNote:note, updatedAt:now }
        });
        showToast(`Registration ${newStatus.toLowerCase()}.`);
    } catch (error) {
        console.error("Status update error:", error);
        showStatus("Could not update registration status.", "error");
    }
}

/* =========================================================
   MEMBER DISPLAY HTML
========================================================= */

function memberHTML(
    member,
    index
) {

    let name = "";
    let className = "";
    let section = "";


    if (
        member &&
        typeof member === "object"
    ) {

        name =
            member.name ||
            member.studentName ||
            member.memberName ||
            member.MemberName ||
            "Member";


        className =
            member.class ||
            member.studentClass ||
            member.className ||
            "";


        section =
            member.section ||
            member.studentSection ||
            "";

    }
    else {

        name =
            String(member);

    }


    return `
        <div class="team-member-item"
             style="
                padding:14px;
                margin:8px 0;
                border:1px solid rgba(255,255,255,.1);
                border-radius:12px;
                background:rgba(255,255,255,.03);
             ">

            <strong
                style="
                    display:block;
                    margin-bottom:5px;
                "
            >
                Member ${index + 2}
            </strong>

            <span
                style="
                    display:block;
                    font-weight:600;
                "
            >
                ${escapeHTML(name)}
            </span>

            ${
                className
                    ? `
                        <small
                            style="
                                display:inline-block;
                                margin-top:5px;
                                margin-right:10px;
                                opacity:.75;
                            "
                        >
                            Class:
                            ${escapeHTML(className)}
                        </small>
                    `
                    : ""
            }

            ${
                section
                    ? `
                        <small
                            style="
                                display:inline-block;
                                margin-top:5px;
                                opacity:.75;
                            "
                        >
                            Section:
                            ${escapeHTML(section)}
                        </small>
                    `
                    : ""
            }

        </div>
    `;

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


    if (!entries.length) {

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

                    const mobile =
                        getMobile(data);

                    const email =
                        getEmail(data);

                    const events =
                        getEvents(data);

                    const teamSize =
                        getTeamSize(data);

                    const registrationStatus = getRegistrationStatus(data);
                    const statusClass = registrationStatus.toLowerCase().replace(/\s+/g,"-");

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
                                ${teamSize}
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

                                            ? events
                                                .map(
                                                    event =>
                                                        `
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
                                <div class="status-badge ${escapeHTML(statusClass)}">${escapeHTML(registrationStatus)}</div>
                                <div class="action-buttons">
                                    ${registrationStatus !== "Approved" ? `<button type="button" class="approve-btn" data-key="${escapeHTML(key)}">Approve</button>` : ""}
                                    ${registrationStatus !== "Rejected" ? `<button type="button" class="reject-btn" data-key="${escapeHTML(key)}">Reject</button>` : ""}
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
            )
            .join("");


    registrationBody
        .querySelectorAll("[data-key]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    handleRowAction(button)
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

                    const team =
                        getTeamName(data);

                    const teamSize =
                        getTeamSize(data);

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
                                    Team:
                                    ${escapeHTML(team)}
                                </span>

                                <span>
                                    Team Size:
                                    ${teamSize}
                                    Member${
                                        teamSize === 1
                                            ? ""
                                            : "s"
                                    }
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
                                    <i
                                        class="fa-solid fa-trash"
                                    ></i>
                                </button>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    mobileRegistrations
        .querySelectorAll("[data-key]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    handleRowAction(button)
            );

        });

}


/* =========================================================
   RENDER
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
        getTeamSize(data);


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
                        ${
                            type === "team"
                                ? "TEAM"
                                : "SOLO"
                        }
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        TEAM SIZE
                    </span>

                    <strong>
                        ${teamSize}
                        Member${
                            teamSize === 1
                                ? ""
                                : "s"
                        }
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


            <div
                class="detail-block"
            >

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


            <div
                class="detail-block"
            >

                <span>
                    TEAM MEMBERS
                </span>


                ${
                    members.length

                        ? `

                            <div
                                class="team-member-list"
                            >

                                ${
                                    members
                                        .map(
                                            (
                                                member,
                                                index
                                            ) =>
                                                memberHTML(
                                                    member,
                                                    index
                                                )
                                        )
                                        .join("")
                                }

                            </div>

                        `

                        : `

                            <p>

                                ${
                                    teamSize > 1

                                        ? "Team size indicates a team registration, but the member names were not found in the supported Firebase fields."

                                        : "No additional members."

                                }

                            </p>

                        `
                }

            </div>


            <div
                class="detail-block"
            >

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


    detailOverlay
        ?.classList
        .remove("hidden");

}


/* =========================================================
   CLOSE DETAIL
========================================================= */

function closeDetailModal() {

    detailOverlay
        ?.classList
        .add("hidden");

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

        const value =
            getMobile(data);

        editMobileNumber.value =
            value === "—"
                ? ""
                : value;

    }


    if (editEmailAddress) {

        const value =
            getEmail(data);

        editEmailAddress.value =
            value === "—"
                ? ""
                : value;

    }


    if (editTeamName) {

        const value =
            getTeamName(data);

        editTeamName.value =
            value === "—"
                ? ""
                : value;

    }


    if (editRemarks) {

        editRemarks.value =
            getRemarks(data);

    }


    if (editMembers) {

        const members =
            getMembers(data);

        editMembers.value =
            members
                .map(member => {

                    if (
                        member &&
                        typeof member === "object"
                    ) {

                        return [
                            member.name ||
                            member.studentName ||
                            member.memberName ||
                            "",

                            member.class ||
                            member.studentClass ||
                            "",

                            member.section ||
                            member.studentSection ||
                            ""

                        ].join(" | ");

                    }

                    return String(member);

                })
                .join("\n");

    }


    if (editMessage) {

        editMessage.textContent =
            "";

    }


    editOverlay
        ?.classList
        .remove("hidden");

}


/* =========================================================
   EDIT SUBMIT
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


        const original =
            registrations[key];


        if (!original) {
            return;
        }


        try {

            const updates = {};


            if (editStudentName) {

                updates.studentName =
                    editStudentName.value.trim();

            }


            if (editStudentClass) {

                updates.studentClass =
                    editStudentClass.value.trim();

            }


            if (editStudentSection) {

                updates.studentSection =
                    editStudentSection.value.trim();

            }


            if (editMobileNumber) {

                updates.mobileNumber =
                    editMobileNumber.value.trim();

            }


            if (editEmailAddress) {

                updates.emailAddress =
                    editEmailAddress.value.trim();

            }


            if (editTeamName) {

                updates.teamName =
                    editTeamName.value.trim();

            }


            if (editRemarks) {

                updates.remarks =
                    editRemarks.value.trim();

            }


            await update(
                ref(db),
                {
                    [`${REGISTRATIONS_PATH}/${key}`]: { ...original, ...updates },
                    [`registrationStatusLookup/${getRegistrationId(original,key)}`]: {
                        registrationId: getRegistrationId(original,key),
                        status: getRegistrationStatus(original),
                        statusNote: original.statusNote || "Our team will review your registration and contact you soon.",
                        updatedAt: Date.now()
                    }
                }
            );


            showToast(
                "Registration updated successfully."
            );


            closeEditModal();

        }
        catch (error) {

            console.error(
                "Edit error:",
                error
            );

            if (editMessage) {

                editMessage.textContent =
                    "Could not update registration.";

            }

            showStatus(
                "Firebase denied the update.",
                "error"
            );

        }

    }
);


/* =========================================================
   CLOSE EDIT
========================================================= */

function closeEditModal() {

    editOverlay
        ?.classList
        .add("hidden");

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
   DELETE
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
                getRegistrationId(
                    data,
                    key
                )
            } (${
                getName(data)
            }) from the database.`;

    }


    confirmOverlay
        ?.classList
        .remove("hidden");

}


function closeConfirmModal() {

    confirmOverlay
        ?.classList
        .add("hidden");

    pendingDeleteKey =
        null;

}


cancelDeleteBtn?.addEventListener(
    "click",
    closeConfirmModal
);


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
                `
                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>
                    Deleting...
                `;


            const registration = registrations[key];
            const registrationId = registration ? getRegistrationId(registration,key) : "";
            const deleteUpdates = {
                [`${REGISTRATIONS_PATH}/${key}`]: null
            };
            if (registrationId) deleteUpdates[`registrationStatusLookup/${registrationId}`] = null;
            await update(ref(db), deleteUpdates);


            showToast(
                "Registration deleted successfully."
            );


            closeConfirmModal();

        }
        catch (error) {

            console.error(
                "Delete error:",
                error
            );

            showStatus(
                "Firebase denied the registration delete.",
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
                    "Firebase registration error:",
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
   CSV
========================================================= */

function csvEscape(value) {

    return `"${String(
        value ?? ""
    ).replaceAll(
        '"',
        '""'
    )}"`;

}


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

                getTeamSize(data),

                getMembers(data)
                    .map(member => {

                        if (
                            member &&
                            typeof member === "object"
                        ) {

                            return [

                                member.name ||
                                member.studentName ||
                                member.memberName ||
                                "",

                                member.class ||
                                member.studentClass ||
                                "",

                                member.section ||
                                member.studentSection ||
                                ""

                            ].join(" | ");

                        }

                        return String(member);

                    })
                    .join("; "),

                getEvents(data)
                    .join("; "),

                getRemarks(data),

                formatDate(
                    getTimestamp(data)
                )

            ]
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


    document
        .body
        .appendChild(link);


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
    render
);

statusFilter?.addEventListener("change", render);


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

        }
        catch (error) {

            console.error(
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

onAuthStateChanged(auth, async user => {
    if (!user) {
        window.location.replace("admin-login.html");
        return;
    }

    try {
        const adminSnap = await get(ref(db, `admins/${user.uid}`));
        const isDatabaseAdmin = adminSnap.exists() && adminSnap.val() === true;
        const isConfiguredAdmin = ADMIN_UID !== "REPLACE_WITH_MAIN_PROJECT_ADMIN_UID" && user.uid === ADMIN_UID;

        if (!isDatabaseAdmin && !isConfiguredAdmin) {
            await signOut(auth);
            alert("Access denied. This account is not authorized as an administrator.");
            window.location.replace("admin-login.html");
            return;
        }

        if (adminName) adminName.textContent = user.displayName || user.email?.split("@")[0] || "Administrator";
        if (adminEmail) adminEmail.textContent = user.email || user.uid;
        loadingScreen?.classList.add("hidden");
        appShell?.classList.remove("hidden");
        showStatus(`Administrator authenticated: ${user.email || user.uid}`, "success");
        loadRegistrations();
        loadWebsiteContent();
    } catch (error) {
        console.error("Admin authorization error:", error);
        await signOut(auth).catch(()=>{});
        window.location.replace("admin-login.html");
    }
});

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

            adminSidebar
                .classList
                .add("active");


            sidebarOverlay
                .classList
                .add("active");


            menuToggle
                .classList
                .add("active");


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

            adminSidebar
                .classList
                .remove("active");


            sidebarOverlay
                .classList
                .remove("active");


            menuToggle
                .classList
                .remove("active");


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
                adminSidebar
                    .classList
                    .contains("active")
            ) {

                closeMenu();

            }
            else {

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
\n\n/* Multi-agent authorization is handled by the Help Firebase project. */
