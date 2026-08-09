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
    remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",
    authDomain: "aps-robotics-championship.firebaseapp.com",
    databaseURL: "https://aps-robotics-championship-default-rtdb.firebaseio.com",
    projectId: "aps-robotics-championship",
    storageBucket: "aps-robotics-championship.firebasestorage.app",
    messagingSenderId: "1063542904891",
    appId: "1:1063542904891:web:82ff9bb3fba0b87384a41e"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


/* =========================================================
   ADMIN UID LIST
========================================================= */

const ADMIN_UIDS = new Set([
    "7pHSV8jhyBQHAGErYbALg5NqGCE2",
    "8645cVYSFQQZeS9GDZuguc3W46y1",
    "uGBclDQGTEYKahRKZaLYXz8Dk8y2",
    "7MRUvQS043fA1nFwcJAyUWRxjiu1",
    "nxAJHhZ93hZmtsDEnjWKn4nPCUH2",
    "BrSfKmoCkWd40jVhUfWs3SO2fCE3"
]);


/* =========================================================
   ELEMENTS
========================================================= */

const loadingScreen =
    document.getElementById("loadingScreen");

const appElement =
    document.getElementById("app");

const sidebar =
    document.getElementById("sidebar");

const menuBtn =
    document.getElementById("menuBtn");

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

const body =
    document.getElementById("registrationBody");

const mobileRegistrations =
    document.getElementById("mobileRegistrations");

const status =
    document.getElementById("status");

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

const adminName =
    document.getElementById("adminName");

const adminEmail =
    document.getElementById("adminEmail");


/* =========================================================
   MODALS
========================================================= */

const detailOverlay =
    document.getElementById("detailOverlay");

const closeDetail =
    document.getElementById("closeDetail");

const detailId =
    document.getElementById("detailId");

const detailContent =
    document.getElementById("detailContent");

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

const toast =
    document.getElementById("toast");

const toastText =
    document.getElementById("toastText");


/* =========================================================
   STATE
========================================================= */

let registrations = {};

let currentUser = null;

let unsubscribeRegistrations = null;


/* =========================================================
   UTILITY
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function getEvents(data) {

    if (Array.isArray(data.Events)) {
        return data.Events;
    }

    if (typeof data.Events === "string") {

        return data.Events
            .split(",")
            .map(x => x.trim())
            .filter(Boolean);
    }

    return [];
}


function isSolo(data) {

    return (
        Number(data.TeamSize) === 1 ||
        String(data.ParticipationType || "")
            .toLowerCase() === "solo"
    );
}


function getType(data) {

    if (isSolo(data)) {
        return "Solo";
    }

    return (
        data.ParticipationType ||
        `Team of ${data.TeamSize || "?"}`
    );
}


function getMemberCount(data) {

    if (isSolo(data)) {
        return 1;
    }

    let count = 1;

    for (let i = 2; i <= 5; i++) {

        if (data[`Member${i}Name`]) {
            count++;
        }
    }

    return count;
}


function getDate(data) {

    if (!data.registrationDate) {
        return "—";
    }

    try {

        const date =
            new Date(data.registrationDate);

        if (Number.isNaN(date.getTime())) {
            return String(data.registrationDate);
        }

        return date.toLocaleString();

    } catch {

        return String(data.registrationDate);
    }
}


/* =========================================================
   STATUS / TOAST
========================================================= */

function showStatus(message, type = "") {

    status.textContent = message;

    status.className =
        `status ${type}`;
}


function showToast(message, success = true) {

    toastText.textContent = message;

    toast.querySelector("i").className =
        success
            ? "fa-solid fa-circle-check"
            : "fa-solid fa-circle-exclamation";

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer =
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
}


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        if (!ADMIN_UIDS.has(user.uid)) {

            alert(
                "Access denied. This account is not an authorized administrator."
            );

            signOut(auth);

            return;
        }


        currentUser = user;

        adminEmail.textContent =
            user.email || "Admin";

        adminName.textContent =
            user.displayName ||
            "Administrator";


        loadingScreen.classList.add(
            "hidden"
        );

        appElement.classList.remove(
            "hidden"
        );


        loadRegistrations();

    }
);


