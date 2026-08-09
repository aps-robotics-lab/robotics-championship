import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",
  authDomain: "aps-robotics-championship.firebaseapp.com",
  databaseURL: "https://aps-robotics-championship-default-rtdb.firebaseio.com",
  projectId: "aps-robotics-championship",
  storageBucket: "aps-robotics-championship.firebasestorage.app",
  messagingSenderId: "1063542904891",
  appId: "1:1063542904891:web:82ff9bb3fba0b87384a41e"
};

const app =
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);

const db =
  getDatabase(app);


/* =========================
   ADMIN UID LIST
========================= */

const ADMIN_UIDS = new Set([

  "7pHSV8jhyBQHAGErYbALg5NqGCE2",

  "8645cVYSFQQZeS9GDZuguc3W46y1",

  "uGBclDQGTEYKahRKZaLYXz8Dk8y2",

  "7MRUvQS043fA1nFwcJAyUWRxjiu1",

  "nxAJHhZ93hZmtsDEnjWKn4nPCUH2",

  "BrSfKmoCkWd40jVhUfWs3SO2fCE3"

]);


/* =========================
   ELEMENTS
========================= */

const body =
  document.getElementById(
    "registrationBody"
  );

const search =
  document.getElementById("search");

const refreshBtn =
  document.getElementById(
    "refreshBtn"
  );

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );

const status =
  document.getElementById("status");

const totalRegistrations =
  document.getElementById(
    "totalRegistrations"
  );

const soloCount =
  document.getElementById(
    "soloCount"
  );

const teamCount =
  document.getElementById(
    "teamCount"
  );


/* =========================
   EDIT MODAL
========================= */

const editOverlay =
  document.getElementById(
    "editOverlay"
  );

const closeEdit =
  document.getElementById(
    "closeEdit"
  );

const cancelEdit =
  document.getElementById(
    "cancelEdit"
  );

const editForm =
  document.getElementById(
    "editForm"
  );

const editKey =
  document.getElementById(
    "editKey"
  );

const editStudentName =
  document.getElementById(
    "editStudentName"
  );

const editStudentClass =
  document.getElementById(
    "editStudentClass"
  );

const editStudentSection =
  document.getElementById(
    "editStudentSection"
  );

const editMobileNumber =
  document.getElementById(
    "editMobileNumber"
  );

const editEmailAddress =
  document.getElementById(
    "editEmailAddress"
  );

const editTeamName =
  document.getElementById(
    "editTeamName"
  );

const editMembers =
  document.getElementById(
    "editMembers"
  );

const editRemarks =
  document.getElementById(
    "editRemarks"
  );

const editMessage =
  document.getElementById(
    "editMessage"
  );


/* =========================
   DATA
========================= */

let registrations = {};

let currentUser = null;


/* =========================
   STATUS
========================= */

function showStatus(
  message,
  type = ""
) {

  if (!status) return;

  status.textContent =
    message;

  status.className =
    `status ${type}`;

}


/* =========================
   AUTH
========================= */

onAuthStateChanged(
  auth,
  user => {

    if (!user) {

      window.location.href =
        "login.html";

      return;

    }

    if (!ADMIN_UIDS.has(user.uid)) {

      alert(
        "Access denied. You are not an administrator."
      );

      signOut(auth);

      return;

    }

    currentUser = user;

    showStatus(
      "Admin authenticated.",
      "success"
    );

    loadRegistrations();

  }
);


/* =========================
   LOAD REGISTRATIONS
========================= */

