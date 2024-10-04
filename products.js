// products.js
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

// 商品の追加
export async function addProduct(productData) {
  try {
    const docRef = await addDoc(collection(db, 'products'), productData);
    return docRef.id;
  } catch (error) {
    console.error('商品の追加エラー:', error);
    throw error;
  }
}

// 商品の取得
export async function getProducts(parentCategoryId, subcategoryId) {
  try {
    let q = collection(db, 'products');
    if (parentCategoryId && subcategoryId) {
      q = query(
        q,
        where('parentCategoryId', '==', parentCategoryId),
        where('subcategoryId', '==', subcategoryId)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('商品の取得エラー:', error);
    throw error;
  }
}

// 商品の更新
export async function updateProduct(id, updatedData) {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error('商品の更新エラー:', error);
    throw error;
  }
}

// 商品の削除
export async function deleteProduct(id) {
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('商品の削除エラー:', error);
    throw error;
  }
}
