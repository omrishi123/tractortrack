// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "tractortrack-b0m5s",
  "appId": "1:857329889747:web:1c884438707137b97e7f26",
  "storageBucket": "tractortrack-b0m5s.firebasestorage.app",
  "apiKey": "AIzaSyAIevGe_ar6H2FCu-q3YJEc30MteXyIlGM",
  "authDomain": "tractortrack-b0m5s.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "857329889747"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
