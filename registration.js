import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, push, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

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
const form=document.getElementById("registrationForm");
const msg=document.getElementById("formMessage");
const btn=document.getElementById("submitBtn");
const memberSection=document.getElementById("memberSection");
const soloChoice=document.getElementById("soloChoice");
const teamChoice=document.getElementById("teamChoice");
const val=id=>document.getElementById(id)?.value.trim() || "";

function participationType(){return document.querySelector('input[name="participationType"]:checked')?.value || "Solo";}
function updateParticipationUI(){
  const team=participationType()==="Team";
  memberSection.classList.toggle("hidden-section",!team);
  memberSection.setAttribute("aria-hidden",String(!team));
  soloChoice.classList.toggle("active",!team);
  teamChoice.classList.toggle("active",team);
  document.getElementById("member2").required=team;
  document.getElementById("member2Class").required=team;
  document.getElementById("member2Section").required=team;
  if(!team){
    ["member2","member2Class","member2Section"].forEach(id=>document.getElementById(id).value="");
  }
}

document.querySelectorAll('input[name="participationType"]').forEach(r=>r.addEventListener("change",updateParticipationUI));
updateParticipationUI();

form.addEventListener("submit",async e=>{
 e.preventDefault();
 msg.textContent="";
 const type=participationType();
 const events=[...document.querySelectorAll('input[name="events"]:checked')].map(x=>x.value);
 if(!events.length){msg.textContent="Please select at least one event.";return;}
 if(type==="Team" && !val("member2")){msg.textContent="Please enter the second team member's name.";return;}
 btn.disabled=true;btn.textContent="Submitting...";
 try{
   const recordRef=push(ref(db,"registrations"));
   const key=recordRef.key;
   const record={
     registrationId:"APS26-"+String(key).slice(-8).toUpperCase(),
     ParticipationType:type,
     StudentName:val("studentName"),TeamName:val("teamName"),Class:val("className"),Section:val("sectionName"),
     MobileNumber:val("mobile"),EmailAddress:val("email"),Events:events,
     Member2Name:type==="Team"?val("member2"):"",Member2Class:type==="Team"?val("member2Class"):"",Member2Section:type==="Team"?val("member2Section"):"",
     Member3Name:"",Member3Class:"",Member3Section:"",Member4Name:"",Member4Class:"",Member4Section:"",Member5Name:"",Member5Class:"",Member5Section:"",
     TeamSize:type==="Team"?2:1,
     Remarks:val("remarks"),registrationDate:new Date().toISOString(),createdAt:serverTimestamp()
   };
   await set(recordRef,record);
   sessionStorage.setItem("apsRegistrationId",record.registrationId);
   sessionStorage.setItem("apsRegistrationName",record.StudentName);
   location.href="thankyou.html";
 }catch(err){
   console.error(err);
   msg.textContent="Registration could not be submitted. Please check your Firebase Realtime Database rules and internet connection.";
   btn.disabled=false;btn.textContent="Submit Registration →";
 }
});
