/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   COMPLETE ADMIN CONTROL CENTER

   Firebase:
   - Authentication
   - Realtime Database
   - registrations/
   - issues/
   - siteContent/
========================================================= */


import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    getDatabase,
    ref,
    get,
    set,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";



/* =========================================================
   FIREBASE CONFIGURATION
========================================================= */

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



/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const db = getDatabase(firebaseApp);



/* =========================================================
   GLOBAL STATE
========================================================= */

let registrations = {};

let filteredRegistrations = {};

let issues = {};

let filteredIssues = {};

let currentRegistrationKey = null;

let currentIssueKey = null;



/* =========================================================
   HELPER
========================================================= */

const $ = id =>
    document.getElementById(id);


function safe(value){

    if(value === null || value === undefined){
        return "";
    }

    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


function valueOf(value){

    if(value === null || value === undefined){
        return "";
    }

    if(Array.isArray(value)){
        return value.join(", ");
    }

    if(typeof value === "object"){
        return Object.values(value).join(", ");
    }

    return String(value);

}


function showToast(message,error=false){

    const toast = $("toast");

    toast.textContent = message;

    toast.classList.toggle("error",error);

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    },3000);

}



/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(auth,user => {

    if(user){

        $("loginScreen").classList.add("hidden");

        $("adminApp").classList.remove("hidden");

        $("adminEmail").textContent =
            user.email || "Authenticated Admin";

        loadEverything();

    }else{

        $("loginScreen").classList.remove("hidden");

        $("adminApp").classList.add("hidden");

    }

});



/* =========================================================
   LOGIN
========================================================= */

$("loginForm").addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const email =
            $("loginEmail").value.trim();

        const password =
            $("loginPassword").value;

        const error =
            $("loginError");

        const button =
            $("loginBtn");

        error.textContent = "";

        button.disabled = true;

        button.textContent = "AUTHENTICATING...";


        try{

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        }catch(err){

            console.error(err);

            error.textContent =
                getAuthError(err.code);

        }finally{

            button.disabled = false;

            button.textContent =
                "LOGIN TO DASHBOARD";

        }

    }
);



function getAuthError(code){

    const errors = {

        "auth/invalid-credential":
            "Invalid email or password.",

        "auth/user-not-found":
            "Admin account was not found.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/invalid-email":
            "Enter a valid admin email.",

        "auth/too-many-requests":
            "Too many login attempts. Try again later.",

        "auth/network-request-failed":
            "Network error. Check your internet connection.",

        "auth/operation-not-allowed":
            "Email/password authentication is disabled."

    };

    return errors[code] ||
        "Login failed. Please check Firebase Authentication.";

}



/* =========================================================
   PASSWORD TOGGLE
========================================================= */

$("togglePassword").addEventListener(
    "click",
    () => {

        const input =
            $("loginPassword");

        input.type =
            input.type === "password"
                ? "text"
                : "password";

    }
);



/* =========================================================
   LOGOUT
========================================================= */

$("logoutBtn").addEventListener(
    "click",
    async () => {

        try{

            await signOut(auth);

        }catch(error){

            console.error(error);

        }

    }
);



/* =========================================================
   SIDEBAR
========================================================= */

$("sidebarToggle").addEventListener(
    "click",
    () => {

        $("sidebar").classList.toggle("open");

    }
);



/* =========================================================
   PAGE NAVIGATION
========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.page
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
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove("active");

        });


    const target =
        $(page + "Page");

    if(!target){
        return;
    }

    target.classList.add("active");


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    const titles = {

        dashboard:"Dashboard",

        registrations:"Registrations",

        events:"Events",

        home:"Home",

        about:"About",

        eventContent:"Events Content",

        team:"Our Team",

        contact:"Contact",

        rules:"Rules",

        issues:"Help / Issues"

    };


    $("pageTitle").textContent =
        titles[page] || "Dashboard";


    $("sidebar").classList.remove("open");


    if(page === "registrations"){
        renderRegistrationTable();
    }


    if(page === "issues"){
        renderIssues();
    }

}



/* =========================================================
   LOAD EVERYTHING
========================================================= */

async function loadEverything(){

    await Promise.all([

        loadRegistrations(),

        loadIssues(),

        loadSiteContent()

    ]);

}



/* =========================================================
   REGISTRATIONS
========================================================= */

async function loadRegistrations(){

    try{

        const snapshot =
            await get(
                ref(db,"registrations")
            );


        registrations =
            snapshot.exists()
                ? snapshot.val()
                : {};


        filteredRegistrations =
            {...registrations};


        populateRegistrationFilters();

        updateDashboard();

        renderRecentRegistrations();

        renderRegistrationTable();

        updateEventStatistics();


    }catch(error){

        console.error(
            "Registration loading error:",
            error
        );

        showToast(
            "Unable to load registrations. Check Firebase Database Rules.",
            true
        );

    }

}



/* =========================================================
   NORMALIZE
========================================================= */

