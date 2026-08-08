/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   FIREBASE
========================================================= */

/*
   IMPORTANT:

   Replace ONLY the firebaseConfig below with the
   SAME Firebase configuration you already use.

   Do NOT create another Firebase project.

   Your admin panel should continue reading the same
   Firebase database.
*/

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* =========================================================
   YOUR EXISTING FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    /*
      PASTE YOUR EXISTING FIREBASE CONFIG HERE.

      Example structure:

      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT.firebaseapp.com",
      databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
      projectId: "YOUR_PROJECT",
      storageBucket: "YOUR_PROJECT.firebasestorage.app",
      messagingSenderId: "YOUR_ID",
      appId: "YOUR_APP_ID"
    */

};


/* =========================================================
   FIREBASE INITIALIZATION
========================================================= */

let db = null;

let firebaseReady = false;

try {

    if (
        firebaseConfig &&
        firebaseConfig.apiKey &&
        firebaseConfig.databaseURL
    ) {

        const app = initializeApp(firebaseConfig);

        db = getDatabase(app);

        firebaseReady = true;

    }

} catch (error) {

    console.error(
        "Firebase initialization failed:",
        error
    );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializePreloader();

        initializeMobileMenu();

        initializeHeader();

        initializeSmoothScrolling();

        initializeRevealAnimations();

        initializeRegistration();

        initializeMobileInput();

    }
);


/* =========================================================
   PRELOADER
========================================================= */

function initializePreloader() {

    const preloader =
        document.getElementById("preloader");

    if (!preloader) {
        return;
    }


    /*
       The preloader automatically finishes
       after approximately 1.4 seconds.
    */

    const hidePreloader = () => {

        preloader.classList.add("loaded");

        document.body.classList.remove(
            "preloader-active"
        );

    };


    window.addEventListener(
        "load",
        () => {

            setTimeout(
                hidePreloader,
                1400
            );

        }
    );


    /*
       Backup timer.

       This prevents the website from remaining
       stuck on the preloader if something external
       takes too long to load.
    */

    setTimeout(
        hidePreloader,
        2200
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    const menuToggle =
        document.getElementById("menuToggle");

    const mobileNav =
        document.getElementById("mobileNav");

    if (!menuToggle || !mobileNav) {
        return;
    }


    function openMenu() {

        menuToggle.classList.add("active");

        mobileNav.classList.add("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add(
            "menu-open"
        );

    }


    function closeMenu() {

        menuToggle.classList.remove("active");

        mobileNav.classList.remove("open");

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
        () => {

            const isOpen =
                mobileNav.classList.contains("open");

            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }

        }
    );


    const mobileLinks =
        mobileNav.querySelectorAll(
            "a"
        );


    mobileLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                closeMenu
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                mobileNav.classList.contains("open") &&
                !mobileNav.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {

                closeMenu();

            }

        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 850
            ) {

                closeMenu();

            }

        }
    );

}


/* =========================================================
   HEADER
========================================================= */

