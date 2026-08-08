/* =====================================================
   FIREBASE IMPORTS
===================================================== */

import {
    initializeApp
}
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


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
   SAME CONFIG AS YOUR INDEX.HTML
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


const auth =
    getAuth(app);


const database =
    getDatabase(app);


/* =====================================================
   DOM
===================================================== */

const loginScreen =
    document.getElementById("loginScreen");


const adminApp =
    document.getElementById("adminApp");


const loginForm =
    document.getElementById("loginForm");


const loginButton =
    document.getElementById("loginButton");


const loginError =
    document.getElementById("loginError");


const adminEmailDisplay =
    document.getElementById(
        "adminEmailDisplay"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const togglePassword =
    document.getElementById(
        "togglePassword"
    );


const adminPassword =
    document.getElementById(
        "adminPassword"
    );


/* =====================================================
   DATA
===================================================== */

let registrations = {};

let registrationArray = [];

let currentEditKey = null;


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener(
    "submit",
    async function(event){

        event.preventDefault();


        const email =
            document.getElementById(
                "adminEmail"
            ).value.trim();


        const password =
            adminPassword.value;


        loginError.textContent =
            "";


        loginButton.disabled =
            true;


        loginButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Signing In...

        `;


        try{

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        }

        catch(error){

            console.error(error);


            loginError.textContent =
                getAuthError(error.code);

        }


        finally{

            loginButton.disabled =
                false;


            loginButton.innerHTML = `

                <i class="fa-solid fa-right-to-bracket"></i>

                Sign In

            `;

        }

    }
);


/* =====================================================
   AUTH ERROR
===================================================== */

function getAuthError(code){

    switch(code){

        case "auth/invalid-credential":

            return "Invalid email or password.";

        case "auth/invalid-email":

            return "Please enter a valid email address.";

        case "auth/user-disabled":

            return "This administrator account is disabled.";

        case "auth/too-many-requests":

            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":

            return "Network error. Check your internet connection.";

        default:

            return "Unable to sign in. Please check your credentials.";

    }

}


/* =====================================================
   PASSWORD VISIBILITY
===================================================== */

togglePassword.addEventListener(
    "click",
    function(){

        if(
            adminPassword.type ===
            "password"
        ){

            adminPassword.type =
                "text";


            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye-slash"></i>';

        }
        else{

            adminPassword.type =
                "password";


            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye"></i>';

        }

    }
);


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
    auth,
    function(user){

        if(user){

            loginScreen.classList.add(
                "hidden"
            );


            adminApp.classList.remove(
                "hidden"
            );


            adminEmailDisplay.textContent =
                user.email ||
                "Administrator";


            loadRegistrations();

        }
        else{

            loginScreen.classList.remove(
                "hidden"
            );


            adminApp.classList.add(
                "hidden"
            );

        }

    }
);


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
    "click",
    async function(){

        const confirmed =
            confirm(
                "Are you sure you want to logout?"
            );


        if(!confirmed){

            return;

        }


        try{

            await signOut(auth);

            showToast(
                "Logged out successfully.",
                "check"
            );

        }

        catch(error){

            console.error(error);

        }

    }
);


/* =====================================================
   LOAD REGISTRATIONS
===================================================== */

function loadRegistrations(){

    const registrationsRef =
        ref(
            database,
            "registrations"
        );


    onValue(
        registrationsRef,
        function(snapshot){

            if(
                snapshot.exists()
            ){

                registrations =
                    snapshot.val();

            }
            else{

                registrations =
                    {};

            }


            registrationArray =
                Object.entries(
                    registrations
                )
                .map(
                    ([key,value]) => {

                        return {

                            key:key,

                            ...value

                        };

                    }
                );


            registrationArray.sort(
                function(a,b){

                    const dateA =
                        new Date(
                            a.registrationDate ||
                            0
                        );


                    const dateB =
                        new Date(
                            b.registrationDate ||
                            0
                        );


                    return dateB - dateA;

                }
            );


            updateDashboard();

            renderRegistrations();

            renderRecentRegistrations();

        },
        function(error){

            console.error(
                "Database error:",
                error
            );


            showToast(
                "Unable to load registrations.",
                "error"
            );

        }
    );

}


/* =====================================================
   NORMALIZE EVENTS
===================================================== */

function getEvents(item){

    if(!item || !item.Events){

        return [];

    }


    if(
        Array.isArray(
            item.Events
        )
    ){

        return item.Events;

    }


    return [
        item.Events
    ];

}


/* =====================================================
   GET TEAM MEMBERS
===================================================== */

function getTeamMembers(item){

    const members = [];


    if(
        item.StudentName &&
        String(item.StudentName).trim()
    ){

        members.push({

            number:1,

            name:item.StudentName,

            className:item.Class || "",

            section:item.Section || ""

        });

    }


    for(
        let i = 2;
        i <= 5;
        i++
    ){

        const name =
            item[`Member${i}Name`];


        if(
            name &&
            String(name).trim()
        ){

            members.push({

                number:i,

                name:name,

                className:
                    item[`Member${i}Class`] ||
                    "",

                section:
                    item[`Member${i}Section`] ||
                    ""

            });

        }

    }


    return members;

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard(){

    const total =
        registrationArray.length;


    document.getElementById(
        "totalRegistrations"
    ).textContent =
        total;


    let totalMembers = 0;

    let race = 0;

    let war = 0;

    let tug = 0;

    let soccer = 0;


    registrationArray.forEach(
        function(item){

            const members =
                getTeamMembers(item);


            totalMembers +=
                members.length;


            const events =
                getEvents(item);


            if(
                events.includes(
                    "Robo Race"
                )
            ){

                race++;

            }


            if(
                events.includes(
                    "Robo War"
                )
            ){

                war++;

            }


            if(
                events.includes(
                    "Robo Tug of War"
                )
            ){

                tug++;

            }


            if(
                events.includes(
                    "Robo Soccer"
                )
            ){

                soccer++;

            }

        }
    );


    document.getElementById(
        "totalMembers"
    ).textContent =
        totalMembers;


    document.getElementById(
        "raceCount"
    ).textContent =
        race;


    document.getElementById(
        "warCount"
    ).textContent =
        war;


    document.getElementById(
        "tugCount"
    ).textContent =
        tug;


    document.getElementById(
        "soccerCount"
    ).textContent =
        soccer;


    document.getElementById(
        "eventRaceTotal"
    ).textContent =
        race;


    document.getElementById(
        "eventWarTotal"
    ).textContent =
        war;


    document.getElementById(
        "eventTugTotal"
    ).textContent =
        tug;


    document.getElementById(
        "eventSoccerTotal"
    ).textContent =
        soccer;

}


/* =====================================================
   RECENT REGISTRATIONS
===================================================== */

function renderRecentRegistrations(){

    const container =
        document.getElementById(
            "recentRegistrations"
        );


    const recent =
        registrationArray.slice(
            0,
            5
        );


    if(
        recent.length === 0
    ){

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-inbox"></i>

                <p>
                    No registrations yet.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        recent.map(
            function(item){

                const id =
                    item.registrationId ||
                    item.key;


                const members =
                    getTeamMembers(item);


                const date =
                    formatDate(
                        item.registrationDate
                    );


                return `

                    <div class="recent-item">

                        <div class="recent-avatar">

                            <i class="fa-solid fa-user"></i>

                        </div>


                        <div>

                            <div class="recent-name">

                                ${escapeHTML(
                                    item.StudentName ||
                                    "Unknown"
                                )}

                            </div>

                            <div class="recent-meta">

                                ${escapeHTML(
                                    item.TeamName ||
                                    "No Team Name"
                                )}

                                •

                                ${members.length}
                                member${members.length === 1 ? "" : "s"}

                                •
                                ${date}

                            </div>

                        </div>


                        <div class="recent-id">

                            ${escapeHTML(id)}

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* =====================================================
   RENDER REGISTRATION TABLE
===================================================== */

function renderRegistrations(){

    const tbody =
        document.getElementById(
            "registrationTableBody"
        );


    const empty =
        document.getElementById(
            "tableEmpty"
        );


    const count =
        document.getElementById(
            "registrationResultCount"
        );


    const search =
        document.getElementById(
            "searchInput"
        )
        .value
        .toLowerCase()
        .trim();


    const event =
        document.getElementById(
            "eventFilter"
        )
        .value;


    const teamSize =
        document.getElementById(
            "teamSizeFilter"
        )
        .value;


    const filtered =
        registrationArray.filter(
            function(item){

                const events =
                    getEvents(item);


                const members =
                    getTeamMembers(item);


                const searchable = [

                    item.registrationId,

                    item.StudentName,

                    item.TeamName,

                    item.EmailAddress,

                    item.MobileNumber,

                    item.Class,

                    item.Section,

                    ...events

                ]
                .join(" ")
                .toLowerCase();


                const searchMatch =
                    !search ||
                    searchable.includes(
                        search
                    );


                const eventMatch =
                    event === "all" ||
                    events.includes(event);


                const sizeMatch =
                    teamSize === "all" ||
                    members.length ===
                    Number(teamSize);


                return (
                    searchMatch &&
                    eventMatch &&
                    sizeMatch
                );

            }
        );


    count.textContent =
        filtered.length;


    if(
        filtered.length === 0
    ){

        tbody.innerHTML =
            "";


        empty.classList.remove(
            "hidden"
        );


        return;

    }


    empty.classList.add(
        "hidden"
    );


    tbody.innerHTML =
        filtered.map(
            function(item,index){

                const events =
                    getEvents(item);


                const members =
                    getTeamMembers(item);


                const id =
                    item.registrationId ||
                    item.key;


                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>


                        <td>

                            <span class="reg-id">

                                ${escapeHTML(id)}

                            </span>

                        </td>


                        <td>

                            <span class="leader-name">

                                ${escapeHTML(
                                    item.StudentName ||
                                    "-"
                                )}

                            </span>

                        </td>


                        <td>

                            <span class="team-name">

                                ${escapeHTML(
                                    item.TeamName ||
                                    "—"
                                )}

                            </span>

                        </td>


                        <td>

                            ${escapeHTML(
                                item.Class ||
                                "-"
                            )}

                            -

                            ${escapeHTML(
                                item.Section ||
                                "-"
                            )}

                        </td>


                        <td>

                            <div class="event-tags">

                                ${
                                    events.length
                                    ?
                                    events.map(
                                        event =>
                                            `<span class="event-tag">
                                                ${escapeHTML(event)}
                                            </span>`
                                    ).join("")
                                    :
                                    "<span>—</span>"
                                }

                            </div>

                        </td>


                        <td>

                            <span class="member-count">

                                <i class="fa-solid fa-users"></i>

                                ${members.length}

                            </span>

                        </td>


                        <td>

                            <span class="date-text">

                                ${formatDate(
                                    item.registrationDate
                                )}

                            </span>

                        </td>


                        <td>

                            <div class="action-buttons">


                                <button
                                    class="table-action view-action"
                                    title="View"
                                    data-action="view"
                                    data-key="${escapeAttribute(item.key)}"
                                >

                                    <i class="fa-solid fa-eye"></i>

                                </button>


                                <button
                                    class="table-action edit-action"
                                    title="Edit"
                                    data-action="edit"
                                    data-key="${escapeAttribute(item.key)}"
                                >

                                    <i class="fa-solid fa-pen"></i>

                                </button>


                                <button
                                    class="table-action delete-action"
                                    title="Delete"
                                    data-action="delete"
                                    data-key="${escapeAttribute(item.key)}"
                                >

                                    <i class="fa-solid fa-trash"></i>

                                </button>


                            </div>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


/* =====================================================
   TABLE ACTIONS
===================================================== */

document
    .getElementById(
        "registrationTableBody"
    )
    .addEventListener(
        "click",
        function(event){

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if(!button){

                return;

            }


            const key =
                button.dataset.key;


            const action =
                button.dataset.action;


            if(
                action === "view"
            ){

                openViewModal(key);

            }


            if(
                action === "edit"
            ){

                openEditModal(key);

            }


            if(
                action === "delete"
            ){

                deleteRegistration(key);

            }

        }
    );


/* =====================================================
   VIEW MODAL
===================================================== */

function openViewModal(key){

    const item =
        registrations[key];


    if(!item){

        showToast(
            "Registration not found.",
            "error"
        );

        return;

    }


    const events =
        getEvents(item);


    const members =
        getTeamMembers(item);


    const modalBody =
        document.getElementById(
            "viewModalBody"
        );


    modalBody.innerHTML = `

        <div class="detail-header">

            <div class="detail-avatar">

                <i class="fa-solid fa-robot"></i>

            </div>


            <div>

                <h3>

                    ${escapeHTML(
                        item.TeamName ||
                        item.StudentName ||
                        "Team Registration"
                    )}

                </h3>


                <p>

                    Registration ID:
                    ${escapeHTML(
                        item.registrationId ||
                        key
                    )}

                </p>

            </div>

        </div>


        <div class="detail-grid">


            <div class="detail-box">

                <label>
                    Team Leader
                </label>

                <strong>
                    ${escapeHTML(
                        item.StudentName ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <label>
                    Team Name
                </label>

                <strong>
                    ${escapeHTML(
                        item.TeamName ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <label>
                    Class
                </label>

                <strong>
                    ${escapeHTML(
                        item.Class ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <label>
                    Section
                </label>

                <strong>
                    ${escapeHTML(
                        item.Section ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <label>
                    Mobile
                </label>

                <strong>
                    ${escapeHTML(
                        item.MobileNumber ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <label>
                    Email
                </label>

                <strong>
                    ${escapeHTML(
                        item.EmailAddress ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-box full">

                <label>
                    Selected Events
                </label>

                <strong>

                    ${
                        events.length
                        ?
                        events
                            .map(
                                escapeHTML
                            )
                            .join(" • ")
                        :
                        "No Event"
                    }

                </strong>

            </div>


            <div class="detail-box full">

                <label>
                    Registration Date
                </label>

                <strong>

                    ${formatFullDate(
                        item.registrationDate
                    )}

                </strong>

            </div>


        </div>


        <div class="detail-members">

            <h4>
                Team Members (${members.length})
            </h4>


            ${
                members.map(
                    function(member){

                        return `

                            <div class="member-detail">

                                <div class="member-number">

                                    ${member.number}

                                </div>


                                <div>

                                    <strong>

                                        ${escapeHTML(
                                            member.name
                                        )}

                                    </strong>

                                </div>


                                <span>

                                    Class:
                                    ${escapeHTML(
                                        member.className ||
                                        "-"
                                    )}

                                </span>


                                <span>

                                    Section:
                                    ${escapeHTML(
                                        member.section ||
                                        "-"
                                    )}

                                </span>

                            </div>

                        `;

                    }
                ).join("")
            }


        </div>


        ${
            item.Remarks
            ?
            `

                <div class="detail-remarks">

                    <strong>
                        Remarks:
                    </strong>

                    <br>

                    ${escapeHTML(
                        item.Remarks
                    )}

                </div>

            `
            :
            ""
        }

    `;


    openModal("viewModal");

}


/* =====================================================
   EDIT MODAL
===================================================== */

function openEditModal(key){

    const item =
        registrations[key];


    if(!item){

        return;

    }


    currentEditKey =
        key;


    document.getElementById(
        "editKey"
    ).value =
        key;


    document.getElementById(
        "editStudentName"
    ).value =
        item.StudentName || "";


    document.getElementById(
        "editTeamName"
    ).value =
        item.TeamName || "";


    document.getElementById(
        "editClass"
    ).value =
        item.Class || "";


    document.getElementById(
        "editSection"
    ).value =
        item.Section || "";


    document.getElementById(
        "editMobile"
    ).value =
        item.MobileNumber || "";


    document.getElementById(
        "editEmail"
    ).value =
        item.EmailAddress || "";


    const members =
        getTeamMembers(item);


    document.getElementById(
        "editTeamSize"
    ).value =
        String(
            Math.max(
                1,
                members.length
            )
        );


    document.getElementById(
        "editRemarks"
    ).value =
        item.Remarks || "";


    document
        .querySelectorAll(
            ".edit-event-checkbox"
        )
        .forEach(
            function(checkbox){

                checkbox.checked =
                    getEvents(item)
                    .includes(
                        checkbox.value
                    );

            }
        );


    for(
        let i = 2;
        i <= 5;
        i++
    ){

        const member =
            members.find(
                m =>
                    m.number === i
            );


        document.getElementById(
            `editMember${i}Name`
        ).value =
            member?.name || "";


        document.getElementById(
            `editMember${i}Class`
        ).value =
            member?.className || "";


        document.getElementById(
            `editMember${i}Section`
        ).value =
            member?.section || "";

    }


    openModal("editModal");

}


/* =====================================================
   SAVE EDIT
===================================================== */

document
    .getElementById(
        "editForm"
    )
    .addEventListener(
        "submit",
        async function(event){

            event.preventDefault();


            if(!currentEditKey){

                return;

            }


            const saveButton =
                document.getElementById(
                    "saveEditButton"
                );


            const selectedEvents =
                Array.from(
                    document.querySelectorAll(
                        ".edit-event-checkbox:checked"
                    )
                )
                .map(
                    checkbox =>
                        checkbox.value
                );


            if(
                selectedEvents.length === 0
            ){

                showToast(
                    "Please select at least one event.",
                    "error"
                );

                return;

            }


            const teamSize =
                Number(
                    document.getElementById(
                        "editTeamSize"
                    ).value
                );


            const data = {

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
                    selectedEvents,

                TeamSize:
                    String(teamSize),

                Remarks:
                    document.getElementById(
                        "editRemarks"
                    ).value.trim()

            };


            for(
                let i = 2;
                i <= 5;
                i++
            ){

                if(
                    i <= teamSize
                ){

                    data[
                        `Member${i}Name`
                    ] =
                        document.getElementById(
                            `editMember${i}Name`
                        ).value.trim();


                    data[
                        `Member${i}Class`
                    ] =
                        document.getElementById(
                            `editMember${i}Class`
                        ).value.trim();


                    data[
                        `Member${i}Section`
                    ] =
                        document.getElementById(
                            `editMember${i}Section`
                        ).value.trim();

                }
                else{

                    data[
                        `Member${i}Name`
                    ] =
                        null;


                    data[
                        `Member${i}Class`
                    ] =
                        null;


                    data[
                        `Member${i}Section`
                    ] =
                        null;

                }

            }


            saveButton.disabled =
                true;


            saveButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Saving...

            `;


            try{

                await update(

                    ref(
                        database,
                        `registrations/${currentEditKey}`
                    ),

                    data

                );


                closeModal(
                    "editModal"
                );


                showToast(
                    "Registration updated successfully.",
                    "check"
                );

            }

            catch(error){

                console.error(error);


                showToast(
                    "Unable to update registration.",
                    "error"
                );

            }

            finally{

                saveButton.disabled =
                    false;


                saveButton.innerHTML = `

                    <i class="fa-solid fa-floppy-disk"></i>

                    Save Changes

                `;

            }

        }
    );


/* =====================================================
   DELETE REGISTRATION
===================================================== */

async function deleteRegistration(key){

    const item =
        registrations[key];


    if(!item){

        return;

    }


    const name =
        item.StudentName ||
        "this registration";


    const confirmed =
        confirm(
            `Delete registration for ${name}?\n\nThis action cannot be undone.`
        );


    if(!confirmed){

        return;

    }


    try{

        await remove(
            ref(
                database,
                `registrations/${key}`
            )
        );


        showToast(
            "Registration deleted successfully.",
            "check"
        );

    }

    catch(error){

        console.error(error);


        showToast(
            "Unable to delete registration.",
            "error"
        );

    }

}


/* =====================================================
   SEARCH
===================================================== */

document
    .getElementById(
        "searchInput"
    )
    .addEventListener(
        "input",
        renderRegistrations
    );


document
    .getElementById(
        "eventFilter"
    )
    .addEventListener(
        "change",
        renderRegistrations
    );


document
    .getElementById(
        "teamSizeFilter"
    )
    .addEventListener(
        "change",
        renderRegistrations
    );


/* =====================================================
   CLEAR FILTER
===================================================== */

document
    .getElementById(
        "clearFilters"
    )
    .addEventListener(
        "click",
        function(){

            document.getElementById(
                "searchInput"
            ).value =
                "";


            document.getElementById(
                "eventFilter"
            ).value =
                "all";


            document.getElementById(
                "teamSizeFilter"
            ).value =
                "all";


            renderRegistrations();

        }
    );


/* =====================================================
   REFRESH
===================================================== */

document
    .getElementById(
        "refreshButton"
    )
    .addEventListener(
        "click",
        function(){

            const icon =
                this.querySelector(
                    "i"
                );


            icon.classList.add(
                "fa-spin"
            );


            loadRegistrations();


            setTimeout(
                function(){

                    icon.classList.remove(
                        "fa-spin"
                    );

                    showToast(
                        "Data refreshed.",
                        "check"
                    );

                },
                700
            );

        }
    );


/* =====================================================
   NAVIGATION
===================================================== */

const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


const sections = {

    dashboard:
        document.getElementById(
            "dashboardSection"
        ),

    registrations:
        document.getElementById(
            "registrationsSection"
        ),

    events:
        document.getElementById(
            "eventsSection"
        )

};


const pageTitle =
    document.getElementById(
        "pageTitle"
    );


navLinks.forEach(
    function(link){

        link.addEventListener(
            "click",
            function(event){

                event.preventDefault();


                const section =
                    link.dataset.section;


                showSection(
                    section
                );


                document
                    .getElementById(
                        "sidebar"
                    )
                    .classList.remove(
                        "open"
                    );

            }
        );

    }
);


/* =====================================================
   SHOW SECTION
===================================================== */

function showSection(section){

    navLinks.forEach(
        function(link){

            link.classList.toggle(
                "active",
                link.dataset.section ===
                section
            );

        }
    );


    Object.values(
        sections
    )
    .forEach(
        function(sectionElement){

            sectionElement.classList.remove(
                "active-section"
            );

        }
    );


    if(
        sections[section]
    ){

        sections[section]
            .classList.add(
                "active-section"
            );

    }


    const titles = {

        dashboard:
            "Dashboard",

        registrations:
            "Registrations",

        events:
            "Competition Events"

    };


    pageTitle.textContent =
        titles[section] ||
        "Dashboard";


    window.location.hash =
        section;

}


/* =====================================================
   VIEW ALL
===================================================== */

document
    .querySelectorAll(
        "[data-section-target]"
    )
    .forEach(
        function(button){

            button.addEventListener(
                "click",
                function(){

                    showSection(
                        button.dataset.sectionTarget
                    );

                }
            );

        }
    );


/* =====================================================
   HASH NAVIGATION
===================================================== */

function loadHashSection(){

    const hash =
        window.location.hash
        .replace(
            "#",
            ""
        );


    if(
        sections[hash]
    ){

        showSection(
            hash
        );

    }
    else{

        showSection(
            "dashboard"
        );

    }

}


window.addEventListener(
    "hashchange",
    loadHashSection
);


/* =====================================================
   MOBILE SIDEBAR
===================================================== */

document
    .getElementById(
        "mobileMenuButton"
    )
    .addEventListener(
        "click",
        function(){

            document
                .getElementById(
                    "sidebar"
                )
                .classList.toggle(
                    "open"
                );

        }
    );


/* =====================================================
   MODALS
===================================================== */

function openModal(id){

    document
        .getElementById(id)
        .classList.add(
            "active"
        );

    document.body.style.overflow =
        "hidden";

}


function closeModal(id){

    document
        .getElementById(id)
        .classList.remove(
            "active"
        );

    document.body.style.overflow =
        "";

}


document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(
        function(button){

            button.addEventListener(
                "click",
                function(){

                    closeModal(
                        button.dataset.closeModal
                    );

                }
            );

        }
    );


document
    .querySelectorAll(
        ".modal-overlay"
    )
    .forEach(
        function(overlay){

            overlay.addEventListener(
                "click",
                function(event){

                    if(
                        event.target ===
                        overlay
                    ){

                        closeModal(
                            overlay.id
                        );

                    }

                }
            );

        }
    );


document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key ===
            "Escape"
        ){

            document
                .querySelectorAll(
                    ".modal-overlay.active"
                )
                .forEach(
                    function(modal){

                        closeModal(
                            modal.id
                        );

                    }
                );

        }

    }
);


/* =====================================================
   EXPORT CSV
===================================================== */

document
    .getElementById(
        "exportButton"
    )
    .addEventListener(
        "click",
        exportCSV
    );


function exportCSV(){

    if(
        registrationArray.length === 0
    ){

        showToast(
            "No registrations to export.",
            "error"
        );

        return;

    }


    const headers = [

        "Registration ID",
        "Team Leader",
        "Team Name",
        "Class",
        "Section",
        "Mobile",
        "Email",
        "Events",
        "Team Size",
        "Member 2",
        "Member 2 Class",
        "Member 2 Section",
        "Member 3",
        "Member 3 Class",
        "Member 3 Section",
        "Member 4",
        "Member 4 Class",
        "Member 4 Section",
        "Member 5",
        "Member 5 Class",
        "Member 5 Section",
        "Remarks",
        "Registration Date"

    ];


    const rows =
        registrationArray.map(
            function(item){

                return [

                    item.registrationId ||
                    item.key,

                    item.StudentName ||
                    "",

                    item.TeamName ||
                    "",

                    item.Class ||
                    "",

                    item.Section ||
                    "",

                    item.MobileNumber ||
                    "",

                    item.EmailAddress ||
                    "",

                    getEvents(item).join(
                        " | "
                    ),

                    getTeamMembers(item).length,

                    item.Member2Name || "",
                    item.Member2Class || "",
                    item.Member2Section || "",

                    item.Member3Name || "",
                    item.Member3Class || "",
                    item.Member3Section || "",

                    item.Member4Name || "",
                    item.Member4Class || "",
                    item.Member4Section || "",

                    item.Member5Name || "",
                    item.Member5Class || "",
                    item.Member5Section || "",

                    item.Remarks ||
                    "",

                    item.registrationDate ||
                    ""

                ];

            }
        );


    const csvContent = [

        headers,

        ...rows

    ]
    .map(
        row =>
            row
                .map(
                    csvEscape
                )
                .join(",")
    )
    .join("\n");


    const blob =
        new Blob(
            [
                "\ufeff" +
                csvContent
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `APS-Robotics-Registrations-${new Date().toISOString().slice(0,10)}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    showToast(
        "CSV exported successfully.",
        "check"
    );

}


/* =====================================================
   CSV ESCAPE
===================================================== */

function csvEscape(value){

    const stringValue =
        String(
            value ?? ""
        );


    return `"${stringValue.replace(
        /"/g,
        '""'
    )}"`;

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(dateString){

    if(!dateString){

        return "-";

    }


    const date =
        new Date(
            dateString
        );


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );

}


function formatFullDate(dateString){

    if(!dateString){

        return "-";

    }


    const date =
        new Date(
            dateString
        );


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return "-";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day:"2-digit",
            month:"long",
            year:"numeric",
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value){

    return String(
        value ?? ""
    )
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


function escapeAttribute(value){

    return escapeHTML(
        value
    );

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(
    message,
    type="check"
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


    if(
        type === "error"
    ){

        toastIcon.className =
            "fa-solid fa-circle-exclamation";


        toastIcon.style.color =
            "#ff4d6d";

    }
    else{

        toastIcon.className =
            "fa-solid fa-check";


        toastIcon.style.color =
            "#00e676";

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function(){

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =====================================================
   INITIAL PAGE
===================================================== */

loadHashSection();