function getEvents(data){

    const raw =
        data?.Events ??
        data?.events ??
        data?.Event ??
        data?.event;


    if(!raw){
        return [];
    }


    if(Array.isArray(raw)){

        return raw
            .map(valueOf)
            .filter(Boolean);

    }


    if(typeof raw === "object"){

        return Object.values(raw)
            .map(valueOf)
            .filter(Boolean);

    }


    return valueOf(raw)
        .split(/\s*(?:,|\||;)\s*/)
        .filter(Boolean);

}



function getEmail(data){

    return valueOf(
        data?.EmailAddress ??
        data?.Email ??
        data?.email
    );

}



function getTeamSize(data){

    const explicit =
        Number(data?.TeamSize);


    if(explicit > 0){
        return explicit;
    }


    let count = 1;


    for(let i=2;i<=5;i++){

        if(
            valueOf(
                data?.[`Member${i}Name`]
            )
        ){

            count++;

        }

    }


    return count;

}



function getDate(data){

    const raw =
        data?.registrationDate ??
        data?.createdAt ??
        data?.timestamp;


    if(!raw){
        return null;
    }


    const date =
        new Date(raw);


    return isNaN(date.getTime())
        ? null
        : date;

}



function formatDate(data){

    const date =
        getDate(data);


    if(!date){
        return "-";
    }


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle:"medium",
            timeStyle:"short"
        }
    );

}



/* =========================================================
   EVENT COUNTS
========================================================= */

function countEvents(){

    const counts = {

        race:0,

        war:0,

        tug:0,

        soccer:0

    };


    Object
        .values(registrations)
        .forEach(data => {

            getEvents(data)
                .forEach(event => {

                    const name =
                        event
                            .toLowerCase()
                            .trim();


                    if(name === "robo race"){
                        counts.race++;
                    }


                    if(name === "robo war"){
                        counts.war++;
                    }


                    if(
                        name === "robo tug of war"
                    ){

                        counts.tug++;

                    }


                    if(name === "robo soccer"){
                        counts.soccer++;
                    }

                });

        });


    return counts;

}



/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard(){

    const list =
        Object.values(registrations);


    $("totalRegistrations")
        .textContent =
        list.length;


    $("totalTeams")
        .textContent =
        list.length;


    const counts =
        countEvents();


    $("raceCount")
        .textContent =
        counts.race;


    $("warCount")
        .textContent =
        counts.war;


    $("tugCount")
        .textContent =
        counts.tug;


    $("soccerCount")
        .textContent =
        counts.soccer;

}



function updateEventStatistics(){

    const counts =
        countEvents();


    $("eventRaceCount")
        .textContent =
        counts.race;


    $("eventWarCount")
        .textContent =
        counts.war;


    $("eventTugCount")
        .textContent =
        counts.tug;


    $("eventSoccerCount")
        .textContent =
        counts.soccer;

}



/* =========================================================
   RECENT REGISTRATIONS
========================================================= */

function renderRecentRegistrations(){

    const container =
        $("recentRegistrations");


    const entries =
        Object.entries(registrations)
        .sort(
            (a,b) =>
                (getDate(b[1])?.getTime() || 0) -
                (getDate(a[1])?.getTime() || 0)
        )
        .slice(0,6);


    if(!entries.length){

        container.innerHTML = `
            <div class="loading">
                No registrations found.
            </div>
        `;

        return;

    }


    container.innerHTML =
        entries
        .map(([key,data]) => `

            <div class="recent-row">

                <div>

                    <strong>
                        ${safe(
                            data.StudentName ||
                            "Unknown Student"
                        )}
                    </strong>

                    <small>
                        ${safe(
                            data.TeamName ||
                            "Unnamed Team"
                        )}
                        •
                        ${safe(
                            data.registrationId ||
                            key
                        )}
                    </small>

                </div>

                <button
                    class="small-button"
                    data-view-registration="${safe(key)}">

                    View

                </button>

            </div>

        `)
        .join("");


    container
        .querySelectorAll(
            "[data-view-registration]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    viewRegistration(
                        button.dataset.viewRegistration
                    );

                }
            );

        });

}



/* =========================================================
   REGISTRATION FILTERS
========================================================= */

function populateRegistrationFilters(){

    const classes =
        [
            ...new Set(
                Object
                    .values(registrations)
                    .map(data =>
                        valueOf(data.Class)
                    )
                    .filter(Boolean)
            )
        ].sort();


    const sections =
        [
            ...new Set(
                Object
                    .values(registrations)
                    .map(data =>
                        valueOf(data.Section)
                    )
                    .filter(Boolean)
            )
        ].sort();


    $("classFilter").innerHTML =
        `<option value="all">
            All Classes
        </option>` +
        classes
            .map(item =>
                `<option value="${safe(item)}">
                    ${safe(item)}
                </option>`
            )
            .join("");


    $("sectionFilter").innerHTML =
        `<option value="all">
            All Sections
        </option>` +
        sections
            .map(item =>
                `<option value="${safe(item)}">
                    ${safe(item)}
                </option>`
            )
            .join("");

}



