import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, push, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { helpFirebaseConfig } from "./firebase-config.js";

const app = initializeApp(helpFirebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("helpForm");
const message = document.getElementById("helpMessage");
const ticketOutput = document.getElementById("ticketId");

function msg(t, type="") {
    if (!message) return;
    message.textContent = t;
    message.className = `message ${type}`.trim();
}

function makeTicketId() {
    const d = new Date();
    const stamp = d.toISOString().replace(/\D/g,"").slice(0,14);
    const rand = Math.random().toString(36).slice(2,7).toUpperCase();
    return `APS-${stamp}-${rand}`;
}

form?.addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const ticket = makeTicketId();
    const node = push(ref(db, "tickets"));
    msg("Submitting your support request...");
    try {
        await set(node, {
            ticketId: ticket,
            name: data.name || "",
            email: data.email || "",
            mobileNumber: data.mobile || data.mobileNumber || "",
            category: data.category || "General",
            issue: data.issue || data.message || "",
            status: "open",
            createdAt: new Date().toISOString(),
            serverTimestamp: serverTimestamp()
        });
        sessionStorage.setItem("apsHelpTicketId", ticket);
        if (ticketOutput) ticketOutput.textContent = ticket;
        window.location.href = `help-thankyou.html?ticket=${encodeURIComponent(ticket)}`;
    } catch (err) {
        console.error(err);
        msg("Could not submit the request. Please check Firebase Realtime Database rules.", "error");
    }
});
