document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuBtn");
  const mainNav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll("#mainNav a");

  const hidePreloader = () => {
    if (!preloader) return;
    preloader.classList.add("done");
    setTimeout(() => preloader.remove(), 350);
  };
  window.addEventListener("load", hidePreloader, { once:true });
  setTimeout(hidePreloader, 2500); // never leave the page blocked if a remote asset hangs

  const closeMenu = () => {
    mainNav?.classList.remove("open");
    menuToggle?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  };

  menuToggle?.addEventListener("click", () => {
    const open = !mainNav?.classList.contains("open");
    mainNav?.classList.toggle("open", open);
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks.forEach(link => link.addEventListener("click", closeMenu));

  window.addEventListener("scroll", () => {
    header?.classList.toggle("scrolled", window.scrollY > 30);
    const hashLinks = [...navLinks].filter(a => (a.getAttribute("href") || "").startsWith("#"));
    const sections = [...document.querySelectorAll("main section[id]")];
    let current = "home";
    for (const section of sections) {
      if (window.scrollY >= section.offsetTop - 160) current = section.id;
    }
    hashLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
  }, { passive:true });
});
/* =========================================================
   SECRET ADMIN ACCESS
   5 FOOTER CLICKS -> ADMIN PAGE
========================================================= */

const adminSecretTrigger =
    document.getElementById("adminSecretTrigger");

let adminClickCount = 0;
let adminClickTimer = null;

adminSecretTrigger?.addEventListener("click", () => {

    adminClickCount++;

    clearTimeout(adminClickTimer);

    /*
       Reset the counter if the user
       doesn't complete 5 clicks quickly.
    */
    adminClickTimer = setTimeout(() => {
        adminClickCount = 0;
    }, 3000);

    if (adminClickCount >= 5) {

        adminClickCount = 0;

        clearTimeout(adminClickTimer);

        window.location.href = "admin.html";
    }

});
/* =========================================================
   SECRET ADMIN ACCESS
   5 CLICKS ON FOOTER -> ADMIN PAGE
========================================================= */

(function () {

    let clickCount = 0;
    let resetTimer = null;

    function initializeSecretAdminAccess() {

        const trigger =
            document.getElementById(
                "footerAdminTrigger"
            );

        if (!trigger) {

            console.warn(
                "Secret admin trigger not found."
            );

            return;

        }

        console.log(
            "Secret admin access initialized."
        );

        trigger.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                clickCount++;

                console.log(
                    "Admin trigger click:",
                    clickCount
                );

                clearTimeout(
                    resetTimer
                );

                /*
                 * User has 3 seconds to complete
                 * all five clicks.
                 */
                resetTimer =
                    setTimeout(
                        function () {

                            clickCount = 0;

                            console.log(
                                "Admin click counter reset."
                            );

                        },
                        3000
                    );

                if (clickCount >= 5) {

                    clickCount = 0;

                    clearTimeout(
                        resetTimer
                    );

                    console.log(
                        "Opening admin panel..."
                    );

                    window.location.href =
                        "admin.html";

                }

            },
            false
        );

    }


    /*
     * Works whether this script is loaded
     * before or after the HTML.
     */
    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSecretAdminAccess
        );

    }
    else {

        initializeSecretAdminAccess();

    }

})();
