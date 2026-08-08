// =====================================================
// FIREBASE IMPORTS
// =====================================================

import {
    initializeApp
}
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";



// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",

    authDomain:
        "aps-robotics-championship.firebaseapp.com",

    projectId:
        "aps-robotics-championship",

    storageBucket:
        "aps-robotics-championship.firebasestorage.app",

    messagingSenderId:
        "1063542904891",

    appId:
        "1:1063542904891:web:82ff9bb3fba0b87384a41e"

};



const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);



// =====================================================
// LOGIN
// =====================================================

window.login = function(){

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value.trim();


    const error =
        document.getElementById("error");


    if(
        username === "apsadmin" &&
        password === "APS2026@Lab"
    ){

        document.getElementById("loginScreen")
            .style.display = "none";


        document.getElementById("dashboard")
            .style.display = "block";


        error.innerHTML = "";


        loadRegistrations();

    }

    else{

        error.innerHTML =
            "❌ Invalid username or password";

    }

};



// =====================================================
// LOGOUT
// =====================================================

window.logout = function(){

    document.getElementById("dashboard")
        .style.display = "none";


    document.getElementById("loginScreen")
        .style.display = "flex";


    document.getElementById("username").value = "";

    document.getElementById("password").value = "";


    document.getElementById("error").innerHTML = "";

};



// =====================================================
// LOAD REGISTRATIONS
// =====================================================

