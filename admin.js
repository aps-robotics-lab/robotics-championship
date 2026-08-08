/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN PANEL
   FIREBASE AUTH + REALTIME DATABASE
   + FIREBASE TRIGGER EMAIL
===================================================== */

import {
    initializeApp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    getDatabase,
    ref,
    get,
    update,
    remove
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =====================================================
   FIRESTORE
   USED FOR FIREBASE TRIGGER EMAIL
===================================================== */

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


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


const auth =
    getAuth(app);


const database =
    getDatabase(app);


/* =====================================================
   INITIALIZE FIRESTORE
===================================================== */

const firestore =
    getFirestore(app);


/* =====================================================
   GLOBAL DATA
===================================================== */

let registrations = {};

let filteredRegistrations = {};

let currentRegistrationKey = null;

let toastTimer = null;


/* =====================================================
   DOM
===================================================== */

const loginScreen =
    document.getElementById("loginScreen");


const adminApp =
    document.getElementById("adminApp");


const loginForm =
    document.getElementById("loginForm");


const loginEmail =
    document.getElementById("loginEmail");


const loginPassword =
    document.getElementById("loginPassword");


const loginBtn =
    document.getElementById("loginBtn");


const loginError =
    document.getElementById("loginError");


const togglePassword =
    document.getElementById("togglePassword");


const adminEmail =
    document.getElementById("adminEmail");


const logoutBtn =
    document.getElementById("logoutBtn");


const sidebar =
    document.getElementById("sidebar");


const sidebarToggle =
    document.getElementById("sidebarToggle");


const tableBody =
    document.getElementById("registrationTableBody");


const tableEmpty =
    document.getElementById("tableEmpty");


const resultCount =
    document.getElementById("resultCount");


const tableStatus =
    document.getElementById("tableStatus");


const searchInput =
    document.getElementById("searchInput");


const eventFilter =
    document.getElementById("eventFilter");


const classFilter =
    document.getElementById("classFilter");


const sectionFilter =
    document.getElementById("sectionFilter");


const clearFilters =
    document.getElementById("clearFilters");


const detailsModal =
    document.getElementById("detailsModal");


const editModal =
    document.getElementById("editModal");


const detailsContent =
    document.getElementById("detailsContent");


const modalDeleteBtn =
    document.getElementById("modalDeleteBtn");


const editForm =
    document.getElementById("editForm");


const editKey =
    document.getElementById("editKey");


const editStudentName =
    document.getElementById("editStudentName");


const editTeamName =
    document.getElementById("editTeamName");


const editClass =
    document.getElementById("editClass");


const editSection =
    document.getElementById("editSection");


const editMobile =
    document.getElementById("editMobile");


const editEmail =
    document.getElementById("editEmail");


const editRemarks =
    document.getElementById("editRemarks");


const toast =
    document.getElementById("toast");


const toastMessage =
    document.getElementById("toastMessage");


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
    auth,
    user => {

        if(user){

            loginScreen.classList.add("hidden");

            adminApp.classList.remove("hidden");

            adminEmail.textContent =
                user.email || "Authenticated Admin";

            loadRegistrations();

        }
        else{

            loginScreen.classList.remove("hidden");

            adminApp.classList.add("hidden");

        }

    }
);


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        loginError.textContent = "";

        loginBtn.disabled = true;

        loginBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Signing In...
        `;


        try{

            await signInWithEmailAndPassword(

                auth,

                loginEmail.value.trim(),

                loginPassword.value

            );

        }
        catch(error){

            console.error(error);

            loginError.textContent =
                getAuthError(error.code);

        }
        finally{

            loginBtn.disabled = false;

            loginBtn.innerHTML = `
                <i class="fa-solid fa-right-to-bracket"></i>
                Login to Dashboard
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

        case "auth/user-not-found":
            return "Admin account was not found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        default:
            return "Login failed. Please check your credentials.";

    }

}


/* =====================================================
   PASSWORD TOGGLE
===================================================== */

togglePassword.addEventListener(
    "click",
    () => {

        const isPassword =
            loginPassword.type === "password";


        loginPassword.type =
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
   LOGOUT
===================================================== */

logoutBtn.addEventListener(
    "click",
    async () => {

        try{

            await signOut(auth);

            showToast(
                "Logged out successfully.",
                "success"
            );

        }
        catch(error){

            console.error(error);

            showToast(
                "Logout failed.",
                "error"
            );

        }

    }
);


/* =====================================================
   NAVIGATION
===================================================== */

document
.querySelectorAll(".nav-item")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            showPage(
                button.dataset.page
            );

            sidebar.classList.remove("open");

        }
    );

});


document
.querySelectorAll("[data-page-target]")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            showPage(
                button.dataset.pageTarget
            );

        }
    );

});


function showPage(pageName){

    document
    .querySelectorAll(".page")
    .forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    const target =
        document.getElementById(
            pageName + "Page"
        );


    if(target){

        target.classList.add(
            "active-page"
        );

    }


    document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );

    });


    const titles = {

        dashboard:
            "Dashboard",

        registrations:
            "Registrations",

        events:
            "Events"

    };


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[pageName] || "Dashboard";


    if(pageName === "registrations"){

        renderTable();

    }

}


