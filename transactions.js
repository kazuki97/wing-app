// transactions.js
import { db } from './db.js';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  orderBy,
  query,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// 売上データの追加
export async function addTransaction(transactionData) {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), transactionData);
    return docRef.id;
  } catch (error) {
    console.error('取引の追加エラー:', error);
    throw error;
  }
}

// 取引の更新（返品処理で使用）
export async function updateTransaction(transactionId, updatedData) {
  try {
    const docRef = doc(db, 'transactions', transactionId);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error('取引の更新エラー:', error);
    throw error;
  }
}

// 売上データの取得
export async function getTransactions() {
  try {
    const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('取引の取得エラー:', error);
    throw error;
  }
}

// 取引IDから取引詳細を取得
export async function getTransactionById(transactionId) {
  try {
    const docRef = doc(db, 'transactions', transactionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error('取引が見つかりません');
      return null;
    }
  } catch (error) {
    console.error('取引の取得エラー:', error);
    throw error;
  }
}
