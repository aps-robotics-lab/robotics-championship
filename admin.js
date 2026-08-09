import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


// ======================================================
// FIREBASE CONFIG
// ======================================================

const firebaseConfig = {
    apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",
    authDomain: "aps-robotics-championship.firebaseapp.com",
    databaseURL: "https://aps-robotics-championship-default-rtdb.firebaseio.com",
    projectId: "aps-robotics-championship",
    storageBucket: "aps-robotics-championship.firebasestorage.app",
    messagingSenderId: "1063542904891",
    appId: "1:1063542904891:web:82ff9bb3fba0b87384a41e"
};


// ======================================================
// FIREBASE INITIALIZATION
// ======================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


// ======================================================
// SIX AUTHORIZED ADMIN UIDs
// ======================================================

const ADMIN_UIDS = new Set([
    "7pHSV8jhyBQHAGErYbALg5NqGCE2",
    "8645cVYSFQQZeS9GDZuguc3W46y1",
    "uGBclDQGTEYKahRKZaLYXz8Dk8y2",
    "7MRUvQS043fA1nFwcJAyUWRxjiu1",
    "nxAJHhZ93hZmtsDEnjWKn4nPCUH2",
    "BrSfKmoCkWd40jVhUfWs3SO2fCE3"
]);


// ======================================================
// DOM
// ======================================================

const registrationBody =
    document.getElementById("registrationBody");

const totalRegistrations =
    document.getElementById("totalRegistrations");

const soloCount =
    document.getElementById("soloCount");

const teamCount =
    document.getElementById("teamCount");

const searchInput =
    document.getElementById("search");

