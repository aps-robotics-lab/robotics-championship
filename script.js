/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   PUBLIC WEBSITE SCRIPT
   FIREBASE REALTIME DATABASE
========================================================= */

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


/* =========================================================
   FIREBASE CONFIG
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

const app =
    initializeApp(firebaseConfig);


const database =
    getDatabase(app);


/* =========================================================
   DOM
========================================================= */

const pageLoader =
    document.getElementById(
        "pageLoader"
    );


const navbar =
    document.getElementById(
        "navbar"
    );


const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


const registrationForm =
    document.getElementById(
        "registrationForm"
    );


const submitButton =
    document.getElementById(
        "submitButton"
    );


const eventError =
    document.getElementById(
        "eventError"
    );


const remarks =
    document.getElementById(
        "remarks"
    );


const characterCount =
    document.getElementById(
        "characterCount"
    );


const toast =
    document.getElementById(
        "toast"
    );


const toastMessage =
    document.getElementById(
        "toastMessage"
    );


/* =========================================================
   PAGE LOADER
========================================================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(
            () => {

                pageLoader.classList.add(
                    "loaded"
                );

            },
            600
        );

    }
);


/* =========================================================
   NAVBAR SCROLL
========================================================= */

function handleNavbar(){

    if(
        window.scrollY > 30
    ){

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


window.addEventListener(
    "scroll",
    handleNavbar,
    {
        passive:true
    }
);


handleNavbar();


/* =========================================================
   MOBILE MENU
========================================================= */

menuToggle.addEventListener(
    "click",
    () => {

        mobileMenu.classList.toggle(
            "open"
        );

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
                    "open"
                );

            }
        );

    }
);


/* =========================================================
   NAV ACTIVE SECTION
========================================================= */

const sections =
    document.querySelectorAll(
        "main section[id]"
    );


const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


function updateActiveNav(){

    const current =
        window.scrollY + 150;


    sections.forEach(
        section => {

            const top =
                section.offsetTop;


            const height =
                section.offsetHeight;


            const id =
                section.id;


            if(
                current >= top &&
                current < top + height
            ){

                navLinks.forEach(
                    link => {

                        link.classList.toggle(
                            "active",
                            link.getAttribute(
                                "href"
                            ) === "#" + id
                        );

                    }
                );

            }

        }
    );

}


window.addEventListener(
    "scroll",
    updateActiveNav,
    {
        passive:true
    }
);


/* =========================================================
   REVEAL ANIMATION
========================================================= */

const revealObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if(
                        entry.isIntersecting
                    ){

                        entry.target.classList.add(
                            "visible"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },
        {
            threshold:.12
        }
    );


document
.querySelectorAll(".reveal")
.forEach(
    element => {

        revealObserver.observe(
            element
        );

    }
);


/* =========================================================
   FAQ
========================================================= */

document
.querySelectorAll(".faq-question")
.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const item =
                    button.closest(
                        ".faq-item"
                    );


                const currentlyOpen =
                    document.querySelector(
                        ".faq-item.open"
                    );


                if(
                    currentlyOpen &&
                    currentlyOpen !== item
                ){

                    currentlyOpen.classList.remove(
                        "open"
                    );

                }


                item.classList.toggle(
                    "open"
                );

            }
        );

    }
);


/* =========================================================
   MOBILE NUMBER
========================================================= */

const mobileInput =
    document.getElementById(
        "mobileNumber"
    );


mobileInput.addEventListener(
    "input",
    () => {

        mobileInput.value =
            mobileInput.value
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                10
            );

    }
);


/* =========================================================
   REMARKS CHARACTER COUNT
========================================================= */

remarks.addEventListener(
    "input",
    () => {

        characterCount.textContent =
            remarks.value.length;

    }
);


/* =========================================================
   EVENT SELECTION
========================================================= */

const eventCheckboxes =
    document.querySelectorAll(
        'input[name="Events"]'
    );


