 // ================= ADMIN LOGIN =================

window.login = function(){

    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();

    if(user === "apsadmin" && pass === "APS2026@Lab"){

        document.querySelector(".login-box").style.display = "none";

        document.getElementById("dashboard").style.display = "block";

        loadRegistrations();

    }

    else{

        document.getElementById("error").innerHTML =
        "❌ Invalid Login Details";

    }

};



// ================= FIREBASE CONNECTION =================

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




// ================= LOAD REGISTRATIONS =================


async function loadRegistrations(){

try{


const querySnapshot = await getDocs(
collection(db,"registrations")
);



let total = 0;
let race = 0;
let war = 0;
let tug = 0;
let soccer = 0;


let table = "";



querySnapshot.forEach((doc)=>{


let data = doc.data();


let events = data.events || [];



total++;


// Count Events

if(events.includes("Robo Race"))
race++;

if(events.includes("Robo War"))
war++;

if(events.includes("Robo Tug of War"))
tug++;

if(events.includes("Robo Soccer"))
soccer++;




// Create Table

table += `

<tr>

<td>${data.registrationId || "-"}</td>

<td>${data.studentName || "-"}</td>

<td>${data.teamName || "-"}</td>

<td>${events.join(", ")}</td>

<td>${data.mobile || "-"}</td>

</tr>

`;



});




// Update Dashboard

document.getElementById("total").innerHTML = total;

document.getElementById("race").innerHTML = race;

document.getElementById("war").innerHTML = war;

document.getElementById("tug").innerHTML = tug;

document.getElementById("soccer").innerHTML = soccer;


document.getElementById("tableBody").innerHTML = table;



}

catch(error){

console.log(error);

alert("Error loading registrations");

}


}




// Make function available globally

window.loadRegistrations = loadRegistrations;





// ================= SEARCH =================


window.searchRegistration = function(){


let value = document
.getElementById("search")
.value
.toLowerCase();



let rows = document
.querySelectorAll("#tableBody tr");



rows.forEach(row=>{


let text = row.innerText.toLowerCase();



if(text.includes(value)){

row.style.display = "";

}

else{

row.style.display = "none";

}


});


};





// ================= DOWNLOAD CSV =================


window.downloadCSV = function(){


let csv = [];



let rows = document.querySelectorAll("table tr");



rows.forEach(row=>{


let cols = row.querySelectorAll("th,td");

let data = [];


cols.forEach(col=>{

data.push(
`"${col.innerText}"`
);

});


csv.push(data.join(","));


});



let csvFile = new Blob(

[csv.join("\n")],

{
type:"text/csv"
}

);



let link = document.createElement("a");


link.href = URL.createObjectURL(csvFile);


link.download =
"APS_Robotics_Championship_2026_Registrations.csv";



link.click();



};
