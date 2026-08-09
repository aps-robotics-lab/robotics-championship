/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   ADMIN DASHBOARD
   Firebase Authentication + Realtime Database
===================================================== */

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
    onValue
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);


/* =====================================================
   APPROVED ADMIN UID LIST
   ALL SIX USERS
===================================================== */

const ADMIN_UIDS = new Set([

    "7pHSV8jhyBQHAGErYbALg5NqGCE2",

    "8645cVYSFQQZeS9GDZuguc3W46y1",

    "uGBclDQGTEYKahRKZaLYXz8Dk8y2",

    "7MRUvQS043fA1nFwcJAyUWRxjiu1",

    "nxAJHhZ93hZmtsDEnjWKn4nPCUH2",

    "BrSfKmoCkWd40jVhUfWs3SO2fCE3"

]);


/* =====================================================
   ELEMENTS
   Matches your admin.html exactly
===================================================== */

const loginCard =
    document.getElementById("loginCard");

const dashboard =
    document.getElementById("dashboard");

const logoutBtn =
    document.getElementById("logoutBtn");

const searchInput =
    document.getElementById("search");

const refreshBtn =
    document.getElementById("refreshBtn");

const registrationBody =
    document.getElementById("registrationBody");

const statusBox =
    document.getElementById("status");


/* =====================================================
   DATA
===================================================== */

let registrations = {};

let databaseListenerAttached = false;


/* =====================================================
   AUTHENTICATION
===================================================== */

onAuthStateChanged(auth, async user => {

    if (!user) {

        showLogin();

        return;
    }


    console.log(
        "Signed-in Firebase user:",
        user.uid
    );


    /* ---------------------------------------------
       CHECK ADMIN UID
    --------------------------------------------- */

    if (!ADMIN_UIDS.has(user.uid)) {

        console.warn(
            "Unauthorized admin attempt:",
            user.uid
        );

        showStatus(
            "Access denied. This account is not authorized as an administrator.",
            "error"
        );

        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "Sign-out error:",
                error
            );
        }

        showLogin();

        return;
    }


    /* ---------------------------------------------
       AUTHORIZED ADMIN
    --------------------------------------------- */

    showDashboard();

    showStatus(
        "Admin authenticated successfully.",
        "success"
    );


    loadRegistrations();

});


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {

    if (loginCard) {
        loginCard.classList.remove("hidden");
    }

    if (dashboard) {
        dashboard.classList.add("hidden");
    }
}


/* =====================================================
   SHOW DASHBOARD
===================================================== */

function showDashboard() {

    if (loginCard) {
        loginCard.classList.add("hidden");
    }

    if (dashboard) {
        dashboard.classList.remove("hidden");
    }
}


/* =====================================================
   STATUS MESSAGE
===================================================== */

function showStatus(message, type = "") {

    if (!statusBox) {
        return;
    }

    statusBox.textContent = message;

    statusBox.className = "status";

    if (type) {
        statusBox.classList.add(type);
    }
}


/* =====================================================
   LOAD REGISTRATIONS
===================================================== */

function loadRegistrations() {

    if (databaseListenerAttached) {
        return;
    }

    databaseListenerAttached = true;


    /*
       IMPORTANT:

       This expects registrations to be stored at:

       registrations/

       Example:

       registrations/
           APS-2026-001/
           APS-2026-002/
           APS-2026-003/
    */

    const registrationsRef =
        ref(database, "registrations");


    onValue(
        registrationsRef,

        snapshot => {

            if (!snapshot.exists()) {

                registrations = {};

                renderRegistrations();

                showStatus(
                    "No registrations found.",
                    "success"
                );

                return;
            }


            registrations =
                snapshot.val() || {};


            renderRegistrations();


            const count =
                Object.keys(registrations).length;


            showStatus(
                `${count} registration${count === 1 ? "" : "s"} loaded.`,
                "success"
            );

        },

        error => {

            console.error(
                "Realtime Database error:",
                error
            );


            showStatus(
                "Could not load registrations. Check your Firebase Realtime Database rules.",
                "error"
            );

        }
    );
}


/* =====================================================
   RENDER REGISTRATIONS
===================================================== */

function renderRegistrations() {

    if (!registrationBody) {
        return;
    }


    registrationBody.innerHTML = "";


    const search =
        (searchInput?.value || "")
            .trim()
            .toLowerCase();


    const entries =
        Object.entries(registrations);


    if (!entries.length) {

        registrationBody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align:center;padding:30px;">
                    No registrations found.
                </td>
            </tr>
        `;

        return;
    }


    let visibleCount = 0;


    entries.forEach(([key, registration]) => {

        const data =
            registration || {};


        const registrationId =
            value(
                data.registrationId,
                data.RegistrationId,
                data.id,
                key
            );


        const leader =
            value(
                data.studentName,
                data.StudentName,
                data.leaderName,
                data.LeaderName
            );


        const team =
            value(
                data.teamName,
                data.TeamName
            );


        const size =
            value(
                data.teamSize,
                data.TeamSize,
                data.ParticipationType
            );


        const studentClass =
            value(
                data.studentClass,
                data.Class
            );


        const section =
            value(
                data.studentSection,
                data.Section
            );


        const mobile =
            value(
                data.mobileNumber,
                data.MobileNumber,
                data.mobile,
                data.phone
            );


        const email =
            value(
                data.emailAddress,
                data.EmailAddress,
                data.email
            );


        const events =
            getEvents(data);


        const members =
            getMembers(data);


        const date =
            getDate(data);


        /*
           Search across all important fields
        */

        const searchableText = [

            registrationId,
            leader,
            team,
            size,
            studentClass,
            section,
            mobile,
            email,
            events,
            members,
            date

        ]
            .join(" ")
            .toLowerCase();


        if (
            search &&
            !searchableText.includes(search)
        ) {

            return;
        }


        visibleCount++;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHtml(registrationId)}
                </strong>
            </td>

            <td>
                ${escapeHtml(leader)}
            </td>

            <td>
                ${escapeHtml(team)}
            </td>

            <td>
                ${escapeHtml(size)}
            </td>

            <td>
                ${escapeHtml(studentClass)}
            </td>

            <td>
                ${escapeHtml(section)}
            </td>

            <td>
                ${escapeHtml(mobile)}
            </td>

            <td>
                ${escapeHtml(email)}
            </td>

            <td>
                ${escapeHtml(events)}
            </td>

            <td>
                ${escapeHtml(members)}
            </td>

            <td>
                ${escapeHtml(date)}
            </td>

        `;


        registrationBody.appendChild(row);

    });


    if (visibleCount === 0) {

        registrationBody.innerHTML = `

            <tr>

                <td
                    colspan="11"
                    style="text-align:center;padding:30px;"
                >
                    No matching registrations found.
                </td>

            </tr>

        `;

    }

}


