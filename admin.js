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
// FIREBASE INITIALIZATION
// =====================================================

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


// =====================================================
// VARIABLES
// =====================================================

let deleteTargetID = null;

let registrations = {};

let unsubscribeRegistrations = null;


// =====================================================
// LOGIN
// =====================================================

window.login = function(){

    const username =
        document.getElementById("username")
            .value
            .trim();

    const password =
        document.getElementById("password")
            .value;

    const error =
        document.getElementById("error");


    if(
        username === "admin" &&
        password === "aps2026"
    ){

        localStorage.setItem(
            "adminLogin",
            "true"
        );

        showDashboard();

        error.textContent = "";

        loadData();

    }else{

        error.textContent =
            "❌ Invalid username or password.";

    }

};


// =====================================================
// SHOW DASHBOARD
// =====================================================

function showDashboard(){

    document.getElementById("loginScreen")
        .style.display = "none";

    document.getElementById("dashboard")
        .style.display = "block";

}


// =====================================================
// AUTO LOGIN
// =====================================================

if(
    localStorage.getItem("adminLogin")
    === "true"
){

    showDashboard();

    loadData();

}


// =====================================================
// PASSWORD VISIBILITY
// =====================================================

window.togglePassword = function(){

    const password =
        document.getElementById("password");

    const icon =
        document.getElementById("passwordIcon");


    if(password.type === "password"){

        password.type = "text";

        icon.className =
            "fa-solid fa-eye-slash";

    }else{

        password.type = "password";

        icon.className =
            "fa-solid fa-eye";

    }

};


// =====================================================
// LOGOUT
// =====================================================

window.logout = function(){

    localStorage.removeItem(
        "adminLogin"
    );

    if(unsubscribeRegistrations){

        unsubscribeRegistrations();

        unsubscribeRegistrations = null;

    }

    location.reload();

};


// =====================================================
// LOAD DATA
// =====================================================

function loadData(){

    const table =
        document.getElementById("tableBody");


    table.innerHTML = `
        <tr>
            <td colspan="9" class="loading-cell">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading registrations...
            </td>
        </tr>
    `;


    const registrationsRef =
        ref(database,"registrations");


    if(unsubscribeRegistrations){

        unsubscribeRegistrations();

    }


    unsubscribeRegistrations =
        onValue(
            registrationsRef,
            (snapshot)=>{

                registrations = {};

                let total = 0;
                let race = 0;
                let war = 0;
                let tug = 0;
                let soccer = 0;


                table.innerHTML = "";


                if(!snapshot.exists()){

                    table.innerHTML = `
                        <tr>
                            <td colspan="9"
                                class="loading-cell">
                                <i class="fa-solid fa-inbox"></i>
                                No registrations found.
                            </td>
                        </tr>
                    `;

                    updateStats(
                        0,
                        0,
                        0,
                        0,
                        0
                    );

                    updateVisibleCount(0);

                    return;

                }


                let index = 0;


                snapshot.forEach(
                    (child)=>{

                        const id =
                            child.key;

                        const data =
                            child.val() || {};


                        registrations[id] =
                            data;


                        total++;

                        index++;


                        const events =
                            String(
                                data.Events || ""
                            );


                        const normalized =
                            events.toLowerCase();


                        if(
                            normalized.includes(
                                "robo race"
                            )
                        ){
                            race++;
                        }


                        if(
                            normalized.includes(
                                "robo war"
                            )
                        ){
                            war++;
                        }


                        if(
                            normalized.includes(
                                "robo tug"
                            )
                        ){
                            tug++;
                        }


                        if(
                            normalized.includes(
                                "robo soccer"
                            )
                        ){
                            soccer++;
                        }


                        const row =
                            document.createElement(
                                "tr"
                            );


                        row.dataset.search =
                            (
                                id + " " +
                                (data.StudentName || "") + " " +
                                (data.TeamName || "") + " " +
                                (data.Class || "") + " " +
                                (data.Section || "") + " " +
                                (data.MobileNumber || "") + " " +
                                (data.Email || "") + " " +
                                events
                            ).toLowerCase();


                        row.innerHTML = `

                            <td>
                                ${index}
                            </td>

                            <td class="id-cell">
                                ${escapeHTML(id)}
                            </td>

                            <td class="student-cell">
                                ${escapeHTML(
                                    data.StudentName || "-"
                                )}
                            </td>

                            <td class="team-cell">
                                ${escapeHTML(
                                    data.TeamName || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    data.Class || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    data.Section || "-"
                                )}
                            </td>

                            <td class="event-cell">
                                ${formatEvents(events)}
                            </td>

                            <td class="mobile-cell">
                                ${escapeHTML(
                                    data.MobileNumber || "-"
                                )}
                            </td>

                            <td class="action-cell">

                                <button
                                    class="table-action edit-btn"
                                    onclick="editRegistration('${escapeJS(id)}')">

                                    <i class="fa-solid fa-pen"></i>
                                    Edit

                                </button>

                                <button
                                    class="table-action delete-btn"
                                    onclick="deleteRegistration('${escapeJS(id)}')">

                                    <i class="fa-solid fa-trash"></i>
                                    Delete

                                </button>

                            </td>
                        `;


                        table.appendChild(row);

                    }
                );


                updateStats(
                    total,
                    race,
                    war,
                    tug,
                    soccer
                );


                updateVisibleCount(total);

            },

            (error)=>{

                console.error(error);

                table.innerHTML = `
                    <tr>
                        <td colspan="9"
                            class="loading-cell">

                            ❌ Unable to load registrations.

                        </td>
                    </tr>
                `;

                showToast(
                    "Could not load Firebase data.",
                    true
                );

            }
        );

}


