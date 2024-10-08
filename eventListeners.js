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
  deleteOverallInventory,
} from './inventoryManagement.js';

import {
  addPricingRule,
  getPricingRules,
  deletePricingRule,
  getUnitPrice,
} from './pricing.js';

import {
  addConsumable,
  getConsumableById,
  getConsumables,
  updateConsumable,
  deleteConsumable,
} from './consumables.js';

import { addTransaction, getTransactions } from './transactions.js';
const Chart = window.Chart;

import { getDoc } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// 追加: updatePricingParentCategorySelectの定義
async function updatePricingParentCategorySelect() {
  try {
    const parentCategories = await getParentCategories();
    const select = document.getElementById('pricingParentCategorySelect');
    select.innerHTML = '<option value="">親カテゴリを選択</option>';
    parentCategories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    showError('親カテゴリの取得に失敗しました');
  }
}

// エラーメッセージ表示関数
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// モーダルの表示と非表示の制御関数
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'none';
}

// カテゴリ追加モーダルのイベントリスナー
function addCategoryModalListener() {
  document.getElementById('addParentCategoryButton').addEventListener('click', () => {
    openModal('addParentCategoryModal');
  });
  document.getElementById('closeParentCategoryModal').addEventListener('click', () => {
    closeModal('addParentCategoryModal');
  });
  document.getElementById('addSubcategoryButton').addEventListener('click', () => {
    openModal('addSubcategoryModal');
  });
  document.getElementById('closeSubcategoryModal').addEventListener('click', () => {
    closeModal('addSubcategoryModal');
  });
}

// 消耗品追加フォームのイベントリスナー
document
  .getElementById('addConsumableForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('consumableName').value;
    const cost = parseFloat(document.getElementById('consumableCost').value);
    const barcode = document.getElementById('consumableBarcode').value || null;
    try {
      await addConsumable({ name, cost, barcode });
      document.getElementById('addConsumableForm').reset();
      alert('消耗品が追加されました');
      await displayConsumables();
      await updateAllConsumableSelectOptions(); // 追加: 消耗品リストの更新
    } catch (error) {
      console.error(error);
      showError('消耗品の追加に失敗しました');
    }
  });

// 消耗品一覧の表示
async function displayConsumables() {
  try {
    const consumables = await getConsumables();
    console.log('取得した消耗品:', consumables); // デバッグ用
    const consumableList = document.getElementById('consumableList');
    consumableList.innerHTML = '';
    consumables.forEach((consumable) => {
      const listItem = document.createElement('li');
      listItem.textContent = `消耗品名: ${consumable.name}, 原価: ${consumable.cost}, バーコード: ${consumable.barcode || 'なし'}`;
      // 編集ボタン
      const editButton = document.createElement('button');
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
        editConsumable(consumable);
      });
      // 削除ボタン
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', async () => {
        if (confirm('本当に削除しますか？')) {
          try {
            await deleteConsumable(consumable.id);
            alert('消耗品が削除されました');
            await displayConsumables();
            await updateAllConsumableSelectOptions(); // 追加: 消耗品リストの更新
          } catch (error) {
            console.error(error);
            showError('消耗品の削除に失敗しました');
          }
        }
      });
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      consumableList.appendChild(listItem);
    });
  } catch (error) {
    console.error(error);
    showError('消耗品の表示に失敗しました');
  }
}

// 消耗品の編集フォーム表示関数
function editConsumable(consumable) {
  // 編集用のフォームを作成
  const editForm = document.createElement('form');
  editForm.innerHTML = `
    <input type="text" name="name" value="${consumable.name}" required />
    <input type="number" name="cost" value="${consumable.cost}" required step="any" min="0" />
    <input type="text" name="barcode" value="${consumable.barcode || ''}" />
    <button type="submit">更新</button>
    <button type="button" id="cancelEdit">キャンセル</button>
  `;
  // 編集フォームのイベントリスナー
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedData = {
      name: editForm.name.value,
      cost: parseFloat(editForm.cost.value),
      barcode: editForm.barcode.value || null,
    };
    try {
      await updateConsumable(consumable.id, updatedData);
      alert('消耗品が更新されました');
      await displayConsumables();
      await updateAllConsumableSelectOptions(); // 追加: 消耗品リストの更新
    } catch (error) {
      console.error(error);
      showError('消耗品の更新に失敗しました');
    }
  });
  // キャンセルボタンのイベントリスナー
  editForm.querySelector('#cancelEdit').addEventListener('click', () => {
    editForm.remove();
    displayConsumables();
  });
  // 既存の要素を編集フォームに置き換える
  const consumableList = document.getElementById('consumableList');
  consumableList.innerHTML = '';
  consumableList.appendChild(editForm);
}

