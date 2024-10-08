// consumables.js

import { db } from './db.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// コレクションの参照
const consumablesCollection = collection(db, 'consumables');

// 消耗品の追加
export async function addConsumable(consumable) {
  try {
    await addDoc(consumablesCollection, consumable);
  } catch (error) {
    console.error('消耗品の追加に失敗しました:', error);
    throw new Error('消耗品の追加に失敗しました');
  }
}

// 消耗品のIDで取得
export async function getConsumableById(id) {
  try {
    const consumableDoc = doc(db, 'consumables', id);
    const consumableSnapshot = await getDoc(consumableDoc);
    if (consumableSnapshot.exists()) {
      return { ...consumableSnapshot.data(), id: consumableSnapshot.id };
    } else {
      throw new Error('消耗品が見つかりません');
    }
  } catch (error) {
    console.error('消耗品の取得に失敗しました:', error);
    throw new Error('消耗品の取得に失敗しました');
  }
}

// 消耗品の削除
export async function deleteConsumable(id) {
  try {
    const consumableDoc = doc(db, 'consumables', id);
    await deleteDoc(consumableDoc);
  } catch (error) {
    console.error('消耗品の削除に失敗しました:', error);
    throw new Error('消耗品の削除に失敗しました');
  }
}

// 消耗品の更新
export async function updateConsumable(id, updatedData) {
  try {
    const consumableDoc = doc(db, 'consumables', id);
    await updateDoc(consumableDoc, updatedData);
  } catch (error) {
    console.error('消耗品の更新に失敗しました:', error);
    throw new Error('消耗品の更新に失敗しました');
  }
}
