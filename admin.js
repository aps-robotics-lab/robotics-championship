/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN PANEL
   FIREBASE AUTH + REALTIME DATABASE
   OLD VERSION — BEFORE SEND EMAIL FUNCTION
===================================================== */


/* =====================================================
   FIREBASE APP
===================================================== */

import {
    initializeApp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


/* =====================================================
   FIREBASE AUTHENTICATION
===================================================== */

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


/* =====================================================
   FIREBASE REALTIME DATABASE
===================================================== */

import {
    getDatabase,
    ref,
    get,
    update,
    remove
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


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
   GLOBAL DATA
===================================================== */

let registrations = {};

let filteredRegistrations = {};

let currentRegistrationKey = null;

let toastTimer = null;


/* =====================================================
   DOM ELEMENTS
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

            if(adminEmail){

                adminEmail.textContent =
                    user.email ||
                    "Authenticated Admin";

            }

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

if(loginForm){

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if(loginError){

                loginError.textContent = "";

            }

            if(loginBtn){

                loginBtn.disabled = true;

                loginBtn.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Signing In...
                `;

            }


            try{

                await signInWithEmailAndPassword(

                    auth,

                    loginEmail.value.trim(),

                    loginPassword.value

                );

            }
            catch(error){

                console.error(
                    "Login error:",
                    error
                );


                if(loginError){

                    loginError.textContent =
                        getAuthError(
                            error.code
                        );

                }

            }
            finally{

                if(loginBtn){

                    loginBtn.disabled = false;

                    loginBtn.innerHTML = `
                        <i class="fa-solid fa-right-to-bracket"></i>
                        Login to Dashboard
                    `;

                }

            }

        }
    );

}


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

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        case "auth/user-disabled":
            return "This admin account has been disabled.";

        default:
            return "Login failed. Please check your credentials.";

    }

}


/* =====================================================
   PASSWORD TOGGLE
===================================================== */

if(togglePassword){

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

}


/* =====================================================
   LOGOUT
===================================================== */

if(logoutBtn){

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

                console.error(
                    "Logout error:",
                    error
                );


                showToast(
                    "Logout failed.",
                    "error"
                );

            }

        }
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

document
.querySelectorAll(".nav-item")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;


            if(page){

                showPage(page);

            }


            if(sidebar){

                sidebar.classList.remove(
                    "open"
                );

            }

        }
    );

});


document
.querySelectorAll("[data-page-target]")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.pageTarget;


            if(page){

                showPage(page);

            }

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


    const pageTitle =
        document.getElementById(
            "pageTitle"
        );


    if(pageTitle){

        pageTitle.textContent =
            titles[pageName] ||
            "Dashboard";

    }


    if(pageName === "registrations"){

        renderTable();

    }

}


/* =====================================================
   SIDEBAR
===================================================== */

