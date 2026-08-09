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
   FIREBASE CONFIG
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
   SIX ADMIN UID ACCESS LIST
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

const body =
    document.getElementById(
        "registrationBody"
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

const searchInput =
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

const statusBox =
    document.getElementById(
        "status"
    );


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
   STATE
========================================================= */

let registrations = {};

let unsubscribe = null;

let currentUser = null;


/* =========================================================
   STATUS
========================================================= */

function setStatus(
    message,
    type = ""
) {

    if (!statusBox) return;

    statusBox.textContent =
        message;

    statusBox.className =
        `status ${type}`;

}


/* =========================================================
   ADMIN CHECK
========================================================= */

function isAdmin(user) {

    return Boolean(
        user &&
        ADMIN_UIDS.has(user.uid)
    );

}


/* =========================================================
   FORMAT
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function getEvents(data) {

    if (Array.isArray(data.Events)) {
        return data.Events.join(", ");
    }

    if (
        typeof data.Events ===
        "string"
    ) {
        return data.Events;
    }

    return "—";
}


function getMembers(data) {

    const size =
        Number(
            data.TeamSize || 1
        );

    if (size <= 1) {
        return "Solo";
    }

    const members = [];

    for (
        let i = 2;
        i <= size;
        i++
    ) {

        const name =
            data[`Member${i}Name`];

        if (name) {
            members.push(name);
        }

    }

    return members.length
        ? members.join(", ")
        : "—";
}


function getDate(data) {

    return (
        data.registrationDate ||
        "—"
    );
}


/* =========================================================
   RENDER
========================================================= */

function renderRegistrations() {

    if (!body) return;

    const query =
        (
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const entries =
        Object.entries(
            registrations
        )
        .filter(
            ([key, data]) => {

                if (!query) {
                    return true;
                }

                const searchable = [

                    key,

                    data.registrationId,

                    data.StudentName,

                    data.Class,

                    data.Section,

                    data.MobileNumber,

                    data.EmailAddress,

                    data.TeamName,

                    data.ParticipationType,

                    getEvents(data),

                    getMembers(data),

                    data.Member2Name,

                    data.Member3Name,

                    data.Member4Name,

                    data.Member5Name

                ]
                    .join(" ")
                    .toLowerCase();

                return searchable.includes(
                    query
                );

            }
        );


    /* =========================
       STATS
    ========================= */

    const allEntries =
        Object.values(
            registrations
        );


    const total =
        allEntries.length;


    const solo =
        allEntries.filter(
            data =>
                Number(
                    data.TeamSize || 1
                ) === 1
        ).length;


    const teams =
        total - solo;


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


    /* =========================
       EMPTY
    ========================= */

    if (!entries.length) {

        body.innerHTML = `
            <tr>
                <td colspan="10"
                    style="text-align:center;padding:40px;">
                    No registrations found.
                </td>
            </tr>
        `;

        return;
    }


    /* =========================
       TABLE
    ========================= */

    body.innerHTML =
        entries
            .map(
                ([key, data], index) => {

                    const teamSize =
                        Number(
                            data.TeamSize || 1
                        );

                    const type =
                        data.ParticipationType ||
                        (
                            teamSize === 1
                                ? "Solo"
                                : `Team of ${teamSize}`
                        );


                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        data.registrationId ||
                                        `#${index + 1}`
                                    )}
                                </strong>
                            </td>


                            <td>
                                <div class="person-cell">
                                    <strong>
                                        ${escapeHTML(
                                            data.StudentName ||
                                            "—"
                                        )}
                                    </strong>

                                    <small>
                                        ${escapeHTML(
                                            data.Class ||
                                            ""
                                        )}
                                        ${data.Section
                                            ? " • " +
                                              escapeHTML(
                                                  data.Section
                                              )
                                            : ""}
                                    </small>
                                </div>
                            </td>


                            <td>
                                ${escapeHTML(
                                    data.TeamName ||
                                    "—"
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    type
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    getMembers(data)
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    data.MobileNumber ||
                                    "—"
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    data.EmailAddress ||
                                    "—"
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    getEvents(data)
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    getDate(data)
                                )}
                            </td>


                            <td>

                                <div
                                    class="action-buttons">

                                    <button
                                        type="button"
                                        class="edit-btn"
                                        data-edit="${escapeHTML(key)}">

                                        Edit

                                    </button>


                                    <button
                                        type="button"
                                        class="delete-btn"
                                        data-delete="${escapeHTML(key)}">

                                        Delete

                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;

                }
            )
            .join("");


    /* =========================
       ACTIONS
    ========================= */

    body
        .querySelectorAll(
            "[data-edit]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openEdit(
                        button.dataset.edit
                    );

                }
            );

        });


    body
        .querySelectorAll(
            "[data-delete]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteRegistration(
                        button.dataset.delete
                    );

                }
            );

        });

}


