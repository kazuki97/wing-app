// consumablesEventListeners.js

import { addConsumable, getConsumables, updateConsumable, deleteConsumable } from './consumables.js';
import { assignConsumableToProduct, getProductConsumables, deleteProductConsumable } from './productConsumables.js';
import { getProducts } from './products.js';
import { getTransactions } from './transactions.js';

// エラーメッセージ表示関数
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// 消耗品の追加
document.getElementById('addConsumableForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('consumableName').value.trim();
  const cost = parseFloat(document.getElementById('consumableCost').value);
  if (!name || isNaN(cost)) {
    showError('消耗品名と原価を正しく入力してください');
    return;
  }
  try {
    await addConsumable(name, cost);
    alert('消耗品が追加されました');
    document.getElementById('addConsumableForm').reset();
    await displayConsumables();
  } catch (error) {
    console.error(error);
    showError('消耗品の追加に失敗しました');
  }
});

// 消耗品の表示
async function displayConsumables() {
  try {
    const consumables = await getConsumables();
    const consumableList = document.getElementById('consumableList').querySelector('tbody');
    consumableList.innerHTML = '';
    consumables.forEach((consumable) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${consumable.name}</td>
        <td>${consumable.cost}</td>
        <td>
          <button class="edit-consumable" data-id="${consumable.id}">編集</button>
          <button class="delete-consumable" data-id="${consumable.id}">削除</button>
        </td>
      `;
      consumableList.appendChild(row);
    });

    // 編集ボタンのイベントリスナー
    document.querySelectorAll('.edit-consumable').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const consumable = consumables.find((c) => c.id === id);
        if (consumable) {
          const newName = prompt('新しい消耗品名を入力してください', consumable.name);
          const newCost = parseFloat(prompt('新しい原価を入力してください', consumable.cost));
          if (newName && !isNaN(newCost)) {
            try {
              await updateConsumable(id, newName, newCost);
              alert('消耗品が更新されました');
              await displayConsumables();
            } catch (error) {
              console.error(error);
              showError('消耗品の更新に失敗しました');
            }
          }
        }
      });
    });

    // 削除ボタンのイベントリスナー
    document.querySelectorAll('.delete-consumable').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('この消耗品を削除しますか？')) {
          try {
            await deleteConsumable(id);
            alert('消耗品が削除されました');
            await displayConsumables();
          } catch (error) {
            console.error(error);
            showError('消耗品の削除に失敗しました');
          }
        }
      });
    });

    // 消耗品選択セレクトボックスの更新
    const consumableSelect = document.getElementById('consumableSelect');
    consumableSelect.innerHTML = '<option value="">選択してください</option>';
    consumables.forEach((consumable) => {
      const option = document.createElement('option');
      option.value = consumable.id;
      option.textContent = consumable.name;
      consumableSelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    showError('消耗品の表示に失敗しました');
  }
}

// 商品選択セレクトボックスの更新
async function updateProductSelect() {
  try {
    const products = await getProducts();
    const productSelect = document.getElementById('productSelect');
    productSelect.innerHTML = '<option value="">選択してください</option>';
    products.forEach((product) => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = product.name;
      productSelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    showError('商品の取得に失敗しました');
  }
}

// 消耗品の割り当て
document.getElementById('assignConsumableForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const productId = document.getElementById('productSelect').value;
  const consumableId = document.getElementById('consumableSelect').value;
  const quantity = parseInt(document.getElementById('consumableQuantity').value, 10);
  if (!productId || !consumableId || isNaN(quantity) || quantity <= 0) {
    showError('正しい情報を入力してください');
    return;
  }
  try {
    await assignConsumableToProduct(productId, consumableId, quantity);
    alert('消耗品が商品に割り当てられました');
    await displayProductConsumables();
  } catch (error) {
    console.error(error);
    showError('消耗品の割り当てに失敗しました');
  }
});

// 商品ごとの消耗品の表示
async function displayProductConsumables() {
  try {
    const productConsumables = await getProductConsumables();
    const consumables = await getConsumables();
    const products = await getProducts();
    const productConsumableList = document.getElementById('productConsumableList').querySelector('tbody');
    productConsumableList.innerHTML = '';
    productConsumables.forEach((pc) => {
      const product = products.find((p) => p.id === pc.productId);
      const consumable = consumables.find((c) => c.id === pc.consumableId);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product ? product.name : '不明な商品'}</td>
        <td>${consumable ? consumable.name : '不明な消耗品'}</td>
        <td>${pc.quantity}</td>
        <td>
          <button class="delete-product-consumable" data-id="${pc.id}">削除</button>
        </td>
      `;
      productConsumableList.appendChild(row);
    });

    // 削除ボタンのイベントリスナー
    document.querySelectorAll('.delete-product-consumable').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('この割り当てを削除しますか？')) {
          try {
            await deleteProductConsumable(id);
            alert('割り当てが削除されました');
            await displayProductConsumables();
          } catch (error) {
            console.error(error);
            showError('割り当ての削除に失敗しました');
          }
        }
      });
    });
  } catch (error) {
    console.error(error);
    showError('商品ごとの消耗品の表示に失敗しました');
  }
}

// 月次消耗品集計
document.getElementById('consumableReportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const year = parseInt(document.getElementById('reportYear').value, 10);
  const month = parseInt(document.getElementById('reportMonth').value, 10);
  if (isNaN(year) || isNaN(month)) {
    showError('年と月を正しく入力してください');
    return;
  }
  try {
    const transactions = await getTransactions();
    const productConsumables = await getProductConsumables();
    const consumables = await getConsumables();

    // 対象期間の取引を抽出
    const filteredTransactions = transactions.filter((t) => {
      const date = t.timestamp.toDate();
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });

    // 消耗品の使用数を集計
    const consumableUsage = {};
    for (const transaction of filteredTransactions) {
      for (const item of transaction.items) {
        const productId = item.productId;
        const quantity = item.quantity;

        // 該当商品の消耗品を取得
        const assignedConsumables = productConsumables.filter((pc) => pc.productId === productId);
        for (const pc of assignedConsumables) {
          if (!consumableUsage[pc.consumableId]) {
            consumableUsage[pc.consumableId] = 0;
          }
          consumableUsage[pc.consumableId] += pc.quantity * quantity;
        }
      }
    }

    // 集計結果の表示
    const consumableReport = document.getElementById('consumableReport').querySelector('tbody');
    consumableReport.innerHTML = '';
    for (const consumableId in consumableUsage) {
      const consumable = consumables.find((c) => c.id === consumableId);
      const usageQuantity = consumableUsage[consumableId];
      const totalCost = usageQuantity * consumable.cost;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${consumable ? consumable.name : '不明な消耗品'}</td>
        <td>${usageQuantity}</td>
        <td>${totalCost}</td>
      `;
      consumableReport.appendChild(row);
    }
  } catch (error) {
    console.error(error);
    showError('消耗品集計に失敗しました');
  }
});

// 初期化処理
window.addEventListener('DOMContentLoaded', async () => {
  await displayConsumables();
  await updateProductSelect();
  await displayProductConsumables();
});
