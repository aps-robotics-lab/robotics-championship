/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   REGISTRATION SYSTEM
========================================================= */

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


/* =========================================================
   FIREBASE CONFIGURATION
=========================================================

   IMPORTANT:

   Replace ONLY the values below with the SAME Firebase
   configuration used by your existing admin.js.

========================================================= */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_PROJECT.firebaseapp.com",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

    appId: "YOUR_APP_ID"

};


/* =========================================================
   FIREBASE INITIALIZATION
========================================================= */

let db;

try {

    const app = initializeApp(firebaseConfig);

    db = getFirestore(app);

} catch (error) {

    console.error(
        "Firebase initialization failed:",
        error
    );

}


/* =========================================================
   DOM
========================================================= */

const form =
    document.getElementById("registrationForm");

const membersContainer =
    document.getElementById("membersContainer");

const submitButton =
    document.getElementById("submitButton");

const formError =
    document.getElementById("formError");

const formErrorText =
    document.getElementById("formErrorText");

const mobileInput =
    document.getElementById("mobile");

const emailInput =
    document.getElementById("email");

const agreement =
    document.getElementById("agreement");


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    if (!formError || !formErrorText) return;

    formErrorText.textContent = message;

    formError.classList.add("show");

    formError.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function hideError() {

    if (!formError) return;

    formError.classList.remove("show");

}


/* =========================================================
   TEAM SIZE
========================================================= */

function getTeamSize() {

    const selected =
        document.querySelector(
            'input[name="teamSize"]:checked'
        );

    return selected
        ? Number(selected.value)
        : 1;
}


/* =========================================================
   CREATE MEMBER CARD
========================================================= */

function createMemberCard(number) {

    const card =
        document.createElement("div");

    card.className = "member-card";

    card.dataset.member =
        String(number);


    const isCaptain =
        number === 1;


    card.innerHTML = `

        <div class="member-card-header">

            <div class="member-number">
                ${number}
            </div>

            <strong>
                ${isCaptain ? "Team Leader" : "Team Member " + number}
            </strong>

            <span>
                ${isCaptain ? "LEADER" : "MEMBER"}
            </span>

        </div>


        <div class="member-fields">


            <div class="field-group name-field">

                <label>
                    Full Name
                    <span>*</span>
                </label>

                <input
                    type="text"
                    class="member-name"
                    data-member="${number}"
                    placeholder="Enter full name"
                    autocomplete="name"
                    required>

            </div>


            <div class="field-group">

                <label>
                    Class
                    <span>*</span>
                </label>

                <input
                    type="text"
                    class="member-class"
                    data-member="${number}"
                    placeholder="e.g. IX"
                    maxlength="10"
                    required>

            </div>


            <div class="field-group">

                <label>
                    Section
                    <span>*</span>
                </label>

                <input
                    type="text"
                    class="member-section"
                    data-member="${number}"
                    placeholder="e.g. A"
                    maxlength="5"
                    required>

            </div>


        </div>

    `;


    return card;
}


/* =========================================================
   RENDER MEMBERS
========================================================= */

function renderMembers() {

    if (!membersContainer) return;


    const teamSize =
        getTeamSize();


    membersContainer.innerHTML = "";


    for (
        let i = 1;
        i <= teamSize;
        i++
    ) {

        membersContainer.appendChild(
            createMemberCard(i)
        );

    }

}


/* =========================================================
   TEAM SIZE LISTENERS
========================================================= */

document
    .querySelectorAll(
        'input[name="teamSize"]'
    )
    .forEach(option => {

        option.addEventListener(
            "change",
            () => {

                hideError();

                renderMembers();

            }
        );

    });


/* Initial member */

renderMembers();


/* =========================================================
   MOBILE VALIDATION
========================================================= */

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


/* =========================================================
   COLLECT MEMBERS
========================================================= */

function collectMembers() {

    const cards =
        document.querySelectorAll(
            ".member-card"
        );


    const members = [];


    cards.forEach(card => {

        const number =
            Number(
                card.dataset.member
            );


        const name =
            card
                .querySelector(".member-name")
                ?.value
                .trim();


        const className =
            card
                .querySelector(".member-class")
                ?.value
                .trim();


        const section =
            card
                .querySelector(".member-section")
                ?.value
                .trim();


        members.push({

            memberNumber: number,

            name: name || "",

            class: className || "",

            section: section || ""

        });

    });


    return members;
}


