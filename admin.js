/* =====================================================
   FIREBASE IMPORTS
===================================================== */

import {
    initializeApp
}
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getDatabase,
    ref,
    onValue,
    update,
    remove
}
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";



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
   VARIABLES
===================================================== */

let registrations = {};

let dataLoaded = false;



/* =====================================================
   LOGIN
===================================================== */

window.login = function(){

    const username =
        document
        .getElementById("username")
        .value
        .trim();


    const password =
        document
        .getElementById("password")
        .value;


    const error =
        document
        .getElementById("error");


    if(
        username === "admin" &&
        password === "aps2026"
    ){

        localStorage.setItem(
            "adminLogin",
            "true"
        );


        document
            .getElementById("loginScreen")
            .style.display = "none";


        document
            .getElementById("dashboard")
            .style.display = "block";


        error.textContent = "";


        loadData();


    }else{

        error.textContent =
            "❌ Invalid Username or Password";

    }

};



/* =====================================================
   AUTO LOGIN
===================================================== */

if(
    localStorage.getItem("adminLogin")
    === "true"
){

    document
        .getElementById("loginScreen")
        .style.display = "none";


    document
        .getElementById("dashboard")
        .style.display = "block";


    loadData();

}



/* =====================================================
   LOGOUT
===================================================== */

window.logout = function(){

    localStorage.removeItem(
        "adminLogin"
    );


    location.reload();

};



/* =====================================================
   LOAD REGISTRATIONS
===================================================== */

function loadData(){

    if(dataLoaded){
        return;
    }


    dataLoaded = true;


    const databaseRef =
        ref(
            database,
            "registrations"
        );


    onValue(
        databaseRef,
        function(snapshot){

            registrations = {};


            const table =
                document
                .getElementById("tableBody");


            table.innerHTML = "";


            let total = 0;

            let race = 0;

            let war = 0;

            let tug = 0;

            let soccer = 0;



            /* =================================================
               NO DATA
            ================================================= */

            if(!snapshot.exists()){

                table.innerHTML = `

                    <tr>

                        <td colspan="6">

                            <div class="loading">

                                <i class="fa-solid fa-database"></i>

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



            /* =================================================
               LOOP DATA
            ================================================= */

            snapshot.forEach(
                function(child){

                    const id =
                        child.key;


                    const data =
                        child.val() || {};


                    registrations[id] =
                        data;


                    total++;


                    const events =
                        String(
                            data.Events || ""
                        );


                    const eventText =
                        events.toLowerCase();



                    /* EVENT COUNTS */

                    if(
                        eventText.includes(
                            "robo race"
                        )
                    ){

                        race++;

                    }


                    if(
                        eventText.includes(
                            "robo war"
                        )
                    ){

                        war++;

                    }


                    if(
                        eventText.includes(
                            "robo tug"
                        )
                    ){

                        tug++;

                    }


                    if(
                        eventText.includes(
                            "robo soccer"
                        )
                    ){

                        soccer++;

                    }



                    /* =================================================
                       CREATE ROW
                    ================================================= */

                    const row =
                        document
                        .createElement("tr");


                    row.dataset.id =
                        id;


                    row.innerHTML = `

                        <td>

                            <strong>
                                ${escapeHTML(id)}
                            </strong>

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


                        <td>

                            <div class="action-buttons">


                                <button
                                    class="edit-btn"
                                    onclick="editRegistration('${escapeJS(id)}')"
                                >

                                    <i class="fa-solid fa-pen"></i>

                                    Edit

                                </button>


                                <button
                                    class="delete-btn"
                                    onclick="deleteRegistration('${escapeJS(id)}')"
                                >

                                    <i class="fa-solid fa-trash"></i>

                                    Delete

                                </button>


                            </div>

                        </td>

                    `;


                    table.appendChild(row);

                }
            );



            /* =================================================
               UPDATE STATISTICS
            ================================================= */

            updateStatistics(
                total,
                race,
                war,
                tug,
                soccer
            );


            /* =================================================
               REAPPLY SEARCH
            ================================================= */

            searchRegistration();

        }
    );

}



/* =====================================================
   UPDATE STATISTICS
===================================================== */

function updateStatistics(
    total,
    race,
    war,
    tug,
    soccer
){

    document
        .getElementById("total")
        .textContent = total;


    document
        .getElementById("race")
        .textContent = race;


    document
        .getElementById("war")
        .textContent = war;


    document
        .getElementById("tug")
        .textContent = tug;


    document
        .getElementById("soccer")
        .textContent = soccer;

}



/* =====================================================
   EDIT REGISTRATION
===================================================== */

window.editRegistration =
function(registrationID){

    const data =
        registrations[registrationID];


    if(!data){

        alert(
            "❌ Registration not found."
        );

        return;

    }



    /* REGISTRATION ID */

    document
        .getElementById("editID")
        .textContent =
        registrationID;



    /* STUDENT */

    document
        .getElementById("editStudentName")
        .value =
        data.StudentName || "";



    /* TEAM */

    document
        .getElementById("editTeamName")
        .value =
        data.TeamName || "";



    /* CLASS */

    document
        .getElementById("editClass")
        .value =
        data.Class || "";



    /* SECTION */

    document
        .getElementById("editSection")
        .value =
        data.Section || "";



    /* MOBILE */

    document
        .getElementById("editMobile")
        .value =
        data.MobileNumber || "";



    /* EMAIL */

    document
        .getElementById("editEmail")
        .value =
        data.Email || "";



    /* EVENTS */

    document
        .getElementById("editEvents")
        .value =
        data.Events || "";



    /* OPEN MODAL */

    document
        .getElementById("editModal")
        .classList
        .add("active");

};



/* =====================================================
   SAVE EDIT
===================================================== */

window.saveEdit = function(){

    const registrationID =
        document
        .getElementById("editID")
        .textContent
        .trim();


    if(!registrationID){

        alert(
            "❌ Registration ID is missing."
        );

        return;

    }



    const updatedData = {

        StudentName:
            document
            .getElementById(
                "editStudentName"
            )
            .value
            .trim(),


        TeamName:
            document
            .getElementById(
                "editTeamName"
            )
            .value
            .trim(),


        Class:
            document
            .getElementById(
                "editClass"
            )
            .value
            .trim(),


        Section:
            document
            .getElementById(
                "editSection"
            )
            .value
            .trim(),


        MobileNumber:
            document
            .getElementById(
                "editMobile"
            )
            .value
            .trim(),


        Email:
            document
            .getElementById(
                "editEmail"
            )
            .value
            .trim(),


        Events:
            document
            .getElementById(
                "editEvents"
            )
            .value
            .trim()

    };



    const registrationRef =
        ref(
            database,
            "registrations/" +
            registrationID
        );



    /* DISABLE SAVE BUTTON */

    const saveButton =
        document.querySelector(
            ".save-button"
        );


    const originalText =
        saveButton.innerHTML;


    saveButton.disabled = true;


    saveButton.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Saving...

    `;



    /* UPDATE FIREBASE */

    update(
        registrationRef,
        updatedData
    )

    .then(function(){

        alert(
            "✅ Registration updated successfully."
        );


        closeEditModal();

    })


    .catch(function(error){

        console.error(error);


        alert(
            "❌ Could not update registration.\n\n" +
            error.message
        );

    })


    .finally(function(){

        saveButton.disabled = false;

        saveButton.innerHTML =
            originalText;

    });

};



/* =====================================================
   DELETE REGISTRATION
===================================================== */

window.deleteRegistration =
function(registrationID){

    const data =
        registrations[registrationID];


    const studentName =
        data &&
        data.StudentName
            ? data.StudentName
            : "this student";


    const confirmation =
        confirm(

            "⚠️ DELETE REGISTRATION?\n\n" +

            "Registration ID: " +
            registrationID +

            "\nStudent: " +
            studentName +

            "\n\nThis action cannot be undone."

        );


    if(!confirmation){

        return;

    }



    const registrationRef =
        ref(
            database,
            "registrations/" +
            registrationID
        );



    remove(registrationRef)

    .then(function(){

        alert(
            "🗑️ Registration deleted successfully."
        );

    })


    .catch(function(error){

        console.error(error);


        alert(

            "❌ Could not delete registration.\n\n" +

            error.message

        );

    });

};



/* =====================================================
   CLOSE EDIT MODAL
===================================================== */

window.closeEditModal =
function(){

    document
        .getElementById("editModal")
        .classList
        .remove("active");

};



/* =====================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
===================================================== */

document
    .getElementById("editModal")
    .addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                this
            ){

                closeEditModal();

            }

        }
    );



