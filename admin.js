import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig = {
 apiKey:"AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",
 authDomain:"aps-robotics-championship.firebaseapp.com",
 databaseURL:"https://aps-robotics-championship-default-rtdb.firebaseio.com",
 projectId:"aps-robotics-championship",
 storageBucket:"aps-robotics-championship.firebasestorage.app",
 messagingSenderId:"1063542904891",
 appId:"1:1063542904891:web:82ff9bb3fba0b87384a41e"
};

const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getDatabase(app);
const loginView=document.getElementById("loginView"), appView=document.getElementById("appView");
const error=document.getElementById("error"), rows=document.getElementById("rows"), search=document.getElementById("search");
let data=[];

document.getElementById("loginBtn").onclick=async()=>{
 error.textContent="";
 try{await signInWithEmailAndPassword(auth,document.getElementById("email").value.trim(),document.getElementById("password").value);}
 catch(e){error.textContent=e.message;}
};
document.getElementById("logoutBtn").onclick=()=>signOut(auth);
document.getElementById("refreshBtn").onclick=load;
search.oninput=render;

onAuthStateChanged(auth,user=>{
 if(user){loginView.classList.add("hidden");appView.classList.remove("hidden");load();}
 else{appView.classList.add("hidden");loginView.classList.remove("hidden");}
});

function load(){
 onValue(ref(db,"registrations"),snap=>{
   const obj=snap.val()||{};
   data=Object.values(obj).map(x=>({...x,Events:Array.isArray(x.Events)?x.Events:[],_members:[2,3,4,5].map(n=>[x[`Member${n}Name`],x[`Member${n}Class`],x[`Member${n}Section`]].filter(Boolean).join(" / ")).filter(Boolean)}));
   render();
 },{onlyOnce:true});
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function render(){
 const q=search.value.toLowerCase();
 const filtered=data.filter(x=>JSON.stringify(x).toLowerCase().includes(q));
 document.getElementById("count").textContent=data.length;
 document.getElementById("solo").textContent=data.filter(x=>Number(x.TeamSize)===1).length;
 document.getElementById("teams").textContent=data.filter(x=>Number(x.TeamSize)>1).length;
 rows.innerHTML=filtered.map(x=>`<tr>
 <td>${esc(x.registrationId)}</td><td>${esc(x.registrationDate)}</td>
 <td><span class="badge">${esc(x.ParticipationType)}</span></td>
 <td>${esc(x.StudentName)}</td><td>${esc(x.Class)} / ${esc(x.Section)}</td>
 <td>${esc(x.MobileNumber)}<br>${esc(x.EmailAddress)}</td><td>${esc(x.TeamName||"—")}</td>
 <td>${esc(x._members.join(" | ")||"Solo")}</td><td>${esc(x.Events.join(", "))}</td><td>${esc(x.Remarks||"")}</td></tr>`).join("");
}
document.getElementById("exportBtn").onclick=()=>{
 const cols=["registrationId","registrationDate","ParticipationType","TeamSize","StudentName","Class","Section","MobileNumber","EmailAddress","TeamName","Events","Member2Name","Member2Class","Member2Section","Member3Name","Member3Class","Member3Section","Member4Name","Member4Class","Member4Section","Member5Name","Member5Class","Member5Section","Remarks"];
 const csv=[cols.join(","),...data.map(x=>cols.map(c=>`"${String(Array.isArray(x[c])?x[c].join("; "):x[c]??"").replaceAll('"','""')}"`).join(","))].join("\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="aps-robotics-registrations.csv";a.click();URL.revokeObjectURL(a.href);
};