async function loadRegistrations(){

    const tableBody =
        document.getElementById("tableBody");


    tableBody.innerHTML = `

        <tr>

            <td colspan="22">

                <div class="loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading registrations...

                </div>

            </td>

        </tr>

    `;


    try{

        const snapshot =
            await getDocs(
                collection(db, "registrations")
            );


        let total = 0;

        let race = 0;
        let war = 0;
        let tug = 0;
        let soccer = 0;


        let rows = "";


        snapshot.forEach((firebaseDoc) => {

            const data =
                firebaseDoc.data();


            const firebaseId =
                firebaseDoc.id;


            total++;



            // =========================================
            // EVENTS
            // =========================================

            let events = [];


            if(Array.isArray(data.events)){

                events = data.events;

            }

            else if(typeof data.events === "string"){

                events =
                    data.events
                    .split(",")
                    .map(e => e.trim())
                    .filter(Boolean);

            }


            const eventText =
                events.length
                ? events.join(", ")
                : "-";


            const eventHTML =
                events.length
                ? events.join("<br>")
                : "-";



            // =========================================
            // EVENT COUNTERS
            // =========================================

            events.forEach(event => {

                const e =
                    event.toLowerCase();


                if(e.includes("robo race"))
                    race++;


                if(e.includes("robo war"))
                    war++;


                if(e.includes("tug of war"))
                    tug++;


                if(e.includes("robo soccer"))
                    soccer++;

            });



            // =========================================
            // TEAM DETAILS
            // =========================================

            const teamName =
                data.teamName || "-";


            const teamSize =
                data.teamSize ||
                data.selectTeamSize ||
                "-";



            // =========================================
            // TEAM LEADER
            // =========================================

            const leaderName =
                data.teamLeaderName ||
                data.studentName ||
                "-";


            const leaderClass =
                data.teamLeaderClass ||
                data.class ||
                data.studentClass ||
                "-";


            const leaderSection =
                data.teamLeaderSection ||
                data.section ||
                "-";



            // =========================================
            // MEMBER 2
            // =========================================

            const member2Name =
                data.member2Name || "-";


            const member2Class =
                data.member2Class || "-";


            const member2Section =
                data.member2Section || "-";



            // =========================================
            // MEMBER 3
            // =========================================

            const member3Name =
                data.member3Name || "-";


            const member3Class =
                data.member3Class || "-";


            const member3Section =
                data.member3Section || "-";



            // =========================================
            // MEMBER 4
            // =========================================

            const member4Name =
                data.member4Name || "-";


            const member4Class =
                data.member4Class || "-";


            const member4Section =
                data.member4Section || "-";



            // =========================================
            // MEMBER 5
            // =========================================

            const member5Name =
                data.member5Name || "-";


            const member5Class =
                data.member5Class || "-";


            const member5Section =
                data.member5Section || "-";



            // =========================================
            // CONTACT
            // =========================================

            const mobile =
                data.mobile ||
                data.mobileNumber ||
                "-";


            const email =
                data.email ||
                "-";



            // =========================================
            // ESCAPE HTML
            // =========================================

            const safe = (value) => {

                return String(value)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");

            };



            // =========================================
            // CREATE ROW
            // =========================================

            rows += `

                <tr
                    data-search="
                        ${safe(
                            data.registrationId || ""
                        )}
                        ${safe(leaderName)}
                        ${safe(teamName)}
                        ${safe(member2Name)}
                        ${safe(member3Name)}
                        ${safe(member4Name)}
                        ${safe(member5Name)}
                        ${safe(mobile)}
                        ${safe(email)}
                    "
                >


                    <td class="registration-id">

                        ${safe(
                            data.registrationId ||
                            firebaseId
                        )}

                    </td>



                    <td class="team-name">

                        ${safe(teamName)}

                    </td>



                    <td>

                        <span class="team-size">

                            ${safe(teamSize)}

                        </span>

                    </td>



                    <!-- LEADER -->

                    <td class="member-name leader">

                        <i class="fa-solid fa-crown"></i>

                        ${safe(leaderName)}

                    </td>


                    <td>

                        ${safe(leaderClass)}

                    </td>


                    <td>

                        ${safe(leaderSection)}

                    </td>



                    <!-- MEMBER 2 -->

                    <td class="member-name">

                        ${safe(member2Name)}

                    </td>


                    <td>

                        ${safe(member2Class)}

                    </td>


                    <td>

                        ${safe(member2Section)}

                    </td>



                    <!-- MEMBER 3 -->

                    <td class="member-name">

                        ${safe(member3Name)}

                    </td>


                    <td>

                        ${safe(member3Class)}

                    </td>


                    <td>

                        ${safe(member3Section)}

                    </td>



                    <!-- MEMBER 4 -->

                    <td class="member-name">

                        ${safe(member4Name)}

                    </td>


                    <td>

                        ${safe(member4Class)}

                    </td>


                    <td>

                        ${safe(member4Section)}

                    </td>



                    <!-- MEMBER 5 -->

                    <td class="member-name">

                        ${safe(member5Name)}

                    </td>


                    <td>

                        ${safe(member5Class)}

                    </td>


                    <td>

                        ${safe(member5Section)}

                    </td>



                    <!-- EVENTS -->

                    <td class="events-cell">

                        ${eventHTML}

                    </td>



                    <!-- MOBILE -->

                    <td>

                        ${safe(mobile)}

                    </td>



                    <!-- EMAIL -->

                    <td class="email-cell">

                        ${safe(email)}

                    </td>



                    <!-- ACTION -->

                    <td class="action-buttons">

                        <button
                            class="edit-btn"
                            onclick="openEditModal('${firebaseId}')"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteRegistration('${firebaseId}')"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>


                </tr>

            `;

        });



        // =========================================
        // COUNTERS
        // =========================================

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



        // =========================================
        // TABLE
        // =========================================

        if(rows){

            tableBody.innerHTML = rows;

        }

        else{

            tableBody.innerHTML = `

                <tr>

                    <td colspan="22">

                        <div class="empty-state">

                            <i class="fa-solid fa-folder-open"></i>

                            <p>No registrations found</p>

                        </div>

                    </td>

                </tr>

            `;

        }

    }


    catch(error){

        console.error(error);


        tableBody.innerHTML = `

            <tr>

                <td colspan="22">

                    <div class="error-state">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                        <p>
                            Failed to load registrations
                        </p>

                        <small>
                            ${error.message}
                        </small>

                    </div>

                </td>

            </tr>

        `;

    }

}



