const HELP_API_URL =
"https://script.google.com/macros/s/AKfycbzvOYOxu2gT2uPAucMN6bb2H9bdCMDrGhSa1eE4jDVcuwMs6QSqLfm2m9cnDkk1wJ50Xw/exec";


/* =========================================================
   EMAILJS
========================================================= */

const EMAILJS_PUBLIC_KEY =
"GnxniZ70ndujyjDpe";

const EMAILJS_SERVICE_ID =
"service_5m4uzhb";

const EMAILJS_TEMPLATE_ID =
"template_5qb8b2p";


const emailScript =
document.createElement("script");

emailScript.src =
"https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

emailScript.onload = () => {

  if (window.emailjs) {

    window.emailjs.init({
      publicKey:
        EMAILJS_PUBLIC_KEY
    });

  }

};

document.head.appendChild(
  emailScript
);


/* =========================================================
   STATE
========================================================= */

let tickets = [];

let selectedTicket = null;

let agent = null;

let sessionToken =
sessionStorage.getItem(
  "apsAgentToken"
);


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen =
document.getElementById("loginScreen");

const dashboard =
document.getElementById("dashboard");

const loginForm =
document.getElementById("loginForm");

const loginBtn =
document.getElementById("loginBtn");

const loginStatus =
document.getElementById("loginStatus");

const ticketList =
document.getElementById("ticketList");

const searchInput =
document.getElementById("searchInput");

const statusFilter =
document.getElementById("statusFilter");

const categoryFilter =
document.getElementById("categoryFilter");

const refreshBtn =
document.getElementById("refreshBtn");

const logoutBtn =
document.getElementById("logoutBtn");

const emptyDetail =
document.getElementById("emptyDetail");

const detailContent =
document.getElementById("detailContent");

const replyText =
document.getElementById("replyText");

const detailStatusSelect =
document.getElementById(
  "detailStatusSelect"
);

const saveTicketBtn =
document.getElementById(
  "saveTicketBtn"
);

const updateStatus =
document.getElementById(
  "updateStatus"
);

const dashboardStatus =
document.getElementById(
  "dashboardStatus"
);


/* =========================================================
   API
========================================================= */

async function api(action, params = {}) {

  const query =
    new URLSearchParams({
      action,
      ...params
    });


  const response =
    await fetch(
      `${HELP_API_URL}?${query.toString()}`,
      {
        method: "GET",
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `Server returned ${response.status}`
    );
  }


  return response.json();
}


/* =========================================================
   LOGIN
========================================================= */

loginForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    loginStatus.textContent = "";

    loginBtn.disabled = true;

    loginBtn.textContent =
      "Signing in...";


    try {

      const email =
        document.getElementById(
          "loginEmail"
        ).value.trim().toLowerCase();

      const password =
        document.getElementById(
          "loginPassword"
        ).value;


      const result =
        await api(
          "login",
          {
            email,
            password
          }
        );


      if (!result.success) {

        throw new Error(
          result.message ||
          "Login failed."
        );
      }


      sessionToken =
        result.token;

      agent =
        result.agent;


      sessionStorage.setItem(
        "apsAgentToken",
        sessionToken
      );

      sessionStorage.setItem(
        "apsAgent",
        JSON.stringify(agent)
      );


      showDashboard();

      await loadTickets();

    } catch (error) {

      loginStatus.textContent =
        error.message ||
        "Unable to login.";

    } finally {

      loginBtn.disabled = false;

      loginBtn.textContent =
        "Login to Dashboard";
    }

  }
);


/* =========================================================
   SESSION RESTORE
========================================================= */

async function restoreSession() {

  if (!sessionToken) {

    showLogin();

    return;
  }


  try {

    const savedAgent =
      sessionStorage.getItem(
        "apsAgent"
      );

    if (savedAgent) {
      agent =
        JSON.parse(savedAgent);
    }


    const result =
      await api(
        "tickets",
        {
          token:
            sessionToken
        }
      );


    if (!result.success) {

      throw new Error(
        result.message ||
        "Session expired."
      );
    }


    agent =
      result.agent ||
      agent;


    showDashboard();

    tickets =
      result.tickets || [];

    renderAll();

  } catch (error) {

    clearSession();

    showLogin();
  }
}


/* =========================================================
   DASHBOARD
========================================================= */

function showDashboard() {

  loginScreen.classList.add(
    "hidden"
  );

  dashboard.classList.remove(
    "hidden"
  );


  if (agent) {

    document.getElementById(
      "agentName"
    ).textContent =
      agent.name || "Agent";

    document.getElementById(
      "agentEmail"
    ).textContent =
      agent.email || "";
  }
}


function showLogin() {

  loginScreen.classList.remove(
    "hidden"
  );

  dashboard.classList.add(
    "hidden"
  );
}


