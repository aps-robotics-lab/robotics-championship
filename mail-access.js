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
      window.location.href = 'mail-sender.html';
    }
  });
})();