// =====================================================
// SEARCH
// =====================================================

window.searchRegistration = function(){

    const value =
        document
        .getElementById("search")
        .value
        .toLowerCase()
        .trim();


    const rows =
        document.querySelectorAll(
            "#tableBody tr"
        );


    rows.forEach(row => {

        const text =
            (
                row.getAttribute("data-search") ||
                row.innerText
            ).toLowerCase();


        if(text.includes(value)){

            row.style.display = "";

        }

        else{

            row.style.display = "none";

        }

    });

};



// =====================================================
// EDIT MODAL
// =====================================================

let currentEditId = null;


window.openEditModal = async function(firebaseId){

    try{

        const snapshot =
            await getDocs(
                collection(db, "registrations")
            );


        let selectedData = null;


        snapshot.forEach(firebaseDoc => {

            if(firebaseDoc.id === firebaseId){

                selectedData =
                    firebaseDoc.data();

            }

        });


        if(!selectedData){

            alert("Registration not found.");

            return;

        }


        currentEditId =
            firebaseId;



        document.getElementById("editID").textContent =
            selectedData.registrationId ||
            firebaseId;



        document.getElementById("editTeamLeaderName").value =
            selectedData.teamLeaderName ||
            selectedData.studentName ||
            "";


        document.getElementById("editTeamLeaderClass").value =
            selectedData.teamLeaderClass ||
            selectedData.class ||
            "";


        document.getElementById("editTeamLeaderSection").value =
            selectedData.teamLeaderSection ||
            selectedData.section ||
            "";



        document.getElementById("editTeamName").value =
            selectedData.teamName ||
            "";


        document.getElementById("editTeamSize").value =
            selectedData.teamSize ||
            "";



        document.getElementById("editMember2Name").value =
            selectedData.member2Name ||
            "";


        document.getElementById("editMember2Class").value =
            selectedData.member2Class ||
            "";


        document.getElementById("editMember2Section").value =
            selectedData.member2Section ||
            "";



        document.getElementById("editMember3Name").value =
            selectedData.member3Name ||
            "";


        document.getElementById("editMember3Class").value =
            selectedData.member3Class ||
            "";


        document.getElementById("editMember3Section").value =
            selectedData.member3Section ||
            "";



        document.getElementById("editMember4Name").value =
            selectedData.member4Name ||
            "";


        document.getElementById("editMember4Class").value =
            selectedData.member4Class ||
            "";


        document.getElementById("editMember4Section").value =
            selectedData.member4Section ||
            "";



        document.getElementById("editMember5Name").value =
            selectedData.member5Name ||
            "";


        document.getElementById("editMember5Class").value =
            selectedData.member5Class ||
            "";


        document.getElementById("editMember5Section").value =
            selectedData.member5Section ||
            "";



        document.getElementById("editMobile").value =
            selectedData.mobile ||
            selectedData.mobileNumber ||
            "";


        document.getElementById("editEmail").value =
            selectedData.email ||
            "";



        const events =
            Array.isArray(selectedData.events)
            ? selectedData.events
            : [selectedData.events || ""];


        document.getElementById("editEvents").value =
            events.filter(Boolean).join(", ");



        document.getElementById("editModal")
            .classList.add("active");

    }

    catch(error){

        console.error(error);

        alert("Unable to open registration.");

    }

};



// =====================================================
// CLOSE MODAL
// =====================================================

window.closeEditModal = function(){

    document.getElementById("editModal")
        .classList.remove("active");


    currentEditId = null;

};



// =====================================================
// SAVE EDIT
// =====================================================