// 消耗品を設定するフォームの追加
function createAddConsumableToProductForm(product) {
  const form = document.createElement('form');
  form.innerHTML = `
    <select id="consumableSelect_${product.id}" required></select>
    <input type="number" id="consumableQuantity_${product.id}" placeholder="数量" required step="any" min="0" />
    <button type="submit">消耗品を設定</button>
  `;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const consumableId = document.getElementById(`consumableSelect_${product.id}`).value;
    const quantity = parseFloat(document.getElementById(`consumableQuantity_${product.id}`).value);
    await addConsumableToProduct(product.id, consumableId, quantity);
  });
  updateConsumableSelectOptionsForForm(`consumableSelect_${product.id}`); // ドロップダウンリストを更新
  return form;
}

// 消耗品セレクトボックスのオプションを更新する関数
async function updateConsumableSelectOptionsForForm(selectElement) {
  try {
    const consumables = await getConsumables();
    console.log('更新する消耗品リスト:', consumables); // デバッグ用
    if (selectElement) {
      selectElement.innerHTML = '<option value="">消耗品を選択</option>';
      consumables.forEach((consumable) => {
        const option = document.createElement('option');
        option.value = consumable.id;
        option.textContent = consumable.name;
        selectElement.appendChild(option);
      });
    }
  } catch (error) {
    console.error(error);
    showError('消耗品の取得に失敗しました');
  }
}

// すべての消耗品セレクトボックスのオプションを更新する関数
async function updateAllConsumableSelectOptions() {
  const selects = document.querySelectorAll('select.consumable-select');
  for (const select of selects) {
    await updateConsumableSelectOptionsForForm(select);
  }
}

// 商品一覧の表示（消耗品情報付き）
async function displayProducts() {
  try {
    const parentCategoryId = document.getElementById('filterParentCategorySelect').value;
    const subcategoryId = document.getElementById('filterSubcategorySelect').value;
    const products = await getProducts(parentCategoryId, subcategoryId);
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('product-table');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
      <th>商品名</th>
      <th>数量</th>
      <th>価格</th>
      <th>原価</th>
      <th>バーコード</th>
      <th>サイズ</th>
      <th>消耗品</th>
      <th>操作</th>
    `;
    table.appendChild(headerRow);
    for (const product of products) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.quantity || 0}</td>
        <td>${product.price}</td>
        <td>${product.cost}</td>
        <td>${product.barcode}</td>
        <td>${product.size}</td>
        <td>
          <ul>
            ${product.consumables && product.consumables.length > 0 ? (await Promise.all(product.consumables.map(async (consumableEntry) => {
              const consumable = await getConsumableById(consumableEntry.consumableId);
              return `<li>消耗品: ${consumable ? consumable.name : '不明な消耗品'}, 数量: ${consumableEntry.quantity}</li>`;
            }))).join('') : 'なし'}
          </ul>
        </td>
        <td>
          <button class="edit-button">編集</button>
          <button class="delete-button">削除</button>
        </td>
      `;
      row.querySelector('.edit-button').addEventListener('click', () => {
        editProduct(product);
      });
      row.querySelector('.delete-button').addEventListener('click', async () => {
        if (confirm('本当に削除しますか？')) {
          try {
            await deleteProduct(product.id);
            alert('商品が削除されました');
            await displayProducts();
          } catch (error) {
            console.error(error);
            showError('商品の削除に失敗しました');
          }
        }
      });
      table.appendChild(row);
    }
    productList.appendChild(table);
  } catch (error) {
    console.error(error);
    showError('商品の表示に失敗しました');
  }
}

