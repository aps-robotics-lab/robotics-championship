/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   MAIN WEBSITE JAVASCRIPT
   FIREBASE REALTIME DATABASE
===================================================== */

import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
    getDatabase,
    ref,
    push,
    set
}
from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";



/* =====================================================
   PRELOADER
===================================================== */

(function () {

    const preloader =
        document.getElementById("preloader");


    if (!preloader) {

        document.body.classList.remove(
            "preloader-active"
        );

        return;

    }


    let finished = false;


    function hidePreloader() {

        if (finished) {
            return;
        }


        finished = true;


        const status =
            document.getElementById(
                "loaderStatus"
            );


        if (status) {

            status.textContent =
                "SYSTEM READY";

        }


        preloader.classList.add(
            "preloader-hidden"
        );


        document.body.classList.remove(
            "preloader-active"
        );


        setTimeout(
            () => {

                if (
                    preloader &&
                    preloader.parentNode
                ) {

                    preloader.remove();

                }

            },
            700
        );

    }


    /*
     * Normal preloader duration.
     */

    setTimeout(
        hidePreloader,
        1350
    );


    /*
     * Absolute failsafe.
     * The loader can NEVER remain
     * longer than 2 seconds.
     */

    setTimeout(
        hidePreloader,
        2000
    );

})();



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

let app;

let database;


try {

    app =
        initializeApp(
            firebaseConfig
        );


    database =
        getDatabase(
            app
        );

}
catch (error) {

    console.error(
        "Firebase initialization failed:",
        error
    );

}



/* =====================================================
   DOM
===================================================== */

const header =
    document.getElementById(
        "header"
    );


const menuButton =
    document.getElementById(
        "menuButton"
    );


const mainNav =
    document.getElementById(
        "mainNav"
    );


const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


const registrationForm =
    document.getElementById(
        "registrationForm"
    );


const submitButton =
    document.getElementById(
        "submitButton"
    );


const formMessage =
    document.getElementById(
        "formMessage"
    );


const eventError =
    document.getElementById(
        "eventError"
    );


const mobileInput =
    document.getElementById(
        "mobileNumber"
    );



/* =====================================================
   MOBILE NAVIGATION
===================================================== */

if (
    menuButton &&
    mainNav
) {

    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                mainNav.classList.toggle(
                    "open"
                );


            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );


            menuButton.innerHTML =
                isOpen
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';

        }
    );


    navLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    mainNav.classList.remove(
                        "open"
                    );


                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );


                    menuButton.innerHTML =
                        '<i class="fa-solid fa-bars"></i>';

                }
            );

        }
    );

}



/* =====================================================
   HEADER SCROLL
===================================================== */

function handleHeaderScroll() {

    if (!header) {
        return;
    }


    if (
        window.scrollY > 40
    ) {

        header.classList.add(
            "scrolled"
        );

    }
    else {

        header.classList.remove(
            "scrolled"
        );

    }

}


window.addEventListener(
    "scroll",
    handleHeaderScroll,
    {
        passive: true
    }
);


handleHeaderScroll();



/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

const sections =
    document.querySelectorAll(
        "main section[id]"
    );


function updateActiveNav() {

    const scrollPosition =
        window.scrollY + 150;


    let currentSection =
        "home";


    sections.forEach(
        section => {

            const top =
                section.offsetTop;

            const bottom =
                top +
                section.offsetHeight;


            if (
                scrollPosition >= top &&
                scrollPosition < bottom
            ) {

                currentSection =
                    section.id;

            }

        }
    );


    navLinks.forEach(
        link => {

            const href =
                link.getAttribute(
                    "href"
                );


            link.classList.toggle(
                "active",
                href ===
                "#" + currentSection
            );

        }
    );

}


window.addEventListener(
    "scroll",
    updateActiveNav,
    {
        passive: true
    }
);


updateActiveNav();



/* =====================================================
   MOBILE NUMBER
===================================================== */

if (mobileInput) {

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

}



/* =====================================================
   EVENT CHECKBOXES
===================================================== */

const eventCheckboxes =
    document.querySelectorAll(
        'input[name="Events"]'
    );


function getSelectedEvents() {

    return Array.from(
        eventCheckboxes
    )
    .filter(
        checkbox =>
            checkbox.checked
    )
    .map(
        checkbox =>
            checkbox.value
    );

}


eventCheckboxes.forEach(
    checkbox => {

        checkbox.addEventListener(
            "change",
            () => {

                if (
                    getSelectedEvents()
                    .length > 0
                ) {

                    clearEventError();

                }

            }
        );

    }
);