/* =========================================================
   APPLY REGISTRATION FILTERS
========================================================= */

function applyRegistrationFilters(){

    const search =
        $("searchInput")
            .value
            .toLowerCase()
            .trim();


    const event =
        $("eventFilter").value;


    const classValue =
        $("classFilter").value;


    const section =
        $("sectionFilter").value;


    filteredRegistrations = {};


    Object
        .entries(registrations)
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

                getEmail(data),

                ...events

            ]
            .map(valueOf)
            .join(" ")
            .toLowerCase();


            const matchesSearch =
                !search ||
                searchable.includes(search);


            const matchesEvent =
                event === "all" ||
                events.some(
                    item =>
                        item.toLowerCase() ===
                        event.toLowerCase()
                );


            const matchesClass =
                classValue === "all" ||
                valueOf(data.Class) ===
                classValue;


            const matchesSection =
                section === "all" ||
                valueOf(data.Section) ===
                section;


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


    renderRegistrationTable();

}



["searchInput","eventFilter","classFilter","sectionFilter"]
.forEach(id => {

    $(id).addEventListener(
        id === "searchInput"
            ? "input"
            : "change",
        applyRegistrationFilters
    );

});



$("clearFilters").addEventListener(
    "click",
    () => {

        $("searchInput").value = "";

        $("eventFilter").value = "all";

        $("classFilter").value = "all";

        $("sectionFilter").value = "all";

        applyRegistrationFilters();

    }
);



/* =========================================================
   REGISTRATION TABLE
========================================================= */

