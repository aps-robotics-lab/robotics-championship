/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   MAIN WEBSITE SCRIPT

   Firebase:
   - Authentication is NOT required for registration
   - Realtime Database stores registrations
   - Existing registration structure preserved
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

let database = null;

try {

    const app =
        initializeApp(firebaseConfig);

    database =
        getDatabase(app);

}
catch (error) {

    console.error(
        "Firebase initialization failed:",
        error
    );

}



/* =====================================================
   DOM ELEMENTS
===================================================== */

const preloader =
    document.getElementById("preloader");


const loaderProgress =
    document.getElementById("loaderProgress");


const loaderStatus =
    document.getElementById("loaderStatus");


const header =
    document.getElementById("siteHeader");


const menuToggle =
    document.getElementById("menuToggle");


const mobileNav =
    document.getElementById("mobileNav");


const registrationForm =
    document.getElementById("registrationForm");


const submitButton =
    document.getElementById("submitRegistration");


const formMessage =
    document.getElementById("formMessage");


const toast =
    document.getElementById("toast");


const toastIcon =
    document.getElementById("toastIcon");


const toastMessage =
    document.getElementById("toastMessage");



/* =====================================================
   PRELOADER
   ALWAYS FINISHES
===================================================== */

function startPreloader() {

    let progress = 0;

    const statuses = [

        "INITIALIZING ROBOTICS SYSTEM",

        "LOADING CHAMPIONSHIP MODULES",

        "CONNECTING EVENT SYSTEM",

        "SYSTEM ONLINE"

    ];

    let statusIndex = 0;


    const interval =
        setInterval(() => {

            progress +=
                Math.floor(
                    Math.random() * 8
                ) + 4;


            if(progress > 100) {

                progress = 100;

            }


            if(loaderProgress) {

                loaderProgress.style.width =
                    progress + "%";

            }


            if(
                progress > 25 &&
                statusIndex === 0
            ) {

                statusIndex = 1;

                if(loaderStatus) {

                    loaderStatus.textContent =
                        statuses[statusIndex];

                }

            }


            if(
                progress > 55 &&
                statusIndex === 1
            ) {

                statusIndex = 2;

                if(loaderStatus) {

                    loaderStatus.textContent =
                        statuses[statusIndex];

                }

            }


            if(
                progress > 85 &&
                statusIndex === 2
            ) {

                statusIndex = 3;

                if(loaderStatus) {

                    loaderStatus.textContent =
                        statuses[statusIndex];

                }

            }


            if(progress >= 100) {

                clearInterval(interval);

                setTimeout(
                    hidePreloader,
                    250
                );

            }

        }, 80);


    /*
       SAFETY FALLBACK

       Even if something unexpected happens,
       the preloader can NEVER stay forever.
    */

    setTimeout(
        hidePreloader,
        1800
    );

}


function hidePreloader() {

    if(!preloader) {

        return;

    }


    preloader.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "loading"
    );


    setTimeout(() => {

        preloader.style.display =
            "none";

    }, 800);

}


document.addEventListener(
    "DOMContentLoaded",
    startPreloader
);



/* =====================================================
   MOBILE MENU
===================================================== */

function openMobileMenu() {

    menuToggle.classList.add(
        "open"
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


function closeMobileMenu() {

    menuToggle.classList.remove(
        "open"
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


function toggleMobileMenu() {

    const isOpen =
        mobileNav.classList.contains(
            "open"
        );


    if(isOpen) {

        closeMobileMenu();

    }
    else {

        openMobileMenu();

    }

}


if(menuToggle) {

    menuToggle.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            toggleMobileMenu();

        }
    );

}


/* Close menu when navigation item is clicked */

if(mobileNav) {

    mobileNav
    .querySelectorAll("a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                closeMobileMenu();

            }
        );

    });

}


/* Close menu when clicking outside */

document.addEventListener(
    "click",
    event => {

        if(
            mobileNav &&
            menuToggle &&
            mobileNav.classList.contains("open") &&
            !mobileNav.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            closeMobileMenu();

        }

    }
);



/* =====================================================
   SMOOTH NAVIGATION
===================================================== */

document
.querySelectorAll(
    'a[href^="#"]'
)
.forEach(link => {

    link.addEventListener(
        "click",
        event => {

            const targetId =
                link.getAttribute("href");


            if(
                !targetId ||
                targetId === "#"
            ) {

                return;

            }


            const target =
                document.querySelector(
                    targetId
                );


            if(!target) {

                return;

            }


            event.preventDefault();


            closeMobileMenu();


            const headerHeight =
                header
                ? header.offsetHeight
                : 0;


            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight +
                1;


            window.scrollTo({

                top:
                    targetPosition,

                behavior:
                    "smooth"

            });

        }
    );

});



