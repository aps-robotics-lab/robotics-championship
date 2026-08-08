/* =====================================================
   APS ROBOTICS CHAMPIONSHIP 2026
   MAIN WEBSITE JAVASCRIPT
===================================================== */


/* =====================================================
   MOBILE NAVIGATION
===================================================== */

const menuToggle =
    document.getElementById("menuToggle");

const navMenu =
    document.getElementById("navMenu");


if(menuToggle && navMenu){

    menuToggle.addEventListener(
        "click",
        function(){

            navMenu.classList.toggle("active");


            const icon =
                menuToggle.querySelector("i");


            if(navMenu.classList.contains("active")){

                icon.classList.remove(
                    "fa-bars"
                );

                icon.classList.add(
                    "fa-xmark"
                );

            }

            else{

                icon.classList.remove(
                    "fa-xmark"
                );

                icon.classList.add(
                    "fa-bars"
                );

            }

        }
    );

}


/* =====================================================
   CLOSE MOBILE MENU AFTER CLICK
===================================================== */

document
.querySelectorAll(".navbar ul a")
.forEach(link => {

    link.addEventListener(
        "click",
        function(){

            if(navMenu){

                navMenu.classList.remove(
                    "active"
                );

            }


            if(menuToggle){

                const icon =
                    menuToggle.querySelector("i");


                if(icon){

                    icon.classList.remove(
                        "fa-xmark"
                    );

                    icon.classList.add(
                        "fa-bars"
                    );

                }

            }

        }
    );

});


/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

const sections =
    document.querySelectorAll("section[id]");

const navLinks =
    document.querySelectorAll(
        ".navbar ul li a"
    );


function updateActiveNavigation(){

    let current =
        "home";


    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 150;

        const sectionHeight =
            section.offsetHeight;

        if(
            window.scrollY >= sectionTop &&
            window.scrollY <
            sectionTop + sectionHeight
        ){

            current =
                section.getAttribute("id");

        }

    });


    navLinks.forEach(link => {

        link.classList.remove(
            "active"
        );


        if(
            link.getAttribute("href") ===
            "#" + current
        ){

            link.classList.add(
                "active"
            );

        }

    });

}


window.addEventListener(
    "scroll",
    updateActiveNavigation
);


updateActiveNavigation();


/* =====================================================
   BACK TO TOP
===================================================== */

const topButton =
    document.querySelector(".top-btn");


if(topButton){

    topButton.style.opacity = "0";

    topButton.style.pointerEvents =
        "none";


    window.addEventListener(
        "scroll",
        function(){

            if(window.scrollY > 500){

                topButton.style.opacity =
                    "1";

                topButton.style.pointerEvents =
                    "auto";

            }

            else{

                topButton.style.opacity =
                    "0";

                topButton.style.pointerEvents =
                    "none";

            }

        }
    );

}


/* =====================================================
   EVENT CARD VISUAL SELECTION
===================================================== */

const eventOptions =
    document.querySelectorAll(
        ".event-option"
    );


eventOptions.forEach(option => {

    const checkbox =
        option.querySelector(
            "input[type='checkbox']"
        );


    if(!checkbox){
        return;
    }


    checkbox.addEventListener(
        "change",
        function(){

            option.classList.toggle(
                "selected",
                checkbox.checked
            );

        }
    );

});


/* =====================================================
   PHONE NUMBER
===================================================== */

const phoneInput =
    document.querySelector(
        "input[name='MobileNumber']"
    );


if(phoneInput){

    phoneInput.addEventListener(
        "input",
        function(){

            this.value =
                this.value.replace(
                    /[^0-9+ ]/g,
                    ""
                );

        }
    );

}


/* =====================================================
   PREVENT MULTIPLE FORM SUBMISSION
===================================================== */

const registerForm =
    document.getElementById(
        "registerForm"
    );


if(registerForm){

    registerForm.addEventListener(
        "invalid",
        function(){

            const firstInvalid =
                registerForm.querySelector(
                    ":invalid"
                );


            if(firstInvalid){

                firstInvalid.scrollIntoView({
                    behavior:"smooth",
                    block:"center"
                });

            }

        },
        true
    );

}
