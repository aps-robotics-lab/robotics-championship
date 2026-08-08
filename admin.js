/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN CONTROL PANEL
   FIREBASE REALTIME DATABASE
===================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

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


/* =====================================================
   INITIALIZE FIREBASE
===================================================== */

const app =
    initializeApp(firebaseConfig);

const database =
    getDatabase(app);


/* =====================================================
   ADMIN LOGIN
===================================================== */

window.login = function () {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;


    if (
        username === "apsadmin" &&
        password === "APS2026@Lab"
    ) {

        document.getElementById("loginScreen").style.display =
            "none";

        document.getElementById("dashboard").style.display =
            "block";

        loadRegistrations();

    }
    else {

        const error =
            document.getElementById("error");

        error.innerHTML =
            "❌ Invalid Login Details";

    }

};


/* =====================================================
   LOGOUT
===================================================== */

window.logout = function () {

    document.getElementById("dashboard").style.display =
        "none";

    document.getElementById("loginScreen").style.display =
        "flex";

    document.getElementById("username").value = "";

    document.getElementById("password").value = "";

    document.getElementById("error").innerHTML = "";

};


/* =====================================================
   ESCAPE HTML
   Prevents Firebase data from breaking the table
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "-";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   GET EVENTS
===================================================== */

function getEvents(data) {

    if (!data.Events) {

        return [];

    }


    if (Array.isArray(data.Events)) {

        return data.Events;

    }


    return [data.Events];

}


/* =====================================================
   LOAD REGISTRATIONS
===================================================== */

