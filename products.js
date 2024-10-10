// transactions.js

import { db } from './db.js';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { getProductById } from './products.js'; // 商品情報を取得するためにインポート

// 売上データの追加
export async function addTransaction(transactionData) {
  if (!transactionData || !transactionData.productId) {
    console.error('無効な取引データ:', transactionData);
    throw new Error('取引データが無効です。商品IDが必要です。');
  }
  try {
    // 商品IDから商品情報を取得
    const product = await getProductById(transactionData.productId);
    if (!product) {
      console.error(`商品が見つかりません: productId=${transactionData.productId}`);
      throw new Error(`商品が見つかりません: productId=${transactionData.productId}`);
    }
    
    // 商品にサブカテゴリ情報がある場合、それをトランザクションデータに追加
    transactionData.subcategory = product.subcategoryId ? String(product.subcategoryId) : null;

    const docRef = await addDoc(collection(db, 'transactions'), transactionData);
    return docRef.id;
  } catch (error) {
    console.error('取引の追加エラー:', error);
    throw error;
  }
}

// 取引データの取得
export async function getTransactions(filters = {}) {
  try {
    let transactionQuery = collection(db, 'transactions');

    const conditions = [];
    if (filters.year) {
      conditions.push(where('year', '==', filters.year));
    }
    if (filters.month) {
      conditions.push(where('month', '==', filters.month));
    }
    if (filters.category) {
      conditions.push(where('category', '==', filters.category));
    }
    if (filters.subcategory) {
      conditions.push(where('subcategory', '==', filters.subcategory));
    }
    if (filters.onlyReturned) {
      conditions.push(where('isReturned', '==', true));
    }

    if (conditions.length > 0) {
      transactionQuery = query(transactionQuery, ...conditions);
    }

    transactionQuery = query(transactionQuery, orderBy('timestamp', 'desc'));

    const snapshot = await getDocs(transactionQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('取引の取得エラー:', error);
    throw error;
  }
}

// 取引データのIDでの取得
export async function getTransactionById(transactionId) {
  if (!transactionId) {
    console.error('無効な取引ID:', transactionId);
    return null;
  }
  try {
    const docRef = doc(db, 'transactions', transactionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error('取引が見つかりません: transactionId=', transactionId);
      return null;
    }
  } catch (error) {
    console.error('取引の取得エラー:', error);
    throw error;
  }
}

// 取引データの更新（返品処理で使用）
export async function updateTransaction(transactionId, updatedData) {
  if (!transactionId) {
    console.error('無効な取引ID:', transactionId);
    return;
  }
  try {
    const docRef = doc(db, 'transactions', transactionId);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error('取引の更新エラー:', error);
    throw error;
  }
}

// 取引データの削除
export async function deleteTransaction(transactionId) {
  if (!transactionId) {
    console.error('無効な取引ID:', transactionId);
    return;
  }
  try {
    const docRef = doc(db, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('取引の削除エラー:', error);
    throw error;
  }
}