const refreshBtn =
    document.getElementById("refreshBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const statusBox =
    document.getElementById("status");


// Edit modal

const editOverlay =
    document.getElementById("editOverlay");

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

const closeEdit =
    document.getElementById("closeEdit");

const cancelEdit =
    document.getElementById("cancelEdit");


// ======================================================
// DATA
// ======================================================

let registrations = {};


// ======================================================
// HELPERS
// ======================================================

function value(data, key, fallback = "") {

    if (
        data &&
        data[key] !== undefined &&
        data[key] !== null
    ) {
        return data[key];
    }

    return fallback;
}


function escapeHTML(input) {

    if (
        input === null ||
        input === undefined
    ) {
        return "";
    }

    return String(input)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showStatus(message, type = "") {

    statusBox.textContent = message;

    statusBox.className = "status";

    if (type) {
        statusBox.classList.add(type);
    }
}


function getEvents(data) {

    const events = value(
        data,
        "Events",
        []
    );

    if (Array.isArray(events)) {
        return events;
    }

    if (typeof events === "string") {

        return events
            .split(",")
            .map(event => event.trim())
            .filter(Boolean);

    }

    if (
        events &&
        typeof events === "object"
    ) {

        return Object.values(events);

    }

    return [];
}


function getMemberCount(data) {

    const size = Number(
        value(data, "TeamSize", 1)
    );

    return Math.max(
        1,
        Math.min(5, size)
    );
}


function isTeam(data) {

    return getMemberCount(data) > 1;
}


function formatEvents(data) {

    const events = getEvents(data);

    if (!events.length) {
        return "—";
    }

    return events.map(event => `
        <span class="event-tag">
            ${escapeHTML(event)}
        </span>
    `).join("");
}


// ======================================================
// LOAD REGISTRATIONS
// ======================================================

async function loadRegistrations() {

    showStatus(
        "Loading registrations..."
    );

    try {

        const snapshot =
            await get(
                ref(db, "registrations")
            );

        if (!snapshot.exists()) {

            registrations = {};

            renderRegistrations();

            showStatus(
                "No registrations found.",
                "success"
            );

            return;
        }

        registrations =
            snapshot.val() || {};

        renderRegistrations();

        showStatus(
            `${Object.keys(registrations).length} registration(s) loaded.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Firebase error:",
            error
        );

        showStatus(
            "Unable to load registrations. Check your Firebase Database Rules.",
            "error"
        );
    }
}


// ======================================================
// RENDER TABLE
// ======================================================

function renderRegistrations() {

    registrationBody.innerHTML = "";

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    const entries =
        Object.entries(registrations);

    let solo = 0;
    let teams = 0;
    let visible = 0;


    entries.forEach(
        ([key, data]) => {

            if (
                !data ||
                typeof data !== "object"
            ) {
                return;
            }


            const registrationId =
                value(
                    data,
                    "registrationId",
                    key
                );

            const studentName =
                value(
                    data,
                    "StudentName",
                    "Unknown"
                );

            const studentClass =
                value(
                    data,
                    "Class"
                );

            const section =
                value(
                    data,
                    "Section"
                );

            const mobile =
                value(
                    data,
                    "MobileNumber",
                    "—"
                );

            const email =
                value(
                    data,
                    "EmailAddress",
                    "—"
                );

            const teamName =
                value(
                    data,
                    "TeamName"
                );

            const teamSize =
                getMemberCount(data);

            const events =
                getEvents(data);


            if (teamSize > 1) {
                teams++;
            } else {
                solo++;
            }


            // Search text

            const searchText = [

                key,
                registrationId,
                studentName,
                studentClass,
                section,
                mobile,
                email,
                teamName,
                value(data, "ParticipationType"),
                ...events,

                value(data, "Member2Name"),
                value(data, "Member2Class"),
                value(data, "Member2Section"),

                value(data, "Member3Name"),
                value(data, "Member3Class"),
                value(data, "Member3Section"),

                value(data, "Member4Name"),
                value(data, "Member4Class"),
                value(data, "Member4Section"),

                value(data, "Member5Name"),
                value(data, "Member5Class"),
                value(data, "Member5Section")

            ]
                .join(" ")
                .toLowerCase();


            if (
                searchTerm &&
                !searchText.includes(searchTerm)
            ) {
                return;
            }


            visible++;


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <span class="registration-id">
                        ${escapeHTML(registrationId)}
                    </span>
                </td>


                <td>

                    <div class="leader-cell">

                        <strong>
                            ${escapeHTML(studentName)}
                        </strong>

                        <small>
                            ${escapeHTML(studentClass)}
                            ${section
                                ? ` • ${escapeHTML(section)}`
                                : ""}
                        </small>

                    </div>

                </td>


                <td>
                    ${escapeHTML(
                        teamName || "—"
                    )}
                </td>


                <td>

                    <span class="type-badge ${
                        teamSize > 1
                            ? "team"
                            : "solo"
                    }">

                        ${
                            teamSize > 1
                                ? "TEAM"
                                : "SOLO"
                        }

                    </span>

                </td>


                <td>
                    ${teamSize}
                </td>


                <td>
                    ${escapeHTML(mobile)}
                </td>


                <td>

                    <span class="email-cell">
                        ${escapeHTML(email)}
                    </span>

                </td>


                <td>

                    <div class="events-cell">
                        ${formatEvents(data)}
                    </div>

                </td>


                <td>
                    ${escapeHTML(
                        value(
                            data,
                            "registrationDate",
                            "—"
                        )
                    )}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="edit-btn"
                            data-key="${escapeHTML(key)}">

                            Edit

                        </button>


                        <button
                            type="button"
                            class="delete-btn"
                            data-key="${escapeHTML(key)}">

                            Delete

                        </button>

                    </div>

                </td>

            `;


            registrationBody.appendChild(row);

        }
    );


    totalRegistrations.textContent =
        entries.length;

    soloCount.textContent =
        solo;

    teamCount.textContent =
        teams;


    if (!entries.length) {

        registrationBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-row">

                    No registrations available.

                </td>

            </tr>

        `;

    } else if (!visible) {

        registrationBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-row">

                    No registrations match your search.

                </td>

            </tr>

        `;

    }


    attachActions();
}


// ======================================================
// EDIT / DELETE BUTTONS
// ======================================================

function attachActions() {

    document
        .querySelectorAll(".edit-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => openEdit(
                    button.dataset.key
                )
            );

        });


    document
        .querySelectorAll(".delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteRegistration(
                    button.dataset.key
                )
            );

        });
}


// ======================================================
// OPEN EDIT
// ======================================================

function openEdit(key) {

    const data =
        registrations[key];

    if (!data) {

        showStatus(
            "Registration not found.",
            "error"
        );

        return;
    }


    editKey.value = key;


    editStudentName.value =
        value(data, "StudentName");


    editStudentClass.value =
        value(data, "Class");


    editStudentSection.value =
        value(data, "Section");


    editMobileNumber.value =
        value(data, "MobileNumber");


    editEmailAddress.value =
        value(data, "EmailAddress");


    editTeamName.value =
        value(data, "TeamName");


    editRemarks.value =
        value(data, "Remarks");


    renderMembers(
        data
    );


    editMessage.textContent = "";

    editOverlay.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );
}


// ======================================================
// RENDER TEAM MEMBERS
// ======================================================

