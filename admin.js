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

import {
getAuth,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

/* =====================================================
FIREBASE CONFIG
SAME DATABASE AS index.html
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
INITIALIZE
===================================================== */

const app =
initializeApp(firebaseConfig);

const database =
getDatabase(app);

const auth =
getAuth(app);

/* =====================================================
DOM
===================================================== */

const loginScreen =
document.getElementById("loginScreen");

const adminApp =
document.getElementById("adminApp");

const loginForm =
document.getElementById("loginForm");

const loginError =
document.getElementById("loginError");

const loginBtn =
document.getElementById("loginBtn");

const togglePassword =
document.getElementById("togglePassword");

const adminEmail =
document.getElementById("adminEmail");

const adminPassword =
document.getElementById("adminPassword");

/* =====================================================
DATA
===================================================== */

let registrations = {};

let currentDeleteKey = null;

/* =====================================================
LOGIN
===================================================== */

loginForm.addEventListener(
"submit",
async function(event){

    event.preventDefault();

    loginError.textContent = "";

    loginBtn.disabled = true;

    loginBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Signing in...
    `;


    try{

        await signInWithEmailAndPassword(
            auth,
            adminEmail.value.trim(),
            adminPassword.value
        );

    }

    catch(error){

        console.error(error);

        let message =
            "Login failed. Please check your email and password.";

        if(
            error.code ===
            "auth/invalid-credential"
        ){

            message =
                "Invalid admin email or password.";

        }

        if(
            error.code ===
            "auth/too-many-requests"
        ){

            message =
                "Too many attempts. Please try again later.";

        }

        loginError.textContent =
            message;

    }

    finally{

        loginBtn.disabled = false;

        loginBtn.innerHTML = `
            <span>
                <i class="fa-solid fa-right-to-bracket"></i>
                Login
            </span>
        `;

    }

}

);

/* =====================================================
PASSWORD VISIBILITY
===================================================== */

togglePassword.addEventListener(
"click",
function(){

    const isPassword =
        adminPassword.type === "password";


    adminPassword.type =
        isPassword
            ? "text"
            : "password";


    togglePassword.innerHTML =
        isPassword
            ? '<i class="fa-solid fa-eye-slash"></i>'
            : '<i class="fa-solid fa-eye"></i>';

}

);

/* =====================================================
AUTH STATE
===================================================== */

onAuthStateChanged(
auth,
async function(user){

    if(user){

        loginScreen.classList.add(
            "hidden"
        );

        adminApp.classList.remove(
            "hidden"
        );

        const name =
            document.getElementById(
                "adminUserName"
            );

        name.textContent =
            user.email || "Administrator";


        await loadRegistrations();

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

document
.getElementById("logoutBtn")
.addEventListener(
"click",
async function(){

        await signOut(auth);

    }
);

/* =====================================================
LOAD REGISTRATIONS
===================================================== */

async function loadRegistrations(){

try{

    const registrationRef =
        ref(
            database,
            "registrations"
        );


    const snapshot =
        await get(
            registrationRef
        );


    registrations =
        snapshot.exists()
            ? snapshot.val()
            : {};


    renderDashboard();

    renderTable();

    renderRecent();

    renderEvents();

}

catch(error){

    console.error(
        "Firebase Load Error:",
        error
    );

    showToast(
        "Unable to load registrations."
    );

}

}

/* =====================================================
NORMALIZE DATA
===================================================== */

function normalizeEvents(value){

if(!value){

    return [];

}


if(Array.isArray(value)){

    return value.filter(Boolean);

}


return [value];

}

function getRegistrationArray(){

return Object.entries(
    registrations
)
.map(
    ([key,value]) => ({
        key,
        ...value
    })
)
.sort(
    (a,b) =>
        new Date(
            b.registrationDate || 0
        ) -
        new Date(
            a.registrationDate || 0
        )
);

}

/* =====================================================
TEAM MEMBER COUNT
===================================================== */

function getMemberCount(data){

let count = 1;


for(let i = 2; i <= 5; i++){

    if(
        data[`Member${i}Name`] &&
        String(
            data[`Member${i}Name`]
        ).trim()
    ){

        count++;

    }

}


return count;

}

/* =====================================================
DASHBOARD
===================================================== */

function renderDashboard(){

const list =
    getRegistrationArray();


const total =
    list.length;


let members = 0;

let entries = 0;


list.forEach(
    item => {

        members +=
            getMemberCount(item);


        entries +=
            normalizeEvents(
                item.Events
            ).length;

    }
);


const today =
    list.filter(
        item =>
            isToday(
                item.registrationDate
            )
    ).length;


setText(
    "totalRegistrations",
    total
);


setText(
    "totalMembers",
    members
);


setText(
    "totalEventEntries",
    entries
);


setText(
    "todayRegistrations",
    today
);


const counts =
    getEventCounts(list);


setText(
    "raceCount",
    counts["Robo Race"]
);


setText(
    "warCount",
    counts["Robo War"]
);


setText(
    "tugCount",
    counts["Robo Tug of War"]
);


setText(
    "soccerCount",
    counts["Robo Soccer"]
);


const max =
    Math.max(
        ...Object.values(counts),
        1
    );


setWidth(
    "raceBar",
    counts["Robo Race"],
    max
);


setWidth(
    "warBar",
    counts["Robo War"],
    max
);


setWidth(
    "tugBar",
    counts["Robo Tug of War"],
    max
);


setWidth(
    "soccerBar",
    counts["Robo Soccer"],
    max
);

}

/* =====================================================
EVENT COUNTS
===================================================== */

function getEventCounts(list){

const counts = {

    "Robo Race":0,

    "Robo War":0,

    "Robo Tug of War":0,

    "Robo Soccer":0

};


list.forEach(
    item => {

        normalizeEvents(
            item.Events
        ).forEach(
            event => {

                if(
                    counts[event] !== undefined
                ){

                    counts[event]++;

                }

            }
        );

    }
);


return counts;

}

/* =====================================================
TABLE
===================================================== */

function renderTable(){

const tbody =
    document.getElementById(
        "registrationTable"
    );


const list =
    getFilteredRegistrations();


document.getElementById(
    "resultCount"
).textContent =
    `${list.length} registration${list.length !== 1 ? "s" : ""}`;


document.getElementById(
    "tableInfo"
).textContent =
    `Showing ${list.length} registration${list.length !== 1 ? "s" : ""}`;


if(!list.length){

    tbody.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="table-empty">

                <i class="fa-solid fa-folder-open"></i>

                No registrations found.

            </td>

        </tr>

    `;

    return;

}


tbody.innerHTML =
    list.map(
        item => {

            const events =
                normalizeEvents(
                    item.Events
                );


            const memberCount =
                getMemberCount(item);


            const id =
                getDisplayRegistrationId(
                    item
                );


            return `

                <tr>

                    <td>

                        <span
                            class="registration-id">

                            ${escapeHTML(id)}

                        </span>

                    </td>


                    <td>

                        <span
                            class="team-name">

                            ${escapeHTML(
                                item.TeamName ||
                                "Unnamed Team"
                            )}

                        </span>

                    </td>


                    <td>

                        ${escapeHTML(
                            item.StudentName ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            item.Class || "-"
                        )}
                        -
                        ${escapeHTML(
                            item.Section || "-"
                        )}

                    </td>


                    <td>

                        <span class="event-tag">

                            ${memberCount}
                            Member${memberCount !== 1 ? "s" : ""}

                        </span>

                    </td>


                    <td>

                        ${events.map(
                            event =>
                                `<span class="event-tag">
                                    ${escapeHTML(event)}
                                </span>`
                        ).join("")}

                    </td>


                    <td>

                        <span class="muted">

                            ${formatDate(
                                item.registrationDate
                            )}

                        </span>

                    </td>


                    <td>

                        <div
                            class="action-group">

                            <button
                                class="action-btn"
                                title="View"
                                data-action="view"
                                data-key="${item.key}">

                                <i class="fa-solid fa-eye"></i>

                            </button>


                            <button
                                class="action-btn"
                                title="Edit"
                                data-action="edit"
                                data-key="${item.key}">

                                <i class="fa-solid fa-pen"></i>

                            </button>


                            <button
                                class="action-btn delete"
                                title="Delete"
                                data-action="delete"
                                data-key="${item.key}">

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
FILTERS
===================================================== */

function getFilteredRegistrations(){

const search =
    document.getElementById(
        "searchInput"
    ).value
    .trim()
    .toLowerCase();


const event =
    document.getElementById(
        "eventFilter"
    ).value;


const date =
    document.getElementById(
        "dateFilter"
    ).value;


return getRegistrationArray()
    .filter(
        item => {

            if(search){

                const searchable = [

                    item.registrationId,

                    item.TeamName,

                    item.StudentName,

                    item.Class,

                    item.Section,

                    item.MobileNumber,

                    item.EmailAddress

                ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


                if(
                    !searchable.includes(search)
                ){

                    return false;

                }

            }


            if(
                event !== "all"
            ){

                if(
                    !normalizeEvents(
                        item.Events
                    ).includes(event)
                ){

                    return false;

                }

            }


            if(
                date === "today" &&
                !isToday(
                    item.registrationDate
                )
            ){

                return false;

            }


            if(
                date === "week" &&
                !withinLastDays(
                    item.registrationDate,
                    7
                )
            ){

                return false;

            }


            return true;

        }
    );

}

document
.getElementById("searchInput")
.addEventListener(
"input",
renderTable
);

document
.getElementById("eventFilter")
.addEventListener(
"change",
renderTable
);

document
.getElementById("dateFilter")
.addEventListener(
"change",
renderTable
);

document
.getElementById("clearFilters")
.addEventListener(
"click",
function(){

        document.getElementById(
            "searchInput"
        ).value = "";

        document.getElementById(
            "eventFilter"
        ).value = "all";

        document.getElementById(
            "dateFilter"
        ).value = "all";

        renderTable();

    }
);

/* =====================================================
TABLE ACTIONS
===================================================== */

document
.getElementById("registrationTable")
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


        if(action === "view"){

            showDetails(key);

        }


        if(action === "edit"){

            openEdit(key);

        }


        if(action === "delete"){

            openDelete(key);

        }

    }
);

/* =====================================================
DETAILS
===================================================== */

function showDetails(key){

const item =
    registrations[key];


if(!item){

    return;

}


const events =
    normalizeEvents(
        item.Events
    );


const members =
    getMembers(item);


document.getElementById(
    "detailsTitle"
).textContent =
    item.TeamName ||
    item.StudentName ||
    "Registration";


document.getElementById(
    "detailsContent"
).innerHTML = `

    <div class="details-grid">

        <div class="detail-item">

            <span>Registration ID</span>

            <strong>
                ${escapeHTML(
                    getDisplayRegistrationId(item)
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>Date</span>

            <strong>
                ${formatDate(
                    item.registrationDate
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>Team Leader</span>

            <strong>
                ${escapeHTML(
                    item.StudentName || "-"
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>Team Name</span>

            <strong>
                ${escapeHTML(
                    item.TeamName ||
                    "Unnamed Team"
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>Class</span>

            <strong>
                ${escapeHTML(
                    item.Class || "-"
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>Section</span>

            <strong>
                ${escapeHTML(
                    item.Section || "-"
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>Mobile</span>

            <strong>
                ${escapeHTML(
                    item.MobileNumber || "-"
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>Email</span>

            <strong>
                ${escapeHTML(
                    item.EmailAddress || "-"
                )}
            </strong>

        </div>


        <div class="detail-item full">

            <span>Selected Events</span>

            <div class="detail-events">

                ${events.map(
                    event =>
                        `<span class="event-tag">
                            ${escapeHTML(event)}
                        </span>`
                ).join("")}

            </div>

        </div>


        <div class="detail-item full">

            <span>Remarks</span>

            <strong>
                ${escapeHTML(
                    item.Remarks || "No remarks"
                )}
            </strong>

        </div>

    </div>


    <div class="member-list">

        <h3>
            Team Members
        </h3>

        ${members.map(
            (member,index) => `

                <div class="member-row">

                    <div class="member-number">
                        ${String(index + 1).padStart(2,"0")}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(member.name)}
                        </strong>

                        <span>
                            Class ${escapeHTML(member.className)}
                            • Section ${escapeHTML(member.section)}
                        </span>

                    </div>

                </div>

            `
        ).join("")}

    </div>

`;


openModal(
    "detailsModal"
);

}

/* =====================================================
MEMBERS
===================================================== */

function getMembers(item){

const members = [];


members.push({

    name:
        item.StudentName ||
        "-",

    className:
        item.Class ||
        "-",

    section:
        item.Section ||
        "-"

});


for(let i = 2; i <= 5; i++){

    if(
        item[`Member${i}Name`]
    ){

        members.push({

            name:
                item[`Member${i}Name`],

            className:
                item[`Member${i}Class`] ||
                "-",

            section:
                item[`Member${i}Section`] ||
                "-"

        });

    }

}


return members;

}

/* =====================================================
EDIT
===================================================== */

function openEdit(key){

const item =
    registrations[key];


if(!item){

    return;

}


document.getElementById(
    "editKey"
).value = key;


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


document.getElementById(
    "editRemarks"
).value =
    item.Remarks || "";


const selectedEvents =
    normalizeEvents(
        item.Events
    );


document
    .querySelectorAll(".edit-event")
    .forEach(
        checkbox => {

            checkbox.checked =
                selectedEvents.includes(
                    checkbox.value
                );

        }
    );


openModal(
    "editModal"
);

}

/* =====================================================
SAVE EDIT
===================================================== */

document
.getElementById("editForm")
.addEventListener(
"submit",
async function(event){

        event.preventDefault();


        const key =
            document.getElementById(
                "editKey"
            ).value;


        if(!key){

            return;

        }


        const events =
            Array.from(
                document.querySelectorAll(
                    ".edit-event:checked"
                )
            )
            .map(
                checkbox =>
                    checkbox.value
            );


        if(!events.length){

            showToast(
                "Select at least one event."
            );

            return;

        }


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
                events,

            Remarks:
                document.getElementById(
                    "editRemarks"
                ).value.trim()

        };


        try{

            await update(
                ref(
                    database,
                    `registrations/${key}`
                ),
                changes
            );


            registrations[key] = {

                ...registrations[key],

                ...changes

            };


            closeModal(
                "editModal"
            );


            renderDashboard();

            renderTable();

            renderRecent();

            renderEvents();


            showToast(
                "Registration updated successfully."
            );

        }

        catch(error){

            console.error(error);

            showToast(
                "Unable to update registration."
            );

        }

    }
);

/* =====================================================
DELETE
===================================================== */

function openDelete(key){

const item =
    registrations[key];


if(!item){

    return;

}


currentDeleteKey =
    key;


document.getElementById(
    "deleteRegistrationId"
).textContent =
    getDisplayRegistrationId(item);


openModal(
    "deleteModal"
);

}

document
.getElementById("confirmDelete")
.addEventListener(
"click",
async function(){

        if(!currentDeleteKey){

            return;

        }


        const key =
            currentDeleteKey;


        try{

            await remove(
                ref(
                    database,
                    `registrations/${key}`
                )
            );


            delete registrations[key];


            currentDeleteKey =
                null;


            closeModal(
                "deleteModal"
            );


            renderDashboard();

            renderTable();

            renderRecent();

            renderEvents();


            showToast(
                "Registration deleted."
            );

        }

        catch(error){

            console.error(error);

            showToast(
                "Delete failed."
            );

        }

    }
);

/* =====================================================
RECENT
===================================================== */

function renderRecent(){

const container =
    document.getElementById(
        "recentRegistrations"
    );


const list =
    getRegistrationArray()
    .slice(0,5);


if(!list.length){

    container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-users-slash"></i>

            No registrations yet.

        </div>

    `;

    return;

}


container.innerHTML =
    list.map(
        item => `

            <div class="recent-item">

                <div class="recent-avatar">

                    <i class="fa-solid fa-user"></i>

                </div>


                <div class="recent-info">

                    <strong>

                        ${escapeHTML(
                            item.TeamName ||
                            item.StudentName ||
                            "Unnamed Team"
                        )}

                    </strong>

                    <span>

                        ${escapeHTML(
                            getDisplayRegistrationId(item)
                        )}

                    </span>

                </div>


                <span class="recent-date">

                    ${formatDate(
                        item.registrationDate
                    )}

                </span>

            </div>

        `
    )
    .join("");

}

/* =====================================================
EVENTS PAGE
===================================================== */

function renderEvents(){

const counts =
    getEventCounts(
        getRegistrationArray()
    );


setText(
    "eventRaceTotal",
    counts["Robo Race"]
);


setText(
    "eventWarTotal",
    counts["Robo War"]
);


setText(
    "eventTugTotal",
    counts["Robo Tug of War"]
);


setText(
    "eventSoccerTotal",
    counts["Robo Soccer"]
);

}

/* =====================================================
NAVIGATION
===================================================== */

document
.querySelectorAll(".nav-item")
.forEach(
item => {

        item.addEventListener(
            "click",
            function(event){

                event.preventDefault();

                showSection(
                    item.dataset.section
                );

            }
        );

    }
);

document
.querySelectorAll("[data-section]")
.forEach(
button => {

        if(
            !button.classList.contains(
                "nav-item"
            )
        ){

            button.addEventListener(
                "click",
                function(){

                    showSection(
                        button.dataset.section
                    );

                }
            );

        }

    }
);

function showSection(section){

document
    .querySelectorAll(
        ".content-section"
    )
    .forEach(
        element => {

            element.classList.remove(
                "active-section"
            );

        }
    );


const target =
    document.getElementById(
        section
    );


if(target){

    target.classList.add(
        "active-section"
    );

}


document
    .querySelectorAll(".nav-item")
    .forEach(
        item => {

            item.classList.toggle(
                "active",
                item.dataset.section === section
            );

        }
    );


const titles = {

    dashboard:"Dashboard",

    registrations:"Registrations",

    events:"Competition Events"

};


document.getElementById(
    "pageTitle"
).textContent =
    titles[section] ||
    "Dashboard";


document
    .getElementById("sidebar")
    .classList.remove(
        "open"
    );

}

/* =====================================================
SIDEBAR MOBILE
===================================================== */

document
.getElementById("sidebarToggle")
.addEventListener(
"click",
function(){

        document
            .getElementById("sidebar")
            .classList.toggle(
                "open"
            );

    }
);

/* =====================================================
REFRESH
===================================================== */

document
.getElementById("refreshBtn")
.addEventListener(
"click",
async function(){

        await loadRegistrations();

        showToast(
            "Dashboard refreshed."
        );

    }
);

document
.getElementById("refreshTable")
.addEventListener(
"click",
async function(){

        await loadRegistrations();

        showToast(
            "Registrations refreshed."
        );

    }
);

/* =====================================================
EXPORT CSV
===================================================== */

document
.getElementById("exportBtn")
.addEventListener(
"click",
exportCSV
);

document
.getElementById("exportTopBtn")
.addEventListener(
"click",
exportCSV
);

function exportCSV(){

const list =
    getFilteredRegistrations();


if(!list.length){

    showToast(
        "No registrations to export."
    );

    return;

}


const headers = [

    "Registration ID",

    "Team Name",

    "Team Leader",

    "Class",

    "Section",

    "Mobile",

    "Email",

    "Team Size",

    "Events",

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
    list.map(
        item => [

            getDisplayRegistrationId(item),

            item.TeamName || "",

            item.StudentName || "",

            item.Class || "",

            item.Section || "",

            item.MobileNumber || "",

            item.EmailAddress || "",

            getMemberCount(item),

            normalizeEvents(
                item.Events
            ).join(" | "),

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

            item.Remarks || "",

            item.registrationDate || ""

        ]
    );


const csv = [

    headers,

    ...rows

]
.map(
    row =>
        row
        .map(
            value =>
                `"${String(value)
                    .replace(/"/g,'""')}"`
        )
        .join(",")
)
.join("\n");


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


link.href =
    url;


link.download =
    `APS-Robotics-Registrations-${new Date()
        .toISOString()
        .slice(0,10)}.csv`;


document.body.appendChild(link);

link.click();

link.remove();

URL.revokeObjectURL(url);


showToast(
    "CSV exported successfully."
);

}

/* =====================================================
MODALS
===================================================== */

document
.querySelectorAll("[data-close]")
.forEach(
button => {

        button.addEventListener(
            "click",
            function(){

                closeModal(
                    button.dataset.close
                );

            }
        );

    }
);

document
.querySelectorAll(".modal-overlay")
.forEach(
modal => {

        modal.addEventListener(
            "click",
            function(event){

                if(
                    event.target === modal
                ){

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }
);

function openModal(id){

document
    .getElementById(id)
    .classList.add(
        "show"
    );

}

function closeModal(id){

document
    .getElementById(id)
    .classList.remove(
        "show"
    );

}

/* =====================================================
ESCAPE MODAL
===================================================== */

document.addEventListener(
"keydown",
function(event){

    if(event.key === "Escape"){

        document
            .querySelectorAll(
                ".modal-overlay.show"
            )
            .forEach(
                modal =>
                    modal.classList.remove(
                        "show"
                    )
            );

    }

}

);

/* =====================================================
HELPERS
===================================================== */

function setText(id,value){

const element =
    document.getElementById(id);


if(element){

    element.textContent =
        value;

}

}

function setWidth(id,value,max){

const element =
    document.getElementById(id);


if(element){

    const percentage =
        max > 0
            ? (value / max) * 100
            : 0;


    element.style.width =
        `${percentage}%`;

}

}

function formatDate(date){

if(!date){

    return "-";

}


const parsed =
    new Date(date);


if(
    Number.isNaN(
        parsed.getTime()
    )
){

    return "-";

}


return parsed.toLocaleDateString(
    "en-IN",
    {
        day:"2-digit",
        month:"short",
        year:"numeric"
    }
);

}

function isToday(date){

if(!date){

    return false;

}


const d =
    new Date(date);


const now =
    new Date();


return (

    d.getDate() === now.getDate() &&

    d.getMonth() === now.getMonth() &&

    d.getFullYear() === now.getFullYear()

);

}

function withinLastDays(
date,
days
){

if(!date){

    return false;

}


const time =
    new Date(date).getTime();


const now =
    Date.now();


return (
    now - time <=
    days * 24 * 60 * 60 * 1000
);

}

function getDisplayRegistrationId(item){

if(
    item.registrationId
){

    const id =
        String(
            item.registrationId
        );


    /*
      Your current index.html generates:

      APSRC-2026-0001

      Keep that official ID.
    */

    return id;

}


return "NOT AVAILABLE";

}

function escapeHTML(value){

return String(
    value ?? ""
)
.replace(
    /[&<>"']/g,
    function(char){

        const entities = {

            "&":"&amp;",

            "<":"&lt;",

            ">":"&gt;",

            '"':"&quot;",

            "'":"&#039;"

        };


        return entities[char];

    }
);

}

/* =====================================================
TOAST
===================================================== */

let toastTimer;

function showToast(message){

const toast =
    document.getElementById(
        "toast"
    );


document.getElementById(
    "toastMessage"
).textContent =
    message;


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
