import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get, set, update, remove } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig={
 apiKey:"AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",
 authDomain:"aps-robotics-championship.firebaseapp.com",
 databaseURL:"https://aps-robotics-championship-default-rtdb.firebaseio.com",
 projectId:"aps-robotics-championship",
 storageBucket:"aps-robotics-championship.firebasestorage.app",
 messagingSenderId:"1056582901838",
 appId:"1:1056582901838:web:placeholder"
};

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getDatabase(app);
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
let registrations=[],issues=[],currentUser=null;

function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}
function setText(id,v){const e=$(id);if(e)e.textContent=v??""}
function value(id){return $(id)?.value??""}
function setValue(id,v){if($(id))$(id).value=v??""}
function eventsText(r){const e=r?.events??r?.event??r?.selectedEvents??"";return Array.isArray(e)?e.join(", "):String(e)}
function membersText(r){const m=r?.members??r?.teamMembers??r?.memberNames??"";if(Array.isArray(m))return m.join(", ");if(typeof m==="object"&&m)return Object.values(m).join(", ");return String(m)}
function dateText(r){return r?.registration_date||r?.registrationDate||r?.date||r?.timestamp||""}
function pageName(p){return ({dashboard:"Dashboard",registrations:"Registrations",events:"Events",home:"Home",about:"About",eventContent:"Events Content",team:"Our Team",contact:"Contact",rules:"Rules",issues:"Help / Issues"})[p]||"Dashboard"}

function showPage(page){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 const target=$(page+"Page"); if(target)target.classList.add("active");
 document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
 setText("pageTitle",pageName(page));
 if(window.innerWidth<900)$("sidebar")?.classList.remove("open");
 if(page==="registrations")renderRegistrations();
 if(page==="issues")renderIssues();
}

async function loadRegistrations(){
 try{
  const snap=await get(ref(db,"registrations"));
  const data=snap.val()||{};
  registrations=Object.entries(data).map(([key,val])=>({key,...(val||{})}));
  registrations.sort((a,b)=>String(dateText(b)).localeCompare(String(dateText(a))));
  updateStats();renderRegistrations();renderRecent();
 }catch(e){toast("Could not load registrations: "+e.message)}
}
function updateStats(){
 const total=registrations.length;
 setText("totalRegistrations",total);
 setText("totalTeams",registrations.filter(r=>r.team_name||r.teamName).length||total);
 const counts={"Robo Race":0,"Robo War":0,"Robo Tug of War":0,"Robo Soccer":0};
 registrations.forEach(r=>{const s=eventsText(r);Object.keys(counts).forEach(k=>{if(s.toLowerCase().includes(k.toLowerCase()))counts[k]++})});
 [["raceCount",counts["Robo Race"],"eventRaceCount"],["warCount",counts["Robo War"],"eventWarCount"],["tugCount",counts["Robo Tug of War"],"eventTugCount"],["soccerCount",counts["Robo Soccer"],"eventSoccerCount"]].forEach(([a,n,b])=>{setText(a,n);setText(b,n)});
 const classes=[...new Set(registrations.map(r=>r.class).filter(Boolean))].sort(),sections=[...new Set(registrations.map(r=>r.section).filter(Boolean))].sort();
 fillSelect("classFilter",classes,"All Classes");fillSelect("sectionFilter",sections,"All Sections");
}
function fillSelect(id,items,first){const s=$(id);if(!s)return;const old=s.value;s.innerHTML=`<option value="all">${first}</option>`+items.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("");if(items.includes(old))s.value=old}
function renderRecent(){
 const box=$("recentRegistrations");if(!box)return;
 box.innerHTML=registrations.slice(0,5).map(r=>`<div class="registration-mini"><strong>${esc(r.student_name||r.name||"Unnamed")}</strong><small>${esc(r.team_name||r.teamName||"No team")} • ${esc(eventsText(r))}</small></div>`).join("")||`<div class="loading">No registrations yet.</div>`;
}
function filteredRegistrations(){
 const q=value("searchInput").toLowerCase(),ev=value("eventFilter"),cl=value("classFilter"),se=value("sectionFilter");
 return registrations.filter(r=>{
  const blob=JSON.stringify(r).toLowerCase();
  return (!q||blob.includes(q))&&(ev==="all"||eventsText(r).toLowerCase().includes(ev.toLowerCase()))&&(cl==="all"||String(r.class||"")===cl)&&(se==="all"||String(r.section||"")===se);
 });
}
function renderRegistrations(){
 const body=$("registrationTableBody"),empty=$("tableEmpty");if(!body)return;
 const rows=filteredRegistrations();setText("resultCount",`${rows.length} registrations`);
 body.innerHTML=rows.map(r=>`<tr>
 <td>${esc(r.registration_id||r.registrationId||r.id||r.key)}</td>
 <td>${esc(r.student_name||r.name||"")}</td>
 <td>${esc(r.team_name||r.teamName||"—")}</td>
 <td>${esc(r.class||"")}</td><td>${esc(r.section||"")}</td><td>${esc(r.mobile||r.phone||"")}</td>
 <td>${esc(eventsText(r))}</td><td>${esc(membersText(r))}</td><td>${esc(dateText(r))}</td>
 <td><button class="table-action" data-view-reg="${esc(r.key)}">View</button></td></tr>`).join("");
 empty?.classList.toggle("hidden",rows.length!==0);
}
function openRegistration(key){
 const r=registrations.find(x=>x.key===key);if(!r)return;
 $("modalContent").innerHTML=`<h2>Registration Details</h2><div class="detail-grid">${Object.entries(r).filter(([k])=>k!=="key").map(([k,v])=>`<div class="detail-item"><small>${esc(k.replace(/_/g," ").toUpperCase())}</small><strong>${esc(Array.isArray(v)?v.join(", "):typeof v==="object"?JSON.stringify(v):v)}</strong></div>`).join("")}</div>`;
 $("modal").classList.remove("hidden");
}

