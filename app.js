// カテゴリと商品のデータを保存する配列
let categories = [];
let inventory = [];

// DOM要素の取得
const categoryForm = document.getElementById('categoryForm');
const productForm = document.getElementById('productForm');
const categorySelect = document.getElementById('productCategory');
const inventoryList = document.getElementById('inventoryList');

// カテゴリフォームの送信イベント
categoryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const categoryNameInput = document.getElementById('categoryName');
    const categoryName = categoryNameInput.value.trim();
    if (categoryName && !categories.includes(categoryName)) {
        categories.push(categoryName);
        updateCategorySelect();
        categoryNameInput.value = '';
        alert('カテゴリが追加されました：' + categoryName);
    } else if (categories.includes(categoryName)) {
        alert('このカテゴリは既に存在します。');
    } else {
        alert('カテゴリ名を入力してください。');
    }
});

// 商品フォームの送信イベント
productForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const category = categorySelect.value;
    const name = document.getElementById('productName').value.trim();
    const quantity = document.getElementById('productQuantity').value;
    const unit = document.getElementById('productUnit').value;

    if (category && name && quantity && unit) {
        inventory.push({ category, name, quantity, unit });
        updateInventoryList();
        productForm.reset();
        alert('商品が追加されました。');
    } else {
        alert('全ての項目を入力してください。');
    }
});

// カテゴリ選択肢の更新
function updateCategorySelect() {
    categorySelect.innerHTML = '<option value="">カテゴリを選択</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// 在庫リストの更新
function updateInventoryList() {
    inventoryList.innerHTML = '';
    inventory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.category} - ${item.name}: ${item.quantity}${item.unit}`;
        inventoryList.appendChild(li);
    });
}

// 初期化時にカテゴリ選択肢を更新
updateCategorySelect();