function clearSession() {

  sessionStorage.removeItem(
    "apsAgentToken"
  );

  sessionStorage.removeItem(
    "apsAgent"
  );

  sessionToken = null;

  agent = null;
}


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn?.addEventListener(
  "click",
  async () => {

    try {

      if (sessionToken) {

        await api(
          "logout",
          {
            token:
              sessionToken
          }
        );
      }

    } catch (error) {

      console.error(error);

    } finally {

      clearSession();

      location.reload();
    }
  }
);


/* =========================================================
   LOAD TICKETS
========================================================= */

async function loadTickets() {

  dashboardStatus.textContent =
    "Loading tickets...";


  try {

    const result =
      await api(
        "tickets",
        {
          token:
            sessionToken
        }
      );


    if (!result.success) {

      if (result.auth === false) {

        clearSession();

        showLogin();

        throw new Error(
          "Your session expired. Please login again."
        );
      }

      throw new Error(
        result.message ||
        "Unable to load tickets."
      );
    }


    tickets =
      result.tickets || [];

    agent =
      result.agent || agent;


    if (agent) {

      document.getElementById(
        "agentName"
      ).textContent =
        agent.name;

      document.getElementById(
        "agentEmail"
      ).textContent =
        agent.email;
    }


    renderAll();

    dashboardStatus.textContent = "";

  } catch (error) {

    dashboardStatus.textContent =
      error.message;

  }
}


/* =========================================================
   FILTERS
========================================================= */

searchInput?.addEventListener(
  "input",
  renderList
);

statusFilter?.addEventListener(
  "change",
  renderList
);

categoryFilter?.addEventListener(
  "change",
  renderList
);

refreshBtn?.addEventListener(
  "click",
  loadTickets
);


/* =========================================================
   FILTER TICKETS
========================================================= */

function getFilteredTickets() {

  const search =
    searchInput.value
      .trim()
      .toLowerCase();

  const status =
    statusFilter.value;

  const category =
    categoryFilter.value;


  return tickets.filter(
    ticket => {

      const searchable =
        [
          ticket.ticketId,
          ticket.registrationId,
          ticket.studentName,
          ticket.email,
          ticket.subject,
          ticket.message,
          ticket.category
        ]
          .join(" ")
          .toLowerCase();


      const matchesSearch =
        !search ||
        searchable.includes(search);


      const matchesStatus =
        status === "All" ||
        ticket.status === status;


      const matchesCategory =
        category === "All" ||
        ticket.category === category;


      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    }
  );
}


/* =========================================================
   RENDER
========================================================= */

function renderAll() {

  renderStats();

  renderList();

  if (
    selectedTicket
  ) {

    const updated =
      tickets.find(
        x =>
          x.ticketId ===
          selectedTicket.ticketId
      );

    if (updated) {

      selectedTicket =
        updated;

      renderDetail();
    }
  }
}


function renderStats() {

  document.getElementById(
    "totalCount"
  ).textContent =
    tickets.length;

  document.getElementById(
    "openCount"
  ).textContent =
    tickets.filter(
      x => x.status === "Open"
    ).length;

  document.getElementById(
    "progressCount"
  ).textContent =
    tickets.filter(
      x => x.status === "In Progress"
    ).length;

  document.getElementById(
    "resolvedCount"
  ).textContent =
    tickets.filter(
      x => x.status === "Resolved"
    ).length;
}


function renderList() {

  const filtered =
    getFilteredTickets();


  document.getElementById(
    "ticketCountLabel"
  ).textContent =
    `${filtered.length} ticket${filtered.length === 1 ? "" : "s"}`;


  if (!filtered.length) {

    ticketList.innerHTML = `
      <div style="
        padding:30px;
        text-align:center;
        color:#8794aa;
        font-size:13px;
      ">
        No tickets found.
      </div>
    `;

    return;
  }


  ticketList.innerHTML =
    filtered.map(
      ticket => {

        const active =
          selectedTicket &&
          selectedTicket.ticketId ===
          ticket.ticketId
            ? "active"
            : "";


        const statusClass =
          ticket.status === "Resolved"
            ? "resolved"
            : ticket.status === "In Progress"
              ? "progress"
              : "";


        return `
          <div
            class="ticket-item ${active}"
            data-ticket="${escapeHtml(ticket.ticketId)}">

            <div class="ticket-item-top">

              <span
                class="status-badge ${statusClass}">
                ${escapeHtml(ticket.status)}
              </span>

              <small>
                ${escapeHtml(ticket.ticketId)}
              </small>

            </div>

            <h3>
              ${escapeHtml(ticket.subject)}
            </h3>

            <small>
              ${escapeHtml(ticket.studentName)}
              ·
              ${escapeHtml(ticket.registrationId)}
            </small>

          </div>
        `;
      }
    ).join("");


  document
    .querySelectorAll(".ticket-item")
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          const id =
            item.dataset.ticket;

          selectedTicket =
            tickets.find(
              ticket =>
                ticket.ticketId === id
            );

          renderList();

          renderDetail();
        }
      );

    });
}


