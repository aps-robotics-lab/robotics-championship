import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig={apiKey:"AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",authDomain:"aps-robotics-championship.firebaseapp.com",databaseURL:"https://aps-robotics-championship-default-rtdb.firebaseio.com",projectId:"aps-robotics-championship",storageBucket:"aps-robotics-championship.firebasestorage.app",messagingSenderId:"1063542904891",appId:"1:1063542904891:web:82ff9bb3fba0b87384a41e"};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getDatabase(app);
let registrations={},filtered={},currentKey=null;
const $=id=>document.getElementById(id);
const login=$("loginScreen"),appEl=$("adminApp"),form=$("loginForm"),email=$("loginEmail"),password=$("loginPassword"),loginBtn=$("loginBtn"),error=$("loginError");

onAuthStateChanged(auth,user=>{if(user){login.classList.add("hidden");appEl.classList.remove("hidden");$("adminEmail").textContent=user.email||"Authenticated Admin";loadRegistrations()}else{login.classList.remove("hidden");appEl.classList.add("hidden")}});

form.addEventListener("submit",async e=>{e.preventDefault();error.textContent="";loginBtn.disabled=true;loginBtn.textContent="Signing in...";try{await signInWithEmailAndPassword(auth,email.value.trim(),password.value)}catch(err){error.textContent=authError(err.code)}finally{loginBtn.disabled=false;loginBtn.textContent="Login to Dashboard"}});

function authError(c){return ({'auth/invalid-credential':"Invalid email or password.",'auth/user-not-found':"Admin account was not found.",'auth/wrong-password':"Incorrect password.",'auth/invalid-email':"Enter a valid email.",'auth/too-many-requests':"Too many attempts. Try later.",'auth/network-request-failed':"Network error. Check internet."}[c]||"Login failed. Check Firebase Authentication and credentials.")}

$("togglePassword").onclick=()=>{password.type=password.type==="password"?"text":"password"};
$("logoutBtn").onclick=()=>signOut(auth);
$("sidebarToggle").onclick=()=>$("sidebar").classList.toggle("open");

document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll("[data-page-target]").forEach(b=>b.onclick=()=>showPage(b.dataset.pageTarget));
function showPage(p){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$(p+"Page").classList.add("active");document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===p));$("pageTitle").textContent=p[0].toUpperCase()+p.slice(1);$("sidebar").classList.remove("open");if(p==="registrations")renderTable()}

async function loadRegistrations(){
 try{
  const snap=await get(ref(db,"registrations"));
  registrations=snap.exists()&&typeof snap.val()==="object"?snap.val():{};
  filtered={...registrations};populateFilters();updateDashboard();renderRecent();renderTable();updateEvents();
 }catch(err){console.error("Firebase database error:",err);alert("Unable to load registrations. Check Realtime Database Rules, databaseURL, and that data is stored under /registrations.");}
}

