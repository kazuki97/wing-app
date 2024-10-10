// db.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey:process.env."AIzaSyBND1iUtwW9-D3wisl5-wO_-Sfahab0zmA",
    authDomain:process.env."wing-system.firebaseapp.com",
    projectId:process.env."wing-system",
    storageBucket:process.env."wing-system.appspot.com",
    messagingSenderId:process.env."308022918518",
    appId:process.env."1:308022918518:web:ebdfe5deb82fa32a3f4e57",
    measurementId:process.env."G-806S4XB84E"
  };

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// Firestoreデータベースの取得
export const db = getFirestore(app);
