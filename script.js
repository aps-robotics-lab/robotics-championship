/* =========================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   PERFORMANCE OPTIMIZED JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const preloader =
        document.getElementById("preloader");

    const header =
        document.getElementById("header");

    const menuToggle =
        document.getElementById("menuToggle");

    const nav =
        document.getElementById("nav");

    const backTop =
        document.getElementById("backTop");

    const navLinks =
        document.querySelectorAll(".nav-link");

    const sections =
        document.querySelectorAll("section[id]");

    const animatedElements =
        document.querySelectorAll(
            ".about-card, .event-card, .contact-card, .registration-box, .message-box"
        );


    /* =====================================================
       PRELOADER
    ===================================================== */

    let preloaderHidden = false;

    const hidePreloader = () => {

        if (!preloader || preloaderHidden) {
            return;
        }

        preloaderHidden = true;

        preloader.classList.add("hide");

        setTimeout(() => {

            if (preloader) {
                preloader.remove();
            }

        }, 500);
    };


    /*
        Hide quickly after DOM is ready.
        This prevents the external fonts/icons from
        unnecessarily blocking the visitor.
    */

    setTimeout(hidePreloader, 650);


    /*
        Safety fallback.
    */

    setTimeout(hidePreloader, 1800);


    /*
        If everything loads normally, hide immediately.
    */

    window.addEventListener(
        "load",
        hidePreloader,
        { once: true }
    );


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const closeMenu = () => {

        if (!menuToggle || !nav) {
            return;
        }

        menuToggle.classList.remove("active");

        nav.classList.remove("open");

        document.body.classList.remove("menu-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Open navigation"
        );
    };


    const openMenu = () => {

        if (!menuToggle || !nav) {
            return;
        }

        menuToggle.classList.add("active");

        nav.classList.add("open");

        document.body.classList.add("menu-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Close navigation"
        );
    };


    if (menuToggle && nav) {

        menuToggle.addEventListener(
            "click",
            () => {

                if (nav.classList.contains("open")) {
                    closeMenu();
                } else {
                    openMenu();
                }

            }
        );


        nav.querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    closeMenu
                );

            });
    }


    /* =====================================================
       SMOOTH INTERNAL NAVIGATION
    ===================================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const id =
                    link.getAttribute("href");


                if (!id || id === "#") {
                    return;
                }


                const target =
                    document.querySelector(id);


                if (!target) {
                    return;
                }


                event.preventDefault();


                const headerHeight =
                    header
                        ? header.offsetHeight
                        : 0;


                const targetPosition =
                    target.getBoundingClientRect().top
                    +
                    window.scrollY
                    -
                    headerHeight
                    +
                    1;


                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });

            }
        );

    });


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const updateActiveNav = () => {

        if (!sections.length) {
            return;
        }

        let current = "home";

        const scrollPosition =
            window.scrollY + 180;


        sections.forEach(section => {

            if (
                scrollPosition >=
                section.offsetTop
            ) {

                current =
                    section.id;

            }

        });


        navLinks.forEach(link => {

            const href =
                link.getAttribute("href");


            link.classList.toggle(
                "active",
                href === "#" + current
            );

        });

    };


    /* =====================================================
       HEADER
    ===================================================== */

    const updateHeader = () => {

        if (!header) {
            return;
        }

        header.classList.toggle(
            "scrolled",
            window.scrollY > 40
        );
    };


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const updateBackTop = () => {

        if (!backTop) {
            return;
        }

        backTop.classList.toggle(
            "show",
            window.scrollY > 500
        );
    };


    if (backTop) {

        backTop.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =====================================================
       OPTIMIZED SCROLL HANDLER
    ===================================================== */

    let ticking = false;

    const handleScroll = () => {

        if (ticking) {
            return;
        }

        ticking = true;


        window.requestAnimationFrame(() => {

            updateHeader();

            updateActiveNav();

            updateBackTop();

            ticking = false;

        });

    };


    window.addEventListener(
        "scroll",
        handleScroll,
        {
            passive: true
        }
    );


    /*
        Initial state.
    */

    updateHeader();

    updateActiveNav();

    updateBackTop();


    /* =====================================================
       INTERSECTION ANIMATIONS
    ===================================================== */

    /*
        Do not hide content if the browser doesn't support
        IntersectionObserver.
    */

    if (
        "IntersectionObserver" in window
    ) {

        animatedElements.forEach(element => {

            element.classList.add(
                "prepare-animation"
            );

        });


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        entry.target.classList.add(
                            "visible"
                        );


                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.08,
                    rootMargin: "0px 0px -40px 0px"
                }
            );


        animatedElements.forEach(
            element => {

                observer.observe(element);

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeMenu();

            }

        }
    );


    /* =====================================================
       CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            if (
                !nav ||
                !menuToggle
            ) {
                return;
            }


            if (
                !nav.classList.contains("open")
            ) {
                return;
            }


            if (
                nav.contains(event.target) ||
                menuToggle.contains(event.target)
            ) {
                return;
            }


            closeMenu();

        }
    );


    /* =====================================================
       CLOSE MENU WHEN SCREEN BECOMES DESKTOP
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 780
            ) {

                closeMenu();

            }

        },
        {
            passive: true
        }
    );

});


/* =========================================================
   ANIMATION CSS
========================================================= */

const animationStyle =
    document.createElement("style");


animationStyle.textContent = `

    .prepare-animation {
        opacity: 0;
        transform: translateY(18px);
        transition:
            opacity .55s ease,
            transform .55s ease;
    }

    .prepare-animation.visible {
        opacity: 1;
        transform: translateY(0);
    }

    @media (max-width: 600px) {

        .prepare-animation {
            transform: translateY(12px);
        }

    }

    @media (prefers-reduced-motion: reduce) {

        .prepare-animation {
            opacity: 1;
            transform: none;
        }

    }

`;


document.head.appendChild(
    animationStyle
);
