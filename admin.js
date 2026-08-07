import { initializeApp } 
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


import {
getDatabase,
ref,
onValue
}
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";



// FIREBASE CONFIG


const firebaseConfig = {


apiKey:"YOUR_API_KEY",

authDomain:
"aps-robotics-championship.firebaseapp.com",

databaseURL:
"https://aps-robotics-championship-default-rtdb.firebaseio.com",

projectId:
"aps-robotics-championship",

storageBucket:
"aps-robotics-championship.firebasestorage.app",

messagingSenderId:
"1063542904891",

appId:
"YOUR_APP_ID"

};



const app = initializeApp(firebaseConfig);


const database = getDatabase(app);





// LOGIN


window.login=function(){


let username=
document.getElementById("username").value;


let password=
document.getElementById("password").value;



if(username==="admin" && password==="aps2026"){


localStorage.setItem(
"adminLogin",
"true"
);


document.querySelector(".login-box").style.display="none";


document.getElementById("dashboard").style.display="block";


loadData();


}

else{


document.getElementById("error").innerHTML=
"❌ Invalid Username or Password";


}


}






// AUTO LOGIN


if(localStorage.getItem("adminLogin")==="true"){


document.querySelector(".login-box").style.display="none";


document.getElementById("dashboard").style.display="block";


loadData();


}






// LOGOUT


window.logout=function(){


localStorage.removeItem("adminLogin");


location.reload();


}







// LOAD DATA


function loadData(){


let table=
document.getElementById("tableBody");


let dbRef=
ref(database,"registrations");



onValue(dbRef,(snapshot)=>{


table.innerHTML="";


let total=0;
let race=0;
let war=0;
let tug=0;
let soccer=0;



snapshot.forEach((child)=>{


total++;


let data=child.val();



let events=data.Events || "";



if(events.includes("Robo Race"))
race++;


if(events.includes("Robo War"))
war++;


if(events.includes("Robo Tug of War"))
tug++;


if(events.includes("Robo Soccer"))
soccer++;





let row=document.createElement("tr");


row.innerHTML=`

<td>${child.key}</td>

<td>${data.StudentName || "-"}</td>

<td>${data.TeamName || "-"}</td>

<td>${events}</td>

<td>${data.MobileNumber || "-"}</td>

`;



table.appendChild(row);



});



document.getElementById("total").innerHTML=total;

document.getElementById("race").innerHTML=race;

document.getElementById("war").innerHTML=war;

document.getElementById("tug").innerHTML=tug;

document.getElementById("soccer").innerHTML=soccer;



});


}



window.loadData=loadData;







// SEARCH


window.searchRegistration=function(){


let value=
document.getElementById("search").value.toLowerCase();



document.querySelectorAll("#tableBody tr")
.forEach(row=>{


if(row.innerText.toLowerCase().includes(value))

row.style.display="";


else

row.style.display="none";


});


}







// CSV DOWNLOAD


window.downloadCSV=function(){


let rows=
document.querySelectorAll("table tr");


let csv=[];


rows.forEach(row=>{


let cols=row.querySelectorAll("td,th");


let data=[];


cols.forEach(col=>{

data.push(col.innerText);

});


csv.push(data.join(","));


});



let blob=
new Blob([csv.join("\n")],
{
type:"text/csv"
});



let link=document.createElement("a");


link.href=
URL.createObjectURL(blob);


link.download=
"APS_Robotics_Registrations.csv";


link.click();


}
