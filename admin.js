// ADMIN LOGIN

window.login = function(){

    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if(user === "apsadmin" && pass === "APS2026@Lab"){

        document.querySelector(".login-box").style.display="none";

        document.getElementById("dashboard").style.display="block";

        loadRegistrations();

    }

    else{

        document.getElementById("error").innerHTML =
        "❌ Invalid Login Details";

    }

};



// FIREBASE CONNECTION

import { initializeApp } from 
"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {

getFirestore,
collection,
getDocs

}

from 
"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";



const firebaseConfig = {

apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",

authDomain: "aps-robotics-championship.firebaseapp.com",

projectId: "aps-robotics-championship",

storageBucket: "aps-robotics-championship.firebasestorage.app",

messagingSenderId: "1063542904891",

appId: "1:1063542904891:web:82ff9bb3fba0b87384a41e"

};



const app = initializeApp(firebaseConfig);

const db = getFirestore(app);



// LOAD REGISTRATIONS


async function loadRegistrations(){


const querySnapshot = await getDocs(
collection(db,"registrations")
);


let total=0;
let race=0;
let war=0;
let tug=0;
let soccer=0;


let table="";


querySnapshot.forEach((doc)=>{


let data = doc.data();


total++;


if(data.events.includes("Robo Race"))
race++;

if(data.events.includes("Robo War"))
war++;

if(data.events.includes("Robo Tug of War"))
tug++;

if(data.events.includes("Robo Soccer"))
soccer++;



table += `

<tr>

<td>${data.registrationId || "-"}</td>

<td>${data.studentName || "-"}</td>

<td>${data.teamName || "-"}</td>

<td>${data.events.join(", ")}</td>

<td>${data.mobile || "-"}</td>

</tr>

`;



});



document.getElementById("total").innerHTML=total;

document.getElementById("race").innerHTML=race;

document.getElementById("war").innerHTML=war;

document.getElementById("tug").innerHTML=tug;

document.getElementById("soccer").innerHTML=soccer;



document.getElementById("tableBody").innerHTML=table;


}
window.searchRegistration = function(){

let value = document
.getElementById("search")
.value
.toLowerCase();


let rows = document
.querySelectorAll("#tableBody tr");


rows.forEach(row=>{

let text=row.innerText.toLowerCase();


if(text.includes(value)){

row.style.display="";

}

else{

row.style.display="none";

}

});

}
