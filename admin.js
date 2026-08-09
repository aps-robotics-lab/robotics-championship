/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN CONTROL CENTER

   Firebase Authentication
   Firebase Realtime Database

   Features:
   - Login
   - Auth state
   - Registration loading
   - Dashboard
   - Search
   - Filters
   - Details
   - Edit
   - Delete
   - CSV export
   - Event statistics
===================================================== */


/* =====================================================
   FIREBASE
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
   CONFIG
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


const auth =
    getAuth(app);


const database =
    getDatabase(app);


/* =====================================================
   STATE
===================================================== */

let registrations = {};

let filteredRegistrations = {};

let currentRegistrationKey = null;

let toastTimer = null;

let loadingRegistrations = false;


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
    async user => {

        if(user){

            loginScreen.classList.add("hidden");

            adminApp.classList.remove("hidden");

            if(adminEmail){

                adminEmail.textContent =
                    user.email ||
                    "Authenticated";

            }

            await loadRegistrations();

        }
        else{

            loginScreen.classList.remove("hidden");

            adminApp.classList.add("hidden");

            registrations = {};

            filteredRegistrations = {};

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

        clearLoginError();

        loginBtn.disabled = true;

        loginBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Signing in...
        `;


        try{

            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;


            if(!email || !password){

                throw {
                    code:"auth/invalid-credential"
                };

            }


            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        }
        catch(error){

            console.error(
                "Firebase authentication error:",
                error
            );

            loginError.textContent =
                authErrorMessage(error);

        }
        finally{

            loginBtn.disabled = false;

            loginBtn.innerHTML = `
                <i class="fa-solid fa-right-to-bracket"></i>
                Login
            `;

        }

    }
);


/* =====================================================
   AUTH ERROR
===================================================== */

function authErrorMessage(error){

    const code =
        error?.code || "";


    switch(code){

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/invalid-login-credentials":
            return "Invalid email or password.";

        case "auth/user-not-found":
            return "Admin account was not found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-email":
            return "Enter a valid email address.";

        case "auth/too-many-requests":
            return "Too many login attempts. Try again later.";

        case "auth/network-request-failed":
            return "Network error. Check your internet.";

        default:
            return "Login failed. Please check your credentials.";

    }

}


function clearLoginError(){

    if(loginError){

        loginError.textContent = "";

    }

}


/* =====================================================
   PASSWORD
===================================================== */

togglePassword.addEventListener(
    "click",
    () => {

        const visible =
            loginPassword.type === "text";


        loginPassword.type =
            visible
            ? "password"
            : "text";


        togglePassword.innerHTML =
            visible
            ? '<i class="fa-solid fa-eye"></i>'
            : '<i class="fa-solid fa-eye-slash"></i>';

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

        }
        catch(error){

            console.error(error);

            showToast(
                "Unable to logout.",
                "error"
            );

        }

    }
);


/* =====================================================
   SIDEBAR
===================================================== */

sidebarToggle.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle("open");

    }
);


/* =====================================================
   NAVIGATION
===================================================== */

document
.querySelectorAll(".nav-item[data-page]")
.forEach(button => {

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


function showPage(page){

    document
    .querySelectorAll(".admin-page")
    .forEach(item => {

        item.classList.remove(
            "active-page"
        );

    });


    const target =
        document.getElementById(
            `${page}Page`
        );


    if(target){

        target.classList.add(
            "active-page"
        );

    }


    document
    .querySelectorAll(
        ".nav-item[data-page]"
    )
    .forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === page
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
            titles[page] ||
            "Dashboard";

    }


    if(page === "registrations"){

        renderTable();

    }


    if(page === "events"){

        updateEventPage();

    }

}


/* =====================================================
   LOAD REGISTRATIONS
===================================================== */

async function loadRegistrations(){

    if(loadingRegistrations){

        return;

    }


    loadingRegistrations = true;


    setTableStatus(
        "Connecting..."
    );


    try{

        const currentUser =
            auth.currentUser;


        if(!currentUser){

            throw new Error(
                "Authentication required."
            );

        }


        console.log(
            "Loading Firebase path: registrations"
        );


        const registrationsRef =
            ref(
                database,
                "registrations"
            );


        const snapshot =
            await get(
                registrationsRef
            );


        console.log(
            "Firebase snapshot exists:",
            snapshot.exists()
        );


        if(snapshot.exists()){

            const rawData =
                snapshot.val();


            if(
                rawData &&
                typeof rawData === "object"
            ){

                registrations =
                    rawData;

            }
            else{

                registrations = {};

            }

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


        setTableStatus(
            snapshot.exists()
            ? "Database synced"
            : "Database connected • no records"
        );


        showToast(
            snapshot.exists()
            ? "Registrations loaded."
            : "Database connected. No registrations yet.",
            "success"
        );

    }
    catch(error){

        console.error(
            "LOAD REGISTRATIONS ERROR:",
            error
        );


        registrations = {};

        filteredRegistrations = {};


        renderTable();


        setTableStatus(
            getDatabaseErrorMessage(error)
        );


        showToast(
            getDatabaseErrorMessage(error),
            "error"
        );

    }
    finally{

        loadingRegistrations = false;

    }

}


/* =====================================================
   DATABASE ERROR
===================================================== */

function getDatabaseErrorMessage(error){

    const code =
        error?.code || "";

    const message =
        String(
            error?.message || ""
        ).toLowerCase();


    if(
        code.includes("PERMISSION_DENIED") ||
        message.includes("permission")
    ){

        return "Firebase permission denied.";

    }


    if(
        code.includes("network") ||
        message.includes("network")
    ){

        return "Network error.";

    }


    if(
        message.includes("authentication")
    ){

        return "Please login again.";

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


    if(
        events === undefined ||
        events === null
    ){

        return [];

    }


    if(Array.isArray(events)){

        return events
            .map(item =>
                normalize(item).trim()
            )
            .filter(Boolean);

    }


    if(typeof events === "object"){

        return Object.values(events)
            .map(item =>
                normalize(item).trim()
            )
            .filter(Boolean);

    }


    return String(events)
        .split(/\s*(?:,|\||;)\s*/)
        .map(item => item.trim())
        .filter(Boolean);

}


/* =====================================================
   EMAIL
===================================================== */

function getRegistrationEmail(data){

    return normalize(
        data?.EmailAddress ??
        data?.Email ??
        data?.email ??
        ""
    ).trim();

}


/* =====================================================
   TEAM SIZE
===================================================== */

function getTeamSize(data){

    if(!data){

        return 0;

    }


    const stored =
        Number(
            data.TeamSize
        );


    if(
        Number.isFinite(stored) &&
        stored > 0
    ){

        return stored;

    }


    let count = 1;


    for(
        let i = 2;
        i <= 5;
        i++
    ){

        if(
            normalize(
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

function updateDashboard(){

    const entries =
        Object.values(
            registrations
        );


    setText(
        "totalRegistrations",
        entries.length
    );


    setText(
        "totalTeams",
        entries.length
    );


    const counts =
        calculateEventCounts();


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

    updateEventPage();

}


/* =====================================================
   EVENT COUNTS
===================================================== */

function calculateEventCounts(){

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

            const clean =
                event
                .toLowerCase()
                .trim();


            if(clean === "robo race"){

                counts.race++;

            }

            else if(clean === "robo war"){

                counts.war++;

            }

            else if(
                clean === "robo tug of war"
            ){

                counts.tug++;

            }

            else if(
                clean === "robo soccer"
            ){

                counts.soccer++;

            }

        });

    });


    return counts;

}


/* =====================================================
   RECENT
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
            registrations
        )
        .sort(
            ([,a],[,b]) =>
                getTimestamp(b) -
                getTimestamp(a)
        )
        .slice(0,6);


    if(!entries.length){

        container.innerHTML = `
            <div class="admin-loading">
                <i class="fa-solid fa-folder-open"></i>
                No registrations yet.
            </div>
        `;

        return;

    }


    container.innerHTML =
        entries
        .map(([key,data]) => {

            const name =
                normalize(
                    data.StudentName
                ) ||
                "Unknown";

            const team =
                normalize(
                    data.TeamName
                ) ||
                "Unnamed Team";

            const id =
                normalize(
                    data.registrationId
                ) ||
                key;


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
                        class="action-btn"
                        data-view="${escapeAttr(key)}">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </div>

            `;

        })
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

    if(!classFilter || !sectionFilter){

        return;

    }


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
    .sort((a,b) =>
        a.localeCompare(b)
    )
    .forEach(value => {

        const option =
            document.createElement(
                "option"
            );

        option.value = value;
        option.textContent = value;

        classFilter.appendChild(
            option
        );

    });


    sectionFilter.innerHTML =
        `<option value="all">All Sections</option>`;


    [...sections]
    .sort((a,b) =>
        a.localeCompare(b)
    )
    .forEach(value => {

        const option =
            document.createElement(
                "option"
            );

        option.value = value;
        option.textContent = value;

        sectionFilter.appendChild(
            option
        );

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
   FILTER
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
    .forEach(([key,data]) => {

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
            ...events

        ]
        .map(normalize)
        .join(" ")
        .toLowerCase();


        const matchesSearch =
            !search ||
            searchable.includes(search);


        const matchesEvent =
            selectedEvent === "all" ||
            events.some(event =>
                event.trim().toLowerCase() ===
                selectedEvent.toLowerCase()
            );


        const matchesClass =
            selectedClass === "all" ||
            normalize(data.Class).trim() ===
            selectedClass;


        const matchesSection =
            selectedSection === "all" ||
            normalize(data.Section).trim() ===
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

    });


    renderTable();

}


