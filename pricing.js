// pricing.js
import { db } from "./db.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 単価の追加
export async function addPricing(pricingData) {
  try {
    const docRef = await addDoc(collection(db, "pricing"), pricingData);
    return docRef.id;
  } catch (error) {
    console.error("単価の追加エラー:", error);
    throw error;
  }
}

// 単価の取得
export async function getPricing(parentCategoryId, subcategoryId) {
  try {
    const q = query(
      collection(db, "pricing"),
      where("parentCategoryId", "==", parentCategoryId),
      where("subcategoryId", "==", subcategoryId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("単価の取得エラー:", error);
    throw error;
  }
}

// 単価の編集、削除関数も同様に実装

