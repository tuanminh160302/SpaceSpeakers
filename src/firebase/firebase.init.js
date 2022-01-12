// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { doc, getDoc, setDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDv4UeL7OVLr4sWsBERcBc3_9DjkEMZ3JI",
  authDomain: "spacespeakers-c22ec.firebaseapp.com",
  projectId: "spacespeakers-c22ec",
  storageBucket: "spacespeakers-c22ec.appspot.com",
  messagingSenderId: "910239653587",
  appId: "1:910239653587:web:6684df40dfe1d648207e26",
  measurementId: "G-J0CGPXLQGF"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

export const db = getFirestore();

export const createUserCredentials = async (userCredentials, additionalData) => {
    const { uid } = userCredentials
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
  
    if (!userSnap.exists()) {
      const createdAt = new Date();
  
      try {
        await setDoc(doc(db, "users", uid), {
          createdAt,
          uid,
          ...additionalData
        })
  
      } catch (err) {
        console.log('error creating user', err.message)
      }
    }
  }

export default firebaseApp;