function renderRegistrationTable(){

    const entries =
        Object.entries(filteredRegistrations)
        .sort(
            (a,b) =>
                (getDate(b[1])?.getTime() || 0) -
                (getDate(a[1])?.getTime() || 0)
        );


    $("resultCount").textContent =
        `${entries.length} registration${entries.length === 1 ? "" : "s"}`;


    $("tableEmpty")
        .classList
        .toggle(
            "hidden",
            entries.length > 0
        );


    $("registrationTableBody").innerHTML =
        entries
        .map(([key,data]) => {

            const events =
                getEvents(data);


            return `

                <tr>

                    <td>
                        ${safe(
                            data.registrationId ||
                            key
                        )}
                    </td>

                    <td>
                        ${safe(
                            data.StudentName ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${safe(
                            data.TeamName ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${safe(
                            data.Class ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${safe(
                            data.Section ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${safe(
                            data.MobileNumber ||
                            "-"
                        )}
                    </td>

                    <td>

                        ${
                            events.length

                            ?

                            events
                                .map(event =>
                                    `<span class="tag">
                                        ${safe(event)}
                                    </span>`
                                )
                                .join("")

                            :

                            "-"
                        }

                    </td>

                    <td>
                        ${getTeamSize(data)}
                    </td>

                    <td>
                        ${safe(formatDate(data))}
                    </td>

                    <td>

                        <div class="actions">

                            <button
                                title="View"
                                data-action-view="${safe(key)}">
                                👁
                            </button>

                            <button
                                title="Edit"
                                data-action-edit="${safe(key)}">
                                ✎
                            </button>

                            <button
                                title="Delete"
                                class="danger"
                                data-action-delete="${safe(key)}">
                                ×
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        })
        .join("");


    document
        .querySelectorAll(
            "[data-action-view]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    viewRegistration(
                        button.dataset.actionView
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-action-edit]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    editRegistration(
                        button.dataset.actionEdit
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-action-delete]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    deleteRegistration(
                        button.dataset.actionDelete
                    )
            );

        });

}



/* =========================================================
   VIEW REGISTRATION
========================================================= */

function viewRegistration(key){

    const data =
        registrations[key];


    if(!data){
        return;
    }


    currentRegistrationKey =
        key;


    const entries =
        Object.entries(data);


    $("modalContent").innerHTML = `

        <h2>
            ${safe(
                data.TeamName ||
                "Registration Details"
            )}
        </h2>

        <p style="color:#68778d;font-size:10px">
            Registration ID:
            ${safe(
                data.registrationId ||
                key
            )}
        </p>

        <div class="detail-grid">

            ${
                entries
                .map(
                    ([field,value]) => `

                        <div class="detail-item">

                            <small>
                                ${safe(field)}
                            </small>

                            <strong>
                                ${safe(valueOf(value) || "-")}
                            </strong>

                        </div>

                    `
                )
                .join("")
            }

        </div>

    `;


    $("modal")
        .classList
        .remove("hidden");

}



/* =========================================================
   EDIT REGISTRATION
========================================================= */

async function editRegistration(key){

    const data =
        registrations[key];


    if(!data){
        return;
    }


    const studentName =
        prompt(
            "Team Leader Name:",
            valueOf(data.StudentName)
        );


    if(studentName === null){
        return;
    }


    const teamName =
        prompt(
            "Team Name:",
            valueOf(data.TeamName)
        );


    if(teamName === null){
        return;
    }


    const mobile =
        prompt(
            "Mobile Number:",
            valueOf(data.MobileNumber)
        );


    if(mobile === null){
        return;
    }


    try{

        await update(
            ref(
                db,
                `registrations/${key}`
            ),
            {

                StudentName:
                    studentName.trim(),

                TeamName:
                    teamName.trim(),

                MobileNumber:
                    mobile.trim()

            }
        );


        registrations[key].StudentName =
            studentName.trim();


        registrations[key].TeamName =
            teamName.trim();


        registrations[key].MobileNumber =
            mobile.trim();


        filteredRegistrations =
            {...registrations};


        renderRegistrationTable();

        renderRecentRegistrations();

        updateDashboard();

        showToast(
            "Registration updated successfully."
        );


    }catch(error){

        console.error(error);

        showToast(
            "Unable to update registration.",
            true
        );

    }

}



/* =========================================================
   DELETE REGISTRATION
========================================================= */

async function deleteRegistration(key){

    const data =
        registrations[key];


    if(!data){
        return;
    }


    const name =
        data.StudentName ||
        "this registration";


    const confirmed =
        confirm(
            `Delete ${name}?\n\nThis action cannot be undone.`
        );


    if(!confirmed){
        return;
    }


    try{

        await remove(
            ref(
                db,
                `registrations/${key}`
            )
        );


        delete registrations[key];

        delete filteredRegistrations[key];


        updateDashboard();

        updateEventStatistics();

        renderRecentRegistrations();

        renderRegistrationTable();


        showToast(
            "Registration deleted."
        );


    }catch(error){

        console.error(error);

        showToast(
            "Delete failed. Check Firebase Database Rules.",
            true
        );

    }

}



/* =========================================================
   ISSUES
========================================================= */

async function loadIssues(){

    try{

        const snapshot =
            await get(
                ref(db,"issues")
            );


        issues =
            snapshot.exists()
                ? snapshot.val()
                : {};


        filteredIssues =
            {...issues};


        updateIssueStatistics();

        renderIssues();

        renderRecentIssues();


    }catch(error){

        console.error(
            "Issues loading error:",
            error
        );

        showToast(
            "Unable to load issues.",
            true
        );

    }

}



/* =========================================================
   ISSUE STATISTICS
========================================================= */

function updateIssueStatistics(){

    const list =
        Object.values(issues);


    let open = 0;

    let progress = 0;

    let resolved = 0;


    list.forEach(issue => {

        const status =
            valueOf(issue.status) ||
            "Open";


        if(status === "Open"){
            open++;
        }

        else if(status === "In Progress"){
            progress++;
        }

        else if(status === "Resolved"){
            resolved++;
        }

    });


    $("openIssues")
        .textContent = open;


    $("progressIssues")
        .textContent = progress;


    $("resolvedIssues")
        .textContent = resolved;


    $("totalIssues")
        .textContent = list.length;


    $("issueBadge")
        .textContent = open;

}



/* =========================================================
   RECENT ISSUES
========================================================= */

function renderRecentIssues(){

    const container =
        $("recentIssues");


    const entries =
        Object.entries(issues)
        .sort(
            (a,b) =>
                Number(
                    b[1].createdAt || 0
                ) -
                Number(
                    a[1].createdAt || 0
                )
        )
        .slice(0,5);


    if(!entries.length){

        container.innerHTML = `
            <div class="loading">
                No issues reported.
            </div>
        `;

        return;

    }


    container.innerHTML =
        entries
        .map(([key,issue]) => {

            const status =
                valueOf(issue.status) ||
                "Open";


            const statusClass =
                status === "Resolved"
                    ? "status-resolved"
                    : status === "In Progress"
                        ? "status-progress"
                        : "status-open";


            return `

                <div class="recent-row">

                    <div>

                        <strong>
                            ${safe(
                                issue.category ||
                                "Website Issue"
                            )}
                        </strong>

                        <small>
                            ${safe(
                                issue.name ||
                                "Anonymous"
                            )}
                        </small>

                    </div>

                    <span
                        class="status ${statusClass}">

                        ${safe(status)}

                    </span>

                </div>

            `;

        })
        .join("");

}



/* =========================================================
   ISSUE FILTERS
========================================================= */

function applyIssueFilters(){

    const search =
        $("issueSearch")
            .value
            .toLowerCase()
            .trim();


    const status =
        $("issueStatusFilter").value;


    const category =
        $("issueCategoryFilter").value;


    filteredIssues = {};


    Object
        .entries(issues)
        .forEach(([key,issue]) => {

            const searchable = [

                issue.name,

                issue.email,

                issue.category,

                issue.page,

                issue.message,

                issue.adminNote

            ]
            .map(valueOf)
            .join(" ")
            .toLowerCase();


            const currentStatus =
                valueOf(issue.status) ||
                "Open";


            const matchesSearch =
                !search ||
                searchable.includes(search);


            const matchesStatus =
                status === "all" ||
                currentStatus === status;


            const matchesCategory =
                category === "all" ||
                valueOf(issue.category) ===
                category;


            if(
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            ){

                filteredIssues[key] =
                    issue;

            }

        });


    renderIssues();

}



$("issueSearch").addEventListener(
    "input",
    applyIssueFilters
);


$("issueStatusFilter").addEventListener(
    "change",
    applyIssueFilters
);


$("issueCategoryFilter").addEventListener(
    "change",
    applyIssueFilters
);



/* =========================================================
   RENDER ISSUES
========================================================= */

function renderIssues(){

    const container =
        $("issuesContainer");


    const entries =
        Object.entries(filteredIssues)
        .sort(
            (a,b) =>
                Number(
                    b[1].createdAt || 0
                ) -
                Number(
                    a[1].createdAt || 0
                )
        );


    if(!entries.length){

        container.innerHTML = `

            <div class="content-card empty-state">

                <span>
                    🆘
                </span>

                <h3>
                    No Issues Found
                </h3>

                <p>
                    Reported website issues will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        entries
        .map(([key,issue]) => {

            const status =
                valueOf(issue.status) ||
                "Open";


            const statusClass =
                status === "Resolved"
                    ? "status-resolved"
                    : status === "In Progress"
                        ? "status-progress"
                        : "status-open";


            const date =
                issue.createdAt
                    ? new Date(
                        Number(issue.createdAt)
                    ).toLocaleString(
                        "en-IN",
                        {
                            dateStyle:"medium",
                            timeStyle:"short"
                        }
                    )
                    : "-";


            return `

                <article class="issue-card">

                    <div class="issue-top">

                        <div>

                            <div class="issue-title">

                                <h3>
                                    ${safe(
                                        issue.category ||
                                        "Website Issue"
                                    )}
                                </h3>

                            </div>

                            <div class="issue-meta">

                                <span>
                                    ID:
                                    ${safe(key)}
                                </span>

                                <span>
                                    👤
                                    ${safe(
                                        issue.name ||
                                        "Anonymous"
                                    )}
                                </span>

                                <span>
                                    📅
                                    ${safe(date)}
                                </span>

                                ${
                                    issue.page
                                    ?

                                    `<span>
                                        📄
                                        ${safe(issue.page)}
                                    </span>`

                                    :

                                    ""
                                }

                            </div>

                        </div>


                        <span
                            class="status ${statusClass}">

                            ${safe(status)}

                        </span>

                    </div>


                    <div class="issue-message">

                        ${safe(
                            issue.message ||
                            "No description provided."
                        )}

                    </div>


                    <div class="issue-actions">

                        <button
                            data-issue-view="${safe(key)}">

                            👁 View

                        </button>


                        <button
                            data-issue-progress="${safe(key)}">

                            ⏳ In Progress

                        </button>


                        <button
                            data-issue-resolve="${safe(key)}">

                            ✅ Resolve

                        </button>


                        <button
                            data-issue-open="${safe(key)}">

                            🔴 Reopen

                        </button>


                        <button
                            data-issue-delete="${safe(key)}">

                            🗑 Delete

                        </button>

                    </div>

                </article>

            `;

        })
        .join("");


    document
        .querySelectorAll(
            "[data-issue-view]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    viewIssue(
                        button.dataset.issueView
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-issue-progress]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    updateIssueStatus(
                        button.dataset.issueProgress,
                        "In Progress"
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-issue-resolve]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    updateIssueStatus(
                        button.dataset.issueResolve,
                        "Resolved"
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-issue-open]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    updateIssueStatus(
                        button.dataset.issueOpen,
                        "Open"
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-issue-delete]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    deleteIssue(
                        button.dataset.issueDelete
                    )
            );

        });

}



