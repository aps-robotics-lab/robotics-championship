import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { helpFirebaseConfig, AGENT_UIDS } from "./firebase-config.js";

const app=initializeApp(helpFirebaseConfig), auth=getAuth(app), db=getDatabase(app);
const form=document.getElementById("loginForm"), email=document.getElementById("email"), password=document.getElementById("password"), message=document.getElementById("loginMessage"), toggle=document.getElementById("togglePassword");
const configured=new Set((AGENT_UIDS||[]).filter(Boolean));
function msg(t,type=""){if(message){message.textContent=t;message.className=`message ${type}`.trim()}}
toggle?.addEventListener("click",()=>{if(!password)return;const show=password.type==="password";password.type=show?"text":"password";toggle.textContent=show?"🙈":"👁"});
async function allowed(uid){if(configured.has(uid))return true;try{const s=await get(ref(db,`agents/${uid}/active`));return s.exists()&&s.val()===true}catch{return false}}
async function route(user){if(!user)return; if(await allowed(user.uid)){location.replace("agent.html")}else{await signOut(auth);msg("Access denied. This account is not an active support agent.","error")}}
form?.addEventListener("submit",async e=>{e.preventDefault();const ev=email?.value.trim(),pv=password?.value||"";if(!ev||!pv)return msg("Enter your email and password.","error");msg("Authenticating...");try{const c=await signInWithEmailAndPassword(auth,ev,pv);await route(c.user)}catch(err){console.error(err);msg(err.code==="auth/too-many-requests"?"Too many attempts. Please wait and try again.":"Invalid credentials or this account is not authorized.","error")}});
onAuthStateChanged(auth,user=>{if(user)route(user)});
