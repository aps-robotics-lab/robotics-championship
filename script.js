/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   MAIN WEBSITE SCRIPT

   FIREBASE REGISTRATION
   + PRELOADER
   + MOBILE MENU
   + TEAM MEMBERS
   + FORM VALIDATION
===================================================== */

import {
    initializeApp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getDatabase,
    ref,
    push,
    set
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


const database =
    getDatabase(app);



/* =====================================================
   PRELOADER
===================================================== */

document.body.classList.add("loading");

const preloader =
    document.getElementById("preloader");


let preloaderFinished =
    false;


const preloadStart =
    Date.now();


function hidePreloader(){

    if(preloaderFinished){
        return;
    }


    preloaderFinished = true;


    preloader.classList.add("hide");


    document.body.classList.remove(
        "loading"
    );


    setTimeout(
        () => {

            if(preloader){

                preloader.remove();

            }

        },
        800
    );

}



/*
    Wait for the page to load,
    but never keep the user waiting.

    Minimum:
    approximately 1.2 seconds.

    Maximum:
    approximately 2.5 seconds.
*/

function startPreloader(){

    const elapsed =
        Date.now() - preloadStart;


    const minimumTime =
        1200;


    const remaining =
        Math.max(
            0,
            minimumTime - elapsed
        );


    setTimeout(
        hidePreloader,
        remaining
    );

}


/*
    Normal page load.
*/

if(document.readyState === "complete"){

    startPreloader();

}
else{

    window.addEventListener(
        "load",
        startPreloader,
        {
            once:true
        }
    );

}


/*
    Emergency fallback.

    Even if Firebase,
    fonts or another resource
    has a problem, the page
    will NOT remain on the
    loading screen.
*/

setTimeout(
    hidePreloader,
    2500
);



/* =====================================================
   NAVBAR
===================================================== */

const navbar =
    document.getElementById("navbar");


window.addEventListener(
    "scroll",
    () => {

        if(window.scrollY > 30){

            navbar.classList.add(
                "scrolled"
            );

        }
        else{

            navbar.classList.remove(
                "scrolled"
            );

        }

    }
);



/* =====================================================
   MOBILE MENU
===================================================== */

const menuToggle =
    document.getElementById("menuToggle");


const mobileMenu =
    document.getElementById("mobileMenu");


menuToggle.addEventListener(
    "click",
    () => {

        mobileMenu.classList.toggle(
            "show"
        );


        const icon =
            menuToggle.querySelector("i");


        icon.className =
            mobileMenu.classList.contains("show")
            ? "fa-solid fa-xmark"
            : "fa-solid fa-bars";

    }
);


mobileMenu
.querySelectorAll("a")
.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                mobileMenu.classList.remove(
                    "show"
                );


                menuToggle
                .querySelector("i")
                .className =
                    "fa-solid fa-bars";

            }
        );

    }
);



/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

const sections =
    document.querySelectorAll(
        "main section"
    );


const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if(!entry.isIntersecting){
                        return;
                    }


                    const id =
                        entry.target.id;


                    navLinks.forEach(
                        link => {

                            link.classList.toggle(
                                "active",
                                link.getAttribute("href")
                                === `#${id}`
                            );

                        }
                    );

                }
            );

        },
        {
            threshold:.25
        }
    );


sections.forEach(
    section => {

        observer.observe(
            section
        );

    }
);



/* =====================================================
   TEAM SIZE
===================================================== */

const teamSize =
    document.getElementById("teamSize");


const membersContainer =
    document.getElementById(
        "membersContainer"
    );


teamSize.addEventListener(
    "change",
    updateMembers
);


function updateMembers(){

    const size =
        Number(
            teamSize.value
        );


    membersContainer.innerHTML = "";


    if(!size || size <= 1){
        return;
    }


    for(
        let member = 2;
        member <= size;
        member++
    ){

        const card =
            document.createElement("div");


        card.className =
            "member-card";


        card.innerHTML = `

            <div class="member-card-title">

                <span>
                    ${String(member).padStart(2,"0")}
                </span>

                <strong>
                    Team Member ${member}
                </strong>

            </div>


            <div class="member-grid">


                <div class="input-group">

                    <label>
                        Member ${member} Name
                        <span>*</span>
                    </label>

                    <div class="input-box">

                        <i class="fa-solid fa-user"></i>

                        <input
                            type="text"
                            name="Member${member}Name"
                            placeholder="Member ${member} name"
                            required
                        >

                    </div>

                </div>


                <div class="input-group">

                    <label>
                        Class
                        <span>*</span>
                    </label>

                    <div class="input-box">

                        <i class="fa-solid fa-graduation-cap"></i>

                        <input
                            type="text"
                            name="Member${member}Class"
                            placeholder="Class"
                            required
                        >

                    </div>

                </div>


                <div class="input-group">

                    <label>
                        Section
                        <span>*</span>
                    </label>

                    <div class="input-box">

                        <i class="fa-solid fa-layer-group"></i>

                        <input
                            type="text"
                            name="Member${member}Section"
                            placeholder="Section"
                            required
                        >

                    </div>

                </div>

            </div>

        `;


        membersContainer.appendChild(
            card
        );

    }

}



/* =====================================================
   REGISTRATION FORM
===================================================== */

