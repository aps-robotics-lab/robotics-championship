/* ============================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   REGISTRATION SYSTEM
============================================================ */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ============================================================
   FIREBASE CONFIGURATION

   IMPORTANT:
   Replace these values with the Firebase configuration
   from the SAME Firebase project used by your admin panel.
============================================================ */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId:
        "YOUR_MESSAGING_SENDER_ID",

    appId:
        "YOUR_APP_ID"

};


/* ============================================================
   INITIALIZE FIREBASE
============================================================ */

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


/* ============================================================
   DOM
============================================================ */

const form =
    document.getElementById(
        "registrationForm"
    );

const membersContainer =
    document.getElementById(
        "membersContainer"
    );

const submitButton =
    document.getElementById(
        "submitButton"
    );

const formError =
    document.getElementById(
        "formError"
    );

const formErrorText =
    document.getElementById(
        "formErrorText"
    );


/* ============================================================
   MEMBER FIELD GENERATOR
============================================================ */

function createMemberFields(number) {

    const card =
        document.createElement("div");

    card.className =
        "member-card";

    card.dataset.member =
        String(number);


    card.innerHTML = `

        <div class="member-card-header">

            <div class="member-number">
                ${number}
            </div>

            <strong>
                Member ${number}
            </strong>

            ${
                number === 1
                    ? "<span>TEAM LEADER</span>"
                    : "<span>TEAM MEMBER</span>"
            }

        </div>


        <div class="member-fields">


            <div class="field-group name-field">

                <label>
                    Full Name
                    <span>*</span>
                </label>

                <input
                    type="text"
                    name="member${number}Name"
                    placeholder="Enter full name"
                    maxlength="80"
                    autocomplete="name"
                    required
                >

            </div>


            <div class="field-group">

                <label>
                    Class
                    <span>*</span>
                </label>

                <input
                    type="text"
                    name="member${number}Class"
                    placeholder="e.g. IX"
                    maxlength="20"
                    required
                >

            </div>


            <div class="field-group">

                <label>
                    Section
                    <span>*</span>
                </label>

                <input
                    type="text"
                    name="member${number}Section"
                    placeholder="e.g. A"
                    maxlength="10"
                    required
                >

            </div>

        </div>

    `;

    return card;
}


/* ============================================================
   RENDER MEMBERS
============================================================ */

function renderMembers(teamSize) {

    membersContainer.innerHTML = "";

    for (
        let i = 1;
        i <= teamSize;
        i++
    ) {

        membersContainer.appendChild(
            createMemberFields(i)
        );

    }

}


/* ============================================================
   INITIAL MEMBER
============================================================ */

renderMembers(1);


/* ============================================================
   TEAM SIZE CHANGE
============================================================ */

document
    .querySelectorAll(
        'input[name="teamSize"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                const teamSize =
                    Number(radio.value);

                renderMembers(
                    teamSize
                );

            }
        );

    });


/* ============================================================
   ERROR
============================================================ */