function initializeHeader() {

    const header =
        document.getElementById("header");

    if (!header) {
        return;
    }


    function updateHeader() {

        if (window.scrollY > 30) {

            header.classList.add(
                "scrolled"
            );

        } else {

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


    /* Active navigation */

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

                        if (!entry.isIntersecting) {
                            return;
                        }

                        const id =
                            entry.target.id;

                        navLinks.forEach(
                            link => {

                                link.classList.toggle(
                                    "active",
                                    link.getAttribute("href") ===
                                    `#${id}`
                                );

                            }
                        );

                    }
                );

            },
            {
                threshold: 0.25,
                rootMargin: "-80px 0px -40% 0px"
            }
        );


    sections.forEach(
        section => observer.observe(section)
    );

}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initializeSmoothScrolling() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute("href");


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


                    const header =
                        document.getElementById(
                            "header"
                        );


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

                        top: targetPosition,

                        behavior: "smooth"

                    });

                }
            );

        }
    );

}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initializeRevealAnimations() {

    const revealElements =
        document.querySelectorAll(
            ".reveal"
        );


    if (!revealElements.length) {
        return;
    }


    if (
        !("IntersectionObserver" in window)
    ) {

        revealElements.forEach(
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

                        if (
                            entry.isIntersecting
                        ) {

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


    revealElements.forEach(
        element => observer.observe(element)
    );

}


/* =========================================================
   REGISTRATION SYSTEM
========================================================= */

function initializeRegistration() {

    const form =
        document.getElementById(
            "registrationForm"
        );

    if (!form) {
        return;
    }


    const soloType =
        document.getElementById(
            "soloType"
        );

    const teamType =
        document.getElementById(
            "teamType"
        );

    const teamMembersSection =
        document.getElementById(
            "teamMembersSection"
        );

    const teamNameGroup =
        document.getElementById(
            "teamNameGroup"
        );

    const teamName =
        document.getElementById(
            "teamName"
        );

    const teamSize =
        document.getElementById(
            "teamSize"
        );

    const submitBtn =
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


    /* =====================================================
       SOLO / TEAM
    ===================================================== */

    function updateParticipationMode() {

        const isTeam =
            teamType &&
            teamType.checked;


        if (isTeam) {

            /* Show team name */

            if (teamNameGroup) {

                teamNameGroup.style.display =
                    "";

            }


            if (teamName) {

                teamName.required =
                    true;

            }


            /* Show team members */

            if (teamMembersSection) {

                teamMembersSection.classList.add(
                    "show"
                );

            }


            updateTeamMembers();

        } else {

            /* SOLO */

            if (teamNameGroup) {

                teamNameGroup.style.display =
                    "none";

            }


            if (teamName) {

                teamName.required =
                    false;

                teamName.value =
                    "";

            }


            /*
               Completely hide team members.
            */

            if (teamMembersSection) {

                teamMembersSection.classList.remove(
                    "show"
                );

            }


            /*
               Clear all team member inputs
               when switching to Solo.
            */

            clearTeamMembers();

        }

    }


    if (soloType) {

        soloType.addEventListener(
            "change",
            updateParticipationMode
        );

    }


    if (teamType) {

        teamType.addEventListener(
            "change",
            updateParticipationMode
        );

    }


    /* =====================================================
       TEAM SIZE
    ===================================================== */

    if (teamSize) {

        teamSize.addEventListener(
            "change",
            updateTeamMembers
        );

    }


    function updateTeamMembers() {

        if (
            !teamType ||
            !teamType.checked
        ) {

            return;

        }


        const size =
            Number(teamSize.value);


        for (
            let member = 2;
            member <= 5;
            member++
        ) {

            const card =
                document.getElementById(
                    `member${member}Card`
                );


            const nameInput =
                document.getElementById(
                    `member${member}Name`
                );

            const classInput =
                document.getElementById(
                    `member${member}Class`
                );

            const sectionInput =
                document.getElementById(
                    `member${member}Section`
                );


            /*
               Example:

               Team size 2
               → Member 02 visible
               → Member 03-05 hidden

               Team size 5
               → Member 02-05 visible
            */

            if (
                card &&
                member <= size
            ) {

                card.classList.remove(
                    "hidden-member"
                );

            } else if (card) {

                card.classList.add(
                    "hidden-member"
                );

                if (nameInput) {
                    nameInput.value = "";
                }

                if (classInput) {
                    classInput.value = "";
                }

                if (sectionInput) {
                    sectionInput.value = "";
                }

            }

        }

    }


    function clearTeamMembers() {

        for (
            let member = 2;
            member <= 5;
            member++
        ) {

            const card =
                document.getElementById(
                    `member${member}Card`
                );

            const nameInput =
                document.getElementById(
                    `member${member}Name`
                );

            const classInput =
                document.getElementById(
                    `member${member}Class`
                );

            const sectionInput =
                document.getElementById(
                    `member${member}Section`
                );


            if (card) {

                card.classList.add(
                    "hidden-member"
                );

            }


            if (nameInput) {
                nameInput.value = "";
            }

            if (classInput) {
                classInput.value = "";
            }

            if (sectionInput) {
                sectionInput.value = "";
            }

        }

    }


    /* =====================================================
       EVENT VALIDATION
    ===================================================== */

    function getSelectedEvents() {

        return Array.from(
            document.querySelectorAll(
                'input[name="Events"]:checked'
            )
        ).map(
            checkbox => checkbox.value
        );

    }


    function validateEvents() {

        const selectedEvents =
            getSelectedEvents();


        if (
            selectedEvents.length === 0
        ) {

            if (eventError) {

                eventError.textContent =
                    "Please select at least one event.";

            }

            return false;

        }


        if (eventError) {

            eventError.textContent =
                "";

        }

        return true;

    }


    document
        .querySelectorAll(
            'input[name="Events"]'
        )
        .forEach(
            checkbox => {

                checkbox.addEventListener(
                    "change",
                    validateEvents
                );

            }
        );


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!validateEvents()) {

                if (eventError) {

                    eventError.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }

                return;

            }


            /*
               Browser validation.
            */

            if (!form.checkValidity()) {

                form.reportValidity();

                return;

            }


            /*
               Prevent duplicate submission.
            */

            if (
                submitBtn &&
                submitBtn.disabled
            ) {

                return;

            }


            setSubmitting(
                true
            );


            clearFormMessage();


            try {

                const data =
                    collectRegistrationData();


                /*
                   Firebase must be configured.
                */

                if (!firebaseReady || !db) {

                    throw new Error(
                        "Firebase is not configured. Please add your existing Firebase configuration to script.js."
                    );

                }


                /*
                   SAME DATABASE STRUCTURE:

                   registrations

                   This keeps your existing
                   admin panel compatible.
                */

                const registrationsRef =
                    ref(
                        db,
                        "registrations"
                    );


                const newRegistrationRef =
                    push(
                        registrationsRef
                    );


                await set(
                    newRegistrationRef,
                    data
                );


                /*
                   Save registration locally as a
                   backup for the thank-you page.
                */

                try {

                    sessionStorage.setItem(
                        "apsLastRegistration",
                        JSON.stringify(data)
                    );

                } catch (storageError) {

                    console.warn(
                        "Session storage unavailable:",
                        storageError
                    );

                }


                showFormMessage(
                    "Registration submitted successfully.",
                    "success"
                );


                showToast(
                    "Registration submitted successfully."
                );


                /*
                   Redirect to thankyou.html.
                */

                setTimeout(
                    () => {

                        window.location.href =
                            "thankyou.html";

                    },
                    900
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showFormMessage(
                    getFriendlyFirebaseError(
                        error
                    ),
                    "error"
                );


                showToast(
                    "Registration could not be submitted."
                );


                setSubmitting(
                    false
                );

            }

        }
    );


    /* Initial state */

    updateParticipationMode();

}


/* =========================================================
   COLLECT REGISTRATION DATA
========================================================= */

function collectRegistrationData() {

    const getValue =
        id => {

            const element =
                document.getElementById(id);

            return element
                ? element.value.trim()
                : "";

        };


    const selectedEvents =
        Array.from(
            document.querySelectorAll(
                'input[name="Events"]:checked'
            )
        ).map(
            checkbox => checkbox.value
        );


    const teamTypeElement =
        document.querySelector(
            'input[name="TeamType"]:checked'
        );


    const teamType =
        teamTypeElement
            ? teamTypeElement.value
            : "Solo";


    const data = {

        /*
           Existing main fields
        */

        StudentName:
            getValue("studentName"),

        TeamName:
            teamType === "Team"
                ? getValue("teamName")
                : "",

        Class:
            getValue("class"),

        Section:
            getValue("section"),

        MobileNumber:
            getValue("mobileNumber"),

        EmailAddress:
            getValue("emailAddress"),


        /*
           Participation
        */

        TeamType:
            teamType,

        TeamSize:
            teamType === "Team"
                ? Number(
                    getValue("teamSize")
                )
                : 1,


        /*
           Events
        */

        Events:
            selectedEvents,

        Event:
            selectedEvents.join(", "),


        /*
           Team members
        */

        Member2Name:
            teamType === "Team"
                ? getValue("member2Name")
                : "",

        Member2Class:
            teamType === "Team"
                ? getValue("member2Class")
                : "",

        Member2Section:
            teamType === "Team"
                ? getValue("member2Section")
                : "",


        Member3Name:
            teamType === "Team"
                ? getValue("member3Name")
                : "",

        Member3Class:
            teamType === "Team"
                ? getValue("member3Class")
                : "",

        Member3Section:
            teamType === "Team"
                ? getValue("member3Section")
                : "",


        Member4Name:
            teamType === "Team"
                ? getValue("member4Name")
                : "",

        Member4Class:
            teamType === "Team"
                ? getValue("member4Class")
                : "",

        Member4Section:
            teamType === "Team"
                ? getValue("member4Section")
                : "",


        Member5Name:
            teamType === "Team"
                ? getValue("member5Name")
                : "",

        Member5Class:
            teamType === "Team"
                ? getValue("member5Class")
                : "",

        Member5Section:
            teamType === "Team"
                ? getValue("member5Section")
                : "",


        /*
           Remarks
        */

        Remarks:
            getValue("remarks"),


        /*
           Timestamp

           ISO string is easy for your
           admin panel to display/export.
        */

        SubmittedAt:
            new Date().toISOString(),

        RegistrationDate:
            new Date().toLocaleDateString(
                "en-IN"
            ),

        RegistrationTime:
            new Date().toLocaleTimeString(
                "en-IN"
            )

    };


    return data;

}


/* =========================================================
   SUBMIT STATE
========================================================= */

function setSubmitting(
    loading
) {

    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    if (!submitBtn) {
        return;
    }


    submitBtn.disabled =
        loading;


    submitBtn.classList.toggle(
        "loading",
        loading
    );

}


/* =========================================================
   FORM MESSAGE
========================================================= */

function showFormMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "formMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "form-message";


    if (type) {

        element.classList.add(
            type
        );

    }

}