window.saveEdit = async function(){

    if(!currentEditId){

        return;

    }


    try{

        const registrationRef =
            doc(
                db,
                "registrations",
                currentEditId
            );


        const events =
            document
            .getElementById("editEvents")
            .value
            .split(",")
            .map(event => event.trim())
            .filter(Boolean);



        await updateDoc(
            registrationRef,
            {

                teamLeaderName:
                    document
                    .getElementById(
                        "editTeamLeaderName"
                    ).value.trim(),


                teamLeaderClass:
                    document
                    .getElementById(
                        "editTeamLeaderClass"
                    ).value.trim(),


                teamLeaderSection:
                    document
                    .getElementById(
                        "editTeamLeaderSection"
                    ).value.trim(),


                teamName:
                    document
                    .getElementById(
                        "editTeamName"
                    ).value.trim(),


                teamSize:
                    document
                    .getElementById(
                        "editTeamSize"
                    ).value.trim(),



                member2Name:
                    document
                    .getElementById(
                        "editMember2Name"
                    ).value.trim(),


                member2Class:
                    document
                    .getElementById(
                        "editMember2Class"
                    ).value.trim(),


                member2Section:
                    document
                    .getElementById(
                        "editMember2Section"
                    ).value.trim(),



                member3Name:
                    document
                    .getElementById(
                        "editMember3Name"
                    ).value.trim(),


                member3Class:
                    document
                    .getElementById(
                        "editMember3Class"
                    ).value.trim(),


                member3Section:
                    document
                    .getElementById(
                        "editMember3Section"
                    ).value.trim(),



                member4Name:
                    document
                    .getElementById(
                        "editMember4Name"
                    ).value.trim(),


                member4Class:
                    document
                    .getElementById(
                        "editMember4Class"
                    ).value.trim(),


                member4Section:
                    document
                    .getElementById(
                        "editMember4Section"
                    ).value.trim(),



                member5Name:
                    document
                    .getElementById(
                        "editMember5Name"
                    ).value.trim(),


                member5Class:
                    document
                    .getElementById(
                        "editMember5Class"
                    ).value.trim(),


                member5Section:
                    document
                    .getElementById(
                        "editMember5Section"
                    ).value.trim(),



                mobile:
                    document
                    .getElementById(
                        "editMobile"
                    ).value.trim(),


                email:
                    document
                    .getElementById(
                        "editEmail"
                    ).value.trim(),


                events:
                    events

            }

        );


        alert(
            "✅ Registration updated successfully!"
        );


        closeEditModal();


        loadRegistrations();

    }

    catch(error){

        console.error(error);

        alert(
            "❌ Failed to update registration."
        );

    }

};



// =====================================================
// DELETE REGISTRATION
// =====================================================

window.deleteRegistration = async function(firebaseId){

    const confirmDelete =
        confirm(
            "Are you sure you want to permanently delete this registration?"
        );


    if(!confirmDelete){

        return;

    }


    try{

        await deleteDoc(
            doc(
                db,
                "registrations",
                firebaseId
            )
        );


        alert(
            "✅ Registration deleted successfully."
        );


        loadRegistrations();

    }

    catch(error){

        console.error(error);

        alert(
            "❌ Unable to delete registration."
        );

    }

};



// =====================================================
// DOWNLOAD CSV
// =====================================================

window.downloadCSV = function(){

    const table =
        document.getElementById(
            "registrationTable"
        );


    const rows =
        table.querySelectorAll("tr");


    let csv = [];


    rows.forEach(row => {

        const cols =
            row.querySelectorAll(
                "th, td"
            );


        let rowData = [];


        cols.forEach(col => {

            let text =
                col.innerText
                .replace(/\n/g, " ")
                .replace(/"/g, '""')
                .trim();


            rowData.push(
                `"${text}"`
            );

        });


        csv.push(
            rowData.join(",")
        );

    });


    const blob =
        new Blob(
            [csv.join("\n")],
            {
                type:"text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        "APS_Robotics_Championship_2026_Registrations.csv";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

};



// =====================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    function(event){

        const modal =
            document.getElementById(
                "editModal"
            );


        if(
            event.target === modal
        ){

            closeEditModal();

        }

    }
);
