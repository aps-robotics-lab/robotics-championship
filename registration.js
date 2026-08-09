/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   REGISTRATION
   FIREBASE REALTIME DATABASE

   Supports:
   - Solo
   - Team of 2
   - Team of 3
   - Team of 4
   - Team of 5

   Every member has:
   Name
   Class
   Section

   Events:
   - Robo Race
   - Robo War
   - Robo Tug of War
   - Robo Soccer
===================================================== */


/* =====================================================
   FIREBASE
===================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


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


const app =
    initializeApp(firebaseConfig);


const database =
    getDatabase(app);


/* =====================================================
   DOM
===================================================== */

const form =
    document.getElementById(
        "registrationForm"
    );


const submitBtn =
    document.getElementById(
        "submitBtn"
    );


const formMessage =
    document.getElementById(
        "formMessage"
    );


const participationType =
    document.getElementById(
        "participationType"
    );


const memberInstruction =
    document.getElementById(
        "memberInstruction"
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


const successOverlay =
    document.getElementById(
        "successOverlay"
    );


const successRegistrationId =
    document.getElementById(
        "successRegistrationId"
    );


const continueBtn =
    document.getElementById(
        "continueBtn"
    );


/* =====================================================
   MEMBER CARDS
===================================================== */

const memberCards =
    document.querySelectorAll(
        "[data-member-card]"
    );


/* =====================================================
   TEAM SIZE
===================================================== */

document
    .querySelectorAll(
        'input[name="TeamSize"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            updateTeamSize
        );

    });


function getSelectedTeamSize(){

    const selected =
        document.querySelector(
            'input[name="TeamSize"]:checked'
        );

    if(!selected){

        return 1;

    }

    return Number(
        selected.value
    );

}


/* =====================================================
   PARTICIPATION TYPE
===================================================== */

function updateParticipationType(
    teamSize
){

    if(teamSize === 1){

        participationType.value =
            "Solo";

        memberInstruction.textContent =
            "Solo participation selected. No additional members required.";

        return;

    }


    participationType.value =
        `Team of ${teamSize}`;


    memberInstruction.textContent =
        `Team of ${teamSize} selected. Enter details for every team member.`;

}


/* =====================================================
   UPDATE TEAM SIZE UI
===================================================== */

function updateTeamSize(){

    const teamSize =
        getSelectedTeamSize();


    updateParticipationType(
        teamSize
    );


    memberCards.forEach(card => {

        const memberNumber =
            Number(
                card.dataset.memberCard
            );


        const visible =
            memberNumber <= teamSize;


        card.classList.toggle(
            "hidden-member",
            !visible
        );


        setMemberRequired(
            memberNumber,
            visible
        );

    });

}


/* =====================================================
   REQUIRED MEMBER FIELDS
===================================================== */

function setMemberRequired(
    memberNumber,
    required
){

    const name =
        document.getElementById(
            `member${memberNumber}Name`
        );


    const classField =
        document.getElementById(
            `member${memberNumber}Class`
        );


    const section =
        document.getElementById(
            `member${memberNumber}Section`
        );


    if(name){

        name.required =
            required;

    }


    if(classField){

        classField.required =
            required;

    }


    if(section){

        section.required =
            required;

    }

}


/* =====================================================
   INITIAL TEAM STATE
===================================================== */

updateTeamSize();


/* =====================================================
   EVENTS
===================================================== */

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


document
    .querySelectorAll(
        'input[name="Events"]'
    )
    .forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            () => {

                if(
                    getSelectedEvents().length
                ){

                    eventError.textContent =
                        "";

                }

            }
        );

    });


/* =====================================================
   MOBILE VALIDATION
===================================================== */

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


/* =====================================================
   REMARKS COUNTER
===================================================== */

remarks.addEventListener(
    "input",
    () => {

        characterCount.textContent =
            remarks.value.length;

    }
);


