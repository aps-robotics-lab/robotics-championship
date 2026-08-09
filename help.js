import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig={
 apiKey:"AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",
 authDomain:"aps-robotics-championship.firebaseapp.com",
 databaseURL:"https://aps-robotics-championship-default-rtdb.firebaseio.com",
 projectId:"aps-robotics-championship",
 storageBucket:"aps-robotics-championship.firebasestorage.app",
 messagingSenderId:"1056582901838",
 appId:"1:1056582901838:web:placeholder"
};
const app=initializeApp(firebaseConfig),db=getDatabase(app);
const $=id=>document.getElementById(id);
$("helpForm").addEventListener("submit",async e=>{
 e.preventDefault();const btn=$("submitBtn"),status=$("formStatus");btn.disabled=true;status.textContent="Sending...";
 try{
  const issueRef=push(ref(db,"issues"));
  const issueId="ISS-"+Date.now().toString(36).toUpperCase();
  await set(issueRef,{issueId,name:$("name").value.trim(),email:$("email").value.trim(),category:$("category").value,subject:$("subject").value.trim(),message:$("message").value.trim(),status:"Open",createdAt:Date.now()});
  status.textContent=`Issue submitted successfully. Your Issue ID is ${issueId}.`;
  status.style.color="#63e9a0";$("helpForm").reset();
 }catch(err){status.textContent="Unable to submit your issue. Please try again.";status.style.color="#ff7187";console.error(err)}
 finally{btn.disabled=false}
});