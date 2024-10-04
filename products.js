// products.js
import { db } from './db.js';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { updateInventory, getInventory } from './inventoryManagement.js';

// 商品の追加
export async function addProduct(productData) {
  try {
    const docRef = await addDoc(collection(db, 'products'), productData);
    // 初期在庫数を0で設定
    await updateInventory(docRef.id, 0);
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
    if (parentCategoryId) {
      q = query(q, where('parentCategoryId', '==', parentCategoryId));
    }
    if (subcategoryId) {
      q = query(q, where('subcategoryId', '==', subcategoryId));
    }
    const snapshot = await getDocs(q);
    const products = [];
    for (const docSnap of snapshot.docs) {
      const product = { id: docSnap.id, ...docSnap.data() };
      const inventory = await getInventory(product.id);
      product.quantity = inventory.quantity || 0;
      products.push(product);
    }
    return products;
  } catch (error) {
    console.error('商品の取得エラー:', error);
    throw error;
  }
}

// 商品IDから商品情報を取得
export async function getProductById(productId) {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error('商品が見つかりません');
      return null;
    }
  } catch (error) {
    console.error('商品の取得エラー:', error);
    throw error;
  }
}

// すべての商品の取得
export async function getAllProducts() {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    const products = [];
    for (const docSnap of snapshot.docs) {
      const product = { id: docSnap.id, ...docSnap.data() };
      const inventory = await getInventory(product.id);
      product.quantity = inventory.quantity || 0;
      products.push(product);
    }
    return products;
  } catch (error) {
    console.error('すべての商品の取得エラー:', error);
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