/* =====================================================
   ESC KEY CLOSE MODAL
===================================================== */

document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key === "Escape"
        ){

            closeEditModal();

        }

    }
);



/* =====================================================
   SEARCH
===================================================== */

window.searchRegistration =
function(){

    const value =
        document
        .getElementById("search")
        .value
        .toLowerCase()
        .trim();


    const rows =
        document
        .querySelectorAll(
            "#tableBody tr"
        );


    let visibleRows = 0;


    rows.forEach(
        function(row){

            const text =
                row.innerText
                    .toLowerCase();


            if(
                text.includes(value)
            ){

                row.style.display = "";

                visibleRows++;

            }else{

                row.style.display = "none";

            }

        }
    );


    /* NO SEARCH RESULT */

    const existing =
        document.getElementById(
            "noSearchResult"
        );


    if(existing){

        existing.remove();

    }


    if(
        value &&
        visibleRows === 0
    ){

        const table =
            document.getElementById(
                "tableBody"
            );


        const row =
            document.createElement("tr");


        row.id =
            "noSearchResult";


        row.innerHTML = `

            <td colspan="6">

                <div class="loading">

                    <i class="fa-solid fa-magnifying-glass"></i>

                    No registration found for
                    "<strong>${escapeHTML(value)}</strong>"

                </div>

            </td>

        `;


        table.appendChild(row);

    }

};



/* =====================================================
   CSV DOWNLOAD
===================================================== */

window.downloadCSV =
function(){

    const rows =
        document.querySelectorAll(
            "#tableBody tr"
        );


    const csv = [];


    /* HEADER */

    csv.push(

        [

            "Registration ID",
            "Student Name",
            "Team Name",
            "Events",
            "Mobile Number"

        ]

        .map(csvEscape)

        .join(",")

    );



    /* DATA */

    rows.forEach(
        function(row){

            if(
                row.style.display ===
                "none"
            ){

                return;

            }


            const cells =
                row.querySelectorAll(
                    "td"
                );


            if(
                cells.length < 5
            ){

                return;

            }


            const values = [

                cells[0].innerText,
                cells[1].innerText,
                cells[2].innerText,
                cells[3].innerText,
                cells[4].innerText

            ];


            csv.push(

                values
                    .map(csvEscape)
                    .join(",")

            );

        }
    );



    /* CREATE FILE */

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


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        "APS_Robotics_Registrations.csv";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

};



/* =====================================================
   CSV ESCAPE
===================================================== */

function csvEscape(value){

    return '"' +

        String(value)
            .replace(/"/g, '""')

        + '"';

}



/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value){

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



/* =====================================================
   JAVASCRIPT ESCAPE
===================================================== */

function escapeJS(value){

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
