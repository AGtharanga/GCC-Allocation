import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLwvctWxc19zrHFAyFybnZq_yoKleuZI",
  authDomain: "gcc-allocator.firebaseapp.com",
  projectId: "gcc-allocator",
  storageBucket: "gcc-allocator.firebasestorage.app",
  messagingSenderId: "1055272661073",
  appId: "1:1055272661073:web:53177f15303df0b39f37c7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
