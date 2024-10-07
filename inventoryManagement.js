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

// 全体在庫の削除（新規追加）
export async function deleteOverallInventory(subcategoryId) {
  try {
    const docRef = doc(db, 'overallInventory', subcategoryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('全体在庫の削除エラー:', error);
    throw error;
  }
}

// 消耗品の在庫更新（新規追加）
export async function updateConsumableInventory(consumableId, quantity) {
  try {
    const docRef = doc(db, 'consumableInventory', consumableId);
    await setDoc(
      docRef,
      {
        quantity: quantity,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('消耗品在庫の更新エラー:', error);
    throw error;
  }
}

// 消耗品在庫の取得（新規追加）
export async function getConsumableInventory(consumableId) {
  try {
    const docRef = doc(db, 'consumableInventory', consumableId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return { quantity: 0 };
    }
  } catch (error) {
    console.error('消耗品在庫の取得エラー:', error);
    throw error;
  }
}

// 消耗品在庫の一覧取得（新規追加）
export async function getAllConsumableInventories() {
  try {
    const snapshot = await getDocs(collection(db, 'consumableInventory'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('消耗品在庫一覧の取得エラー:', error);
    throw error;
  }
}

// 消耗品在庫の削除（新規追加）
export async function deleteConsumableInventory(consumableId) {
  try {
    const docRef = doc(db, 'consumableInventory', consumableId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('消耗品在庫の削除エラー:', error);
    throw error;
  }
}