// =====================================================
// STATISTICS
// =====================================================

function updateStats(
    total,
    race,
    war,
    tug,
    soccer
){

    document.getElementById("total")
        .textContent = total;

    document.getElementById("race")
        .textContent = race;

    document.getElementById("war")
        .textContent = war;

    document.getElementById("tug")
        .textContent = tug;

    document.getElementById("soccer")
        .textContent = soccer;

}


// =====================================================
// FORMAT EVENTS
// =====================================================

function formatEvents(events){

    if(!events){
        return "-";
    }


    return escapeHTML(events)
        .replace(/Robo Race/gi,"🏁 Robo Race")
        .replace(/Robo War/gi,"⚔️ Robo War")
        .replace(/Robo Tug of War/gi,"🤝 Robo Tug of War")
        .replace(/Robo Soccer/gi,"⚽ Robo Soccer");

}


// =====================================================
// EDIT REGISTRATION
// =====================================================

window.editRegistration =
function(registrationID){

    const data =
        registrations[registrationID];


    if(!data){

        showToast(
            "Registration not found.",
            true
        );

        return;

    }


    document.getElementById("editID")
        .textContent =
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


    // Reset event checkboxes

    document
        .querySelectorAll(".edit-event")
        .forEach(
            checkbox => {

                checkbox.checked = false;

            }
        );


    const events =
        String(data.Events || "")
            .toLowerCase();


    document
        .querySelectorAll(".edit-event")
        .forEach(
            checkbox => {

                if(
                    events.includes(
                        checkbox.value.toLowerCase()
                    )
                ){

                    checkbox.checked = true;

                }

            }
        );


    document.getElementById("editModal")
        .classList.add("active");

};


// =====================================================
// SAVE EDIT
// =====================================================