/* =====================================================
   TABLE
===================================================== */

function renderTable(){

    if(!tableBody){

        return;

    }


    const entries =
        Object.entries(
            filteredRegistrations
        )
        .sort(
            ([,a],[,b]) =>
                getTimestamp(b) -
                getTimestamp(a)
        );


    resultCount.textContent =
        `${entries.length} registration${
            entries.length === 1
            ? ""
            : "s"
        }`;


    tableBody.innerHTML = "";


    if(!entries.length){

        tableEmpty.classList.remove(
            "hidden"
        );

        return;

    }


    tableEmpty.classList.add(
        "hidden"
    );


    entries.forEach(
        ([key,data]) => {

            const id =
                normalize(
                    data.registrationId
                ) ||
                key;

            const name =
                normalize(
                    data.StudentName
                ) ||
                "-";

            const team =
                normalize(
                    data.TeamName
                ) ||
                "-";

            const className =
                normalize(
                    data.Class
                ) ||
                "-";

            const section =
                normalize(
                    data.Section
                ) ||
                "-";

            const mobile =
                normalize(
                    data.MobileNumber
                ) ||
                "-";

            const members =
                getTeamSize(data);

            const date =
                formatDate(
                    data.registrationDate
                );

            const events =
                getEvents(data);


            const eventHTML =
                events.length
                ? events.map(event => `
                    <span class="event-tag">
                        ${escapeHTML(event)}
                    </span>
                `).join("")
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
                    ${members}
                </td>

                <td>
                    ${escapeHTML(date)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="action-btn"
                            data-view="${escapeAttr(key)}"
                            title="View">

                            <i class="fa-solid fa-eye"></i>

                        </button>

                        <button
                            class="action-btn"
                            data-edit="${escapeAttr(key)}"
                            title="Edit">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button
                            class="action-btn delete"
                            data-delete="${escapeAttr(key)}"
                            title="Delete">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    bindTableActions();

}


/* =====================================================
   ACTIONS
===================================================== */

function bindTableActions(){

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
   DETAILS
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
        ) ||
        key;


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

                </div>

            </div>

        `;

    }


    detailsContent.innerHTML = `

        <div class="detail-section">

            <h3>
                Registration
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
                        Date
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

                ${detailItem(
                    "Team Leader",
                    data.StudentName
                )}

                ${detailItem(
                    "Team Name",
                    data.TeamName
                )}

                ${detailItem(
                    "Class",
                    data.Class
                )}

                ${detailItem(
                    "Section",
                    data.Section
                )}

                ${detailItem(
                    "Mobile",
                    data.MobileNumber
                )}

                ${detailItem(
                    "Email",
                    getRegistrationEmail(data)
                )}

                ${detailItem(
                    "Team Size",
                    getTeamSize(data) +
                    " Member(s)"
                )}

            </div>

        </div>


        <div class="detail-section">

            <h3>
                Selected Events
            </h3>

            <div class="event-tags">

                ${
                    events.length
                    ? events.map(event => `
                        <span class="event-tag">
                            ${escapeHTML(event)}
                        </span>
                    `).join("")
                    : "No event selected"
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


    detailsModal.classList.remove(
        "hidden"
    );

}


function detailItem(label,value){

    return `

        <div class="detail-item">

            <label>
                ${escapeHTML(label)}
            </label>

            <strong>
                ${escapeHTML(
                    normalize(value) || "-"
                )}
            </strong>

        </div>

    `;

}


/* =====================================================
   DELETE FROM DETAILS
===================================================== */

modalDeleteBtn.addEventListener(
    "click",
    () => {

        if(currentRegistrationKey){

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

        showToast(
            "Registration not found.",
            "error"
        );

        return;

    }


    editKey.value =
        key;

    editStudentName.value =
        normalize(data.StudentName);

    editTeamName.value =
        normalize(data.TeamName);

    editClass.value =
        normalize(data.Class);

    editSection.value =
        normalize(data.Section);

    editMobile.value =
        normalize(data.MobileNumber);

    editEmail.value =
        getRegistrationEmail(data);

    editRemarks.value =
        normalize(data.Remarks);


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


        const button =
            document.getElementById(
                "saveEditBtn"
            );


        button.disabled = true;


        button.innerHTML = `
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

            populateFilters();

            renderRecent();

            renderTable();

            updateEventPage();


            showToast(
                "Registration updated.",
                "success"
            );

        }
        catch(error){

            console.error(
                "EDIT ERROR:",
                error
            );


            showToast(
                getDatabaseErrorMessage(error),
                "error"
            );

        }
        finally{

            button.disabled = false;

            button.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Save
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
        ) ||
        "this registration";


    const confirmed =
        window.confirm(
            `Delete registration for ${name}?\n\nThis cannot be undone.`
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

        populateFilters();

        renderRecent();

        renderTable();

        updateEventPage();


        showToast(
            "Registration deleted.",
            "success"
        );

    }
    catch(error){

        console.error(
            "DELETE ERROR:",
            error
        );


        showToast(
            getDatabaseErrorMessage(error),
            "error"
        );

    }

}


/* =====================================================
   EVENT PAGE
===================================================== */

function updateEventPage(){

    const counts =
        calculateEventCounts();


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
   EXPORT
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


    if(!entries.length){

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
        .map(row =>
            row
            .map(csvEscape)
            .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            [
                "\ufeff",
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


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

    return `"${normalize(value)
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
        closeModals
    );

});


detailsModal.addEventListener(
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


editModal.addEventListener(
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


function closeModals(){

    detailsModal.classList.add(
        "hidden"
    );

    editModal.classList.add(
        "hidden"
    );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
){

    if(!toast || !toastMessage){

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
            ? "#ff5572"
            : "#00f5a0";

    }


    toast.classList.add("show");


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
   DATE
===================================================== */

function getTimestamp(data){

    if(!data){

        return 0;

    }


    const value =
        data.registrationDate;


    if(!value){

        return 0;

    }


    const timestamp =
        new Date(value).getTime();


    return Number.isFinite(timestamp)
        ? timestamp
        : 0;

}


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
   TEXT
===================================================== */

function setText(id,value){

    const element =
        document.getElementById(id);


    if(element){

        element.textContent =
            value;

    }

}


function setTableStatus(value){

    if(tableStatus){

        tableStatus.textContent =
            value;

    }

}


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(value){

    return normalize(value)
        .replace(
            /[&<>"']/g,
            char => {

                const map = {

                    "&":"&amp;",
                    "<":"&lt;",
                    ">":"&gt;",
                    '"':"&quot;",
                    "'":"&#039;"

                };

                return map[char];

            }
        );

}


function escapeAttr(value){

    return escapeHTML(value);

}


/* =====================================================
   INITIAL STATE
===================================================== */

registrations = {};

filteredRegistrations = {};


/* =====================================================
   ESC
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape"
        ){

            closeModals();

        }

    }
);
