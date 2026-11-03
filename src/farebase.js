import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "ВСТАВЬ_СЮДА",
  authDomain: "ВСТАВЬ_СЮДА",
  projectId: evoca-demo,
  storageBucket: "ВСТАВЬ_СЮДА",
  messagingSenderId: "ВСТАВЬ_СЮДА",
  appId: "1:106956067988:web:82482371b1c4614e5e1081",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)