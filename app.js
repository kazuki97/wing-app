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
const auth = firebase.auth();
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const togglePasswordButton = document.getElementById('toggle-password');
    const loadingOverlay = document.getElementById('loading-overlay');

    // ログイン機能
    loginButton.addEventListener('click', attemptLogin);
    console.log("Login button event listener added");

    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') attemptLogin();
    });

    togglePasswordButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    function attemptLogin() {
        console.log("Login attempt started");
        const password = passwordInput.value;
        if (password === 'wing99kk') {  // パスワードを「wing99kk」に設定
            showLoading();
            // ここでFirebase Authenticationを使用してログインを行う
            auth.signInAnonymously()
                .then(() => {
                    console.log("Login successful");
                    loginScreen.style.display = 'none';
                    appContent.style.display = 'flex';
                    hideLoading();
                    initializeApp();
                })
                .catch((error) => {
                    console.error("Login failed", error);
                    alert('ログインに失敗しました。もう一度お試しください。');
                    hideLoading();
                });
        } else {
            alert('パスワードが正しくありません。');
            console.log("Login failed");
        }
    }

    function initializeApp() {
        console.log("Initializing app");
        setupNavigation();
        loadCategories();
        loadProducts();
        loadInventory();
    }

    function setupNavigation() {
        const sideMenu = document.getElementById('side-menu');
        const views = document.querySelectorAll('.view');
        sideMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const targetView = e.target.getAttribute('data-view');
                showView(targetView);
            }
        });

        function showView(viewId) {
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(`${viewId}-view`).classList.add('active');
        }
    }

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }
// ... (前半部分の続き)

    // カテゴリ関連の機能
    async function loadCategories() {
        showLoading();
        try {
            const snapshot = await database.ref('categories').once('value');
            const categories = snapshot.val() || {};
            updateCategoryList(categories);
            updateCategoryFilter(categories);
        } catch (error) {
            console.error('カテゴリの読み込みに失敗しました:', error);
            alert('カテゴリの読み込みに失敗しました。');
        } finally {
            hideLoading();
        }
    }

    function updateCategoryList(categories) {
        const categoryList = document.getElementById('category-list');
        if (!categoryList) return;
        categoryList.innerHTML = '';
        for (const [id, name] of Object.entries(categories)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${name}</td>
                <td>
                    <button onclick="editCategory('${id}')" class="action-button"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteCategory('${id}')" class="action-button"><i class="fas fa-trash"></i></button>
                </td>
            `;
            categoryList.appendChild(row);
        }
    }

    function updateCategoryFilter(categories) {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;
        categoryFilter.innerHTML = '<option value="all">すべてのカテゴリ</option>';
        for (const category of Object.values(categories)) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    }

    window.addCategory = async function(name) {
        showLoading();
        try {
            await database.ref('categories').push().set(name);
            alert('カテゴリを追加しました。');
            loadCategories();
        } catch (error) {
            console.error('カテゴリの追加に失敗しました:', error);
            alert('カテゴリの追加に失敗しました。');
        } finally {
            hideLoading();
        }
    }

    window.editCategory = async function(id) {
        const newName = prompt('新しいカテゴリ名を入力してください:');
        if (newName) {
            showLoading();
            try {
                await database.ref(`categories/${id}`).set(newName);
                alert('カテゴリを更新しました。');
                loadCategories();
            } catch (error) {
                console.error('カテゴリの更新に失敗しました:', error);
                alert('カテゴリの更新に失敗しました。');
            } finally {
                hideLoading();
            }
        }
    }

    window.deleteCategory = async function(id) {
        if (confirm('このカテゴリを削除してもよろしいですか？')) {
            showLoading();
            try {
                await database.ref(`categories/${id}`).remove();
                alert('カテゴリを削除しました。');
                loadCategories();
            } catch (error) {
                console.error('カテゴリの削除に失敗しました:', error);
                alert('カテゴリの削除に失敗しました。');
            } finally {
                hideLoading();
            }
        }
    }

    // 商品関連の機能
    async function loadProducts() {
        showLoading();
        try {
            const snapshot = await database.ref('products').once('value');
            const products = snapshot.val() || {};
            updateProductList(products);
        } catch (error) {
            console.error('商品の読み込みに失敗しました:', error);
            alert('商品の読み込みに失敗しました。');
        } finally {
            hideLoading();
        }
    }

    function updateProductList(products) {
        const productList = document.getElementById('product-list');
        if (!productList) return;
        productList.innerHTML = '';
        for (const [id, product] of Object.entries(products)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>
                    <button onclick="editProduct('${id}')" class="action-button"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProduct('${id}')" class="action-button"><i class="fas fa-trash"></i></button>
                </td>
            `;
            productList.appendChild(row);
        }
    }

    window.addProduct = async function(name, category) {
        showLoading();
        try {
            await database.ref('products').push().set({ name, category });
            alert('商品を追加しました。');
            loadProducts();
        } catch (error) {
            console.error('商品の追加に失敗しました:', error);
            alert('商品の追加に失敗しました。');
        } finally {
            hideLoading();
        }
    }

    window.editProduct = async function(id) {
        const product = (await database.ref(`products/${id}`).once('value')).val();
        const newName = prompt('新しい商品名を入力してください:', product.name);
        const newCategory = prompt('新しいカテゴリを入力してください:', product.category);
        if (newName && newCategory) {
            showLoading();
            try {
                await database.ref(`products/${id}`).update({ name: newName, category: newCategory });
                alert('商品を更新しました。');
                loadProducts();
            } catch (error) {
                console.error('商品の更新に失敗しました:', error);
                alert('商品の更新に失敗しました。');
            } finally {
                hideLoading();
            }
        }
    }

    window.deleteProduct = async function(id) {
        if (confirm('この商品を削除してもよろしいですか？')) {
            showLoading();
            try {
                await database.ref(`products/${id}`).remove();
                alert('商品を削除しました。');
                loadProducts();
            } catch (error) {
                console.error('商品の削除に失敗しました:', error);
                alert('商品の削除に失敗しました。');
            } finally {
                hideLoading();
            }
        }
    }

    // 在庫管理関連の機能
    async function loadInventory() {
        showLoading();
        try {
            const snapshot = await database.ref('inventory').once('value');
            const inventory = snapshot.val() || {};
            updateInventoryList(inventory);
        } catch (error) {
            console.error('在庫の読み込みに失敗しました:', error);
            alert('在庫の読み込みに失敗しました。');
        } finally {
            hideLoading();
        }
    }

    function updateInventoryList(inventory) {
        const inventoryList = document.getElementById('inventory-list');
        if (!inventoryList) return;
        inventoryList.innerHTML = '';
        for (const [id, item] of Object.entries(inventory)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>
                    <button onclick="editInventoryItem('${id}')" class="action-button"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteInventoryItem('${id}')" class="action-button"><i class="fas fa-trash"></i></button>
                </td>
            `;
            inventoryList.appendChild(row);
        }
    }

    window.addInventoryItem = async function(name, category, quantity) {
        showLoading();
        try {
            await database.ref('inventory').push().set({ name, category, quantity: parseInt(quantity) });
            alert('在庫項目を追加しました。');
            loadInventory();
        } catch (error) {
            console.error('在庫項目の追加に失敗しました:', error);
            alert('在庫項目の追加に失敗しました。');
        } finally {
            hideLoading();
        }
    }

    window.editInventoryItem = async function(id) {
        const item = (await database.ref(`inventory/${id}`).once('value')).val();
        const newName = prompt('新しい商品名を入力してください:', item.name);
        const newCategory = prompt('新しいカテゴリを入力してください:', item.category);
        const newQuantity = prompt('新しい数量を入力してください:', item.quantity);
        if (newName && newCategory && newQuantity) {
            showLoading();
            try {
                await database.ref(`inventory/${id}`).update({
                    name: newName,
                    category: newCategory,
                    quantity: parseInt(newQuantity)
                });
                alert('在庫項目を更新しました。');
                loadInventory();
            } catch (error) {
                console.error('在庫項目の更新に失敗しました:', error);
                alert('在庫項目の更新に失敗しました。');
            } finally {
                hideLoading();
            }
        }
    }

    window.deleteInventoryItem = async function(id) {
        if (confirm('この在庫項目を削除してもよろしいですか？')) {
            showLoading();
            try {
                await database.ref(`inventory/${id}`).remove();
                alert('在庫項目を削除しました。');
                loadInventory();
            } catch (error) {
                console.error('在庫項目の削除に失敗しました:', error);
                alert('在庫項目の削除に失敗しました。');
            } finally {
                hideLoading();
            }
        }
    }

    // アプリケーションの初期化
    initializeApp();
});
