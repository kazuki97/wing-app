// eventListeners.js

// インポート
import {
  addParentCategory,
  getParentCategories,
  updateParentCategory,
  deleteParentCategory,
  addSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
} from './categories.js';

import {
  addProduct,
  getProducts,
  getProductById,
  getProductByBarcode,
  updateProduct,
  deleteProduct,
  getAllProducts,
} from './products.js';

import {
  updateOverallInventory,
  getOverallInventory,
  getAllOverallInventories,
} from './inventoryManagement.js';

import {
  addPricingRule,
  getPricingRules,
  deletePricingRule,
  getUnitPrice,
} from './pricing.js';

// salesEventListeners.js に移動するため、以下のインポートは削除します
// import {
//   addTransaction,
//   getTransactions,
//   getTransactionById,
// } from './transactions.js';

// import {
//   addPaymentMethod,
//   getPaymentMethods,
//   updatePaymentMethod,
//   deletePaymentMethod,
// } from './paymentMethods.js';

// import { getDoc, doc } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
// import { db } from './db.js';

// エラーメッセージ表示関数
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// 既存のイベントリスナーと関数（カテゴリ設定、商品設定、在庫管理、全体在庫、単価設定）はそのまま残します。

// 初期化処理
window.addEventListener('DOMContentLoaded', async () => {
  await updateAllParentCategorySelects();
  await updatePricingParentCategorySelect();
  await displayParentCategories();
  await displayProducts();
  await displayOverallInventory();
  await displayInventoryProducts();
  // salesEventListeners.js に移動するため、以下の関数呼び出しは削除します
  // await displayTransactions();
  // await displayPaymentMethods();
  // await updatePaymentMethodSelect();
});
