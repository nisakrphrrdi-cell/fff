import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCU_wbdlrRkltInttFM69w7Rjo_lu003uo",
  authDomain: "guild-flower.firebaseapp.com",
  projectId: "guild-flower",
  storageBucket: "guild-flower.firebasestorage.app",
  messagingSenderId: "1064672788470",
  appId: "1:1064672788470:web:4d2d693394e19d507d51d7",
  measurementId: "G-K99X3V2TZF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
