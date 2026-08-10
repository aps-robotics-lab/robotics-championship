import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, push, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { mainFirebaseConfig } from "./firebase-config.js";

const app = initializeApp(mainFirebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("registrationForm") || document.querySelector("form[data-registration-form]");
const message = document.getElementById("registrationMessage");
const teamSize = document.getElementById("teamSize");
const membersContainer = document.getElementById("teamMembers");

function msg(t, type="") {
    if (!message) return;
    message.textContent = t;
    message.className = `message ${type}`.trim();
}

function makeRegistrationId() {
    const d = new Date();
    const date = d.toISOString().slice(0,10).replaceAll("-","");
    return `APS-RC-${date}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
}

function renderMembers() {
    if (!membersContainer || !teamSize) return;
    const n = Math.max(1, Math.min(5, Number(teamSize.value) || 1));
    membersContainer.innerHTML = "";
    for (let i=2; i<=n; i++) {
        membersContainer.insertAdjacentHTML("beforeend", `
            <div class="member-fields">
                <h3>Member ${i}</h3>
                <input name="member${i}Name" placeholder="Member ${i} Name">
                <input name="member${i}Class" placeholder="Class">
                <input name="member${i}Section" placeholder="Section">
            </div>`);
    }
}
teamSize?.addEventListener("change", renderMembers);
renderMembers();

form?.addEventListener("submit", async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const events = fd.getAll("events");
    const size = Math.max(1, Number(data.teamSize) || 1);
    const registrationId = makeRegistrationId();
    const record = {
        registrationId,
        studentName: data.studentName || data.name || "",
        studentClass: data.studentClass || data.className || data.class || "",
        studentSection: data.studentSection || data.section || "",
        mobileNumber: data.mobileNumber || data.mobile || "",
        emailAddress: data.emailAddress || data.email || "",
        teamName: data.teamName || (size > 1 ? "" : "Solo"),
        teamSize: size,
        events,
        remarks: data.remarks || "",
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
    };
    for (let i=2; i<=size; i++) {
        record[`Member${i}Name`] = data[`member${i}Name`] || "";
        record[`Member${i}Class`] = data[`member${i}Class`] || "";
        record[`Member${i}Section`] = data[`member${i}Section`] || "";
    }
    msg("Submitting registration...");
    try {
        const node = push(ref(db, "registrations"));
        await set(node, record);
        sessionStorage.setItem("apsRegistrationId", registrationId);
        sessionStorage.setItem("apsRegistrationName", record.studentName);
        window.location.href = "thankyou.html";
    } catch (err) {
        console.error(err);
        msg("Registration could not be submitted. Check Firebase configuration and rules.", "error");
    }
});
