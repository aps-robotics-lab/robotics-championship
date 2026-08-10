import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { mainFirebaseConfig, ADMIN_UID } from "./firebase-config.js";

const app=initializeApp(mainFirebaseConfig),auth=getAuth(app),db=getDatabase(app);
let registrations={};
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const val=(d,ks,f="—")=>{for(const k of ks)if(d?.[k]!==undefined&&d[k]!==null&&String(d[k]).trim()!=="")return d[k];return f};
const events=d=>{let x=val(d,["events","event","selectedEvents"],[]);if(Array.isArray(x))return x;if(x&&typeof x==="object")return Object.values(x);return typeof x==="string"?x.split(/,|\n/).map(v=>v.trim()).filter(Boolean):[]};
const members=d=>{const out=[];for(let i=2;i<=10;i++){const n=val(d,[`Member${i}Name`,`member${i}Name`],"");if(n&&n!=="—")out.push({name:n,class:val(d,[`Member${i}Class`,`member${i}Class`],""),section:val(d,[`Member${i}Section`,`member${i}Section`],"")})}return out};
const size=d=>{const n=parseInt(val(d,["teamSize","TeamSize","membersCount"],"1"),10);return Number.isFinite(n)&&n>0?n:Math.max(1,members(d).length+1)};
const type=d=>size(d)>1||members(d).length?"team":"solo";
function render(){const q=$("search")?.value.trim().toLowerCase()||"",tf=$("typeFilter")?.value||"all",ef=$("eventFilter")?.value||"all";const rows=Object.entries(registrations).filter(([k,d])=>{const hay=[k,val(d,["registrationId","id"],k),val(d,["studentName","name"]),val(d,["emailAddress","email"]),val(d,["mobileNumber","mobile"]),val(d,["teamName","team"]),...events(d),...members(d).map(m=>m.name)].join(" ").toLowerCase();return(!q||hay.includes(q))&&(tf==="all"||type(d)===tf)&&(ef==="all"||events(d).includes(ef))}).reverse();$("registrationBody").innerHTML=rows.length?rows.map(([k,d])=>`<tr><td>${esc(val(d,["registrationId","id"],k))}</td><td>${esc(val(d,["studentName","name"]))}</td><td>${esc(val(d,["teamName","team"],"—"))}</td><td>${type(d)}</td><td>${size(d)}</td><td>${esc(val(d,["mobileNumber","mobile"]))}<br>${esc(val(d,["emailAddress","email"]))}</td><td>${events(d).map(esc).join(", ")||"—"}</td><td><button data-view="${esc(k)}">View</button><button data-delete="${esc(k)}">Delete</button></td></tr>`).join(""):`<tr><td colspan="8">No registrations found.</td></tr>`;
$("registrationBody")?.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>view(b.dataset.view));$("registrationBody")?.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>del(b.dataset.delete));
$("totalRegistrations")&&( $("totalRegistrations").textContent=Object.keys(registrations).length);
$("soloCount")&&($("soloCount").textContent=Object.values(registrations).filter(d=>type(d)==="solo").length);
$("teamCount")&&($("teamCount").textContent=Object.values(registrations).filter(d=>type(d)==="team").length);
$("eventEntries")&&($("eventEntries").textContent=Object.values(registrations).reduce((n,d)=>n+events(d).length,0));
}
function view(k){const d=registrations[k];if(!d)return;const m=members(d);$("detailContent").innerHTML=`<h2>${esc(val(d,["registrationId","id"],k))}</h2><p><b>Leader:</b> ${esc(val(d,["studentName","name"]))}</p><p><b>Class:</b> ${esc(val(d,["studentClass","class"]))}</p><p><b>Section:</b> ${esc(val(d,["studentSection","section"]))}</p><p><b>Email:</b> ${esc(val(d,["emailAddress","email"]))}</p><p><b>Mobile:</b> ${esc(val(d,["mobileNumber","mobile"]))}</p><p><b>Team:</b> ${esc(val(d,["teamName","team"]))}</p><p><b>Events:</b> ${events(d).map(esc).join(", ")}</p><h3>Members</h3>${m.length?m.map(x=>`<p>${esc(x.name)} — Class ${esc(x.class)} — Section ${esc(x.section)}</p>`).join(""):"No additional members."}`;$("detailOverlay").style.display="block"}
function del(k){if(confirm("Delete this registration permanently?"))remove(ref(db,`registrations/${k}`)).catch(e=>{console.error(e);alert("Delete denied by Firebase rules.")})}
$("closeDetail")?.addEventListener("click",()=>{$("detailOverlay").style.display="none"});
$("search")?.addEventListener("input",render);$("typeFilter")?.addEventListener("change",render);$("eventFilter")?.addEventListener("change",render);$("logoutBtn")?.addEventListener("click",async()=>{await signOut(auth);location.href="login-admin.html"});
onAuthStateChanged(auth,user=>{if(!user||(!ADMIN_UID.startsWith("PASTE_")&&user.uid!==ADMIN_UID)){signOut(auth).finally(()=>location.href="login-admin.html");return}$("adminEmail")&&( $("adminEmail").textContent=user.email||user.uid);onValue(ref(db,"registrations"),s=>{registrations=s.val()||{};render()})});
