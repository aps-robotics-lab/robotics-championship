/* Hidden 5-click access for authorized department dashboards. */
(() => {
  const trigger = document.querySelector('[data-mail-access-trigger]');
  if (!trigger) return;

  let clicks = 0;
  let resetTimer = null;

  trigger.addEventListener('click', () => {
    clicks += 1;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { clicks = 0; }, 3000);

    if (clicks >= 5) {
      clicks = 0;
      clearTimeout(resetTimer);

      // Create a short-lived access pass for the hidden mail console.
      // This is intentionally separate from Firebase auth because the
      // Registration and Helping dashboards use different Firebase projects.
      const role = window.location.pathname.includes('agent') ? 'helping' : 'registration';
      sessionStorage.setItem('robokriti_mail_access', JSON.stringify({
        role,
        issuedAt: Date.now()
      }));

      window.location.href = 'mail-sender.html';
    }
  });
})();
