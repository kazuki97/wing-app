// Firebase SDKの読み込みを確認
if (typeof firebase === 'undefined') {
    console.error('Firebase SDK is not loaded. Check your script tags.');
}

// Firebase設定
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const togglePasswordButton = document.getElementById('toggle-password');
    const forgotPasswordLink = document.getElementById('forgot-password');
    const sideMenu = document.getElementById('side-menu');
    const views = document.querySelectorAll('.view');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    const closeModal = document.getElementsByClassName('close')[0];
    const loadingOverlay = document.getElementById('loading-overlay');

    // ログイン機能
    loginButton.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') attemptLogin();
    });

    togglePasswordButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showPasswordResetModal();
    });

    async function attemptLogin() {
        const email = emailInput.value;
        const password = passwordInput.value;
        showLoading();
        try {
            await auth.signInWithEmailAndPassword(email, password);
            loginScreen.classList.add('hidden');
            appContent.classList.remove('hidden');
            initializeApp();
        } catch (error) {
            alert('ログインに失敗しました: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    function showPasswordResetModal() {
        showModal('パスワードリセット', `
            <input type="email" id="reset-email" placeholder="メールアドレス" required>
            <button type="submit">リセットリンクを送信</button>
        `);

        modalForm.onsubmit = async function(e) {
            e.preventDefault();
            const email = document.getElementById('reset-email').value;
            showLoading();
            try {
                await auth.sendPasswordResetEmail(email);
                alert('パスワードリセットのメールを送信しました。メールをご確認ください。');
                closeModal.click();
            } catch (error) {
                alert('パスワードリセットメールの送信に失敗しました: ' + error.message);
            } finally {
                hideLoading();
            }
        };
    }

    function initializeApp() {
        setupNavigation();
        loadCategories();
        loadProducts();
        loadInventory();
        setupChart();
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
        views.forEach(view => view.classList.remove('active'));
        document.getElementById(`${viewId}-view`).classList.add('active');
    }
// カテゴリ関連の機能
    const addCategoryButton = document.getElementById('add-category-button');
    const categoryList = document.getElementById('category-list');

    addCategoryButton.addEventListener('click', function() {
        showModal('カテゴリを追加', createCategoryForm());
    });

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

    function createCategoryForm(id = null, name = '') {
        return `
            <input type="text" id="category-name" value="${name}" placeholder="カテゴリ名" required>
            <button type="submit">${id ? '更新' : '追加'}</button>
        `;
    }

    async function addCategory(name) {
        showLoading();
        try {
            await database.ref('categories').push().set(name);
            alert('カテゴリを追加しました。');
        } catch (error) {
            console.error('カテゴリの追加に失敗しました:', error);
            alert('カテゴリの追加に失敗しました。');
        } finally {
            hideLoading();
        }
    }

    window.editCategory = async function(id) {
        showLoading();
        try {
            const snapshot = await database.ref(`categories/${id}`).once('value');
            const name = snapshot.val();
            showModal('カテゴリを編集', createCategoryForm(id, name));
        } catch (error) {
            console.error('カテゴリの編集に失敗しました:', error);
            alert('カテゴリの編集に失敗しました。');
        } finally {
            hideLoading();
        }
    }

    window.deleteCategory = async function(id) {
        if (confirm('このカテゴリを削除してもよろしいですか？')) {
            showLoading();
            try {
                await database.ref(`categories/${id}`).remove();
                alert('カテゴリを削除しました。');
            } catch (error) {
                console.error('カテゴリの削除に失敗しました:', error);
                alert('カテゴリの削除に失敗しました。');
            } finally {
                hideLoading();
            }
        }
    }

    // 商品関連の機能
    const addProductButton = document.getElementById('add-product-button');
    const productList = document.getElementById('product-list');

    addProductButton.addEventListener('click', function() {
        showModal('商品を追加', createProductForm());
    });

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

    async function createProductForm(id = null, product = { name: '', category: '' }) {
        let categoryOptions = '';
        try {
            const snapshot = await database.ref('categories').once('value');
            const categories = snapshot.val() || {};
            for (const [categoryId, categoryName] of Object.entries(categories)) {
                categoryOptions += `<option value="${categoryName}" ${product.category === categoryName ? 'selected' : ''}>${categoryName}</option>`;
            }
        } catch (error) {
            console.error('カテゴリの読み込みに失敗しました:', error);
            alert('カテゴリの読み込みに失敗しました。');
        }

        return `
            <input type="text" id="product-name" value="${product.name}" placeholder="商品名" required>
            <select id="product-category" required>
                <option value="">カテゴリを選択</option>
                ${categoryOptions}
            </select>
            <button type="submit">${id ? '更新' : '追加'}</button>
        `;
    }
async function addProduct(name, category) {
        showLoading();
        try {
            await database.ref('products').push().set({ name, category });
            alert('商品を追加しました。');
        } catch (error) {
            console.error('商品の追加に失敗しました:', error);
            alert('商品の追加に失敗しました。');
        } finally {
            hideLoading();
        }
    }

    window.editProduct = async function(id) {
        showLoading();
        try {
            const snapshot = await database.ref(`products/${id}`).once('value');
            const product = snapshot.val();
            showModal('商品を編集', await createProductForm(id, product));
        } catch (error) {
            console.error('商品の編集に失敗しました:', error);
            alert('商品の編集に失敗しました。');
        } finally {
            hideLoading();
        }
    }

    window.deleteProduct = async function(id) {
        if (confirm('この商品を削除してもよろしいですか？')) {
            showLoading();
            try {
                await database.ref(`products/${id}`).remove();
                alert('商品を削除しました。');
            } catch (error) {
                console.error('商品の削除に失敗しました:', error);
                alert('商品の削除に失敗しました。');
            } finally {
                hideLoading();
            }
        }
    }

    // 在庫管理関連の機能
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const inventoryList = document.getElementById('inventory-list');

    searchInput.addEventListener('input', filterInventory);
    categoryFilter.addEventListener('change', filterInventory);

    async function loadInventory() {
        showLoading();
        try {
            const snapshot = await database.ref('inventory').once('value');
            const inventory = snapshot.val() || {};
            updateInventoryList(inventory);
            updateChart(inventory);
        } catch (error) {
            console.error('在庫の読み込みに失敗しました:', error);
            alert('在庫の読み込みに失敗しました。');
        } finally {
            hideLoading();
        }
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
                    <button onclick="editInventoryItem('${id}')" class="action-button"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteInventoryItem('${id}')" class="action-button"><i class="fas fa-trash"></i></button>
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

    window.editInventoryItem = async function(id) {
        showLoading();
        try {
            const snapshot = await database.ref(`inventory/${id}`).once('value');
            const item = snapshot.val();
            showModal('在庫を編集', await createInventoryForm(id, item));
        } catch (error) {
            console.error('在庫項目の編集に失敗しました:', error);
            alert('在庫項目の編集に失敗しました。');
        } finally {
            hideLoading();
        }
    }

    window.deleteInventoryItem = async function(id) {
        if (confirm('この在庫項目を削除してもよろしいですか？')) {
            showLoading();
            try {
                await database.ref(`inventory/${id}`).remove();
                alert('在庫項目を削除しました。');
            } catch (error) {
                console.error('在庫項目の削除に失敗しました:', error);
                alert('在庫項目の削除に失敗しました。');
            } finally {
                hideLoading();
            }
        }
    }

    async function createInventoryForm(id = null, item = { name: '', category: '', quantity: '' }) {
        let productOptions = '';
        try {
            const snapshot = await database.ref('products').once('value');
            const products = snapshot.val() || {};
            for (const [productId, product] of Object.entries(products)) {
                productOptions += `<option value="${product.name}" data-category="${product.category}" ${item.name === product.name ? 'selected' : ''}>${product.name}</option>`;
            }
        } catch (error) {
            console.error('商品の読み込みに失敗しました:', error);
            alert('商品の読み込みに失敗しました。');
        }

        return `
            <select id="inventory-product" required>
                <option value="">商品を選択</option>
                ${productOptions}
            </select>
            <input type="number" id="inventory-quantity" value="${item.quantity}" placeholder="数量" required>
            <button type="submit">${id ? '更新' : '追加'}</button>
        `;
    }

    // モーダル関連の機能
    function showModal(title, content) {
        modalTitle.textContent = title;
        modalForm.innerHTML = content;
        modal.style.display = 'block';

        modalForm.onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(modalForm);
            const data = Object.fromEntries(formData.entries());

            showLoading();
            try {
                if (title.includes('カテゴリ')) {
                    if (title.includes('編集')) {
                        const id = modalForm.getAttribute('data-id');
                        await database.ref(`categories/${id}`).set(data['category-name']);
                    } else {
                        await addCategory(data['category-name']);
                    }
                } else if (title.includes('商品')) {
                    if (title.includes('編集')) {
                        const id = modalForm.getAttribute('data-id');
                        await database.ref(`products/${id}`).update(data);
                    } else {
                        await addProduct(data['product-name'], data['product-category']);
                    }
                } else if (title.includes('在庫')) {
                    const productSelect = document.getElementById('inventory-product');
                    const selectedOption = productSelect.options[productSelect.selectedIndex];
                    const category = selectedOption.getAttribute('data-category');
                    
                    if (title.includes('編集')) {
                        const id = modalForm.getAttribute('data-id');
                        await database.ref(`inventory/${id}`).update({
                            name: data['inventory-product'],
                            category: category,
                            quantity: parseInt(data['inventory-quantity'])
                        });
                    } else {
                        await database.ref('inventory').push().set({
                            name: data['inventory-product'],
                            category: category,
                            quantity: parseInt(data['inventory-quantity'])
                        });
                    }
                }
                closeModal.click();
                loadCategories();
                loadProducts();
                loadInventory();
            } catch (error) {
                console.error('操作に失敗しました:', error);
                alert('操作に失敗しました。');
            } finally {
                hideLoading();
            }
        };
    }

    closeModal.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // グラフ関連の機能
    let stockChart;

    function setupChart() {
        const ctx = document.getElementById('stock-chart').getContext('2d');
        stockChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: '在庫数',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateChart(inventory) {
        const labels = [];
        const data = [];

        for (const item of Object.values(inventory)) {
            labels.push(item.name);
            data.push(item.quantity);
        }

        stockChart.data.labels = labels;
        stockChart.data.datasets[0].data = data;
        stockChart.update();
    }

    function showLoading() {
        loadingOverlay.classList.remove('hidden');
    }

    function hideLoading() {
        loadingOverlay.classList.add('hidden');
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