function showError(message) {

    formErrorText.textContent =
        message;

    formError.classList.add(
        "show"
    );

    formError.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

function hideError() {

    formError.classList.remove(
        "show"
    );

}


/* ============================================================
   VALIDATION HELPERS
============================================================ */

function clean(value) {

    return String(value || "")
        .trim()
        .replace(/\s+/g, " ");

}


function validPhone(phone) {

    return /^[6-9]\d{9}$/.test(
        phone
    );

}


function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* ============================================================
   GET TEAM SIZE
============================================================ */

function getTeamSize() {

    const selected =
        document.querySelector(
            'input[name="teamSize"]:checked'
        );

    return selected
        ? Number(selected.value)
        : 1;

}


/* ============================================================
   COLLECT MEMBERS
============================================================ */

function collectMembers(teamSize) {

    const members = [];

    for (
        let i = 1;
        i <= teamSize;
        i++
    ) {

        const name =
            clean(
                document.querySelector(
                    `[name="member${i}Name"]`
                )?.value
            );

        const className =
            clean(
                document.querySelector(
                    `[name="member${i}Class"]`
                )?.value
            );

        const section =
            clean(
                document.querySelector(
                    `[name="member${i}Section"]`
                )?.value
            );


        if (!name) {

            throw new Error(
                `Please enter the name of Member ${i}.`
            );

        }

        if (!className) {

            throw new Error(
                `Please enter the class of Member ${i}.`
            );

        }

        if (!section) {

            throw new Error(
                `Please enter the section of Member ${i}.`
            );

        }


        members.push({

            number: i,

            name: name,

            class: className,

            section: section

        });

    }

    return members;

}


/* ============================================================
   GET EVENTS
============================================================ */

function collectEvents() {

    return Array.from(
        document.querySelectorAll(
            'input[name="events"]:checked'
        )
    ).map(
        checkbox =>
            checkbox.value
    );

}


/* ============================================================
   GENERATE REGISTRATION ID
============================================================

   Firestore transaction guarantees that two users
   don't normally receive the same sequential number.

============================================================ */

async function generateRegistrationId() {

    const counterRef =
        doc(
            db,
            "system",
            "registrationCounter"
        );


    const registrationNumber =
        await runTransaction(
            db,
            async transaction => {

                const counterSnapshot =
                    await transaction.get(
                        counterRef
                    );


                let nextNumber = 1;


                if (
                    counterSnapshot.exists()
                ) {

                    const data =
                        counterSnapshot.data();


                    nextNumber =
                        Number(
                            data.lastNumber || 0
                        ) + 1;

                }


                transaction.set(
                    counterRef,
                    {
                        lastNumber:
                            nextNumber,

                        updatedAt:
                            serverTimestamp()
                    },
                    {
                        merge: true
                    }
                );


                return nextNumber;

            }
        );


    const paddedNumber =
        String(
            registrationNumber
        ).padStart(
            4,
            "0"
        );


    return `APSRC-2026-${paddedNumber}`;

}


/* ============================================================
   SUBMIT BUTTON STATE
============================================================ */

function setLoading(isLoading) {

    if (!submitButton) return;

    submitButton.disabled =
        isLoading;

    submitButton.classList.toggle(
        "loading",
        isLoading
    );

}


/* ============================================================
   FORM SUBMIT
============================================================ */

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        hideError();


        try {

            /* --------------------------------------------
               BASIC HTML VALIDATION
            -------------------------------------------- */

            if (!form.checkValidity()) {

                form.reportValidity();

                showError(
                    "Please complete all required fields."
                );

                return;

            }


            /* --------------------------------------------
               TEAM SIZE
            -------------------------------------------- */

            const teamSize =
                getTeamSize();


            /* --------------------------------------------
               TEAM NAME
            -------------------------------------------- */

            const teamName =
                clean(
                    document.getElementById(
                        "teamName"
                    ).value
                );


            if (!teamName) {

                showError(
                    "Please enter a team name."
                );

                return;

            }


            /* --------------------------------------------
               PHONE
            -------------------------------------------- */

            const phone =
                clean(
                    document.getElementById(
                        "phone"
                    ).value
                );


            if (!validPhone(phone)) {

                showError(
                    "Please enter a valid 10-digit Indian mobile number."
                );

                return;

            }


            /* --------------------------------------------
               EMAIL
            -------------------------------------------- */

            const email =
                clean(
                    document.getElementById(
                        "email"
                    ).value
                )
                .toLowerCase();


            if (!validEmail(email)) {

                showError(
                    "Please enter a valid email address."
                );

                return;

            }


            /* --------------------------------------------
               MEMBERS
            -------------------------------------------- */

            const members =
                collectMembers(
                    teamSize
                );


            /* --------------------------------------------
               EVENTS
            -------------------------------------------- */

            const events =
                collectEvents();


            if (!events.length) {

                showError(
                    "Please select at least one event."
                );

                return;

            }


            /* --------------------------------------------
               AGREEMENT
            -------------------------------------------- */

            const agreement =
                document.getElementById(
                    "agreement"
                ).checked;


            if (!agreement) {

                showError(
                    "Please accept the rules and confirmation."
                );

                return;

            }


            /* --------------------------------------------
               LOADING
            -------------------------------------------- */

            setLoading(true);


            /* --------------------------------------------
               REGISTRATION ID
            -------------------------------------------- */

            const registrationId =
                await generateRegistrationId();


            /* --------------------------------------------
               DOCUMENT
            -------------------------------------------- */

            const registrationData = {

                registrationId:
                    registrationId,

                teamName:
                    teamName,

                teamSize:
                    teamSize,

                participationType:
                    teamSize === 1
                        ? "Solo"
                        : "Team",

                members:
                    members,

                events:
                    events,

                phone:
                    phone,

                email:
                    email,

                status:
                    "Registered",

                createdAt:
                    serverTimestamp()

            };


            /* --------------------------------------------
               SAVE TO FIRESTORE
            -------------------------------------------- */

            await runTransaction(
                db,
                async transaction => {

                    const registrationRef =
                        doc(
                            collection(
                                db,
                                "registrations"
                            )
                        );


                    transaction.set(
                        registrationRef,
                        registrationData
                    );

                }
            );


            /* --------------------------------------------
               SAVE LOCAL COPY
            -------------------------------------------- */

            localStorage.setItem(
                "apsLastRegistration",
                JSON.stringify({

                    registrationId:
                        registrationId,

                    teamName:
                        teamName,

                    teamSize:
                        teamSize,

                    members:
                        members,

                    events:
                        events,

                    phone:
                        phone,

                    email:
                        email

                })
            );


            /* --------------------------------------------
               REDIRECT
            -------------------------------------------- */

            const params =
                new URLSearchParams({

                    id:
                        registrationId,

                    team:
                        teamName

                });


            window.location.href =
                `thankyou.html?${params.toString()}`;

        }

        catch (error) {

            console.error(
                "Registration error:",
                error
            );


            let message =
                "Registration failed. Please try again.";


            if (
                error &&
                error.message
            ) {

                if (
                    error.message.includes(
                        "permission"
                    )
                ) {

                    message =
                        "Firebase permission denied. Please check your Firestore security rules.";

                }
                else if (
                    error.message.includes(
                        "network"
                    )
                ) {

                    message =
                        "Network error. Please check your internet connection.";

                }
                else if (
                    error.message.startsWith(
                        "Please"
                    )
                ) {

                    message =
                        error.message;

                }

            }


            showError(message);

            setLoading(false);

        }

    }
);