/* =====================================================
   GET VALUE
===================================================== */

function value(...values) {

    for (const item of values) {

        if (
            item !== undefined &&
            item !== null &&
            String(item).trim() !== ""
        ) {

            return String(item);

        }

    }

    return "—";
}


/* =====================================================
   EVENTS
===================================================== */

function getEvents(data) {

    let events =
        data.events ??
        data.Events ??
        data.selectedEvents ??
        "";


    if (Array.isArray(events)) {

        return events.join(", ");

    }


    if (typeof events === "object" && events !== null) {

        return Object.values(events).join(", ");

    }


    return value(events);

}


/* =====================================================
   TEAM MEMBERS
===================================================== */

function getMembers(data) {

    const members = [];


    /*
       Member 2
    */

    addMember(
        members,
        data.member2Name,
        data.Member2Name,
        data.member2Class,
        data.Member2Class,
        data.member2Section,
        data.Member2Section
    );


    /*
       Member 3
    */

    addMember(
        members,
        data.member3Name,
        data.Member3Name,
        data.member3Class,
        data.Member3Class,
        data.member3Section,
        data.Member3Section
    );


    /*
       Member 4
    */

    addMember(
        members,
        data.member4Name,
        data.Member4Name,
        data.member4Class,
        data.Member4Class,
        data.member4Section,
        data.Member4Section
    );


    /*
       Member 5
    */

    addMember(
        members,
        data.member5Name,
        data.Member5Name,
        data.member5Class,
        data.Member5Class,
        data.member5Section,
        data.Member5Section
    );


    /*
       Alternative structure:

       members: [
           {
               name,
               class,
               section
           }
       ]
    */

    const arrayMembers =
        data.members ??
        data.Members;


    if (Array.isArray(arrayMembers)) {

        arrayMembers.forEach(member => {

            if (!member) {
                return;
            }


            const name =
                value(
                    member.name,
                    member.Name,
                    member.studentName,
                    member.StudentName
                );


            const studentClass =
                value(
                    member.class,
                    member.Class
                );


            const section =
                value(
                    member.section,
                    member.Section
                );


            if (name !== "—") {

                members.push(
                    `${name} (${studentClass}, ${section})`
                );

            }

        });

    }


    return members.length
        ? members.join(" | ")
        : "—";
}


/* =====================================================
   ADD MEMBER
===================================================== */

function addMember(
    members,
    name1,
    name2,
    class1,
    class2,
    section1,
    section2
) {

    const name =
        value(name1, name2);


    if (name === "—") {
        return;
    }


    const studentClass =
        value(class1, class2);


    const section =
        value(section1, section2);


    members.push(
        `${name} (${studentClass}, ${section})`
    );

}


/* =====================================================
   DATE
===================================================== */

function getDate(data) {

    const raw =
        data.timestamp ??
        data.Timestamp ??
        data.createdAt ??
        data.CreatedAt ??
        data.date ??
        data.Date;


    if (!raw) {
        return "—";
    }


    /*
       Firebase timestamp number
    */

    if (
        typeof raw === "number" ||
        /^\d+$/.test(String(raw))
    ) {

        const date =
            new Date(Number(raw));


        if (!isNaN(date.getTime())) {

            return formatDate(date);

        }

    }


    /*
       Firebase timestamp object
    */

    if (
        typeof raw === "object" &&
        raw.seconds
    ) {

        const date =
            new Date(
                Number(raw.seconds) * 1000
            );


        return formatDate(date);

    }


    /*
       Normal date string
    */

    const date =
        new Date(raw);


    if (!isNaN(date.getTime())) {

        return formatDate(date);

    }


    return String(raw);

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(date) {

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHtml(valueToEscape) {

    const text =
        String(valueToEscape ?? "");


    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   SEARCH
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderRegistrations
    );

}


/* =====================================================
   REFRESH
===================================================== */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        () => {

            renderRegistrations();

            showStatus(
                "Dashboard refreshed.",
                "success"
            );

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            logoutBtn.disabled = true;

            try {

                await signOut(auth);

                window.location.replace(
                    "login.html"
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                logoutBtn.disabled = false;

                showStatus(
                    "Could not log out. Please try again.",
                    "error"
                );

            }

        }
    );

}
