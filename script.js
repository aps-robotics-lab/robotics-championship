/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   MAIN WEBSITE JAVASCRIPT

   Firebase Realtime Database
   Registration System
   Mobile Navigation
   Smooth Scrolling
   Preloader
   Animations
========================================================= */


/* =========================================================
   FIREBASE IMPORTS
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
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initPreloader();

        initMobileMenu();

        initSmoothScrolling();

        initHeader();

        initRevealAnimations();

        initActiveNavigation();

        initRegistration();

        initMobileNumber();

    }
);


/* =========================================================
   PRELOADER
========================================================= */

function initPreloader(){

    const preloader =
        document.getElementById(
            "preloader"
        );


    const loaderProgress =
        document.getElementById(
            "loaderProgress"
        );


    if(!preloader){

        return;

    }


    /*
     * Start progress immediately.
     */

    if(loaderProgress){

        loaderProgress.style.width =
            "100%";

    }


    /*
     * Always remove the preloader.
     *
     * This prevents the site from getting
     * stuck on the loading screen.
     */

    const hidePreloader =
        () => {

            preloader.classList.add(
                "hide"
            );

            document.body.style.overflowX =
                "hidden";

        };


    /*
     * 1.2 second automatic transition.
     */

    setTimeout(
        hidePreloader,
        1200
    );


    /*
     * Safety fallback.
     */

    setTimeout(
        hidePreloader,
        2500
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function initMobileMenu(){

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    const mobileNav =
        document.getElementById(
            "mobileNav"
        );


    if(
        !menuToggle ||
        !mobileNav
    ){

        return;

    }


    function openMenu(){

        menuToggle.classList.add(
            "active"
        );

        mobileNav.classList.add(
            "open"
        );

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add(
            "menu-open"
        );

    }


    function closeMenu(){

        menuToggle.classList.remove(
            "active"
        );

        mobileNav.classList.remove(
            "open"
        );

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "menu-open"
        );

    }


    menuToggle.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            if(
                mobileNav.classList.contains(
                    "open"
                )
            ){

                closeMenu();

            }
            else{

                openMenu();

            }

        }
    );


    /*
     * Close when clicking a mobile link.
     */

    mobileNav
    .querySelectorAll(
        "a"
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
     * Close when tapping outside.
     */

    document.addEventListener(
        "click",
        event => {

            if(
                !mobileNav.contains(event.target) &&
                !menuToggle.contains(event.target)
            ){

                closeMenu();

            }

        }
    );


    /*
     * Close with Escape.
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
     * Close if browser becomes desktop width.
     */

    window.addEventListener(
        "resize",
        () => {

            if(
                window.innerWidth > 850
            ){

                closeMenu();

            }

        }
    );

}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initSmoothScrolling(){

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


                    const targetTop =
                        target.getBoundingClientRect()
                        .top
                        +
                        window.scrollY
                        -
                        headerHeight
                        +
                        1;


                    window.scrollTo({

                        top:
                            Math.max(
                                0,
                                targetTop
                            ),

                        behavior:
                            "smooth"

                    });

                }
            );

        }
    );

}


/* =========================================================
   HEADER
========================================================= */

