import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

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
const db=getDatabase(app);

const EMAILJS_PUBLIC_KEY="GnxniZ70ndujyjDpe";
const EMAILJS_SERVICE_ID="service_5m4uzhb";
const EMAILJS_TEMPLATE_ID="template_5qb8b2p";

const emailScript=document.createElement("script");
emailScript.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
emailScript.onload=()=>window.emailjs&&window.emailjs.init({publicKey:EMAILJS_PUBLIC_KEY});
document.head.appendChild(emailScript);

const form=document.getElementById("registrationForm");
const submitBtn=document.getElementById("submitBtn");
const formMessage=document.getElementById("formMessage");
const successOverlay=document.getElementById("successOverlay");
const successRegistrationId=document.getElementById("successRegistrationId");
const continueBtn=document.getElementById("continueBtn");
const eventError=document.getElementById("eventError");
const remarks=document.getElementById("remarks");
const characterCount=document.getElementById("characterCount");
const participationType=document.getElementById("participationType");
const memberInstruction=document.getElementById("memberInstruction");
const memberCards=document.getElementById("memberCards");

function getValue(id){const e=document.getElementById(id);return e?e.value.trim():"";}
function getTeamSize(){const e=document.querySelector('input[name="TeamSize"]:checked');return e?Number(e.value):1;}
function getSelectedEvents(){return [...document.querySelectorAll('input[name="Events"]:checked')].map(e=>e.value);}
function generateRegistrationId(){return `APS-RBC-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*9000)}`;}
function showMessage(message,type="error"){formMessage.textContent=message;formMessage.className=`form-message ${type} show`;}
function clearMessage(){formMessage.textContent="";formMessage.className="form-message";}

function memberCard(n){
 return `<div class="member-card additional-member" data-member-card="${n}">
 <div class="member-card-header"><div class="member-icon"><i class="fa-solid fa-user"></i></div><div><span>PARTICIPANT ${String(n).padStart(2,"0")}</span><h3>Team Member ${n}</h3></div></div>
 <div class="field-grid">
 <div class="field full-field"><label for="member${n}Name"><i class="fa-solid fa-user"></i> Full Name</label><input type="text" id="member${n}Name" name="Member${n}Name" placeholder="Enter member ${n} name"></div>
 <div class="field"><label for="member${n}Class"><i class="fa-solid fa-graduation-cap"></i> Class</label><select id="member${n}Class" name="Member${n}Class"><option value="">Select Class</option><option>VI</option><option>VII</option><option>VIII</option><option>IX</option><option>X</option><option>XI</option><option>XII</option></select></div>
 <div class="field"><label for="member${n}Section"><i class="fa-solid fa-layer-group"></i> Section</label><input type="text" id="member${n}Section" name="Member${n}Section" placeholder="e.g. A" maxlength="5"></div>
 </div></div>`;
}
memberCards.innerHTML=[2,3,4,5].map(memberCard).join("");

function updateTeamSize(){
 const size=getTeamSize();
 document.querySelectorAll(".additional-member").forEach(card=>{
   const n=Number(card.dataset.memberCard);
   card.classList.toggle("hidden-member",n>size);
   ["Name","Class","Section"].forEach(part=>{
     const e=document.getElementById(`member${n}${part}`);
     if(e)e.required=n<=size;
     if(n>size&&e)e.value="";
   });
 });
 participationType.value=size===1?"Solo":`Team of ${size}`;
 memberInstruction.textContent={
 1:"Solo participation selected. No additional members required.",
 2:"Team of 2 selected. Please enter details for Participant 02.",
 3:"Team of 3 selected. Please enter details for Participants 02 and 03.",
 4:"Team of 4 selected. Please enter details for Participants 02–04.",
 5:"Team of 5 selected. Please enter details for Participants 02–05."
 }[size];
}
document.querySelectorAll('input[name="TeamSize"]').forEach(e=>e.addEventListener("change",updateTeamSize));
updateTeamSize();

remarks.addEventListener("input",()=>characterCount.textContent=remarks.value.length);
document.getElementById("mobileNumber").addEventListener("input",e=>e.target.value=e.target.value.replace(/\D/g,"").slice(0,10));
document.getElementById("emailAddress").addEventListener("blur",e=>e.target.value=e.target.value.trim().toLowerCase());
document.querySelectorAll('input[name="Events"]').forEach(e=>e.addEventListener("change",validateEvents));

function validateEvents(){
 const ok=getSelectedEvents().length>0;
 eventError.textContent=ok?"":"Please select at least one event.";
 return ok;
}

function collectRegistrationData(){
 const now=new Date();
 const data={
  registrationId:generateRegistrationId(),TeamSize:getTeamSize(),
  ParticipationType:getValue("participationType"),StudentName:getValue("studentName"),
  Class:getValue("studentClass"),Section:getValue("studentSection"),
  MobileNumber:getValue("mobileNumber"),EmailAddress:getValue("emailAddress"),
  TeamName:getValue("teamName"),Events:getSelectedEvents(),
  Remarks:getValue("remarks"),
  registrationDate:now.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})
 };
 for(let n=2;n<=5;n++){data[`Member${n}Name`]=getValue(`member${n}Name`);data[`Member${n}Class`]=getValue(`member${n}Class`);data[`Member${n}Section`]=getValue(`member${n}Section`);}
 return data;
}
async function saveRegistration(data){
 const r=push(ref(db,"registrations"));await set(r,data);return r.key;
}
async function waitForEmailJS(){
 for(let i=0;i<40&&!window.emailjs;i++)await new Promise(r=>setTimeout(r,250));
 if(!window.emailjs)throw new Error("EmailJS SDK failed to load.");
}
async function sendConfirmationEmail(data){
 await waitForEmailJS();
 const p={...data,Events:data.Events.join(", "),TeamName:data.TeamName||"Not specified",Remarks:data.Remarks||"No additional remarks."};
 for(let n=2;n<=5;n++){p[`Member${n}Name`]=data[`Member${n}Name`]||"Not applicable";p[`Member${n}Class`]=data[`Member${n}Class`]||"";p[`Member${n}Section`]=data[`Member${n}Section`]||"";}
 return window.emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,p);
}
function showSuccess(id){successRegistrationId.textContent=id;sessionStorage.setItem("apsRegistrationId",id);sessionStorage.setItem("apsRegistrationName",getValue("studentName"));successOverlay.classList.remove("hidden");}
form.addEventListener("submit",async e=>{
 e.preventDefault();clearMessage();
 if(!form.checkValidity()){form.reportValidity();return;}
 if(!validateEvents())return;
 if(submitBtn.disabled)return;
 const data=collectRegistrationData();submitBtn.disabled=true;submitBtn.classList.add("loading");
 try{await saveRegistration(data);try{await sendConfirmationEmail(data);}catch(err){console.error("EmailJS failed:",err);}showSuccess(data.registrationId);}
 catch(err){console.error(err);showMessage("Registration could not be completed. Please try again.","error");}
 finally{submitBtn.disabled=false;submitBtn.classList.remove("loading");}
});
continueBtn.addEventListener("click",()=>window.location.href="thankyou.html");
