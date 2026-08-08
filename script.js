/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   MAIN WEBSITE JAVASCRIPT

   Firebase:
   Authentication is NOT used here.
   Registration data is stored in:

   registrations/

===================================================== */


/* =====================================================
   FIREBASE IMPORTS
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
   FIREBASE INITIALIZATION
===================================================== */

const app =
    initializeApp(firebaseConfig);


const database =
    getDatabase(app);


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializePreloader();

        initializeNavigation();

        initializeSmoothScrolling();

        initializeScrollEffects();

        initializeRevealAnimation();

        initializeRegistration();

        initializeMobileNumber();

    }
);


/* =====================================================
   PRELOADER
===================================================== */

function initializePreloader(){

    const preloader =
        document.getElementById(
            "preloader"
        );


    if(!preloader){

        return;

    }


    /*
       The preloader will ALWAYS disappear.

       Minimum:
       approximately 1.2 seconds

       Maximum:
       approximately 1.8 seconds
    */

    const minimumTime =
        1200;


    const maximumTime =
        1800;


    const startTime =
        performance.now();


    let finished =
        false;


    function hidePreloader(){

        if(finished){

            return;

        }


        finished = true;


        const elapsed =
            performance.now() - startTime;


        const remaining =
            Math.max(
                0,
                minimumTime - elapsed
            );


        setTimeout(
            () => {

                preloader.classList.add(
                    "hide"
                );


                document.body.classList.remove(
                    "loading"
                );


                setTimeout(
                    () => {

                        preloader.remove();

                    },
                    700
                );

            },
            remaining
        );

    }


    /*
       Normal page load
    */

    if(
        document.readyState ===
        "complete"
    ){

        hidePreloader();

    }
    else{

        window.addEventListener(
            "load",
            hidePreloader,
            {
                once:true
            }
        );

    }


    /*
       Safety fallback.

       Even if something else fails,
       the preloader cannot remain
       forever.
    */

    setTimeout(
        hidePreloader,
        maximumTime
    );

}


/* =====================================================
   MOBILE NAVIGATION
===================================================== */

function initializeNavigation(){

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    const mainNav =
        document.getElementById(
            "mainNav"
        );


    if(
        !menuToggle ||
        !mainNav
    ){

        return;

    }


    function openMenu(){

        mainNav.classList.add(
            "open"
        );


        menuToggle.classList.add(
            "active"
        );


        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );


        menuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );


        document.body.classList.add(
            "menu-open"
        );

    }


    function closeMenu(){

        mainNav.classList.remove(
            "open"
        );


        menuToggle.classList.remove(
            "active"
        );


        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );


        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );


        document.body.classList.remove(
            "menu-open"
        );

    }


    function toggleMenu(){

        if(
            mainNav.classList.contains(
                "open"
            )
        ){

            closeMenu();

        }
        else{

            openMenu();

        }

    }


    menuToggle.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            toggleMenu();

        }
    );


    /*
       Close when a navigation link
       is selected.
    */

    mainNav
    .querySelectorAll(
        ".nav-link"
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    closeMenu();

                }
            );

        }
    );


    /*
       Close when clicking outside
       the navigation.
    */

    document.addEventListener(
        "click",
        event => {

            const clickedInsideNav =
                mainNav.contains(
                    event.target
                );


            const clickedButton =
                menuToggle.contains(
                    event.target
                );


            if(
                mainNav.classList.contains(
                    "open"
                ) &&
                !clickedInsideNav &&
                !clickedButton
            ){

                closeMenu();

            }

        }
    );


    /*
       Escape key
    */

    document.addEventListener(
        "keydown",
        event => {

            if(
                event.key === "Escape"
            ){

                closeMenu();

            }

        }
    );


    /*
       If screen becomes desktop,
       reset mobile menu.
    */

    window.addEventListener(
        "resize",
        () => {

            if(
                window.innerWidth > 800
            ){

                closeMenu();

            }

        }
    );

}


/* =====================================================
   SMOOTH SCROLLING
===================================================== */

function initializeSmoothScrolling(){

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if(
                        !href ||
                        href === "#"
                    ){

                        return;

                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if(!target){

                        return;

                    }


                    event.preventDefault();


                    const header =
                        document.getElementById(
                            "header"
                        );


                    const headerHeight =
                        header
                        ? header.offsetHeight
                        : 0;


                    const targetPosition =
                        target.getBoundingClientRect()
                        .top
                        +
                        window.scrollY
                        -
                        headerHeight
                        -
                        8;


                    window.scrollTo({

                        top:
                            Math.max(
                                0,
                                targetPosition
                            ),

                        behavior:
                            "smooth"

                    });


                    /*
                       Update URL without
                       jumping.
                    */

                    try{

                        history.pushState(
                            null,
                            "",
                            href
                        );

                    }
                    catch(error){

                        console.warn(
                            "History update failed:",
                            error
                        );

                    }

                }
            );

        }
    );

}


/* =====================================================
   HEADER SCROLL EFFECT
===================================================== */

