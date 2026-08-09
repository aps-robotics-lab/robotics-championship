document.addEventListener("DOMContentLoaded", () => {

const preloader = document.getElementById("preloader");
const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const navLinks = document.querySelectorAll(".nav-link");

/*
   Preloader intentionally finishes in about 1.1 seconds.
*/
const hidePreloader = () => {
    if (!preloader) return;

    preloader.classList.add("hide");

    setTimeout(() => {
        preloader.remove();
    }, 400);
};

setTimeout(hidePreloader, 1100);

window.addEventListener("load", () => {
    setTimeout(hidePreloader, 100);
});

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("open");

        const icon = menuToggle.querySelector("i");

        if (mainNav.classList.contains("open")) {
            icon.className = "fa-solid fa-xmark";
        } else {
            icon.className = "fa-solid fa-bars";
        }
    });
}

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        mainNav?.classList.remove("open");

        const icon = menuToggle?.querySelector("i");

        if (icon) {
            icon.className = "fa-solid fa-bars";
        }
    });
});

window.addEventListener("scroll", () => {
    if (header) {
        header.classList.toggle("scrolled", window.scrollY > 30);
    }

    const sections = document.querySelectorAll("section[id]");
    let current = "";

    sections.forEach(section => {
        const top = section.offsetTop - 130;

        if (window.scrollY >= top) {
            current = section.id;
        }
    });

    navLinks.forEach(link => {
        const href = link.getAttribute("href");

        link.classList.toggle(
            "active",
            href === `#${current}`
        );
    });
});

});
