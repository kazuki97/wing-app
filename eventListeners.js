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
      await updateParentCategorySelect();
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
    const parentCategoryId = document.getElementById('parentCategorySelect').value;
    const name = document.getElementById('subcategoryName').value;
    try {
      await addSubcategory(name, parentCategoryId);
      document.getElementById('subcategoryName').value = '';
      await displaySubcategories(parentCategoryId);
      alert('サブカテゴリが追加されました');
    } catch (error) {
      console.error(error);
      showError('サブカテゴリの追加に失敗しました');
    }
  });

// 親カテゴリセレクトボックスの更新関数
async function updateParentCategorySelect() {
  try {
    const parentCategories = await getParentCategories();
    const selectElements = document.querySelectorAll('.parentCategorySelect');
    selectElements.forEach((select) => {
      select.innerHTML = '';
      parentCategories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
      });
    });
  } catch (error) {
    console.error(error);
    showError('親カテゴリの取得に失敗しました');
  }
}

// 親カテゴリ一覧の表示
async function displayParentCategories() {
  try {
    const parentCategories = await getParentCategories();
    const parentCategoryList = document.getElementById('parentCategoryList');
    parentCategoryList.innerHTML = '';
    parentCategories.forEach((category) => {
      const listItem = document.createElement('li');
      listItem.textContent = category.name;
      // 編集ボタン
      const editButton = document.createElement('button');
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
        const newName = prompt('新しいカテゴリ名を入力してください', category.name);
        if (newName) {
          updateParentCategory(category.id, newName)
            .then(() => {
              alert('親カテゴリが更新されました');
              displayParentCategories();
              updateParentCategorySelect();
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
        if (confirm('本当に削除しますか？')) {
          deleteParentCategory(category.id)
            .then(() => {
              alert('親カテゴリが削除されました');
              displayParentCategories();
              updateParentCategorySelect();
            })
            .catch((error) => {
              console.error(error);
              showError('親カテゴリの削除に失敗しました');
            });
        }
      });
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      parentCategoryList.appendChild(listItem);

      // サブカテゴリの表示
      displaySubcategories(category.id, listItem);
    });
  } catch (error) {
    console.error(error);
    showError('親カテゴリの表示に失敗しました');
  }
}

// サブカテゴリの表示
async function displaySubcategories(parentCategoryId, parentListItem) {
  try {
    const subcategories = await getSubcategories(parentCategoryId);
    const subcategoryList = document.createElement('ul');
    subcategories.forEach((subcategory) => {
      const listItem = document.createElement('li');
      listItem.textContent = subcategory.name;
      // 編集ボタン
      const editButton = document.createElement('button');
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
        const newName = prompt('新しいサブカテゴリ名を入力してください', subcategory.name);
        if (newName) {
          updateSubcategory(subcategory.id, newName)
            .then(() => {
              alert('サブカテゴリが更新されました');
              displaySubcategories(parentCategoryId, parentListItem);
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
            .then(() => {
              alert('サブカテゴリが削除されました');
              displaySubcategories(parentCategoryId, parentListItem);
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
    });
    // 既にサブカテゴリリストが存在する場合は置き換える
    const existingSubcategoryList = parentListItem.querySelector('ul');
    if (existingSubcategoryList) {
      parentListItem.replaceChild(subcategoryList, existingSubcategoryList);
    } else {
      parentListItem.appendChild(subcategoryList);
    }
  } catch (error) {
    console.error(error);
    showError('サブカテゴリの表示に失敗しました');
  }
}

// 初期化処理
window.addEventListener('DOMContentLoaded', async () => {
  await updateParentCategorySelect();
  await displayParentCategories();
});
