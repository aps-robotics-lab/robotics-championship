import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get, onValue, update } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { helpFirebaseConfig } from "./firebase-config.js";

const app = initializeApp(helpFirebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let tickets = {};

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c =>
  ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c])
);

async function boot(user) {
  const agentSnap = await get(ref(db, `agents/${user.uid}`));

  if (!agentSnap.exists() || agentSnap.val()?.active === false) {
    await signOut(auth);
    location.replace("agent-login.html");
    return;
  }

  const agent = agentSnap.val();

  if (document.getElementById("agentName")) {
    document.getElementById("agentName").textContent =
      agent.name || user.displayName || user.email || "Agent";
  }

  if (document.getElementById("agentEmail")) {
    document.getElementById("agentEmail").textContent = user.email || "";
  }

  onValue(ref(db, "tickets"), (snapshot) => {
    tickets = snapshot.val() || {};
    renderTickets();
  });
}

function renderTickets() {
  const box = document.getElementById("ticketList");
  if (!box) return;

  const entries = Object.entries(tickets).reverse();

  box.innerHTML = entries.length ? entries.map(([key, t]) => `
    <article class="ticket-card">
      <div><strong>${esc(t.ticketId || key)}</strong></div>
      <h3>${esc(t.subject || "Support request")}</h3>
      <p>${esc(t.message || "")}</p>
      <small>${esc(t.studentName || "")} · ${esc(t.email || "")}</small>

      <select data-status="${esc(key)}">
        <option value="open" ${t.status === "open" ? "selected" : ""}>Open</option>
        <option value="in-progress" ${t.status === "in-progress" ? "selected" : ""}>In Progress</option>
        <option value="resolved" ${t.status === "resolved" ? "selected" : ""}>Resolved</option>
      </select>
    </article>
  `).join("") : "<p>No support tickets.</p>";

  box.querySelectorAll("[data-status]").forEach(select => {
    select.addEventListener("change", async () => {
      await update(ref(db, `tickets/${select.dataset.status}`), {
        status: select.value,
        updatedAt: Date.now(),
        updatedBy: auth.currentUser.uid
      });
    });
  });
}

onAuthStateChanged(auth, user => {
  if (!user) {
    location.replace("agent-login.html");
    return;
  }

  boot(user).catch(error => {
    console.error(error);
    signOut(auth).finally(() => location.replace("agent-login.html"));
  });
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  signOut(auth).then(() => location.replace("agent-login.html"));
});

/*
  AI HELPER
  Never put an OpenAI/Gemini secret directly in this browser file.
  Set window.AI_HELP_ENDPOINT to your own secure server endpoint.
*/
document.getElementById("aiHelpBtn")?.addEventListener("click", async () => {
  const question = document.getElementById("aiQuestion")?.value.trim();
  const answer = document.getElementById("aiAnswer");

  if (!question || !answer) return;

  if (!window.AI_HELP_ENDPOINT) {
    answer.textContent =
      "AI helper is not configured yet. Connect a secure server-side AI endpoint.";
    return;
  }

  answer.textContent = "Thinking...";

  try {
    const response = await fetch(window.AI_HELP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        context: "APS Robotics Championship 2026 support"
      })
    });

    const data = await response.json();
    answer.textContent = data.answer || "No answer returned.";
  } catch (error) {
    console.error(error);
    answer.textContent = "AI service is currently unavailable.";
  }
});
