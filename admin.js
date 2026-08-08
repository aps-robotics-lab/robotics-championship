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

        localStorage.setItem(
            "adminLogin",
            "true"
        );

        document.querySelector(".login-box").style.display =
            "none";

        document.getElementById("dashboard").style.display =
            "block";

        error.textContent = "";

        loadData();

    } else {

        error.textContent =
            "❌ Invalid Username or Password";

    }

};


// =====================================================
// AUTO LOGIN
// =====================================================

if (
    localStorage.getItem("adminLogin") === "true"
) {

    document.querySelector(".login-box").style.display =
        "none";

    document.getElementById("dashboard").style.display =
        "block";

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


    onValue(
        dbRef,
        (snapshot) => {

            table.innerHTML = "";


            let total = 0;

            let race = 0;

            let war = 0;

            let tug = 0;

            let soccer = 0;


            // ---------------------------------------------
            // NO DATA
            // ---------------------------------------------

            if (!snapshot.exists()) {

                table.innerHTML = `

                    <tr>

                        <td colspan="6">

                            <i class="fa-solid fa-circle-info"></i>

                            No registrations found.

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


            // ---------------------------------------------
            // READ DATA
            // ---------------------------------------------

            snapshot.forEach(
                (child) => {

                    total++;


                    const data =
                        child.val();


                    const registrationID =
                        child.key;


                    const events =
                        data.Events || "";


                    // -------------------------------------
                    // EVENT COUNTERS
                    // -------------------------------------

                    if (
                        events.includes("Robo Race")
                    ) {

                        race++;

                    }


                    if (
                        events.includes("Robo War")
                    ) {

                        war++;

                    }


                    if (
                        events.includes("Robo Tug of War") ||
                        events.includes("Robo Tug")
                    ) {

                        tug++;

                    }


                    if (
                        events.includes("Robo Soccer")
                    ) {

                        soccer++;

                    }


                    // -------------------------------------
                    // CREATE ROW
                    // -------------------------------------

                    const row =
                        document.createElement("tr");


                    row.innerHTML = `

                        <td>
                            ${escapeHTML(
                                registrationID
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                data.StudentName || "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                data.TeamName || "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                events || "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                data.MobileNumber || "-"
                            )}
                        </td>


                        <td class="action-buttons">


                            <button
                                type="button"
                                class="edit-btn"
                                onclick="editRegistration('${escapeJS(registrationID)}')"
                            >

                                <i class="fa-solid fa-pen"></i>

                                Edit

                            </button>


                            <button
                                type="button"
                                class="delete-btn"
                                onclick="deleteRegistration('${escapeJS(registrationID)}')"
                            >

                                <i class="fa-solid fa-trash"></i>

                                Delete

                            </button>


                        </td>

                    `;


                    table.appendChild(row);

                }
            );


            // ---------------------------------------------
            // UPDATE STATISTICS
            // ---------------------------------------------

            updateStatistics(
                total,
                race,
                war,
                tug,
                soccer
            );

        },


        (error) => {

            console.error(
                "Firebase error:",
                error
            );


            table.innerHTML = `

                <tr>

                    <td colspan="6">

                        ❌ Unable to load registrations.

                        <br>

                        ${escapeHTML(
                            error.message
                        )}

                    </td>

                </tr>

            `;

        }
    );

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatistics(
    total,
    race,
    war,
    tug,
    soccer
) {

    document.getElementById("total").textContent =
        total;

    document.getElementById("race").textContent =
        race;

    document.getElementById("war").textContent =
        war;

    document.getElementById("tug").textContent =
        tug;

    document.getElementById("soccer").textContent =
        soccer;

}


// =====================================================
// EDIT REGISTRATION
// =====================================================

window.editRegistration = function (
    registrationID
) {

    const registrationRef =
        ref(
            database,
            "registrations/" + registrationID
        );


    onValue(
        registrationRef,

        (snapshot) => {

            if (!snapshot.exists()) {

                alert(
                    "❌ Registration not found."
                );

                return;

            }


            const data =
                snapshot.val();


            // ---------------------------------------------
            // FILL EDIT FORM
            // ---------------------------------------------

            document.getElementById("editID").value =
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
                data.Email || "";


            document.getElementById(
                "editEvents"
            ).value =
                data.Events || "";


            // ---------------------------------------------
            // OPEN MODAL
            // ---------------------------------------------

            document
                .getElementById("editModal")
                .classList.add("active");

        },

        {
            onlyOnce: true
        }

    );

};


// =====================================================
// SAVE EDIT
// =====================================================

window.saveEdit = function () {

    const registrationID =
        document.getElementById("editID").value.trim();


    if (!registrationID) {

        alert(
            "❌ Registration ID is missing."
        );

        return;

    }


    const updatedData = {

        StudentName:
            document
                .getElementById("editStudentName")
                .value
                .trim(),


        TeamName:
            document
                .getElementById("editTeamName")
                .value
                .trim(),


        Class:
            document
                .getElementById("editClass")
                .value
                .trim(),


        Section:
            document
                .getElementById("editSection")
                .value
                .trim(),


        MobileNumber:
            document
                .getElementById("editMobile")
                .value
                .trim(),


        Email:
            document
                .getElementById("editEmail")
                .value
                .trim(),


        Events:
            document
                .getElementById("editEvents")
                .value
                .trim()

    };


    const registrationRef =
        ref(
            database,
            "registrations/" + registrationID
        );


    // ---------------------------------------------
    // DISABLE SAVE BUTTON
    // ---------------------------------------------

    const saveButton =
        document.querySelector(".save-btn");


    if (saveButton) {

        saveButton.disabled = true;

        saveButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Saving...
        `;

    }


    // ---------------------------------------------
    // UPDATE FIREBASE
    // ---------------------------------------------

    update(
        registrationRef,
        updatedData
    )

        .then(() => {

            alert(
                "✅ Registration updated successfully!"
            );


            closeEditModal();

        })


        .catch((error) => {

            console.error(error);


            alert(
                "❌ Could not update registration.\n\n" +
                error.message
            );

        })


        .finally(() => {

            if (saveButton) {

                saveButton.disabled = false;

                saveButton.innerHTML = `
                    <i class="fa-solid fa-floppy-disk"></i>
                    Save Changes
                `;

            }

        });

};


// =====================================================
// DELETE REGISTRATION
// =====================================================

window.deleteRegistration = function (
    registrationID
) {


    const confirmation =
        confirm(

            "⚠️ DELETE REGISTRATION\n\n" +

            "Registration ID: " +
            registrationID +

            "\n\n" +

            "This registration will be permanently deleted." +

            "\n\n" +

            "Do you want to continue?"

        );


    if (!confirmation) {

        return;

    }


    const registrationRef =
        ref(
            database,
            "registrations/" + registrationID
        );


    remove(registrationRef)

        .then(() => {

            alert(
                "🗑️ Registration deleted successfully!"
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

    const modal =
        document.getElementById("editModal");


    if (modal) {

        modal.classList.remove("active");

    }

};


// =====================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById("editModal");


        if (
            modal &&
            event.target === modal
        ) {

            closeEditModal();

        }

    }
);


// =====================================================
// SEARCH
// =====================================================

window.searchRegistration = function () {

    const searchInput =
        document.getElementById("search");


    if (!searchInput) {

        return;

    }


    const value =
        searchInput.value
            .toLowerCase()
            .trim();


    const rows =
        document.querySelectorAll(
            "#tableBody tr"
        );


    rows.forEach(
        (row) => {

            const text =
                row.innerText
                    .toLowerCase();


            if (
                text.includes(value)
            ) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        }
    );

};


// =====================================================
// CSV DOWNLOAD
// =====================================================

window.downloadCSV = function () {

    const table =
        document.querySelector("table");


    if (!table) {

        return;

    }


    const rows =
        table.querySelectorAll("tr");


    const csv = [];


    rows.forEach(
        (row) => {

            const cols =
                row.querySelectorAll(
                    "th, td"
                );


            const data = [];


            cols.forEach(
                (col, index) => {

                    // Don't export Actions column
                    if (index !== 5) {

                        const value =
                            col.innerText
                                .replace(
                                    /"/g,
                                    '""'
                                );


                        data.push(
                            `"${value}"`
                        );

                    }

                }
            );


            csv.push(
                data.join(",")
            );

        }
    );


    const blob =
        new Blob(
            [
                csv.join("\n")
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const link =
        document.createElement("a");


    const url =
        URL.createObjectURL(blob);


    link.href = url;


    link.download =
        "APS_Robotics_Registrations.csv";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

};


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// ESCAPE JAVASCRIPT
// =====================================================

function escapeJS(value) {

    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            '\\"'
        )

        .replace(
            /\n/g,
            "\\n"
        )

        .replace(
            /\r/g,
            "\\r"
        );

                }
