/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   MAIN WEBSITE JAVASCRIPT

   Firebase:
   Authentication NOT required for public registration.
   Registration data is stored in Realtime Database.

   Compatible with:
   admin.html
   admin.css
   admin.js
   thankyou.html
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
   DOM
===================================================== */

const preloader =
    document.getElementById("preloader");

const loaderProgress =
    document.getElementById("loaderProgress");

const siteHeader =
    document.getElementById("siteHeader");

const menuToggle =
    document.getElementById("menuToggle");

const mainNav =
    document.getElementById("mainNav");

const backToTop =
    document.getElementById("backToTop");

const registrationForm =
    document.getElementById("registrationForm");

const submitBtn =
    document.getElementById("submitBtn");

const formMessage =
    document.getElementById("formMessage");

const eventError =
    document.getElementById("eventError");


/* =====================================================
   PRELOADER
   ALWAYS FINISHES IN ~1.3 SECONDS
===================================================== */

let loaderStart =
    Date.now();


function runPreloader(){

    if(!preloader){
        return;
    }


    let progress = 0;


    const progressTimer =
        setInterval(() => {

            progress +=
                Math.random() * 8 + 5;


            if(progress > 100){
                progress = 100;
            }


            if(loaderProgress){

                loaderProgress.style.width =
                    `${progress}%`;

            }


            if(progress >= 100){

                clearInterval(
                    progressTimer
                );

            }

        }, 80);


    const finishLoader =
        () => {

            const elapsed =
                Date.now() -
                loaderStart;


            const remaining =
                Math.max(
                    0,
                    1250 - elapsed
                );


            setTimeout(() => {

                if(loaderProgress){

                    loaderProgress.style.width =
                        "100%";

                }


                setTimeout(() => {

                    preloader.classList.add(
                        "loaded"
                    );

                    document.body.classList.add(
                        "page-ready"
                    );

                }, 180);

            }, remaining);

        };


    if(document.readyState === "complete"){

        finishLoader();

    }
    else{

        window.addEventListener(
            "load",
            finishLoader,
            {
                once:true
            }
        );

        /* Safety fallback */

        setTimeout(
            finishLoader,
            1800
        );

    }

}


runPreloader();


/* =====================================================
   MOBILE MENU
===================================================== */

function openMenu(){

    menuToggle.classList.add(
        "active"
    );

    mainNav.classList.add(
        "open"
    );

    document.body.classList.add(
        "menu-open"
    );

    menuToggle.setAttribute(
        "aria-expanded",
        "true"
    );

}


function closeMenu(){

    menuToggle.classList.remove(
        "active"
    );

    mainNav.classList.remove(
        "open"
    );

    document.body.classList.remove(
        "menu-open"
    );

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
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


if(menuToggle){

    menuToggle.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            toggleMenu();

        }
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

document
.querySelectorAll(".nav-link")
.forEach(link => {

    link.addEventListener(
        "click",
        event => {

            const href =
                link.getAttribute("href");


            if(
                href &&
                href.startsWith("#")
            ){

                const target =
                    document.querySelector(
                        href
                    );


                if(target){

                    event.preventDefault();

                    closeMenu();

                    smoothScrollTo(
                        target
                    );

                }

            }

        }
    );

});


/* =====================================================
   SMOOTH SCROLL
===================================================== */

function smoothScrollTo(target){

    const headerHeight =
        siteHeader
        ? siteHeader.offsetHeight
        : 70;


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


/* =====================================================
   EVENT SELECT BUTTONS
===================================================== */

document
.querySelectorAll("[data-event]")
.forEach(button => {

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();


            const eventName =
                button.dataset.event;


            const checkbox =
                document.querySelector(
                    `input[name="Events"][value="${CSS.escape(eventName)}"]`
                );


            const registrationSection =
                document.getElementById(
                    "registration"
                );


            if(registrationSection){

                smoothScrollTo(
                    registrationSection
                );

            }


            if(checkbox){

                setTimeout(() => {

                    checkbox.checked =
                        true;

                    updateEventOption(
                        checkbox
                    );

                }, 450);

            }

        }
    );

});


/* =====================================================
   CHECKBOX VISUAL STATE
===================================================== */

document
.querySelectorAll(
    'input[name="Events"]'
)
.forEach(checkbox => {

    checkbox.addEventListener(
        "change",
        () => {

            updateEventOption(
                checkbox
            );

            validateEvents();

        }
    );

});


