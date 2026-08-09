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
   INITIALIZE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getDatabase(app);


/* =========================================================
   ADMIN UID LIST
========================================================= */

const ADMIN_UIDS = new Set([

    "crfLkH7qlofZBea5GEwLMEtL92X2",

    "5lBbcuD2BjRdDya7Lo9uRXdBIp92",

    "jd7b5KYmivhYpCJzLyQ005BFmCn2",

    "spzBLVusBfcqCCSmK923QmhmcAN2",

    "1PhsiGhletVZYliDKKKVKV2G9tu2"

]);


/* =========================================================
   ELEMENTS
========================================================= */

const body =
    document.getElementById(
        "registrationBody"
    );

const search =
    document.getElementById("search");

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const status =
    document.getElementById("status");

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
   DATA
========================================================= */

let registrations = {};

let registrationListener = null;


/* =========================================================
   STATUS
========================================================= */

function showStatus(
    message,
    type = ""
) {

    if (!status) return;

    status.textContent =
        message;

    status.className =
        "status " + type;

}


/* =========================================================
   ESCAPE
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


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "-";
    }

    try {

        const date =
            new Date(value);

        if (isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch {

        return String(value);

    }

}


/* =========================================================
   MEMBERS
========================================================= */

function getMembers(data) {

    const members = [];

    for (let i = 2; i <= 5; i++) {

        const name =
            data[`Member${i}Name`];

        if (!name) {
            continue;
        }

        const cls =
            data[`Member${i}Class`] || "-";

        const section =
            data[`Member${i}Section`] || "-";

        members.push({
            name,
            className: cls,
            section
        });

    }

    return members;

}


/* =========================================================
   SEARCH
========================================================= */

function matchesSearch(data, key) {

    const query =
        search?.value
            ?.trim()
            .toLowerCase() || "";

    if (!query) {
        return true;
    }

    const events =
        Array.isArray(data.Events)
            ? data.Events.join(" ")
            : String(data.Events || "");

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

        events,

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


/* =========================================================
   RENDER
========================================================= */

function renderRegistrations() {

    if (!body) return;


    const allEntries =
        Object.values(
            registrations
        );


    const entries =
        Object.entries(
            registrations
        )
            .filter(
                ([key, data]) =>
                    matchesSearch(data, key)
            )
            .reverse();


    /* ================= STATS ================= */

    const total =
        allEntries.length;


    const solo =
        allEntries.filter(data => {

            return (
                Number(data.TeamSize) === 1 ||
                String(
                    data.ParticipationType || ""
                ).toLowerCase() === "solo"
            );

        }).length;


    const teams =
        total - solo;


    let participants = 0;

    allEntries.forEach(data => {

        const size =
            Number(data.TeamSize || 1);

        participants +=
            size > 0 ? size : 1;

    });


    totalRegistrations.textContent =
        total;

    soloCount.textContent =
        solo;

    teamCount.textContent =
        teams;

    participantCount.textContent =
        participants;


    /* ================= EMPTY ================= */

    if (!entries.length) {

        body.innerHTML = `

            <tr>

                <td
                colspan="9"
                style="text-align:center;padding:50px;">

                    <div style="font-size:30px;">
                        🔎
                    </div>

                    <div style="margin-top:10px;">
                        No registrations found.
                    </div>

                </td>

            </tr>

        `;

        return;

    }


    /* ================= ROWS ================= */

    body.innerHTML =
        entries.map(
            ([key, data]) => {

                const members =
                    getMembers(data);


                const events =
                    Array.isArray(data.Events)
                        ? data.Events.join(", ")
                        : data.Events || "-";


                const type =
                    data.ParticipationType ||
                    (
                        Number(data.TeamSize) === 1
                            ? "Solo"
                            : `Team of ${data.TeamSize || "-"}`
                    );


                const registrationId =
                    data.registrationId ||
                    key;


                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    registrationId
                                )}
                            </strong>

                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    data.StudentName || "-"
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    `${data.Class || ""} ${data.Section || ""}`
                                )}
                            </small>

                        </td>


                        <td>
                            ${escapeHTML(
                                data.TeamName || "—"
                            )}
                        </td>


                        <td>

                            <span class="type-badge">
                                ${escapeHTML(type)}
                            </span>

                        </td>


                        <td>

                            ${
                                members.length
                                    ? members.map(member => `

                                        <div style="margin-bottom:5px;">

                                            <strong>
                                                ${escapeHTML(
                                                    member.name
                                                )}
                                            </strong>

                                            <small>
                                                ${escapeHTML(
                                                    `${member.className}-${member.section}`
                                                )}
                                            </small>

                                        </div>

                                    `).join("")
                                    : "—"
                            }

                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    data.MobileNumber || "-"
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    data.EmailAddress || "-"
                                )}
                            </small>

                        </td>


                        <td>
                            ${escapeHTML(events)}
                        </td>


                        <td>
                            ${escapeHTML(
                                formatDate(
                                    data.registrationDate ||
                                    data.timestamp ||
                                    data.createdAt
                                )
                            )}
                        </td>


                        <td>

                            <div class="action-buttons">

                                <button
                                class="edit-btn"
                                data-key="${escapeHTML(key)}">

                                    Edit

                                </button>


                                <button
                                class="delete-btn"
                                data-key="${escapeHTML(key)}">

                                    Delete

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");


    /* ================= EVENTS ================= */

    body
        .querySelectorAll(".edit-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openEdit(
                        button.dataset.key
                    );

                }
            );

        });


    body
        .querySelectorAll(".delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteRegistration(
                        button.dataset.key
                    );

                }
            );

        });

}