/* =========================================================
   VALIDATE MEMBERS
========================================================= */

function validateMembers(members) {

    if (!members.length) {

        showError(
            "Please add at least one participant."
        );

        return false;
    }


    for (const member of members) {

        if (!member.name) {

            showError(
                `Please enter the name of Member ${member.memberNumber}.`
            );

            return false;
        }


        if (!member.class) {

            showError(
                `Please enter the class of Member ${member.memberNumber}.`
            );

            return false;
        }


        if (!member.section) {

            showError(
                `Please enter the section of Member ${member.memberNumber}.`
            );

            return false;
        }

    }


    return true;
}


/* =========================================================
   EVENTS
========================================================= */

function collectEvents() {

    return Array.from(
        document.querySelectorAll(
            'input[name="events"]:checked'
        )
    ).map(
        checkbox => checkbox.value
    );

}


/* =========================================================
   GENERATE SEQUENTIAL REGISTRATION ID
=========================================================

   Firestore transaction prevents two people submitting
   simultaneously from receiving the same ID.

========================================================= */

async function generateRegistrationId() {

    const counterRef =
        doc(
            db,
            "counters",
            "registration"
        );


    const registrationId =
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


                const formatted =
                    String(
                        nextNumber
                    ).padStart(
                        4,
                        "0"
                    );


                return `APSRC-2026-${formatted}`;

            }
        );


    return registrationId;
}


/* =========================================================
   SUBMIT
========================================================= */

form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        hideError();


        /* Firebase check */

        if (!db) {

            showError(
                "Firebase is not configured correctly. Please check registration.js."
            );

            return;
        }


        /* Prevent double submit */

        if (
            submitButton?.disabled
        ) {

            return;

        }


        /* Team */

        const teamSize =
            getTeamSize();


        const members =
            collectMembers();


        if (
            !validateMembers(
                members
            )
        ) {

            return;

        }


        /* Mobile */

        const mobile =
            mobileInput
                ?.value
                .trim() || "";


        if (
            !/^[0-9]{10}$/.test(
                mobile
            )
        ) {

            showError(
                "Please enter a valid 10-digit mobile number."
            );

            mobileInput?.focus();

            return;

        }


        /* Email */

        const email =
            emailInput
                ?.value
                .trim()
                .toLowerCase() || "";


        if (!email) {

            showError(
                "Please enter your email address."
            );

            emailInput?.focus();

            return;

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                email
            )
        ) {

            showError(
                "Please enter a valid email address."
            );

            emailInput?.focus();

            return;

        }


        /* Events */

        const events =
            collectEvents();


        if (
            events.length === 0
        ) {

            showError(
                "Please select at least one event."
            );

            return;

        }


        /* Agreement */

        if (
            !agreement?.checked
        ) {

            showError(
                "Please accept the confirmation before submitting."
            );

            return;

        }


        /* Loading */

        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.classList.add(
                "loading"
            );

        }


        try {

            /* Generate ID */

            const registrationId =
                await generateRegistrationId();


            /* Registration document */

            const registrationRef =
                doc(
                    collection(
                        db,
                        "registrations"
                    )
                );


            const registrationData = {

                registrationId,

                teamSize,

                members,

                events,

                mobile,

                email,

                status: "Registered",

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            };


            /* Save */

            const {
                setDoc
            } = await import(
                "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
            );


            await setDoc(
                registrationRef,
                registrationData
            );


            /* Local copy for thankyou page */

            const thankYouData = {

                registrationId,

                teamSize,

                members,

                events,

                mobile,

                email

            };


            sessionStorage.setItem(
                "apsRegistration",
                JSON.stringify(
                    thankYouData
                )
            );


            /* Redirect */

            window.location.href =
                `thankyou.html?id=${encodeURIComponent(
                    registrationId
                )}`;


        } catch (error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );


            let message =
                "Registration failed. Please try again.";


            if (
                error?.code ===
                "permission-denied"
            ) {

                message =
                    "Firebase permission denied. Please check your Firestore security rules.";

            } else if (
                error?.code ===
                "failed-precondition"
            ) {

                message =
                    "Firebase Firestore is not enabled or configured correctly.";

            } else if (
                error?.code ===
                "unavailable"
            ) {

                message =
                    "Firebase is temporarily unavailable. Please check your internet connection and try again.";

            } else if (
                error?.message
            ) {

                console.error(
                    error.message
                );

            }


            showError(
                message
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