async function loadIssues(){
 try{
  const snap=await get(ref(db,"issues"));const data=snap.val()||{};
  issues=Object.entries(data).map(([key,v])=>({key,...(v||{})}));
  issues.sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
  updateIssueSummary();renderIssues();renderRecentIssues();
 }catch(e){toast("Could not load issues: "+e.message)}
}
function updateIssueSummary(){
 const open=issues.filter(x=>(x.status||"Open")==="Open").length,prog=issues.filter(x=>x.status==="In Progress").length,res=issues.filter(x=>x.status==="Resolved").length;
 setText("openIssues",open);setText("progressIssues",prog);setText("resolvedIssues",res);setText("totalIssues",issues.length);setText("issueBadge",open);
}
function issueFiltered(){
 const q=value("issueSearch").toLowerCase(),s=value("issueStatusFilter"),c=value("issueCategoryFilter");
 return issues.filter(i=>{const blob=`${i.name||""} ${i.email||""} ${i.subject||""} ${i.message||""} ${i.key}`.toLowerCase();return(!q||blob.includes(q))&&(s==="all"||(i.status||"Open")===s)&&(c==="all"||(i.category||"Other")===c)});
}
function renderIssues(){
 const box=$("issuesContainer");if(!box)return;const arr=issueFiltered();
 box.innerHTML=arr.map(i=>{
  const status=i.status||"Open",cls=status==="Resolved"?"status-resolved":status==="In Progress"?"status-progress":"status-open";
  return `<article class="issue-card"><div class="issue-card-top"><div><div class="issue-title">${esc(i.subject||"Untitled Issue")}</div><div class="issue-meta">${esc(i.name||"Anonymous")} • ${esc(i.email||"No email")} • ${esc(i.category||"Other")}</div></div><span class="status-pill ${cls}">${esc(status)}</span></div><div class="issue-message">${esc(i.message||"No description provided.")}</div><div class="issue-actions"><button data-issue-view="${esc(i.key)}">View</button><button data-issue-status="${esc(i.key)}|In Progress">In Progress</button><button data-issue-status="${esc(i.key)}|Resolved">Resolve</button><button data-issue-delete="${esc(i.key)}">Delete</button></div></article>`;
 }).join("")||`<div class="loading">No issues match your filters.</div>`;
}
function renderRecentIssues(){
 const box=$("recentIssues");if(!box)return;
 box.innerHTML=issues.slice(0,5).map(i=>`<div class="issue-mini"><strong>${esc(i.subject||"Untitled")}</strong><small>${esc(i.status||"Open")} • ${esc(i.category||"Other")}</small></div>`).join("")||`<div class="loading">No issues submitted.</div>`;
}
function openIssue(key){
 const i=issues.find(x=>x.key===key);if(!i)return;
 $("issueModalContent").innerHTML=`<h2>${esc(i.subject||"Issue")}</h2><div class="detail-grid">
 <div class="detail-item"><small>ISSUE ID</small><strong>${esc(i.issueId||i.key)}</strong></div><div class="detail-item"><small>STATUS</small><strong>${esc(i.status||"Open")}</strong></div>
 <div class="detail-item"><small>NAME</small><strong>${esc(i.name||"")}</strong></div><div class="detail-item"><small>EMAIL</small><strong>${esc(i.email||"")}</strong></div>
 <div class="detail-item"><small>CATEGORY</small><strong>${esc(i.category||"Other")}</strong></div><div class="detail-item"><small>DATE</small><strong>${esc(i.createdAt?new Date(i.createdAt).toLocaleString():i.date||"")}</strong></div>
 <div class="detail-item" style="grid-column:1/-1"><small>MESSAGE</small><strong>${esc(i.message||"")}</strong></div>
 </div>`;
 $("issueModal").classList.remove("hidden");
}
async function setIssueStatus(key,status){try{await update(ref(db,"issues/"+key),{status,updatedAt:Date.now(),updatedBy:currentUser?.email||"admin"});toast("Issue updated");await loadIssues()}catch(e){toast("Update failed: "+e.message)}}
async function deleteIssue(key){if(!confirm("Delete this issue permanently?"))return;try{await remove(ref(db,"issues/"+key));toast("Issue deleted");await loadIssues()}catch(e){toast("Delete failed: "+e.message)}}

