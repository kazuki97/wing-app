// eventListeners.js（続き）

import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from './products.js';

// 商品追加フォームのイベントリスナー
document
  .getElementById('addProductForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    // フォームから商品情報を取得
    const productData = {
      name: document.getElementById('productName').value,
      parentCategoryId: document.getElementById('productParentCategory').value,
      subcategoryId: document.getElementById('productSubcategory').value,
      price: parseFloat(document.getElementById('productPrice').value),
      cost: parseFloat(document.getElementById('productCost').value),
      barcode: document.getElementById('productBarcode').value,
      size: parseFloat(document.getElementById('productSize').value),
      unit: document.getElementById('productUnit').value,
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
    const parentCategoryId = document.getElementById('filterParentCategory').value;
    const subcategoryId = document.getElementById('filterSubcategory').value;
    const products = await getProducts(parentCategoryId, subcategoryId);
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    products.forEach((product) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${product.name} - 価格: ${product.price}`;
      // 編集ボタン
      const editButton = document.createElement('button');
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
        // 編集フォームを表示またはモーダルを開く
        editProduct(product);
      });
      // 削除ボタン
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', () => {
        if (confirm('本当に削除しますか？')) {
          deleteProduct(product.id)
            .then(() => {
              alert('商品が削除されました');
              displayProducts();
            })
            .catch((error) => {
              console.error(error);
              showError('商品の削除に失敗しました');
            });
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
  // 編集用のフォームを作成またはモーダルを表示
  const newName = prompt('新しい商品名を入力してください', product.name);
  if (newName !== null) {
    const updatedData = { name: newName };
    updateProduct(product.id, updatedData)
      .then(() => {
        alert('商品が更新されました');
        displayProducts();
      })
      .catch((error) => {
        console.error(error);
        showError('商品の更新に失敗しました');
      });
  }
}

// 商品フィルタリング用のセレクトボックスの更新
async function updateFilterParentCategorySelect() {
  try {
    const parentCategories = await getParentCategories();
    const select = document.getElementById('filterParentCategory');
    select.innerHTML = '<option value="">すべての親カテゴリ</option>';
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

// 商品フィルタリング用のサブカテゴリセレクトボックスの更新
document
  .getElementById('filterParentCategory')
  .addEventListener('change', async () => {
    const parentCategoryId = document.getElementById('filterParentCategory').value;
    await updateFilterSubcategorySelect(parentCategoryId);
    await displayProducts();
  });

async function updateFilterSubcategorySelect(parentCategoryId) {
  try {
    const subcategories = await getSubcategories(parentCategoryId);
    const select = document.getElementById('filterSubcategory');
    select.innerHTML = '<option value="">すべてのサブカテゴリ</option>';
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

// 商品フィルタリングセレクトボックスの変更時に商品一覧を更新
document
  .getElementById('filterSubcategory')
  .addEventListener('change', async () => {
    await displayProducts();
  });

// 初期化処理に追加
window.addEventListener('DOMContentLoaded', async () => {
  await updateProductParentCategorySelect();
  await updateFilterParentCategorySelect();
  await updateFilterSubcategorySelect();
  await displayProducts();
});

// 商品追加フォームの親カテゴリセレクトボックスの更新
async function updateProductParentCategorySelect() {
  try {
    const parentCategories = await getParentCategories();
    const select = document.getElementById('productParentCategory');
    select.innerHTML = '';
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

// 商品追加フォームのサブカテゴリセレクトボックスの更新
document
  .getElementById('productParentCategory')
  .addEventListener('change', async () => {
    const parentCategoryId = document.getElementById('productParentCategory').value;
    await updateProductSubcategorySelect(parentCategoryId);
  });

async function updateProductSubcategorySelect(parentCategoryId) {
  try {
    const subcategories = await getSubcategories(parentCategoryId);
    const select = document.getElementById('productSubcategory');
    select.innerHTML = '';
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