/* =====================================================
   SIDEBAR
===================================================== */

sidebarToggle.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);


/* =====================================================
   LOAD REGISTRATIONS
===================================================== */

async function loadRegistrations(){

    tableStatus.textContent =
        "Loading...";


    try{

        const snapshot =
            await get(
                ref(
                    database,
                    "registrations"
                )
            );


        if(snapshot.exists()){

            registrations =
                snapshot.val();

        }
        else{

            registrations = {};

        }


        filteredRegistrations =
            {...registrations};


        populateFilters();

        updateDashboard();

        renderRecent();

        renderTable();

        updateEventPage();


        tableStatus.textContent =
            "Database synced";


    }
    catch(error){

        console.error(
            "Database error:",
            error
        );


        tableStatus.textContent =
            "Database error";


        showToast(
            "Unable to load registrations.",
            "error"
        );

    }

}


/* =====================================================
   NORMALIZE VALUE
===================================================== */

function normalize(value){

    if(value === undefined ||
       value === null){

        return "";

    }


    if(Array.isArray(value)){

        return value.join(", ");

    }


    return String(value);

}


/* =====================================================
   GET EVENTS
===================================================== */

function getEvents(data){

    let events =
        data.Events;


    if(!events){

        return [];

    }


    if(Array.isArray(events)){

        return events;

    }


    if(typeof events === "string"){

        /*
         Handles:
         Robo Race
         Robo Race, Robo War
         Robo Race | Robo War
        */

        return events
            .split(/\s*(?:,|\|)\s*/)
            .map(event => event.trim())
            .filter(Boolean);

    }


    return [events];

}


/* =====================================================
   GET EMAIL ADDRESS
===================================================== */

function getRegistrationEmail(data){

    return normalize(
        data.EmailAddress ||
        data.Email ||
        data.email
    ).trim();

}


/* =====================================================
   GET TEAM SIZE
===================================================== */

