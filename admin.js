/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   FINAL ADMIN JAVASCRIPT

   Firebase Authentication
   Firebase Realtime Database
   Firestore Email Queue

   Database:
       registrations/

   Firestore:
       mail/
===================================================== */


/* =====================================================
   FIREBASE IMPORTS
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
   FIREBASE INITIALIZATION
===================================================== */

const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const database =
    getDatabase(app);


const firestore =
    getFirestore(app);



/* =====================================================
   APPLICATION STATE
===================================================== */

let registrations = {};

let filteredRegistrations = {};

let currentRegistrationKey = null;

let toastTimer = null;

let isLoading = false;



/* =====================================================
   DOM HELPER
===================================================== */

const $ = id =>
    document.getElementById(id);



/* =====================================================
   DOM ELEMENTS
===================================================== */

const loginScreen =
    $("loginScreen");


const adminApp =
    $("adminApp");


const loginForm =
    $("loginForm");


const loginEmail =
    $("loginEmail");


const loginPassword =
    $("loginPassword");


const loginBtn =
    $("loginBtn");


const loginError =
    $("loginError");


const togglePassword =
    $("togglePassword");


const adminEmail =
    $("adminEmail");


const logoutBtn =
    $("logoutBtn");


const sidebar =
    $("sidebar");


const sidebarToggle =
    $("sidebarToggle");


const tableBody =
    $("registrationTableBody");


const tableEmpty =
    $("tableEmpty");


const resultCount =
    $("resultCount");


const tableStatus =
    $("tableStatus");


const searchInput =
    $("searchInput");


const eventFilter =
    $("eventFilter");


const classFilter =
    $("classFilter");


const sectionFilter =
    $("sectionFilter");


const clearFilters =
    $("clearFilters");


const detailsModal =
    $("detailsModal");


const editModal =
    $("editModal");


const detailsContent =
    $("detailsContent");


const modalDeleteBtn =
    $("modalDeleteBtn");


const editForm =
    $("editForm");


const editKey =
    $("editKey");


const editStudentName =
    $("editStudentName");


const editTeamName =
    $("editTeamName");


const editClass =
    $("editClass");


const editSection =
    $("editSection");


const editMobile =
    $("editMobile");


const editEmail =
    $("editEmail");


const editRemarks =
    $("editRemarks");


const toast =
    $("toast");


const toastMessage =
    $("toastMessage");



/* =====================================================
   SAFE DOM EVENT HELPER
===================================================== */

function on(element, event, handler){

    if(element){

        element.addEventListener(
            event,
            handler
        );

    }

}



/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
    auth,
    async user => {

        if(user){

            loginScreen.classList.add(
                "hidden"
            );

            adminApp.classList.remove(
                "hidden"
            );

            adminEmail.textContent =
                user.email ||
                "Authenticated Admin";


            await loadRegistrations();

        }
        else{

            loginScreen.classList.remove(
                "hidden"
            );

            adminApp.classList.add(
                "hidden"
            );

            registrations = {};

            filteredRegistrations = {};

        }

    }
);



/* =====================================================
   LOGIN
===================================================== */

on(
    loginForm,
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

            console.error(
                "Login error:",
                error
            );

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

    const errors = {

        "auth/invalid-credential":
            "Invalid email or password.",

        "auth/user-not-found":
            "Admin account was not found.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/too-many-requests":
            "Too many login attempts. Please try again later.",

        "auth/network-request-failed":
            "Network error. Check your internet connection.",

        "auth/user-disabled":
            "This admin account has been disabled."

    };


    return errors[code] ||
        "Login failed. Please check your credentials.";

}



/* =====================================================
   PASSWORD TOGGLE
===================================================== */

on(
    togglePassword,
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

on(
    logoutBtn,
    "click",
    async () => {

        try{

            await signOut(auth);

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



/* =====================================================
   NAVIGATION
===================================================== */

document
.querySelectorAll(".nav-item")
.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.page
                );

                sidebar.classList.remove(
                    "open"
                );

            }
        );

    }
);


document
.querySelectorAll("[data-page-target]")
.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.pageTarget
                );

            }
        );

    }
);



