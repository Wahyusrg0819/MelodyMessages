import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDK_hHX8X0oFqJAUWsUOZBfCZO2JHYkyAg",
  authDomain: "melodymessages-fb3a4.firebaseapp.com",
  projectId: "melodymessages-fb3a4",
  storageBucket: "melodymessages-fb3a4.firebasestorage.app",
  messagingSenderId: "873160143338",
  appId: "1:873160143338:web:d291e88227b546acd90293"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 