// Import the functions you need from the SDKs you need
import { initializeApp } from "./firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2fBxuhMAhRtq0eCdJRrdf5qvIuO4qmaM",
  authDomain: "activitypoints-3288f.firebaseapp.com",
  projectId: "activitypoints-3288f",
  storageBucket: "activitypoints-3288f.firebasestorage.app",
  messagingSenderId: "984742822354",
  appId: "1:984742822354:web:54f59ffaf98b6476f0880b"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);