import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Replace with your Firebase configuration
  apiKey: "AIzaSyA8AoNIRdLQ50qzQryn6tnLNKMzmnBWBec",
  authDomain: "crm2-ecfe6.firebaseapp.com",
  projectId: "crm2-ecfe6",
  storageBucket: "crm2-ecfe6.appspot.com",
  messagingSenderId: "284774117565",
  appId: "1:284774117565:web:72a553fd87f998a313c7d4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);