function updateEventOption(
    checkbox
){

    const option =
        checkbox.closest(
            ".event-option"
        );


    if(!option){
        return;
    }


    option.classList.toggle(
        "selected",
        checkbox.checked
    );

}


/* =====================================================
   HEADER SCROLL
===================================================== */

let lastScrollY =
    window.scrollY;


function handleScroll(){

    const currentY =
        window.scrollY;


    if(siteHeader){

        siteHeader.classList.toggle(
            "scrolled",
            currentY > 25
        );

    }


    if(backToTop){

        backToTop.classList.toggle(
            "show",
            currentY > 500
        );

    }


    updateActiveNavigation();


    lastScrollY =
        currentY;

}


window.addEventListener(
    "scroll",
    handleScroll,
    {
        passive:true
    }
);


handleScroll();


/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

const sections =
    [
        "home",
        "about",
        "events",
        "registration",
        "message",
        "contact"
    ]
    .map(id =>
        document.getElementById(id)
    )
    .filter(Boolean);


function updateActiveNavigation(){

    const headerHeight =
        siteHeader
        ? siteHeader.offsetHeight
        : 70;


    let current =
        "home";


    sections.forEach(section => {

        const rect =
            section.getBoundingClientRect();


        if(
            rect.top <=
            headerHeight + 180
        ){

            current =
                section.id;

        }

    });


    document
    .querySelectorAll(".nav-link")
    .forEach(link => {

        const href =
            link.getAttribute("href");


        link.classList.toggle(
            "active",
            href === `#${current}`
        );

    });

}


/* =====================================================
   BACK TO TOP
===================================================== */

if(backToTop){

    backToTop.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top:0,

                behavior:
                    "smooth"

            });

        }
    );

}


/* =====================================================
   REVEAL ANIMATIONS
===================================================== */

const revealElements =
    document.querySelectorAll(
        ".section-heading, .about-card, .about-main-card, .event-card, .registration-card, .registration-side, .message-card, .contact-card"
    );


revealElements
.forEach(element => {

    element.classList.add(
        "reveal"
    );

});


if("IntersectionObserver" in window){

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
                threshold:.08
            }
        );


    revealElements
    .forEach(element => {

        observer.observe(
            element
        );

    });

}
else{

    revealElements
    .forEach(element => {

        element.classList.add(
            "visible"
        );

    });

}


/* =====================================================
   MOBILE RESIZE
===================================================== */

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


/* =====================================================
   ESCAPE KEY
===================================================== */

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


/* =====================================================
   PHONE NUMBER
===================================================== */

const mobileInput =
    document.getElementById(
        "mobileNumber"
    );