function clearEventError() {

    if (eventError) {

        eventError.textContent =
            "";

    }

}



/* =====================================================
   FORM MESSAGE
===================================================== */

function showFormMessage(
    message,
    type
) {

    if (!formMessage) {
        return;
    }


    formMessage.textContent =
        message;


    formMessage.className =
        "form-message show " +
        type;

}


function clearFormMessage() {

    if (!formMessage) {
        return;
    }


    formMessage.textContent =
        "";


    formMessage.className =
        "form-message";

}



/* =====================================================
   GENERATE REGISTRATION ID
===================================================== */

function generateRegistrationId() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    const random =
        Math.floor(
            1000 +
            Math.random() *
            9000
        );


    return (
        `APS-RBC-${year}` +
        `-${month}${day}` +
        `-${random}`
    );

}



/* =====================================================
   GET VALUE
===================================================== */

function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return "";
    }


    return element.value.trim();

}



/* =====================================================
   VALIDATE MOBILE
===================================================== */

function isValidMobile(
    mobile
) {

    return /^[6-9]\d{9}$/.test(
        mobile
    );

}



/* =====================================================
   TEAM SIZE
===================================================== */

function calculateTeamSize(
    members
) {

    let size = 1;


    for (
        let i = 2;
        i <= 5;
        i++
    ) {

        if (
            members[
                `Member${i}Name`
            ]
            .trim()
        ) {

            size++;

        }

    }


    return size;

}



/* =====================================================
   FORM SUBMIT
===================================================== */

