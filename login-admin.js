import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { mainFirebaseConfig, ADMIN_UID } from "./firebase-config.js";

const app = initializeApp(mainFirebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");

function setMessage(text,type=""){if(!message)return;message.textContent=text;message.className=`message ${type}`.trim();}
async function isAuthorized(user){
  if(!user)return false;
  const configured = typeof ADMIN_UID === "string" && ADMIN_UID.trim() && !ADMIN_UID.includes("REPLACE_WITH");
  if(configured && user.uid === ADMIN_UID) return true;
  try{
    const snap=await get(ref(db,`admins/${user.uid}`));
    return snap.exists() && snap.val()===true;
  }catch(err){
    console.error("Registration Department authorization check failed:",err);
    return false;
  }
}

togglePassword?.addEventListener("click",()=>{if(!password)return;const show=password.type==="password";password.type=show?"text":"password";togglePassword.textContent=show?"🙈":"👁";});
form?.addEventListener("submit",async e=>{
  e.preventDefault();
  const evalue=email?.value.trim().toLowerCase()||"";
  const pvalue=password?.value||"";
  if(!evalue||!pvalue)return setMessage("Enter your email and password.","error");
  setMessage("Authenticating with Registration Department...");
  try{
    const credential=await signInWithEmailAndPassword(auth,evalue,pvalue);
    if(!(await isAuthorized(credential.user))){await signOut(auth);return setMessage("Access denied. This account is not authorized for the Registration Department.","error");}
    setMessage("Access verified. Opening Registration Department...","success");
    window.location.replace("admin.html");
  }catch(err){
    console.error("Registration Department login error:",err);
    const code=err?.code||"";
    const text=code==="auth/invalid-credential"||code==="auth/wrong-password"||code==="auth/user-not-found"?"Incorrect email or password.":code==="auth/network-request-failed"?"Network error. Check your internet connection.":"Login failed. Check Firebase Authentication and your account permissions.";
    setMessage(text,"error");
  }
});

onAuthStateChanged(auth,async user=>{
  if(!user)return;
  if(await isAuthorized(user)) window.location.replace("admin.html");
  else await signOut(auth).catch(()=>{});
});
