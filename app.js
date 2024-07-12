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

// グローバル変数の定義
let appContent, sideMenu, views, modal, modalTitle, modalForm, closeModalButton, loadingOverlay;
let stockChart = null;

// Firebase接続と初期化
function connectToFirebase(retryCount = 0) {
    database.ref('.info/connected').on('value', function(snapshot) {
        if (snapshot.val() === true) {
            console.log('Firebase接続成功');
            initializeApp();
        } else {
            console.error('Firebase接続失敗');
            if (retryCount < 3) {
                setTimeout(() => connectToFirebase(retryCount + 1), 1000);
            } else {
                alert('Firebaseへの接続に失敗しました。ページをリロードしてください。');
            }
        }
    });
}

function initializeApp() {
    loadCategories();
    loadProducts();
    setupEventListeners();
}

// DOMコンテンツ読み込み完了時の処理
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    
    // DOM要素の取得
    appContent = document.getElementById('app-content');
    sideMenu = document.getElementById('side-menu');
    views = document.querySelectorAll('.view');
    modal = document.getElementById('modal');
    modalTitle = document.getElementById('modal-title');
    modalForm = document.getElementById('modal-form');
    closeModalButton = document.getElementsByClassName('close')[0];
    loadingOverlay = document.getElementById('loading-overlay');

    connectToFirebase();
});

// イベントリスナーのセットアップ
function setupEventListeners() {
    sideMenu.addEventListener('click', function(e) {
        e.preventDefault();
        const link = e.target.closest('a');
        if (link) {
            const targetView = link.getAttribute('data-view');
            showView(targetView);
        }
    });

    const addCategoryButton = document.getElementById('add-category-button');
    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', function() {
            showModal('カテゴリを追加', createCategoryForm());
        });
    }

    const addProductButton = document.getElementById('add-product-button');
    if (addProductButton) {
        addProductButton.addEventListener('click', async function() {
            try {
                const formContent = await createProductForm();
                showModal('商品を追加', formContent);
            } catch (error) {
                console.error('商品フォームの作成に失敗しました:', error);
                alert('商品フォームの作成に失敗しました。');
            }
        });
    }

    closeModalButton.onclick = closeModal;

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }
}

// ビューの表示
function showView(viewId) {
    views.forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(`${viewId}-view`);
    if (targetView) {
        targetView.classList.add('active');
        if (viewId === 'category') {
            loadCategories();
        } else if (viewId === 'product') {
            loadProducts();
        }
    } else {
        console.error(`View with id "${viewId}-view" not found`);
    }
}

// カテゴリの読み込み
async function loadCategories() {
    showLoading();
    try {
        const snapshot = await database.ref('categories').once('value');
        const categories = snapshot.val() || {};
        console.log('読み込まれたカテゴリ:', categories);
        updateCategoryList(categories);
        updateCategoryFilter(categories);
    } catch (error) {
        console.error('カテゴリの読み込みに失敗しました:', error);
        alert('カテゴリの読み込みに失敗しました。');
    } finally {
        hideLoading();
    }
}

