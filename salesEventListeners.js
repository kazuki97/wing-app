// salesEventListeners.js

// インポート
import {
  getProductByBarcode,
  getProductById,
} from './products.js';

import {
  addTransaction,
  getTransactions,
  getTransactionById,
  deleteTransaction,
} from './transactions.js';

import {
  addPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
} from './paymentMethods.js';

import { getUnitPrice } from './pricing.js'; // 単価取得

import { updateOverallInventoryTransaction } from './inventoryManagement.js'; // トランザクション内で全体在庫を更新

import { db } from './db.js'; // Firestoreデータベースのインスタンス

import {
  runTransaction,
  doc,
  collection,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js'; // トランザクション用に追加

// エラーメッセージ表示関数
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// バーコードスキャンセクションのイベントリスナーと関数
let salesCart = [];

// 支払い方法選択セレクトボックスの更新
async function updatePaymentMethodSelect() {
  try {
    const paymentMethods = await getPaymentMethods();
    const select = document.getElementById('paymentMethodSelect');
    select.innerHTML = '<option value="">支払い方法を選択</option>';
    paymentMethods.forEach((method) => {
      const option = document.createElement('option');
      option.value = method.id;
      option.textContent = method.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    showError('支払い方法の取得に失敗しました');
  }
}

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

  document.getElementById('totalAmount').textContent = `合計金額: ¥${totalAmount.toFixed(2)}`;

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
  const paymentMethodId = document.getElementById('paymentMethodSelect').value;
  if (!paymentMethodId) {
    showError('支払い方法を選択してください');
    return;
  }
  try {
    // 支払い方法情報の取得
    const paymentMethods = await getPaymentMethods();
    const paymentMethod = paymentMethods.find((method) => method.id === paymentMethodId);
    if (!paymentMethod) {
      showError('無効な支払い方法です');
      return;
    }
    const feeRate = paymentMethod.feeRate;

    // 手数料の計算
    const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('合計金額: ¥', ''));
    const feeAmount = parseFloat((totalAmount * feeRate / 100).toFixed(2));
    const netAmount = parseFloat((totalAmount - feeAmount).toFixed(2));

    // 原価と利益の計算
    let totalCost = 0;

    // **事前にすべてのデータを取得**
    const productDataList = [];
    for (const item of salesCart) {
      const productId = item.product.id;
      const productDoc = await getProductById(productId);
      if (!productDoc) {
        throw new Error(`商品が見つかりません: ${item.product.name}`);
      }
      const productData = productDoc;
      const quantity = item.quantity;
      const requiredQuantity = item.product.size * quantity;

      // 商品の在庫チェック
      if (productData.quantity < quantity) {
        throw new Error(`商品「${item.product.name}」の在庫が不足しています`);
      }

      // 単価の取得
      const unitPrice = await getUnitPrice(productData.subcategoryId, requiredQuantity);

      // コストと利益の計算
      const cost = productData.cost * quantity;
      const subtotal = unitPrice * item.product.size * quantity;
      totalCost += cost;

      productDataList.push({
        productRef: doc(db, 'products', productId),
        productData,
        quantity,
        requiredQuantity,
        subcategoryId: productData.subcategoryId,
        unitPrice,
        subtotal,
        cost,
        productName: productData.name,
        size: item.product.size,
      });
    }

    // 販売データの作成
    const transactionData = {
      timestamp: new Date(),
      totalAmount: totalAmount,
      feeAmount: feeAmount,
      netAmount: netAmount,
      paymentMethodId: paymentMethodId,
      paymentMethodName: paymentMethod.name,
      items: [],
      manuallyAdded: false,
      cost: totalCost,
      profit: netAmount - totalCost,
    };

    // Firestoreのトランザクションを使用して在庫更新と取引の保存を行う
    await runTransaction(db, (transaction) => {
      // 在庫の更新と取引データの準備
      productDataList.forEach((item) => {
        // 在庫の更新
        transaction.update(item.productRef, {
          quantity: item.productData.quantity - item.quantity,
        });

        // 全体在庫の更新
        updateOverallInventoryTransaction(
          transaction,
          item.subcategoryId,
          -item.requiredQuantity
        );

        // 取引データのアイテムを追加
        transactionData.items.push({
          productId: item.productRef.id,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          size: item.size,
          subtotal: item.subtotal,
          cost: item.cost,
          profit: item.subtotal - item.cost,
        });
      });

      // 取引の保存
      const transactionRef = doc(collection(db, 'transactions'));
      transaction.set(transactionRef, transactionData);
    });

    // カートをクリア
    salesCart = [];
    displaySalesCart();
    alert('販売が完了しました');
    // 売上管理セクションを更新
    await displayTransactions();
  } catch (error) {
    console.error(error);
    showError('販売処理に失敗しました: ' + error.message);
  }
});

