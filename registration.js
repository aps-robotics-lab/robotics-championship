import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { mainFirebaseConfig } from "./firebase-config.js";

const app = initializeApp(mainFirebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// DOM Elements
const form = document.getElementById("registrationForm");
const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");
const successOverlay = document.getElementById("successOverlay");
const successRegistrationId = document.getElementById("successRegistrationId");
const continueBtn = document.getElementById("continueBtn");
const eventError = document.getElementById("eventError");

// Progressive Step Logic
const steps = document.querySelectorAll(".step-section");
const nextBtns = document.querySelectorAll(".next-step");

nextBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        // Simple HTML5 Validation before proceeding
        const currentStepInputs = steps[index].querySelectorAll("input[required], select[required]");
        let valid = true;
        currentStepInputs.forEach(input => {
            if (!input.reportValidity()) valid = false;
        });
        
        if (valid && index + 1 < steps.length) {
            steps[index + 1].classList.remove("hidden-member");
            steps[index + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            btn.style.display = 'none'; // hide next button once passed
        }
    });
});

// Helper Functions
const getValue = (id) => document.getElementById(id)?.value.trim() || "";
const getTeamSize = () => Number(document.querySelector('input[name="TeamSize"]:checked')?.value || 1);
const getSelectedEvents = () => Array.from(document.querySelectorAll('input[name="Events"]:checked')).map(i => i.value);
const generateId = () => `APS-RBC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
const showMessage = (msg, type = "error") => { formMessage.textContent = msg; formMessage.className = `form-message ${type}`; };

// Formatting Inputs
document.getElementById("mobileNumber")?.addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10));
document.getElementById("emailAddress")?.addEventListener("blur", e => e.target.value = e.target.value.trim().toLowerCase());

// Update Team Size Logic
document.querySelectorAll('input[name="TeamSize"]').forEach(input => {
    input.addEventListener("change", () => {
        const size = getTeamSize();
        if(size === 1) {
            document.getElementById("step3").style.display = "none"; 
        } else {
            document.getElementById("step3").style.display = "block";
        }
        document.querySelectorAll(".additional-member").forEach(card => {
            const num = Number(card.dataset.memberCard);
            card.classList.toggle("hidden-member", num > size);
            const req = num <= size;
            ["Name", "Class", "Section"].forEach(f => {
                const el = document.getElementById(`member${num}${f}`);
                if(el) el.required = req;
            });
        });
    });
});

// Submit Logic
form?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (getSelectedEvents().length === 0) { eventError.textContent = "Select at least one event."; return; }
    
    const email = getValue("emailAddress");
    const phone = getValue("mobileNumber");
    if(phone.length !== 10) { showMessage("Phone number must be exactly 10 digits."); return; }

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Processing...";

    try {
        // Use anonymous Firebase Authentication so public registration can
        // write without exposing existing registrations to the browser.
        if (!auth.currentUser) await signInAnonymously(auth);

        const regRef = ref(db, "registrations");

        // Collect Data
        const teamSize = getTeamSize();
        const data = {
            registrationId: generateId(),
            TeamSize: teamSize,
            ParticipationType: teamSize === 1 ? "Solo" : `Team of ${teamSize}`,
            StudentName: getValue("studentName"),
            Class: getValue("studentClass"),
            Section: getValue("studentSection"),
            MobileNumber: phone,
            EmailAddress: email,
            TeamName: getValue("teamName"),
            Events: getSelectedEvents(),
            Remarks: getValue("remarks"),
            createdBy: auth.currentUser.uid,
            timestamp: Date.now()
        };

        // Add dynamic members
        for(let i=2; i<=teamSize; i++) {
            data[`Member${i}Name`] = getValue(`member${i}Name`);
            data[`Member${i}Class`] = getValue(`member${i}Class`);
            data[`Member${i}Section`] = getValue(`member${i}Section`);
        }

        // Save to Firebase
        await set(push(regRef), data);

        // Send Email via EmailJS
        if(window.emailjs) {
            emailjs.send("service_5m4uzhb", "template_5qb8b2p", data).catch(console.error);
        }

        sessionStorage.setItem("apsRegistrationId", data.registrationId);
        sessionStorage.setItem("apsRegistrationName", data.StudentName);
        
        successRegistrationId.textContent = data.registrationId;
        successOverlay.classList.remove("hidden");

    } catch (error) {
        showMessage(error.message || "Registration failed. Check connection.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Submit Registration";
    }
});

continueBtn?.addEventListener("click", () => window.location.href = "thankyou.html");
