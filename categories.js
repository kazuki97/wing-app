// categories.js
import { db } from "./db.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 親カテゴリの追加
export async function addParentCategory(name) {
  try {
    const docRef = await addDoc(collection(db, "parentCategories"), {
      name,
    });
    return docRef.id;
  } catch (error) {
    console.error("親カテゴリの追加エラー:", error);
    throw error;
  }
}

// サブカテゴリの追加
export async function addSubcategory(name, parentCategoryId) {
  try {
    const docRef = await addDoc(collection(db, "subcategories"), {
      name,
      parentCategoryId,
    });
    return docRef.id;
  } catch (error) {
    console.error("サブカテゴリの追加エラー:", error);
    throw error;
  }
}

// 親カテゴリの取得
export async function getParentCategories() {
  try {
    const snapshot = await getDocs(collection(db, "parentCategories"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("親カテゴリの取得エラー:", error);
    throw error;
  }
}

// サブカテゴリの取得
export async function getSubcategories(parentCategoryId) {
  try {
    const q = query(
      collection(db, "subcategories"),
      where("parentCategoryId", "==", parentCategoryId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("サブカテゴリの取得エラー:", error);
    throw error;
  }
}

// カテゴリの編集、削除関数も同様に実装