/* =========================================================
   VIEW ISSUE
========================================================= */

function viewIssue(key){

    const issue =
        issues[key];


    if(!issue){
        return;
    }


    currentIssueKey =
        key;


    const status =
        valueOf(issue.status) ||
        "Open";


    $("issueModalContent").innerHTML = `

        <h2>
            Help / Issue
        </h2>

        <div class="detail-grid">

            <div class="detail-item">

                <small>
                    Issue ID
                </small>

                <strong>
                    ${safe(key)}
                </strong>

            </div>


            <div class="detail-item">

                <small>
                    Status
                </small>

                <strong>
                    ${safe(status)}
                </strong>

            </div>


            <div class="detail-item">

                <small>
                    Reporter
                </small>

                <strong>
                    ${safe(
                        issue.name ||
                        "Anonymous"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <small>
                    Email
                </small>

                <strong>
                    ${safe(
                        issue.email ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <small>
                    Category
                </small>

                <strong>
                    ${safe(
                        issue.category ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <small>
                    Page
                </small>

                <strong>
                    ${safe(
                        issue.page ||
                        "-"
                    )}
                </strong>

            </div>

        </div>


        <div class="issue-detail-message">

            <strong>
                Issue Description
            </strong>

            <br><br>

            ${safe(
                issue.message ||
                "No description."
            )}

        </div>


        <label style="
            display:block;
            color:#8997aa;
            font-size:10px;
            margin-top:15px;
        ">

            Status

        </label>


        <select
            id="modalIssueStatus"
            class="issue-status-select">

            <option
                value="Open"
                ${status === "Open" ? "selected" : ""}>

                Open

            </option>

            <option
                value="In Progress"
                ${status === "In Progress" ? "selected" : ""}>

                In Progress

            </option>

            <option
                value="Resolved"
                ${status === "Resolved" ? "selected" : ""}>

                Resolved

            </option>

        </select>


        <label style="
            display:block;
            color:#8997aa;
            font-size:10px;
            margin-top:15px;
        ">

            Admin Notes

        </label>


        <textarea
            id="modalAdminNote"
            class="issue-note"
            placeholder="Add internal admin notes...">${safe(
                issue.adminNote ||
                ""
            )}</textarea>


        <button
            id="saveIssueChanges"
            class="save-button">

            💾 Save Issue Changes

        </button>

    `;


    $("issueModal")
        .classList
        .remove("hidden");


    $("saveIssueChanges")
        .addEventListener(
            "click",
            () =>
                saveIssueChanges(key)
        );

}



