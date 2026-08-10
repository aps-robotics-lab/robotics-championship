import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { helpFirebaseConfig, AGENT_UIDS } from "./firebase-config.js";

const app = initializeApp(helpFirebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const TICKETS_PATH = "tickets";
const allowed = new Set((AGENT_UIDS || []).filter(Boolean));
let tickets = {};
let currentKey = null;

const $ = id => document.getElementById(id);
const body = $("ticketBody") || $("ticketsBody") || $("registrationBody");
const status = $("status");
const search = $("search");
const filter = $("statusFilter");
const logout = $("logoutBtn");

function setStatus(text, type="") {
    if (!status) return;
    status.textContent = text;
    status.className = `status ${type}`.trim();
}

function esc(v) {
    return String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function val(d, keys, fallback="—") {
    for (const k of keys) if (d?.[k] !== undefined && d?.[k] !== null && String(d[k]).trim() !== "") return d[k];
    return fallback;
}

function ticketId(d,k) { return val(d, ["ticketId","ticketID","id"], k); }
function name(d) { return val(d, ["name","studentName","student","fullName"], "—"); }
function email(d) { return val(d, ["email","emailAddress"], "—"); }
function phone(d) { return val(d, ["mobile","mobileNumber","phone","phoneNumber"], "—"); }
function issue(d) { return val(d, ["issue","message","description","query","problem"], "—"); }
function ticketStatus(d) { return String(val(d, ["status"], "open")).toLowerCase(); }

function render() {
    if (!body) return;
    const q = search?.value.trim().toLowerCase() || "";
    const sf = filter?.value || "all";
    const entries = Object.entries(tickets).filter(([k,d]) => {
        const hay = [k,ticketId(d,k),name(d),email(d),phone(d),issue(d),ticketStatus(d)].join(" ").toLowerCase();
        return (!q || hay.includes(q)) && (sf === "all" || ticketStatus(d) === sf);
    }).reverse();

    if (!entries.length) {
        body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:35px">No support tickets found.</td></tr>`;
        return;
    }

    body.innerHTML = entries.map(([k,d]) => `
        <tr>
            <td><strong>${esc(ticketId(d,k))}</strong></td>
            <td>${esc(name(d))}</td>
            <td>${esc(email(d))}</td>
            <td>${esc(issue(d))}</td>
            <td><span class="status-badge ${esc(ticketStatus(d))}">${esc(ticketStatus(d))}</span></td>
            <td>${esc(d.createdAt || d.timestamp || "—")}</td>
            <td>
                <button data-action="view" data-key="${esc(k)}">View</button>
                <button data-action="resolve" data-key="${esc(k)}">Resolve</button>
                <button data-action="delete" data-key="${esc(k)}">Delete</button>
            </td>
        </tr>`).join("");

    body.querySelectorAll("button[data-key]").forEach(btn => btn.addEventListener("click", () => action(btn.dataset.action, btn.dataset.key)));
}

function action(type, key) {
    const d = tickets[key];
    if (!d) return;
    currentKey = key;
    if (type === "view") {
        const panel = $("detailContent");
        if (panel) panel.innerHTML = `
            <h3>${esc(ticketId(d,key))}</h3>
            <p><b>Name:</b> ${esc(name(d))}</p>
            <p><b>Email:</b> ${esc(email(d))}</p>
            <p><b>Phone:</b> ${esc(phone(d))}</p>
            <p><b>Issue:</b> ${esc(issue(d))}</p>
            <p><b>Status:</b> ${esc(ticketStatus(d))}</p>`;
        $("detailOverlay")?.classList.remove("hidden");
    } else if (type === "resolve") {
        update(ref(db, `${TICKETS_PATH}/${key}`), { status: "resolved", resolvedAt: new Date().toISOString(), resolvedBy: auth.currentUser?.uid || "" })
            .then(() => setStatus("Ticket resolved.", "success")).catch(e => { console.error(e); setStatus("Could not resolve ticket.", "error"); });
    } else if (type === "delete") {
        if (confirm(`Delete ticket ${ticketId(d,key)} permanently?`))
            remove(ref(db, `${TICKETS_PATH}/${key}`)).then(() => setStatus("Ticket deleted.", "success")).catch(e => { console.error(e); setStatus("Delete denied by Firebase rules.", "error"); });
    }
}

$("closeDetail")?.addEventListener("click", () => $("detailOverlay")?.classList.add("hidden"));
search?.addEventListener("input", render);
filter?.addEventListener("change", render);
logout?.addEventListener("click", async () => { await signOut(auth); window.location.replace("login-agent.html"); });

onAuthStateChanged(auth, user => {
    if (!user || (allowed.size && !allowed.has(user.uid))) {
        signOut(auth).finally(() => window.location.replace("login-agent.html"));
        return;
    }
    $("agentName") && ($("agentName").textContent = user.displayName || user.email?.split("@")[0] || "Agent");
    $("agentEmail") && ($("agentEmail").textContent = user.email || "");
    setStatus(`Agent authenticated: ${user.email || user.uid}`, "success");

    onValue(ref(db, TICKETS_PATH), snap => {
        tickets = snap.val() || {};
        render();
        $("totalTickets") && ($("totalTickets").textContent = Object.keys(tickets).length);
        $("openTickets") && ($("openTickets").textContent = Object.values(tickets).filter(t => ticketStatus(t) === "open").length);
        $("resolvedTickets") && ($("resolvedTickets").textContent = Object.values(tickets).filter(t => ticketStatus(t) === "resolved").length);
    }, err => { console.error(err); setStatus("Could not load tickets. Check Firebase rules.", "error"); });
});