const registrationForm =
    document.getElementById(
        "registrationForm"
    );


const submitButton =
    document.getElementById(
        "submitRegistration"
    );


const formMessage =
    document.getElementById(
        "formMessage"
    );


const eventError =
    document.getElementById(
        "eventError"
    );


let submitting =
    false;



/* =====================================================
   FORM SUBMIT
===================================================== */

registrationForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if(submitting){
            return;
        }


        eventError.textContent = "";

        formMessage.textContent = "";

        formMessage.className =
            "form-message";


        /*
            Validate events.
        */

        const selectedEvents =
            Array.from(
                document.querySelectorAll(
                    'input[name="Events"]:checked'
                )
            )
            .map(
                checkbox =>
                    checkbox.value
            );


        if(selectedEvents.length === 0){

            eventError.textContent =
                "Please select at least one event.";

            document
            .getElementById("eventSelection")
            .scrollIntoView({
                behavior:"smooth",
                block:"center"
            });

            return;

        }


        /*
            Validate team size.
        */

        const selectedTeamSize =
            Number(
                teamSize.value
            );


        if(
            !selectedTeamSize ||
            selectedTeamSize < 1 ||
            selectedTeamSize > 5
        ){

            showFormError(
                "Please select a valid team size."
            );

            return;

        }


        /*
            Start submitting.
        */

        submitting = true;


        submitButton.disabled = true;


        submitButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Registering...
            </span>

        `;


        try{

            const formData =
                new FormData(
                    registrationForm
                );


            /*
                Generate Firebase key.
            */

            const registrationRef =
                push(
                    ref(
                        database,
                        "registrations"
                    )
                );


            const firebaseKey =
                registrationRef.key;


            /*
                Generate human-readable ID.
            */

            const registrationId =
                generateRegistrationId();


            /*
                Build registration object.
            */

            const registrationData = {

                registrationId:
                    registrationId,

                StudentName:
                    getFormValue(
                        formData,
                        "StudentName"
                    ),

                TeamName:
                    getFormValue(
                        formData,
                        "TeamName"
                    ),

                Class:
                    getFormValue(
                        formData,
                        "Class"
                    ),

                Section:
                    getFormValue(
                        formData,
                        "Section"
                    ),

                MobileNumber:
                    getFormValue(
                        formData,
                        "MobileNumber"
                    ),

                EmailAddress:
                    getFormValue(
                        formData,
                        "EmailAddress"
                    ),

                Events:
                    selectedEvents,

                TeamSize:
                    selectedTeamSize,

                registrationDate:
                    new Date().toISOString()

            };


            /*
                Add members.
            */

            for(
                let member = 2;
                member <= 5;
                member++
            ){

                const memberName =
                    getFormValue(
                        formData,
                        `Member${member}Name`
                    );


                const memberClass =
                    getFormValue(
                        formData,
                        `Member${member}Class`
                    );


                const memberSection =
                    getFormValue(
                        formData,
                        `Member${member}Section`
                    );


                if(member <= selectedTeamSize){

                    registrationData[
                        `Member${member}Name`
                    ] =
                        memberName;


                    registrationData[
                        `Member${member}Class`
                    ] =
                        memberClass;


                    registrationData[
                        `Member${member}Section`
                    ] =
                        memberSection;

                }

            }


            /*
                Save to Realtime Database.
            */

            await set(
                registrationRef,
                registrationData
            );


            /*
                Save temporary data
                for thank.html.
            */

            sessionStorage.setItem(
                "apsRegistration",
                JSON.stringify({
                    registrationId:
                        registrationId,

                    studentName:
                        registrationData.StudentName,

                    teamName:
                        registrationData.TeamName,

                    email:
                        registrationData.EmailAddress,

                    events:
                        selectedEvents,

                    teamSize:
                        selectedTeamSize
                })
            );


            /*
                Redirect.
            */

            window.location.href =
                "thank.html";


        }
        catch(error){

            console.error(
                "Registration error:",
                error
            );


            formMessage.className =
                "form-message error";


            formMessage.textContent =
                getFirebaseError(
                    error
                );


            submitButton.disabled =
                false;


            submitButton.innerHTML = `

                <i class="fa-solid fa-rocket"></i>

                <span>
                    Register My Team
                </span>

            `;


            submitting = false;

        }

    }
);



/* =====================================================
   FORM HELPERS
===================================================== */

function getFormValue(
    formData,
    name
){

    const value =
        formData.get(name);


    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    return String(value).trim();

}



function generateRegistrationId(){

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return `APS-RC26-${random}`;

}



function showFormError(
    message
){

    formMessage.className =
        "form-message error";


    formMessage.textContent =
        message;

}



function getFirebaseError(
    error
){

    if(!error){
        return "Registration failed.";
    }


    switch(error.code){

        case "PERMISSION_DENIED":

        case "database/permission-denied":

            return "Registration permission denied. Please contact the administrator.";

        case "NETWORK_ERROR":

            return "Network error. Please check your internet connection.";

        default:

            return "Unable to complete registration. Please try again.";

    }

}



/* =====================================================
   TOAST
===================================================== */

const toast =
    document.getElementById(
        "toast"
    );


const toastMessage =
    document.getElementById(
        "toastMessage"
    );


let toastTimeout;


function showToast(
    message
){

    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

    }