function showPage(pageName){

    document
    .querySelectorAll(".page")
    .forEach(
        page => {

            page.classList.remove(
                "active-page"
            );

        }
    );


    const target =
        $(
            pageName + "Page"
        );


    if(target){

        target.classList.add(
            "active-page"
        );

    }


    document
    .querySelectorAll(".nav-item")
    .forEach(
        item => {

            item.classList.toggle(
                "active",
                item.dataset.page === pageName
            );

        }
    );


    const titles = {

        dashboard:
            "Dashboard",

        registrations:
            "Registrations",

        events:
            "Events"

    };


    $("pageTitle").textContent =
        titles[pageName] ||
        "Dashboard";


    if(pageName === "registrations"){

        renderTable();

    }

}



/* =====================================================
   SIDEBAR
===================================================== */

on(
    sidebarToggle,
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

    if(isLoading){

        return;

    }


    isLoading = true;


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

            const value =
                snapshot.val();


            registrations =
                value &&
                typeof value === "object"
                    ? value
                    : {};

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


        tableStatus.textContent =
            "Database synced";


    }
    catch(error){

        console.error(
            "Database error:",
            error
        );


        registrations = {};

        filteredRegistrations = {};


        tableStatus.textContent =
            "Database error";


        renderTable();


        showToast(
            getDatabaseError(error),
            "error"
        );

    }
    finally{

        isLoading = false;

    }

}



/* =====================================================
   DATABASE ERROR
===================================================== */

function getDatabaseError(error){

    if(
        error &&
        error.code ===
        "PERMISSION_DENIED"
    ){

        return "Firebase permission denied. Check Realtime Database rules.";

    }


    if(
        error &&
        error.code ===
        "NETWORK_ERROR"
    ){

        return "Network error while loading registrations.";

    }


    return "Unable to load registrations.";

}



/* =====================================================
   NORMALIZE
===================================================== */

function normalize(value){

    if(
        value === undefined ||
        value === null
    ){

        return "";

    }


    if(Array.isArray(value)){

        return value
            .map(item => normalize(item))
            .filter(Boolean)
            .join(", ");

    }


    if(
        typeof value === "object"
    ){

        return Object.values(value)
            .map(item => normalize(item))
            .filter(Boolean)
            .join(", ");

    }


    return String(value);

}



/* =====================================================
   EVENTS
===================================================== */

function getEvents(data){

    if(!data){

        return [];

    }


    let events =
        data.Events ??
        data.events ??
        data.Event ??
        data.event;


    if(!events){

        return [];

    }


    if(Array.isArray(events)){

        return events
            .map(item => normalize(item).trim())
            .filter(Boolean);

    }


    if(typeof events === "object"){

        return Object.values(events)
            .map(item => normalize(item).trim())
            .filter(Boolean);

    }


    return String(events)
        .split(
            /\s*(?:,|\||;|\n)\s*/
        )
        .map(
            event => event.trim()
        )
        .filter(Boolean);

}



/* =====================================================
   TEAM SIZE
===================================================== */

function getTeamSize(data){

    if(!data){

        return 0;

    }


    const explicit =
        Number(
            data.TeamSize ??
            data.teamSize
        );


    if(
        Number.isFinite(explicit) &&
        explicit > 0
    ){

        return explicit;

    }


    let count = 0;


    const leader =
        normalize(
            data.StudentName ??
            data.studentName ??
            data.TeamLeader
        ).trim();


    if(leader){

        count = 1;

    }


    for(
        let i = 2;
        i <= 5;
        i++
    ){

        const member =
            normalize(
                data[`Member${i}Name`] ??
                data[`member${i}Name`]
            ).trim();


        if(member){

            count++;

        }

    }


    return count || 1;

}



/* =====================================================
   REGISTRATION EMAIL
===================================================== */

function getRegistrationEmail(data){

    if(!data){

        return "";

    }


    return normalize(

        data.EmailAddress ??
        data.Email ??
        data.email ??
        data.emailAddress

    ).trim();

}



/* =====================================================
   TEAM LEADER
===================================================== */

function getStudentName(data){

    return normalize(

        data.StudentName ??
        data.studentName ??
        data.TeamLeader ??
        data.teamLeader

    ).trim();

}



/* =====================================================
   TEAM NAME
===================================================== */