/* =====================================================
   FORM SUBMIT
===================================================== */

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        hideMessage();


        const teamSize =
            getSelectedTeamSize();


        const selectedEvents =
            getSelectedEvents();


        /* ---------------------------------------------
           EVENT VALIDATION
        --------------------------------------------- */

        if(
            selectedEvents.length === 0
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


        /* ---------------------------------------------
           MOBILE VALIDATION
        --------------------------------------------- */

        const mobile =
            mobileInput.value.trim();


        if(
            !/^[6-9]\d{9}$/.test(
                mobile
            )
        ){

            showMessage(
                "Please enter a valid 10-digit Indian mobile number.",
                "error"
            );

            mobileInput.focus();

            return;

        }


        /* ---------------------------------------------
           TERMS
        --------------------------------------------- */

        const terms =
            document.getElementById(
                "agreeTerms"
            );


        if(!terms.checked){

            showMessage(
                "Please accept the confirmation before submitting.",
                "error"
            );

            terms.focus();

            return;

        }


        /* ---------------------------------------------
           MEMBER VALIDATION
        --------------------------------------------- */

        for(
            let i = 2;
            i <= teamSize;
            i++
        ){

            const name =
                document.getElementById(
                    `member${i}Name`
                );


            const classField =
                document.getElementById(
                    `member${i}Class`
                );


            const section =
                document.getElementById(
                    `member${i}Section`
                );


            if(
                !name.value.trim() ||
                !classField.value.trim() ||
                !section.value.trim()
            ){

                showMessage(
                    `Please complete all details for Team Member ${i}.`,
                    "error"
                );

                name.focus();

                return;

            }

        }


        /* ---------------------------------------------
           SUBMIT STATE
        --------------------------------------------- */

        setLoading(
            true
        );


        try{

            const registrationId =
                createRegistrationId();


            const registrationDate =
                new Date().toISOString();


            const data = {

                registrationId,

                registrationDate,

                StudentName:
                    getValue(
                        "studentName"
                    ),

                Class:
                    getValue(
                        "studentClass"
                    ),

                Section:
                    getValue(
                        "studentSection"
                    ),

                TeamName:
                    getValue(
                        "teamName"
                    ),

                MobileNumber:
                    mobile,

                EmailAddress:
                    getValue(
                        "emailAddress"
                    ),

                TeamSize:
                    teamSize,

                ParticipationType:
                    participationType.value,

                Events:
                    selectedEvents,

                Remarks:
                    getValue(
                        "remarks"
                    )

            };


            /* -----------------------------------------
               MEMBER 2–5
            ----------------------------------------- */

            for(
                let i = 2;
                i <= 5;
                i++
            ){

                const name =
                    getValue(
                        `member${i}Name`
                    );


                const memberClass =
                    getValue(
                        `member${i}Class`
                    );


                const memberSection =
                    getValue(
                        `member${i}Section`
                    );


                data[
                    `Member${i}Name`
                ] =
                    i <= teamSize
                    ? name
                    : "";


                data[
                    `Member${i}Class`
                ] =
                    i <= teamSize
                    ? memberClass
                    : "";


                data[
                    `Member${i}Section`
                ] =
                    i <= teamSize
                    ? memberSection
                    : "";

            }


            /* -----------------------------------------
               SAVE TO FIREBASE
            ----------------------------------------- */

            const registrationsRef =
                ref(
                    database,
                    "registrations"
                );


            const newRegistration =
                push(
                    registrationsRef
                );


            await set(
                newRegistration,
                data
            );


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            successRegistrationId.textContent =
                registrationId;


            successOverlay.classList.remove(
                "hidden"
            );


        }
        catch(error){

            console.error(
                "Registration error:",
                error
            );


            showMessage(
                getFirebaseErrorMessage(
                    error
                ),
                "error"
            );

        }
        finally{

            setLoading(
                false
            );

        }

    }
);


/* =====================================================
   GET VALUE
===================================================== */

function getValue(id){

    const element =
        document.getElementById(id);


    if(!element){

        return "";

    }


    return element.value
        .trim();

}


/* =====================================================
   REGISTRATION ID
===================================================== */

function createRegistrationId(){

    const now =
        new Date();


    const year =
        now.getFullYear();


    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return `APSRC-${year}-${random}`;

}


/* =====================================================
   LOADING
===================================================== */

function setLoading(
    loading
){

    submitBtn.disabled =
        loading;


    submitBtn.classList.toggle(
        "loading",
        loading
    );

}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
    message,
    type = "error"
){

    formMessage.textContent =
        message;


    formMessage.className =
        `form-message show ${type}`;


    formMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function hideMessage(){

    formMessage.textContent =
        "";

    formMessage.className =
        "form-message";

}


/* =====================================================
   FIREBASE ERROR
===================================================== */

function getFirebaseErrorMessage(
    error
){

    if(
        !error
    ){

        return "Registration failed. Please try again.";

    }


    switch(
        error.code
    ){

        case "PERMISSION_DENIED":

        case "database/permission-denied":

            return "Registration is currently unavailable. Please contact the organizers.";

        case "NETWORK_ERROR":

        case "network-request-failed":

            return "Network error. Please check your internet connection.";

        default:

            return "Unable to submit registration. Please check your internet connection and try again.";

    }

}


/* =====================================================
   CONTINUE TO THANK YOU PAGE
===================================================== */

continueBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "thankyou.html";

    }
);


/* =====================================================
   PREVENT ACCIDENTAL DUPLICATE SUBMIT
===================================================== */

window.addEventListener(
    "beforeunload",
    event => {

        if(
            submitBtn.disabled
        ){

            event.preventDefault();

        }

    }
);
