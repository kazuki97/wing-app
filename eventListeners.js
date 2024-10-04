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
    ];
    selectIds.forEach((id) => {
      const select = document.getElementById(id);
      const selectedValue = select.value;
      select.innerHTML = '';
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
    // 商品追加フォームのサブカテゴリセレクトボックスを更新
    const productParentCategoryId = document.getElementById('productParentCategorySelect').value;
    await updateProductSubcategorySelect(productParentCategoryId);

    // 商品フィルタリング用のサブカテゴリセレクトボックスを更新
    const filterParentCategoryId = document.getElementById('filterParentCategorySelect').value;
    await updateFilterSubcategorySelect(filterParentCategoryId);
  } catch (error) {
    console.error(error);
    showError('親カテゴリの取得に失敗しました');
  }
}

// 商品追加フォームのサブカテゴリセレクトボックスの更新
async function updateProductSubcategorySelect(parentCategoryId) {
  try {
    const subcategories = await getSubcategories(parentCategoryId);
    const select = document.getElementById('productSubcategorySelect');
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

// 商品フィルタリング用のサブカテゴリセレクトボックスの更新
async function updateFilterSubcategorySelect(parentCategoryId) {
  try {
    const subcategories = await getSubcategories(parentCategoryId);
    const select = document.getElementById('filterSubcategorySelect');
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

// 親カテゴリ一覧の表示（既存のコードから変更なし）
async function displayParentCategories() {
  // 省略：既存のコードをそのまま使用
}

// 初期化処理
window.addEventListener('DOMContentLoaded', async () => {
  await updateAllParentCategorySelects();
  await displayParentCategories();
});