/* =====================================================
   HEADER SCROLL EFFECT
===================================================== */

function updateHeader() {

    if(!header) {

        return;

    }


    if(window.scrollY > 30) {

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
    updateHeader,
    {
        passive: true
    }
);


updateHeader();



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


function updateActiveNav() {

    let current =
        "home";


    const scrollPosition =
        window.scrollY +
        (header ? header.offsetHeight : 80) +
        120;


    sections.forEach(section => {

        if(
            scrollPosition >=
            section.offsetTop
        ) {

            current =
                section.id;

        }

    });


    navLinks.forEach(link => {

        const href =
            link.getAttribute("href");


        link.classList.toggle(
            "active",
            href === "#" + current
        );

    });

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
   MOBILE NUMBER CLEANING
===================================================== */

const mobileInput =
    document.getElementById(
        "mobileNumber"
    );


if(mobileInput) {

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
   EVENT VALIDATION
===================================================== */

function getSelectedEvents() {

    return Array
        .from(
            document.querySelectorAll(
                'input[name="Events"]:checked'
            )
        )
        .map(
            checkbox =>
                checkbox.value
        );

}


function validateEvents() {

    const selected =
        getSelectedEvents();


    if(selected.length === 0) {

        showFormMessage(
            "Please select at least one robotics event.",
            "error"
        );


        const eventBox =
            document.getElementById(
                "eventSelection"
            );


        if(eventBox) {

            eventBox.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        }


        return false;

    }


    return true;

}



/* =====================================================
   EMAIL VALIDATION
===================================================== */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}



/* =====================================================
   FORM VALIDATION
===================================================== */

function validateRegistrationForm() {

    const studentName =
        document
        .getElementById(
            "studentName"
        )
        .value
        .trim();


    const teamName =
        document
        .getElementById(
            "teamName"
        )
        .value
        .trim();


    const studentClass =
        document
        .getElementById(
            "studentClass"
        )
        .value
        .trim();


    const studentSection =
        document
        .getElementById(
            "studentSection"
        )
        .value
        .trim();


    const mobile =
        document
        .getElementById(
            "mobileNumber"
        )
        .value
        .trim();


    const email =
        document
        .getElementById(
            "emailAddress"
        )
        .value
        .trim();


    if(studentName.length < 2) {

        showFormMessage(
            "Please enter the student's name.",
            "error"
        );

        return false;

    }


    if(teamName.length < 2) {

        showFormMessage(
            "Please enter a valid team name.",
            "error"
        );

        return false;

    }


    if(!studentClass) {

        showFormMessage(
            "Please enter the class.",
            "error"
        );

        return false;

    }


    if(!studentSection) {

        showFormMessage(
            "Please enter the section.",
            "error"
        );

        return false;

    }


    if(!/^[0-9]{10}$/.test(mobile)) {

        showFormMessage(
            "Please enter a valid 10-digit mobile number.",
            "error"
        );

        return false;

    }


    if(!isValidEmail(email)) {

        showFormMessage(
            "Please enter a valid email address.",
            "error"
        );

        return false;

    }


    if(!validateEvents()) {

        return false;

    }


    return true;

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


    return `APS-RBC-${year}-${random}`;

}



/* =====================================================
   GET OPTIONAL TEAM MEMBERS
===================================================== */

function getMemberData(formData) {

    const members = {};


    for(let i = 2; i <= 5; i++) {

        const name =
            String(
                formData.get(
                    `Member${i}Name`
                ) || ""
            ).trim();


        const className =
            String(
                formData.get(
                    `Member${i}Class`
                ) || ""
            ).trim();


        const section =
            String(
                formData.get(
                    `Member${i}Section`
                ) || ""
            ).trim();


        members[
            `Member${i}Name`
        ] = name;


        members[
            `Member${i}Class`
        ] = className;


        members[
            `Member${i}Section`
        ] = section;

    }


    return members;

}



/* =====================================================
   SUBMIT REGISTRATION
===================================================== */

if(registrationForm) {

    registrationForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if(!validateRegistrationForm()) {

                return;

            }


            if(!database) {

                showFormMessage(
                    "Database connection is unavailable. Please try again.",
                    "error"
                );

                showToast(
                    "Firebase connection failed.",
                    "error"
                );

                return;

            }


            const originalButton =
                submitButton.innerHTML;


            submitButton.disabled =
                true;


            submitButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Submitting...

            `;


            clearFormMessage();


            try {

                const formData =
                    new FormData(
                        registrationForm
                    );


                const registrationId =
                    createRegistrationId();


                const selectedEvents =
                    getSelectedEvents();


                const now =
                    new Date();


                const registrationDate =
                    now.toISOString();


                const memberData =
                    getMemberData(
                        formData
                    );


                const registrationData = {

                    registrationId:
                        registrationId,

                    StudentName:
                        String(
                            formData.get(
                                "StudentName"
                            ) || ""
                        ).trim(),

                    TeamName:
                        String(
                            formData.get(
                                "TeamName"
                            ) || ""
                        ).trim(),

                    Class:
                        String(
                            formData.get(
                                "Class"
                            ) || ""
                        ).trim(),

                    Section:
                        String(
                            formData.get(
                                "Section"
                            ) || ""
                        ).trim(),

                    MobileNumber:
                        String(
                            formData.get(
                                "MobileNumber"
                            ) || ""
                        ).trim(),

                    EmailAddress:
                        String(
                            formData.get(
                                "EmailAddress"
                            ) || ""
                        ).trim(),

                    Events:
                        selectedEvents,

                    TeamSize:
                        calculateTeamSize(
                            memberData
                        ),

                    Remarks:
                        String(
                            formData.get(
                                "Remarks"
                            ) || ""
                        ).trim(),

                    registrationDate:
                        registrationDate,

                    ...memberData

                };


                /*
                 * Preserve existing Firebase path:
                 *
                 * registrations/
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


                showFormMessage(
                    "Registration submitted successfully.",
                    "success"
                );


                showToast(
                    "Registration successful!",
                    "success"
                );


                /*
                 * Save temporary local data
                 * so thankyou.html can display it.
                 */

                try {

                    sessionStorage.setItem(
                        "apsRegistration",
                        JSON.stringify(
                            registrationData
                        )
                    );

                }
                catch(storageError) {

                    console.warn(
                        "Session storage unavailable:",
                        storageError
                    );

                }


                registrationForm.reset();


                /*
                 * Redirect after a short delay.
                 */

                setTimeout(() => {

                    window.location.href =
                        "thankyou.html";

                }, 900);

            }
            catch(error) {

                console.error(
                    "Registration error:",
                    error
                );


                showFormMessage(
                    getFirebaseErrorMessage(error),
                    "error"
                );


                showToast(
                    "Registration failed.",
                    "error"
                );

            }
            finally {

                submitButton.disabled =
                    false;


                submitButton.innerHTML =
                    originalButton;

            }

        }
    );

}



/* =====================================================
   TEAM SIZE
===================================================== */

function calculateTeamSize(
    memberData
) {

    let count = 1;


    for(let i = 2; i <= 5; i++) {

        const name =
            memberData[
                `Member${i}Name`
            ];


        if(
            name &&
            String(name).trim()
        ) {

            count++;

        }

    }


    return count;

}



/* =====================================================
   FIREBASE ERROR MESSAGE
===================================================== */

function getFirebaseErrorMessage(
    error
) {

    if(!error) {

        return "Something went wrong. Please try again.";

    }


    const code =
        error.code || "";


    switch(code) {

        case "PERMISSION_DENIED":

            return "Registration is currently unavailable. Please contact the organizers.";

        case "NETWORK_ERROR":

            return "Network error. Please check your internet connection.";

        default:

            return "Unable to submit registration. Please check your connection and try again.";

    }

}



/* =====================================================
   FORM MESSAGE
===================================================== */

function showFormMessage(
    message,
    type
) {

    if(!formMessage) {

        return;

    }


    formMessage.textContent =
        message;


    formMessage.className =
        "form-message show " +
        type;


    formMessage.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

}


function clearFormMessage() {

    if(!formMessage) {

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

let toastTimer = null;


function showToast(
    message,
    type = "success"
) {

    if(
        !toast ||
        !toastMessage ||
        !toastIcon
    ) {

        return;

    }


    toastMessage.textContent =
        message;


    if(type === "error") {

        toastIcon.className =
            "fa-solid fa-circle-exclamation";

    }
    else {

        toastIcon.className =
            "fa-solid fa-circle-check";

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3500);

}



/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape"
        ) {

            closeMobileMenu();

        }

    }
);



/* =====================================================
   HANDLE RESIZE
===================================================== */

window.addEventListener(
    "resize",
    () => {

        if(
            window.innerWidth > 850
        ) {

            closeMobileMenu();

        }

    }
);



/* =====================================================
   PAGE VISIBILITY
===================================================== */

document.addEventListener(
    "visibilitychange",
    () => {

        if(
            !document.hidden
        ) {

            updateHeader();

            updateActiveNav();

        }

    }
);



/* =====================================================
   FINAL SAFETY
===================================================== */

/*
 * If DOMContentLoaded somehow happened before
 * the preloader function was attached, this makes
 * sure the preloader still disappears.
 */

if(
    document.readyState === "interactive" ||
    document.readyState === "complete"
) {

    setTimeout(
        hidePreloader,
        1600
    );

}