function loadRegistrations() {

  showStatus(
    "Loading registrations..."
  );

  const registrationsRef =
    ref(
      db,
      "registrations"
    );

  onValue(
    registrationsRef,

    snapshot => {

      registrations =
        snapshot.val() || {};

      renderRegistrations();

      showStatus(
        `${Object.keys(registrations).length} registration(s) loaded.`,
        "success"
      );

    },

    error => {

      console.error(error);

      showStatus(
        "Unable to load registrations. Check Firebase Rules.",
        "error"
      );

    }
  );

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================
   MEMBERS
========================= */

function getMembers(data) {

  const members = [];

  for (let i = 2; i <= 5; i++) {

    const name =
      data[`Member${i}Name`];

    const studentClass =
      data[`Member${i}Class`];

    const section =
      data[`Member${i}Section`];

    if (name) {

      members.push(
        `${name} (${studentClass || "-"}-${section || "-"})`
      );

    }

  }

  return members;

}


/* =========================
   FILTER
========================= */

function matchesSearch(data, key) {

  const query =
    search?.value
      ?.trim()
      .toLowerCase() || "";

  if (!query) {
    return true;
  }

  const text = [

    key,

    data.registrationId,

    data.StudentName,

    data.Class,

    data.Section,

    data.MobileNumber,

    data.EmailAddress,

    data.TeamName,

    data.ParticipationType,

    ...(data.Events || []),

    data.Member2Name,
    data.Member2Class,
    data.Member2Section,

    data.Member3Name,
    data.Member3Class,
    data.Member3Section,

    data.Member4Name,
    data.Member4Class,
    data.Member4Section,

    data.Member5Name,
    data.Member5Class,
    data.Member5Section

  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(query);

}


/* =========================
   RENDER
========================= */

function renderRegistrations() {

  if (!body) return;

  const entries =
    Object.entries(
      registrations
    )
    .filter(
      ([key, data]) =>
        matchesSearch(data, key)
    )
    .reverse();


  /* STATS */

  const allEntries =
    Object.values(
      registrations
    );

  const total =
    allEntries.length;

  const solo =
    allEntries.filter(
      data =>
        Number(data.TeamSize) === 1 ||
        data.ParticipationType === "Solo"
    ).length;

  const teams =
    total - solo;


  if (totalRegistrations) {
    totalRegistrations.textContent =
      total;
  }

  if (soloCount) {
    soloCount.textContent =
      solo;
  }

  if (teamCount) {
    teamCount.textContent =
      teams;
  }


  if (!entries.length) {

    body.innerHTML = `
      <tr>
        <td colspan="10"
            style="text-align:center;padding:40px;">
          No registrations found.
        </td>
      </tr>
    `;

    return;

  }


  body.innerHTML =
    entries.map(
      ([key, data], index) => {

        const members =
          getMembers(data);

        const events =
          Array.isArray(data.Events)
            ? data.Events.join(", ")
            : data.Events || "-";


        const type =
          data.ParticipationType ||
          (
            Number(data.TeamSize) === 1
              ? "Solo"
              : `Team of ${data.TeamSize || "-"}`
          );


        return `
          <tr>

            <td>
              ${escapeHTML(
                data.registrationId || key
              )}
            </td>

            <td>
              <strong>
                ${escapeHTML(
                  data.StudentName || "-"
                )}
              </strong>

              <small>
                ${escapeHTML(
                  `${data.Class || ""} ${data.Section || ""}`
                )}
              </small>
            </td>

            <td>
              ${escapeHTML(
                data.TeamName || "—"
              )}
            </td>

            <td>
              <span class="type-badge">
                ${escapeHTML(type)}
              </span>
            </td>

            <td>
              ${
                members.length
                  ? members
                      .map(
                        member =>
                          `<div>${escapeHTML(member)}</div>`
                      )
                      .join("")
                  : "—"
              }
            </td>

            <td>
              ${escapeHTML(
                data.MobileNumber || "-"
              )}
            </td>

            <td>
              ${escapeHTML(
                data.EmailAddress || "-"
              )}
            </td>

            <td>
              ${escapeHTML(events)}
            </td>

            <td>
              ${escapeHTML(
                data.registrationDate || "-"
              )}
            </td>

            <td>
              <div class="action-buttons">

                <button
                  class="edit-btn"
                  data-key="${escapeHTML(key)}">
                  Edit
                </button>

                <button
                  class="delete-btn"
                  data-key="${escapeHTML(key)}">
                  Delete
                </button>

              </div>
            </td>

          </tr>
        `;

      }
    ).join("");


  /* BUTTON EVENTS */

  body
    .querySelectorAll(".edit-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          openEdit(
            button.dataset.key
          )
      );

    });


  body
    .querySelectorAll(".delete-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          deleteRegistration(
            button.dataset.key
          )
      );

    });

}


/* =========================
   EDIT
========================= */