function getTeamName(data){

    return normalize(

        data.TeamName ??
        data.teamName

    ).trim();

}



/* =====================================================
   CLASS
===================================================== */

function getClass(data){

    return normalize(

        data.Class ??
        data.class

    ).trim();

}



/* =====================================================
   SECTION
===================================================== */

function getSection(data){

    return normalize(

        data.Section ??
        data.section

    ).trim();

}



/* =====================================================
   MOBILE
===================================================== */

function getMobile(data){

    return normalize(

        data.MobileNumber ??
        data.Mobile ??
        data.mobileNumber ??
        data.Phone

    ).trim();

}



/* =====================================================
   REGISTRATION ID
===================================================== */

function getRegistrationId(
    key,
    data
){

    return normalize(

        data.registrationId ??
        data.RegistrationID ??
        data.registrationID ??
        data.id

    ).trim() || key;

}



/* =====================================================
   REGISTRATION DATE
===================================================== */

function getRegistrationDate(data){

    return (
        data.registrationDate ??
        data.RegistrationDate ??
        data.createdAt ??
        data.created_at ??
        ""
    );

}



/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard(){

    const list =
        Object.values(
            registrations
        );


    const total =
        list.length;


    $("totalRegistrations").textContent =
        total;


    $("totalTeams").textContent =
        total;


    const counts =
        getEventCounts();


    $("raceCount").textContent =
        counts.race;


    $("warCount").textContent =
        counts.war;


    $("tugCount").textContent =
        counts.tug;


    $("soccerCount").textContent =
        counts.soccer;


    $("eventRaceCount").textContent =
        counts.race;


    $("eventWarCount").textContent =
        counts.war;


    $("eventTugCount").textContent =
        counts.tug;


    $("eventSoccerCount").textContent =
        counts.soccer;

}



/* =====================================================
   EVENT COUNTS
===================================================== */

function getEventCounts(){

    const counts = {

        race: 0,

        war: 0,

        tug: 0,

        soccer: 0

    };


    Object.values(
        registrations
    )
    .forEach(
        data => {

            getEvents(data)
            .forEach(
                event => {

                    const normalized =
                        event
                        .toLowerCase()
                        .replace(/\s+/g," ")
                        .trim();


                    if(
                        normalized ===
                        "robo race"
                    ){

                        counts.race++;

                    }


                    else if(
                        normalized ===
                        "robo war"
                    ){

                        counts.war++;

                    }


                    else if(
                        normalized ===
                        "robo tug of war"
                    ){

                        counts.tug++;

                    }


                    else if(
                        normalized ===
                        "robo soccer"
                    ){

                        counts.soccer++;

                    }

                }
            );

        }
    );


    return counts;

}



/* =====================================================
   RECENT REGISTRATIONS
===================================================== */

function renderRecent(){

    const container =
        $("recentRegistrations");


    if(!container){

        return;

    }


    const entries =
        Object.entries(
            registrations
        )
        .sort(
            ([,a],[,b]) =>
                getTimestamp(b) -
                getTimestamp(a)
        )
        .slice(
            0,
            6
        );


    if(entries.length === 0){

        container.innerHTML = `

            <div class="table-empty">

                <div class="empty-icon">

                    <i class="fa-solid fa-folder-open"></i>

                </div>

                <h3>
                    No registrations yet
                </h3>

                <p>
                    New registrations will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        entries
        .map(
            ([key,data]) => {

                const id =
                    getRegistrationId(
                        key,
                        data
                    );


                const name =
                    getStudentName(data) ||
                    "Unknown Student";


                const team =
                    getTeamName(data) ||
                    "Unnamed Team";


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
                            type="button"
                            title="View Details"
                            data-view="${escapeAttr(key)}"
                        >

                            <i class="fa-solid fa-eye"></i>

                        </button>

                    </div>

                `;

            }
        )
        .join("");


    container
    .querySelectorAll("[data-view]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openDetails(
                        button.dataset.view
                    );

                }
            );

        }
    );

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
    .forEach(
        data => {

            const className =
                getClass(data);


            const section =
                getSection(data);


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

        }
    );


    const currentClass =
        classFilter.value;


    const currentSection =
        sectionFilter.value;


    classFilter.innerHTML =
        `
            <option value="all">
                All Classes
            </option>
        `;


    [...classes]
    .sort(
        naturalSort
    )
    .forEach(
        value => {

            classFilter.innerHTML += `

                <option
                    value="${escapeAttr(value)}"
                >
                    ${escapeHTML(value)}
                </option>

            `;

        }
    );


    sectionFilter.innerHTML =
        `
            <option value="all">
                All Sections
            </option>
        `;


    [...sections]
    .sort(
        naturalSort
    )
    .forEach(
        value => {

            sectionFilter.innerHTML += `

                <option
                    value="${escapeAttr(value)}"
                >
                    ${escapeHTML(value)}
                </option>

            `;

        }
    );


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
   FILTER EVENTS