if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearFormMessage();

            clearEventError();



            /* -----------------------------------------
               CHECK FIREBASE
            ----------------------------------------- */

            if (!database) {

                showFormMessage(
                    "Registration system is temporarily unavailable. Please try again.",
                    "error"
                );

                return;

            }



            /* -----------------------------------------
               GET BASIC VALUES
            ----------------------------------------- */

            const teamName =
                getValue(
                    "teamName"
                );


            const studentName =
                getValue(
                    "studentName"
                );


            const className =
                getValue(
                    "className"
                );


            const section =
                getValue(
                    "sectionName"
                );


            const mobile =
                getValue(
                    "mobileNumber"
                );


            const email =
                getValue(
                    "emailAddress"
                );


            const remarks =
                getValue(
                    "remarks"
                );



            /* -----------------------------------------
               EVENTS
            ----------------------------------------- */

            const events =
                getSelectedEvents();


            if (
                events.length === 0
            ) {

                if (eventError) {

                    eventError.textContent =
                        "Please select at least one event.";

                }


                const eventBox =
                    document.getElementById(
                        "eventSelection"
                    );


                if (eventBox) {

                    eventBox.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }

                return;

            }



            /* -----------------------------------------
               MOBILE VALIDATION
            ----------------------------------------- */

            if (
                !isValidMobile(
                    mobile
                )
            ) {

                showFormMessage(
                    "Please enter a valid 10-digit Indian mobile number.",
                    "error"
                );

                document
                    .getElementById(
                        "mobileNumber"
                    )
                    ?.focus();

                return;

            }



            /* -----------------------------------------
               EMAIL VALIDATION
            ----------------------------------------- */

            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email)
            ) {

                showFormMessage(
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



            /* -----------------------------------------
               TEAM MEMBERS
            ----------------------------------------- */

            const members = {

                Member2Name:
                    getValue(
                        "member2Name"
                    ),

                Member2Class:
                    getValue(
                        "member2Class"
                    ),

                Member2Section:
                    getValue(
                        "member2Section"
                    ),


                Member3Name:
                    getValue(
                        "member3Name"
                    ),

                Member3Class:
                    getValue(
                        "member3Class"
                    ),

                Member3Section:
                    getValue(
                        "member3Section"
                    ),


                Member4Name:
                    getValue(
                        "member4Name"
                    ),

                Member4Class:
                    getValue(
                        "member4Class"
                    ),

                Member4Section:
                    getValue(
                        "member4Section"
                    ),


                Member5Name:
                    getValue(
                        "member5Name"
                    ),

                Member5Class:
                    getValue(
                        "member5Class"
                    ),

                Member5Section:
                    getValue(
                        "member5Section"
                    )

            };



            /* -----------------------------------------
               TEAM SIZE
            ----------------------------------------- */

            const teamSize =
                calculateTeamSize(
                    members
                );



            /* -----------------------------------------
               REGISTRATION ID
            ----------------------------------------- */

            const registrationId =
                generateRegistrationId();



            /* -----------------------------------------
               DATE
            ----------------------------------------- */

            const registrationDate =
                new Date()
                .toISOString();



            /* -----------------------------------------
               DATA
            ----------------------------------------- */

            const registrationData = {

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
                    mobile,

                EmailAddress:
                    email,

                Events:
                    events,

                TeamSize:
                    teamSize,

                Member2Name:
                    members.Member2Name,

                Member2Class:
                    members.Member2Class,

                Member2Section:
                    members.Member2Section,


                Member3Name:
                    members.Member3Name,

                Member3Class:
                    members.Member3Class,

                Member3Section:
                    members.Member3Section,


                Member4Name:
                    members.Member4Name,

                Member4Class:
                    members.Member4Class,

                Member4Section:
                    members.Member4Section,


                Member5Name:
                    members.Member5Name,

                Member5Class:
                    members.Member5Class,

                Member5Section:
                    members.Member5Section,


                Remarks:
                    remarks,

                registrationDate

            };



            /* -----------------------------------------
               LOADING STATE
            ----------------------------------------- */

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.classList.add(
                    "loading"
                );

            }



            try {


                /* -------------------------------------
                   CREATE DATABASE REFERENCE
                ------------------------------------- */

                const registrationsRef =
                    ref(
                        database,
                        "registrations"
                    );


                const newRegistrationRef =
                    push(
                        registrationsRef
                    );


                const registrationKey =
                    newRegistrationRef.key;



                /* -------------------------------------
                   SAVE TO FIREBASE
                ------------------------------------- */

                await set(
                    newRegistrationRef,
                    registrationData
                );



                /* -------------------------------------
                   SAVE LOCAL COPY
                ------------------------------------- */

                try {

                    sessionStorage.setItem(
                        "apsLastRegistration",
                        JSON.stringify({
                            ...registrationData,
                            databaseKey:
                                registrationKey
                        })
                    );

                }
                catch (
                    storageError
                ) {

                    console.warn(
                        "Session storage unavailable:",
                        storageError
                    );

                }



                /* -------------------------------------
                   SUCCESS
                ------------------------------------- */

                showFormMessage(
                    "Registration successful. Redirecting...",
                    "success"
                );


                /*
                 * Give Firebase a moment to finish
                 * before moving to thank.html.
                 */

                setTimeout(
                    () => {

                        window.location.href =
                            "thank.html";

                    },
                    700
                );

            }
            catch (error) {

                console.error(
                    "Registration failed:",
                    error
                );


                let message =
                    "Registration could not be completed. Please try again.";


                if (
                    error &&
                    error.code ===
                    "PERMISSION_DENIED"
                ) {

                    message =
                        "Firebase permission denied. Please check your Realtime Database rules.";

                }


                showFormMessage(
                    message,
                    "error"
                );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.classList.remove(
                        "loading"
                    );

                }

            }

        }
    );

}



/* =====================================================
   PREVENT DOUBLE SUBMISSION
===================================================== */

if (registrationForm) {

    registrationForm.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                event.target.tagName !==
                "TEXTAREA"
            ) {

                event.preventDefault();

            }

        }
    );

}



/* =====================================================
   SMOOTH INTERNAL LINKS
===================================================== */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link
                        .getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });

                }
            );

        }
    );



/* =====================================================
   BACK TO TOP
===================================================== */

const backTop =
    document.querySelector(
        ".back-top"
    );


if (backTop) {

    backTop.addEventListener(
        "click",
        event => {

            event.preventDefault();


            window.scrollTo({

                top: 0,

                behavior:
                    "smooth"

            });

        }
    );

}



/* =====================================================
   PAGE VISIBILITY
===================================================== */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            !document.hidden
        ) {

            updateActiveNav();

            handleHeaderScroll();

        }

    }
);



/* =====================================================
   FINAL SAFETY
===================================================== */

/*
 * If an unexpected JavaScript error happens later,
 * make absolutely sure the preloader cannot remain.
 */

window.addEventListener(
    "error",
    () => {

        const preloader =
            document.getElementById(
                "preloader"
            );


        if (
            preloader &&
            !preloader.classList.contains(
                "preloader-hidden"
            )
        ) {

            preloader.classList.add(
                "preloader-hidden"
            );


            document.body.classList.remove(
                "preloader-active"
            );

        }

    }
);


console.log(
    "APS Robotics Championship 2026 website initialized."
);
