/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   MAIN WEBSITE JAVASCRIPT
===================================================== */


/* =====================================================
   FIREBASE
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


try{

    const app =
        initializeApp(firebaseConfig);

    database =
        getDatabase(app);

}
catch(error){

    console.error(
        "Firebase initialization error:",
        error
    );

}


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.body.classList.add(
            "loading"
        );


        initializePreloader();

        initializeNavigation();

        initializeParticles();

        initializeRegistration();

        initializeScrollNavigation();

        initializeSuccessModal();

    }
);


/* =====================================================
   PRELOADER
   IMPORTANT:
   DOES NOT WAIT FOR FIREBASE
===================================================== */

function initializePreloader(){

    const preloader =
        document.getElementById(
            "preloader"
        );


    const mainWebsite =
        document.getElementById(
            "mainWebsite"
        );


    const progress =
        document.getElementById(
            "loaderProgress"
        );


    const percent =
        document.getElementById(
            "loaderPercent"
        );


    if(
        !preloader ||
        !mainWebsite
    ){

        return;

    }


    let current =
        0;


    /*
     * Progress animation.
     *
     * It lasts approximately
     * 1.4 seconds.
     */

    const progressTimer =
        setInterval(
            () => {

                current +=
                    Math.floor(
                        Math.random() * 9
                    ) + 4;


                if(current >= 100){

                    current = 100;

                    clearInterval(
                        progressTimer
                    );

                }


                if(progress){

                    progress.style.width =
                        current + "%";

                }


                if(percent){

                    percent.textContent =
                        current;

                }

            },
            70
        );


    /*
     * GUARANTEED transition.
     *
     * Firebase, images or other
     * resources cannot block this.
     */

    setTimeout(
        () => {

            if(progress){

                progress.style.width =
                    "100%";

            }


            if(percent){

                percent.textContent =
                    "100";

            }


            preloader.classList.add(
                "hide"
            );


            mainWebsite.classList.add(
                "show"
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
        1500
    );

}


/* =====================================================
   MOBILE NAVIGATION
===================================================== */

function initializeNavigation(){

    const menuButton =
        document.getElementById(
            "mobileMenuBtn"
        );


    const navMenu =
        document.getElementById(
            "navMenu"
        );


    if(
        !menuButton ||
        !navMenu
    ){

        return;

    }


    menuButton.addEventListener(
        "click",
        () => {

            navMenu.classList.toggle(
                "open"
            );


            const icon =
                menuButton.querySelector(
                    "i"
                );


            if(
                navMenu.classList.contains(
                    "open"
                )
            ){

                icon.className =
                    "fa-solid fa-xmark";

            }
            else{

                icon.className =
                    "fa-solid fa-bars";

            }

        }
    );


    navMenu
    .querySelectorAll(
        ".nav-link"
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    navMenu.classList.remove(
                        "open"
                    );


                    const icon =
                        menuButton.querySelector(
                            "i"
                        );


                    icon.className =
                        "fa-solid fa-bars";

                }
            );

        }
    );

}


/* =====================================================
   PARTICLES
===================================================== */

function initializeParticles(){

    const container =
        document.getElementById(
            "particles"
        );


    if(!container){

        return;

    }


    const amount =
        window.innerWidth < 600
        ? 18
        : 35;


    for(
        let i = 0;
        i < amount;
        i++
    ){

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "particle";


        particle.style.left =
            Math.random() * 100 + "%";


        particle.style.animationDuration =
            (Math.random() * 10 + 8) + "s";


        particle.style.animationDelay =
            (Math.random() * 10) + "s";


        particle.style.opacity =
            Math.random() * .5;


        container.appendChild(
            particle
        );

    }

}


/* =====================================================
   SCROLL NAVIGATION
===================================================== */

