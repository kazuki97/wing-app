// consumables.js

import { db } from './db.js';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// 消耗品の追加
export async function addConsumable(name, cost) {
  try {
    const docRef = await addDoc(collection(db, 'consumables'), {
      name: name,
      cost: cost,
    });
    return docRef.id;
  } catch (error) {
    console.error('消耗品の追加エラー:', error);
    throw error;
  }
}

// 消耗品の取得
export async function getConsumables() {
  try {
    const snapshot = await getDocs(collection(db, 'consumables'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('消耗品の取得エラー:', error);
    throw error;
  }
}

// 消耗品の更新
export async function updateConsumable(id, name, cost) {
  try {
    const docRef = doc(db, 'consumables', id);
    await updateDoc(docRef, { name: name, cost: cost });
  } catch (error) {
    console.error('消耗品の更新エラー:', error);
    throw error;
  }
}

// 消耗品の削除
export async function deleteConsumable(id) {
  try {
    const docRef = doc(db, 'consumables', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('消耗品の削除エラー:', error);
    throw error;
  }
}