function norm(v){if(v==null)return "";if(Array.isArray(v))return v.join(", ");if(typeof v==="object")return Object.values(v).join(", ");return String(v)}
function events(d){let v=d?.Events??d?.events??d?.Event??d?.event;if(!v)return[];if(Array.isArray(v))return v.map(norm).filter(Boolean);if(typeof v==="object")return Object.values(v).map(norm).filter(Boolean);return norm(v).split(/\s*(?:,|\||;)\s*/).filter(Boolean)}
function emailOf(d){return norm(d?.EmailAddress||d?.Email||d?.email)}
function size(d){let n=Number(d?.TeamSize);if(n>0)return n;return 1+[2,3,4,5].map(i=>norm(d?.[`Member${i}Name`])).filter(Boolean).length}
function dateOf(d){return new Date(d?.registrationDate||0)}
function safe(v){return norm(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

function updateDashboard(){
 const list=Object.values(registrations),c=countEvents();
 $("totalRegistrations").textContent=list.length;$("totalTeams").textContent=list.length;
 $("raceCount").textContent=c.race;$("warCount").textContent=c.war;$("tugCount").textContent=c.tug;$("soccerCount").textContent=c.soccer;updateEvents();
}
function countEvents(){const c={race:0,war:0,tug:0,soccer:0};Object.values(registrations).forEach(d=>events(d).forEach(e=>{let x=e.toLowerCase().trim();if(x==="robo race")c.race++;else if(x==="robo war")c.war++;else if(x==="robo tug of war")c.tug++;else if(x==="robo soccer")c.soccer++}));return c}
function updateEvents(){let c=countEvents();$("eventRaceCount").textContent=c.race;$("eventWarCount").textContent=c.war;$("eventTugCount").textContent=c.tug;$("eventSoccerCount").textContent=c.soccer}

function renderRecent(){
 const box=$("recentRegistrations"),entries=Object.entries(registrations).sort((a,b)=>dateOf(b[1])-dateOf(a[1])).slice(0,6);
 box.innerHTML=entries.length?entries.map(([k,d])=>`<div class="recent"><div><b>${safe(d.StudentName||"Unknown")}</b><span>${safe(d.TeamName||"Unnamed Team")} • ${safe(d.registrationId||k)}</span></div><button onclick="window.viewRegistration('${safe(k)}')">View</button></div>`).join(""):"No registrations found.";
}
function populateFilters(){
 const cls=[...new Set(Object.values(registrations).map(d=>norm(d.Class)).filter(Boolean))].sort(),sec=[...new Set(Object.values(registrations).map(d=>norm(d.Section)).filter(Boolean))].sort();
 $("classFilter").innerHTML='<option value="all">All Classes</option>'+cls.map(x=>`<option value="${safe(x)}">${safe(x)}</option>`).join("");
 $("sectionFilter").innerHTML='<option value="all">All Sections</option>'+sec.map(x=>`<option value="${safe(x)}">${safe(x)}</option>`).join("");
}
function applyFilters(){
 const q=$("searchInput").value.toLowerCase().trim(),ev=$("eventFilter").value,cl=$("classFilter").value,se=$("sectionFilter").value;filtered={};
 Object.entries(registrations).forEach(([k,d])=>{const es=events(d);const searchable=[d.registrationId,d.StudentName,d.TeamName,d.Class,d.Section,d.MobileNumber,emailOf(d),...es].map(norm).join(" ").toLowerCase();if((!q||searchable.includes(q))&&(ev==="all"||es.some(x=>x.toLowerCase()===ev.toLowerCase()))&&(cl==="all"||norm(d.Class)===cl)&&(se==="all"||norm(d.Section)===se))filtered[k]=d});renderTable();
}
["searchInput","eventFilter","classFilter","sectionFilter"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",applyFilters));
$("clearFilters").onclick=()=>{$("searchInput").value="";$("eventFilter").value="all";$("classFilter").value="all";$("sectionFilter").value="all";applyFilters()};

function renderTable(){
 const entries=Object.entries(filtered).sort((a,b)=>dateOf(b[1])-dateOf(a[1]));$("resultCount").textContent=`${entries.length} registration${entries.length===1?"":"s"}`;$("tableEmpty").classList.toggle("hidden",entries.length>0);
 $("registrationTableBody").innerHTML=entries.map(([k,d])=>`<tr><td>${safe(d.registrationId||k)}</td><td>${safe(d.StudentName||"-")}</td><td>${safe(d.TeamName||"-")}</td><td>${safe(d.Class||"-")}</td><td>${safe(d.Section||"-")}</td><td>${safe(d.MobileNumber||"-")}</td><td>${events(d).map(e=>`<span class="tag">${safe(e)}</span>`).join("")||"-"}</td><td>${size(d)}</td><td>${dateOf(d).getTime()?dateOf(d).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}):"-"}</td><td><div class="actions"><button onclick="window.viewRegistration('${safe(k)}')">👁</button><button onclick="window.editRegistration('${safe(k)}')">✎</button><button class="del" onclick="window.deleteRegistration('${safe(k)}')">×</button></div></td></tr>`).join("");
}
window.viewRegistration=k=>{const d=registrations[k];if(!d)return;currentKey=k;$("modalContent").innerHTML=`<h2>${safe(d.TeamName||"Registration")}</h2><p><b>ID:</b> ${safe(d.registrationId||k)}</p><div class="detail">${Object.entries(d).filter(([a])=>a!=="createdAt").map(([a,v])=>`<div><small>${safe(a)}</small><b>${safe(norm(v)||"-")}</b></div>`).join("")}</div>`;$("modal").classList.remove("hidden")};
window.editRegistration=k=>{const d=registrations[k];if(!d)return;const name=prompt("Team Leader:",d.StudentName||"");if(name===null)return;const team=prompt("Team Name:",d.TeamName||"");if(team===null)return;update(ref(db,`registrations/${k}`),{StudentName:name.trim(),TeamName:team.trim()}).then(()=>{registrations[k].StudentName=name.trim();registrations[k].TeamName=team.trim();filtered[k]=registrations[k];renderTable();renderRecent();alert("Registration updated.")}).catch(console.error)};
window.deleteRegistration=async k=>{if(!registrations[k])return;if(!confirm(`Delete ${registrations[k].StudentName||"this registration"}?`))return;try{await remove(ref(db,`registrations/${k}`));delete registrations[k];delete filtered[k];updateDashboard();renderRecent();renderTable();}catch(e){console.error(e);alert("Delete failed. Check database permissions.")}};
$("closeModal").onclick=()=>$("modal").classList.add("hidden");$("modal").onclick=e=>{if(e.target.id==="modal")$("modal").classList.add("hidden")};
$("dashboardRefresh").onclick=loadRegistrations;$("refreshRegistrations").onclick=loadRegistrations;
function csvEsc(v){return `"${norm(v).replace(/"/g,'""')}"`}
function exportCSV(obj){const rows=[["Registration ID","Team Leader","Team Name","Class","Section","Mobile","Email","Events","Team Size","Member 2","Member 3","Member 4","Member 5","Remarks","Registration Date"]];Object.entries(obj).forEach(([k,d])=>rows.push([d.registrationId||k,d.StudentName,d.TeamName,d.Class,d.Section,d.MobileNumber,emailOf(d),events(d).join(" | "),size(d),d.Member2Name,d.Member3Name,d.Member4Name,d.Member5Name,d.Remarks,d.registrationDate].map(csvEsc)));const blob=new Blob(["\ufeff"+rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="APS_Robotics_Registrations_2026.csv";a.click();URL.revokeObjectURL(a.href)}
$("exportCsv").onclick=()=>exportCSV(filtered);$("exportDashboard").onclick=()=>exportCSV(registrations);
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("modal").classList.add("hidden")});
