import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { mainFirebaseConfig } from "./firebase-config.js";

const app = initializeApp(mainFirebaseConfig);
const db = getDatabase(app);

function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element && value) {
        element.textContent = value;
    }
}

// Load Home Data
onValue(ref(db, "siteContent/home"), snapshot => {
    if (!snapshot.exists()) return;
    const home = snapshot.val();

    setText("#adminHomeEyebrow", home.eyebrow);
    setText("#adminHomeTitle", home.title);
    setText("#adminHomeDescription", home.description);
    setText("#adminAboutTitle", home.aboutTitle);
    setText("#adminAboutDescription", home.aboutDescription);

    const button = document.querySelector("#adminHomeButton");
    if (button) {
        if (home.buttonText) button.textContent = home.buttonText;
        if (home.buttonLink) button.href = home.buttonLink;
    }
});

// Load Messages Data
onValue(ref(db, "siteContent/messages"), snapshot => {
    if (!snapshot.exists()) return;
    const msgs = snapshot.val();

    setText("#msgPrincipalText", msgs.principalText);
    setText("#msgPrincipalName", msgs.principalName);
    
    setText("#msgMentorText", msgs.mentorText);
    setText("#msgMentorName", msgs.mentorName);
    
    setText("#msgCoordText", msgs.coordText);
    setText("#msgCoordName", msgs.coordName);
    
    setText("#msgTeamText", msgs.teamText);
    setText("#msgTeamName", msgs.teamName);
});
