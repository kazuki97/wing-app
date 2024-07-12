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

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    const appContent = document.getElementById('app-content');
    const sideMenu = document.getElementById('side-menu');
    const views = document.querySelectorAll('.view');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    const closeModalButton = document.getElementsByClassName('close')[0];
    const loadingOverlay = document.getElementById('loading-overlay');

    let stockChart = null;

    // ナビゲーション設定
    sideMenu.addEventListener('click', function(e) {
        e.preventDefault();
        const link = e.target.closest('a');
        if (link) {
            const targetView = link.getAttribute('data-view');
            showView(targetView);
        }
    });

    function showView(viewId) {
        views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(`${viewId}-view`);
        if (targetView) {
            targetView.classList.add('active');
        } else {
            console.error(`View with id "${viewId}-view" not found`);
        }
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

    function updateCategoryFilter(categories) {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="all">すべてのカテゴリ</option>';
            for (const [id, name] of Object.entries(categories)) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                categoryFilter.appendChild(option);
            }
        }
    }

    function createCategoryForm(id = null, name = '') {
        return `
            <form id="category-form">
                <input type="text" id="category-name" name="category-name" value="${name}" placeholder="カテゴリ名" required>
                <button type="submit">${id ? '更新' : '追加'}</button>
            </form>
        `;
    }

    async function addCategory(name) {
        showLoading();
        try {
            const newCategoryRef = await database.ref('categories').push();
            await newCategoryRef.set(name);
            console.log('カテゴリを追加しました:', name);
            await loadCategories();
            closeModal();
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
            const form = document.getElementById('category-form');
            form.setAttribute('data-id', id);
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
                await loadCategories();
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

    addProductButton.addEventListener('click', async function() {
        try {
            const formContent = await createProductForm();
            showModal('商品を追加', formContent);
        } catch (error) {
            console.error('商品フォームの作成に失敗しました:', error);
            alert('商品フォームの作成に失敗しました。');
        }
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
            throw error;
        }

        return `
            <form id="product-form">
                <input type="text" id="product-name" name="product-name" value="${product.name}" placeholder="商品名" required>
                <select id="product-category" name="product-category" required>
                    <option value="">カテゴリを選択</option>
                    ${categoryOptions}
                </select>
                <button type="submit">${id ? '更新' : '追加'}</button>
            </form>
        `;
    }

    async function addProduct(name, category) {
        showLoading();
        try {
            const newProductRef = await database.ref('products').push();
            await newProductRef.set({ name, category });
            console.log('商品を追加しました:', { name, category });
            await loadProducts();
            closeModal();
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
            const formContent = await createProductForm(id, product);
            showModal('商品を編集', formContent);
            const form = document.getElementById('product-form');
            form.setAttribute('data-id', id);
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
                await loadProducts();
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

    // モーダル関連の機能
    function showModal(title, content) {
        modalTitle.textContent = title;
        modalForm.innerHTML = content;
        modal.style.display = 'block';

        const form = modalForm.querySelector('form');
        if (form) {
            form.onsubmit = async function(e) {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                showLoading();
                try {
                    if (title.includes('カテゴリ')) {
                        if (title.includes('編集')) {
                            const id = form.getAttribute('data-id');
                            await database.ref(`categories/${id}`).set(data['category-name']);
                            alert('カテゴリを更新しました。');
                        } else {
                            await addCategory(data['category-name']);
                        }
                    } else if (title.includes('商品')) {
                        if (title.includes('編集')) {
                            const id = form.getAttribute('data-id');
                            await database.ref(`products/${id}`).update(data);
                            alert('商品を更新しました。');
                        } else {
                            await addProduct(data['product-name'], data['product-category']);
                        }
                    }
                    closeModal();
                    await Promise.all([loadCategories(), loadProducts()]);
                } catch (error) {
                    console.error('操作に失敗しました:', error);
                    alert('操作に失敗しました。');
                } finally {
                    hideLoading();
                }
            };
        }
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    closeModalButton.onclick = closeModal;

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    // グラフ関連の機能
    function setupChart() {
        const ctx = document.getElementById('stock-chart');
        if (ctx) {
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
    }

    function updateChart(inventory) {
        if (stockChart) {
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
    }

    // アプリケーションの初期化
    loadCategories();
    loadProducts();
    loadInventory();
    setupChart();
});