function getTeamSize(data){

    if(data.TeamSize){

        const size =
            Number(
                data.TeamSize
            );

        if(
            Number.isFinite(size) &&
            size > 0
        ){

            return size;

        }

    }


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
   UPDATE DASHBOARD
===================================================== */

function updateDashboard(){

    const list =
        Object.values(
            registrations
        );


    const total =
        list.length;


    document.getElementById(
        "totalRegistrations"
    ).textContent =
        total;


    document.getElementById(
        "totalTeams"
    ).textContent =
        total;


    const counts = {

        race:0,
        war:0,
        tug:0,
        soccer:0

    };


    list.forEach(data => {

        getEvents(data)
        .forEach(event => {

            if(event === "Robo Race"){
                counts.race++;
            }

            if(event === "Robo War"){
                counts.war++;
            }

            if(event === "Robo Tug of War"){
                counts.tug++;
            }

            if(event === "Robo Soccer"){
                counts.soccer++;
            }

        });

    });


    document.getElementById(
        "raceCount"
    ).textContent =
        counts.race;


    document.getElementById(
        "warCount"
    ).textContent =
        counts.war;


    document.getElementById(
        "tugCount"
    ).textContent =
        counts.tug;


    document.getElementById(
        "soccerCount"
    ).textContent =
        counts.soccer;


    document.getElementById(
        "eventRaceCount"
    ).textContent =
        counts.race;


    document.getElementById(
        "eventWarCount"
    ).textContent =
        counts.war;


    document.getElementById(
        "eventTugCount"
    ).textContent =
        counts.tug;


    document.getElementById(
        "eventSoccerCount"
    ).textContent =
        counts.soccer;

}


/* =====================================================
   RECENT REGISTRATIONS
===================================================== */

function renderRecent(){

    const container =
        document.getElementById(
            "recentRegistrations"
        );


    const entries =
        Object.entries(
            registrations
        )
        .sort(
            (a,b) => {

                const dateA =
                    new Date(
                        a[1].registrationDate || 0
                    );

                const dateB =
                    new Date(
                        b[1].registrationDate || 0
                    );

                return dateB - dateA;

            }
        )
        .slice(0,6);


    if(entries.length === 0){

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                No registrations found.
            </div>
        `;

        return;

    }


    container.innerHTML =
        entries.map(
            ([key,data]) => {

                const id =
                    normalize(
                        data.registrationId
                    ) || key;


                const name =
                    normalize(
                        data.StudentName
                    ) || "Unknown";


                const team =
                    normalize(
                        data.TeamName
                    ) || "Unnamed Team";


                return `

                    <div class="recent-item">

                        <div class="recent-avatar">

                            <i class="fa-solid fa-user"></i>

                        </div>

                        <div class="recent-details">

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <span>
                                ${escapeHTML(team)}
                            </span>

                            <span class="recent-id">
                                ${escapeHTML(id)}
                            </span>

                        </div>

                        <button
                        class="action-btn view"
                        data-view="${escapeAttr(key)}">

                            <i class="fa-solid fa-eye"></i>

                        </button>

                    </div>
                `;

            }
        )
        .join("");


    container
    .querySelectorAll("[data-view]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openDetails(
                    button.dataset.view
                );

            }
        );

    });

}


/* =====================================================
   FILTER OPTIONS
===================================================== */

function populateFilters(){

    const classes =
        new Set();

    const sections =
        new Set();


    Object.values(
        registrations
    )
    .forEach(data => {

        const className =
            normalize(
                data.Class
            ).trim();


        const section =
            normalize(
                data.Section
            ).trim();


        if(className){
            classes.add(className);
        }


        if(section){
            sections.add(section);
        }

    });


    const currentClass =
        classFilter.value;


    const currentSection =
        sectionFilter.value;


    classFilter.innerHTML =
        `<option value="all">All Classes</option>`;


    [...classes]
    .sort()
    .forEach(value => {

        classFilter.innerHTML += `
            <option value="${escapeAttr(value)}">
                ${escapeHTML(value)}
            </option>
        `;

    });


    sectionFilter.innerHTML =
        `<option value="all">All Sections</option>`;


    [...sections]
    .sort()
    .forEach(value => {

        sectionFilter.innerHTML += `
            <option value="${escapeAttr(value)}">
                ${escapeHTML(value)}
            </option>
        `;

    });


    if(
        [...classes].includes(
            currentClass
        )
    ){

        classFilter.value =
            currentClass;

    }


    if(
        [...sections].includes(
            currentSection
        )
    ){

        sectionFilter.value =
            currentSection;

    }

}


/* =====================================================
   FILTER EVENTS
===================================================== */

searchInput.addEventListener(
    "input",
    applyFilters
);


eventFilter.addEventListener(
    "change",
    applyFilters
);


classFilter.addEventListener(
    "change",
    applyFilters
);


sectionFilter.addEventListener(
    "change",
    applyFilters
);


clearFilters.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        eventFilter.value = "all";

        classFilter.value = "all";

        sectionFilter.value = "all";

        applyFilters();

    }
);


/* =====================================================
   APPLY FILTERS
===================================================== */

function applyFilters(){

    const search =
        searchInput.value
        .trim()
        .toLowerCase();


    const selectedEvent =
        eventFilter.value;


    const selectedClass =
        classFilter.value;


    const selectedSection =
        sectionFilter.value;


    filteredRegistrations = {};


    Object.entries(
        registrations
    )
    .forEach(
        ([key,data]) => {

            const events =
                getEvents(data);


            const searchable = [

                data.registrationId,

                data.StudentName,

                data.TeamName,

                data.Class,

                data.Section,

                data.MobileNumber,

                data.EmailAddress,

                data.Email,

                events.join(" ")

            ]
            .map(normalize)
            .join(" ")
            .toLowerCase();


            const matchesSearch =
                !search ||
                searchable.includes(
                    search
                );


            const matchesEvent =
                selectedEvent === "all" ||
                events.includes(
                    selectedEvent
                );


            const matchesClass =
                selectedClass === "all" ||
                normalize(
                    data.Class
                ) === selectedClass;


            const matchesSection =
                selectedSection === "all" ||
                normalize(
                    data.Section
                ) === selectedSection;


            if(
                matchesSearch &&
                matchesEvent &&
                matchesClass &&
                matchesSection
            ){

                filteredRegistrations[key] =
                    data;

            }

        }
    );


    renderTable();

}


/* =====================================================
   RENDER TABLE
===================================================== */

function renderTable(){

    const entries =
        Object.entries(
            filteredRegistrations
        );


    resultCount.textContent =
        `${entries.length} registration${entries.length === 1 ? "" : "s"}`;


    tableBody.innerHTML = "";


    if(entries.length === 0){

        tableEmpty.classList.remove(
            "hidden"
        );

        return;

    }


    tableEmpty.classList.add(
        "hidden"
    );


    entries.sort(
        (a,b) => {

            const dateA =
                new Date(
                    a[1].registrationDate || 0
                );

            const dateB =
                new Date(
                    b[1].registrationDate || 0
                );

            return dateB - dateA;

        }
    );


    entries.forEach(
        ([key,data]) => {

            const id =
                normalize(
                    data.registrationId
                ) || key;


            const name =
                normalize(
                    data.StudentName
                ) || "-";


            const team =
                normalize(
                    data.TeamName
                ) || "Unnamed Team";


            const className =
                normalize(
                    data.Class
                ) || "-";


            const section =
                normalize(
                    data.Section
                ) || "-";


            const mobile =
                normalize(
                    data.MobileNumber
                ) || "-";


            const teamSize =
                getTeamSize(data);


            const date =
                formatDate(
                    data.registrationDate
                );


            const events =
                getEvents(data);


            const email =
                getRegistrationEmail(data);


            const eventHTML =
                events.length
                ? events.map(
                    event => `
                        <span class="event-tag">
                            ${escapeHTML(event)}
                        </span>
                    `
                ).join("")
                : "-";


            const emailButton =
                email
                ? `
                    <button
                    class="action-btn email"
                    title="Send Confirmation Email"
                    data-email="${escapeAttr(key)}">

                        <i class="fa-solid fa-envelope"></i>

                    </button>
                `
                : "";


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <span class="registration-id">

                        ${escapeHTML(id)}

                    </span>

                </td>


                <td>

                    <strong class="team-name">

                        ${escapeHTML(name)}

                    </strong>

                </td>


                <td>

                    ${escapeHTML(team)}

                </td>


                <td>
                    ${escapeHTML(className)}
                </td>


                <td>
                    ${escapeHTML(section)}
                </td>


                <td>
                    ${escapeHTML(mobile)}
                </td>


                <td>

                    <div class="event-tags">

                        ${eventHTML}

                    </div>

                </td>


                <td>

                    ${teamSize}

                </td>


                <td>

                    ${escapeHTML(date)}

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                        class="action-btn view"
                        title="View Details"
                        data-view="${escapeAttr(key)}">

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                        class="action-btn edit"
                        title="Edit Registration"
                        data-edit="${escapeAttr(key)}">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        ${emailButton}


                        <button
                        class="action-btn delete"
                        title="Delete Registration"
                        data-delete="${escapeAttr(key)}">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    tableBody
    .querySelectorAll("[data-view]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openDetails(
                    button.dataset.view
                );

            }
        );

    });


    tableBody
    .querySelectorAll("[data-edit]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openEdit(
                    button.dataset.edit
                );

            }
        );

    });


    tableBody
    .querySelectorAll("[data-email]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                sendConfirmationEmail(
                    button.dataset.email
                );

            }
        );

    });


    tableBody
    .querySelectorAll("[data-delete]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                deleteRegistration(
                    button.dataset.delete
                );

            }
        );

    });

}


/* =====================================================
   DETAILS MODAL
===================================================== */

function openDetails(key){

    const data =
        registrations[key];


    if(!data){
        return;
    }


    currentRegistrationKey =
        key;


    const events =
        getEvents(data);


    const id =
        normalize(
            data.registrationId
        ) || key;


    const email =
        getRegistrationEmail(data);


    let membersHTML = "";


    for(let i = 2; i <= 5; i++){

        const name =
            normalize(
                data[`Member${i}Name`]
            );


        if(!name){
            continue;
        }


        const memberClass =
            normalize(
                data[`Member${i}Class`]
            );


        const memberSection =
            normalize(
                data[`Member${i}Section`]
            );


        membersHTML += `

            <div class="member-detail">

                <strong>
                    Team Member ${i}
                </strong>

                <div class="detail-grid">

                    <div class="detail-item">

                        <label>Name</label>

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                    </div>

                    <div class="detail-item">

                        <label>Class</label>

                        <strong>
                            ${escapeHTML(memberClass || "-")}
                        </strong>

                    </div>

                    <div class="detail-item">

                        <label>Section</label>

                        <strong>
                            ${escapeHTML(memberSection || "-")}
                        </strong>

                    </div>

                </div>

            </div>

        `;

    }


    detailsContent.innerHTML = `

        <div class="detail-section">

            <h3>
                Registration Information
            </h3>

            <div class="detail-grid">

                <div class="detail-item">

                    <label>Registration ID</label>

                    <strong>
                        ${escapeHTML(id)}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>Registration Date</label>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                data.registrationDate
                            )
                        )}
                    </strong>

                </div>

            </div>

        </div>


        <div class="detail-section">

            <h3>
                Team Information
            </h3>

            <div class="detail-grid">

                <div class="detail-item">

                    <label>Team Leader</label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.StudentName
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>Team Name</label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.TeamName
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>Class</label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.Class
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>Section</label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.Section
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>Mobile</label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.MobileNumber
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>Email</label>

                    <strong>
                        ${escapeHTML(
                            email || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>Team Size</label>

                    <strong>
                        ${getTeamSize(data)} Member(s)
                    </strong>

                </div>

            </div>

        </div>


        <div class="detail-section">

            <h3>
                Selected Events
            </h3>

            <div class="event-tags">

                ${
                    events.length
                    ? events.map(
                        event => `
                            <span class="event-tag">
                                ${escapeHTML(event)}
                            </span>
                        `
                    ).join("")
                    : "<span>No event selected</span>"
                }

            </div>

        </div>


        ${
            membersHTML
            ? `
                <div class="detail-section">

                    <h3>
                        Team Members
                    </h3>

                    ${membersHTML}

                </div>
            `
            : ""
        }


        <div class="detail-section">

            <h3>
                Remarks
            </h3>

            <div class="detail-item">

                <strong>

                    ${escapeHTML(
                        normalize(
                            data.Remarks
                        ) || "No remarks."
                    )}

                </strong>

            </div>

        </div>


        <div class="detail-section email-section">

            <h3>
                Confirmation Email
            </h3>

            <div class="email-admin-box">

                ${
                    email
                    ? `
                        <p>
                            <i class="fa-solid fa-envelope"></i>
                            ${escapeHTML(email)}
                        </p>

                        <button
                        type="button"
                        class="send-email-detail-btn"
                        id="sendDetailEmailBtn">

                            <i class="fa-solid fa-paper-plane"></i>

                            Send Confirmation Email

                        </button>
                    `
                    : `
                        <p class="email-warning">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            No email address is available for this registration.
                        </p>
                    `
                }

            </div>

        </div>

    `;


    detailsModal.classList.remove(
        "hidden"
    );


    const sendDetailEmailBtn =
        document.getElementById(
            "sendDetailEmailBtn"
        );


    if(sendDetailEmailBtn){

        sendDetailEmailBtn.addEventListener(
            "click",
            () => {

                sendConfirmationEmail(
                    key
                );

            }
        );

    }

}


/* =====================================================
   DELETE FROM MODAL
===================================================== */

modalDeleteBtn.addEventListener(
    "click",
    () => {

        if(
            currentRegistrationKey
        ){

            deleteRegistration(
                currentRegistrationKey
            );

        }

    }
);


/* =====================================================
   EDIT
===================================================== */

function openEdit(key){

    const data =
        registrations[key];


    if(!data){
        return;
    }


    editKey.value =
        key;


    editStudentName.value =
        normalize(
            data.StudentName
        );


    editTeamName.value =
        normalize(
            data.TeamName
        );


    editClass.value =
        normalize(
            data.Class
        );


    editSection.value =
        normalize(
            data.Section
        );


    editMobile.value =
        normalize(
            data.MobileNumber
        );


    editEmail.value =
        getRegistrationEmail(data);


    editRemarks.value =
        normalize(
            data.Remarks
        );


    editModal.classList.remove(
        "hidden"
    );

}


/* =====================================================
   SAVE EDIT
===================================================== */

editForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const key =
            editKey.value;


        if(!key){
            return;
        }


        const saveButton =
            document.getElementById(
                "saveEditBtn"
            );


        saveButton.disabled =
            true;


        saveButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Saving...
        `;


        try{

            const updates = {

                StudentName:
                    editStudentName.value.trim(),

                TeamName:
                    editTeamName.value.trim(),

                Class:
                    editClass.value.trim(),

                Section:
                    editSection.value.trim(),

                MobileNumber:
                    editMobile.value.trim(),

                EmailAddress:
                    editEmail.value.trim(),

                Remarks:
                    editRemarks.value.trim()

            };


            await update(

                ref(
                    database,
                    `registrations/${key}`
                ),

                updates

            );


            registrations[key] = {

                ...registrations[key],

                ...updates

            };


            filteredRegistrations[key] =
                registrations[key];


            editModal.classList.add(
                "hidden"
            );


            updateDashboard();

            renderRecent();

            renderTable();

            updateEventPage();


            showToast(
                "Registration updated successfully.",
                "success"
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
   DELETE
===================================================== */

async function deleteRegistration(key){

    const data =
        registrations[key];


    if(!data){
        return;
    }


    const name =
        normalize(
            data.StudentName
        ) || "this registration";


    const confirmed =
        confirm(
            `Are you sure you want to delete the registration for ${name}?\n\nThis action cannot be undone.`
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


        delete registrations[key];

        delete filteredRegistrations[key];


        detailsModal.classList.add(
            "hidden"
        );


        updateDashboard();

        renderRecent();

        renderTable();

        populateFilters();

        updateEventPage();


        showToast(
            "Registration deleted successfully.",
            "success"
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
   SEND CONFIRMATION EMAIL
===================================================== */

async function sendConfirmationEmail(key){

    const data =
        registrations[key];


    if(!data){

        showToast(
            "Registration not found.",
            "error"
        );

        return;

    }


    const email =
        getRegistrationEmail(data);


    if(!email){

        showToast(
            "No email address found for this registration.",
            "error"
        );

        return;

    }


    const registrationID =
        normalize(
            data.registrationId
        ) || key;


    const studentName =
        normalize(
            data.StudentName
        ) || "Participant";


    const teamName =
        normalize(
            data.TeamName
        ) || "Not provided";


    const className =
        normalize(
            data.Class
        ) || "-";


    const section =
        normalize(
            data.Section
        ) || "-";


    const mobile =
        normalize(
            data.MobileNumber
        ) || "-";


    const events =
        getEvents(data);


    const teamSize =
        getTeamSize(data);


    const registrationDate =
        formatDate(
            data.registrationDate
        );


    const members = [];


    for(let i = 2; i <= 5; i++){

        const memberName =
            normalize(
                data[`Member${i}Name`]
            );


        if(memberName){

            members.push({
                number:i,
                name:memberName,
                className:
                    normalize(
                        data[`Member${i}Class`]
                    ) || "-",
                section:
                    normalize(
                        data[`Member${i}Section`]
                    ) || "-"
            });

        }

    }


    const eventsHTML =
        events.length
        ? events
            .map(
                event => `
                    <span style="
                        display:inline-block;
                        background:#e8fbff;
                        color:#087f8c;
                        border:1px solid #b8edf3;
                        border-radius:20px;
                        padding:7px 13px;
                        margin:4px;
                        font-size:13px;
                        font-weight:600;
                    ">
                        ${escapeHTML(event)}
                    </span>
                `
            )
            .join("")
        : `
            <span>
                No event selected
            </span>
        `;


    const membersHTML =
        members.length
        ? `
            <table
            style="
                width:100%;
                border-collapse:collapse;
                margin-top:12px;
            ">

                <thead>

                    <tr>

                        <th
                        style="
                            text-align:left;
                            padding:9px;
                            background:#f1f5f9;
                            border:1px solid #e2e8f0;
                        ">
                            Member
                        </th>

                        <th
                        style="
                            text-align:left;
                            padding:9px;
                            background:#f1f5f9;
                            border:1px solid #e2e8f0;
                        ">
                            Name
                        </th>

                        <th
                        style="
                            text-align:left;
                            padding:9px;
                            background:#f1f5f9;
                            border:1px solid #e2e8f0;
                        ">
                            Class
                        </th>

                        <th
                        style="
                            text-align:left;
                            padding:9px;
                            background:#f1f5f9;
                            border:1px solid #e2e8f0;
                        ">
                            Section
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${members.map(
                        member => `
                            <tr>

                                <td
                                style="
                                    padding:9px;
                                    border:1px solid #e2e8f0;
                                ">
                                    Member ${member.number}
                                </td>

                                <td
                                style="
                                    padding:9px;
                                    border:1px solid #e2e8f0;
                                ">
                                    ${escapeHTML(member.name)}
                                </td>

                                <td
                                style="
                                    padding:9px;
                                    border:1px solid #e2e8f0;
                                ">
                                    ${escapeHTML(member.className)}
                                </td>

                                <td
                                style="
                                    padding:9px;
                                    border:1px solid #e2e8f0;
                                ">
                                    ${escapeHTML(member.section)}
                                </td>

                            </tr>
                        `
                    ).join("")}

                </tbody>

            </table>
        `
        : `
            <p>
                No additional team members were registered.
            </p>
        `;


    const subject =
        `APS Robotics Championship 2026 – Registration Confirmed (${registrationID})`;


    const text =
`Dear ${studentName},

Your registration for APS Robotics Championship 2026 has been successfully received.

Registration ID: ${registrationID}
Team Name: ${teamName}
Class: ${className}
Section: ${section}
Mobile: ${mobile}
Email: ${email}
Team Size: ${teamSize}

Selected Events:
${events.length ? events.join(", ") : "No event selected"}

Registration Date:
${registrationDate}

Please keep your Registration ID for future communication.

Regards,
APS Tinkering Lab
Army Public School
Lal Bahadur Shastri Marg
Lucknow, Uttar Pradesh`;


    const html =
`
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
APS Robotics Championship 2026
</title>

</head>


<body
style="
    margin:0;
    padding:0;
    background:#eef4f8;
    font-family:Arial,Helvetica,sans-serif;
    color:#172033;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
    padding:30px 10px;
">

<tr>

<td align="center">


<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
    max-width:680px;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    box-shadow:0 8px 35px rgba(0,0,0,.10);
">


<!-- HEADER -->

<tr>

<td
style="
    background:#061a2d;
    padding:28px;
    text-align:center;
">

<img
src="https://i.ibb.co/spL8t7cv/Army-Welfare-Education-Society-logo-1.png"
alt="APS Logo"
style="
    width:80px;
    height:auto;
    margin-bottom:12px;
">


<h1
style="
    margin:0;
    color:#00d9ff;
    font-size:24px;
">

APS ROBOTICS

</h1>


<p
style="
    margin:6px 0 0;
    color:#ffffff;
    font-size:14px;
">

CHAMPIONSHIP 2026

</p>

</td>

</tr>


<!-- SUCCESS -->

<tr>

<td
style="
    padding:32px 30px 15px;
">

<h2
style="
    margin:0 0 10px;
    color:#087f8c;
">

Registration Confirmed! ✓

</h2>


<p
style="
    line-height:1.7;
    margin:0;
">

Dear
<strong>
${escapeHTML(studentName)}
</strong>,

</p>


<p
style="
    line-height:1.7;
">

Thank you for registering for
<strong>
APS Robotics Championship 2026
</strong>.

Your registration has been successfully received by
<strong>
APS Tinkering Lab
</strong>.

</p>

</td>

</tr>


<!-- REGISTRATION ID -->

<tr>

<td
style="
    padding:0 30px 20px;
">

<table
width="100%"
style="
    background:#f0fbfd;
    border:1px solid #c8eef3;
    border-radius:12px;
">

<tr>

<td
style="
    padding:18px;
    text-align:center;
">

<p
style="
    margin:0 0 5px;
    color:#64748b;
    font-size:12px;
    text-transform:uppercase;
">

Registration ID

</p>


<strong
style="
    font-size:22px;
    color:#087f8c;
">

${escapeHTML(registrationID)}

</strong>

</td>

</tr>

</table>

</td>

</tr>


<!-- DETAILS -->

<tr>

<td
style="
    padding:0 30px 25px;
">

<h3
style="
    color:#172033;
    border-bottom:2px solid #e2e8f0;
    padding-bottom:10px;
">

Registration Details

</h3>


<table
width="100%"
style="
    border-collapse:collapse;
">

<tr>

<td
style="
    padding:9px 0;
    color:#64748b;
    width:40%;
">

Team Leader

</td>

<td
style="
    padding:9px 0;
    font-weight:bold;
">

${escapeHTML(studentName)}

</td>

</tr>


<tr>

<td
style="
    padding:9px 0;
    color:#64748b;
">

Team Name

</td>

<td
style="
    padding:9px 0;
    font-weight:bold;
">

${escapeHTML(teamName)}

</td>

</tr>


<tr>

<td
style="
    padding:9px 0;
    color:#64748b;
">

Class

</td>

<td
style="
    padding:9px 0;
">

${escapeHTML(className)}

</td>

</tr>


<tr>

<td
style="
    padding:9px 0;
    color:#64748b;
">

Section

</td>

<td
style="
    padding:9px 0;
">

${escapeHTML(section)}

</td>

</tr>


<tr>

<td
style="
    padding:9px 0;
    color:#64748b;
">

Mobile

</td>

<td
style="
    padding:9px 0;
">

${escapeHTML(mobile)}

</td>

</tr>


<tr>

<td
style="
    padding:9px 0;
    color:#64748b;
">

Team Size

</td>

<td
style="
    padding:9px 0;
">

${teamSize} Member(s)

</td>

</tr>


<tr>

<td
style="
    padding:9px 0;
    color:#64748b;
">

Registration Date

</td>

<td
style="
    padding:9px 0;
">

${escapeHTML(registrationDate)}

</td>

</tr>

</table>

</td>

</tr>


<!-- EVENTS -->

<tr>

<td
style="
    padding:0 30px 25px;
">

<h3
style="
    color:#172033;
">

Selected Events

</h3>


<div>

${eventsHTML}

</div>

</td>

</tr>


<!-- MEMBERS -->

<tr>

<td
style="
    padding:0 30px 25px;
">

<h3
style="
    color:#172033;
">

Team Members

</h3>


${membersHTML}

</td>

</tr>


<!-- IMPORTANT -->

<tr>

<td
style="
    padding:0 30px 25px;
">

<table
width="100%"
style="
    background:#fff8e8;
    border:1px solid #f5d78e;
    border-radius:12px;
">

<tr>

<td
style="
    padding:16px;
    line-height:1.6;
">

<strong>
Important:
</strong>

Please save your Registration ID
<strong>
${escapeHTML(registrationID)}
</strong>
for future communication regarding the championship.

</td>

</tr>

</table>

</td>

</tr>


<!-- FOOTER -->

<tr>

<td
style="
    background:#061a2d;
    padding:25px;
    text-align:center;
    color:#ffffff;
">

<strong>
APS Tinkering Lab
</strong>

<br>

Army Public School

<br>

Lal Bahadur Shastri Marg

<br>

Lucknow, Uttar Pradesh

<br><br>

<span
style="
    color:#8ca5b8;
    font-size:12px;
">

APS Robotics Championship 2026

</span>

</td>

</tr>


</table>

</td>

</tr>

</table>

</body>

</html>
`;


    const confirmed =
        confirm(
            `Send confirmation email to:\n\n${email}\n\nRegistration ID: ${registrationID}`
        );


    if(!confirmed){
        return;
    }


    try{

        showToast(
            "Preparing confirmation email...",
            "success"
        );


        /*
         * IMPORTANT:
         *
         * The Firebase Trigger Email Extension
         * watches the "mail" Firestore collection.
         *
         * Creating this document places the email
         * into the Firebase email queue.
         */

        await addDoc(
            collection(
                firestore,
                "mail"
            ),
            {

                to: email,

                message: {

                    subject: subject,

                    text: text,

                    html: html

                },

                registrationId:
                    registrationID,

                emailType:
                    "registration_confirmation",

                createdBy:
                    auth.currentUser
                    ? auth.currentUser.uid
                    : "admin",

                createdAt:
                    serverTimestamp()

            }
        );


        detailsModal.classList.add(
            "hidden"
        );


        showToast(
            `Confirmation email queued for ${email}`,
            "success"
        );

    }
    catch(error){

        console.error(
            "Email error:",
            error
        );


        showToast(
            "Could not queue confirmation email.",
            "error"
        );

    }

}


/* =====================================================
   EVENT PAGE
===================================================== */

function updateEventPage(){

    const counts = {

        race:0,
        war:0,
        tug:0,
        soccer:0

    };


    Object.values(
        registrations
    )
    .forEach(data => {

        getEvents(data)
        .forEach(event => {

            if(event === "Robo Race"){
                counts.race++;
            }

            if(event === "Robo War"){
                counts.war++;
            }

            if(event === "Robo Tug of War"){
                counts.tug++;
            }

            if(event === "Robo Soccer"){
                counts.soccer++;
            }

        });

    });


    document.getElementById(
        "eventRaceCount"
    ).textContent =
        counts.race;


    document.getElementById(
        "eventWarCount"
    ).textContent =
        counts.war;


    document.getElementById(
        "eventTugCount"
    ).textContent =
        counts.tug;


    document.getElementById(
        "eventSoccerCount"
    ).textContent =
        counts.soccer;

}


/* =====================================================
   REFRESH
===================================================== */

document
.getElementById("dashboardRefresh")
.addEventListener(
    "click",
    loadRegistrations
);


document
.getElementById("refreshRegistrations")
.addEventListener(
    "click",
    loadRegistrations
);


/* =====================================================
   EXPORT CSV
===================================================== */

document
.getElementById("exportCsv")
.addEventListener(
    "click",
    () => {

        exportCSV(
            filteredRegistrations
        );

    }
);


document
.getElementById("exportDashboard")
.addEventListener(
    "click",
    () => {

        exportCSV(
            registrations
        );

    }
);


function exportCSV(dataObject){

    const entries =
        Object.entries(
            dataObject
        );


    if(entries.length === 0){

        showToast(
            "There are no registrations to export.",
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
        "Member 3",
        "Member 4",
        "Member 5",
        "Remarks",
        "Registration Date"

    ];


    const rows = [
        headers
    ];


    entries.forEach(
        ([key,data]) => {

            rows.push([

                normalize(
                    data.registrationId
                ) || key,

                normalize(
                    data.StudentName
                ),

                normalize(
                    data.TeamName
                ),

                normalize(
                    data.Class
                ),

                normalize(
                    data.Section
                ),

                normalize(
                    data.MobileNumber
                ),

                getRegistrationEmail(data),

                getEvents(data).join(
                    " | "
                ),

                getTeamSize(data),

                normalize(
                    data.Member2Name
                ),

                normalize(
                    data.Member3Name
                ),

                normalize(
                    data.Member4Name
                ),

                normalize(
                    data.Member5Name
                ),

                normalize(
                    data.Remarks
                ),

                normalize(
                    data.registrationDate
                )

            ]);

        }
    );


    const csv =
        rows
        .map(
            row =>
                row
                .map(csvEscape)
                .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            ["\ufeff" + csv],
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
        document.createElement("a");


    link.href = url;

    link.download =
        "APS_Robotics_Registrations_2026.csv";


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);


    showToast(
        "CSV exported successfully.",
        "success"
    );

}


function csvEscape(value){

    const string =
        normalize(value);


    return `"${string
        .replace(/"/g,'""')}"`;

}


/* =====================================================
   MODAL CLOSE
===================================================== */

document
.querySelectorAll("[data-close-modal]")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            detailsModal.classList.add(
                "hidden"
            );

            editModal.classList.add(
                "hidden"
            );

        }
    );

});


detailsModal.addEventListener(
    "click",
    event => {

        if(
            event.target ===
            detailsModal
        ){

            detailsModal.classList.add(
                "hidden"
            );

        }

    }
);


editModal.addEventListener(
    "click",
    event => {

        if(
            event.target ===
            editModal
        ){

            editModal.classList.add(
                "hidden"
            );

        }

    }
);


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
){

    toastMessage.textContent =
        message;


    const icon =
        toast.querySelector("i");


    icon.className =
        type === "error"
        ? "fa-solid fa-circle-exclamation"
        : "fa-solid fa-circle-check";


    icon.style.color =
        type === "error"
        ? "#ff6278"
        : "#00ff99";


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(value){

    if(!value){
        return "-";
    }


    const date =
        new Date(value);


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return String(value);

    }


    return date.toLocaleString(
        "en-IN",
        {
            day:"2-digit",
            month:"short",
            year:"numeric",
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}


/* =====================================================
   HTML SECURITY
===================================================== */

function escapeHTML(value){

    return normalize(value)
        .replace(
            /[&<>"']/g,
            character => {

                const entities = {

                    "&":"&amp;",

                    "<":"&lt;",

                    ">":"&gt;",

                    '"':"&quot;",

                    "'":"&#039;"

                };


                return entities[
                    character
                ];

            }
        );

}


function escapeAttr(value){

    return escapeHTML(value);

}


/* =====================================================
   INITIAL
===================================================== */

filteredRegistrations = {};

updateDashboard();

updateEventPage();


/* =====================================================
   KEYBOARD ESCAPE
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape"
        ){

            detailsModal.classList.add(
                "hidden"
            );

            editModal.classList.add(
                "hidden"
            );

        }

    }
);
