/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN CONTROL PANEL
   admin.js
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

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

    apiKey:
        "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",

    authDomain:
        "aps-robotics-championship.firebaseapp.com",

    databaseURL:
        "https://aps-robotics-championship-default-rtdb.firebaseio.com",

    projectId:
        "aps-robotics-championship",

    storageBucket:
        "aps-robotics-championship.firebasestorage.app",

    messagingSenderId:
        "1063542904891",

    appId:
        "1:1063542904891:web:82ff9bb3fba0b87384a41e"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen =
    document.getElementById("loginScreen");

const dashboard =
    document.getElementById("dashboard");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const errorBox =
    document.getElementById("error");

const tableBody =
    document.getElementById("tableBody");

const searchInput =
    document.getElementById("search");

const totalElement =
    document.getElementById("total");

const raceElement =
    document.getElementById("race");

const warElement =
    document.getElementById("war");

const tugElement =
    document.getElementById("tug");

const soccerElement =
    document.getElementById("soccer");


/* =========================================================
   ADMIN LOGIN
========================================================= */

/*
   CHANGE THESE VALUES.

   IMPORTANT:
   This is only a frontend login.
   For real security use Firebase Authentication.
*/

const ADMIN_USERNAME = "admin";

const ADMIN_PASSWORD = "APS2026";


/* =========================================================
   CHECK EXISTING LOGIN
========================================================= */

if (
    sessionStorage.getItem("apsAdminLoggedIn") === "true"
) {

    showDashboard();

} else {

    showLogin();

}


/* =========================================================
   LOGIN FUNCTION
========================================================= */

window.login = function () {

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;


    errorBox.textContent = "";


    if (!username || !password) {

        errorBox.textContent =
            "Please enter username and password.";

        return;

    }


    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {

        sessionStorage.setItem(
            "apsAdminLoggedIn",
            "true"
        );

        showDashboard();

    } else {

        errorBox.textContent =
            "Invalid username or password.";

        passwordInput.value = "";

    }

};


/* =========================================================
   SHOW DASHBOARD
========================================================= */

function showDashboard() {

    loginScreen.style.display = "none";

    dashboard.style.display = "block";

    loadRegistrations();

}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    loginScreen.style.display = "flex";

    dashboard.style.display = "none";

}


/* =========================================================
   LOGOUT
========================================================= */

window.logout = function () {

    sessionStorage.removeItem(
        "apsAdminLoggedIn"
    );

    showLogin();

};


/* =========================================================
   REGISTRATION DATA
========================================================= */

let registrations = {};


/* =========================================================
   LOAD REGISTRATIONS
========================================================= */

function loadRegistrations() {

    const registrationsRef =
        ref(database, "registrations");


    onValue(
        registrationsRef,
        snapshot => {

            registrations =
                snapshot.val() || {};


            updateStatistics();

            renderTable(
                Object.entries(registrations)
            );

        },

        error => {

            console.error(
                "Firebase error:",
                error
            );


            tableBody.innerHTML = `

                <tr>

                    <td colspan="6">

                        <div class="loading">

                            <i class="fa-solid fa-triangle-exclamation"></i>

                            Unable to load registrations.

                        </div>

                    </td>

                </tr>

            `;

        }
    );

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const list =
        Object.values(registrations);


    totalElement.textContent =
        list.length;


    let race = 0;

    let war = 0;

    let tug = 0;

    let soccer = 0;


    list.forEach(data => {

        const events =
            getEventsArray(data.Events);


        events.forEach(event => {

            const normalized =
                event.toLowerCase().trim();


            if (
                normalized === "robo race"
            ) {

                race++;

            }


            if (
                normalized === "robo war"
            ) {

                war++;

            }


            if (
                normalized === "robo tug of war"
            ) {

                tug++;

            }


            if (
                normalized === "robo soccer"
            ) {

                soccer++;

            }

        });

    });


    raceElement.textContent = race;

    warElement.textContent = war;

    tugElement.textContent = tug;

    soccerElement.textContent = soccer;

}


/* =========================================================
   CONVERT EVENTS TO ARRAY
========================================================= */

