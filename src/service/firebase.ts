// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBQ9drOxhnbKsDpq-OU4vwZTTO4IsXXmlQ",
    authDomain: "camstudy-5694b.firebaseapp.com",
    projectId: "camstudy-5694b",
    storageBucket: "camstudy-5694b.appspot.com",
    messagingSenderId: "786422356077",
    appId: "1:786422356077:web:0f148cb6bee8bfb1794764",
    measurementId: "G-6FBSQ3C9ZV"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const initFirebase = () => {
    return app
}