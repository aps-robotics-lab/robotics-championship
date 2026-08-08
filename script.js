/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   MAIN JAVASCRIPT
   FIREBASE REGISTRATION SYSTEM
===================================================== */


/* =====================================================
   FIREBASE IMPORTS
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
   DOM
===================================================== */

const preloader =
    document.getElementById("preloader");


const loadingPercent =
    document.getElementById("loadingPercent");


const menuToggle =
    document.getElementById("menuToggle");


const navMenu =
    document.getElementById("navMenu");


const registrationForm =
    document.getElementById("registrationForm");


const submitBtn =
    document.getElementById("submitBtn");


const submitNormal =
    document.querySelector(".submit-normal");


const submitLoading =
    document.querySelector(".submit-loading");


const formMessage =
    document.getElementById("formMessage");


const eventError =
    document.getElementById("eventError");


const toast =
    document.getElementById("toast");


const toastMessage =
    document.getElementById("toastMessage");



/* =====================================================
   PRELOADER
   AUTOMATICALLY CLOSES AFTER ~1.5 SECONDS
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!preloader) {
            return;
        }


        let currentPercent = 0;


        const percentTimer =
            setInterval(
                () => {

                    currentPercent += 2;


                    if (
                        currentPercent >= 100
                    ) {

                        currentPercent = 100;

                        clearInterval(
                            percentTimer
                        );

                    }


                    if (loadingPercent) {

                        loadingPercent.textContent =
                            currentPercent + "%";

                    }

                },
                28
            );


        setTimeout(
            () => {

                preloader.classList.add(
                    "preloader-hide"
                );


                setTimeout(
                    () => {

                        preloader.style.display =
                            "none";

                        document.body.classList.add(
                            "page-ready"
                        );

                    },
                    700
                );

            },
            1500
        );

    }
);



/* =====================================================
   MOBILE MENU
===================================================== */

if (menuToggle && navMenu) {

    menuToggle.addEventListener(
        "click",
        () => {

            navMenu.classList.toggle(
                "open"
            );


            const icon =
                menuToggle.querySelector("i");


            if (
                navMenu.classList.contains("open")
            ) {

                icon.className =
                    "fa-solid fa-xmark";

            }
            else {

                icon.className =
                    "fa-solid fa-bars";

            }

        }
    );


    navMenu
        .querySelectorAll(".nav-link")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        navMenu.classList.remove(
                            "open"
                        );


                        const icon =
                            menuToggle.querySelector("i");


                        icon.className =
                            "fa-solid fa-bars";

                    }
                );

            }
        );

}



/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

const sections =
    document.querySelectorAll(
        "main section[id]"
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

                    if (
                        entry.isIntersecting
                    ) {

                        const id =
                            entry.target.id;


                        navLinks.forEach(
                            link => {

                                link.classList.toggle(
                                    "active",
                                    link.getAttribute("href")
                                    ===
                                    "#" + id
                                );

                            }
                        );

                    }

                }
            );

        },
        {
            threshold: .2,
            rootMargin:
                "-80px 0px -45% 0px"
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
   HEADER SCROLL EFFECT
===================================================== */

const siteHeader =
    document.getElementById(
        "siteHeader"
    );


window.addEventListener(
    "scroll",
    () => {

        if (!siteHeader) {
            return;
        }


        if (window.scrollY > 30) {

            siteHeader.style.background =
                "rgba(2,8,16,.88)";

        }
        else {

            siteHeader.style.background =
                "rgba(2,8,16,.65)";

        }

    },
    {
        passive: true
    }
);



/* =====================================================
   EVENT SELECTION
===================================================== */

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


                if (selected.length > 0) {

                    eventError.textContent =
                        "";

                }

            }
        );

    }
);