if(sidebarToggle){

    sidebarToggle.addEventListener(
        "click",
        () => {

            if(sidebar){

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );

}


/* =====================================================
   LOAD REGISTRATIONS
===================================================== */

async function loadRegistrations(){

    if(tableStatus){

        tableStatus.textContent =
            "Loading...";

    }


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
            {
                ...registrations
            };


        populateFilters();

        updateDashboard();

        renderRecent();

        renderTable();

        updateEventPage();


        if(tableStatus){

            tableStatus.textContent =
                "Database synced";

        }

    }
    catch(error){

        console.error(
            "Database error:",
            error
        );


        if(tableStatus){

            tableStatus.textContent =
                "Database error";

        }


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

    if(
        value === undefined ||
        value === null
    ){

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

    if(!data){

        return [];

    }


    let events =
        data.Events;


    if(!events){

        return [];

    }


    if(Array.isArray(events)){

        return events
            .map(event => normalize(event).trim())
            .filter(Boolean);

    }


    if(typeof events === "string"){

        return events
            .split(/\s*(?:,|\|)\s*/)
            .map(event => event.trim())
            .filter(Boolean);

    }


    return [
        normalize(events)
    ].filter(Boolean);

}


/* =====================================================
   GET REGISTRATION EMAIL
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

    if(!data){

        return 0;

    }


    if(
        data.TeamSize !== undefined &&
        data.TeamSize !== null &&
        data.TeamSize !== ""
    ){

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


    for(
        let i = 2;
        i <= 5;
        i++
    ){

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
            registrations || {}
        );


    const total =
        list.length;


    setText(
        "totalRegistrations",
        total
    );


    setText(
        "totalTeams",
        total
    );


    const counts = {

        race: 0,

        war: 0,

        tug: 0,

        soccer: 0

    };


    list.forEach(data => {

        getEvents(data)
        .forEach(event => {

            const eventName =
                event
                .trim()
                .toLowerCase();


            if(
                eventName ===
                "robo race"
            ){

                counts.race++;

            }


            if(
                eventName ===
                "robo war"
            ){

                counts.war++;

            }


            if(
                eventName ===
                "robo tug of war"
            ){

                counts.tug++;

            }


            if(
                eventName ===
                "robo soccer"
            ){

                counts.soccer++;

            }

        });

    });


    setText(
        "raceCount",
        counts.race
    );


    setText(
        "warCount",
        counts.war
    );


    setText(
        "tugCount",
        counts.tug
    );


    setText(
        "soccerCount",
        counts.soccer
    );


    setText(
        "eventRaceCount",
        counts.race
    );


    setText(
        "eventWarCount",
        counts.war
    );


    setText(
        "eventTugCount",
        counts.tug
    );


    setText(
        "eventSoccerCount",
        counts.soccer
    );

}


/* =====================================================
   RECENT REGISTRATIONS
===================================================== */

function renderRecent(){

    const container =
        document.getElementById(
            "recentRegistrations"
        );


    if(!container){

        return;

    }


    const entries =
        Object.entries(
            registrations || {}
        )
        .sort(
            (a,b) => {

                const dateA =
                    getTimestamp(
                        a[1].registrationDate
                    );


                const dateB =
                    getTimestamp(
                        b[1].registrationDate
                    );


                return dateB - dateA;

            }
        )
        .slice(0,6);


    if(entries.length === 0){

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-folder-open"></i>

                <span>
                    No registrations found.
                </span>

            </div>
        `;

        return;

    }


    container.innerHTML =
        entries
        .map(
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
                            type="button"
                            class="action-btn view"
                            title="View Registration"
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
   POPULATE FILTERS
===================================================== */

function populateFilters(){

    if(
        !classFilter ||
        !sectionFilter
    ){

        return;

    }


    const classes =
        new Set();


    const sections =
        new Set();


    Object.values(
        registrations || {}
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

            classes.add(
                className
            );

        }


        if(section){

            sections.add(
                section
            );

        }

    });


    const currentClass =
        classFilter.value;


    const currentSection =
        sectionFilter.value;


    classFilter.innerHTML =
        `<option value="all">All Classes</option>`;


    [...classes]
    .sort(
        naturalSort
    )
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
    .sort(
        naturalSort
    )
    .forEach(value => {

        sectionFilter.innerHTML += `
            <option value="${escapeAttr(value)}">
                ${escapeHTML(value)}
            </option>
        `;

    });


    if(
        [...classes]
        .includes(
            currentClass
        )
    ){

        classFilter.value =
            currentClass;

    }


    if(
        [...sections]
        .includes(
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

if(searchInput){

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


if(eventFilter){

    eventFilter.addEventListener(
        "change",
        applyFilters
    );

}


if(classFilter){

    classFilter.addEventListener(
        "change",
        applyFilters
    );

}


if(sectionFilter){

    sectionFilter.addEventListener(
        "change",
        applyFilters
    );

}


if(clearFilters){

    clearFilters.addEventListener(
        "click",
        () => {

            if(searchInput){

                searchInput.value = "";

            }


            if(eventFilter){

                eventFilter.value =
                    "all";

            }


            if(classFilter){

                classFilter.value =
                    "all";

            }


            if(sectionFilter){

                sectionFilter.value =
                    "all";

            }


            applyFilters();

        }
    );

}


/* =====================================================
   APPLY FILTERS
===================================================== */

function applyFilters(){

    const search =
        searchInput
        ? searchInput.value
            .trim()
            .toLowerCase()
        : "";


    const selectedEvent =
        eventFilter
        ? eventFilter.value
        : "all";


    const selectedClass =
        classFilter
        ? classFilter.value
        : "all";


    const selectedSection =
        sectionFilter
        ? sectionFilter.value
        : "all";


    filteredRegistrations = {};


    Object.entries(
        registrations || {}
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

                data.email,

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
                ).trim() ===
                selectedClass;


            const matchesSection =
                selectedSection === "all" ||
                normalize(
                    data.Section
                ).trim() ===
                selectedSection;


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

    if(
        !tableBody ||
        !tableEmpty
    ){

        return;

    }


    const entries =
        Object.entries(
            filteredRegistrations || {}
        );


    if(resultCount){

        resultCount.textContent =
            `${entries.length} registration${entries.length === 1 ? "" : "s"}`;

    }


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
                getTimestamp(
                    a[1].registrationDate
                );


            const dateB =
                getTimestamp(
                    b[1].registrationDate
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


            const eventHTML =
                events.length
                ? events
                    .map(
                        event => `
                            <span class="event-tag">
                                ${escapeHTML(event)}
                            </span>
                        `
                    )
                    .join("")
                : "-";


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
                            type="button"
                            class="action-btn view"
                            title="View Details"
                            data-view="${escapeAttr(key)}">

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            type="button"
                            class="action-btn edit"
                            title="Edit Registration"
                            data-edit="${escapeAttr(key)}">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
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

        showToast(
            "Registration not found.",
            "error"
        );

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


    for(
        let i = 2;
        i <= 5;
        i++
    ){

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

                        <label>
                            Name
                        </label>

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <label>
                            Class
                        </label>

                        <strong>
                            ${escapeHTML(
                                memberClass || "-"
                            )}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <label>
                            Section
                        </label>

                        <strong>
                            ${escapeHTML(
                                memberSection || "-"
                            )}
                        </strong>

                    </div>

                </div>

            </div>

        `;

    }


    if(!detailsContent){

        return;

    }


    detailsContent.innerHTML = `

        <div class="detail-section">

            <h3>
                Registration Information
            </h3>


            <div class="detail-grid">

                <div class="detail-item">

                    <label>
                        Registration ID
                    </label>

                    <strong>
                        ${escapeHTML(id)}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Registration Date
                    </label>

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

                    <label>
                        Team Leader
                    </label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.StudentName
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Team Name
                    </label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.TeamName
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Class
                    </label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.Class
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Section
                    </label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.Section
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Mobile
                    </label>

                    <strong>
                        ${escapeHTML(
                            normalize(
                                data.MobileNumber
                            ) || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Email
                    </label>

                    <strong>
                        ${escapeHTML(
                            email || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Team Size
                    </label>

                    <strong>
                        ${getTeamSize(data)}
                        Member(s)
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
                    ? events
                        .map(
                            event => `
                                <span class="event-tag">
                                    ${escapeHTML(event)}
                                </span>
                            `
                        )
                        .join("")
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
                        ) ||
                        "No remarks."
                    )}

                </strong>

            </div>

        </div>

    `;


    if(detailsModal){

        detailsModal.classList.remove(
            "hidden"
        );

    }

}


/* =====================================================
   DELETE FROM DETAILS MODAL
===================================================== */

if(modalDeleteBtn){

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

}


/* =====================================================
   OPEN EDIT MODAL
===================================================== */

function openEdit(key){

    const data =
        registrations[key];


    if(!data){

        showToast(
            "Registration not found.",
            "error"
        );

        return;

    }


    if(editKey){

        editKey.value =
            key;

    }


    if(editStudentName){

        editStudentName.value =
            normalize(
                data.StudentName
            );

    }


    if(editTeamName){

        editTeamName.value =
            normalize(
                data.TeamName
            );

    }


    if(editClass){

        editClass.value =
            normalize(
                data.Class
            );

    }


    if(editSection){

        editSection.value =
            normalize(
                data.Section
            );

    }


    if(editMobile){

        editMobile.value =
            normalize(
                data.MobileNumber
            );

    }


    if(editEmail){

        editEmail.value =
            getRegistrationEmail(data);

    }


    if(editRemarks){

        editRemarks.value =
            normalize(
                data.Remarks
            );

    }


    if(editModal){

        editModal.classList.remove(
            "hidden"
        );

    }

}


/* =====================================================
   SAVE EDIT
===================================================== */

if(editForm){

    editForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const key =
                editKey
                ? editKey.value
                : "";


            if(!key){

                showToast(
                    "Invalid registration.",
                    "error"
                );

                return;

            }


            const saveButton =
                document.getElementById(
                    "saveEditBtn"
                );


            if(saveButton){

                saveButton.disabled = true;

                saveButton.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Saving...
                `;

            }


            try{

                const updates = {

                    StudentName:
                        editStudentName
                        ? editStudentName.value.trim()
                        : "",

                    TeamName:
                        editTeamName
                        ? editTeamName.value.trim()
                        : "",

                    Class:
                        editClass
                        ? editClass.value.trim()
                        : "",

                    Section:
                        editSection
                        ? editSection.value.trim()
                        : "",

                    MobileNumber:
                        editMobile
                        ? editMobile.value.trim()
                        : "",

                    EmailAddress:
                        editEmail
                        ? editEmail.value.trim()
                        : "",

                    Remarks:
                        editRemarks
                        ? editRemarks.value.trim()
                        : ""

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


                if(editModal){

                    editModal.classList.add(
                        "hidden"
                    );

                }


                updateDashboard();

                renderRecent();

                renderTable();

                updateEventPage();

                populateFilters();


                showToast(
                    "Registration updated successfully.",
                    "success"
                );

            }
            catch(error){

                console.error(
                    "Update error:",
                    error
                );


                showToast(
                    "Unable to update registration.",
                    "error"
                );

            }
            finally{

                if(saveButton){

                    saveButton.disabled = false;

                    saveButton.innerHTML = `
                        <i class="fa-solid fa-floppy-disk"></i>
                        Save Changes
                    `;

                }

            }

        }
    );

}


/* =====================================================
   DELETE REGISTRATION
===================================================== */

async function deleteRegistration(key){

    const data =
        registrations[key];


    if(!data){

        showToast(
            "Registration not found.",
            "error"
        );

        return;

    }


    const name =
        normalize(
            data.StudentName
        ) ||
        "this registration";


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


        if(detailsModal){

            detailsModal.classList.add(
                "hidden"
            );

        }


        if(editModal){

            editModal.classList.add(
                "hidden"
            );

        }


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

        console.error(
            "Delete error:",
            error
        );


        showToast(
            "Unable to delete registration.",
            "error"
        );

    }

}


/* =====================================================
   EVENT PAGE
===================================================== */

function updateEventPage(){

    const counts = {

        race: 0,

        war: 0,

        tug: 0,

        soccer: 0

    };


    Object.values(
        registrations || {}
    )
    .forEach(data => {

        getEvents(data)
        .forEach(event => {

            const eventName =
                event
                .trim()
                .toLowerCase();


            if(
                eventName ===
                "robo race"
            ){

                counts.race++;

            }


            if(
                eventName ===
                "robo war"
            ){

                counts.war++;

            }


            if(
                eventName ===
                "robo tug of war"
            ){

                counts.tug++;

            }


            if(
                eventName ===
                "robo soccer"
            ){

                counts.soccer++;

            }

        });

    });


    setText(
        "eventRaceCount",
        counts.race
    );


    setText(
        "eventWarCount",
        counts.war
    );


    setText(
        "eventTugCount",
        counts.tug
    );


    setText(
        "eventSoccerCount",
        counts.soccer
    );

}


/* =====================================================
   REFRESH BUTTONS
===================================================== */

const dashboardRefresh =
    document.getElementById(
        "dashboardRefresh"
    );


if(dashboardRefresh){

    dashboardRefresh.addEventListener(
        "click",
        loadRegistrations
    );

}


const refreshRegistrations =
    document.getElementById(
        "refreshRegistrations"
    );


if(refreshRegistrations){

    refreshRegistrations.addEventListener(
        "click",
        loadRegistrations
    );

}


/* =====================================================
   EXPORT CSV
===================================================== */

const exportCsv =
    document.getElementById(
        "exportCsv"
    );


if(exportCsv){

    exportCsv.addEventListener(
        "click",
        () => {

            exportCSV(
                filteredRegistrations
            );

        }
    );

}


const exportDashboard =
    document.getElementById(
        "exportDashboard"
    );


if(exportDashboard){

    exportDashboard.addEventListener(
        "click",
        () => {

            exportCSV(
                registrations
            );

        }
    );

}


/* =====================================================
   EXPORT CSV FUNCTION
===================================================== */

function exportCSV(dataObject){

    const entries =
        Object.entries(
            dataObject || {}
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


                getEvents(data)
                .join(" | "),


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
            [
                "\ufeff" + csv
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
        "APS_Robotics_Registrations_2026.csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "CSV exported successfully.",
        "success"
    );

}


/* =====================================================
   CSV ESCAPE
===================================================== */

function csvEscape(value){

    const string =
        normalize(value);


    return `"${string
        .replace(
            /"/g,
            '""'
        )}"`;

}


/* =====================================================
   MODAL CLOSE BUTTONS
===================================================== */

document
.querySelectorAll("[data-close-modal]")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            if(detailsModal){

                detailsModal.classList.add(
                    "hidden"
                );

            }


            if(editModal){

                editModal.classList.add(
                    "hidden"
                );

            }

        }
    );

});