/* =========================================================
   LOAD FIREBASE REGISTRATIONS
========================================================= */

function loadRegistrations() {

    showStatus(
        "Connecting to Firebase database..."
    );


    const registrationsRef =
        ref(db, "registrations");


    if (unsubscribeRegistrations) {
        unsubscribeRegistrations();
    }


    unsubscribeRegistrations =
        onValue(

            registrationsRef,

            snapshot => {

                registrations =
                    snapshot.val() || {};

                updateStatistics();

                renderRegistrations();

                showStatus(
                    `${Object.keys(registrations).length} registration(s) loaded successfully.`,
                    "success"
                );

            },

            error => {

                console.error(
                    "Firebase read error:",
                    error
                );

                let message =
                    "Unable to load registrations.";

                if (
                    error &&
                    error.code ===
                    "PERMISSION_DENIED"
                ) {

                    message =
                        "Permission denied. Make sure you are signed in with one of the six authorized admin accounts.";

                } else if (error?.message) {

                    message +=
                        ` ${error.message}`;
                }

                showStatus(
                    message,
                    "error"
                );

            }
        );
}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const values =
        Object.values(registrations);

    const total =
        values.length;

    const solo =
        values.filter(
            isSolo
        ).length;

    const teams =
        total - solo;


    let race = 0;
    let war = 0;
    let tug = 0;
    let soccer = 0;

    values.forEach(data => {

        getEvents(data)
            .forEach(event => {

                const normalized =
                    String(event)
                        .toLowerCase();

                if (
                    normalized ===
                    "robo race"
                ) race++;

                if (
                    normalized ===
                    "robo war"
                ) war++;

                if (
                    normalized ===
                    "robo tug of war"
                ) tug++;

                if (
                    normalized ===
                    "robo soccer"
                ) soccer++;

            });

    });


    totalRegistrations.textContent =
        total;

    soloCount.textContent =
        solo;

    teamCount.textContent =
        teams;

    raceCount.textContent =
        race;

    warCount.textContent =
        war;

    tugCount.textContent =
        tug;

    soccerCount.textContent =
        soccer;

    eventEntries.textContent =
        race + war + tug + soccer;
}


/* =========================================================
   FILTER
========================================================= */