/* =========================================================
   LOAD REGISTRATIONS
========================================================= */

function loadRegistrations() {

    showStatus(
        "Connecting to Firebase..."
    );


    const registrationsRef =
        ref(
            db,
            "registrations"
        );


    if (registrationListener) {
        registrationListener();
    }


    registrationListener =
        onValue(

            registrationsRef,

            snapshot => {

                registrations =
                    snapshot.val() || {};

                renderRegistrations();

                showStatus(
                    `${Object.keys(registrations).length} registration(s) loaded.`,
                    "success"
                );

            },

            error => {

                console.error(
                    "Firebase error:",
                    error
                );

                showStatus(
                    "Permission denied. Please check your Firebase Realtime Database Rules.",
                    "error"
                );

            }

        );

}


/* =========================================================
   OPEN EDIT
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


    editMembers.innerHTML =
        "";


    const teamSize =
        Math.min(
            Math.max(
                Number(
                    data.TeamSize || 1
                ),
                1
            ),
            5
        );


    for (
        let i = 2;
        i <= teamSize;
        i++
    ) {

        const selectedClass =
            data[`Member${i}Class`] || "";


        editMembers.insertAdjacentHTML(

            "beforeend",

            `

            <div class="edit-member-card">

                <h4>
                    PARTICIPANT ${String(i).padStart(2, "0")}
                </h4>


                <label>

                    Name

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
                                    }>

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
                    id="editMember${i}Section"
                    value="${escapeHTML(
                        data[`Member${i}Section`] || ""
                    )}">

                </label>

            </div>

            `

        );

    }


    editMessage.textContent =
        "";


    editOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeEditModal() {

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
            event.target === editOverlay
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
            editKey.value;


        if (!key) {
            return;
        }


        const oldData =
            registrations[key];


        if (!oldData) {
            return;
        }


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
                    Number(
                        oldData.TeamSize || 1
                    ),
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
                    document.getElementById(
                        `editMember${i}Name`
                    )?.value.trim() || "";


                updatedData[
                    `Member${i}Class`
                ] =
                    document.getElementById(
                        `editMember${i}Class`
                    )?.value || "";


                updatedData[
                    `Member${i}Section`
                ] =
                    document.getElementById(
                        `editMember${i}Section`
                    )?.value.trim() || "";

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

            editMessage.textContent =
                "Saving changes...";


            await update(

                ref(
                    db,
                    `registrations/${key}`
                ),

                updatedData

            );


            editMessage.textContent =
                "✓ Changes saved successfully.";


            showStatus(
                "Registration updated successfully.",
                "success"
            );


            setTimeout(
                closeEditModal,
                800
            );


        } catch (error) {

            console.error(error);

            editMessage.textContent =
                "Unable to save changes.";

            showStatus(
                "Permission denied while saving changes.",
                "error"
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


    if (!data) {
        return;
    }


    const name =
        data.StudentName ||
        "this registration";


    const id =
        data.registrationId ||
        key;


    const confirmed =
        confirm(

            `Delete registration?\n\n` +
            `Registration: ${id}\n` +
            `Student: ${name}\n\n` +
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


        showStatus(
            "Registration deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showStatus(
            "Permission denied. Registration could not be deleted.",
            "error"
        );

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

        renderRegistrations();

        showStatus(
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

            console.error(error);

        }

    }
);


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(

    auth,

    user => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        if (
            !ADMIN_UIDS.has(
                user.uid
            )
        ) {

            alert(
                "Access denied. Your account is not an administrator."
            );


            signOut(auth);

            return;

        }


        showStatus(
            `Welcome, ${user.email || "Administrator"}.`,
            "success"
        );


        loadRegistrations();

    }

);