function renderMembers(data) {

    editMembers.innerHTML = "";


    const teamSize =
        getMemberCount(data);


    if (teamSize <= 1) {

        editMembers.innerHTML = `

            <div class="no-members">

                Solo registration — no
                additional members.

            </div>

        `;

        return;
    }


    for (
        let number = 2;
        number <= teamSize;
        number++
    ) {

        const card =
            document.createElement("div");

        card.className =
            "member-edit-card";


        card.innerHTML = `

            <div class="member-number">

                MEMBER ${String(number).padStart(2, "0")}

            </div>


            <div class="member-grid">

                <label>

                    Name

                    <input
                        type="text"
                        class="member-name-input"
                        data-member="${number}"
                        value="${escapeHTML(
                            value(
                                data,
                                `Member${number}Name`
                            )
                        )}">

                </label>


                <label>

                    Class

                    <select
                        class="member-class-input"
                        data-member="${number}">

                        <option value="">
                            Select Class
                        </option>

                        <option value="VI">VI</option>
                        <option value="VII">VII</option>
                        <option value="VIII">VIII</option>
                        <option value="IX">IX</option>
                        <option value="X">X</option>
                        <option value="XI">XI</option>
                        <option value="XII">XII</option>

                    </select>

                </label>


                <label>

                    Section

                    <input
                        type="text"
                        class="member-section-input"
                        data-member="${number}"
                        maxlength="5"
                        value="${escapeHTML(
                            value(
                                data,
                                `Member${number}Section`
                            )
                        )}">

                </label>

            </div>

        `;


        const classSelect =
            card.querySelector(
                ".member-class-input"
            );


        classSelect.value =
            value(
                data,
                `Member${number}Class`
            );


        editMembers.appendChild(card);
    }
}


// ======================================================
// CLOSE EDIT
// ======================================================

function closeEditModal() {

    editOverlay.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "modal-open"
    );

    editMessage.textContent = "";
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
            event.target === editOverlay
        ) {

            closeEditModal();

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !editOverlay.classList.contains(
                "hidden"
            )
        ) {

            closeEditModal();

        }

    }
);


// ======================================================
// SAVE EDIT
// ======================================================

editForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const key =
            editKey.value;


        if (!key) {
            return;
        }


        const data =
            registrations[key];


        if (!data) {
            return;
        }


        const studentName =
            editStudentName.value.trim();

        const studentClass =
            editStudentClass.value.trim();

        const section =
            editStudentSection.value.trim();

        const mobile =
            editMobileNumber.value.trim();

        const email =
            editEmailAddress.value
                .trim()
                .toLowerCase();

        const teamName =
            editTeamName.value.trim();

        const remarks =
            editRemarks.value.trim();


        if (!studentName) {

            editMessage.textContent =
                "Leader name is required.";

            return;
        }


        if (!studentClass) {

            editMessage.textContent =
                "Please select the class.";

            return;
        }


        if (!section) {

            editMessage.textContent =
                "Section is required.";

            return;
        }


        if (
            mobile &&
            !/^\d{10}$/.test(mobile)
        ) {

            editMessage.textContent =
                "Mobile number must contain 10 digits.";

            return;
        }


        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {

            editMessage.textContent =
                "Please enter a valid email address.";

            return;
        }


        editMessage.textContent =
            "Saving changes...";


        try {

            const updates = {};


            // Leader

            updates[
                `registrations/${key}/StudentName`
            ] = studentName;


            updates[
                `registrations/${key}/Class`
            ] = studentClass;


            updates[
                `registrations/${key}/Section`
            ] = section;


            updates[
                `registrations/${key}/MobileNumber`
            ] = mobile;


            updates[
                `registrations/${key}/EmailAddress`
            ] = email;


            updates[
                `registrations/${key}/TeamName`
            ] = teamName;


            updates[
                `registrations/${key}/Remarks`
            ] = remarks;


            // Existing team size remains unchanged.

            const teamSize =
                getMemberCount(data);


            // Update only the members that belong
            // to the selected team size.

            for (
                let number = 2;
                number <= 5;
                number++
            ) {

                if (number <= teamSize) {

                    const nameInput =
                        document.querySelector(
                            `.member-name-input[data-member="${number}"]`
                        );

                    const classInput =
                        document.querySelector(
                            `.member-class-input[data-member="${number}"]`
                        );

                    const sectionInput =
                        document.querySelector(
                            `.member-section-input[data-member="${number}"]`
                        );


                    updates[
                        `registrations/${key}/Member${number}Name`
                    ] =
                        nameInput?.value.trim() || "";


                    updates[
                        `registrations/${key}/Member${number}Class`
                    ] =
                        classInput?.value.trim() || "";


                    updates[
                        `registrations/${key}/Member${number}Section`
                    ] =
                        sectionInput?.value.trim() || "";

                } else {

                    // Clear old member data if the
                    // registration was previously larger.

                    updates[
                        `registrations/${key}/Member${number}Name`
                    ] = "";


                    updates[
                        `registrations/${key}/Member${number}Class`
                    ] = "";


                    updates[
                        `registrations/${key}/Member${number}Section`
                    ] = "";

                }

            }


            await update(
                ref(db),
                updates
            );


            // Update local copy

            registrations[key] = {

                ...data,

                StudentName:
                    studentName,

                Class:
                    studentClass,

                Section:
                    section,

                MobileNumber:
                    mobile,

                EmailAddress:
                    email,

                TeamName:
                    teamName,

                Remarks:
                    remarks

            };


            for (
                let number = 2;
                number <= 5;
                number++
            ) {

                if (number <= teamSize) {

                    const nameInput =
                        document.querySelector(
                            `.member-name-input[data-member="${number}"]`
                        );

                    const classInput =
                        document.querySelector(
                            `.member-class-input[data-member="${number}"]`
                        );

                    const sectionInput =
                        document.querySelector(
                            `.member-section-input[data-member="${number}"]`
                        );


                    registrations[key][
                        `Member${number}Name`
                    ] =
                        nameInput?.value.trim() || "";


                    registrations[key][
                        `Member${number}Class`
                    ] =
                        classInput?.value.trim() || "";


                    registrations[key][
                        `Member${number}Section`
                    ] =
                        sectionInput?.value.trim() || "";

                } else {

                    registrations[key][
                        `Member${number}Name`
                    ] = "";

                    registrations[key][
                        `Member${number}Class`
                    ] = "";

                    registrations[key][
                        `Member${number}Section`
                    ] = "";

                }

            }


            renderRegistrations();


            editMessage.textContent =
                "Changes saved successfully.";


            setTimeout(
                () => {

                    closeEditModal();

                    showStatus(
                        "Registration updated successfully.",
                        "success"
                    );

                },
                700
            );


        } catch (error) {

            console.error(
                "Edit error:",
                error
            );


            editMessage.textContent =
                "Unable to save changes. Check Firebase Database Rules.";

        }

    }
);