// カテゴリリストの更新
function updateCategoryList(categories) {
    const categoryList = document.getElementById('category-list');
    if (categoryList) {
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
}
// カテゴリフィルターの更新
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

// カテゴリフォームの作成
function createCategoryForm(id = null, name = '') {
    return `
        <form id="category-form" ${id ? `data-id="${id}"` : ''}>
            <input type="text" id="category-name" name="category-name" value="${name}" placeholder="カテゴリ名" required>
            <button type="submit">${id ? '更新' : '追加'}</button>
        </form>
    `;
}

// カテゴリの追加
async function addCategory(name) {
    showLoading();
    try {
        const newCategoryRef = await database.ref('categories').push();
        await newCategoryRef.set(name);
        console.log('カテゴリを追加しました:', name);
        console.log('新しいカテゴリのID:', newCategoryRef.key);
        await loadCategories();
        closeModal();
        alert('カテゴリを追加しました。');
        showView('category');
    } catch (error) {
        console.error('カテゴリの追加に失敗しました:', error);
        alert('カテゴリの追加に失敗しました。エラー: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 商品の読み込み
async function loadProducts() {
    showLoading();
    try {
        const snapshot = await database.ref('products').once('value');
        const products = snapshot.val() || {};
        console.log('読み込まれた商品:', products);
        updateProductList(products);
    } catch (error) {
        console.error('商品の読み込みに失敗しました:', error);
        alert('商品の読み込みに失敗しました。');
    } finally {
        hideLoading();
    }
}

// 商品リストの更新
function updateProductList(products) {
    const productList = document.getElementById('product-list');
    if (productList) {
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
}

// 商品フォームの作成
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
        <form id="product-form" ${id ? `data-id="${id}"` : ''}>
            <input type="text" id="product-name" name="product-name" value="${product.name}" placeholder="商品名" required>
            <select id="product-category" name="product-category" required>
                <option value="">カテゴリを選択</option>
                ${categoryOptions}
            </select>
            <button type="submit">${id ? '更新' : '追加'}</button>
        </form>
    `;
}

// 商品の追加
async function addProduct(name, category) {
    showLoading();
    try {
        const newProductRef = await database.ref('products').push();
        await newProductRef.set({ name, category });
        console.log('商品を追加しました:', { name, category });
        console.log('新しい商品のID:', newProductRef.key);
        await loadProducts();
        closeModal();
        alert('商品を追加しました。');
        showView('product');
    } catch (error) {
        console.error('商品の追加に失敗しました:', error);
        alert('商品の追加に失敗しました。エラー: ' + error.message);
    } finally {
        hideLoading();
    }
}

// モーダルの表示
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
                        await loadCategories();
                    } else {
                        await addCategory(data['category-name']);
                    }
                } else if (title.includes('商品')) {
                    if (title.includes('編集')) {
                        const id = form.getAttribute('data-id');
                        await database.ref(`products/${id}`).update(data);
                        await loadProducts();
                    } else {
                        await addProduct(data['product-name'], data['product-category']);
                    }
                }
                closeModal();
            } catch (error) {
                console.error('操作に失敗しました:', error);
                alert('操作に失敗しました。エラー: ' + error.message);
            } finally {
                hideLoading();
            }
        };
    }
}

// モーダルを閉じる
function closeModal() {
    modal.style.display = 'none';
}

// ローディング表示
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

// ローディング非表示
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// グローバルスコープに関数を公開
window.editCategory = async function(id) {
    try {
        const snapshot = await database.ref(`categories/${id}`).once('value');
        const name = snapshot.val();
        showModal('カテゴリを編集', createCategoryForm(id, name));
    } catch (error) {
        console.error('カテゴリの編集フォーム作成に失敗しました:', error);
        alert('カテゴリの編集フォーム作成に失敗しました。');
    }
};

window.deleteCategory = async function(id) {
    if (confirm('このカテゴリを削除してもよろしいですか？')) {
        try {
            await database.ref(`categories/${id}`).remove();
            await loadCategories();
            alert('カテゴリを削除しました。');
        } catch (error) {
            console.error('カテゴリの削除に失敗しました:', error);
            alert('カテゴリの削除に失敗しました。エラー: ' + error.message);
        }
    }
};

window.editProduct = async function(id) {
    try {
        const snapshot = await database.ref(`products/${id}`).once('value');
        const product = snapshot.val();
        const formContent = await createProductForm(id, product);
        showModal('商品を編集', formContent);
    } catch (error) {
        console.error('商品の編集フォーム作成に失敗しました:', error);
        alert('商品の編集フォーム作成に失敗しました。');
    }
};

window.deleteProduct = async function(id) {
    if (confirm('この商品を削除してもよろしいですか？')) {
        try {
            await database.ref(`products/${id}`).remove();
            await loadProducts();
            alert('商品を削除しました。');
        } catch (error) {
            console.error('商品の削除に失敗しました:', error);
            alert('商品の削除に失敗しました。エラー: ' + error.message);
        }
    }
};
