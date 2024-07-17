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
    const categoryName = document.getElementById('categoryName').value;
    if (categoryName && !categories.includes(categoryName)) {
        categories.push(categoryName);
        updateCategorySelect();
        categoryForm.reset();
    }
});

// 商品フォームの送信イベント
productForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const category = document.getElementById('productCategory').value;
    const name = document.getElementById('productName').value;
    const quantity = document.getElementById('productQuantity').value;
    const unit = document.getElementById('productUnit').value;

    if (category && name && quantity && unit) {
        inventory.push({ category, name, quantity, unit });
        updateInventoryList();
        productForm.reset();
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