/* =========================================================
   SAVE ISSUE CHANGES
========================================================= */

async function saveIssueChanges(key){

    const status =
        $("modalIssueStatus").value;


    const adminNote =
        $("modalAdminNote").value.trim();


    try{

        await update(
            ref(
                db,
                `issues/${key}`
            ),
            {

                status,

                adminNote,

                updatedAt:
                    Date.now()

            }
        );


        issues[key].status =
            status;


        issues[key].adminNote =
            adminNote;


        issues[key].updatedAt =
            Date.now();


        filteredIssues =
            {...issues};


        updateIssueStatistics();

        renderIssues();

        renderRecentIssues();


        $("issueModal")
            .classList
            .add("hidden");


        showToast(
            "Issue updated successfully."
        );


    }catch(error){

        console.error(error);

        showToast(
            "Unable to update issue.",
            true
        );

    }

}



/* =========================================================
   ISSUE STATUS
========================================================= */

async function updateIssueStatus(
    key,
    status
){

    if(!issues[key]){
        return;
    }


    try{

        await update(
            ref(
                db,
                `issues/${key}`
            ),
            {

                status,

                updatedAt:
                    Date.now()

            }
        );


        issues[key].status =
            status;


        issues[key].updatedAt =
            Date.now();


        filteredIssues =
            {...issues};


        updateIssueStatistics();

        renderIssues();

        renderRecentIssues();


        showToast(
            `Issue marked as ${status}.`
        );


    }catch(error){

        console.error(error);

        showToast(
            "Unable to update issue status.",
            true
        );

    }

}



/* =========================================================
   DELETE ISSUE
========================================================= */

async function deleteIssue(key){

    if(!issues[key]){
        return;
    }


    const confirmed =
        confirm(
            "Delete this issue?\n\nThis action cannot be undone."
        );


    if(!confirmed){
        return;
    }


    try{

        await remove(
            ref(
                db,
                `issues/${key}`
            )
        );


        delete issues[key];

        delete filteredIssues[key];


        updateIssueStatistics();

        renderIssues();

        renderRecentIssues();


        showToast(
            "Issue deleted."
        );


    }catch(error){

        console.error(error);

        showToast(
            "Unable to delete issue.",
            true
        );

    }

}



/* =========================================================
   SITE CONTENT
========================================================= */

async function loadSiteContent(){

    try{

        const snapshot =
            await get(
                ref(db,"siteContent")
            );


        if(!snapshot.exists()){

            loadDefaultEditorValues();

            return;

        }


        const content =
            snapshot.val();


        fillHome(content.home);

        fillAbout(content.about);

        fillEvents(content.events);

        fillTeam(content.team);

        fillContact(content.contact);

        fillRules(content.rules);


    }catch(error){

        console.error(
            "Site content loading error:",
            error
        );

        loadDefaultEditorValues();

    }

}



/* =========================================================
   DEFAULT VALUES
========================================================= */

function loadDefaultEditorValues(){

    fillHome({});

    fillAbout({});

    fillEvents({});

    fillTeam({});

    fillContact({});

    fillRules({});

}



/* =========================================================
   HOME
========================================================= */

function fillHome(data = {}){

    $("homeBadge").value =
        data.badge || "";


    $("homeTitle").value =
        data.title || "";


    $("homeDescription").value =
        data.description || "";


    $("homeDate").value =
        data.date || "";


    $("homeVenue").value =
        data.venue || "";

}