// 複数の消耗品を商品に関連付けるフォーム作成関数
function createAddConsumablesToProductForm(product) {
  const form = document.createElement('form');
  form.innerHTML = `
    <div id="consumableEntries">
      <div class="consumable-entry">
        <select class="consumable-select" required></select>
        <input type="number" class="consumable-quantity" placeholder="数量" required step="any" min="0" />
      </div>
    </div>
    <button type="button" id="addConsumableEntry">消耗品を追加</button>
    <button type="submit">設定</button>
  `;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const consumableEntries = [];
    form.querySelectorAll('.consumable-entry').forEach((entry) => {
      const consumableId = entry.querySelector('.consumable-select').value;
      const quantity = parseFloat(entry.querySelector('.consumable-quantity').value);
      if (consumableId && quantity > 0) {
        consumableEntries.push({ consumableId, quantity });
      }
    });
    try {
      await updateProduct(product.id, { consumables: consumableEntries });
      alert('商品に消耗品が設定されました');
      await displayProducts();
    } catch (error) {
      console.error(error);
      showError('商品に消耗品を設定するのに失敗しました');
    }
  });
  // 消耗品の追加ボタンのイベントリスナー
  form.querySelector('#addConsumableEntry').addEventListener('click', () => {
    const newEntry = document.createElement('div');
    newEntry.classList.add('consumable-entry');
    newEntry.innerHTML = `
      <select class="consumable-select" required></select>
      <input type="number" class="consumable-quantity" placeholder="数量" required step="any" min="0" />
    `;
    form.querySelector('#consumableEntries').appendChild(newEntry);
    updateConsumableSelectOptionsForForm(newEntry.querySelector('.consumable-select'));
  });
  updateConsumableSelectOptionsForForm(form.querySelector('.consumable-select'));
  return form;
}

// 親カテゴリ追加フォームのイベントリスナー
async function addParentCategoryListener() {
  document.getElementById('addParentCategoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('parentCategoryName').value;
    try {
      await addParentCategory(name);
      document.getElementById('parentCategoryName').value = '';
      await updateAllParentCategorySelects();
      await displayParentCategories();
      alert('親カテゴリが追加されました');
      closeModal('addParentCategoryModal');
    } catch (error) {
      console.error(error);
      showError('親カテゴリの追加に失敗しました');
    }
  });
}

// サブカテゴリ追加フォームのイベントリスナー
async function addSubcategoryListener() {
  document.getElementById('addSubcategoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const parentCategoryId = document.getElementById('subcategoryParentCategorySelect').value;
    const name = document.getElementById('subcategoryName').value;
    try {
      await addSubcategory(name, parentCategoryId);
      document.getElementById('subcategoryName').value = '';
      await displayParentCategories();
      await updateAllParentCategorySelects();
      alert('サブカテゴリが追加されました');
      closeModal('addSubcategoryModal');
    } catch (error) {
      console.error(error);
      showError('サブカテゴリの追加に失敗しました');
    }
  });
}

// 親カテゴリセレクトボックスの更新（全てのセレクトボックスを更新）
async function updateAllParentCategorySelects() {
  try {
    const parentCategories = await getParentCategories();
    // 親カテゴリセレクトボックスのID一覧
    const selectIds = [
      'subcategoryParentCategorySelect',
      'productParentCategorySelect',
      'filterParentCategorySelect',
      'inventoryParentCategorySelect',
      'overallInventoryParentCategorySelect',
      'pricingParentCategorySelect',
    ];
    selectIds.forEach((id) => {
      const select = document.getElementById(id);
      const selectedValue = select.value;
      select.innerHTML = '<option value="">親カテゴリを選択</option>';
      parentCategories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
      });
      // 以前選択されていた値を再設定
      if (selectedValue) {
        select.value = selectedValue;
      }
    });
    // サブカテゴリセレクトボックスの更新
    await updateSubcategorySelects();
  } catch (error) {
    console.error(error);
    showError('親カテゴリの取得に失敗しました');
  }
}

// サブカテゴリセレクトボックスの更新
async function updateSubcategorySelects() {
  const parentCategorySelectIds = {
    productParentCategorySelect: 'productSubcategorySelect',
    filterParentCategorySelect: 'filterSubcategorySelect',
    inventoryParentCategorySelect: 'inventorySubcategorySelect',
    overallInventoryParentCategorySelect: 'overallInventorySubcategorySelect',
    pricingParentCategorySelect: 'pricingSubcategorySelect',
  };

  for (const parentSelectId in parentCategorySelectIds) {
    const parentCategoryId = document.getElementById(parentSelectId).value;
    const subcategorySelectId = parentCategorySelectIds[parentSelectId];
    await updateSubcategorySelect(parentCategoryId, subcategorySelectId);
  }
}