function matchesSearch(data, key) {

    const query =
        search.value
            .trim()
            .toLowerCase();

    const events =
        getEvents(data);


    if (!query) {
        return true;
    }


    const text = [

        key,

        data.registrationId,

        data.StudentName,

        data.Class,

        data.Section,

        data.MobileNumber,

        data.EmailAddress,

        data.TeamName,

        data.ParticipationType,

        ...events,

        data.Member2Name,
        data.Member2Class,
        data.Member2Section,

        data.Member3Name,
        data.Member3Class,
        data.Member3Section,

        data.Member4Name,
        data.Member4Class,
        data.Member4Section,

        data.Member5Name,
        data.Member5Class,
        data.Member5Section

    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


    return text.includes(query);
}


function matchesFilters(data) {

    const type =
        typeFilter.value;

    const event =
        eventFilter.value;


    if (
        type === "solo" &&
        !isSolo(data)
    ) {
        return false;
    }


    if (
        type === "team" &&
        isSolo(data)
    ) {
        return false;
    }


    if (
        event !== "all" &&
        !getEvents(data)
            .some(
                item =>
                    String(item)
                        .toLowerCase() ===
                    event.toLowerCase()
            )
    ) {
        return false;
    }


    return true;
}


/* =========================================================
   RENDER
========================================================= */

function renderRegistrations() {

    const entries =
        Object.entries(
            registrations
        )
        .filter(
            ([key, data]) =>
                matchesSearch(data, key) &&
                matchesFilters(data)
        )
        .reverse();


    if (!entries.length) {

        body.innerHTML = `
            <tr>
                <td colspan="8">
                    <div style="
                        padding:50px;
                        text-align:center;
                        color:#8da3bd;
                    ">
                        <i class="fa-solid fa-folder-open"
                           style="font-size:30px;color:#00d9ff"></i>
                        <p style="margin-top:12px">
                            No registrations found.
                        </p>
                    </div>
                </td>
            </tr>
        `;

        mobileRegistrations.innerHTML = `
            <div class="mobile-card"
                 style="text-align:center;color:#8da3bd">
                No registrations found.
            </div>
        `;

        return;
    }


    body.innerHTML =
        entries
            .map(
                ([key, data]) =>
                    renderTableRow(
                        key,
                        data
                    )
            )
            .join("");


    mobileRegistrations.innerHTML =
        entries
            .map(
                ([key, data]) =>
                    renderMobileCard(
                        key,
                        data
                    )
            )
            .join("");


    attachActionEvents();

}


/* =========================================================
   TABLE ROW
========================================================= */

function renderTableRow(
    key,
    data
) {

    const events =
        getEvents(data);

    const type =
        getType(data);

    const memberCount =
        getMemberCount(data);


    return `
        <tr>

            <td>
                <span class="registration-id">
                    ${escapeHTML(
                        data.registrationId || key
                    )}
                </span>

                <span class="sub-text">
                    ${escapeHTML(
                        getDate(data)
                    )}
                </span>
            </td>

            <td>
                <span class="leader-name">
                    ${escapeHTML(
                        data.StudentName || "—"
                    )}
                </span>

                <span class="sub-text">
                    ${escapeHTML(
                        `${data.Class || ""} ${data.Section || ""}`
                    )}
                </span>
            </td>

            <td>
                ${escapeHTML(
                    data.TeamName || "Solo Participant"
                )}
            </td>

            <td>
                <span class="type-badge">
                    ${escapeHTML(type)}
                </span>
            </td>

            <td>
                ${memberCount}
                participant${memberCount === 1 ? "" : "s"}
            </td>

            <td>
                ${escapeHTML(
                    data.EmailAddress || "—"
                )}

                <span class="sub-text">
                    ${escapeHTML(
                        data.MobileNumber || ""
                    )}
                </span>
            </td>

            <td>
                ${
                    events.length
                    ? events
                        .map(
                            event =>
                                `<span class="event-tag">
                                    ${escapeHTML(event)}
                                </span>`
                        )
                        .join("")
                    : "—"
                }
            </td>

            <td>
                <div class="action-buttons">

                    <button
                        class="view"
                        data-action="view"
                        data-key="${escapeHTML(key)}"
                        title="View">
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button
                        data-action="edit"
                        data-key="${escapeHTML(key)}"
                        title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        class="delete"
                        data-action="delete"
                        data-key="${escapeHTML(key)}"
                        title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>
            </td>

        </tr>
    `;
}


/* =========================================================
   MOBILE CARD
========================================================= */

function renderMobileCard(
    key,
    data
) {

    const events =
        getEvents(data);

    return `
        <div class="mobile-card">

            <div class="mobile-card-top">

                <div>
                    <span class="registration-id">
                        ${escapeHTML(
                            data.registrationId || key
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            data.StudentName || "—"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            `${data.Class || ""} ${data.Section || ""}`
                        )}
                    </p>
                </div>

                <span class="type-badge">
                    ${escapeHTML(
                        getType(data)
                    )}
                </span>

            </div>

            <p>
                ${escapeHTML(
                    data.EmailAddress || "—"
                )}
            </p>

            <div class="mobile-events">

                ${
                    events.length
                    ? events
                        .map(
                            event =>
                                `<span class="event-tag">
                                    ${escapeHTML(event)}
                                </span>`
                        )
                        .join("")
                    : "No event"
                }

            </div>

            <div class="mobile-actions">

                <button
                    data-action="view"
                    data-key="${escapeHTML(key)}">
                    <i class="fa-solid fa-eye"></i>
                    View
                </button>

                <button
                    data-action="edit"
                    data-key="${escapeHTML(key)}">
                    <i class="fa-solid fa-pen"></i>
                    Edit
                </button>

                <button
                    data-action="delete"
                    data-key="${escapeHTML(key)}">
                    <i class="fa-solid fa-trash"></i>
                    Delete
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   ACTION EVENTS
========================================================= */

function attachActionEvents() {

    document
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;

                    const key =
                        button.dataset.key;


                    if (action === "view") {
                        openDetails(key);
                    }

                    if (action === "edit") {
                        openEdit(key);
                    }

                    if (action === "delete") {
                        deleteRegistration(key);
                    }

                }
            );

        });
}


/* =========================================================
   DETAILS
========================================================= */

function openDetails(key) {

    const data =
        registrations[key];

    if (!data) return;


    detailId.textContent =
        data.registrationId ||
        key;


    const events =
        getEvents(data);


    let membersHTML = "";


    for (let i = 2; i <= 5; i++) {

        if (!data[`Member${i}Name`]) {
            continue;
        }

        membersHTML += `
            <div class="member-detail">

                <strong>
                    Participant ${String(i).padStart(2, "0")}
                </strong>

                <div class="sub-text">
                    ${escapeHTML(
                        data[`Member${i}Name`]
                    )}
                    •
                    ${escapeHTML(
                        data[`Member${i}Class`] || "—"
                    )}
                    -
                    ${escapeHTML(
                        data[`Member${i}Section`] || "—"
                    )}
                </div>

            </div>
        `;
    }


    detailContent.innerHTML = `

        <div class="detail-grid">

            <div class="detail-item">
                <small>TEAM LEADER</small>
                <strong>
                    ${escapeHTML(
                        data.StudentName || "—"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <small>PARTICIPATION</small>
                <strong>
                    ${escapeHTML(
                        getType(data)
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <small>CLASS</small>
                <strong>
                    ${escapeHTML(
                        data.Class || "—"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <small>SECTION</small>
                <strong>
                    ${escapeHTML(
                        data.Section || "—"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <small>MOBILE</small>
                <strong>
                    ${escapeHTML(
                        data.MobileNumber || "—"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <small>EMAIL</small>
                <strong>
                    ${escapeHTML(
                        data.EmailAddress || "—"
                    )}
                </strong>
            </div>

            <div class="detail-item full">
                <small>TEAM NAME</small>
                <strong>
                    ${escapeHTML(
                        data.TeamName ||
                        "Solo Participant"
                    )}
                </strong>
            </div>

            <div class="detail-item full">
                <small>EVENTS</small>
                <strong>
                    ${escapeHTML(
                        events.join(" • ") || "—"
                    )}
                </strong>
            </div>

            <div class="detail-item full">
                <small>TEAM MEMBERS</small>
                ${
                    membersHTML ||
                    `<div class="sub-text">
                        No additional members.
                    </div>`
                }
            </div>

            <div class="detail-item full">
                <small>REMARKS</small>
                <strong>
                    ${escapeHTML(
                        data.Remarks || "No remarks."
                    )}
                </strong>
            </div>

            <div class="detail-item full">
                <small>REGISTRATION DATE</small>
                <strong>
                    ${escapeHTML(
                        getDate(data)
                    )}
                </strong>
            </div>

        </div>
    `;


    detailOverlay.classList.remove(
        "hidden"
    );
}


/* =========================================================
   CLOSE DETAILS
========================================================= */

closeDetail.addEventListener(
    "click",
    () => {
        detailOverlay.classList.add(
            "hidden"
        );
    }
);


/* =========================================================
   EDIT
========================================================= */

function openEdit(key) {

    const data =
        registrations[key];

    if (!data) return;


    editKey.value =
        key;

    editStudentName.value =
        data.StudentName || "";

    editStudentClass.value =
        data.Class || "";

    editStudentSection.value =
        data.Section || "";

    editMobileNumber.value =
        data.MobileNumber || "";

    editEmailAddress.value =
        data.EmailAddress || "";

    editTeamName.value =
        data.TeamName || "";

    editRemarks.value =
        data.Remarks || "";

    editMessage.textContent = "";


    editMembers.innerHTML = "";


    const teamSize =
        Math.min(
            Math.max(
                Number(data.TeamSize || 1),
                1
            ),
            5
        );


    for (
        let i = 2;
        i <= teamSize;
        i++
    ) {

        editMembers.insertAdjacentHTML(
            "beforeend",

            `
            <div class="edit-member">

                <label>
                    Member ${i} Name

                    <input
                        id="editMember${i}Name"
                        value="${escapeHTML(
                            data[`Member${i}Name`] || ""
                        )}">
                </label>

                <label>
                    Class

                    <select
                        id="editMember${i}Class">

                        <option value="">
                            Select
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
                                cls =>
                                    `<option
                                        value="${cls}"
                                        ${
                                            data[`Member${i}Class`] === cls
                                            ? "selected"
                                            : ""
                                        }>
                                        ${cls}
                                    </option>`
                            )
                            .join("")
                        }

                    </select>
                </label>

                <label>
                    Section

                    <input
                        id="editMember${i}Section"
                        value="${escapeHTML(
                            data[`Member${i}Section`] || ""
                        )}">
                </label>

            </div>
            `
        );
    }


    editOverlay.classList.remove(
        "hidden"
    );
}


/* =========================================================
   SAVE EDIT
========================================================= */

editForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const key =
            editKey.value;

        if (!key) return;


        const oldData =
            registrations[key];

        if (!oldData) return;


        editMessage.textContent =
            "Saving changes...";


        const updatedData = {

            ...oldData,

            StudentName:
                editStudentName.value.trim(),

            Class:
                editStudentClass.value,

            Section:
                editStudentSection.value.trim(),

            MobileNumber:
                editMobileNumber.value.trim(),

            EmailAddress:
                editEmailAddress.value
                    .trim()
                    .toLowerCase(),

            TeamName:
                editTeamName.value.trim(),

            Remarks:
                editRemarks.value.trim(),

            updatedAt:
                Date.now()
        };


        const teamSize =
            Math.min(
                Math.max(
                    Number(oldData.TeamSize || 1),
                    1
                ),
                5
            );


        for (
            let i = 2;
            i <= 5;
            i++
        ) {

            if (i <= teamSize) {

                updatedData[
                    `Member${i}Name`
                ] =
                    document
                        .getElementById(
                            `editMember${i}Name`
                        )
                        ?.value
                        .trim() || "";

                updatedData[
                    `Member${i}Class`
                ] =
                    document
                        .getElementById(
                            `editMember${i}Class`
                        )
                        ?.value || "";

                updatedData[
                    `Member${i}Section`
                ] =
                    document
                        .getElementById(
                            `editMember${i}Section`
                        )
                        ?.value
                        .trim() || "";

            } else {

                updatedData[
                    `Member${i}Name`
                ] = "";

                updatedData[
                    `Member${i}Class`
                ] = "";

                updatedData[
                    `Member${i}Section`
                ] = "";

            }

        }


        try {

            await update(
                ref(
                    db,
                    `registrations/${key}`
                ),
                updatedData
            );


            editMessage.textContent =
                "Changes saved successfully.";

            showToast(
                "Registration updated successfully."
            );


            setTimeout(() => {

                editOverlay.classList.add(
                    "hidden"
                );

            }, 700);


        } catch (error) {

            console.error(error);

            editMessage.textContent =
                "Firebase could not save the changes.";

            showToast(
                error.message ||
                "Unable to update registration.",
                false
            );

        }

    }
);


/* =========================================================
   DELETE
========================================================= */

async function deleteRegistration(key) {

    const data =
        registrations[key];

    if (!data) return;


    const id =
        data.registrationId ||
        key;


    const confirmed =
        confirm(
            `Delete registration ${id}?\n\n` +
            `This action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        showStatus(
            "Deleting registration..."
        );


        await remove(
            ref(
                db,
                `registrations/${key}`
            )
        );


        showToast(
            "Registration deleted successfully."
        );


        showStatus(
            "Registration deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showStatus(
            "Unable to delete registration: " +
            error.message,
            "error"
        );


        showToast(
            "Delete failed.",
            false
        );

    }
}


/* =========================================================
   SEARCH / FILTER
========================================================= */

search.addEventListener(
    "input",
    renderRegistrations
);

typeFilter.addEventListener(
    "change",
    renderRegistrations
);

eventFilter.addEventListener(
    "change",
    renderRegistrations
);


clearSearch.addEventListener(
    "click",
    () => {

        search.value = "";

        renderRegistrations();

        search.focus();

    }
);


/* =========================================================
   REFRESH
========================================================= */

refreshBtn.addEventListener(
    "click",
    () => {

        refreshBtn
            .querySelector("i")
            .classList.add("fa-spin");


        loadRegistrations();


        setTimeout(() => {

            refreshBtn
                .querySelector("i")
                .classList.remove("fa-spin");

        }, 800);

    }
);


/* =========================================================
   EXPORT CSV
========================================================= */

exportBtn.addEventListener(
    "click",
    () => {

        const entries =
            Object.entries(
                registrations
            );


        if (!entries.length) {

            showToast(
                "There are no registrations to export.",
                false
            );

            return;
        }


        const headers = [
            "Registration ID",
            "Team Size",
            "Participation Type",
            "Student Name",
            "Class",
            "Section",
            "Mobile",
            "Email",
            "Team Name",
            "Events",
            "Member 2 Name",
            "Member 2 Class",
            "Member 2 Section",
            "Member 3 Name",
            "Member 3 Class",
            "Member 3 Section",
            "Member 4 Name",
            "Member 4 Class",
            "Member 4 Section",
            "Member 5 Name",
            "Member 5 Class",
            "Member 5 Section",
            "Remarks"
        ];


        const rows = entries.map(
            ([key, data]) => [

                data.registrationId || key,

                data.TeamSize || "",

                data.ParticipationType || "",

                data.StudentName || "",

                data.Class || "",

                data.Section || "",

                data.MobileNumber || "",

                data.EmailAddress || "",

                data.TeamName || "",

                getEvents(data).join(" | "),

                data.Member2Name || "",
                data.Member2Class || "",
                data.Member2Section || "",

                data.Member3Name || "",
                data.Member3Class || "",
                data.Member3Section || "",

                data.Member4Name || "",
                data.Member4Class || "",
                data.Member4Section || "",

                data.Member5Name || "",
                data.Member5Class || "",
                data.Member5Section || "",

                data.Remarks || ""

            ]
        );


        const csv = [

            headers,

            ...rows

        ]
        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(value)
                                .replaceAll('"', '""')}"`
                    )
                    .join(",")
        )
        .join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `APS-Robotics-Registrations-${new Date()
                .toISOString()
                .slice(0,10)}.csv`;

        link.click();


        URL.revokeObjectURL(url);


        showToast(
            "Registration CSV exported."
        );

    }
);


/* =========================================================
   SIDEBAR
========================================================= */

menuBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(".nav-link")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".nav-link"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                link.classList.add(
                    "active"
                );

                sidebar.classList.remove(
                    "open"
                );

            }
        );

    });


/* =========================================================
   CLOSE MODALS
========================================================= */

cancelEdit.addEventListener(
    "click",
    () => {

        editOverlay.classList.add(
            "hidden"
        );

    }
);

closeEdit.addEventListener(
    "click",
    () => {

        editOverlay.classList.add(
            "hidden"
        );

    }
);


detailOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            detailOverlay
        ) {

            detailOverlay.classList.add(
                "hidden"
            );

        }

    }
);


editOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            editOverlay
        ) {

            editOverlay.classList.add(
                "hidden"
            );

        }

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

            detailOverlay.classList.add(
                "hidden"
            );

            editOverlay.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(error);

            showToast(
                "Logout failed.",
                false
            );

        }

    }
);
