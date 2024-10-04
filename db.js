// db.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { firebaseConfig } from './firebaseConfig.js';

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// Firestoreデータベースの取得
export const db = getFirestore(app);
