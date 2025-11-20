// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC03UT14Szv6sjKyioAaOb7D8OFd5kgNuA",
  authDomain: "reactchat-c34ca.firebaseapp.com",
  projectId: "reactchat-c34ca",
  storageBucket: "reactchat-c34ca.firebasestorage.app",
  messagingSenderId: "401328830463",
  appId: "1:401328830463:web:ab06df0962417a0bbdd9ca",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app)