/* =====================================================
   DETAILS MODAL BACKDROP
===================================================== */

if(detailsModal){

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

}


/* =====================================================
   EDIT MODAL BACKDROP
===================================================== */

if(editModal){

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

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
){

    if(
        !toast ||
        !toastMessage
    ){

        return;

    }


    toastMessage.textContent =
        message;


    const icon =
        toast.querySelector("i");


    if(icon){

        icon.className =
            type === "error"
            ? "fa-solid fa-circle-exclamation"
            : "fa-solid fa-circle-check";


        icon.style.color =
            type === "error"
            ? "#ff6278"
            : "#00ff99";

    }


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

    if(
        value === undefined ||
        value === null ||
        value === ""
    ){

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
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


/* =====================================================
   TIMESTAMP HELPER
===================================================== */

function getTimestamp(value){

    if(
        value === undefined ||
        value === null ||
        value === ""
    ){

        return 0;

    }


    const timestamp =
        new Date(value)
        .getTime();


    return Number.isNaN(
        timestamp
    )
    ? 0
    : timestamp;

}


/* =====================================================
   TEXT HELPER
===================================================== */

function setText(
    elementId,
    value
){

    const element =
        document.getElementById(
            elementId
        );


    if(element){

        element.textContent =
            value;

    }

}


/* =====================================================
   NATURAL SORT
===================================================== */

function naturalSort(a,b){

    return String(a)
        .localeCompare(
            String(b),
            undefined,
            {
                numeric: true,
                sensitivity: "base"
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

                    "&":
                        "&amp;",

                    "<":
                        "&lt;",

                    ">":
                        "&gt;",

                    '"':
                        "&quot;",

                    "'":
                        "&#039;"

                };


                return entities[
                    character
                ];

            }
        );

}


/* =====================================================
   ATTRIBUTE SECURITY
===================================================== */

function escapeAttr(value){

    return escapeHTML(value);

}


/* =====================================================
   INITIAL STATE
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
            event.key ===
            "Escape"
        ){

            if(detailsModal){

                detailsModal.classList.add(
                    "hidden"
                );

            }


            if(editModal){

                editModal.classList.add(
                    "hidden"
                );

            }

        }

    }
);


/* =====================================================
   END OF ADMIN.JS
===================================================== */
