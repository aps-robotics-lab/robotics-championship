/* =========================================================
   ROBOKRITI MAIL CONSOLE — USERNAME / PASSWORD ACCESS
========================================================= */

(() => {
    const trigger = document.querySelector(
        '[data-mail-access-trigger]'
    );

    if (!trigger) return;

    trigger.addEventListener('click', () => {
        window.location.href = 'mail-login.html';
    });
})();
