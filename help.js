import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, push, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { helpFirebaseConfig } from "./firebase-config.js";

const db = getDatabase(initializeApp(helpFirebaseConfig));
const form = document.getElementById("helpForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const button = form.querySelector('[type="submit"]');
  if (button) button.disabled = true;

  try {
    const ticketRef = push(ref(db, "tickets"));

    await set(ticketRef, {
      ticketId: ticketRef.key,
      studentName: String(form.querySelector('[name="studentName"]')?.value || "").trim(),
      email: String(form.querySelector('[name="email"]')?.value || "").trim(),
      subject: String(form.querySelector('[name="subject"]')?.value || "").trim(),
      message: String(form.querySelector('[name="message"]')?.value || "").trim(),
      status: "open",
      createdAt: serverTimestamp()
    });

    sessionStorage.setItem("apsHelpTicketId", ticketRef.key);
    location.href = `support-success.html?ticket=${encodeURIComponent(ticketRef.key)}`;
  } catch (error) {
    console.error(error);
    alert("Could not submit your support request.");
  } finally {
    if (button) button.disabled = false;
  }
});