// ======================================================
// DELETE REGISTRATION
// ======================================================

async function deleteRegistration(key) {

    const data =
        registrations[key];


    if (!data) {
        return;
    }


    const registrationId =
        value(
            data,
            "registrationId",
            key
        );


    const studentName =
        value(
            data,
            "StudentName",
            "this registration"
        );


    const confirmed =
        confirm(
            `Delete registration?\n\n` +
            `ID: ${registrationId}\n` +
            `Student: ${studentName}\n\n` +
            `This action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        await remove(
            ref(
                db,
                `registrations/${key}`
            )
        );


        delete registrations[key];


        renderRegistrations();


        showStatus(
            "Registration deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showStatus(
            "Unable to delete registration. Check Firebase Database Rules.",
            "error"
        );

    }

}


// ======================================================
// SEARCH
// ======================================================

searchInput?.addEventListener(
    "input",
    renderRegistrations
);


// ======================================================
// REFRESH
// ======================================================

refreshBtn?.addEventListener(
    "click",
    async () => {

        refreshBtn.disabled = true;

        refreshBtn.textContent =
            "Loading...";


        await loadRegistrations();


        refreshBtn.disabled = false;

        refreshBtn.textContent =
            "Refresh";

    }
);


// ======================================================
// LOGOUT
// ======================================================

logoutBtn?.addEventListener(
    "click",
    async () => {

        if (
            !confirm(
                "Are you sure you want to logout?"
            )
        ) {
            return;
        }


        try {

            await signOut(auth);

            window.location.replace(
                "login.html"
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            showStatus(
                "Logout failed. Please try again.",
                "error"
            );

        }

    }
);


// ======================================================
// AUTHORIZATION
// ======================================================

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.replace(
                "login.html"
            );

            return;
        }


        console.log(
            "Signed-in UID:",
            user.uid
        );


        // Client-side protection

        if (!ADMIN_UIDS.has(user.uid)) {

            console.warn(
                "Unauthorized admin:",
                user.uid
            );


            alert(
                "Access denied. You are not authorized to access the admin dashboard."
            );


            await signOut(auth);


            window.location.replace(
                "login.html"
            );

            return;
        }


        console.log(
            "Admin authorization successful."
        );


        await loadRegistrations();

    }
);