function clearFormMessage() {

    const element =
        document.getElementById(
            "formMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        "";

    element.className =
        "form-message";

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) {
        return;
    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

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
   FIREBASE ERROR MESSAGE
========================================================= */

function getFriendlyFirebaseError(
    error
) {

    if (!error) {

        return (
            "Something went wrong. Please try again."
        );

    }


    const message =
        String(
            error.message || ""
        ).toLowerCase();


    if (
        message.includes(
            "permission_denied"
        ) ||
        message.includes(
            "permission denied"
        )
    ) {

        return (
            "Registration was blocked by Firebase database rules. Please check your Firebase Realtime Database rules."
        );

    }


    if (
        message.includes(
            "network"
        ) ||
        message.includes(
            "offline"
        )
    ) {

        return (
            "Network connection problem. Please check your internet connection and try again."
        );

    }


    if (
        message.includes(
            "firebase is not configured"
        )
    ) {

        return (
            "Firebase configuration is missing in script.js."
        );

    }


    return (
        "Unable to submit registration. Please try again."
    );

}


/* =========================================================
   MOBILE NUMBER
========================================================= */

function initializeMobileInput() {

    const mobile =
        document.getElementById(
            "mobileNumber"
        );


    if (!mobile) {
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
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        const menuToggle =
            document.getElementById(
                "menuToggle"
            );

        const mobileNav =
            document.getElementById(
                "mobileNav"
            );


        if (
            menuToggle &&
            mobileNav &&
            mobileNav.classList.contains(
                "open"
            )
        ) {

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

    }
);
