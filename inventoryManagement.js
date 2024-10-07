// inventoryManagement.js

import { db } from './db.js';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// 全体在庫の更新（サブカテゴリごと）
export async function updateOverallInventory(subcategoryId, quantity) {
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
    console.error('全体在庫の更新エラー:', error);
    throw error;
  }
}

// トランザクション内で全体在庫を更新する関数（修正箇所）
export async function updateOverallInventoryTransaction(transaction, subcategoryId, quantityChange) {
  try {
    const overallInventoryRef = doc(db, 'overallInventory', subcategoryId);
    // まず読み取り操作を行う
    const overallInventoryDoc = await transaction.get(overallInventoryRef);
    let currentQuantity = 0;
    if (overallInventoryDoc.exists()) {
      currentQuantity = overallInventoryDoc.data().quantity || 0;
    }
    const newQuantity = currentQuantity + quantityChange;

    if (newQuantity < 0) {
      throw new Error('全体在庫が不足しています');
    }

    // 書き込み操作
    transaction.set(
      overallInventoryRef,
      {
        quantity: newQuantity,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('全体在庫のトランザクション更新エラー:', error);
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