// サブカテゴリセレクトボックスの個別更新関数
async function updateSubcategorySelect(parentCategoryId, subcategorySelectId) {
  try {
    const select = document.getElementById(subcategorySelectId);
    select.innerHTML = '<option value="">サブカテゴリを選択</option>';
    if (!parentCategoryId) {
      return;
    }
    const subcategories = await getSubcategories(parentCategoryId);
    subcategories.forEach((subcategory) => {
      const option = document.createElement('option');
      option.value = subcategory.id;
      option.textContent = subcategory.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    showError('サブカテゴリの取得に失敗しました');
  }
}

// 各親カテゴリセレクトボックスのイベントリスナー
['productParentCategorySelect', 'filterParentCategorySelect', 'inventoryParentCategorySelect', 'overallInventoryParentCategorySelect', 'pricingParentCategorySelect'].forEach((id) => {
  document.getElementById(id).addEventListener('change', async () => {
    const parentCategoryId = document.getElementById(id).value;
    const subcategorySelectId = {
      productParentCategorySelect: 'productSubcategorySelect',
      filterParentCategorySelect: 'filterSubcategorySelect',
      inventoryParentCategorySelect: 'inventorySubcategorySelect',
      overallInventoryParentCategorySelect: 'overallInventorySubcategorySelect',
      pricingParentCategorySelect: 'pricingSubcategorySelect',
    }[id];
    await updateSubcategorySelect(parentCategoryId, subcategorySelectId);
    // 追加: カテゴリ変更時に関連する商品や在庫情報を更新
    if (id === 'inventoryParentCategorySelect') {
      await displayInventoryProducts();
    } else if (id === 'filterParentCategorySelect') {
      await displayProducts();
    } else if (id === 'pricingParentCategorySelect') {
      await displayPricingRules();
    }
  });
});

// サブカテゴリセレクトボックスのイベントリスナー
['productSubcategorySelect', 'filterSubcategorySelect', 'inventorySubcategorySelect', 'overallInventorySubcategorySelect', 'pricingSubcategorySelect'].forEach((id) => {
  document.getElementById(id).addEventListener('change', async () => {
    if (id === 'inventorySubcategorySelect') {
      await displayInventoryProducts();
    } else if (id === 'filterSubcategorySelect') {
      await displayProducts();
    } else if (id === 'pricingSubcategorySelect') {
      await displayPricingRules();
    }
  });
});

// 親カテゴリ一覧の表示
async function displayParentCategories() {
  try {
    const parentCategories = await getParentCategories();
    const parentCategoryList = document.getElementById('parentCategoryList');
    parentCategoryList.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('category-table');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
      <th>親カテゴリ名</th>
      <th>サブカテゴリ</th>
      <th>操作</th>
    `;
    table.appendChild(headerRow);
    for (const category of parentCategories) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${category.name}</td>
      `;

      // サブカテゴリの表示
      const subcategoryList = await displaySubcategories(category.id);
      row.appendChild(subcategoryList);

      const actionsCell = document.createElement('td');
      actionsCell.innerHTML = `
        <button class="edit-button">編集</button>
        <button class="delete-button">削除</button>
      `;
      // 編集ボタン
      actionsCell.querySelector('.edit-button').addEventListener('click', () => {
        const newName = prompt('新しいカテゴリ名を入力してください', category.name);
        if (newName) {
          updateParentCategory(category.id, newName)
            .then(async () => {
              alert('親カテゴリが更新されました');
              await displayParentCategories();
              await updateAllParentCategorySelects();
            })
            .catch((error) => {
              console.error(error);
              showError('親カテゴリの更新に失敗しました');
            });
        }
      });
      // 削除ボタン
      actionsCell.querySelector('.delete-button').addEventListener('click', async () => {
        if (confirm('本当に削除しますか？ この親カテゴリに属するサブカテゴリも削除されます。')) {
          try {
            await deleteParentCategory(category.id);
            alert('親カテゴリが削除されました');
            await displayParentCategories();
            await updateAllParentCategorySelects();
          } catch (error) {
            console.error(error);
            showError('親カテゴリの削除に失敗しました');
          }
        }
      });

      row.appendChild(actionsCell);
      table.appendChild(row);
    }
    parentCategoryList.appendChild(table);
  } catch (error) {
    console.error(error);
    showError('親カテゴリの表示に失敗しました');
  }
}

// サブカテゴリの表示
async function displaySubcategories(parentCategoryId) {
  try {
    const subcategories = await getSubcategories(parentCategoryId);
    const subcategoryList = document.createElement('td');
    const ul = document.createElement('ul');
    for (const subcategory of subcategories) {
      const listItem = document.createElement('li');
      listItem.textContent = subcategory.name;
      // 編集ボタン
      const editButton = document.createElement('button');
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
        const newName = prompt('新しいサブカテゴリ名を入力してください', subcategory.name);
        if (newName) {
          updateSubcategory(subcategory.id, newName)
            .then(async () => {
              alert('サブカテゴリが更新されました');
              await displayParentCategories();
              await updateAllParentCategorySelects();
            })
            .catch((error) => {
              console.error(error);
              showError('サブカテゴリの更新に失敗しました');
            });
        }
      });
      // 削除ボタン
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', async () => {
        if (confirm('本当に削除しますか？')) {
          try {
            await deleteSubcategory(subcategory.id);
            alert('サブカテゴリが削除されました');
            await displayParentCategories();
            await updateAllParentCategorySelects();
          } catch (error) {
            console.error(error);
            showError('サブカテゴリの削除に失敗しました');
          }
        }
      });
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      ul.appendChild(listItem);
    }
    subcategoryList.appendChild(ul);
    return subcategoryList;
  } catch (error) {
    console.error(error);
    showError('サブカテゴリの表示に失敗しました');
    return document.createElement('td');
  }
}

