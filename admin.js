import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =====================================================
   FIREBASE
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


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


/* =====================================================
   ELEMENTS
===================================================== */

const body =
    document.getElementById("registrationBody");

const status =
    document.getElementById("status");

const search =
    document.getElementById("search");

const refreshBtn =
    document.getElementById("refreshBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const totalRegistrations =
    document.getElementById("totalRegistrations");

const soloCount =
    document.getElementById("soloCount");

const teamCount =
    document.getElementById("teamCount");

const editOverlay =
    document.getElementById("editOverlay");

const editForm =
    document.getElementById("editForm");

const editKey =
    document.getElementById("editKey");

const editStudentName =
    document.getElementById("editStudentName");

const editStudentClass =
    document.getElementById("editStudentClass");

const editStudentSection =
    document.getElementById("editStudentSection");

const editMobileNumber =
    document.getElementById("editMobileNumber");

const editEmailAddress =
    document.getElementById("editEmailAddress");

const editTeamName =
    document.getElementById("editTeamName");

const editMembers =
    document.getElementById("editMembers");

const editRemarks =
    document.getElementById("editRemarks");

const editMessage =
    document.getElementById("editMessage");

const closeEdit =
    document.getElementById("closeEdit");

const cancelEdit =
    document.getElementById("cancelEdit");


let registrations = {};

let currentUser = null;


/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(auth, async user => {

    if (!user) {

        window.location.replace("login.html");

        return;
    }

    currentUser = user;

    await loadRegistrations();

});


/* =====================================================
   LOAD DATA
===================================================== */

async function loadRegistrations(){

    status.textContent =
        "Loading registrations...";

    body.innerHTML = "";

    try {

        const snapshot =
            await get(ref(db, "registrations"));

        if (!snapshot.exists()) {

            registrations = {};

            renderRegistrations();

            status.textContent =
                "No registrations found.";

            return;
        }

        registrations =
            snapshot.val();

        renderRegistrations();

        status.textContent =
            `Loaded ${Object.keys(registrations).length} registration(s).`;

    } catch(error) {

        console.error(error);

        status.textContent =
            getFirebaseError(error);

    }
}


/* =====================================================
   RENDER
===================================================== */

function renderRegistrations(){

    body.innerHTML = "";

    const entries =
        Object.entries(registrations);

    let filtered =
        entries;

    const query =
        search.value.trim().toLowerCase();

    if(query){

        filtered =
            entries.filter(
                ([key, data]) =>
                    searchableText(key, data)
                    .includes(query)
            );
    }


    let solo = 0;
    let teams = 0;

    entries.forEach(([key, data]) => {

        const size =
            Number(
                data.TeamSize ||
                data.teamSize ||
                1
            );

        if(size === 1){
            solo++;
        }else{
            teams++;
        }

    });


    totalRegistrations.textContent =
        entries.length;

    soloCount.textContent =
        solo;

    teamCount.textContent =
        teams;


    if(filtered.length === 0){

        body.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;padding:30px;">
                    No matching registrations.
                </td>
            </tr>
        `;

        return;
    }


    filtered.sort(
        (a,b) =>
            getDateValue(b[1]) -
            getDateValue(a[1])
    );


    filtered.forEach(([key,data]) => {

        const row =
            document.createElement("tr");

        const members =
            getMembers(data);

        const events =
            getEvents(data);

        const size =
            Number(
                data.TeamSize ||
                data.teamSize ||
                members.length ||
                1
            );


        row.innerHTML = `

            <td>
                <span class="id">
                    ${escapeHtml(
                        data.RegistrationId ||
                        data.registrationId ||
                        key
                    )}
                </span>
            </td>

            <td>
                <strong>
                    ${escapeHtml(
                        data.StudentName ||
                        data.studentName ||
                        ""
                    )}
                </strong>

                <div style="color:#607892;font-size:.62rem">
                    ${escapeHtml(
                        data.Class ||
                        data.class ||
                        ""
                    )}
                    -
                    ${escapeHtml(
                        data.Section ||
                        data.section ||
                        ""
                    )}
                </div>
            </td>

            <td>
                ${escapeHtml(
                    data.TeamName ||
                    data.teamName ||
                    "—"
                )}
            </td>

            <td>
                <span class="type">
                    ${size === 1 ? "SOLO" : "TEAM OF " + size}
                </span>
            </td>

            <td>
                <div class="member-list">
                    ${members.map(
                        member => `
                        <div class="member">

                            <strong>
                                ${escapeHtml(member.name)}
                            </strong>

                            <span>
                                Class:
                                ${escapeHtml(member.className || "—")}
                                &nbsp; | &nbsp;
                                Section:
                                ${escapeHtml(member.section || "—")}
                            </span>

                        </div>
                        `
                    ).join("")}
                </div>
            </td>

            <td>
                ${escapeHtml(
                    data.MobileNumber ||
                    data.mobileNumber ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    data.EmailAddress ||
                    data.emailAddress ||
                    "—"
                )}
            </td>

            <td>
                <div class="events">
                    ${events.map(
                        event =>
                            `<span class="event">
                                ${escapeHtml(event)}
                            </span>`
                    ).join("")}
                </div>
            </td>

            <td>
                ${formatDate(data)}
            </td>

            <td>
                <button
                    class="edit-btn"
                    data-edit="${escapeHtml(key)}">
                    Edit
                </button>
            </td>
        `;


        body.appendChild(row);

    });


    document
        .querySelectorAll("[data-edit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openEditor(
                        button.dataset.edit
                    );

                }
            );

        });

}


/* =====================================================
   MEMBERS
===================================================== */

function getMembers(data){

    const result = [];


    result.push({

        name:
            data.StudentName ||
            data.studentName ||
            "",

        className:
            data.Class ||
            data.class ||
            "",

        section:
            data.Section ||
            data.section ||
            ""

    });


    for(let i = 2; i <= 5; i++){

        const name =
            data[`Member${i}Name`] ||
            data[`member${i}Name`];

        const className =
            data[`Member${i}Class`] ||
            data[`member${i}Class`];

        const section =
            data[`Member${i}Section`] ||
            data[`member${i}Section`];


        if(name || className || section){

            result.push({

                name: name || "",

                className: className || "",

                section: section || ""

            });

        }

    }


    /*
       Also support a members array/object
       if your registration.js stores it that way.
    */

    if(
        result.length === 1 &&
        data.members
    ){

        const members =
            Array.isArray(data.members)
                ? data.members
                : Object.values(data.members);


        members.forEach(member => {

            if(!member) return;

            result.push({

                name:
                    member.name ||
                    member.Name ||
                    "",

                className:
                    member.class ||
                    member.Class ||
                    "",

                section:
                    member.section ||
                    member.Section ||
                    ""

            });

        });

    }


    return result;

}


/* =====================================================
   EVENTS
===================================================== */

function getEvents(data){

    const value =
        data.Events ||
        data.events ||
        [];


    if(Array.isArray(value)){
        return value;
    }


    if(typeof value === "string"){

        return value
            .split(",")
            .map(x => x.trim())
            .filter(Boolean);

    }


    if(typeof value === "object"){

        return Object.values(value);

    }


    return [];

}


/* =====================================================
   EDITOR
===================================================== */

function openEditor(key){

    const data =
        registrations[key];

    if(!data) return;


    editKey.value =
        key;

    editStudentName.value =
        data.StudentName ||
        data.studentName ||
        "";

    editStudentClass.value =
        data.Class ||
        data.class ||
        "";

    editStudentSection.value =
        data.Section ||
        data.section ||
        "";

    editMobileNumber.value =
        data.MobileNumber ||
        data.mobileNumber ||
        "";

    editEmailAddress.value =
        data.EmailAddress ||
        data.emailAddress ||
        "";

    editTeamName.value =
        data.TeamName ||
        data.teamName ||
        "";

    editRemarks.value =
        data.Remarks ||
        data.remarks ||
        "";


    editMembers.innerHTML = "";


    const members =
        getMembers(data);


    members.forEach((member,index) => {

        if(index === 0) return;


        const number =
            index + 1;


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "edit-member";


        wrapper.innerHTML = `

            <label>
                Member ${number} Name
                <input
                    data-member-name="${number}"
                    value="${escapeAttribute(member.name)}">
            </label>

            <label>
                Class
                <select
                    data-member-class="${number}">

                    <option value="">Select</option>
                    <option value="VI">VI</option>
                    <option value="VII">VII</option>
                    <option value="VIII">VIII</option>
                    <option value="IX">IX</option>
                    <option value="X">X</option>
                    <option value="XI">XI</option>
                    <option value="XII">XII</option>

                </select>
            </label>

            <label>
                Section
                <input
                    data-member-section="${number}"
                    value="${escapeAttribute(member.section)}">
            </label>
        `;


        editMembers.appendChild(wrapper);


        const select =
            wrapper.querySelector(
                `[data-member-class="${number}"]`
            );


        select.value =
            member.className || "";

    });


    editMessage.textContent = "";

    editOverlay.classList.remove("hidden");

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

        if(!key) return;


        const updates = {};


        /*
          Keep the same field names as your
          registration form.
        */

        updates[`registrations/${key}/StudentName`] =
            editStudentName.value.trim();

        updates[`registrations/${key}/Class`] =
            editStudentClass.value;

        updates[`registrations/${key}/Section`] =
            editStudentSection.value.trim();

        updates[`registrations/${key}/MobileNumber`] =
            editMobileNumber.value.trim();

        updates[`registrations/${key}/EmailAddress`] =
            editEmailAddress.value.trim();

        updates[`registrations/${key}/TeamName`] =
            editTeamName.value.trim();

        updates[`registrations/${key}/Remarks`] =
            editRemarks.value.trim();


        for(let i = 2; i <= 5; i++){

            const nameInput =
                document.querySelector(
                    `[data-member-name="${i}"]`
                );

            const classInput =
                document.querySelector(
                    `[data-member-class="${i}"]`
                );

            const sectionInput =
                document.querySelector(
                    `[data-member-section="${i}"]`
                );


            if(nameInput){

                updates[
                    `registrations/${key}/Member${i}Name`
                ] =
                    nameInput.value.trim();

                updates[
                    `registrations/${key}/Member${i}Class`
                ] =
                    classInput.value;

                updates[
                    `registrations/${key}/Member${i}Section`
                ] =
                    sectionInput.value.trim();

            }

        }


        const saveButton =
            editForm.querySelector(
                ".save-btn"
            );


        saveButton.disabled = true;

        saveButton.textContent =
            "SAVING...";

        editMessage.textContent = "";


        try{

            await update(
                ref(db),
                updates
            );


            /*
              Update local copy immediately.
            */

            Object.entries(updates)
                .forEach(([path,value]) => {

                    const parts =
                        path.split("/");

                    const field =
                        parts[2];

                    registrations[key][field] =
                        value;

                });


            renderRegistrations();

            closeEditor();

            status.textContent =
                "Registration updated successfully.";


        }catch(error){

            console.error(error);

            editMessage.textContent =
                getFirebaseError(error);

        }


        saveButton.disabled = false;

        saveButton.textContent =
            "Save Changes";

    }
);


/* =====================================================
   CLOSE EDITOR
===================================================== */

function closeEditor(){

    editOverlay.classList.add("hidden");

    editForm.reset();

    editMembers.innerHTML = "";

}


closeEdit.addEventListener(
    "click",
    closeEditor
);


cancelEdit.addEventListener(
    "click",
    closeEditor
);


editOverlay.addEventListener(
    "click",
    event => {

        if(event.target === editOverlay){

            closeEditor();

        }

    }
);


/* =====================================================
   SEARCH
===================================================== */

search.addEventListener(
    "input",
    renderRegistrations
);


/* =====================================================
   REFRESH
===================================================== */

refreshBtn.addEventListener(
    "click",
    loadRegistrations
);


/* =====================================================
   LOGOUT
===================================================== */

logoutBtn.addEventListener(
    "click",
    async () => {

        try{

            await signOut(auth);

            window.location.replace(
                "login.html"
            );

        }catch(error){

            console.error(error);

        }

    }
);


/* =====================================================
   HELPERS
===================================================== */

function searchableText(key,data){

    const members =
        getMembers(data);

    const events =
        getEvents(data);


    return [

        key,

        data.RegistrationId,

        data.StudentName,

        data.Class,

        data.Section,

        data.TeamName,

        data.ParticipationType,

        data.TeamSize,

        data.MobileNumber,

        data.EmailAddress,

        data.Remarks,

        ...events,

        ...members.flatMap(member => [

            member.name,

            member.className,

            member.section

        ])

    ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

}


function getDateValue(data){

    const value =
        data.Timestamp ||
        data.timestamp ||
        data.CreatedAt ||
        data.createdAt ||
        data.Date ||
        data.date;


    if(typeof value === "number"){
        return value;
    }


    const parsed =
        Date.parse(value || "");

    return Number.isNaN(parsed)
        ? 0
        : parsed;

}


function formatDate(data){

    const value =
        getDateValue(data);

    if(!value){
        return "—";
    }


    return new Date(value)
        .toLocaleString(
            "en-IN",
            {
                dateStyle:"medium",
                timeStyle:"short"
            }
        );

}


function escapeHtml(value){

    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}


function escapeAttribute(value){

    return escapeHtml(value);

}


function getFirebaseError(error){

    if(!error){
        return "Unknown Firebase error.";
    }


    switch(error.code){

        case "PERMISSION_DENIED":
        case "permission-denied":
            return "Permission denied. Check Firebase Authentication and Realtime Database rules.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        default:
            return error.message ||
                "Unable to complete the request.";

    }

           }