/* =========================================================
   DETAIL
========================================================= */

function renderDetail() {

  if (!selectedTicket) {

    emptyDetail.classList.remove(
      "hidden"
    );

    detailContent.classList.add(
      "hidden"
    );

    return;
  }


  emptyDetail.classList.add(
    "hidden"
  );

  detailContent.classList.remove(
    "hidden"
  );


  document.getElementById(
    "detailSubject"
  ).textContent =
    selectedTicket.subject;


  document.getElementById(
    "detailTicketId"
  ).textContent =
    selectedTicket.ticketId;


  document.getElementById(
    "detailStudent"
  ).textContent =
    selectedTicket.studentName;


  document.getElementById(
    "detailClass"
  ).textContent =
    `${selectedTicket.className} / ${selectedTicket.section}`;


  document.getElementById(
    "detailRegistration"
  ).textContent =
    selectedTicket.registrationId;


  document.getElementById(
    "detailEmail"
  ).textContent =
    selectedTicket.email;


  document.getElementById(
    "detailMessage"
  ).textContent =
    selectedTicket.message;


  const badge =
    document.getElementById(
      "detailStatus"
    );

  badge.textContent =
    selectedTicket.status;

  badge.className =
    `status-badge ${
      selectedTicket.status === "Resolved"
        ? "resolved"
        : selectedTicket.status === "In Progress"
          ? "progress"
          : ""
    }`;


  detailStatusSelect.value =
    selectedTicket.status;


  replyText.value =
    selectedTicket.reply || "";


  updateStatus.textContent = "";
}


/* =========================================================
   SAVE / REPLY
========================================================= */

saveTicketBtn?.addEventListener(
  "click",
  async () => {

    if (!selectedTicket) {
      return;
    }


    const status =
      detailStatusSelect.value;

    const reply =
      replyText.value.trim();


    saveTicketBtn.disabled =
      true;

    saveTicketBtn.textContent =
      "Saving...";

    updateStatus.textContent =
      "";


    try {

      const result =
        await api(
          "updateTicket",
          {

            token:
              sessionToken,

            ticketId:
              selectedTicket.ticketId,

            status:
              status,

            reply:
              reply
          }
        );


      if (!result.success) {

        if (result.auth === false) {

          clearSession();

          showLogin();

          throw new Error(
            "Session expired."
          );
        }

        throw new Error(
          result.message ||
          "Unable to update ticket."
        );
      }


      /* ---------------------------------------------
         SEND STUDENT EMAIL
      --------------------------------------------- */

      if (reply) {

        try {

          await sendStudentReplyEmail(
            selectedTicket,
            status,
            reply
          );

        } catch (emailError) {

          console.error(
            "EmailJS reply failed:",
            emailError
          );

          updateStatus.textContent =
            "Ticket saved, but email could not be sent.";

          updateStatus.style.color =
            "#ffc857";

        }
      }


      updateStatus.textContent =
        reply
          ? "Ticket saved and reply sent."
          : "Ticket updated successfully.";


      await loadTickets();


      selectedTicket =
        tickets.find(
          ticket =>
            ticket.ticketId ===
            selectedTicket.ticketId
        );


      renderDetail();

    } catch (error) {

      updateStatus.textContent =
        error.message;

      updateStatus.style.color =
        "#ff5577";

    } finally {

      saveTicketBtn.disabled =
        false;

      saveTicketBtn.textContent =
        "Save & Reply";
    }
  }
);


/* =========================================================
   EMAILJS STUDENT REPLY
========================================================= */

async function sendStudentReplyEmail(
  ticket,
  status,
  reply
) {

  for (
    let i = 0;
    i < 40 && !window.emailjs;
    i++
  ) {

    await new Promise(
      resolve =>
        setTimeout(resolve, 250)
    );
  }


  if (!window.emailjs) {

    throw new Error(
      "EmailJS failed to load."
    );
  }


  return window.emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {

      to_email:
        ticket.email,

      StudentName:
        ticket.studentName,

      EmailAddress:
        ticket.email,

      registrationId:
        ticket.registrationId,

      TicketID:
        ticket.ticketId,

      Class:
        ticket.className,

      Section:
        ticket.section,

      Category:
        ticket.category,

      Subject:
        `Re: ${ticket.subject}`,

      Message:
        reply,

      ticketStatus:
        status

    }
  );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


/* =========================================================
   START
========================================================= */

restoreSession();
