// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2IKHNenXL3doHeZeuxtcSB_DSU8x3We8",
  authDomain: "pokemon-quiz-b95e6.firebaseapp.com",
  projectId: "pokemon-quiz-b95e6",
  storageBucket: "pokemon-quiz-b95e6.firebasestorage.app",
  messagingSenderId: "144233810360",
  appId: "1:144233810360:web:70e2abe96f77029dfd274d",
  measurementId: "G-697DFZW9BB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export { app, analytics };