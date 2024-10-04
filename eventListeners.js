// eventListeners.js
import {
  addParentCategory,
  getParentCategories,
  updateParentCategory,
  deleteParentCategory,
  addSubcategory,
  getSubcategories,
  updateSubcategory,
  deleteSubcategory,
} from './categories.js';

import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
} from './products.js';

import {
  updateOverallInventory,
  getOverallInventory,
  getAllOverallInventories,
} from './inventoryManagement.js';

// エラーメッセージ表示関数
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// 親カテゴリ追加フォームのイベントリスナー
document
  .getElementById('addParentCategoryForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('parentCategoryName').value;
    try {
      await addParentCategory(name);
      document.getElementById('parentCategoryName').value = '';
      await updateAllParentCategorySelects();
      await displayParentCategories();
      alert('親カテゴリが追加されました');
    } catch (error) {
      console.error(error);
      showError('親カテゴリの追加に失敗しました');
    }
  });

// サブカテゴリ追加フォームのイベントリスナー
document
  .getElementById('addSubcategoryForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const parentCategoryId = document.getElementById('subcategoryParentCategorySelect').value;
    const name = document.getElementById('subcategoryName').value;
    try {
      await addSubcategory(name, parentCategoryId);
      document.getElementById('subcategoryName').value = '';
      await displayParentCategories();
      await updateAllParentCategorySelects();
      alert('サブカテゴリが追加されました');
    } catch (error) {
      console.error(error);
      showError('サブカテゴリの追加に失敗しました');
    }
  });

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
    const subcategories = await getSubcategories(parentCategoryId);
    const select = document.getElementById(subcategorySelectId);
    select.innerHTML = '<option value="">サブカテゴリを選択</option>';
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
['productParentCategorySelect', 'filterParentCategorySelect', 'inventoryParentCategorySelect', 'overallInventoryParentCategorySelect'].forEach((id) => {
  document.getElementById(id).addEventListener('change', async () => {
    const parentCategoryId = document.getElementById(id).value;
    const subcategorySelectId = {
      productParentCategorySelect: 'productSubcategorySelect',
      filterParentCategorySelect: 'filterSubcategorySelect',
      inventoryParentCategorySelect: 'inventorySubcategorySelect',
      overallInventoryParentCategorySelect: 'overallInventorySubcategorySelect',
    }[id];
    await updateSubcategorySelect(parentCategoryId, subcategorySelectId);
  });
});

// 親カテゴリ一覧の表示
async function displayParentCategories() {
  try {
    const parentCategories = await getParentCategories();
    const parentCategoryList = document.getElementById('parentCategoryList');
    parentCategoryList.innerHTML = '';
    for (const category of parentCategories) {
      const listItem = document.createElement('li');
      listItem.textContent = category.name;
      // 編集ボタン
      const editButton = document.createElement('button');
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
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
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', () => {
        if (confirm('本当に削除しますか？ この親カテゴリに属するサブカテゴリも削除されます。')) {
          deleteParentCategory(category.id)
            .then(async () => {
              alert('親カテゴリが削除されました');
              await displayParentCategories();
              await updateAllParentCategorySelects();
            })
            .catch((error) => {
              console.error(error);
              showError('親カテゴリの削除に失敗しました');
            });
        }
      });
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);

      // サブカテゴリの表示
      const subcategoryList = await displaySubcategories(category.id);
      listItem.appendChild(subcategoryList);

      parentCategoryList.appendChild(listItem);
    }
  } catch (error) {
    console.error(error);
    showError('親カテゴリの表示に失敗しました');
  }
}

// サブカテゴリの表示
async function displaySubcategories(parentCategoryId) {
  try {
    const subcategories = await getSubcategories(parentCategoryId);
    const subcategoryList = document.createElement('ul');
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
      deleteButton.addEventListener('click', () => {
        if (confirm('本当に削除しますか？')) {
          deleteSubcategory(subcategory.id)
            .then(async () => {
              alert('サブカテゴリが削除されました');
              await displayParentCategories();
              await updateAllParentCategorySelects();
            })
            .catch((error) => {
              console.error(error);
              showError('サブカテゴリの削除に失敗しました');
            });
        }
      });
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      subcategoryList.appendChild(listItem);
    }
    return subcategoryList;
  } catch (error) {
    console.error(error);
    showError('サブカテゴリの表示に失敗しました');
    return document.createElement('ul');
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
      quantity: parseInt(document.getElementById('productQuantity').value, 10),
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

// 商品一覧の表示
async function displayProducts() {
  try {
    const parentCategoryId = document.getElementById('filterParentCategorySelect').value;
    const subcategoryId = document.getElementById('filterSubcategorySelect').value;
    const products = await getProducts(parentCategoryId, subcategoryId);
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    products.forEach((product) => {
      const listItem = document.createElement('li');
      listItem.textContent = `
        商品名: ${product.name},
        数量: ${product.quantity || 0},
        価格: ${product.price},
        原価: ${product.cost},
        バーコード: ${product.barcode},
        サイズ: ${product.size}
      `;
      // 編集ボタン
      const editButton = document.createElement('button');
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
        editProduct(product);
      });
      // 削除ボタン
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', async () => {
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
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      productList.appendChild(listItem);
    });
  } catch (error) {
    console.error(error);
    showError('商品の表示に失敗しました');
  }
}

// 商品の編集フォーム表示関数
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
      quantity: parseInt(editForm.quantity.value, 10),
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
  // 既存の要素を編集フォームに置き換える
  const productList = document.getElementById('productList');
  productList.innerHTML = '';
  productList.appendChild(editForm);
}

// 全体在庫更新フォームのイベントリスナー
document
  .getElementById('updateOverallInventoryForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const subcategoryId = document.getElementById('overallInventorySubcategorySelect').value;
    const quantity = parseInt(document.getElementById('overallInventoryQuantity').value, 10);
    try {
      await updateOverallInventory(subcategoryId, quantity);
      alert('全体在庫が更新されました');
      await displayOverallInventory();
    } catch (error) {
      console.error(error);
      showError('全体在庫の更新に失敗しました');
    }
  });

// 全体在庫の表示
async function displayOverallInventory() {
  try {
    const overallInventories = await getAllOverallInventories();
    const overallInventoryList = document.getElementById('overallInventoryList').querySelector('tbody');
    overallInventoryList.innerHTML = '';
    for (const inventory of overallInventories) {
      const subcategory = await getSubcategoryById(inventory.id);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${subcategory.name}</td>
        <td>${inventory.quantity || 0}</td>
      `;
      overallInventoryList.appendChild(row);
    }
  } catch (error) {
    console.error(error);
    showError('全体在庫の表示に失敗しました');
  }
}

// サブカテゴリIDからサブカテゴリ情報を取得
async function getSubcategoryById(subcategoryId) {
  try {
    const docRef = doc(db, 'subcategories', subcategoryId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error('サブカテゴリが見つかりません');
      return null;
    }
  } catch (error) {
    console.error('サブカテゴリの取得エラー:', error);
    throw error;
  }
}

// 初期化処理
window.addEventListener('DOMContentLoaded', async () => {
  await updateAllParentCategorySelects();
  await displayParentCategories();
  await displayProducts();
  await displayOverallInventory();
});
