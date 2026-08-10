// Keep the two Firebase projects separate.
// mainFirebaseConfig = registration/admin project
// helpFirebaseConfig = support/agent project

export const mainFirebaseConfig = {
    apiKey: "PASTE_MAIN_FIREBASE_API_KEY",
    authDomain: "PASTE_MAIN_PROJECT.firebaseapp.com",
    databaseURL: "https://PASTE_MAIN_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "PASTE_MAIN_PROJECT_ID",
    storageBucket: "PASTE_MAIN_PROJECT.firebasestorage.app",
    messagingSenderId: "PASTE_MAIN_SENDER_ID",
    appId: "PASTE_MAIN_APP_ID"
};

export const helpFirebaseConfig = {
    apiKey: "PASTE_HELP_FIREBASE_API_KEY",
    authDomain: "PASTE_HELP_PROJECT.firebaseapp.com",
    databaseURL: "https://robotics-championship-ab248-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "robotics-championship-ab248",
    storageBucket: "robotics-championship-ab248.firebasestorage.app",
    messagingSenderId: "PASTE_HELP_SENDER_ID",
    appId: "PASTE_HELP_APP_ID"
};

// Replace these after creating the Firebase Auth users.
export const ADMIN_UID = "PASTE_MAIN_ADMIN_UID";
export const AGENT_UID = "HgWiHPRx9gcXZtDTl0pDCpZlokt2";

// Multi-agent allow-list.
// Add authenticated agent UIDs here after creating them in Firebase Auth.
export const AGENT_UIDS = [
    AGENT_UID
];
