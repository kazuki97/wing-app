// pricing.js
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
  orderBy,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// 単価ルールの追加
export async function addPricingRule(subcategoryId, minQuantity, maxQuantity, unitPrice) {
  try {
    const docRef = await addDoc(collection(db, 'pricingRules'), {
      subcategoryId,
      minQuantity,
      maxQuantity,
      unitPrice,
    });
    return docRef.id;
  } catch (error) {
    console.error('単価ルールの追加エラー:', error);
    throw error;
  }
}

// 単価ルールの取得（サブカテゴリごと）
export async function getPricingRules(subcategoryId) {
  try {
    const q = query(
      collection(db, 'pricingRules'),
      where('subcategoryId', '==', subcategoryId),
      orderBy('minQuantity', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('単価ルールの取得エラー:', error);
    throw error;
  }
}

// 単価ルールの削除
export async function deletePricingRule(id) {
  try {
    const docRef = doc(db, 'pricingRules', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('単価ルールの削除エラー:', error);
    throw error;
  }
}

// 購入数量に応じた単価の取得
export async function getUnitPrice(subcategoryId, totalQuantity) {
  try {
    const pricingRules = await getPricingRules(subcategoryId);
    for (const rule of pricingRules) {
      if (totalQuantity >= rule.minQuantity && totalQuantity <= rule.maxQuantity) {
        return rule.unitPrice;
      }
    }
    // 適用可能なルールがない場合は null を返す
    return null;
  } catch (error) {
    console.error('単価の取得エラー:', error);
    throw error;
  }
}
