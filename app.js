// Firebase SDKの読み込みを確認
if (typeof firebase === 'undefined') {
  console.error('Firebase SDK is not loaded. Check your script tags.');
}

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyD0MKQvTt3NIL5FNLeEe6V0sWI8toTx51g",
  authDomain: "wing-3be9c.firebaseapp.com",
  databaseURL: "https://wing-3be9c-default-rtdb.firebaseio.com",
  projectId: "wing-3be9c",
  storageBucket: "wing-3be9c.appspot.com",
  messagingSenderId: "875454320750",
  appId: "1:875454320750:web:268b366e2e94aa1f05167f",
  measurementId: "G-F81ZH8X0JW"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// パスワード設定
const correctPassword = 'wing99kk';

document.addEventListener('DOMContentLoaded', function() {
    // 以下、前回のコードと同じ
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const togglePasswordButton = document.getElementById('toggle-password');
    const sideMenu = document.getElementById('side-menu');
    const views = document.querySelectorAll('.view');

    // ログイン機能
    loginButton.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') attemptLogin();
    });

    togglePasswordButton.addEventListener('click', function() {
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        this.textContent = passwordInput.type === 'password' ? '👁' : '🔒';
    });

    function attemptLogin() {
        if (passwordInput.value === correctPassword) {
            loginScreen.style.display = 'none';
            appContent.style.display = 'flex';
            initializeApp();
        } else {
            alert('パスワードが間違っています');
        }
    }

    function initializeApp() {
        setupNavigation();
        loadCategories();
        loadProducts();
        loadInventory();
    }

    function setupNavigation() {
        sideMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const targetView = e.target.getAttribute('data-view');
                showView(targetView);
            }
        });
    }

    function showView(viewId) {
        views.forEach(view => view.style.display = 'none');
        document.getElementById(`${viewId}-view`).style.display = 'block';
    }

    // カテゴリ関連の機能
    const addCategoryButton = document.getElementById('add-category-button');
    const categoryList = document.getElementById('category-list');

    addCategoryButton.addEventListener('click', function() {
        const name = prompt('新しいカテゴリ名を入力してください:');
        if (name) addCategory(name);
    });

    function loadCategories() {
        database.ref('categories').on('value', snapshot => {
            const categories = snapshot.val() || {};
            updateCategoryList(categories);
            updateCategoryFilter(categories);
        });
    }

    function updateCategoryList(categories) {
        categoryList.innerHTML = '';
        for (const [id, name] of Object.entries(categories)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${name}</td>
                <td>
                    <button onclick="editCategory('${id}')">編集</button>
                    <button onclick="deleteCategory('${id}')">削除</button>
                </td>
            `;
            categoryList.appendChild(row);
        }
    }

    function addCategory(name) {
        database.ref('categories').push().set(name);
    }

    window.editCategory = function(id) {
        const newName = prompt('新しいカテゴリ名を入力してください:');
        if (newName) database.ref(`categories/${id}`).set(newName);
    }

    window.deleteCategory = function(id) {
        if (confirm('このカテゴリを削除してもよろしいですか？')) {
            database.ref(`categories/${id}`).remove();
        }
    }

    // 商品関連の機能
    const addProductButton = document.getElementById('add-product-button');
    const productList = document.getElementById('product-list');

    addProductButton.addEventListener('click', showAddProductDialog);

    function loadProducts() {
        database.ref('products').on('value', snapshot => {
            const products = snapshot.val() || {};
            updateProductList(products);
        });
    }

    function updateProductList(products) {
        productList.innerHTML = '';
        for (const [id, product] of Object.entries(products)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>
                    <button onclick="editProduct('${id}')">編集</button>
                    <button onclick="deleteProduct('${id}')">削除</button>
                </td>
            `;
            productList.appendChild(row);
        }
    }

    function showAddProductDialog() {
        const name = prompt('商品名を入力してください:');
        const category = prompt('カテゴリを入力してください:');
        if (name && category) addProduct(name, category);
    }

    function addProduct(name, category) {
        database.ref('products').push().set({ name, category });
    }

    window.editProduct = function(id) {
        const newName = prompt('新しい商品名を入力してください:');
        const newCategory = prompt('新しいカテゴリを入力してください:');
        if (newName && newCategory) {
            database.ref(`products/${id}`).update({ name: newName, category: newCategory });
        }
    }

    window.deleteProduct = function(id) {
        if (confirm('この商品を削除してもよろしいですか？')) {
            database.ref(`products/${id}`).remove();
        }
    }

    // 在庫管理関連の機能
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const inventoryList = document.getElementById('inventory-list');

    searchInput.addEventListener('input', filterInventory);
    categoryFilter.addEventListener('change', filterInventory);

    function loadInventory() {
        database.ref('inventory').on('value', snapshot => {
            const inventory = snapshot.val() || {};
            updateInventoryList(inventory);
        });
    }

    function updateInventoryList(inventory) {
        inventoryList.innerHTML = '';
        for (const [id, item] of Object.entries(inventory)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>
                    <button onclick="editInventoryItem('${id}')">編集</button>
                    <button onclick="deleteInventoryItem('${id}')">削除</button>
                </td>
            `;
            inventoryList.appendChild(row);
        }
    }

    function filterInventory() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const rows = inventoryList.getElementsByTagName('tr');

        for (const row of rows) {
            const name = row.cells[0].textContent.toLowerCase();
            const category = row.cells[1].textContent;
            const nameMatch = name.includes(searchTerm);
            const categoryMatch = selectedCategory === 'all' || category === selectedCategory;
            row.style.display = nameMatch && categoryMatch ? '' : 'none';
        }
    }

    function updateCategoryFilter(categories) {
        categoryFilter.innerHTML = '<option value="all">すべてのカテゴリ</option>';
        for (const category of Object.values(categories)) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    }

    window.editInventoryItem = function(id) {
        const newName = prompt('新しい商品名を入力してください:');
        const newCategory = prompt('新しいカテゴリを入力してください:');
        const newQuantity = prompt('新しい在庫数を入力してください:');
        if (newName && newCategory && newQuantity) {
            database.ref(`inventory/${id}`).update({
                name: newName,
                category: newCategory,
                quantity: parseInt(newQuantity, 10)
            });
        }
    }

    window.deleteInventoryItem = function(id) {
        if (confirm('この在庫項目を削除してもよろしいですか？')) {
            database.ref(`inventory/${id}`).remove();
        }
    }
});