function openEdit(key) {

  const data =
    registrations[key];

  if (!data) return;

  editKey.value =
    key;

  editStudentName.value =
    data.StudentName || "";

  editStudentClass.value =
    data.Class || "";

  editStudentSection.value =
    data.Section || "";

  editMobileNumber.value =
    data.MobileNumber || "";

  editEmailAddress.value =
    data.EmailAddress || "";

  editTeamName.value =
    data.TeamName || "";

  editRemarks.value =
    data.Remarks || "";


  editMembers.innerHTML = "";


  const teamSize =
    Number(
      data.TeamSize || 1
    );


  for (
    let i = 2;
    i <= teamSize;
    i++
  ) {

    editMembers.insertAdjacentHTML(
      "beforeend",

      `
      <div class="edit-member-card">

        <h4>
          Participant ${String(i).padStart(2, "0")}
        </h4>

        <label>
          Name
          <input
            id="editMember${i}Name"
            value="${escapeHTML(
              data[`Member${i}Name`] || ""
            )}">
        </label>

        <label>
          Class
          <select
            id="editMember${i}Class">

            <option value="">Select Class</option>
            ${["VI","VII","VIII","IX","X","XI","XII"]
              .map(
                cls =>
                  `<option
                    value="${cls}"
                    ${
                      data[`Member${i}Class`] === cls
                        ? "selected"
                        : ""
                    }>
                    ${cls}
                  </option>`
              )
              .join("")}

          </select>
        </label>

        <label>
          Section
          <input
            id="editMember${i}Section"
            value="${escapeHTML(
              data[`Member${i}Section`] || ""
            )}">
        </label>

      </div>
      `
    );

  }


  editMessage.textContent = "";

  editOverlay.classList.remove(
    "hidden"
  );

}


/* =========================
   CLOSE EDIT
========================= */

function closeEditModal() {

  editOverlay.classList.add(
    "hidden"
  );

}

closeEdit?.addEventListener(
  "click",
  closeEditModal
);

cancelEdit?.addEventListener(
  "click",
  closeEditModal
);

editOverlay?.addEventListener(
  "click",
  event => {

    if (
      event.target === editOverlay
    ) {
      closeEditModal();
    }

  }
);


/* =========================
   SAVE EDIT
========================= */

editForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const key =
      editKey.value;

    if (!key) return;

    const oldData =
      registrations[key];

    if (!oldData) return;


    const updatedData = {

      ...oldData,

      StudentName:
        editStudentName.value.trim(),

      Class:
        editStudentClass.value,

      Section:
        editStudentSection.value.trim(),

      MobileNumber:
        editMobileNumber.value.trim(),

      EmailAddress:
        editEmailAddress.value
          .trim()
          .toLowerCase(),

      TeamName:
        editTeamName.value.trim(),

      Remarks:
        editRemarks.value.trim(),

      updatedAt:
        Date.now()

    };


    const teamSize =
      Number(
        oldData.TeamSize || 1
      );


    for (
      let i = 2;
      i <= 5;
      i++
    ) {

      if (i <= teamSize) {

        updatedData[
          `Member${i}Name`
        ] =
          document.getElementById(
            `editMember${i}Name`
          )?.value.trim() || "";

        updatedData[
          `Member${i}Class`
        ] =
          document.getElementById(
            `editMember${i}Class`
          )?.value || "";

        updatedData[
          `Member${i}Section`
        ] =
          document.getElementById(
            `editMember${i}Section`
          )?.value.trim() || "";

      } else {

        updatedData[
          `Member${i}Name`
        ] = "";

        updatedData[
          `Member${i}Class`
        ] = "";

        updatedData[
          `Member${i}Section`
        ] = "";

      }

    }


    try {

      editMessage.textContent =
        "Saving changes...";

      await update(
        ref(
          db,
          `registrations/${key}`
        ),
        updatedData
      );

      editMessage.textContent =
        "Changes saved successfully.";

      setTimeout(
        closeEditModal,
        700
      );

    } catch (error) {

      console.error(error);

      editMessage.textContent =
        "Unable to save changes.";

    }

  }
);


/* =========================
   DELETE
========================= */

async function deleteRegistration(key) {

  const data =
    registrations[key];

  if (!data) return;


  const name =
    data.StudentName ||
    "this registration";


  const confirmed =
    confirm(
      `Delete registration for ${name}?\n\nThis action cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  try {

    showStatus(
      "Deleting registration..."
    );

    await remove(
      ref(
        db,
        `registrations/${key}`
      )
    );

    showStatus(
      "Registration deleted successfully.",
      "success"
    );

  } catch (error) {

    console.error(error);

    showStatus(
      "Unable to delete registration.",
      "error"
    );

  }

}


/* =========================
   SEARCH
========================= */

search?.addEventListener(
  "input",
  renderRegistrations
);


/* =========================
   REFRESH
========================= */

refreshBtn?.addEventListener(
  "click",
  () => {

    renderRegistrations();

    showStatus(
      "Dashboard refreshed.",
      "success"
    );

  }
);


/* =========================
   LOGOUT
========================= */

logoutBtn?.addEventListener(
  "click",
  async () => {

    try {

      await signOut(auth);

      window.location.href =
        "login.html";

    } catch (error) {

      console.error(error);

    }

  }
);