eventCheckboxes.forEach(
    checkbox => {

        checkbox.addEventListener(
            "change",
            () => {

                const selected =
                    getSelectedEvents();


                if(
                    selected.length
                ){

                    eventError.textContent =
                        "";

                }

            }
        );

    }
);


/* =========================================================
   GET EVENTS
========================================================= */

function getSelectedEvents(){

    return Array.from(
        document.querySelectorAll(
            'input[name="Events"]:checked'
        )
    )
    .map(
        checkbox =>
            checkbox.value
    );

}


/* =========================================================
   NORMALIZE
========================================================= */

function normalize(value){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    return String(value)
        .trim();

}


/* =========================================================
   GENERATE REGISTRATION ID
========================================================= */

function generateRegistrationID(){

    const now =
        new Date();


    const year =
        now.getFullYear();


    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return `APS-RC-${year}-${random}`;

}


/* =========================================================
   GET TEAM SIZE
========================================================= */

function calculateTeamSize(){

    let size = 1;


    for(
        let i = 2;
        i <= 5;
        i++
    ){

        const name =
            document.getElementById(
                `member${i}Name`
            ).value.trim();


        if(name){

            size++;

        }

    }


    return size;

}


/* =========================================================
   FORM VALIDATION
========================================================= */

function validateForm(){

    const studentName =
        document.getElementById(
            "studentName"
        ).value.trim();


    const teamName =
        document.getElementById(
            "teamName"
        ).value.trim();


    const classValue =
        document.getElementById(
            "class"
        ).value;


    const section =
        document.getElementById(
            "section"
        ).value.trim();


    const mobile =
        mobileInput.value.trim();


    const email =
        document.getElementById(
            "emailAddress"
        ).value.trim();


    if(
        !studentName ||
        !teamName ||
        !classValue ||
        !section ||
        !mobile ||
        !email
    ){

        showToast(
            "Please complete all required fields.",
            "error"
        );

        return false;

    }


    if(
        !/^[6-9]\d{9}$/.test(
            mobile
        )
    ){

        showToast(
            "Please enter a valid 10-digit Indian mobile number.",
            "error"
        );

        mobileInput.focus();

        return false;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if(
        !emailPattern.test(email)
    ){

        showToast(
            "Please enter a valid email address.",
            "error"
        );

        return false;

    }


    const events =
        getSelectedEvents();


    if(
        events.length === 0
    ){

        eventError.textContent =
            "Please select at least one event.";

        showToast(
            "Please select at least one event.",
            "error"
        );

        return false;

    }


    eventError.textContent =
        "";

    return true;

}


/* =========================================================
   FORM SUBMISSION
========================================================= */

registrationForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if(
            !validateForm()
        ){

            return;

        }


        const originalButtonHTML =
            submitButton.innerHTML;


        submitButton.disabled =
            true;


        submitButton.innerHTML = `

            <i
                class="fa-solid fa-spinner fa-spin"
            ></i>

            Processing Registration...

        `;


        try{

            const registrationID =
                generateRegistrationID();


            const registrationDate =
                new Date()
                .toISOString();


            const events =
                getSelectedEvents();


            const data = {

                registrationId:
                    registrationID,

                registrationDate:
                    registrationDate,

                StudentName:
                    document
                    .getElementById(
                        "studentName"
                    )
                    .value
                    .trim(),

                TeamName:
                    document
                    .getElementById(
                        "teamName"
                    )
                    .value
                    .trim(),

                Class:
                    document
                    .getElementById(
                        "class"
                    )
                    .value
                    .trim(),

                Section:
                    document
                    .getElementById(
                        "section"
                    )
                    .value
                    .trim(),

                MobileNumber:
                    mobileInput
                    .value
                    .trim(),

                EmailAddress:
                    document
                    .getElementById(
                        "emailAddress"
                    )
                    .value
                    .trim(),

                Events:
                    events,

                TeamSize:
                    calculateTeamSize(),

                Member2Name:
                    document
                    .getElementById(
                        "member2Name"
                    )
                    .value
                    .trim(),

                Member2Class:
                    document
                    .getElementById(
                        "member2Class"
                    )
                    .value
                    .trim(),

                Member2Section:
                    document
                    .getElementById(
                        "member2Section"
                    )
                    .value
                    .trim(),

                Member3Name:
                    document
                    .getElementById(
                        "member3Name"
                    )
                    .value
                    .trim(),

                Member3Class:
                    document
                    .getElementById(
                        "member3Class"
                    )
                    .value
                    .trim(),

                Member3Section:
                    document
                    .getElementById(
                        "member3Section"
                    )
                    .value
                    .trim(),

                Member4Name:
                    document
                    .getElementById(
                        "member4Name"
                    )
                    .value
                    .trim(),

                Member4Class:
                    document
                    .getElementById(
                        "member4Class"
                    )
                    .value
                    .trim(),

                Member4Section:
                    document
                    .getElementById(
                        "member4Section"
                    )
                    .value
                    .trim(),

                Member5Name:
                    document
                    .getElementById(
                        "member5Name"
                    )
                    .value
                    .trim(),

                Member5Class:
                    document
                    .getElementById(
                        "member5Class"
                    )
                    .value
                    .trim(),

                Member5Section:
                    document
                    .getElementById(
                        "member5Section"
                    )
                    .value
                    .trim(),

                Remarks:
                    remarks.value.trim()

            };


            /* =============================================
               CREATE DATABASE REFERENCE
            ============================================== */

            const registrationsRef =
                ref(
                    database,
                    "registrations"
                );


            const newRegistrationRef =
                push(
                    registrationsRef
                );


            /* =============================================
               SAVE TO FIREBASE
            ============================================== */

            await set(
                newRegistrationRef,
                data
            );


            /* =============================================
               SAVE TEMPORARY CONFIRMATION DATA
               FOR THANKYOU PAGE
            ============================================== */

            try{

                sessionStorage.setItem(
                    "apsRegistration",
                    JSON.stringify(data)
                );

            }
            catch(storageError){

                console.warn(
                    "Session storage unavailable:",
                    storageError
                );

            }


            /* =============================================
               REDIRECT
            ============================================== */

            window.location.href =
                `thankyou.html?id=${encodeURIComponent(
                    registrationID
                )}`;

        }
        catch(error){

            console.error(
                "Firebase registration error:",
                error
            );


            let message =
                "Registration failed. Please try again.";


            if(
                error &&
                error.code ===
                "PERMISSION_DENIED"
            ){

                message =
                    "Firebase permission denied. Please contact the event administrator.";

            }


            if(
                error &&
                error.message &&
                error.message.includes(
                    "permission"
                )
            ){

                message =
                    "Database permission denied. Please contact the event administrator.";

            }


            showToast(
                message,
                "error"
            );


            submitButton.disabled =
                false;


            submitButton.innerHTML =
                originalButtonHTML;

        }

    }
);


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(
    message,
    type = "success"
){

    clearTimeout(
        toastTimer
    );


    toastMessage.textContent =
        message;


    const icon =
        toast.querySelector(
            "i"
        );


    if(
        type === "error"
    ){

        icon.className =
            "fa-solid fa-circle-exclamation";

        icon.style.color =
            "#ff5573";

    }
    else{

        icon.className =
            "fa-solid fa-circle-check";

        icon.style.color =
            "#00ff9d";

    }


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            4000
        );

}


/* =========================================================
   PREVENT DOUBLE SUBMISSION
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        /*
         * Browser handles page navigation.
         * Firebase write is awaited before redirect.
         */

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

console.log(
    "APS Robotics Championship 2026 website initialized."
);

console.log(
    "Firebase Realtime Database connected."
);
