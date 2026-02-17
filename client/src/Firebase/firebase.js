// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  remove,
  update,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRKz_5ZmbCT7psixGIKJr_FJA1a5GjOkE",
  authDomain: "interactive-5c598.firebaseapp.com",
  databaseURL: "https://interactive-5c598-default-rtdb.firebaseio.com",
  projectId: "interactive-5c598",
  storageBucket: "interactive-5c598.firebasestorage.app",
  messagingSenderId: "480894110668",
  appId: "1:480894110668:web:ebe0c9a78b22c56981eb69",
  measurementId: "G-PNF4TSSTSP",
};

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

export {
  database,
  storage,
  auth,
  ref,
  set,
  push,
  get,
  remove,
  update,
  storageRef,
  uploadBytes,
  getDownloadURL,
};
