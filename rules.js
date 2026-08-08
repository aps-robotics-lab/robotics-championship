document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       EVENT TABS
    ========================================= */

    const tabs =
        document.querySelectorAll(".event-tab");

    const contents =
        document.querySelectorAll(".event-content");


    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            const target =
                tab.dataset.event;


            tabs.forEach(item => {

                item.classList.remove("active");

            });


            contents.forEach(content => {

                content.classList.remove("active");

            });


            tab.classList.add("active");


            const selected =
                document.getElementById(target);

            if (selected) {

                selected.classList.add("active");

            }

        });

    });


    /* =========================================
       ACTIVE NAVIGATION
    ========================================= */

    const sections =
        document.querySelectorAll(
            ".rules-section"
        );

    const navigation =
        document.querySelectorAll(
            ".quick-nav a"
        );


    window.addEventListener(
        "scroll",
        () => {

            let current = "";

            sections.forEach(section => {

                const sectionTop =
                    section.offsetTop - 150;

                if (
                    window.scrollY >=
                    sectionTop
                ) {

                    current =
                        section.getAttribute("id");

                }

            });


            navigation.forEach(link => {

                link.classList.remove("active");

                const href =
                    link.getAttribute("href");

                if (
                    href === "#" + current
                ) {

                    link.classList.add("active");

                }

            });

        }
    );


    /* =========================================
       SMOOTH SCROLL
    ========================================= */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");

                if (
                    targetId === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        targetId
                    );

                if (!target) {

                    return;

                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


    /* =========================================
       KEYBOARD ACCESS
    ========================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        }
    );

});