// 商品追加フォームのイベントリスナー
document
  .getElementById('addProductForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    // フォームから商品情報を取得
    const productData = {
      name: document.getElementById('productName').value,
      parentCategoryId: document.getElementById('productParentCategorySelect').value,
      subcategoryId: document.getElementById('productSubcategorySelect').value,
      price: parseFloat(document.getElementById('productPrice').value),
      cost: parseFloat(document.getElementById('productCost').value),
      barcode: document.getElementById('productBarcode').value,
      quantity: parseFloat(document.getElementById('productQuantity').value),
      size: parseFloat(document.getElementById('productSize').value),
    };
    try {
      await addProduct(productData);
      // フォームをリセット
      document.getElementById('addProductForm').reset();
      alert('商品が追加されました');
      await displayProducts();
    } catch (error) {
      console.error(error);
      showError('商品の追加に失敗しました');
    }
  });

// 商品の編集フォーム表示関数に消耗品設定機能を追加
function editProduct(product) {
  // 編集用のフォームを作成
  const editForm = document.createElement('form');
  editForm.innerHTML = `
    <input type="text" name="name" value="${product.name}" required />
    <input type="number" name="price" value="${product.price}" required />
    <input type="number" name="cost" value="${product.cost}" required />
    <input type="text" name="barcode" value="${product.barcode}" />
    <input type="number" name="quantity" value="${product.quantity}" required />
    <input type="number" name="size" value="${product.size}" required />
    <button type="submit">更新</button>
    <button type="button" id="cancelEdit">キャンセル</button>
  `;
  // 編集フォームのイベントリスナー
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedData = {
      name: editForm.name.value,
      price: parseFloat(editForm.price.value),
      cost: parseFloat(editForm.cost.value),
      barcode: editForm.barcode.value,
      quantity: parseFloat(editForm.quantity.value),
      size: parseFloat(editForm.size.value),
    };
    try {
      await updateProduct(product.id, updatedData);
      alert('商品が更新されました');
      await displayProducts();
    } catch (error) {
      console.error(error);
      showError('商品の更新に失敗しました');
    }
  });
  // キャンセルボタンのイベントリスナー
  editForm.querySelector('#cancelEdit').addEventListener('click', () => {
    editForm.remove();
    displayProducts();
  });
  // 消耗品設定フォームを追加
  const consumableForm = createAddConsumablesToProductForm(product);
  editForm.appendChild(consumableForm);
  // 既存の要素を編集フォームに置き換える
  const productList = document.getElementById('productList');
  productList.innerHTML = '';
  productList.appendChild(editForm);
}