function getEventsArray(events) {

    if (!events) {

        return [];

    }


    if (Array.isArray(events)) {

        return events;

    }


    return [events];

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   GET REGISTRATION ID
========================================================= */

function getRegistrationID(
    data,
    firebaseKey
) {

    /*
       New registrations should contain
       RegistrationID.

       Older registrations may not have it,
       so Firebase key is used as fallback.
    */

    if (data.RegistrationID) {

        return data.RegistrationID;

    }


    if (data.registrationID) {

        return data.registrationID;

    }


    return firebaseKey;

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable(entries) {

    if (!entries.length) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="loading">

                        <i class="fa-solid fa-folder-open"></i>

                        No registrations found.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML = "";


    /*
       Newest registrations first
    */

    entries.reverse();


    entries.forEach(
        ([firebaseKey, data]) => {

            const registrationID =
                getRegistrationID(
                    data,
                    firebaseKey
                );


            const student =
                data.StudentName ||
                data.studentName ||
                "-";


            const team =
                data.TeamName ||
                data.teamName ||
                "-";


            const mobile =
                data.MobileNumber ||
                data.mobile ||
                "-";


            const events =
                getEventsArray(
                    data.Events
                );


            const eventHTML =
                events.length

                ?

                events.map(event => {

                    return `

                        <span class="event-tag">

                            ${escapeHTML(event)}

                        </span>

                    `;

                }).join("")

                :

                "-";


            const row =
                document.createElement("tr");


            row.dataset.firebaseKey =
                firebaseKey;


            row.innerHTML = `

                <td>

                    <strong class="registration-id">

                        ${escapeHTML(
                            registrationID
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHTML(student)}

                </td>


                <td>

                    ${escapeHTML(team)}

                </td>


                <td>

                    <div class="event-tags">

                        ${eventHTML}

                    </div>

                </td>


                <td>

                    ${escapeHTML(mobile)}

                </td>


                <td>

                    <div class="action-buttons">


                        <button

                            class="edit-btn"

                            onclick="openEditModal('${escapeJS(firebaseKey)}')"

                            title="Edit Registration"

                        >

                            <i class="fa-solid fa-pen"></i>

                            Edit

                        </button>


                        <button

                            class="delete-btn"

                            onclick="deleteRegistration('${escapeJS(firebaseKey)}')"

                            title="Delete Registration"

                        >

                            <i class="fa-solid fa-trash"></i>

                            Delete

                        </button>


                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );

}


/* =========================================================
   ESCAPE JAVASCRIPT VALUE
========================================================= */

function escapeJS(value) {

    return String(value)

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'")

        .replace(/"/g, '\\"')

        .replace(/\n/g, "\\n")

        .replace(/\r/g, "\\r");

}


/* =========================================================
   SEARCH
========================================================= */

window.searchRegistration =
function () {

    const query =
        searchInput.value
        .trim()
        .toLowerCase();


    const entries =
        Object.entries(registrations);


    if (!query) {

        renderTable(entries);

        return;

    }


    const filtered =
        entries.filter(
            ([firebaseKey, data]) => {

                const registrationID =
                    getRegistrationID(
                        data,
                        firebaseKey
                    );


                const student =
                    data.StudentName || "";


                const team =
                    data.TeamName || "";


                const mobile =
                    data.MobileNumber || "";


                const email =
                    data.EmailAddress || "";


                const events =
                    getEventsArray(
                        data.Events
                    ).join(" ");


                const searchable = (

                    registrationID +

                    " " +

                    student +

                    " " +

                    team +

                    " " +

                    mobile +

                    " " +

                    email +

                    " " +

                    events

                ).toLowerCase();


                return searchable.includes(
                    query
                );

            }
        );


    renderTable(filtered);

};


/* =========================================================
   EDIT MODAL
========================================================= */

let editingFirebaseKey = null;


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

window.openEditModal =
function (firebaseKey) {

    const data =
        registrations[firebaseKey];


    if (!data) {

        alert(
            "Registration not found."
        );

        return;

    }


    editingFirebaseKey =
        firebaseKey;


    const registrationID =
        getRegistrationID(
            data,
            firebaseKey
        );


    document.getElementById(
        "editID"
    ).textContent =
        registrationID;


    document.getElementById(
        "editStudentName"
    ).value =
        data.StudentName || "";


    document.getElementById(
        "editTeamName"
    ).value =
        data.TeamName || "";


    document.getElementById(
        "editClass"
    ).value =
        data.Class || "";


    document.getElementById(
        "editSection"
    ).value =
        data.Section || "";


    document.getElementById(
        "editMobile"
    ).value =
        data.MobileNumber || "";


    document.getElementById(
        "editEmail"
    ).value =
        data.EmailAddress || "";


    document.getElementById(
        "editEvents"
    ).value =
        getEventsArray(
            data.Events
        ).join(", ");


    document.getElementById(
        "editModal"
    ).classList.add("active");

};


/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

window.closeEditModal =
function () {

    document.getElementById(
        "editModal"
    ).classList.remove("active");


    editingFirebaseKey = null;

};


/* =========================================================
   SAVE EDIT
========================================================= */

window.saveEdit =
async function () {

    if (!editingFirebaseKey) {

        return;

    }


    const studentName =
        document.getElementById(
            "editStudentName"
        ).value.trim();


    const teamName =
        document.getElementById(
            "editTeamName"
        ).value.trim();


    const className =
        document.getElementById(
            "editClass"
        ).value.trim();


    const section =
        document.getElementById(
            "editSection"
        ).value.trim();


    const mobile =
        document.getElementById(
            "editMobile"
        ).value.trim();


    const email =
        document.getElementById(
            "editEmail"
        ).value.trim();


    const eventsText =
        document.getElementById(
            "editEvents"
        ).value.trim();


    const events =
        eventsText

        ?

        eventsText
            .split(",")
            .map(event => event.trim())
            .filter(Boolean)

        :

        [];


    const changes = {

        StudentName:
            studentName,

        TeamName:
            teamName,

        Class:
            className,

        Section:
            section,

        MobileNumber:
            mobile,

        EmailAddress:
            email,

        Events:
            events

    };


    try {

        await update(

            ref(
                database,
                "registrations/" +
                editingFirebaseKey
            ),

            changes

        );


        alert(
            "Registration updated successfully."
        );


        closeEditModal();


    }
    catch(error) {

        console.error(error);


        alert(
            "Unable to update registration.\n\n" +
            error.message
        );

    }

};


/* =========================================================
   DELETE REGISTRATION
========================================================= */

window.deleteRegistration =
async function (firebaseKey) {

    const data =
        registrations[firebaseKey];


    if (!data) {

        return;

    }


    const registrationID =
        getRegistrationID(
            data,
            firebaseKey
        );


    const student =
        data.StudentName ||
        "this registration";


    const confirmed =
        confirm(

            "Delete registration?\n\n" +

            "Registration: " +
            registrationID +

            "\nStudent: " +
            student +

            "\n\nThis action cannot be undone."

        );


    if (!confirmed) {

        return;

    }


    try {

        await remove(

            ref(
                database,
                "registrations/" +
                firebaseKey
            )

        );


        alert(
            "Registration deleted successfully."
        );


    }
    catch(error) {

        console.error(error);


        alert(
            "Unable to delete registration.\n\n" +
            error.message
        );

    }

};


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================================= */

const editModal =
    document.getElementById(
        "editModal"
    );


if (editModal) {

    editModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === editModal
            ) {

                closeEditModal();

            }

        }
    );

}


/* =========================================================
   ESC KEY CLOSE MODAL
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeEditModal();

        }

    }
);


/* =========================================================
   ENTER KEY LOGIN
========================================================= */

if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                window.login();

            }

        }
    );

}


/* =========================================================
   CSV EXPORT
========================================================= */

window.downloadCSV =
function () {

    const entries =
        Object.entries(registrations);


    if (!entries.length) {

        alert(
            "There are no registrations to export."
        );

        return;

    }


    const headers = [

        "Registration ID",

        "Student Name",

        "Class",

        "Section",

        "Team Name",

        "Mobile Number",

        "Email",

        "Events",

        "Team Size",

        "Remarks"

    ];


    const rows = [

        headers

    ];


    entries.forEach(
        ([firebaseKey, data]) => {

            const registrationID =
                getRegistrationID(
                    data,
                    firebaseKey
                );


            const events =
                getEventsArray(
                    data.Events
                ).join(" | ");


            rows.push([

                registrationID,

                data.StudentName || "",

                data.Class || "",

                data.Section || "",

                data.TeamName || "",

                data.MobileNumber || "",

                data.EmailAddress || "",

                events,

                data.TeamSize || "",

                data.Remarks || ""

            ]);

        }
    );


    const csv =
        rows.map(row => {

            return row.map(value => {

                const text =
                    String(value)
                    .replace(/"/g, '""');


                return `"${text}"`;

            }).join(",");

        }).join("\n");


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
        "APS_Robotics_Registrations_2026.csv";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

};


/* =========================================================
   INITIAL TABLE STATE
========================================================= */

if (
    sessionStorage.getItem(
        "apsAdminLoggedIn"
    ) === "true"
) {

    loadRegistrations();

   }