===================================================== */

on(
    searchInput,
    "input",
    applyFilters
);


on(
    eventFilter,
    "change",
    applyFilters
);


on(
    classFilter,
    "change",
    applyFilters
);


on(
    sectionFilter,
    "change",
    applyFilters
);


on(
    clearFilters,
    "click",
    () => {

        searchInput.value =
            "";

        eventFilter.value =
            "all";

        classFilter.value =
            "all";

        sectionFilter.value =
            "all";


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


    filteredRegistrations =
        {};


    Object.entries(
        registrations
    )
    .forEach(
        ([key,data]) => {

            const events =
                getEvents(data);


            const searchable = [

                getRegistrationId(
                    key,
                    data
                ),

                getStudentName(data),

                getTeamName(data),

                getClass(data),

                getSection(data),

                getMobile(data),

                getRegistrationEmail(data),

                events.join(" "),

                normalize(
                    data.Remarks
                )

            ]
            .join(" ")
            .toLowerCase();


            const matchesSearch =
                !search ||
                searchable.includes(
                    search
                );


            const matchesEvent =
                selectedEvent === "all" ||
                events.some(
                    event =>
                        event
                        .toLowerCase()
                        .trim() ===
                        selectedEvent
                        .toLowerCase()
                        .trim()
                );


            const matchesClass =
                selectedClass === "all" ||
                getClass(data) ===
                selectedClass;


            const matchesSection =
                selectedSection === "all" ||
                getSection(data) ===
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

    if(!tableBody){

        return;

    }


    const entries =
        Object.entries(
            filteredRegistrations
        );


    resultCount.textContent =
        `${entries.length} registration${entries.length === 1 ? "" : "s"}`;


    tableBody.innerHTML =
        "";


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
        ([,a],[,b]) =>
            getTimestamp(b) -
            getTimestamp(a)
    );


    entries.forEach(
        ([key,data]) => {

            const id =
                getRegistrationId(
                    key,
                    data
                );


            const name =
                getStudentName(data) ||
                "-";


            const team =
                getTeamName(data) ||
                "Unnamed Team";


            const className =
                getClass(data) ||
                "-";


            const section =
                getSection(data) ||
                "-";


            const mobile =
                getMobile(data) ||
                "-";


            const teamSize =
                getTeamSize(data);


            const date =
                formatDate(
                    getRegistrationDate(data)
                );


            const events =
                getEvents(data);


            const email =
                getRegistrationEmail(data);


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


            const emailButton =
                email
                    ? `

                        <button
                            class="action-btn email"
                            type="button"
                            title="Send Confirmation Email"
                            data-email="${escapeAttr(key)}"
                        >

                            <i class="fa-solid fa-envelope"></i>

                        </button>

                    `
                    : "";


            const row =
                document.createElement(
                    "tr"
                );


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
                            type="button"
                            title="View Details"
                            data-view="${escapeAttr(key)}"
                        >

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            class="action-btn edit"
                            type="button"
                            title="Edit Registration"
                            data-edit="${escapeAttr(key)}"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        ${emailButton}


                        <button
                            class="action-btn delete"
                            type="button"
                            title="Delete Registration"
                            data-delete="${escapeAttr(key)}"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    attachTableActions();

}



/* =====================================================
   TABLE ACTIONS
===================================================== */

function attachTableActions(){

    tableBody
    .querySelectorAll("[data-view]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openDetails(
                        button.dataset.view
                    );

                }
            );

        }
    );


    tableBody
    .querySelectorAll("[data-edit]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openEdit(
                        button.dataset.edit
                    );

                }
            );

        }
    );


    tableBody
    .querySelectorAll("[data-email]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    sendConfirmationEmail(
                        button.dataset.email
                    );

                }
            );

        }
    );


    tableBody
    .querySelectorAll("[data-delete]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    deleteRegistration(
                        button.dataset.delete
                    );

                }
            );

        }
    );

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


    const id =
        getRegistrationId(
            key,
            data
        );


    const email =
        getRegistrationEmail(data);


    const events =
        getEvents(data);


    const membersHTML =
        buildMembersHTML(data);


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
                                getRegistrationDate(data)
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
                            getStudentName(data) ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Team Name
                    </label>

                    <strong>
                        ${escapeHTML(
                            getTeamName(data) ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Class
                    </label>

                    <strong>
                        ${escapeHTML(
                            getClass(data) ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Section
                    </label>

                    <strong>
                        ${escapeHTML(
                            getSection(data) ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Mobile
                    </label>

                    <strong>
                        ${escapeHTML(
                            getMobile(data) ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Email
                    </label>

                    <strong>
                        ${escapeHTML(
                            email ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <label>
                        Team Size
                    </label>

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


        <div class="detail-section">

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
                                id="sendDetailEmailBtn"
                            >

                                <i class="fa-solid fa-paper-plane"></i>

                                Send Confirmation Email

                            </button>

                        `

                        : `

                            <p class="email-warning">

                                <i class="fa-solid fa-triangle-exclamation"></i>

                                No email address is available.

                            </p>

                        `
                }

            </div>

        </div>

    `;


    detailsModal.classList.remove(
        "hidden"
    );


    const sendButton =
        $("sendDetailEmailBtn");


    on(
        sendButton,
        "click",
        () => {

            sendConfirmationEmail(
                key
            );

        }
    );

}



/* =====================================================
   BUILD TEAM MEMBERS
===================================================== */

function buildMembersHTML(data){

    let html = "";


    for(
        let i = 2;
        i <= 5;
        i++
    ){

        const name =
            normalize(
                data[`Member${i}Name`] ??
                data[`member${i}Name`]
            );


        if(!name){

            continue;

        }


        const memberClass =
            normalize(
                data[`Member${i}Class`] ??
                data[`member${i}Class`]
            );


        const memberSection =
            normalize(
                data[`Member${i}Section`] ??
                data[`member${i}Section`]
            );


        html += `

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
                                memberClass ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <label>
                            Section
                        </label>

                        <strong>
                            ${escapeHTML(
                                memberSection ||
                                "-"
                            )}
                        </strong>

                    </div>

                </div>

            </div>

        `;

    }


    return html;

}



/* =====================================================
   DELETE FROM MODAL
===================================================== */

on(
    modalDeleteBtn,
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
   OPEN EDIT
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


    editKey.value =
        key;


    editStudentName.value =
        getStudentName(data);


    editTeamName.value =
        getTeamName(data);


    editClass.value =
        getClass(data);


    editSection.value =
        getSection(data);


    editMobile.value =
        getMobile(data);


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

on(
    editForm,
    "submit",
    async event => {

        event.preventDefault();


        const key =
            editKey.value;


        if(!key){

            return;

        }


        const saveButton =
            $("saveEditBtn");


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


            applyFilters();


            updateDashboard();

            renderRecent();

            updateEventPage();


            editModal.classList.add(
                "hidden"
            );


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

    const data =
        registrations[key];


    if(!data){

        return;

    }


    const name =
        getStudentName(data) ||
        "this registration";


    const id =
        getRegistrationId(
            key,
            data
        );


    const confirmed =
        confirm(
            `Delete this registration?\n\nStudent: ${name}\nRegistration ID: ${id}\n\nThis action cannot be undone.`
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


        editModal.classList.add(
            "hidden"
        );


        updateDashboard();

        populateFilters();

        applyFilters();

        renderRecent();

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
   CONFIRMATION EMAIL
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
            "No email address found.",
            "error"
        );

        return;

    }


    const registrationID =
        getRegistrationId(
            key,
            data
        );


    const studentName =
        getStudentName(data) ||
        "Participant";


    const teamName =
        getTeamName(data) ||
        "Not provided";


    const className =
        getClass(data) ||
        "-";


    const section =
        getSection(data) ||
        "-";


    const mobile =
        getMobile(data) ||
        "-";


    const events =
        getEvents(data);


    const teamSize =
        getTeamSize(data);


    const registrationDate =
        formatDate(
            getRegistrationDate(data)
        );


    const members =
        getEmailMembers(data);


    const eventsHTML =
        events.length
            ? events
                .map(
                    event => `

                        <span
                            style="
                                display:inline-block;
                                background:#e8fbff;
                                color:#087f8c;
                                border:1px solid #b8edf3;
                                border-radius:20px;
                                padding:7px 13px;
                                margin:4px;
                                font-size:13px;
                                font-weight:600;
                            "
                        >

                            ${escapeHTML(event)}

                        </span>

                    `
                )
                .join("")
            : "No event selected";


    const membersHTML =
        buildEmailMembersHTML(
            members
        );


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
buildEmailHTML({

        registrationID,

        studentName,

        teamName,

        className,

        section,

        mobile,

        teamSize,

        registrationDate,

        eventsHTML,

        membersHTML

    });


    const confirmed =
        confirm(
            `Send confirmation email?\n\nTo: ${email}\nRegistration ID: ${registrationID}`
        );


    if(!confirmed){

        return;

    }


    try{

        showToast(
            "Queueing confirmation email...",
            "success"
        );


        await addDoc(

            collection(
                firestore,
                "mail"
            ),

            {

                to: email,

                message: {

                    subject,

                    text,

                    html

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
            "Email queue error:",
            error
        );


        showToast(
            getEmailError(error),
            "error"
        );

    }

}



/* =====================================================
   EMAIL ERROR
===================================================== */

function getEmailError(error){

    if(
        error &&
        (
            error.code ===
            "permission-denied" ||
            error.code ===
            "PERMISSION_DENIED"
        )
    ){

        return "Email queue permission denied. Check Firestore rules.";

    }


    return "Could not queue confirmation email.";

}



/* =====================================================
   EMAIL MEMBERS
===================================================== */

function getEmailMembers(data){

    const members = [];


    for(
        let i = 2;
        i <= 5;
        i++
    ){

        const name =
            normalize(
                data[`Member${i}Name`] ??
                data[`member${i}Name`]
            );


        if(name){

            members.push({

                number: i,

                name,

                className:
                    normalize(
                        data[`Member${i}Class`] ??
                        data[`member${i}Class`]
                    ) || "-",

                section:
                    normalize(
                        data[`Member${i}Section`] ??
                        data[`member${i}Section`]
                    ) || "-"

            });

        }

    }


    return members;

}



/* =====================================================
   EMAIL MEMBER TABLE
===================================================== */

function buildEmailMembersHTML(
    members
){

    if(!members.length){

        return `
            <p>
                No additional team members were registered.
            </p>
        `;

    }


    return `

        <table
            style="
                width:100%;
                border-collapse:collapse;
                margin-top:12px;
            "
        >

            <thead>

                <tr>

                    <th
                        style="
                            text-align:left;
                            padding:9px;
                            background:#f1f5f9;
                            border:1px solid #e2e8f0;
                        "
                    >
                        Member
                    </th>


                    <th
                        style="
                            text-align:left;
                            padding:9px;
                            background:#f1f5f9;
                            border:1px solid #e2e8f0;
                        "
                    >
                        Name
                    </th>


                    <th
                        style="
                            text-align:left;
                            padding:9px;
                            background:#f1f5f9;
                            border:1px solid #e2e8f0;
                        "
                    >
                        Class
                    </th>


                    <th
                        style="
                            text-align:left;
                            padding:9px;
                            background:#f1f5f9;
                            border:1px solid #e2e8f0;
                        "
                    >
                        Section
                    </th>

                </tr>

            </thead>


            <tbody>

                ${members
                    .map(
                        member => `

                            <tr>

                                <td
                                    style="
                                        padding:9px;
                                        border:1px solid #e2e8f0;
                                    "
                                >
                                    Member ${member.number}
                                </td>


                                <td
                                    style="
                                        padding:9px;
                                        border:1px solid #e2e8f0;
                                    "
                                >
                                    ${escapeHTML(member.name)}
                                </td>


                                <td
                                    style="
                                        padding:9px;
                                        border:1px solid #e2e8f0;
                                    "
                                >
                                    ${escapeHTML(member.className)}
                                </td>


                                <td
                                    style="
                                        padding:9px;
                                        border:1px solid #e2e8f0;
                                    "
                                >
                                    ${escapeHTML(member.section)}
                                </td>

                            </tr>

                        `
                    )
                    .join("")}

            </tbody>

        </table>

    `;

}



/* =====================================================
   EMAIL HTML
===================================================== */

function buildEmailHTML(data){

    return `

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
"
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding:30px 10px;"
>

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
    "
>


<tr>

<td
    style="
        background:#061a2d;
        padding:28px;
        text-align:center;
    "
>

<img
    src="https://i.ibb.co/spL8t7cv/Army-Welfare-Education-Society-logo-1.png"
    alt="APS Logo"
    style="
        width:80px;
        height:auto;
        margin-bottom:12px;
    "
>


<h1
    style="
        margin:0;
        color:#00d9ff;
        font-size:24px;
    "
>
APS ROBOTICS
</h1>


<p
    style="
        margin:6px 0 0;
        color:#ffffff;
        font-size:14px;
    "
>
CHAMPIONSHIP 2026
</p>

</td>

</tr>


<tr>

<td
    style="
        padding:32px 30px 15px;
    "
>

<h2
    style="
        margin:0 0 10px;
        color:#087f8c;
    "
>
Registration Confirmed! ✓
</h2>


<p
    style="
        line-height:1.7;
        margin:0;
    "
>
Dear
<strong>
${escapeHTML(data.studentName)}
</strong>,
</p>


<p style="line-height:1.7;">

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


<tr>

<td
    style="
        padding:0 30px 20px;
    "
>

<table
    width="100%"
    style="
        background:#f0fbfd;
        border:1px solid #c8eef3;
        border-radius:12px;
    "
>

<tr>

<td
    style="
        padding:18px;
        text-align:center;
    "
>

<p
    style="
        margin:0 0 5px;
        color:#64748b;
        font-size:12px;
        text-transform:uppercase;
    "
>
Registration ID
</p>


<strong
    style="
        font-size:22px;
        color:#087f8c;
    "
>
${escapeHTML(data.registrationID)}
</strong>

</td>

</tr>

</table>

</td>

</tr>


<tr>

<td
    style="
        padding:0 30px 25px;
    "
>

<h3
    style="
        color:#172033;
        border-bottom:2px solid #e2e8f0;
        padding-bottom:10px;
    "
>
Registration Details
</h3>


<table
    width="100%"
    style="border-collapse:collapse;"
>


${emailDetailRow(
    "Team Leader",
    data.studentName
)}


${emailDetailRow(
    "Team Name",
    data.teamName
)}


${emailDetailRow(
    "Class",
    data.className
)}


${emailDetailRow(
    "Section",
    data.section
)}


${emailDetailRow(
    "Mobile",
    data.mobile
)}


${emailDetailRow(
    "Team Size",
    `${data.teamSize} Member(s)`
)}


${emailDetailRow(
    "Registration Date",
    data.registrationDate
)}

</table>

</td>

</tr>


<tr>

<td
    style="
        padding:0 30px 25px;
    "
>

<h3 style="color:#172033;">
Selected Events
</h3>


<div>

${data.eventsHTML}

</div>

</td>

</tr>


<tr>

<td
    style="
        padding:0 30px 25px;
    "
>

<h3 style="color:#172033;">
Team Members
</h3>


${data.membersHTML}

</td>

</tr>


<tr>

<td
    style="
        padding:0 30px 25px;
    "
>

<table
    width="100%"
    style="
        background:#fff8e8;
        border:1px solid #f5d78e;
        border-radius:12px;
    "
>

<tr>

<td
    style="
        padding:16px;
        line-height:1.6;
    "
>

<strong>
Important:
</strong>

Please save your Registration ID
<strong>
${escapeHTML(data.registrationID)}
</strong>
for future communication regarding the championship.

</td>

</tr>

</table>

</td>

</tr>


<tr>

<td
    style="
        background:#061a2d;
        padding:25px;
        text-align:center;
        color:#ffffff;
    "
>

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
    "
>
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

}



/* =====================================================
   EMAIL DETAIL ROW
===================================================== */

function emailDetailRow(
    label,
    value
){

    return `

        <tr>

            <td
                style="
                    padding:9px 0;
                    color:#64748b;
                    width:40%;
                "
            >

                ${escapeHTML(label)}

            </td>


            <td
                style="
                    padding:9px 0;
                    font-weight:bold;
                "
            >

                ${escapeHTML(
                    normalize(value)
                )}

            </td>

        </tr>

    `;

}



/* =====================================================
   EVENT PAGE
===================================================== */

function updateEventPage(){

    const counts =
        getEventCounts();


    $("eventRaceCount").textContent =
        counts.race;


    $("eventWarCount").textContent =
        counts.war;


    $("eventTugCount").textContent =
        counts.tug;


    $("eventSoccerCount").textContent =
        counts.soccer;

}



/* =====================================================
   REFRESH
===================================================== */

on(
    $("dashboardRefresh"),
    "click",
    loadRegistrations
);


on(
    $("refreshRegistrations"),
    "click",
    loadRegistrations
);



/* =====================================================
   EXPORT CSV
===================================================== */

on(
    $("exportCsv"),
    "click",
    () => {

        exportCSV(
            filteredRegistrations
        );

    }
);


on(
    $("exportDashboard"),
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


    entries
    .sort(
        ([,a],[,b]) =>
            getTimestamp(b) -
            getTimestamp(a)
    )
    .forEach(
        ([key,data]) => {

            rows.push([

                getRegistrationId(
                    key,
                    data
                ),

                getStudentName(data),

                getTeamName(data),

                getClass(data),

                getSection(data),

                getMobile(data),

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
                    getRegistrationDate(data)
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
        .join("\r\n");


    const blob =
        new Blob(
            [
                "\ufeff",
                csv
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
        `APS_Robotics_Registrations_2026_${getFileDate()}.csv`;


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
   FILE DATE
===================================================== */

function getFileDate(){

    const date =
        new Date();


    return date
        .toISOString()
        .slice(
            0,
            10
        );

}



/* =====================================================
   MODAL CLOSE
===================================================== */

document
.querySelectorAll("[data-close-modal]")
.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                closeModals();

            }
        );

    }
);



function closeModals(){

    detailsModal.classList.add(
        "hidden"
    );


    editModal.classList.add(
        "hidden"
    );


    currentRegistrationKey =
        null;

}



/* =====================================================
   MODAL BACKDROP
===================================================== */

on(
    detailsModal,
    "click",
    event => {

        if(
            event.target ===
            detailsModal
        ){

            closeModals();

        }

    }
);


on(
    editModal,
    "click",
    event => {

        if(
            event.target ===
            editModal
        ){

            closeModals();

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

    if(!toast){

        return;

    }


    toastMessage.textContent =
        message;


    const icon =
        toast.querySelector(
            "i"
        );


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
            3500
        );

}



/* =====================================================
   DATE/TIMESTAMP
===================================================== */

function getTimestamp(value){

    if(!value){

        return 0;

    }


    if(
        typeof value === "object" &&
        value.seconds !== undefined
    ){

        return Number(
            value.seconds
        ) * 1000;

    }


    if(
        typeof value === "number"
    ){

        return value < 10000000000
            ? value * 1000
            : value;

    }


    const timestamp =
        new Date(
            value
        ).getTime();


    return Number.isFinite(
        timestamp
    )
        ? timestamp
        : 0;

}



function formatDate(value){

    const timestamp =
        getTimestamp(value);


    if(!timestamp){

        return "-";

    }


    const date =
        new Date(
            timestamp
        );


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return normalize(value) || "-";

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



function escapeAttr(value){

    return escapeHTML(value);

}



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

            closeModals();

        }

    }
);



/* =====================================================
   INITIAL STATE
===================================================== */

registrations =
    {};


filteredRegistrations =
    {};


updateDashboard();

updateEventPage();

renderTable();



/* =====================================================
   FINAL READY MESSAGE
===================================================== */

console.log(
    "APS Robotics Championship 2026 Admin Panel initialized."
);