function initializeScrollEffects(){

    const header =
        document.getElementById(
            "header"
        );


    if(!header){

        return;

    }


    let ticking =
        false;


    function updateHeader(){

        if(
            window.scrollY > 30
        ){

            header.classList.add(
                "scrolled"
            );

        }
        else{

            header.classList.remove(
                "scrolled"
            );

        }


        ticking = false;

    }


    window.addEventListener(
        "scroll",
        () => {

            if(!ticking){

                window.requestAnimationFrame(
                    updateHeader
                );

                ticking = true;

            }

        },
        {
            passive:true
        }
    );


    updateHeader();

}


/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

function initializeActiveNavigation(){

    const sections =
        document.querySelectorAll(
            "section[id]"
        );


    const links =
        document.querySelectorAll(
            ".nav-link"
        );


    if(
        !sections.length ||
        !links.length
    ){

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if(
                            entry.isIntersecting
                        ){

                            const id =
                                entry.target.id;


                            links.forEach(
                                link => {

                                    const target =
                                        link.getAttribute(
                                            "href"
                                        );


                                    link.classList.toggle(
                                        "active",
                                        target ===
                                        `#${id}`
                                    );

                                }
                            );

                        }

                    }
                );

            },
            {
                rootMargin:
                    "-35% 0px -55% 0px"
            }
        );


    sections.forEach(
        section => {

            observer.observe(
                section
            );

        }
    );

}


/* =====================================================
   REVEAL ANIMATION
===================================================== */

function initializeRevealAnimation(){

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if(!elements.length){

        return;

    }


    if(
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ){

        elements.forEach(
            element => {

                element.classList.add(
                    "visible"
                );

            }
        );

        return;

    }


    const observer =
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


                            observer.unobserve(
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


    elements.forEach(
        element => {

            observer.observe(
                element
            );

        }
    );


    initializeActiveNavigation();

}


/* =====================================================
   REGISTRATION
===================================================== */

function initializeRegistration(){

    const form =
        document.getElementById(
            "registrationForm"
        );


    if(!form){

        return;

    }


    const submitButton =
        document.getElementById(
            "submitRegistration"
        );


    const eventError =
        document.getElementById(
            "eventError"
        );


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /*
               Prevent accidental double
               submission.
            */

            if(
                submitButton.disabled
            ){

                return;

            }


            eventError.textContent =
                "";


            const formData =
                new FormData(form);


            const studentName =
                getFormValue(
                    formData,
                    "StudentName"
                );


            const teamName =
                getFormValue(
                    formData,
                    "TeamName"
                );


            const className =
                getFormValue(
                    formData,
                    "Class"
                );


            const section =
                getFormValue(
                    formData,
                    "Section"
                );


            const mobile =
                getFormValue(
                    formData,
                    "MobileNumber"
                );


            const email =
                getFormValue(
                    formData,
                    "EmailAddress"
                );


            const remarks =
                getFormValue(
                    formData,
                    "Remarks"
                );


            /*
               EVENTS

               Multiple checkboxes use:
               formData.getAll("Events")
            */

            const events =
                formData
                .getAll("Events")
                .map(
                    value =>
                        String(value).trim()
                )
                .filter(Boolean);


            /*
               EVENT VALIDATION
            */

            if(
                events.length === 0
            ){

                eventError.textContent =
                    "Please select at least one event.";

                const eventBox =
                    document.getElementById(
                        "eventSelection"
                    );


                if(eventBox){

                    eventBox.scrollIntoView({
                        behavior:"smooth",
                        block:"center"
                    });

                }


                return;

            }


            /*
               MOBILE VALIDATION
            */

            const cleanMobile =
                mobile.replace(
                    /\D/g,
                    ""
                );


            if(
                cleanMobile.length !== 10
            ){

                showToast(
                    "Please enter a valid 10-digit mobile number.",
                    "error"
                );

                document
                .getElementById(
                    "mobileNumber"
                )
                ?.focus();

                return;

            }


            /*
               EMAIL VALIDATION
            */

            if(
                !isValidEmail(email)
            ){

                showToast(
                    "Please enter a valid email address.",
                    "error"
                );

                document
                .getElementById(
                    "emailAddress"
                )
                ?.focus();

                return;

            }


            /*
               TEAM SIZE

               Leader + additional
               members.
            */

            let teamSize =
                1;


            for(
                let i = 2;
                i <= 5;
                i++
            ){

                const memberName =
                    getFormValue(
                        formData,
                        `Member${i}Name`
                    );


                if(memberName){

                    teamSize++;

                }

            }


            /*
               REGISTRATION ID
            */

            const registrationId =
                createRegistrationId();


            /*
               DATE
            */

            const registrationDate =
                new Date()
                .toISOString();


            /*
               DATABASE OBJECT

               Field names intentionally
               match your admin.js.
            */

            const registrationData = {

                registrationId:

                    registrationId,


                StudentName:

                    studentName,


                TeamName:

                    teamName,


                Class:

                    className,


                Section:

                    section,


                MobileNumber:

                    cleanMobile,


                EmailAddress:

                    email,


                Email:

                    email,


                Events:

                    events,


                TeamSize:

                    teamSize,


                Member2Name:

                    getFormValue(
                        formData,
                        "Member2Name"
                    ),


                Member2Class:

                    getFormValue(
                        formData,
                        "Member2Class"
                    ),


                Member2Section:

                    getFormValue(
                        formData,
                        "Member2Section"
                    ),


                Member3Name:

                    getFormValue(
                        formData,
                        "Member3Name"
                    ),


                Member3Class:

                    getFormValue(
                        formData,
                        "Member3Class"
                    ),


                Member3Section:

                    getFormValue(
                        formData,
                        "Member3Section"
                    ),


                Member4Name:

                    getFormValue(
                        formData,
                        "Member4Name"
                    ),


                Member4Class:

                    getFormValue(
                        formData,
                        "Member4Class"
                    ),


                Member4Section:

                    getFormValue(
                        formData,
                        "Member4Section"
                    ),


                Member5Name:

                    getFormValue(
                        formData,
                        "Member5Name"
                    ),


                Member5Class:

                    getFormValue(
                        formData,
                        "Member5Class"
                    ),


                Member5Section:

                    getFormValue(
                        formData,
                        "Member5Section"
                    ),


                Remarks:

                    remarks,


                registrationDate:

                    registrationDate

            };


            /*
               START LOADING
            */

            submitButton.disabled =
                true;


            submitButton.classList.add(
                "loading"
            );


            try{

                /*
                   Create a new Firebase
                   Realtime Database entry.
                */

                const registrationsRef =
                    ref(
                        database,
                        "registrations"
                    );


                const newRegistrationRef =
                    push(
                        registrationsRef
                    );


                await set(
                    newRegistrationRef,
                    registrationData
                );


                /*
                   Save ID locally so
                   thank.html can display it.
                */

                try{

                    sessionStorage.setItem(
                        "apsRegistrationId",
                        registrationId
                    );


                    sessionStorage.setItem(
                        "apsStudentName",
                        studentName
                    );


                    sessionStorage.setItem(
                        "apsTeamName",
                        teamName
                    );

                }
                catch(error){

                    console.warn(
                        "Session storage unavailable:",
                        error
                    );

                }


                showToast(
                    "Registration successful! Redirecting...",
                    "success"
                );


                /*
                   Small delay allows the
                   success message to appear.
                */

                setTimeout(
                    () => {

                        window.location.href =
                            "thank.html";

                    },
                    700
                );

            }
            catch(error){

                console.error(
                    "Firebase registration error:",
                    error
                );


                submitButton.disabled =
                    false;


                submitButton.classList.remove(
                    "loading"
                );


                let message =
                    "Registration failed. Please try again.";


                if(
                    error &&
                    error.code ===
                    "PERMISSION_DENIED"
                ){

                    message =
                        "Database permission denied. Please check Firebase Realtime Database rules.";

                }


                showToast(
                    message,
                    "error"
                );

            }

        }
    );

}


