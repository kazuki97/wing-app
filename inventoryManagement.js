// inventoryManagement.js
import { db } from "./db.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 在庫の更新（追加・編集）
export async function updateInventory(productId, quantity) {
  try {
    const inventoryRef = doc(db, "inventory", productId);
    await setDoc(
      inventoryRef,
      {
        quantity,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("在庫の更新エラー:", error);
    throw error;
  }
}

// 在庫の取得
export async function getInventory(productId) {
  try {
    const docRef = doc(db, "inventory", productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("在庫の取得エラー:", error);
    throw error;
  }
}

// 在庫の削除も必要に応じて実装
