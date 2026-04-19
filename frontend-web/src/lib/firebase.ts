import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC8BoL8yfKIQ2o-tVmbrVfx0TXcUvudzyY",
    authDomain: "project-3cccff25-b1fb-4aa9-978.firebaseapp.com",
    projectId: "project-3cccff25-b1fb-4aa9-978",
    storageBucket: "project-3cccff25-b1fb-4aa9-978.firebasestorage.app",
    messagingSenderId: "1009826575246",
    appId: "1:1009826575246:web:595912191007526e5deadf"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