/* =========================================================
   LOAD DATABASE
========================================================= */

function loadRegistrations() {

    if (unsubscribe) {
        unsubscribe();
    }


    setStatus(
        "Loading registrations..."
    );


    const registrationsRef =
        ref(
            db,
            "registrations"
        );


    unsubscribe =
        onValue(
            registrationsRef,

            snapshot => {

                registrations =
                    snapshot.val() || {};

                renderRegistrations();

                setStatus(
                    `${Object.keys(registrations).length} registration(s) loaded.`,
                    "success"
                );

            },

            error => {

                console.error(
                    "Database read error:",
                    error
                );

                setStatus(
                    "Unable to load registrations. Check Firebase Database Rules.",
                    "error"
                );

            }
        );

}


/* =========================================================
   EDIT
========================================================= */

function openEdit(key) {

    const data =
        registrations[key];

    if (!data) {
        return;
    }


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


    renderEditMembers(
        data
    );


    if (editMessage) {
        editMessage.textContent = "";
    }


    editOverlay.classList.remove(
        "hidden"
    );

}


function renderEditMembers(data) {

    const size =
        Number(
            data.TeamSize || 1
        );


    if (!editMembers) {
        return;
    }


    if (size <= 1) {

        editMembers.innerHTML = `
            <div class="member-empty">
                Solo registration — no additional members.
            </div>
        `;

        return;
    }


    let html = "";


    for (
        let i = 2;
        i <= size;
        i++
    ) {

        html += `
            <div class="edit-member">

                <h4>
                    Participant ${String(i).padStart(2, "0")}
                </h4>


                <label>
                    Full Name

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
                            Select Class
                        </option>

                        ${[
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
                                            data[
                                                `Member${i}Class`
                                            ] === cls
                                                ? "selected"
                                                : ""
                                        }>
                                        ${cls}
                                    </option>`
                            )
                            .join("")}

                    </select>

                </label>


                <label>
                    Section

                    <input
                        id="editMember${i}Section"
                        maxlength="5"
                        value="${escapeHTML(
                            data[`Member${i}Section`] || ""
                        )}">
                </label>

            </div>
        `;

    }


    editMembers.innerHTML =
        html;
}


/* =========================================================
   SAVE EDIT
========================================================= */

editForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const key =
            editKey.value;

        if (!key) {
            return;
        }


        const oldData =
            registrations[key];


        if (!oldData) {
            return;
        }


        const updates = {

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
                editRemarks.value.trim()

        };


        const size =
            Number(
                oldData.TeamSize || 1
            );


        for (
            let i = 2;
            i <= 5;
            i++
        ) {

            if (i <= size) {

                updates[
                    `Member${i}Name`
                ] =
                    document.getElementById(
                        `editMember${i}Name`
                    )?.value.trim() || "";

                updates[
                    `Member${i}Class`
                ] =
                    document.getElementById(
                        `editMember${i}Class`
                    )?.value || "";

                updates[
                    `Member${i}Section`
                ] =
                    document.getElementById(
                        `editMember${i}Section`
                    )?.value.trim() || "";

            }

        }


        try {

            if (editMessage) {

                editMessage.textContent =
                    "Saving changes...";

            }


            await update(
                ref(
                    db,
                    `registrations/${key}`
                ),
                updates
            );


            if (editMessage) {

                editMessage.textContent =
                    "Changes saved successfully.";

            }


            setTimeout(
                closeEditModal,
                700
            );


        } catch (error) {

            console.error(
                "Edit error:",
                error
            );


            if (editMessage) {

                editMessage.textContent =
                    "Unable to save changes. Check Firebase rules.";

            }

        }

    }
);


/* =========================================================
   DELETE
========================================================= */

async function deleteRegistration(key) {

    const data =
        registrations[key];

    if (!data) {
        return;
    }


    const name =
        data.StudentName ||
        "this registration";


    const confirmed =
        window.confirm(
            `Delete registration for ${name}?\n\nThis action cannot be undone.`
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


        setStatus(
            "Registration deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        setStatus(
            "Unable to delete registration. Check Firebase rules.",
            "error"
        );

    }

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
   SEARCH
========================================================= */

searchInput?.addEventListener(
    "input",
    renderRegistrations
);


/* =========================================================
   REFRESH
========================================================= */

refreshBtn?.addEventListener(
    "click",
    () => {

        renderRegistrations();

        setStatus(
            "Dashboard refreshed.",
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

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        currentUser = user;


        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        console.log(
            "Logged in UID:",
            user.uid
        );


        if (!isAdmin(user)) {

            setStatus(
                "Access denied. This account is not an administrator.",
                "error"
            );


            setTimeout(
                () => {

                    signOut(auth);

                },
                1500
            );

            return;
        }


        setStatus(
            "Administrator authenticated.",
            "success"
        );


        loadRegistrations();

    }
);