// 関数のエクスポートに displayProducts を追加
export {
  updatePricingParentCategorySelect,
  showError,
  displayConsumables,
  editConsumable,
  createAddConsumablesToProductForm,
  updateConsumableSelectOptionsForForm,
  updateAllConsumableSelectOptions,
  displayProducts,
};

// 新規商品追加時にも消耗品を設定するフォームの追加
async function createNewProductForm() {
  const form = document.getElementById('addProductForm');
  const consumableForm = createAddConsumablesToProductForm({ id: 'new' });
  form.appendChild(consumableForm);
  await updateConsumableSelectOptionsForForm(consumableForm.querySelector('.consumable-select'));
}
createNewProductForm();

// 在庫管理セクションの商品一覧表示関数
async function displayInventoryProducts() {
  try {
    const parentCategoryId = document.getElementById('inventoryParentCategorySelect').value;
    const subcategoryId = document.getElementById('inventorySubcategorySelect').value;
    const products = await getProducts(parentCategoryId, subcategoryId);
    const inventoryList = document.getElementById('inventoryList').querySelector('tbody');
    inventoryList.innerHTML = '';
    for (const product of products) {
      const row = document.createElement('tr');
     row.innerHTML = `
  <td>${product.name}</td>
  <td><input type="number" value="${product.quantity || 0}" data-product-id="${product.id}" class="inventory-quantity" /></td>
  <td>${product.price}</td>
  <td>${product.cost}</td>
  <td>${product.barcode}</td>
  <td>${product.size}</td>
  <td><button class="update-inventory">更新</button><button class="delete-inventory" data-id="${product.id}">削除</button></td>
`;
      inventoryList.appendChild(row);
    }
    // 在庫数更新ボタンのイベントリスナー
    document.querySelectorAll('.update-inventory').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        const productId = row.querySelector('.inventory-quantity').dataset.productId;
        const quantity = parseFloat(row.querySelector('.inventory-quantity').value);
        try {
          await updateProductQuantity(productId, quantity);
          alert('在庫数が更新されました');
          await displayInventoryProducts();
        } catch (error) {
          console.error(error);
          showError('在庫数の更新に失敗しました');
        }
      });
    });
  } catch (error) {
    console.error(error);
    showError('在庫情報の表示に失敗しました');
  }
}

// 販売完了後に全体在庫を更新する関数
// 修正しました: 販売完了後に全体在庫を減少させる関数を追加
async function updateOverallInventoryAfterSale(productId, quantitySold) {
  try {
    await updateOverallInventory(productId, -quantitySold);
  } catch (error) {
    console.error('全体在庫の更新エラー:', error);
    showError('全体在庫の更新に失敗しました');
  }
}

// 全体在庫更新フォームのイベントリスナー
document
  .getElementById('updateOverallInventoryForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const subcategoryId = document.getElementById('overallInventorySubcategorySelect').value;
    const quantity = parseFloat(document.getElementById('overallInventoryQuantity').value);
    try {
      await updateOverallInventory(subcategoryId, quantity);
      alert('全体在庫が更新されました');
      await displayOverallInventory();
    } catch (error) {
      console.error(error);
      showError('全体在庫の更新に失敗しました');
    }
  });

// 全体在庫の在庫数を手動で更新する関数
async function updateOverallInventoryQuantity(subcategoryId, newQuantity) {
  try {
    await updateOverallInventory(subcategoryId, newQuantity);
    alert('全体在庫が更新されました');
    // 更新後の在庫数を表示
    await displayOverallInventory();
  } catch (error) {
    console.error('全体在庫の更新に失敗しました:', error);
    showError('全体在庫の更新に失敗しました');
  }
}