/* =========================================================
   ABOUT
========================================================= */

function fillAbout(data = {}){

    $("aboutLabel").value =
        data.label || "";


    $("aboutTitle").value =
        data.title || "";


    $("aboutDescription").value =
        data.description || "";

}



/* =========================================================
   EVENTS
========================================================= */

function fillEvents(data = {}){

    const race =
        data.race || {};


    const war =
        data.war || {};


    const tug =
        data.tug || {};


    const soccer =
        data.soccer || {};


    $("eventRaceTitle").value =
        race.title ||
        "Robo Race";


    $("eventRaceDescription").value =
        race.description ||
        "";


    $("eventWarTitle").value =
        war.title ||
        "Robo War";


    $("eventWarDescription").value =
        war.description ||
        "";


    $("eventTugTitle").value =
        tug.title ||
        "Robo Tug of War";


    $("eventTugDescription").value =
        tug.description ||
        "";


    $("eventSoccerTitle").value =
        soccer.title ||
        "Robo Soccer";


    $("eventSoccerDescription").value =
        soccer.description ||
        "";

}



/* =========================================================
   TEAM
========================================================= */

function fillTeam(data = {}){

    for(let i=1;i<=4;i++){

        const member =
            data[`member${i}`] ||
            {};


        $(`team${i}Name`).value =
            member.name ||
            "";


        $(`team${i}Role`).value =
            member.role ||
            "";


        $(`team${i}Description`).value =
            member.description ||
            "";

    }

}



/* =========================================================
   CONTACT
========================================================= */

function fillContact(data = {}){

    $("contactAddress").value =
        data.address || "";


    $("contactPhone").value =
        data.phone || "";


    $("contactEmail").value =
        data.email || "";


    $("contactFacebook").value =
        data.facebook || "";


    $("contactInstagram").value =
        data.instagram || "";


    $("contactYoutube").value =
        data.youtube || "";

}



/* =========================================================
   RULES
========================================================= */

function fillRules(data = {}){

    const race =
        data.race || {};


    const soccer =
        data.soccer || {};


    const war =
        data.war || {};


    const tug =
        data.tug || {};


    $("ruleRaceWeight").value =
        race.weight ||
        "4 kg";


    $("ruleRaceDimension").value =
        race.dimension ||
        "30 × 30 × 30 cm";


    $("ruleRaceVoltage").value =
        race.voltage ||
        "12 V";


    $("ruleSoccerWeight").value =
        soccer.weight ||
        "5 kg";


    $("ruleSoccerDimension").value =
        soccer.dimension ||
        "30 × 30 × 30 cm";


    $("ruleSoccerVoltage").value =
        soccer.voltage ||
        "12 V";


    $("ruleWarWeight").value =
        war.weight ||
        "5.5 kg";


    $("ruleWarDimension").value =
        war.dimension ||
        "30 × 30 × 30 cm";


    $("ruleWarVoltage").value =
        war.voltage ||
        "12 V";


    $("ruleTugWeight").value =
        tug.weight ||
        "4 kg";


    $("ruleTugDimension").value =
        tug.dimension ||
        "30 × 30 × 30 cm";


    $("ruleTugVoltage").value =
        tug.voltage ||
        "12 V";


    $("generalRules").value =
        data.general ||
        `• Participants must follow all instructions issued by the organising team and judges.

• Teams must report on time for registration, verification and competition rounds.

• Robots must comply with the prescribed technical specifications.

• Unsafe behaviour or deliberate damage to equipment may result in disqualification.

• Judges' decisions during competition rounds shall be final unless an official appeal procedure is announced by the organisers.`;

}



/* =========================================================
   SAVE CONTENT BUTTONS
========================================================= */

document
    .querySelectorAll(
        "[data-content-save]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                saveContent(
                    button.dataset.contentSave
                );

            }
        );

    });



/* =========================================================
   SAVE CONTENT
========================================================= */

