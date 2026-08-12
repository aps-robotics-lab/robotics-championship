document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("preloader");
    const header = document.getElementById("siteHeader");
    const menu = document.getElementById("menuBtn");
    const nav = document.getElementById("mainNav");
    const glow = document.getElementById("cursorGlow");
    const secretFooter = document.getElementById("secretFooterTrigger");
    const secret = document.getElementById("secretAccess");
    const closeSecret = document.getElementById("closeSecret");

    /* ---------------------------------------------
       PRELOADER — never trap the page
    --------------------------------------------- */
    let loaderClosed = false;
    const finishLoader = () => {
        if (loaderClosed) return;
        loaderClosed = true;
        loader?.classList.add("done");
    };
    window.addEventListener("load", finishLoader, { once: true });
    setTimeout(finishLoader, 1200);

    /* ---------------------------------------------
       MOBILE NAVIGATION
    --------------------------------------------- */
    menu?.addEventListener("click", () => {
        const open = nav?.classList.toggle("open") ?? false;
        menu.setAttribute("aria-expanded", String(open));
    });

    document.querySelectorAll("#mainNav a").forEach(link => {
        link.addEventListener("click", () => {
            nav?.classList.remove("open");
            menu?.setAttribute("aria-expanded", "false");
        });
    });

    /* ---------------------------------------------
       HEADER STATE + SCROLL PROGRESS
    --------------------------------------------- */
    let ticking = false;
    const updateScrollUI = () => {
        const y = window.scrollY || window.pageYOffset;
        header?.classList.toggle("scrolled", y > 30);

        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                const doc = document.documentElement;
                const max = doc.scrollHeight - window.innerHeight;
                const progress = max > 0 ? (y / max) * 100 : 0;
                document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
                ticking = false;
            });
        }
    };
    updateScrollUI();
    window.addEventListener("scroll", updateScrollUI, { passive: true });

    /* ---------------------------------------------
       DESKTOP CURSOR GLOW — RAF SMOOTHING
    --------------------------------------------- */
    if (glow && window.matchMedia("(pointer:fine)").matches) {
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;

        window.addEventListener("pointermove", event => {
            targetX = event.clientX;
            targetY = event.clientY;
        }, { passive: true });

        const animateGlow = () => {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            glow.style.left = `${currentX}px`;
            glow.style.top = `${currentY}px`;
            requestAnimationFrame(animateGlow);
        };
        animateGlow();
    }

    /* ---------------------------------------------
       SCROLL REVEALS
       Small stagger, no long invisible sections.
    --------------------------------------------- */
    const revealItems = document.querySelectorAll(
        ".section-code,.display,.intro-copy,.arena,.leaders article,.command,.arena-command,.steps>div,.faq-list details,.final-cta"
    );

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.04,
            rootMargin: "0px 0px -6% 0px"
        });

        revealItems.forEach((element, index) => {
            element.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
            observer.observe(element);
        });
    } else {
        revealItems.forEach(element => element.classList.add("revealed"));
    }

    /* ---------------------------------------------
       SMOOTH INTERNAL LINKS
    --------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const selector = link.getAttribute("href");
            if (!selector || selector === "#") return;

            const target = document.querySelector(selector);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    /* ---------------------------------------------
       5-CLICK HIDDEN DEPARTMENT ACCESS
    --------------------------------------------- */
    let taps = 0;
    let lastTap = 0;

    const triggerSecret = () => {
        const now = Date.now();
        if (now - lastTap > 2200) taps = 0;
        lastTap = now;
        taps += 1;

        if (taps >= 5) {
            secret?.classList.add("show");
            secret?.setAttribute("aria-hidden", "false");
            taps = 0;
        }
    };

    secretFooter?.addEventListener("click", triggerSecret);
    secretFooter?.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            triggerSecret();
        }
    });

    closeSecret?.addEventListener("click", () => {
        secret?.classList.remove("show");
        secret?.setAttribute("aria-hidden", "true");
    });

    secret?.addEventListener("click", event => {
        if (event.target === secret) {
            secret.classList.remove("show");
            secret.setAttribute("aria-hidden", "true");
        }
    });
});