async function loadRegistrations() {

    try {

        const registrationsRef =
            ref(
                database,
                "registrations"
            );


        const snapshot =
            await get(registrationsRef);


        let total = 0;

        let race = 0;

        let war = 0;

        let tug = 0;

        let soccer = 0;


        let table = "";


        if (!snapshot.exists()) {

            document.getElementById("tableBody").innerHTML = `

                <tr>

                    <td colspan="6">

                        <div class="loading">

                            No registrations found.

                        </div>

                    </td>

                </tr>

            `;


            updateStatistics(
                0,
                0,
                0,
                0,
                0
            );

            return;

        }


        const registrations =
            snapshot.val();


        Object.entries(registrations)
            .forEach(
                ([firebaseKey, data]) => {


                    total++;


                    const events =
                        getEvents(data);


                    if (
                        events.includes(
                            "Robo Race"
                        )
                    ) {

                        race++;

                    }


                    if (
                        events.includes(
                            "Robo War"
                        )
                    ) {

                        war++;

                    }


                    if (
                        events.includes(
                            "Robo Tug of War"
                        )
                    ) {

                        tug++;

                    }


                    if (
                        events.includes(
                            "Robo Soccer"
                        )
                    ) {

                        soccer++;

                    }


                    /* =================================
                       MEMBER DETAILS
                    ================================= */


                    const member2 =
                        data.Member2Name
                            ? `
                                <div class="member-row">
                                    <strong>02</strong>
                                    <div>
                                        <b>
                                            ${escapeHTML(
                                                data.Member2Name
                                            )}
                                        </b>
                                        <small>
                                            Class:
                                            ${escapeHTML(
                                                data.Member2Class || "-"
                                            )}
                                            &nbsp; | &nbsp;
                                            Section:
                                            ${escapeHTML(
                                                data.Member2Section || "-"
                                            )}
                                        </small>
                                    </div>
                                </div>
                            `
                            : "";


                    const member3 =
                        data.Member3Name
                            ? `
                                <div class="member-row">
                                    <strong>03</strong>
                                    <div>
                                        <b>
                                            ${escapeHTML(
                                                data.Member3Name
                                            )}
                                        </b>
                                        <small>
                                            Class:
                                            ${escapeHTML(
                                                data.Member3Class || "-"
                                            )}
                                            &nbsp; | &nbsp;
                                            Section:
                                            ${escapeHTML(
                                                data.Member3Section || "-"
                                            )}
                                        </small>
                                    </div>
                                </div>
                            `
                            : "";


                    const member4 =
                        data.Member4Name
                            ? `
                                <div class="member-row">
                                    <strong>04</strong>
                                    <div>
                                        <b>
                                            ${escapeHTML(
                                                data.Member4Name
                                            )}
                                        </b>
                                        <small>
                                            Class:
                                            ${escapeHTML(
                                                data.Member4Class || "-"
                                            )}
                                            &nbsp; | &nbsp;
                                            Section:
                                            ${escapeHTML(
                                                data.Member4Section || "-"
                                            )}
                                        </small>
                                    </div>
                                </div>
                            `
                            : "";


                    const member5 =
                        data.Member5Name
                            ? `
                                <div class="member-row">
                                    <strong>05</strong>
                                    <div>
                                        <b>
                                            ${escapeHTML(
                                                data.Member5Name
                                            )}
                                        </b>
                                        <small>
                                            Class:
                                            ${escapeHTML(
                                                data.Member5Class || "-"
                                            )}
                                            &nbsp; | &nbsp;
                                            Section:
                                            ${escapeHTML(
                                                data.Member5Section || "-"
                                            )}
                                        </small>
                                    </div>
                                </div>
                            `
                            : "";


                    const membersHTML = `

                        <div class="team-members">

                            <div class="member-row leader">

                                <strong>01</strong>

                                <div>

                                    <b>
                                        ${escapeHTML(
                                            data.StudentName
                                        )}
                                    </b>

                                    <small>

                                        Team Leader

                                        • Class:
                                        ${escapeHTML(
                                            data.Class || "-"
                                        )}

                                        • Section:
                                        ${escapeHTML(
                                            data.Section || "-"
                                        )}

                                    </small>

                                </div>

                            </div>


                            ${member2}

                            ${member3}

                            ${member4}

                            ${member5}

                        </div>

                    `;


                    const eventsHTML =
                        events.length
                            ? events.map(
                                event => `
                                    <span class="event-tag">
                                        ${escapeHTML(event)}
                                    </span>
                                `
                            ).join("")
                            : "-";


                    table += `

                        <tr data-id="${escapeHTML(firebaseKey)}">

                            <td>

                                <div class="registration-id">

                                    <strong>
                                        ${escapeHTML(
                                            data.registrationId || "-"
                                        )}
                                    </strong>

                                </div>

                            </td>


                            <td>

                                <div class="leader-info">

                                    <strong>
                                        ${escapeHTML(
                                            data.StudentName || "-"
                                        )}
                                    </strong>

                                    <small>

                                        Class:
                                        ${escapeHTML(
                                            data.Class || "-"
                                        )}

                                        &nbsp; | &nbsp;

                                        Section:
                                        ${escapeHTML(
                                            data.Section || "-"
                                        )}

                                    </small>

                                </div>

                            </td>


                            <td>

                                <div class="team-info">

                                    <strong>

                                        ${escapeHTML(
                                            data.TeamName ||
                                            "Individual"
                                        )}

                                    </strong>


                                    <span>

                                        Team Size:
                                        ${escapeHTML(
                                            data.TeamSize || "1"
                                        )}

                                    </span>


                                    ${membersHTML}

                                </div>

                            </td>


                            <td>

                                <div class="events-list">

                                    ${eventsHTML}

                                </div>

                            </td>


                            <td>

                                <div class="contact-info">

                                    <a href="tel:${escapeHTML(
                                        data.MobileNumber || ""
                                    )}">

                                        <i class="fa-solid fa-phone"></i>

                                        ${escapeHTML(
                                            data.MobileNumber || "-"
                                        )}

                                    </a>


                                    <a href="mailto:${escapeHTML(
                                        data.EmailAddress || ""
                                    )}">

                                        <i class="fa-solid fa-envelope"></i>

                                        ${escapeHTML(
                                            data.EmailAddress || "-"
                                        )}

                                    </a>

                                </div>

                            </td>


                            <td>

                                <div class="action-buttons">

                                    <button
                                        class="edit-btn"
                                        onclick="editRegistration('${firebaseKey}')"
                                    >

                                        <i class="fa-solid fa-pen"></i>

                                    </button>


                                    <button
                                        class="delete-btn"
                                        onclick="deleteRegistration('${firebaseKey}')"
                                    >

                                        <i class="fa-solid fa-trash"></i>

                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            );


        updateStatistics(
            total,
            race,
            war,
            tug,
            soccer
        );


        document.getElementById("tableBody").innerHTML =
            table;

    }


    catch (error) {

        console.error(
            "Firebase Error:",
            error
        );


        document.getElementById("tableBody").innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="loading">

                        ❌ Failed to load registrations.

                        <br><br>

                        ${escapeHTML(
                            error.message
                        )}

                    </div>

                </td>

            </tr>

        `;

    }

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics(
    total,
    race,
    war,
    tug,
    soccer
) {

    document.getElementById("total").innerText =
        total;

    document.getElementById("race").innerText =
        race;

    document.getElementById("war").innerText =
        war;

    document.getElementById("tug").innerText =
        tug;

    document.getElementById("soccer").innerText =
        soccer;

}


/* =====================================================
   SEARCH
===================================================== */

window.searchRegistration = function () {

    const input =
        document.getElementById("search");

    const value =
        input.value.toLowerCase().trim();


    const rows =
        document.querySelectorAll(
            "#tableBody tr"
        );


    rows.forEach(row => {

        const text =
            row.innerText.toLowerCase();


        if (
            text.includes(value)
        ) {

            row.style.display = "";

        }
        else {

            row.style.display = "none";

        }

    });

};


/* =====================================================
   DELETE REGISTRATION
===================================================== */

window.deleteRegistration = async function (
    firebaseKey
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this registration?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        await remove(
            ref(
                database,
                "registrations/" + firebaseKey
            )
        );


        alert(
            "Registration deleted successfully."
        );


        loadRegistrations();

    }


    catch (error) {

        console.error(error);

        alert(
            "Delete failed: " +
            error.message
        );

    }

};


/* =====================================================
   EDIT REGISTRATION
===================================================== */

let currentEditKey = null;


window.editRegistration = async function (
    firebaseKey
) {

    currentEditKey =
        firebaseKey;


    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "registrations/" +
                    firebaseKey
                )
            );


        if (!snapshot.exists()) {

            alert(
                "Registration not found."
            );

            return;

        }


        const data =
            snapshot.val();


        document.getElementById(
            "editID"
        ).innerText =
            data.registrationId || "-";


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


        const events =
            getEvents(data);


        document.getElementById(
            "editEvents"
        ).value =
            events.join(", ");


        document.getElementById(
            "editModal"
        ).classList.add(
            "active"
        );

    }


    catch (error) {

        console.error(error);

        alert(
            "Unable to open registration."
        );

    }

};


