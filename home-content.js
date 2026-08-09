import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


const firebaseConfig = {

    apiKey:
        "AIzaSyCucXDNlA86tU9ACdPm-oZGsAP_keBZ_uo",

    authDomain:
        "aps-robotics-championship.firebaseapp.com",

    databaseURL:
        "https://aps-robotics-championship-default-rtdb.firebaseio.com",

    projectId:
        "aps-robotics-championship",

    storageBucket:
        "aps-robotics-championship.firebasestorage.app",

    messagingSenderId:
        "1063542904891",

    appId:
        "1:1063542904891:web:82ff9bb3fba0b87384a41e"
};


const app =
    initializeApp(firebaseConfig);

const db =
    getDatabase(app);


const homeRef =
    ref(
        db,
        "siteContent/home"
    );


function setText(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );

    if (
        element &&
        value !== undefined
    ) {

        element.textContent =
            value;

    }

}


onValue(
    homeRef,
    snapshot => {

        if (
            !snapshot.exists()
        )
            return;


        const home =
            snapshot.val();


        /*
           Add these IDs to the
           corresponding elements
           in your index.html.
        */

        setText(
            "#adminHomeEyebrow",
            home.eyebrow
        );

        setText(
            "#adminHomeTitle",
            home.title
        );

        setText(
            "#adminHomeSubtitle",
            home.subtitle
        );

        setText(
            "#adminHomeDescription",
            home.description
        );

        setText(
            "#adminAboutTitle",
            home.aboutTitle
        );

        setText(
            "#adminAboutDescription",
            home.aboutDescription
        );


        const button =
            document.querySelector(
                "#adminHomeButton"
            );


        if (button) {

            if (
                home.buttonText
            ) {

                button.textContent =
                    home.buttonText;

            }


            if (
                home.buttonLink
            ) {

                button.href =
                    home.buttonLink;

            }

        }

    }
);
