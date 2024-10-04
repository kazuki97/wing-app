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

// 在庫の追加または更新
export async function updateInventory(productId, quantity) {
  try {
    const docRef = doc(db, 'inventory', productId);
    await setDoc(
      docRef,
      {
        quantity: quantity,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('在庫の更新エラー:', error);
    throw error;
  }
}

// 在庫の取得
export async function getInventory(productId) {
  try {
    const docRef = doc(db, 'inventory', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return { quantity: 0 };
    }
  } catch (error) {
    console.error('在庫の取得エラー:', error);
    throw error;
  }
}

// 全商品の在庫一覧を取得
export async function getAllInventories() {
  try {
    const snapshot = await getDocs(collection(db, 'inventory'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('在庫一覧の取得エラー:', error);
    throw error;
  }
}

// 在庫の削除
export async function deleteInventory(productId) {
  try {
    const docRef = doc(db, 'inventory', productId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('在庫の削除エラー:', error);
    throw error;
  }
}
