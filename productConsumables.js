// productConsumables.js

import { db } from './db.js';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// 商品への消耗品割り当て
export async function assignConsumableToProduct(productId, consumableId, quantity) {
  try {
    await addDoc(collection(db, 'productConsumables'), {
      productId: productId,
      consumableId: consumableId,
      quantity: quantity,
    });
  } catch (error) {
    console.error('消耗品の割り当てエラー:', error);
    throw error;
  }
}

// 商品ごとの消耗品取得
export async function getProductConsumables() {
  try {
    const snapshot = await getDocs(collection(db, 'productConsumables'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('商品ごとの消耗品取得エラー:', error);
    throw error;
  }
}

// 消耗品の割り当て削除
export async function deleteProductConsumable(id) {
  try {
    const docRef = doc(db, 'productConsumables', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('消耗品の割り当て削除エラー:', error);
    throw error;
  }
}
