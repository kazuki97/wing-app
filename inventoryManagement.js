// inventoryManagement.js

import { db } from './db.js';
import {
  collection,
  addDoc,
  updateDoc,
  setDoc, // setDoc を追加
  deleteDoc,
  doc,
  getDoc, // getDoc を追加
  getDocs,
  increment,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// 全体在庫の設定（サブカテゴリごと）
// 関数名を setOverallInventory に変更
export async function setOverallInventory(subcategoryId, quantity) {
  try {
    const docRef = doc(db, 'overallInventory', subcategoryId);
    await setDoc(
      docRef,
      {
        quantity: quantity,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('全体在庫の設定エラー:', error);
    throw error;
  }
}

// 全体在庫の取得（サブカテゴリごと）
export async function getOverallInventory(subcategoryId) {
  try {
    const docRef = doc(db, 'overallInventory', subcategoryId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return { quantity: 0 };
    }
  } catch (error) {
    console.error('全体在庫の取得エラー:', error);
    throw error;
  }
}

// 全体在庫の一覧取得
export async function getAllOverallInventories() {
  try {
    const snapshot = await getDocs(collection(db, 'overallInventory'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('全体在庫一覧の取得エラー:', error);
    throw error;
  }
}

// 全体在庫の更新関数
export async function updateOverallInventory(productId, quantityChange) {
  try {
    const docRef = doc(db, 'overallInventory', productId);
    await setDoc(
      docRef,
      {
        quantity: increment(quantityChange),
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('全体在庫の更新エラー:', error);
    throw error;
  }
}
