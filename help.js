import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, push, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { helpFirebaseConfig } from "./firebase-config.js"; 

const app = initializeApp(helpFirebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const form = document.getElementById("helpForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");
const submitText = document.getElementById("submitText");
const submitLoading = document.getElementById("submitLoading");

// Hidden Admin/Agent Triggers
let logoClicks = 0;
document.querySelector(".nav-brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    logoClicks++;
    setTimeout(() => logoClicks = 0, 2000);
    if(logoClicks >= 5) window.location.href = "admin-login.html"; 
});

let footerClicks = 0;
document.getElementById("agentSecret")?.addEventListener("click", (e) => {
    e.preventDefault();
    footerClicks++;
    setTimeout(() => footerClicks = 0, 2000);
    if (footerClicks >= 5) window.location.href = "agent-login.html"; 
});

// Submit Ticket
form?.addEventListener("submit", async event => {
    event.preventDefault();
    
    if (!form.checkValidity()) { 
        form.reportValidity(); 
        return; 
    }

    if(submitBtn) submitBtn.disabled = true;
    submitText?.classList.add("hidden");
    submitLoading?.classList.remove("hidden");

    try {
        if (!auth.currentUser) await signInAnonymously(auth);

        const ticketRef = push(ref(db, "tickets"));
        const ticketId = ticketRef.key;

        await set(ticketRef, {
            ticketId: ticketId,
            registrationId: document.getElementById("registrationId").value,
            name: document.getElementById("name").value,
            className: document.getElementById("className").value,
            section: document.getElementById("section").value,
            email: document.getElementById("email").value.toLowerCase(),
            category: document.getElementById("category").value,
            messageRecipient: document.getElementById("messageRecipient")?.value || "General Help",
            subject: document.getElementById("subject").value,
            message: document.getElementById("message").value,
            status: "Open",
            createdBy: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        sessionStorage.setItem("apsHelpTicketId", ticketId);
        window.location.href = `sorry.html?ticket=${encodeURIComponent(ticketId)}`;

    } catch (error) {
        if(formStatus) formStatus.textContent = "Error submitting ticket. Try again.";
        if(submitBtn) submitBtn.disabled = false;
        submitText?.classList.remove("hidden");
        submitLoading?.classList.add("hidden");
    }
});