window.saveEdit = async function(){

    const registrationID =
        document.getElementById("editID")
            .textContent
            .trim();


    if(!registrationID){

        showToast(
            "Registration ID is missing.",
            true
        );

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


    if(!studentName){

        showToast(
            "Student name is required.",
            true
        );

        return;

    }


    if(!teamName){

        showToast(
            "Team name is required.",
            true
        );

        return;

    }


    const selectedEvents = [];


    document
        .querySelectorAll(".edit-event:checked")
        .forEach(
            checkbox => {

                selectedEvents.push(
                    checkbox.value
                );

            }
        );


    if(selectedEvents.length === 0){

        showToast(
            "Select at least one event.",
            true
        );

        return;

    }


    const updatedData = {

        StudentName:
            studentName,

        TeamName:
            teamName,

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

        Email:
            document.getElementById(
                "editEmail"
            ).value.trim(),

        Events:
            selectedEvents.join(", ")

    };


    try{

        const registrationRef =
            ref(
                database,
                "registrations/" +
                registrationID
            );


        await update(
            registrationRef,
            updatedData
        );


        closeEditModal();


        showToast(
            "Registration updated successfully."
        );


    }catch(error){

        console.error(error);

        showToast(
            "Update failed: " +
            error.message,
            true
        );

    }

};


// =====================================================
// CLOSE EDIT MODAL
// =====================================================

window.closeEditModal =
function(){

    document.getElementById(
        "editModal"
    ).classList.remove("active");

};


// =====================================================
// DELETE REGISTRATION
// =====================================================

window.deleteRegistration =
function(registrationID){

    if(
        !registrations[registrationID]
    ){

        showToast(
            "Registration not found.",
            true
        );

        return;

    }


    deleteTargetID =
        registrationID;


    document.getElementById(
        "deleteID"
    ).textContent =
        registrationID;


    document.getElementById(
        "deleteModal"
    ).classList.add("active");

};


// =====================================================
// CONFIRM DELETE
// =====================================================

window.confirmDelete =
async function(){

    if(!deleteTargetID){

        return;

    }


    const id =
        deleteTargetID;


    try{

        const registrationRef =
            ref(
                database,
                "registrations/" + id
            );


        await remove(
            registrationRef
        );


        closeDeleteModal();


        deleteTargetID = null;


        showToast(
            "Registration deleted successfully."
        );


    }catch(error){

        console.error(error);

        showToast(
            "Delete failed: " +
            error.message,
            true
        );

    }

};


// =====================================================
// CLOSE DELETE MODAL
// =====================================================

window.closeDeleteModal =
function(){

    document.getElementById(
        "deleteModal"
    ).classList.remove("active");

    deleteTargetID = null;

};


// =====================================================
// SEARCH
// =====================================================

window.searchRegistration =
function(){

    const value =
        document.getElementById(
            "search"
        ).value
        .toLowerCase()
        .trim();


    const rows =
        document.querySelectorAll(
            "#tableBody tr"
        );


    let visible = 0;


    rows.forEach(
        row => {

            const searchText =
                row.dataset.search || "";


            if(
                !value ||
                searchText.includes(value)
            ){

                row.style.display = "";

                visible++;

            }else{

                row.style.display = "none";

            }

        }
    );


    updateVisibleCount(visible);

};


// =====================================================
// CLEAR SEARCH
// =====================================================

window.clearSearch =
function(){

    document.getElementById(
        "search"
    ).value = "";


    searchRegistration();

};


// =====================================================
// REFRESH
// =====================================================

window.refreshData =
function(){

    const button =
        document.querySelector(
            ".refresh-btn"
        );


    const icon =
        button.querySelector("i");


    icon.classList.add(
        "fa-spin"
    );


    setTimeout(
        ()=>{
            icon.classList.remove(
                "fa-spin"
            );
        },
        700
    );


    loadData();


    showToast(
        "Registration data refreshed."
    );

};


// =====================================================
// UPDATE VISIBLE COUNT
// =====================================================

function updateVisibleCount(count){

    document.getElementById(
        "visibleCount"
    ).textContent = count;

}


// =====================================================
// CSV EXPORT
// =====================================================

window.downloadCSV =
function(){

    const rows =
        document.querySelectorAll(
            "#tableBody tr"
        );


    const csv = [];


    csv.push([
        "Registration ID",
        "Student Name",
        "Team Name",
        "Class",
        "Section",
        "Events",
        "Mobile",
        "Email"
    ].map(csvEscape).join(","));


    rows.forEach(
        row => {

            if(
                row.style.display === "none"
            ){

                return;

            }


            const cells =
                row.querySelectorAll("td");


            if(cells.length < 9){

                return;

            }


            const id =
                cells[1].innerText.trim();

            const student =
                cells[2].innerText.trim();

            const team =
                cells[3].innerText.trim();

            const className =
                cells[4].innerText.trim();

            const section =
                cells[5].innerText.trim();

            const events =
                cells[6].innerText.trim();

            const mobile =
                cells[7].innerText.trim();


            const data =
                registrations[id] || {};


            const email =
                data.Email || "";


            csv.push([

                id,
                student,
                team,
                className,
                section,
                events,
                mobile,
                email

            ].map(csvEscape).join(","));

        }
    );


    const blob =
        new Blob(
            [csv.join("\n")],
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


    showToast(
        "CSV exported successfully."
    );

};


// =====================================================
// CSV ESCAPE
// =====================================================

function csvEscape(value){

    return `"${String(value)
        .replace(/"/g,'""')}"`;

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value){

    return String(value)

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}


// =====================================================
// JAVASCRIPT STRING ESCAPE
// =====================================================

function escapeJS(value){

    return String(value)

        .replace(/\\/g,"\\\\")

        .replace(/'/g,"\\'")

        .replace(/"/g,'\\"')

        .replace(/\n/g,"\\n")

        .replace(/\r/g,"\\r");

}


// =====================================================
// TOAST
// =====================================================

function showToast(
    message,
    isError = false
){

    const toast =
        document.getElementById(
            "toast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    const toastIcon =
        document.getElementById(
            "toastIcon"
        );


    toastMessage.textContent =
        message;


    toast.classList.toggle(
        "error",
        isError
    );


    toastIcon.className =
        isError
            ? "fa-solid fa-circle-exclamation"
            : "fa-solid fa-check";


    toast.classList.add("show");


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(
            ()=>{
                toast.classList.remove(
                    "show"
                );
            },
            3000
        );

}


// =====================================================
// CLOSE MODAL BY CLICKING OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    function(event){

        const editModal =
            document.getElementById(
                "editModal"
            );

        const deleteModal =
            document.getElementById(
                "deleteModal"
            );


        if(
            event.target === editModal
        ){

            closeEditModal();

        }


        if(
            event.target === deleteModal
        ){

            closeDeleteModal();

        }

    }
);


// =====================================================
// ESC KEY
// =====================================================

document.addEventListener(
    "keydown",
    function(event){

        if(event.key !== "Escape"){
            return;
        }


        closeEditModal();

        closeDeleteModal();

    }
);