function initHeader(){

    const header =
        document.getElementById(
            "header"
        );


    if(!header){

        return;

    }


    function updateHeader(){

        if(
            window.scrollY > 25
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

    }


    updateHeader();


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );

}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initRevealAnimations(){

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if(
        !elements.length
    ){

        return;

    }


    /*
     * IntersectionObserver provides
     * smooth and efficient animations.
     */

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
                threshold: 0.12
            }
        );


    elements.forEach(
        element => {

            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function initActiveNavigation(){

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    if(
        !sections.length ||
        !navLinks.length
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


                            navLinks.forEach(
                                link => {

                                    const isActive =
                                        link.getAttribute(
                                            "href"
                                        ) ===
                                        "#" + id;


                                    link.classList.toggle(
                                        "active",
                                        isActive
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


/* =========================================================
   MOBILE NUMBER
========================================================= */

function initMobileNumber(){

    const mobile =
        document.getElementById(
            "mobileNumber"
        );


    if(!mobile){

        return;

    }


    mobile.addEventListener(
        "input",
        () => {

            mobile.value =
                mobile.value
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


/* =========================================================
   REGISTRATION
========================================================= */

function initRegistration(){

    const form =
        document.getElementById(
            "registrationForm"
        );


    if(!form){

        return;

    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const submitButton =
                document.getElementById(
                    "submitBtn"
                );


            const formMessage =
                document.getElementById(
                    "formMessage"
                );


            const eventError =
                document.getElementById(
                    "eventError"
                );


            /*
             * Reset messages.
             */

            formMessage.classList.remove(
                "show"
            );

            formMessage.textContent =
                "";


            eventError.textContent =
                "";


            /*
             * Prevent double submission.
             */

            if(
                submitButton.disabled
            ){

                return;

            }


            /*
             * Read fields.
             */

            const studentName =
                getValue(
                    "studentName"
                );


            const teamName =
                getValue(
                    "teamName"
                );


            const className =
                getValue(
                    "class"
                );


            const section =
                getValue(
                    "section"
                );


            const mobileNumber =
                getValue(
                    "mobileNumber"
                );


            const emailAddress =
                getValue(
                    "emailAddress"
                );


            const remarks =
                getValue(
                    "remarks"
                );


            /*
             * Events.
             */

            const events =
                Array.from(
                    document.querySelectorAll(
                        'input[name="Events"]:checked'
                    )
                )
                .map(
                    input =>
                        input.value
                );


            /*
             * Basic validation.
             */

            if(
                !studentName ||
                !teamName ||
                !className ||
                !section ||
                !mobileNumber ||
                !emailAddress
            ){

                showFormError(
                    formMessage,
                    "Please complete all required team leader fields."
                );

                return;

            }


            /*
             * Mobile validation.
             */

            if(
                !/^[6-9]\d{9}$/.test(
                    mobileNumber
                )
            ){

                showFormError(
                    formMessage,
                    "Please enter a valid 10-digit Indian mobile number."
                );

                document
                .getElementById(
                    "mobileNumber"
                )
                .focus();

                return;

            }


            /*
             * Email validation.
             */

            if(
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(emailAddress)
            ){

                showFormError(
                    formMessage,
                    "Please enter a valid email address."
                );

                return;

            }


            /*
             * At least one event.
             */

            if(
                events.length === 0
            ){

                eventError.textContent =
                    "Please select at least one event.";

                document
                .getElementById(
                    "eventSelection"
                )
                .scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                return;

            }


            /*
             * Team size.
             */

            const teamSize =
                calculateTeamSize();


            /*
             * Generate registration ID.
             */

            const registrationId =
                generateRegistrationId();


            /*
             * Registration date.
             */

            const registrationDate =
                new Date().toISOString();


            /*
             * Collect team members.
             */

            const member2 =
                collectMember(2);


            const member3 =
                collectMember(3);


            const member4 =
                collectMember(4);


            const member5 =
                collectMember(5);


            /*
             * Firebase data.
             *
             * These field names intentionally
             * match your existing admin.js.
             */

            const registrationData = {

                registrationId:

                    registrationId,

                registrationDate:

                    registrationDate,

                StudentName:

                    studentName,

                TeamName:

                    teamName,

                Class:

                    className,

                Section:

                    section,

                MobileNumber:

                    mobileNumber,

                EmailAddress:

                    emailAddress,

                Events:

                    events,

                TeamSize:

                    teamSize,

                Member2Name:

                    member2.name,

                Member2Class:

                    member2.className,

                Member2Section:

                    member2.section,

                Member3Name:

                    member3.name,

                Member3Class:

                    member3.className,

                Member3Section:

                    member3.section,

                Member4Name:

                    member4.name,

                Member4Class:

                    member4.className,

                Member4Section:

                    member4.section,

                Member5Name:

                    member5.name,

                Member5Class:

                    member5.className,

                Member5Section:

                    member5.section,

                Remarks:

                    remarks

            };


            /*
             * Start loading state.
             */

            setSubmitLoading(
                submitButton,
                true
            );


            try{

                /*
                 * Create new registration.
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


                /*
                 * Save data.
                 */

                await set(
                    newRegistrationRef,
                    registrationData
                );


                /*
                 * Save locally so thankyou.html
                 * can access registration information
                 * if your thankyou page wants it.
                 */

                try{

                    localStorage.setItem(
                        "apsLastRegistration",
                        JSON.stringify({
                            key:
                                newRegistrationRef.key,
                            ...registrationData
                        })
                    );

                }
                catch(storageError){

                    console.warn(
                        "Local storage unavailable:",
                        storageError
                    );

                }


                /*
                 * Success message.
                 */

                showToast(
                    "Registration submitted successfully."
                );


                /*
                 * Redirect to existing
                 * thankyou.html.
                 */

                setTimeout(
                    () => {

                        window.location.href =
                            "thankyou.html?id=" +
                            encodeURIComponent(
                                registrationId
                            );

                    },
                    500
                );

            }
            catch(error){

                console.error(
                    "Firebase registration error:",
                    error
                );


                let message =
                    "Registration could not be submitted. Please try again.";


                if(
                    error &&
                    error.code ===
                    "PERMISSION_DENIED"
                ){

                    message =
                        "Firebase permission denied. Please check your Realtime Database rules.";

                }


                showFormError(
                    formMessage,
                    message
                );


                showToast(
                    "Registration failed.",
                    true
                );


                setSubmitLoading(
                    submitButton,
                    false
                );

            }

        }
    );

}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(id){

    const element =
        document.getElementById(
            id
        );


    if(!element){

        return "";

    }


    return element.value.trim();

}


/* =========================================================
   COLLECT MEMBER
========================================================= */

function collectMember(number){

    const name =
        getValue(
            `member${number}Name`
        );


    const className =
        getValue(
            `member${number}Class`
        );


    const section =
        getValue(
            `member${number}Section`
        );


    return {

        name:

            name,

        className:

            className,

        section:

            section

    };

}


/* =========================================================
   TEAM SIZE
========================================================= */

function calculateTeamSize(){

    let size =
        1;


    for(
        let i = 2;
        i <= 5;
        i++
    ){

        const name =
            getValue(
                `member${i}Name`
            );


        if(name){

            size++;

        }

    }


    return size;

}


/* =========================================================
   REGISTRATION ID
========================================================= */

function generateRegistrationId(){

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        )
        .padStart(
            2,
            "0"
        );


    const random =
        Math
        .floor(
            1000 +
            Math.random() * 9000
        );


    return (
        "APS-RBC-" +
        year +
        month +
        day +
        "-" +
        random
    );

}


/* =========================================================
   SUBMIT LOADING
========================================================= */

function setSubmitLoading(
    button,
    loading
){

    if(!button){

        return;

    }


    button.disabled =
        loading;


    button.classList.toggle(
        "loading",
        loading
    );

}


/* =========================================================
   FORM ERROR
========================================================= */

function showFormError(
    element,
    message
){

    if(!element){

        return;

    }


    element.textContent =
        message;


    element.classList.add(
        "show"
    );


    element.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer =
    null;


function showToast(
    message,
    error = false
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


    toastMessage.textContent =
        message;


    const icon =
        toast.querySelector(
            "i"
        );


    if(icon){

        icon.className =
            error
            ? "fa-solid fa-circle-exclamation"
            : "fa-solid fa-circle-check";

        icon.style.color =
            error
            ? "#ff7180"
            : "#00ff9d";

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


/* =========================================================
   PAGE VISIBILITY SAFETY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        /*
         * Nothing destructive happens when the
         * user switches browser tabs.
         */

    }
);
