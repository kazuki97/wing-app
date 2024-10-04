// eventListeners.js
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

import {
  addTransaction,
  getTransactions,
  getTransactionById,
} from './transactions.js';

import { getDoc, doc } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { db } from './db.js';

// エラーメッセージ表示関数
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// 既存のイベントリスナーと関数は省略

// バーコードスキャンセクションのイベントリスナーと関数
let salesCart = [];

document.getElementById('addBarcodeButton').addEventListener('click', async () => {
  const barcodeInput = document.getElementById('barcodeInput');
  const barcode = barcodeInput.value.trim();
  if (!barcode) {
    showError('バーコードを入力してください');
    return;
  }
  try {
    const product = await getProductByBarcode(barcode);
    if (!product) {
      showError('該当する商品が見つかりません');
      return;
    }
    addToCart(product);
    barcodeInput.value = '';
  } catch (error) {
    console.error(error);
    showError('商品の取得に失敗しました');
  }
});

// Enterキーでバーコードを追加
document.getElementById('barcodeInput').addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('addBarcodeButton').click();
  }
});

// カートに商品を追加する関数
function addToCart(product) {
  const existingItem = salesCart.find((item) => item.product.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    salesCart.push({ product, quantity: 1 });
  }
  displaySalesCart();
}

// カートの表示
async function displaySalesCart() {
  const salesCartTable = document.getElementById('salesCart').querySelector('tbody');
  salesCartTable.innerHTML = '';
  let totalAmount = 0;

  // サブカテゴリごとの合計数量を計算
  const subcategoryQuantities = {};
  salesCart.forEach((item) => {
    const subcategoryId = item.product.subcategoryId;
    if (!subcategoryQuantities[subcategoryId]) {
      subcategoryQuantities[subcategoryId] = 0;
    }
    subcategoryQuantities[subcategoryId] += item.product.size * item.quantity;
  });

  for (const item of salesCart) {
    const { product, quantity } = item;
    const subcategoryId = product.subcategoryId;
    const totalQuantity = subcategoryQuantities[subcategoryId];

    // 単価を取得
    const unitPrice = await getUnitPrice(subcategoryId, totalQuantity);
    const subtotal = unitPrice * product.size * quantity;
    totalAmount += subtotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td><input type="number" value="${quantity}" min="1" data-product-id="${product.id}" class="cart-quantity" /></td>
      <td>${unitPrice}</td>
      <td>${subtotal}</td>
      <td><button class="remove-from-cart" data-product-id="${product.id}">削除</button></td>
    `;
    salesCartTable.appendChild(row);
  }

  document.getElementById('totalAmount').textContent = `合計金額: ¥${totalAmount}`;

  // 数量変更のイベントリスナー
  document.querySelectorAll('.cart-quantity').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const productId = e.target.dataset.productId;
      const newQuantity = parseInt(e.target.value, 10);
      if (newQuantity <= 0) {
        removeFromCart(productId);
      } else {
        updateCartQuantity(productId, newQuantity);
      }
    });
  });

  // 削除ボタンのイベントリスナー
  document.querySelectorAll('.remove-from-cart').forEach((button) => {
    button.addEventListener('click', (e) => {
      const productId = e.target.dataset.productId;
      removeFromCart(productId);
    });
  });
}

// カート内の商品の数量を更新
function updateCartQuantity(productId, newQuantity) {
  const item = salesCart.find((item) => item.product.id === productId);
  if (item) {
    item.quantity = newQuantity;
    displaySalesCart();
  }
}

// カートから商品を削除
function removeFromCart(productId) {
  salesCart = salesCart.filter((item) => item.product.id !== productId);
  displaySalesCart();
}

// 販売完了ボタンのイベントリスナー
document.getElementById('completeSaleButton').addEventListener('click', async () => {
  if (salesCart.length === 0) {
    showError('カートに商品がありません');
    return;
  }
  try {
    // 在庫のチェックと更新
    for (const item of salesCart) {
      const product = item.product;
      const quantity = item.quantity;
      const requiredQuantity = product.size * quantity;

      // 商品の在庫チェック
      if (product.quantity < requiredQuantity) {
        showError(`商品「${product.name}」の在庫が不足しています`);
        return;
      }
    }

    // 販売データの作成
    const transactionData = {
      timestamp: new Date(),
      totalAmount: parseInt(document.getElementById('totalAmount').textContent.replace('合計金額: ¥', ''), 10),
      items: salesCart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        size: item.product.size,
        subtotal: item.product.price * item.product.size * item.quantity,
      })),
    };

    // 取引の保存
    await addTransaction(transactionData);

    // 在庫の更新
    for (const item of salesCart) {
      const product = item.product;
      const quantity = item.quantity;
      const requiredQuantity = product.size * quantity;
      await updateProduct(product.id, { quantity: product.quantity - requiredQuantity });
    }

    // カートをクリア
    salesCart = [];
    displaySalesCart();
    alert('販売が完了しました');
  } catch (error) {
    console.error(error);
    showError('販売処理に失敗しました');
  }
});

// 売上管理セクションの表示
async function displayTransactions() {
  try {
    const transactions = await getTransactions();
    const transactionList = document.getElementById('transactionList').querySelector('tbody');
    transactionList.innerHTML = '';
    for (const transaction of transactions) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${transaction.id}</td>
        <td>${transaction.timestamp.toDate().toLocaleString()}</td>
        <td>¥${transaction.totalAmount}</td>
        <td><button class="view-transaction-details" data-id="${transaction.id}">詳細</button></td>
      `;
      transactionList.appendChild(row);
    }

    // 詳細ボタンのイベントリスナー
    document.querySelectorAll('.view-transaction-details').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const transactionId = e.target.dataset.id;
        await displayTransactionDetails(transactionId);
      });
    });
  } catch (error) {
    console.error(error);
    showError('取引の表示に失敗しました');
  }
}

// 取引詳細の表示
async function displayTransactionDetails(transactionId) {
  try {
    const transaction = await getTransactionById(transactionId);
    if (!transaction) {
      showError('取引が見つかりません');
      return;
    }
    document.getElementById('detailTransactionId').textContent = transaction.id;
    document.getElementById('detailTimestamp').textContent = transaction.timestamp.toDate().toLocaleString();

    const detailProductList = document.getElementById('detailProductList');
    detailProductList.innerHTML = '';
    for (const item of transaction.items) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>${item.unitPrice}</td>
        <td>${item.subtotal}</td>
      `;
      detailProductList.appendChild(row);
    }
    document.getElementById('transactionDetails').style.display = 'block';
  } catch (error) {
    console.error(error);
    showError('取引詳細の表示に失敗しました');
  }
}

// 取引詳細の閉じるボタン
document.getElementById('closeTransactionDetails').addEventListener('click', () => {
  document.getElementById('transactionDetails').style.display = 'none';
});

// 初期化処理
window.addEventListener('DOMContentLoaded', async () => {
  await updateAllParentCategorySelects();
  await updatePricingParentCategorySelect();
  await displayParentCategories();
  await displayProducts();
  await displayOverallInventory();
  await displayInventoryProducts();
  await displayTransactions(); // 売上管理セクションの初期表示
});