function getSelectedEvents() {

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



/* =====================================================
   MOBILE NUMBER
===================================================== */

const mobileInput =
    document.getElementById(
        "mobileNumber"
    );


if (mobileInput) {

    mobileInput.addEventListener(
        "input",
        () => {

            mobileInput.value =
                mobileInput.value
                .replace(/\D/g, "")
                .slice(0, 10);

        }
    );

}



/* =====================================================
   FORM SUBMISSION
===================================================== */

if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearFormMessage();


            const selectedEvents =
                getSelectedEvents();


            /* =========================================
               EVENT VALIDATION
            ========================================= */

            if (
                selectedEvents.length === 0
            ) {

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


            /* =========================================
               FORM VALUES
            ========================================= */

            const studentName =
                valueOf("studentName");


            const teamName =
                valueOf("teamName");


            const className =
                valueOf("className");


            const section =
                valueOf("section");


            const mobileNumber =
                valueOf("mobileNumber");


            const emailAddress =
                valueOf("emailAddress");


            const remarks =
                valueOf("remarks");


            /* =========================================
               MOBILE VALIDATION
            ========================================= */

            if (
                !/^[0-9]{10}$/.test(
                    mobileNumber
                )
            ) {

                showFormMessage(
                    "Please enter a valid 10-digit mobile number.",
                    "error"
                );


                mobileInput.focus();

                return;

            }


            /* =========================================
               TEAM MEMBERS
            ========================================= */

            const member2Name =
                valueOf("member2Name");


            const member2Class =
                valueOf("member2Class");


            const member2Section =
                valueOf("member2Section");


            const member3Name =
                valueOf("member3Name");


            const member3Class =
                valueOf("member3Class");


            const member3Section =
                valueOf("member3Section");


            const member4Name =
                valueOf("member4Name");


            const member4Class =
                valueOf("member4Class");


            const member4Section =
                valueOf("member4Section");


            const member5Name =
                valueOf("member5Name");


            const member5Class =
                valueOf("member5Class");


            const member5Section =
                valueOf("member5Section");


            /* =========================================
               TEAM SIZE
            ========================================= */

            let teamSize = 1;


            if (member2Name) {
                teamSize++;
            }


            if (member3Name) {
                teamSize++;
            }


            if (member4Name) {
                teamSize++;
            }


            if (member5Name) {
                teamSize++;
            }



            /* =========================================
               REGISTRATION ID
            ========================================= */

            const registrationId =
                createRegistrationId();



            /* =========================================
               REGISTRATION DATE
            ========================================= */

            const registrationDate =
                new Date().toISOString();



            /* =========================================
               FIREBASE DATA
            ========================================= */

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

                    mobileNumber,


                EmailAddress:

                    emailAddress,


                TeamSize:

                    teamSize,


                Member2Name:

                    member2Name,


                Member2Class:

                    member2Class,


                Member2Section:

                    member2Section,


                Member3Name:

                    member3Name,


                Member3Class:

                    member3Class,


                Member3Section:

                    member3Section,


                Member4Name:

                    member4Name,


                Member4Class:

                    member4Class,


                Member4Section:

                    member4Section,


                Member5Name:

                    member5Name,


                Member5Class:

                    member5Class,


                Member5Section:

                    member5Section,


                Events:

                    selectedEvents,


                Remarks:

                    remarks,


                registrationDate:

                    registrationDate

            };



            /* =========================================
               BUTTON LOADING
            ========================================= */

            setSubmitLoading(true);



            try {

                /* =====================================
                   CREATE FIREBASE RECORD
                ===================================== */

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



                /* =====================================
                   SAVE CONFIRMATION DATA
                ===================================== */

                const confirmationData = {

                    ...registrationData,

                    firebaseKey:
                        newRegistrationRef.key

                };


                sessionStorage.setItem(
                    "apsRegistration",
                    JSON.stringify(
                        confirmationData
                    )
                );



                /* =====================================
                   SUCCESS
                ===================================== */

                showFormMessage(
                    "Registration successful. Redirecting...",
                    "success"
                );


                showToast(
                    "Registration submitted successfully.",
                    "success"
                );



                /* =====================================
                   REDIRECT
                ===================================== */

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
                    "Registration error:",
                    error
                );


                showFormMessage(
                    getFirebaseErrorMessage(error),
                    "error"
                );


                showToast(
                    "Registration could not be submitted.",
                    "error"
                );


                setSubmitLoading(false);

            }

        }
    );

}



/* =====================================================
   GET INPUT VALUE
===================================================== */

function valueOf(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value.trim();

}



/* =====================================================
   CREATE REGISTRATION ID
===================================================== */

function createRegistrationId() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return (
        "APSRC-" +
        year +
        "-" +
        random
    );

}



/* =====================================================
   SUBMIT BUTTON
===================================================== */

function setSubmitLoading(
    loading
) {

    if (!submitBtn) {
        return;
    }


    submitBtn.disabled =
        loading;


    if (submitNormal) {

        submitNormal.hidden =
            loading;

    }


    if (submitLoading) {

        submitLoading.hidden =
            !loading;

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
        "form-message " +
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
   TOAST
===================================================== */

let toastTimer;


function showToast(
    message,
    type = "success"
) {

    if (!toast) {
        return;
    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    const icon =
        toast.querySelector("i");


    if (icon) {

        icon.className =
            type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";


        icon.style.color =
            type === "error"
                ? "#ff5577"
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



/* =====================================================
   FIREBASE ERROR
===================================================== */

function getFirebaseErrorMessage(
    error
) {

    if (!error) {

        return (
            "Something went wrong. Please try again."
        );

    }


    if (
        error.code ===
        "PERMISSION_DENIED"
    ) {

        return (
            "Registration is currently unavailable. Please check Firebase Database Rules."
        );

    }


    if (
        error.code ===
        "NETWORK_ERROR"
    ) {

        return (
            "Network error. Please check your internet connection."
        );

    }


    if (
        error.message &&
        error.message.toLowerCase()
            .includes("permission")
    ) {

        return (
            "Database permission denied. Please contact the administrator."
        );

    }


    return (
        "Unable to submit registration. Please try again."
    );

}



/* =====================================================
   BACK TO TOP
===================================================== */

document
    .querySelector(".back-top")
    ?.addEventListener(
        "click",
        event => {

            event.preventDefault();


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );



/* =====================================================
   PREVENT DOUBLE SUBMISSION
===================================================== */

window.addEventListener(
    "beforeunload",
    () => {

        /* Allows browser to finish normal navigation. */

    }
);