if(mobileInput){

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

function getSelectedEvents(){

    return [
        ...document.querySelectorAll(
            'input[name="Events"]:checked'
        )
    ]
    .map(
        checkbox =>
            checkbox.value
    );

}


function validateEvents(){

    const selected =
        getSelectedEvents();


    if(selected.length === 0){

        if(eventError){

            eventError.textContent =
                "Please select at least one event.";

        }

        return false;

    }


    if(eventError){

        eventError.textContent =
            "";

    }


    return true;

}


/* =====================================================
   FORM MESSAGE
===================================================== */

function showFormMessage(
    message,
    type = "error"
){

    if(!formMessage){
        return;
    }


    formMessage.textContent =
        message;


    formMessage.className =
        `form-message show ${type}`;

}


function clearFormMessage(){

    if(!formMessage){
        return;
    }


    formMessage.textContent =
        "";

    formMessage.className =
        "form-message";

}


/* =====================================================
   FORM SUBMISSION
===================================================== */

if(registrationForm){

    registrationForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearFormMessage();


            if(!validateEvents()){

                showFormMessage(
                    "Please select at least one robotics event.",
                    "error"
                );

                document
                .querySelector(
                    ".event-selection"
                )
                ?.scrollIntoView({
                    behavior:"smooth",
                    block:"center"
                });

                return;

            }


            const formData =
                new FormData(
                    registrationForm
                );


            const studentName =
                String(
                    formData.get(
                        "StudentName"
                    ) || ""
                ).trim();


            const teamName =
                String(
                    formData.get(
                        "TeamName"
                    ) || ""
                ).trim();


            const className =
                String(
                    formData.get(
                        "Class"
                    ) || ""
                ).trim();


            const section =
                String(
                    formData.get(
                        "Section"
                    ) || ""
                ).trim();


            const mobileNumber =
                String(
                    formData.get(
                        "MobileNumber"
                    ) || ""
                ).trim();


            const emailAddress =
                String(
                    formData.get(
                        "EmailAddress"
                    ) || ""
                ).trim();


            if(
                mobileNumber.length !== 10
            ){

                showFormMessage(
                    "Please enter a valid 10-digit mobile number.",
                    "error"
                );

                mobileInput?.focus();

                return;

            }


            if(
                !isValidEmail(
                    emailAddress
                )
            ){

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


            const selectedEvents =
                getSelectedEvents();


            const member2Name =
                getFormValue(
                    formData,
                    "Member2Name"
                );

            const member3Name =
                getFormValue(
                    formData,
                    "Member3Name"
                );

            const member4Name =
                getFormValue(
                    formData,
                    "Member4Name"
                );

            const member5Name =
                getFormValue(
                    formData,
                    "Member5Name"
                );


            const teamSize =
                calculateTeamSize([
                    member2Name,
                    member3Name,
                    member4Name,
                    member5Name
                ]);


            const registrationId =
                createRegistrationId();


            const registrationDate =
                new Date().toISOString();


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

                TeamSize:
                    teamSize,

                Member2Name:
                    member2Name,

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
                    member3Name,

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
                    member4Name,

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
                    member5Name,

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

                Events:
                    selectedEvents,

                Remarks:
                    getFormValue(
                        formData,
                        "Remarks"
                    )

            };


            setSubmitLoading(
                true
            );


            try{

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


                /* -------------------------------------
                   STORE TEMPORARY THANK YOU DATA
                ------------------------------------- */

                try{

                    sessionStorage.setItem(
                        "apsRegistration",
                        JSON.stringify(
                            registrationData
                        )
                    );

                }
                catch(storageError){

                    console.warn(
                        "Session storage unavailable:",
                        storageError
                    );

                }


                showFormMessage(
                    "Registration successful. Redirecting...",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "thankyou.html";

                }, 650);

            }
            catch(error){

                console.error(
                    "Registration error:",
                    error
                );


                showFormMessage(
                    getFirebaseErrorMessage(
                        error
                    ),
                    "error"
                );


                setSubmitLoading(
                    false
                );

            }

        }
    );

}


/* =====================================================
   FORM HELPERS
===================================================== */

function getFormValue(
    formData,
    name
){

    return String(
        formData.get(name) || ""
    ).trim();

}


function calculateTeamSize(
    members
){

    let count =
        1;


    members.forEach(
        member => {

            if(
                member &&
                member.trim()
            ){

                count++;

            }

        }
    );


    return count;

}


function createRegistrationId(){

    const date =
        new Date();


    const year =
        date.getFullYear();


    const random =
        Math.floor(
            100000 +
            Math.random() * 900000
        );


    return `APS-RBC-${year}-${random}`;

}


function isValidEmail(
    email
){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* =====================================================
   SUBMIT BUTTON
===================================================== */

function setSubmitLoading(
    loading
){

    if(!submitBtn){
        return;
    }


    if(loading){

        submitBtn.disabled =
            true;

        submitBtn.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                SUBMITTING...
            </span>

        `;

    }
    else{

        submitBtn.disabled =
            false;

        submitBtn.innerHTML = `

            <span>
                SUBMIT REGISTRATION
            </span>

            <i class="fa-solid fa-arrow-right"></i>

        `;

    }

}


/* =====================================================
   FIREBASE ERROR MESSAGE
===================================================== */

function getFirebaseErrorMessage(
    error
){

    if(!error){

        return "Registration failed. Please try again.";

    }


    const code =
        error.code || "";


    if(
        code.includes(
            "permission-denied"
        )
    ){

        return "Registration is currently unavailable. Please contact the organizers.";

    }


    if(
        code.includes(
            "network"
        )
    ){

        return "Network error. Please check your internet connection and try again.";

    }


    if(
        code.includes(
            "unavailable"
        )
    ){

        return "Firebase is temporarily unavailable. Please try again.";

    }


    return "Unable to submit registration. Please check your connection and try again.";

}


/* =====================================================
   BEFORE UNLOAD
===================================================== */

window.addEventListener(
    "beforeunload",
    () => {

        document.body.classList.add(
            "leaving-page"
        );

    }
);


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* Set initial checkbox state */

        document
        .querySelectorAll(
            'input[name="Events"]'
        )
        .forEach(
            checkbox => {

                updateEventOption(
                    checkbox
                );

            }
        );


        /* Make links safe */

        document
        .querySelectorAll(
            'a[href="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                }
            );

        });

    }
);