async function saveContent(section){

    let data;


    if(section === "home"){

        data = {

            badge:
                $("homeBadge").value.trim(),

            title:
                $("homeTitle").value.trim(),

            description:
                $("homeDescription").value.trim(),

            date:
                $("homeDate").value.trim(),

            venue:
                $("homeVenue").value.trim()

        };

    }


    else if(section === "about"){

        data = {

            label:
                $("aboutLabel").value.trim(),

            title:
                $("aboutTitle").value.trim(),

            description:
                $("aboutDescription").value.trim()

        };

    }


    else if(section === "events"){

        data = {

            race:{

                title:
                    $("eventRaceTitle").value.trim(),

                description:
                    $("eventRaceDescription").value.trim()

            },

            war:{

                title:
                    $("eventWarTitle").value.trim(),

                description:
                    $("eventWarDescription").value.trim()

            },

            tug:{

                title:
                    $("eventTugTitle").value.trim(),

                description:
                    $("eventTugDescription").value.trim()

            },

            soccer:{

                title:
                    $("eventSoccerTitle").value.trim(),

                description:
                    $("eventSoccerDescription").value.trim()

            }

        };

    }


    else if(section === "team"){

        data = {};


        for(let i=1;i<=4;i++){

            data[`member${i}`] = {

                name:
                    $(`team${i}Name`).value.trim(),

                role:
                    $(`team${i}Role`).value.trim(),

                description:
                    $(`team${i}Description`)
                        .value
                        .trim()

            };

        }

    }


    else if(section === "contact"){

        data = {

            address:
                $("contactAddress").value.trim(),

            phone:
                $("contactPhone").value.trim(),

            email:
                $("contactEmail").value.trim(),

            facebook:
                $("contactFacebook").value.trim(),

            instagram:
                $("contactInstagram").value.trim(),

            youtube:
                $("contactYoutube").value.trim()

        };

    }


    else if(section === "rules"){

        data = {

            race:{

                weight:
                    $("ruleRaceWeight").value.trim(),

                dimension:
                    $("ruleRaceDimension").value.trim(),

                voltage:
                    $("ruleRaceVoltage").value.trim()

            },

            soccer:{

                weight:
                    $("ruleSoccerWeight").value.trim(),

                dimension:
                    $("ruleSoccerDimension").value.trim(),

                voltage:
                    $("ruleSoccerVoltage").value.trim()

            },

            war:{

                weight:
                    $("ruleWarWeight").value.trim(),

                dimension:
                    $("ruleWarDimension").value.trim(),

                voltage:
                    $("ruleWarVoltage").value.trim()

            },

            tug:{

                weight:
                    $("ruleTugWeight").value.trim(),

                dimension:
                    $("ruleTugDimension").value.trim(),

                voltage:
                    $("ruleTugVoltage").value.trim()

            },

            general:
                $("generalRules").value.trim()

        };

    }


    else{

        return;

    }


    try{

        await set(
            ref(
                db,
                `siteContent/${section}`
            ),
            data
        );


        showToast(
            `${section} content saved successfully.`
        );


    }catch(error){

        console.error(error);

        showToast(
            `Unable to save ${section} content. Check Firebase permissions.`,
            true
        );

    }

}



/* =========================================================
   REGISTRATION REFRESH
========================================================= */

$("dashboardRefresh")
    .addEventListener(
        "click",
        loadEverything
    );


$("refreshRegistrations")
    .addEventListener(
        "click",
        async () => {

            await loadRegistrations();

            showToast(
                "Registrations refreshed."
            );

        }
    );


$("refreshIssues")
    .addEventListener(
        "click",
        async () => {

            await loadIssues();

            showToast(
                "Issues refreshed."
            );

        }
    );



/* =========================================================
   EXPORT CSV
========================================================= */

function csvEscape(value){

    return `"${valueOf(value)
        .replace(/"/g,'""')}"`;

}



function exportCSV(data){

    const rows = [

        [

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

        ]

    ];


    Object
        .entries(data)
        .forEach(([key,item]) => {

            rows.push([

                item.registrationId || key,

                item.StudentName,

                item.TeamName,

                item.Class,

                item.Section,

                item.MobileNumber,

                getEmail(item),

                getEvents(item).join(" | "),

                getTeamSize(item),

                item.Member2Name,

                item.Member3Name,

                item.Member4Name,

                item.Member5Name,

                item.Remarks,

                item.registrationDate

            ]);

        });


    const csv =
        "\ufeff" +
        rows
            .map(row =>
                row
                    .map(csvEscape)
                    .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:"text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const anchor =
        document.createElement("a");


    anchor.href = url;

    anchor.download =
        "APS_Robotics_Registrations_2026.csv";


    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);

}



$("exportCsv")
    .addEventListener(
        "click",
        () =>
            exportCSV(
                filteredRegistrations
            )
    );


$("exportDashboard")
    .addEventListener(
        "click",
        () =>
            exportCSV(
                registrations
            )
    );



/* =========================================================
   MODAL CLOSE
========================================================= */

$("closeModal")
    .addEventListener(
        "click",
        () => {

            $("modal")
                .classList
                .add("hidden");

        }
    );


$("modal")
    .addEventListener(
        "click",
        event => {

            if(event.target.id === "modal"){

                $("modal")
                    .classList
                    .add("hidden");

            }

        }
    );


$("closeIssueModal")
    .addEventListener(
        "click",
        () => {

            $("issueModal")
                .classList
                .add("hidden");

        }
    );


$("issueModal")
    .addEventListener(
        "click",
        event => {

            if(
                event.target.id ===
                "issueModal"
            ){

                $("issueModal")
                    .classList
                    .add("hidden");

            }

        }
    );


document.addEventListener(
    "keydown",
    event => {

        if(event.key === "Escape"){

            $("modal")
                .classList
                .add("hidden");

            $("issueModal")
                .classList
                .add("hidden");

        }

    }
);
