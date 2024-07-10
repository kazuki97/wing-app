// Firebase SDKの読み込みを確認
if (typeof firebase === 'undefined') {
  console.error('Firebase SDK is not loaded. Check your script tags.');
}

// Firebase の設定
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

// Firebase の初期化
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// パスワードを平文で設定（注意: 実運用ではこの方法は使用しないでください）
const correctPassword = 'wing99kk';

document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const togglePasswordButton = document.getElementById('toggle-password');
    const categoryView = document.getElementById('category-view');
    const itemView = document.getElementById('item-view');
    const categoryList = document.getElementById('category-list');
    const currentCategoryName = document.getElementById('current-category-name');
    const itemList = document.getElementById('item-list');
    const addCategoryButton = document.getElementById('add-category-button');
    const addItemButton = document.getElementById('add-item-button');
    const backToCategoriesButton = document.getElementById('back-to-categories');

    // ログイン機能
    loginButton.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            attemptLogin();
        }
    });

    // パスワードの可視性を切り替える
    togglePasswordButton.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordButton.textContent = '🔒';
        } else {
            passwordInput.type = 'password';
            togglePasswordButton.textContent = '👁';
        }
    });

    function attemptLogin() {
        const enteredPassword = passwordInput.value;
        if (enteredPassword === correctPassword) {
            loginScreen.style.display = 'none';
            appContent.style.display = 'block';
            initializeApp();
        } else {
            alert('パスワードが間違っています');
        }
    }

    function initializeApp() {
        loadCategories();
        setupEventListeners();
    }

    function setupEventListeners() {
        addCategoryButton.addEventListener('click', showAddCategoryDialog);
        addItemButton.addEventListener('click', showAddItemDialog);
        backToCategoriesButton.addEventListener('click', showCategoryView);
    }

    function loadCategories() {
        database.ref('categories').on('value', (snapshot) => {
            const categories = snapshot.val() || {};
            updateCategoryList(categories);
        });
    }

    function updateCategoryList(categories) {
        categoryList.innerHTML = '';
        for (const [id, name] of Object.entries(categories)) {
            const button = document.createElement('button');
            button.textContent = name;
            button.addEventListener('click', () => showItemView(id, name));
            categoryList.appendChild(button);
        }
    }

    function showCategoryView() {
        categoryView.style.display = 'block';
        itemView.style.display = 'none';
    }

    function showItemView(categoryId, categoryName) {
        categoryView.style.display = 'none';
        itemView.style.display = 'block';
        currentCategoryName.textContent = categoryName;
        loadItems(categoryId);
    }

    function loadItems(categoryId) {
        database.ref('inventory').orderByChild('category').equalTo(categoryId).on('value', (snapshot) => {
            const items = snapshot.val() || {};
            updateItemList(items);
        });
    }

    function updateItemList(items) {
        itemList.innerHTML = '';
        for (const [id, item] of Object.entries(items)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>
                    <button onclick="editItem('${id}')">編集</button>
                    <button onclick="deleteItem('${id}')">削除</button>
                </td>
            `;
            itemList.appendChild(row);
        }
    }

    function showAddCategoryDialog() {
        const name = prompt('新しいカテゴリ名を入力してください:');
        if (name) {
            addCategory(name);
        }
    }

    function addCategory(name) {
        const newCategoryRef = database.ref('categories').push();
        newCategoryRef.set(name);
    }

    function showAddItemDialog() {
        const name = prompt('商品名を入力してください:');
        const quantity = prompt('数量を入力してください:');
        if (name && quantity) {
            const categoryId = currentCategoryName.dataset.categoryId;
            addItem(name, parseInt(quantity, 10), categoryId);
        }
    }

    function addItem(name, quantity, categoryId) {
        const newItemRef = database.ref('inventory').push();
        newItemRef.set({ name, quantity, category: categoryId });
    }

    window.editItem = function(id) {
        const newName = prompt('新しい商品名を入力してください:');
        const newQuantity = prompt('新しい数量を入力してください:');
        if (newName && newQuantity) {
            database.ref(`inventory/${id}`).update({
                name: newName,
                quantity: parseInt(newQuantity, 10)
            });
        }
    }

    window.deleteItem = function(id) {
        if (confirm('本当にこの商品を削除しますか？')) {
            database.ref(`inventory/${id}`).remove();
        }
    }
});