const contentDefaults={
 home:{homeBadge:"APS ROBOTICS CHAMPIONSHIP 2026",homeTitle:"APS Robotics Championship 2026",homeDescription:"Build. Battle. Innovate.",homeDate:"",homeVenue:""},
 about:{aboutLabel:"ABOUT THE CHAMPIONSHIP",aboutTitle:"About APS Robotics Championship",aboutDescription:""},
 events:{eventRaceTitle:"Robo Race",eventRaceDescription:"Speed, control and precision on the track.",eventWarTitle:"Robo War",eventWarDescription:"Strategy, engineering and controlled robotic combat.",eventTugTitle:"Robo Tug of War",eventTugDescription:"Power, traction and mechanical strength.",eventSoccerTitle:"Robo Soccer",eventSoccerDescription:"Team coordination meets robotic football."},
 team:{team1Name:"",team1Role:"",team1Description:"",team2Name:"",team2Role:"",team2Description:"",team3Name:"",team3Role:"",team3Description:"",team4Name:"",team4Role:"",team4Description:""},
 contact:{contactAddress:"",contactPhone:"",contactEmail:"",contactFacebook:"",contactInstagram:"",contactYoutube:""},
 rules:{ruleRaceWeight:"4 kg",ruleRaceDimension:"30 × 30 × 30 cm",ruleRaceVoltage:"12 V",ruleSoccerWeight:"5 kg",ruleSoccerDimension:"30 × 30 × 30 cm",ruleSoccerVoltage:"12 V",ruleWarWeight:"5.5 kg",ruleWarDimension:"30 × 30 × 30 cm",ruleWarVoltage:"12 V",ruleTugWeight:"4 kg",ruleTugDimension:"30 × 30 × 30 cm",ruleTugVoltage:"12 V",generalRules:""}
};
const contentMap={home:Object.keys(contentDefaults.home),about:Object.keys(contentDefaults.about),events:Object.keys(contentDefaults.events),team:Object.keys(contentDefaults.team),contact:Object.keys(contentDefaults.contact),rules:Object.keys(contentDefaults.rules)};
async function loadContent(){
 for(const [section,ids] of Object.entries(contentMap)){
  try{const snap=await get(ref(db,"siteContent/"+section));const data=snap.val()||{};ids.forEach(id=>setValue(id,data[id]??contentDefaults[section][id]??""))}catch(e){console.warn("Content load:",section,e)}
 }
}
async function saveContent(section){
 const data={};contentMap[section].forEach(id=>data[id]=value(id));
 try{await set(ref(db,"siteContent/"+section),data);toast(`${pageName(section==="events"?"eventContent":section)} content saved`)}catch(e){toast("Save failed: "+e.message)}
}

