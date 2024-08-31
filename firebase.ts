// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCupYbPlLk1kNC5JJLAL5N-KnxAK8HSxpk",
  authDomain: "trades-d190a.firebaseapp.com",
  projectId: "trades-d190a",
  storageBucket: "trades-d190a.appspot.com",
  messagingSenderId: "577974910737",
  appId: "1:577974910737:web:b9eb87fd6236a74e1916b0"
};
// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
