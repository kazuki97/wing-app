// db.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase の設定情報（firebaseConfig.js からインポート）
import { firebaseConfig } from "./firebaseConfig.js";

// Firebase アプリの初期化
const app = initializeApp(firebaseConfig);

// Firestore データベースの取得
export const db = getFirestore(app);
