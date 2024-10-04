// transactions.js
import { db } from "./db.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 売上データの追加
export async function addTransaction(transactionData) {
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...transactionData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("売上データの追加エラー:", error);
    throw error;
  }
}

// 売上データの取得
export async function getTransactions() {
  try {
    const snapshot = await getDocs(collection(db, "transactions"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("売上データの取得エラー:", error);
    throw error;
  }
}

// 必要に応じて編集、削除関数も実装
