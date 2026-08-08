document.addEventListener("DOMContentLoaded", () => {


    /* =========================================
       PRELOADER
    ========================================= */

    const preloader =
        document.getElementById("preloader");


    const hidePreloader = () => {

        if (!preloader) return;

        preloader.classList.add("hide");

        setTimeout(() => {

            preloader.style.display = "none";

        }, 700);

    };


    window.addEventListener(
        "load",
        () => {

            setTimeout(
                hidePreloader,
                1200
            );

        }
    );


    /* Safety fallback */

    setTimeout(
        hidePreloader,
        2500
    );


    /* =========================================
       HEADER SCROLL
    ========================================= */

    const header =
        document.getElementById("header");


    const updateHeader =
        () => {

            if (!header) return;


            if (window.scrollY > 40) {

                header.classList.add(
                    "scrolled"
                );

            } else {

                header.classList.remove(
                    "scrolled"
                );

            }

        };


    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
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

                menuToggle.classList.toggle(
                    "active"
                );

                nav.classList.toggle(
                    "open"
                );

                document.body.classList.toggle(
                    "menu-open"
                );

            }
        );


        /* Close menu after clicking a link */

        nav.querySelectorAll(
            "a"
        ).forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    menuToggle.classList.remove(
                        "active"
                    );

                    nav.classList.remove(
                        "open"
                    );

                    document.body.classList.remove(
                        "menu-open"
                    );

                }
            );

        });

    }


    /* =========================================
       SMOOTH SCROLL
    ========================================= */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const id =
                    link.getAttribute(
                        "href"
                    );


                if (
                    !id ||
                    id === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        id
                    );


                if (!target) {

                    return;

                }


                event.preventDefault();


                const headerHeight =
                    header
                        ? header.offsetHeight
                        : 0;


                const targetPosition =
                    target.getBoundingClientRect()
                        .top
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


    /* =========================================
       ACTIVE NAVIGATION
    ========================================= */

    const sections =
        document.querySelectorAll(
            "section[id]"
        );

    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    const updateActiveNav =
        () => {

            let current =
                "home";


            sections.forEach(
                section => {

                    const sectionTop =
                        section.offsetTop
                        -
                        150;


                    if (
                        window.scrollY
                        >=
                        sectionTop
                    ) {

                        current =
                            section.id;

                    }

                }
            );


            navLinks.forEach(
                link => {

                    link.classList.remove(
                        "active"
                    );


                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        href ===
                        "#" + current
                    ) {

                        link.classList.add(
                            "active"
                        );

                    }

                }
            );

        };


    window.addEventListener(
        "scroll",
        updateActiveNav,
        { passive: true }
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

                if (
                    window.scrollY > 500
                ) {

                    backTop.classList.add(
                        "show"
                    );

                } else {

                    backTop.classList.remove(
                        "show"
                    );

                }

            },
            { passive: true }
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


    if (particleContainer) {

        for (
            let i = 0;
            i < 18;
            i++
        ) {

            const particle =
                document.createElement(
                    "span"
                );


            particle.style.position =
                "absolute";

            particle.style.width =
                "2px";

            particle.style.height =
                "2px";

            particle.style.borderRadius =
                "50%";

            particle.style.background =
                "#00d9ff";

            particle.style.opacity =
                String(
                    Math.random() * .5 + .1
                );

            particle.style.left =
                Math.random() * 100 + "%";

            particle.style.top =
                Math.random() * 100 + "%";

            particle.style.boxShadow =
                "0 0 8px #00d9ff";


            const duration =
                Math.random() * 5 + 4;

            particle.style.animation =
                `particleFloat ${duration}s ease-in-out infinite`;

            particle.style.animationDelay =
                Math.random() * 3 + "s";


            particleContainer.appendChild(
                particle
            );

        }

    }


    /* =========================================
       INTERSECTION ANIMATIONS
    ========================================= */

    const animatedElements =
        document.querySelectorAll(
            ".about-card, .event-card, .contact-card, .registration-box, .message-box"
        );


    animatedElements.forEach(
        element => {

            element.style.opacity =
                "0";

            element.style.transform =
                "translateY(20px)";

            element.style.transition =
                "opacity .7s ease, transform .7s ease";

        }
    );


    if (
        "IntersectionObserver"
        in window
    ) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.style.opacity =
                                    "1";

                                entry.target.style.transform =
                                    "translateY(0)";

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: .12
                }
            );


        animatedElements.forEach(
            element => {

                observer.observe(
                    element
                );

            }
        );

    } else {

        animatedElements.forEach(
            element => {

                element.style.opacity =
                    "1";

                element.style.transform =
                    "translateY(0)";

            }
        );

    }


    /* =========================================
       ESCAPE KEY
    ========================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                if (
                    menuToggle &&
                    nav
                ) {

                    menuToggle.classList.remove(
                        "active"
                    );

                    nav.classList.remove(
                        "open"
                    );

                    document.body.classList.remove(
                        "menu-open"
                    );

                }

            }

        }
    );


});


/* =========================================
   PARTICLE ANIMATION
========================================= */

const particleStyle =
document.createElement("style");

particleStyle.textContent = `

@keyframes particleFloat {

    0%, 100% {

        transform:
            translateY(0)
            translateX(0);

    }

    50% {

        transform:
            translateY(-25px)
            translateX(12px);

    }

}

`;

document.head.appendChild(
    particleStyle
);