/* =====================================================
   CLOSE EDIT MODAL
===================================================== */

window.closeEditModal = function () {

    document.getElementById(
        "editModal"
    ).classList.remove(
        "active"
    );


    currentEditKey =
        null;

};


/* =====================================================
   SAVE EDIT
===================================================== */

window.saveEdit = async function () {

    if (!currentEditKey) {

        return;

    }


    try {

        const eventsText =
            document.getElementById(
                "editEvents"
            ).value;


        const events =
            eventsText
                .split(",")
                .map(
                    event =>
                        event.trim()
                )
                .filter(
                    event =>
                        event.length > 0
                );


        const changes = {

            StudentName:
                document.getElementById(
                    "editStudentName"
                ).value.trim(),

            TeamName:
                document.getElementById(
                    "editTeamName"
                ).value.trim(),

            Class:
                document.getElementById(
                    "editClass"
                ).value.trim(),

            Section:
                document.getElementById(
                    "editSection"
                ).value.trim(),

            MobileNumber:
                document.getElementById(
                    "editMobile"
                ).value.trim(),

            EmailAddress:
                document.getElementById(
                    "editEmail"
                ).value.trim(),

            Events:
                events

        };


        await update(

            ref(
                database,
                "registrations/" +
                currentEditKey
            ),

            changes

        );


        alert(
            "Registration updated successfully."
        );


        closeEditModal();

        loadRegistrations();

    }


    catch (error) {

        console.error(error);

        alert(
            "Update failed: " +
            error.message
        );

    }

};


/* =====================================================
   DOWNLOAD CSV
===================================================== */

window.downloadCSV = async function () {

    try {

        const snapshot =
            await get(
                ref(
                    database,
                    "registrations"
                )
            );


        if (!snapshot.exists()) {

            alert(
                "No registrations available."
            );

            return;

        }


        const registrations =
            snapshot.val();


        const headers = [

            "Registration ID",

            "Team Leader",

            "Leader Class",

            "Leader Section",

            "Team Name",

            "Team Size",

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

            "Events",

            "Mobile",

            "Email",

            "Registration Date"

        ];


        let csv = [];


        csv.push(
            headers.map(
                csvEscape
            ).join(",")
        );


        Object.values(
            registrations
        ).forEach(data => {

            const events =
                getEvents(data);


            const row = [

                data.registrationId || "",

                data.StudentName || "",

                data.Class || "",

                data.Section || "",

                data.TeamName || "",

                data.TeamSize || "",

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

                events.join(" | "),

                data.MobileNumber || "",

                data.EmailAddress || "",

                data.registrationDate || ""

            ];


            csv.push(
                row.map(
                    csvEscape
                ).join(",")
            );

        });


        const csvFile =
            new Blob(
                [csv.join("\n")],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const link =
            document.createElement("a");


        link.href =
            URL.createObjectURL(
                csvFile
            );


        link.download =
            "APS_Robotics_Championship_2026_Registrations.csv";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


    }


    catch (error) {

        console.error(error);

        alert(
            "Could not export registrations."
        );

    }

};


/* =====================================================
   CSV ESCAPE
===================================================== */

function csvEscape(value) {

    const text =
        String(
            value ?? ""
        );


    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {

        return '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"';

    }


    return text;

}


/* =====================================================
   INITIAL STATE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const dashboard =
            document.getElementById(
                "dashboard"
            );


        if (dashboard) {

            dashboard.style.display =
                "none";

        }

    }
);
