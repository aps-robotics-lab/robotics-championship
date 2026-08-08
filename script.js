document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       PRELOADER
    ========================================= */

    const preloader =
        document.getElementById("preloader");


    function hidePreloader() {

        if (!preloader) return;

        preloader.classList.add("hide");

        setTimeout(() => {

            preloader.remove();

        }, 650);

    }


    /*
        Do NOT wait unnecessarily for every image/font.
        Homepage is allowed to appear quickly.
    */

    setTimeout(
        hidePreloader,
        900
    );


    /* =========================================
       HEADER
    ========================================= */

    const header =
        document.getElementById("header");


    function updateHeader() {

        if (!header) return;

        header.classList.toggle(
            "scrolled",
            window.scrollY > 40
        );

    }


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );

    updateHeader();


    /* =========================================
       MOBILE MENU
    ========================================= */

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );

    const nav =
        document.getElementById(
            "nav"
        );


    if (menuToggle && nav) {

        menuToggle.addEventListener(
            "click",
            () => {

                const open =
                    nav.classList.toggle(
                        "open"
                    );

                menuToggle.classList.toggle(
                    "active",
                    open
                );

                document.body.classList.toggle(
                    "menu-open",
                    open
                );

            }
        );


        nav.querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        nav.classList.remove(
                            "open"
                        );

                        menuToggle.classList.remove(
                            "active"
                        );

                        document.body.classList.remove(
                            "menu-open"
                        );

                    }
                );

            });

    }


    /* =========================================
       SMOOTH INTERNAL LINKS
    ========================================= */

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

                const position =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    headerHeight;

                window.scrollTo({

                    top: position,

                    behavior: "smooth"

                });

            }
        );

    });


    /* =========================================
       ACTIVE NAV
    ========================================= */

    const sections =
        document.querySelectorAll(
            "section[id]"
        );

    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    function updateActiveNav() {

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

            link.classList.toggle(
                "active",
                link.getAttribute("href") ===
                "#" + current
            );

        });

    }


    window.addEventListener(
        "scroll",
        updateActiveNav,
        {
            passive: true
        }
    );


    updateActiveNav();


    /* =========================================
       BACK TO TOP
    ========================================= */

    const backTop =
        document.getElementById(
            "backTop"
        );


    if (backTop) {

        window.addEventListener(
            "scroll",
            () => {

                backTop.classList.toggle(
                    "show",
                    window.scrollY > 500
                );

            },
            {
                passive: true
            }
        );


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


    /* =========================================
       HERO PARTICLES
    ========================================= */

    const particleContainer =
        document.querySelector(
            ".hero-particles"
        );


    /*
        Only create particles if the element exists.
        Reduced from 18 to 10 for better mobile
        performance.
    */

    if (particleContainer) {

        const fragment =
            document.createDocumentFragment();


        for (
            let i = 0;
            i < 10;
            i++
        ) {

            const particle =
                document.createElement("span");


            particle.className =
                "hero-particle";


            particle.style.left =
                Math.random() * 100 + "%";


            particle.style.top =
                Math.random() * 100 + "%";


            particle.style.animationDelay =
                Math.random() * 3 + "s";


            fragment.appendChild(
                particle
            );

        }


        particleContainer.appendChild(
            fragment
        );

    }


    /* =========================================
       INTERSECTION ANIMATION
    ========================================= */

    const animated =
        document.querySelectorAll(
            ".about-card, .event-card, .contact-card, .registration-box, .message-box"
        );


    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: .08
                }
            );


        animated.forEach(
            element => {

                element.classList.add(
                    "reveal"
                );

                observer.observe(
                    element
                );

            }
        );

    }


    /* =========================================
       ESCAPE
    ========================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                nav &&
                menuToggle
            ) {

                nav.classList.remove(
                    "open"
                );

                menuToggle.classList.remove(
                    "active"
                );

                document.body.classList.remove(
                    "menu-open"
                );

            }

        }
    );

});