// 返品処理
async function handleReturnTransaction(transactionData) {
  const reason = prompt('返品理由を入力してください');
  if (!reason) {
    showError('返品理由を入力してください');
    return;
  }
  try {
    // **事前にすべてのデータを取得**
    const productDataList = [];
    for (const item of transactionData.items) {
      const productId = item.productId;
      const productDoc = await getProductById(productId);
      if (!productDoc) {
        throw new Error(`商品が見つかりません: ${item.productName}`);
      }
      const productData = productDoc;
      const quantity = item.quantity;
      const requiredQuantity = item.size * quantity;

      productDataList.push({
        productRef: doc(db, 'products', productId),
        productData,
        quantity,
        requiredQuantity,
        subcategoryId: productData.subcategoryId,
      });
    }

    await runTransaction(db, (transaction) => {
      // 在庫の更新
      productDataList.forEach((item) => {
        // 在庫の更新
        transaction.update(item.productRef, {
          quantity: item.productData.quantity + item.quantity,
        });

        // 全体在庫の更新
        updateOverallInventoryTransaction(
          transaction,
          item.subcategoryId,
          item.requiredQuantity
        );
      });

      // 取引を返品済みに更新
      const transactionRef = doc(db, 'transactions', transactionData.id);
      transaction.update(transactionRef, {
        isReturned: true,
        returnReason: reason,
        returnedAt: new Date(),
      });
    });

    alert('返品が完了しました');
    // 取引詳細を再表示
    await displayTransactionDetails(transactionData.id);
    // 売上管理セクションを更新
    await displayTransactions();
  } catch (error) {
    console.error(error);
    showError('返品処理に失敗しました: ' + error.message);
  }
}

// 取引詳細の閉じるボタン
document.getElementById('closeTransactionDetails').addEventListener('click', () => {
  document.getElementById('transactionDetails').style.display = 'none';
});

// 支払い方法設定セクションのイベントリスナーと関数

// 支払い方法追加フォームのイベントリスナー
document.getElementById('addPaymentMethodForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('paymentMethodName').value.trim();
  const feeRate = parseFloat(document.getElementById('paymentMethodFee').value);
  if (!name || isNaN(feeRate)) {
    showError('支払い方法名と手数料率を正しく入力してください');
    return;
  }
  try {
    await addPaymentMethod(name, feeRate);
    alert('支払い方法が追加されました');
    document.getElementById('addPaymentMethodForm').reset();
    await displayPaymentMethods();
    await updatePaymentMethodSelect(); // 支払い方法セレクトボックスを更新
  } catch (error) {
    console.error(error);
    showError('支払い方法の追加に失敗しました');
  }
});