/* =====================================================
   GET FORM VALUE
===================================================== */

function getFormValue(
    formData,
    fieldName
){

    const value =
        formData.get(
            fieldName
        );


    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    return String(value).trim();

}


/* =====================================================
   CREATE REGISTRATION ID
===================================================== */

function createRegistrationId(){

    const now =
        new Date();


    const year =
        now.getFullYear();


    const random =
        Math
        .floor(
            100000 +
            Math.random() * 900000
        );


    return `APS-RC-${year}-${random}`;

}


/* =====================================================
   EMAIL VALIDATION
===================================================== */

function isValidEmail(
    email
){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            email
        );

}


/* =====================================================
   MOBILE INPUT
===================================================== */

function initializeMobileNumber(){

    const input =
        document.getElementById(
            "mobileNumber"
        );


    if(!input){

        return;

    }


    input.addEventListener(
        "input",
        () => {

            input.value =
                input.value
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

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer =
    null;


function showToast(
    message,
    type = "success"
){

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if(
        !toast ||
        !toastMessage
    ){

        return;

    }


    const icon =
        toast.querySelector(
            "i"
        );


    toastMessage.textContent =
        message;


    toast.classList.remove(
        "success",
        "error"
    );


    toast.classList.add(
        type
    );


    if(icon){

        if(type === "error"){

            icon.className =
                "fa-solid fa-circle-exclamation";

        }
        else{

            icon.className =
                "fa-solid fa-circle-check";

        }

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
   FIREBASE CONNECTION TEST
===================================================== */

window.addEventListener(
    "online",
    () => {

        console.log(
            "Internet connection restored."
        );

    }
);


window.addEventListener(
    "offline",
    () => {

        showToast(
            "You are offline. Please reconnect before registering.",
            "error"
        );

    }
);


/* =====================================================
   INITIAL MESSAGE
===================================================== */

console.log(
    "APS Robotics Championship 2026 website initialized."
);
