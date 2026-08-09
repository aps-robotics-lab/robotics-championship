/* =========================================================
APS ROBOTICS CHAMPIONSHIP 2026
REGISTRATION SYSTEM
Firebase Realtime Database
========================================================= */

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
getDatabase,
ref,
push,
set
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

/* =========================================================
FIREBASE CONFIGURATION
========================================================= */

const firebaseConfig = {

apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",  

authDomain:  
    "aps-robotics-championship.firebaseapp.com",  

databaseURL:  
    "https://aps-robotics-championship-default-rtdb.firebaseio.com",  

projectId:  
    "aps-robotics-championship",  

storageBucket:

