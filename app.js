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
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const togglePasswordButton = document.getElementById('toggle-password');
    const sideMenu = document.getElementById('side-menu');
    const views = document.querySelectorAll('.view');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    const closeModal = document.getElementsByClassName('close')[0];

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

    function attemptLogin() {
        if (passwordInput.value === correctPassword) {
            loginScreen.classList.add('hidden');
            appContent.classList.remove('hidden');
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

    function addCategory(name) {
        database.ref('categories').push().set(name);
    }

    window.editCategory = function(id) {
        database.ref(`categories/${id}`).once('value', snapshot => {
            const name = snapshot.val();
            showModal('カテゴリを編集', createCategoryForm(id, name));
        });
    }

    window.deleteCategory = function(id) {
        if (confirm('このカテゴリを削除してもよろしいですか？')) {
            database.ref(`categories/${id}`).remove();
        }
    }

    // 商品関連の機能
    const addProductButton = document.getElementById('add-product-button');
    const productList = document.getElementById('product-list');

    addProductButton.addEventListener('click', function() {
        showModal('商品を追加', createProductForm());
    });

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
                    <button onclick="editProduct('${id}')" class="action-button"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProduct('${id}')" class="action-button"><i class="fas fa-trash"></i></button>
                </td>
            `;
            productList.appendChild(row);
        }
    }

    function createProductForm(id = null, product = { name: '', category: '' }) {
        let categoryOptions = '';
        database.ref('categories').once('value', snapshot => {
            const categories = snapshot.val() || {};
            for (const [categoryId, categoryName] of Object.entries(categories)) {
                categoryOptions += `<option value="${categoryName}" ${product.category === categoryName ? 'selected' : ''}>${categoryName}</option>`;
            }
        });

        return `
            <input type="text" id="product-name" value="${product.name}" placeholder="商品名" required>
            <select id="product-category" required>
                <option value="">カテゴリを選択</option>
                ${categoryOptions}
            </select>
            <button type="submit">${id ? '更新' : '追加'}</button>
        `;
    }

    function addProduct(name, category) {
        database.ref('products').push().set({ name, category });
    }

    window.editProduct = function(id) {
        database.ref(`products/${id}`).once('value', snapshot => {
            const product = snapshot.val();
            showModal('商品を編集', createProductForm(id, product));
        });
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
            updateChart(inventory);
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

    window.editInventoryItem = function(id) {
        database.ref(`inventory/${id}`).once('value', snapshot => {
            const item = snapshot.val();
            showModal('在庫を編集', createInventoryForm(id, item));
        });
    }

    window.deleteInventoryItem = function(id) {
        if (confirm('この在庫項目を削除してもよろしいですか？')) {
            database.ref(`inventory/${id}`).remove();
        }
    }

    function createInventoryForm(id = null, item = { name: '', category: '', quantity: '' }) {
        let productOptions = '';
        database.ref('products').once('value', snapshot => {
            const products = snapshot.val() || {};
            for (const [productId, product] of Object.entries(products)) {
                productOptions += `<option value="${product.name}" data-category="${product.category}" ${item.name === product.name ? 'selected' : ''}>${product.name}</option>`;
            }
        });

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

        modalForm.onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(modalForm);
            const data = Object.fromEntries(formData.entries());

            if (title.includes('カテゴリ')) {
                if (title.includes('編集')) {
                    const id = modalForm.getAttribute('data-id');
                    database.ref(`categories/${id}`).set(data['category-name']);
                } else {
                    addCategory(data['category-name']);
                }
            } else if (title.includes('商品')) {
                if (title.includes('編集')) {
                    const id = modalForm.getAttribute('data-id');
                    database.ref(`products/${id}`).update(data);
                } else {
                    addProduct(data['product-name'], data['product-category']);
                }
            } else if (title.includes('在庫')) {
                const productSelect = document.getElementById('inventory-product');
                const selectedOption = productSelect.options[productSelect.selectedIndex];
                const category = selectedOption.getAttribute('data-category');
                
                if (title.includes('編集')) {
                    const id = modalForm.getAttribute('data-id');
                    database.ref(`inventory/${id}`).update({
                        name: data['inventory-product'],
                        category: category,
                        quantity: parseInt(data['inventory-quantity'])
                    });
                } else {
                    database.ref('inventory').push().set({
                        name: data['inventory-product'],
                        category: category,
                        quantity: parseInt(data['inventory-quantity'])
                    });
                }
            }

            closeModal.click();
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
});