function initializeScrollNavigation(){

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

                            links.forEach(
                                link => {

                                    link.classList.remove(
                                        "active"
                                    );


                                    if(
                                        link.getAttribute(
                                            "href"
                                        ) ===
                                        "#" +
                                        entry.target.id
                                    ){

                                        link.classList.add(
                                            "active"
                                        );

                                    }

                                }
                            );

                        }

                    }
                );

            },
            {
                rootMargin:
                    "-30% 0px -60% 0px"
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


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if(!database){

                showFormMessage(
                    "Firebase connection is unavailable. Please try again.",
                    "error"
                );

                return;

            }


            const submitButton =
                document.getElementById(
                    "submitRegistration"
                );


            const message =
                document.getElementById(
                    "formMessage"
                );


            const selectedEvents =
                [
                    ...document.querySelectorAll(
                        'input[name="Events"]:checked'
                    )
                ]
                .map(
                    input =>
                        input.value
                );


            if(
                selectedEvents.length === 0
            ){

                showFormMessage(
                    "Please select at least one event.",
                    "error"
                );

                return;

            }


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


            const mobile =
                getValue(
                    "mobileNumber"
                );


            const email =
                getValue(
                    "emailAddress"
                );


            if(
                !studentName ||
                !teamName ||
                !className ||
                !section ||
                !mobile ||
                !email
            ){

                showFormMessage(
                    "Please complete all required fields.",
                    "error"
                );

                return;

            }


            submitButton.disabled =
                true;


            submitButton.innerHTML = `

                <span>

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Submitting...

                </span>

                <i class="fa-solid fa-circle-notch fa-spin"></i>

            `;


            message.textContent =
                "";


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


                const key =
                    newRegistrationRef.key;


                const registrationID =
                    createRegistrationID();


                const data = {

                    registrationId:
                        registrationID,

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
                        selectedEvents,

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
                        ),

                    Remarks:
                        getValue(
                            "remarks"
                        ),

                    TeamSize:
                        calculateTeamSize(),

                    registrationDate:
                        new Date().toISOString(),

                    createdAt:
                        Date.now()

                };


                await set(
                    newRegistrationRef,
                    data
                );


                showSuccessModal(
                    registrationID
                );


                form.reset();


            }
            catch(error){

                console.error(
                    "Registration error:",
                    error
                );


                showFormMessage(
                    "Registration failed. Please try again.",
                    "error"
                );

            }
            finally{

                submitButton.disabled =
                    false;


                submitButton.innerHTML = `

                    <span>

                        <i class="fa-solid fa-rocket"></i>

                        Submit Registration

                    </span>

                    <i class="fa-solid fa-arrow-right"></i>

                `;

            }

        }
    );

}


/* =====================================================
   GET INPUT VALUE
===================================================== */

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


/* =====================================================
   TEAM SIZE
===================================================== */

function calculateTeamSize(){

    let size = 1;


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


/* =====================================================
   REGISTRATION ID
===================================================== */

function createRegistrationID(){

    const now =
        new Date();


    const year =
        now.getFullYear();


    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return `
        APSRC-${year}-${random}
    `.replace(
        /\s/g,
        ""
    );

}


/* =====================================================
   FORM MESSAGE
===================================================== */

function showFormMessage(
    text,
    type
){

    const message =
        document.getElementById(
            "formMessage"
        );


    if(!message){

        return;

    }


    message.textContent =
        text;


    if(type === "error"){

        message.style.color =
            "#ff5575";

    }
    else{

        message.style.color =
            "#00ff9d";

    }

}


/* =====================================================
   SUCCESS MODAL
===================================================== */

function initializeSuccessModal(){

    const closeButton =
        document.getElementById(
            "closeSuccessModal"
        );


    const doneButton =
        document.getElementById(
            "successDone"
        );


    const modal =
        document.getElementById(
            "successModal"
        );


    if(
        !modal
    ){

        return;

    }


    if(closeButton){

        closeButton.addEventListener(
            "click",
            closeSuccessModal
        );

    }


    if(doneButton){

        doneButton.addEventListener(
            "click",
            closeSuccessModal
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if(
                event.target === modal
            ){

                closeSuccessModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if(
                event.key === "Escape" &&
                !modal.classList.contains(
                    "hidden"
                )
            ){

                closeSuccessModal();

            }

        }
    );

}


/* =====================================================
   SHOW SUCCESS
===================================================== */

function showSuccessModal(
    registrationID
){

    const modal =
        document.getElementById(
            "successModal"
        );


    const idElement =
        document.getElementById(
            "generatedRegistrationId"
        );


    if(idElement){

        idElement.textContent =
            registrationID;

    }


    if(modal){

        modal.classList.remove(
            "hidden"
        );

        document.body.classList.add(
            "loading"
        );

    }

}


/* =====================================================
   CLOSE SUCCESS
===================================================== */

function closeSuccessModal(){

    const modal =
        document.getElementById(
            "successModal"
        );


    if(modal){

        modal.classList.add(
            "hidden"
        );

    }


    document.body.classList.remove(
        "loading"
    );

}


/* =====================================================
   PREVENT ACCIDENTAL DOUBLE SUBMISSION
===================================================== */

window.addEventListener(
    "beforeunload",
    () => {

        const form =
            document.getElementById(
                "registrationForm"
            );


        if(form){

            const button =
                document.getElementById(
                    "submitRegistration"
                );


            if(button){

                button.disabled =
                    false;

            }

        }

    }
);
