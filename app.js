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
    const addCategoryButton = document.getElementById('add-category-button');
    const addProductButton = document.getElementById('add-product-button');
    const categoryList = document.getElementById('category-list');
    const productList = document.getElementById('product-list');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.getElementsByClassName('close')[0];

    // カテゴリ追加機能
    addCategoryButton.addEventListener('click', function() {
        showModal('カテゴリを追加', createCategoryForm());
    });

    function createCategoryForm() {
        return `
            <form id="category-form">
                <input type="text" id="category-name" name="category-name" placeholder="カテゴリ名" required>
                <button type="submit">追加</button>
            </form>
        `;
    }

    async function addCategory(name) {
        try {
            const newCategoryRef = await database.ref('categories').push();
            await newCategoryRef.set(name);
            console.log('カテゴリを追加しました:', name);
            loadCategories();
            closeModalWindow();
            alert('カテゴリを追加しました。');
        } catch (error) {
            console.error('カテゴリの追加に失敗しました:', error);
            alert('カテゴリの追加に失敗しました。');
        }
    }

    async function loadCategories() {
        try {
            const snapshot = await database.ref('categories').once('value');
            const categories = snapshot.val() || {};
            updateCategoryList(categories);
        } catch (error) {
            console.error('カテゴリの読み込みに失敗しました:', error);
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

    // 商品追加機能
    addProductButton.addEventListener('click', function() {
        showModal('商品を追加', createProductForm());
    });

    async function createProductForm() {
        let categoryOptions = '';
        try {
            const snapshot = await database.ref('categories').once('value');
            const categories = snapshot.val() || {};
            for (const [categoryId, categoryName] of Object.entries(categories)) {
                categoryOptions += `<option value="${categoryName}">${categoryName}</option>`;
            }
        } catch (error) {
            console.error('カテゴリの読み込みに失敗しました:', error);
        }

        return `
            <form id="product-form">
                <input type="text" id="product-name" name="product-name" placeholder="商品名" required>
                <select id="product-category" name="product-category" required>
                    <option value="">カテゴリを選択</option>
                    ${categoryOptions}
                </select>
                <button type="submit">追加</button>
            </form>
        `;
    }

    async function addProduct(name, category) {
        try {
            const newProductRef = await database.ref('products').push();
            await newProductRef.set({ name, category });
            console.log('商品を追加しました:', { name, category });
            loadProducts();
            closeModalWindow();
            alert('商品を追加しました。');
        } catch (error) {
            console.error('商品の追加に失敗しました:', error);
            alert('商品の追加に失敗しました。');
        }
    }

    async function loadProducts() {
        try {
            const snapshot = await database.ref('products').once('value');
            const products = snapshot.val() || {};
            updateProductList(products);
        } catch (error) {
            console.error('商品の読み込みに失敗しました:', error);
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
// モーダル関連の機能
    function showModal(title, content) {
        modalTitle.textContent = title;
        modalContent.innerHTML = content;
        modal.style.display = 'block';

        const form = modalContent.querySelector('form');
        if (form) {
            form.onsubmit = async function(e) {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                if (title.includes('カテゴリ')) {
                    await addCategory(data['category-name']);
                } else if (title.includes('商品')) {
                    await addProduct(data['product-name'], data['product-category']);
                }
            };
        }
    }

    function closeModalWindow() {
        modal.style.display = 'none';
    }

    closeModal.onclick = closeModalWindow;

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModalWindow();
        }
    }

    // アプリケーションの初期化
    loadCategories();
    loadProducts();

    // グローバルスコープに関数を公開
    window.editCategory = async function(id) {
        try {
            const snapshot = await database.ref(`categories/${id}`).once('value');
            const name = snapshot.val();
            showModal('カテゴリを編集', createCategoryForm());
            document.getElementById('category-name').value = name;
            const form = document.getElementById('category-form');
            form.onsubmit = async function(e) {
                e.preventDefault();
                const updatedName = document.getElementById('category-name').value;
                await database.ref(`categories/${id}`).set(updatedName);
                loadCategories();
                closeModalWindow();
                alert('カテゴリを更新しました。');
            };
        } catch (error) {
            console.error('カテゴリの編集に失敗しました:', error);
            alert('カテゴリの編集に失敗しました。');
        }
    }

    window.deleteCategory = async function(id) {
        if (confirm('このカテゴリを削除してもよろしいですか？')) {
            try {
                await database.ref(`categories/${id}`).remove();
                loadCategories();
                alert('カテゴリを削除しました。');
            } catch (error) {
                console.error('カテゴリの削除に失敗しました:', error);
                alert('カテゴリの削除に失敗しました。');
            }
        }
    }

    window.editProduct = async function(id) {
        try {
            const snapshot = await database.ref(`products/${id}`).once('value');
            const product = snapshot.val();
            const formContent = await createProductForm();
            showModal('商品を編集', formContent);
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            const form = document.getElementById('product-form');
            form.onsubmit = async function(e) {
                e.preventDefault();
                const updatedName = document.getElementById('product-name').value;
                const updatedCategory = document.getElementById('product-category').value;
                await database.ref(`products/${id}`).update({ name: updatedName, category: updatedCategory });
                loadProducts();
                closeModalWindow();
                alert('商品を更新しました。');
            };
        } catch (error) {
            console.error('商品の編集に失敗しました:', error);
            alert('商品の編集に失敗しました。');
        }
    }

    window.deleteProduct = async function(id) {
        if (confirm('この商品を削除してもよろしいですか？')) {
            try {
                await database.ref(`products/${id}`).remove();
                loadProducts();
                alert('商品を削除しました。');
            } catch (error) {
                console.error('商品の削除に失敗しました:', error);
                alert('商品の削除に失敗しました。');
            }
        }
    }
});