function exportCSV(){
 const rows=filteredRegistrations(),fields=["registration_id","student_name","team_name","class","section","mobile","email","events","members","registration_date"];
 const csv=[fields.join(","),...rows.map(r=>fields.map(f=>`"${String(f==="events"?eventsText(r):f==="members"?membersText(r):r[f]??"").replace(/"/g,'""')}"`).join(","))].join("\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="aps-robotics-registrations.csv";a.click();URL.revokeObjectURL(a.href);
}
function bind(){
 $("loginForm").addEventListener("submit",async e=>{e.preventDefault();const btn=$("loginBtn");btn.disabled=true;$("loginError").textContent="";
  try{await signInWithEmailAndPassword(auth,value("loginEmail"),value("loginPassword"))}catch(err){$("loginError").textContent=err.code==="auth/invalid-credential"?"Invalid email or password.":err.message;btn.disabled=false}
 });
 $("togglePassword").addEventListener("click",()=>{$("loginPassword").type=$("loginPassword").type==="password"?"text":"password"});
 $("logoutBtn").addEventListener("click",()=>signOut(auth));
 $("sidebarToggle").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
 document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
 document.querySelectorAll("[data-page-target]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.pageTarget)));
 document.querySelectorAll(".save-button").forEach(b=>b.addEventListener("click",()=>saveContent(b.dataset.contentSave)));
 ["searchInput","eventFilter","classFilter","sectionFilter"].forEach(id=>$(id)?.addEventListener("input",renderRegistrations));
 ["issueSearch","issueStatusFilter","issueCategoryFilter"].forEach(id=>$(id)?.addEventListener("input",renderIssues));
 $("clearFilters").addEventListener("click",()=>{["searchInput","eventFilter","classFilter","sectionFilter"].forEach(id=>{if(id==="searchInput")setValue(id,"");else setValue(id,"all")});renderRegistrations()});
 $("refreshRegistrations").addEventListener("click",loadRegistrations);$("dashboardRefresh").addEventListener("click",async()=>{await loadRegistrations();await loadIssues()});$("refreshIssues").addEventListener("click",loadIssues);
 $("exportCsv").addEventListener("click",exportCSV);$("exportDashboard").addEventListener("click",exportCSV);
 $("closeModal").addEventListener("click",()=>$("modal").classList.add("hidden"));$("closeIssueModal").addEventListener("click",()=>$("issueModal").classList.add("hidden"));
 document.addEventListener("click",e=>{
  const vr=e.target.closest("[data-view-reg]");if(vr)openRegistration(vr.dataset.viewReg);
  const vi=e.target.closest("[data-issue-view]");if(vi)openIssue(vi.dataset.issueView);
  const st=e.target.closest("[data-issue-status]");if(st){const [key,status]=st.dataset.issueStatus.split("|");setIssueStatus(key,status)}
  const del=e.target.closest("[data-issue-delete]");if(del)deleteIssue(del.dataset.issueDelete);
 });
}
onAuthStateChanged(auth,async user=>{
 currentUser=user;
 if(user){$("loginScreen").classList.add("hidden");$("adminApp").classList.remove("hidden");setText("adminEmail",user.email||"Admin");await Promise.all([loadRegistrations(),loadIssues(),loadContent()]);}
 else{$("loginScreen").classList.remove("hidden");$("adminApp").classList.add("hidden");}
});
bind();