// 全体在庫の在庫数を表示する関数
async function displayOverallInventory() {
  try {
    const overallInventories = await getAllOverallInventories();
    const inventoryTable = document.getElementById('overallInventoryTable').querySelector('tbody');
    inventoryTable.innerHTML = '';
    for (const inventory of overallInventories) {
      const subcategory = await getSubcategoryById(inventory.id); // サブカテゴリ名を取得
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${subcategory ? subcategory.name : '不明なサブカテゴリ'}</td>
        <td><input type="number" value="${inventory.quantity}" min="0" data-subcategory-id="${inventory.id}" class="overall-inventory-quantity" /></td>
        <td><button class="update-overall-inventory" data-subcategory-id="${inventory.id}">更新</button></td>
        <td><button class="delete-overall-inventory" data-id="${inventory.id}">削除</button></td>
      `;
      inventoryTable.appendChild(row);
    }

    // 更新ボタンのイベントリスナー
document.querySelectorAll('.update-overall-inventory').forEach((button) => {
  button.addEventListener('click', (e) => {
    const subcategoryId = e.target.dataset.subcategoryId;
    const newQuantity = parseInt(
      document.querySelector(`input[data-subcategory-id="${subcategoryId}"]`).value,
      10
    );
    updateOverallInventoryQuantity(subcategoryId, newQuantity);
  });
});

    // 削除ボタンのイベントリスナー
    document.querySelectorAll('.delete-overall-inventory').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const inventoryId = e.target.dataset.id;
        if (confirm('この全体在庫を削除しますか？')) {
          try {
            await deleteOverallInventory(inventoryId);
            alert('全体在庫が削除されました');
            await displayOverallInventory();
          } catch (error) {
            console.error(error);
            showError('全体在庫の削除に失敗しました');
          }
        }
      });
    });
  } catch (error) {
    console.error('全体在庫の表示に失敗しました:', error);
    showError('全体在庫の表示に失敗しました');
  }
}

// 単価ルール追加フォームのイベントリスナー
document
  .getElementById('addPricingRuleForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const subcategoryId = document.getElementById('pricingSubcategorySelect').value;
    const minQuantity = parseFloat(document.getElementById('minQuantity').value);
    const maxQuantity = parseFloat(document.getElementById('maxQuantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);

    if (minQuantity > maxQuantity) {
      showError('最小数量は最大数量以下である必要があります');
      return;
    }

    try {
      await addPricingRule(subcategoryId, minQuantity, maxQuantity, unitPrice);
      alert('単価ルールが追加されました');
      await displayPricingRules();
      document.getElementById('addPricingRuleForm').reset();
    } catch (error) {
      console.error(error);
      showError('単価ルールの追加に失敗しました');
    }
  });

// 単価ルールの表示
async function displayPricingRules() {
  try {
    const subcategoryId = document.getElementById('pricingSubcategorySelect').value;
    if (!subcategoryId) {
      // サブカテゴリが選択されていない場合は何もしない
      return;
    }
    const pricingRules = await getPricingRules(subcategoryId);
    const pricingRulesList = document.getElementById('pricingRulesList').querySelector('tbody');
    pricingRulesList.innerHTML = '';
    for (const rule of pricingRules) {
      const subcategory = await getSubcategoryById(rule.subcategoryId);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${subcategory ? subcategory.name : '不明なサブカテゴリ'}</td>
        <td>${rule.minQuantity}</td>
        <td>${rule.maxQuantity}</td>
        <td>${rule.unitPrice}</td>
        <td><button class="delete-pricing-rule" data-id="${rule.id}">削除</button></td>
      `;
      pricingRulesList.appendChild(row);
    }
    // 削除ボタンのイベントリスナー
    document.querySelectorAll('.delete-pricing-rule').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const ruleId = e.target.dataset.id;
        if (confirm('本当に削除しますか？')) {
          try {
            await deletePricingRule(ruleId);
            alert('単価ルールが削除されました');
            await displayPricingRules();
          } catch (error) {
            console.error(error);
            showError('単価ルールの削除に失敗しました');
          }
        }
      });
    });
  } catch (error) {
    console.error(error);
    showError('単価ルールの表示に失敗しました');
  }
}

// 単価設定セクションのサブカテゴリセレクトボックスのイベントリスナー
document.getElementById('pricingSubcategorySelect').addEventListener('change', async () => {
  await displayPricingRules();
});

// 初期化処理
window.addEventListener('DOMContentLoaded', async () => {
  await updateAllParentCategorySelects();
  await updatePricingParentCategorySelect(); // 修正：この関数を正しく呼び出す
  await displayParentCategories();
  await displayProducts();
  await displayOverallInventory();
  await displayInventoryProducts();
  await displayConsumables(); // 消耗品の一覧を表示
  addCategoryModalListener();
  addParentCategoryListener();
  addSubcategoryListener();
});