// 支払い方法の表示
async function displayPaymentMethods() {
  try {
    const paymentMethods = await getPaymentMethods();
    const paymentMethodList = document.getElementById('paymentMethodList').querySelector('tbody');
    paymentMethodList.innerHTML = '';
    for (const method of paymentMethods) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${method.name}</td>
        <td>${method.feeRate}%</td>
        <td>
          <button class="edit-payment-method" data-id="${method.id}">編集</button>
          <button class="delete-payment-method" data-id="${method.id}">削除</button>
        </td>
      `;
      paymentMethodList.appendChild(row);
    }

    // 編集ボタンのイベントリスナー
    document.querySelectorAll('.edit-payment-method').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const methodId = e.target.dataset.id;
        const method = paymentMethods.find((m) => m.id === methodId);
        if (method) {
          const newName = prompt('新しい支払い方法名を入力してください', method.name);
          const newFeeRate = parseFloat(prompt('新しい手数料率(%)を入力してください', method.feeRate));
          if (newName && !isNaN(newFeeRate)) {
            try {
              await updatePaymentMethod(methodId, newName, newFeeRate);
              alert('支払い方法が更新されました');
              await displayPaymentMethods();
              await updatePaymentMethodSelect(); // 支払い方法セレクトボックスを更新
            } catch (error) {
              console.error(error);
              showError('支払い方法の更新に失敗しました');
            }
          }
        }
      });
    });

    // 削除ボタンのイベントリスナー
    document.querySelectorAll('.delete-payment-method').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const methodId = e.target.dataset.id;
        if (confirm('本当に削除しますか？')) {
          try {
            await deletePaymentMethod(methodId);
            alert('支払い方法が削除されました');
            await displayPaymentMethods();
            await updatePaymentMethodSelect(); // 支払い方法セレクトボックスを更新
          } catch (error) {
            console.error(error);
            showError('支払い方法の削除に失敗しました');
          }
        }
      });
    });
  } catch (error) {
    console.error(error);
    showError('支払い方法の表示に失敗しました');
  }
}

// 手動で売上を追加する機能の実装

// 手動で売上を追加するボタンのイベントリスナー
document.getElementById('manualAddTransactionButton').addEventListener('click', async () => {
  // 支払い方法の選択肢を更新
  await updateTransactionPaymentMethodSelect();
  // フォームを表示
  document.getElementById('manualAddTransactionForm').style.display = 'block';
});

// キャンセルボタンのイベントリスナー
document.getElementById('cancelAddTransaction').addEventListener('click', () => {
  document.getElementById('manualAddTransactionForm').style.display = 'none';
});

// 支払い方法選択セレクトボックスの更新（手動売上追加用）
async function updateTransactionPaymentMethodSelect() {
  try {
    const paymentMethods = await getPaymentMethods();
    const select = document.getElementById('transactionPaymentMethod');
    select.innerHTML = '<option value="">支払い方法を選択</option>';
    paymentMethods.forEach((method) => {
      const option = document.createElement('option');
      option.value = method.id;
      option.textContent = method.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    showError('支払い方法の取得に失敗しました');
  }
}

// 手動で売上を追加するフォームのイベントリスナー
document.getElementById('addTransactionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const totalAmount = parseFloat(document.getElementById('transactionTotalAmount').value);
  const paymentMethodId = document.getElementById('transactionPaymentMethod').value;
  if (!paymentMethodId || isNaN(totalAmount) || totalAmount <= 0) {
    showError('有効な合計金額と支払い方法を入力してください');
    return;
  }
  try {
    // 支払い方法情報の取得
    const paymentMethods = await getPaymentMethods();
    const paymentMethod = paymentMethods.find((method) => method.id === paymentMethodId);
    if (!paymentMethod) {
      showError('無効な支払い方法です');
      return;
    }
    const feeRate = paymentMethod.feeRate;

    // 手数料の計算
    const feeAmount = parseFloat((totalAmount * feeRate / 100).toFixed(2));
    const netAmount = parseFloat((totalAmount - feeAmount).toFixed(2));

    // 販売データの作成（手動入力なので items は空）
    const transactionData = {
      timestamp: new Date(),
      totalAmount: totalAmount,
      feeAmount: feeAmount,
      netAmount: netAmount,
      paymentMethodId: paymentMethodId,
      paymentMethodName: paymentMethod.name,
      items: [], // 手動追加の場合、商品明細は無し
      manuallyAdded: true, // 手動追加フラグ
      cost: 0,
      profit: netAmount,
    };

    // 取引の保存
    await addTransaction(transactionData);

    // フォームをクリアして非表示に
    document.getElementById('addTransactionForm').reset();
    document.getElementById('manualAddTransactionForm').style.display = 'none';

    alert('売上が手動で追加されました');
    // 売上管理セクションを更新
    await displayTransactions();
  } catch (error) {
    console.error(error);
    showError('売上の追加に失敗しました');
  }
});

// 月次・年次フィルタの実装
document.getElementById('filterTransactionsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const month = parseInt(document.getElementById('filterMonth').value, 10);
  const year = parseInt(document.getElementById('filterYear').value, 10);
  const onlyReturned = document.getElementById('filterOnlyReturned').checked;

  const filter = {};
  if (!isNaN(month)) {
    filter.month = month;
  }
  if (!isNaN(year)) {
    filter.year = year;
  }
  filter.onlyReturned = onlyReturned;

  await displayTransactions(filter);
});

// 初期化処理
window.addEventListener('DOMContentLoaded', async () => {
  await displayTransactions(); // 売上管理セクションの初期表示
  await displayPaymentMethods();
  await updatePaymentMethodSelect();
});
