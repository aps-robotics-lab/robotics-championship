import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, push, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { mainFirebaseConfig } from "./firebase-config.js";

const db = getDatabase(initializeApp(mainFirebaseConfig));
const form = document.getElementById("registrationForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);
  const events = [...form.querySelectorAll('input[name="events"]:checked')].map(x => x.value);

  if (!events.length) {
    alert("Please select at least one event.");
    return;
  }

  const button = form.querySelector('[type="submit"]');
  if (button) button.disabled = true;

  const registrationRef = push(ref(db, "registrations"));
  const data = {
    registrationId: registrationRef.key,
    studentName: String(fd.get("studentName") || "").trim(),
    studentClass: String(fd.get("class") || "").trim(),
    studentSection: String(fd.get("section") || "").trim(),
    mobileNumber: String(fd.get("mobile") || "").trim(),
    emailAddress: String(fd.get("email") || "").trim(),
    teamName: String(fd.get("teamName") || "").trim(),
    type: String(fd.get("type") || "solo"),
    teamSize: Number(fd.get("teamSize") || 1),
    events,
    remarks: String(fd.get("remarks") || "").trim(),
    timestamp: serverTimestamp()
  };

  for (let i = 2; i <= 10; i++) {
    const name = String(fd.get(`Member${i}Name`) || "").trim();
    if (name) {
      data[`Member${i}Name`] = name;
      data[`Member${i}Class`] = String(fd.get(`Member${i}Class`) || "").trim();
      data[`Member${i}Section`] = String(fd.get(`Member${i}Section`) || "").trim();
    }
  }

  try {
    await set(registrationRef, data);
    sessionStorage.setItem("apsRegistrationId", registrationRef.key);
    sessionStorage.setItem("apsRegistrationName", data.studentName);
    location.href = `thankyou.html?id=${encodeURIComponent(registrationRef.key)}`;
  } catch (error) {
    console.error(error);
    alert("Registration failed. Please try again.");
  } finally {
    if (button) button.disabled = false;
  }
});
