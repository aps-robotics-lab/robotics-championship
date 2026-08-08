import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    update,
    remove
}
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",

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


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


// =====================================================
// LOGIN
// =====================================================

window.login = function () {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const error =
        document.getElementById("error");


    if (username === "admin" && password === "aps2026") {

        localStorage.setItem("adminLogin", "true");

        document.querySelector(".login-box").style.display = "none";

        document.getElementById("dashboard").style.display = "block";

        error.innerHTML = "";

        loadData();

    } else {

        error.innerHTML =
            "❌ Invalid Username or Password";

    }
};


// =====================================================
// AUTO LOGIN
// =====================================================

if (localStorage.getItem("adminLogin") === "true") {

    document.querySelector(".login-box").style.display = "none";

    document.getElementById("dashboard").style.display = "block";

    loadData();
}


// =====================================================
// LOGOUT
// =====================================================

window.logout = function () {

    localStorage.removeItem("adminLogin");

    location.reload();
};


// =====================================================
// LOAD REGISTRATIONS
// =====================================================

function loadData() {

    const table =
        document.getElementById("tableBody");

    const dbRef =
        ref(database, "registrations");


    onValue(dbRef, (snapshot) => {

        table.innerHTML = "";

        let total = 0;
        let race = 0;
        let war = 0;
        let tug = 0;
        let soccer = 0;


        if (!snapshot.exists()) {

            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        No registrations found.
                    </td>
                </tr>
            `;

            document.getElementById("total").textContent = 0;
            document.getElementById("race").textContent = 0;
            document.getElementById("war").textContent = 0;
            document.getElementById("tug").textContent = 0;
            document.getElementById("soccer").textContent = 0;

            return;
        }


        snapshot.forEach((child) => {

            total++;

            const data = child.val();

            const registrationID = child.key;

            const events = data.Events || "";


            // EVENT COUNTS

            if (events.includes("Robo Race")) {
                race++;
            }

            if (events.includes("Robo War")) {
                war++;
            }

            if (events.includes("Robo Tug of War")) {
                tug++;
            }

            if (events.includes("Robo Soccer")) {
                soccer++;
            }


            // TABLE ROW

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHTML(registrationID)}
                </td>

                <td>
                    ${escapeHTML(data.StudentName || "-")}
                </td>

                <td>
                    ${escapeHTML(data.TeamName || "-")}
                </td>

                <td>
                    ${escapeHTML(events || "-")}
                </td>

                <td>
                    ${escapeHTML(data.MobileNumber || "-")}
                </td>

                <td class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editRegistration('${escapeJS(registrationID)}')"
                    >
                        <i class="fa-solid fa-pen"></i>
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteRegistration('${escapeJS(registrationID)}')"
                    >
                        <i class="fa-solid fa-trash"></i>
                        Delete
                    </button>

                </td>

            `;


            table.appendChild(row);

        });


        // UPDATE STATISTICS

        document.getElementById("total").textContent = total;

        document.getElementById("race").textContent = race;

        document.getElementById("war").textContent = war;

        document.getElementById("tug").textContent = tug;

        document.getElementById("soccer").textContent = soccer;

    });
}


// =====================================================
// EDIT REGISTRATION
// =====================================================

window.editRegistration = function (registrationID) {

    const registrationRef =
        ref(database, "registrations/" + registrationID);


    onValue(
        registrationRef,
        (snapshot) => {

            if (!snapshot.exists()) {

                alert("Registration not found.");

                return;
            }


            const data = snapshot.val();


            document.getElementById("editID").value =
                registrationID;

            document.getElementById("editStudentName").value =
                data.StudentName || "";

            document.getElementById("editTeamName").value =
                data.TeamName || "";

            document.getElementById("editClass").value =
                data.Class || "";

            document.getElementById("editSection").value =
                data.Section || "";

            document.getElementById("editMobile").value =
                data.MobileNumber || "";

            document.getElementById("editEmail").value =
                data.Email || "";

            document.getElementById("editEvents").value =
                data.Events || "";


            document.getElementById("editModal")
                .classList.add("active");

        },
        {
            onlyOnce: true
        }
    );
};


// =====================================================
// SAVE EDITED REGISTRATION
// =====================================================

window.saveEdit = function () {

    const registrationID =
        document.getElementById("editID").value;


    if (!registrationID) {

        alert("Registration ID missing.");

        return;
    }


    const updatedData = {

        StudentName:
            document.getElementById("editStudentName").value.trim(),

        TeamName:
            document.getElementById("editTeamName").value.trim(),

        Class:
            document.getElementById("editClass").value.trim(),

        Section:
            document.getElementById("editSection").value.trim(),

        MobileNumber:
            document.getElementById("editMobile").value.trim(),

        Email:
            document.getElementById("editEmail").value.trim(),

        Events:
            document.getElementById("editEvents").value.trim()

    };


    const registrationRef =
        ref(database, "registrations/" + registrationID);


    update(registrationRef, updatedData)

        .then(() => {

            alert("✅ Registration updated successfully.");

            closeEditModal();

        })

        .catch((error) => {

            console.error(error);

            alert(
                "❌ Could not update registration.\n\n" +
                error.message
            );

        });
};


// =====================================================
// DELETE REGISTRATION
// =====================================================

window.deleteRegistration = function (registrationID) {

    const confirmation =
        confirm(
            "⚠️ Are you sure you want to delete this registration?\n\n" +
            "Registration ID: " + registrationID +
            "\n\nThis action cannot be undone."
        );


    if (!confirmation) {
        return;
    }


    const registrationRef =
        ref(database, "registrations/" + registrationID);


    remove(registrationRef)

        .then(() => {

            alert(
                "🗑️ Registration deleted successfully."
            );

        })

        .catch((error) => {

            console.error(error);

            alert(
                "❌ Could not delete registration.\n\n" +
                error.message
            );

        });
};


// =====================================================
// CLOSE EDIT MODAL
// =====================================================

window.closeEditModal = function () {

    document.getElementById("editModal")
        .classList.remove("active");

};


// =====================================================
// SEARCH
// =====================================================

window.searchRegistration = function () {

    const value =
        document.getElementById("search")
            .value
            .toLowerCase()
            .trim();


    const rows =
        document.querySelectorAll("#tableBody tr");


    rows.forEach((row) => {

        const text =
            row.innerText.toLowerCase();


        if (text.includes(value)) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

};


// =====================================================
// CSV DOWNLOAD
// =====================================================

window.downloadCSV = function () {

    const rows =
        document.querySelectorAll("table tr");


    const csv = [];


    rows.forEach((row) => {

        const cols =
            row.querySelectorAll("th, td");


        const data = [];


        cols.forEach((col, index) => {

            // Don't include Action column
            if (index !== 5) {

                let value =
                    col.innerText
                        .replace(/"/g, '""');


                data.push(`"${value}"`);

            }

        });


        csv.push(data.join(","));

    });


    const blob =
        new Blob(
            [csv.join("\n")],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const link =
        document.createElement("a");


    link.href =
        URL.createObjectURL(blob);


    link.download =
        "APS_Robotics_Registrations.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

};


// =====================================================
// SECURITY HELPERS FOR TABLE HTML
// =====================================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


function escapeJS(value) {

    return String(value)

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'")

        .replace(/"/g, '\\"')

        .replace(/\n/g, "\\n")

        .replace(/\r/g, "\\r");

          }
