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
    console.log('DOM fully loaded and parsed');

    // DOM要素の取得
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const togglePasswordButton = document.getElementById('toggle-password');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const categorySelect = document.getElementById('category-select');
    const addCategoryButton = document.getElementById('add-category-button');
    const addItemButton = document.getElementById('add-item-button');
    const exportCsvButton = document.getElementById('export-csv');
    const importCsvButton = document.getElementById('import-csv');
    const csvFileInput = document.getElementById('csv-file-input');
    const startScanButton = document.getElementById('start-scan');
    const inventoryList = document.getElementById('inventory-list');

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
        console.log('Attempting login');
        const enteredPassword = passwordInput.value;
        if (enteredPassword === correctPassword) {
            console.log('Login successful');
            loginScreen.style.display = 'none';
            appContent.style.display = 'block';
            initializeApp();
        } else {
            console.log('Login failed');
            alert('パスワードが間違っています');
        }
    }

    function initializeApp() {
        console.log('Initializing app');
        loadCategories();
        loadInventory();
        setupEventListeners();
    }

    function setupEventListeners() {
        searchInput.addEventListener('input', filterInventory);
        sortSelect.addEventListener('change', sortInventory);
        categorySelect.addEventListener('change', filterInventory);
        addCategoryButton.addEventListener('click', showAddCategoryDialog);
        addItemButton.addEventListener('click', showAddItemDialog);
        exportCsvButton.addEventListener('click', exportToCsv);
        importCsvButton.addEventListener('click', () => csvFileInput.click());
        csvFileInput.addEventListener('change', importFromCsv);
        startScanButton.addEventListener('click', startBarcodeScanner);
    }

    function loadCategories() {
        database.ref('categories').on('value', (snapshot) => {
            const categories = snapshot.val() || {};
            updateCategorySelect(categories);
        });
    }

    function updateCategorySelect(categories) {
        categorySelect.innerHTML = '<option value="all">すべてのカテゴリ</option>';
        for (const [id, name] of Object.entries(categories)) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            categorySelect.appendChild(option);
        }
    }

    function loadInventory() {
        database.ref('inventory').on('value', (snapshot) => {
            const data = snapshot.val();
            updateInventoryList(data);
        });
    }

    function updateInventoryList(data) {
        inventoryList.innerHTML = '';
        for (const [id, item] of Object.entries(data)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.category}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>
                    <button onclick="editItem('${id}')">編集</button>
                    <button onclick="deleteItem('${id}')">削除</button>
                </td>
            `;
            inventoryList.appendChild(row);
        }
    }

    function filterInventory() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value;
        const rows = inventoryList.getElementsByTagName('tr');
        for (const row of rows) {
            const category = row.cells[0].textContent;
            const name = row.cells[1].textContent.toLowerCase();
            const categoryMatch = selectedCategory === 'all' || category === selectedCategory;
            const searchMatch = name.includes(searchTerm);
            row.style.display = categoryMatch && searchMatch ? '' : 'none';
        }
    }

    function sortInventory() {
        const sortBy = sortSelect.value;
        const rows = Array.from(inventoryList.getElementsByTagName('tr'));
        rows.sort((a, b) => {
            const aValue = a.cells[sortBy === 'name' ? 1 : 2].textContent;
            const bValue = b.cells[sortBy === 'name' ? 1 : 2].textContent;
            return sortBy === 'name' ? aValue.localeCompare(bValue) : aValue - bValue;
        });
        inventoryList.innerHTML = '';
        rows.forEach(row => inventoryList.appendChild(row));
    }

    function showAddCategoryDialog() {
        const name = prompt('新しいカテゴリ名を入力してください:');
        if (name) {
            addCategory(name);
        }
    }

    function addCategory(name) {
        const newCategoryRef = database.ref('categories').push();
        newCategoryRef.set(name)
            .then(() => {
                console.log('カテゴリが正常に追加されました');
                loadCategories(); // カテゴリリストを更新
            })
            .catch((error) => {
                console.error('カテゴリの追加中にエラーが発生しました:', error);
            });
    }

    function showAddItemDialog() {
        const name = prompt('商品名を入力してください:');
        const quantity = prompt('数量を入力してください:');
        const category = prompt('カテゴリを入力してください:');
        if (name && quantity && category) {
            addItem(name, parseInt(quantity, 10), category);
        }
    }

    function addItem(name, quantity, category) {
        const newItemRef = database.ref('inventory').push();
        newItemRef.set({ name, quantity, category });
    }

    window.editItem = function(id) {
        const newName = prompt('新しい商品名を入力してください:');
        const newQuantity = prompt('新しい数量を入力してください:');
        const newCategory = prompt('新しいカテゴリを入力してください:');
        if (newName && newQuantity && newCategory) {
            database.ref(`inventory/${id}`).update({
                name: newName,
                quantity: parseInt(newQuantity, 10),
                category: newCategory
            });
        }
    }

    window.deleteItem = function(id) {
        if (confirm('本当にこの商品を削除しますか？')) {
            database.ref(`inventory/${id}`).remove();
        }
    }

    function exportToCsv() {
        database.ref('inventory').once('value', (snapshot) => {
            const data = snapshot.val();
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "カテゴリ,商品名,数量\n";
            for (const item of Object.values(data)) {
                csvContent += `${item.category},${item.name},${item.quantity}\n`;
            }
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "inventory.csv");
            document.body.appendChild(link);
            link.click();
        });
    }

    function importFromCsv(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            const lines = contents.split('\n');
            lines.shift(); // ヘッダー行を削除
            const newItems = {};
            for (const line of lines) {
                const [category, name, quantity] = line.split(',');
                if (category && name && quantity) {
                    const newItemRef = database.ref('inventory').push();
                    newItems[newItemRef.key] = { 
                        category, 
                        name, 
                        quantity: parseInt(quantity, 10) 
                    };
                }
            }
            database.ref('inventory').update(newItems);
        };
        reader.readAsText(file);
    }

    function startBarcodeScanner() {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector('#scanner-container')
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "code_39_reader", "code_128_reader"]
            }
        }, function(err) {
            if (err) {
                console.error(err);
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected(function(result) {
            const code = result.codeResult.code;
            alert(`バーコード: ${code}`);
            Quagga.stop();
        });
    }

    console.log('Event listeners added');
});
