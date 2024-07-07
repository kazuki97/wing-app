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

// グローバル変数
let inventory = [];
let categories = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    // DOM要素の取得
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const togglePasswordButton = document.getElementById('toggle-password');
    const searchInput = document.getElementById('search-input');
    const form = document.getElementById('add-item-form');
    const itemNameInput = document.getElementById('item-name');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemCategorySelect = document.getElementById('item-category');
    const inventoryList = document.getElementById('items');
    const categoryList = document.getElementById('categories');
    const sortNameBtn = document.getElementById('sort-name');
    const sortQuantityBtn = document.getElementById('sort-quantity');
    const scanBarcodeBtn = document.getElementById('scan-barcode');
    const barcodeScannerDiv = document.getElementById('barcode-scanner');
    const exportCsvBtn = document.getElementById('export-csv');
    const importCsvInput = document.getElementById('import-csv');
    const importCsvBtn = document.getElementById('import-csv-btn');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const itemDetails = document.getElementById('item-details');

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
        // イベントリスナーの設定
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = itemNameInput.value;
            const quantity = parseInt(itemQuantityInput.value);
            const categoryId = itemCategorySelect.value;
            addItem(name, quantity, categoryId);
            form.reset();
        });

        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filteredInventory = inventory.filter(item => 
                item.name.toLowerCase().includes(searchTerm)
            );
            updateInventoryDisplay(filteredInventory);
        });

        sortNameBtn.addEventListener('click', () => {
            inventory.sort((a, b) => a.name.localeCompare(b.name));
            updateInventoryDisplay();
        });

        sortQuantityBtn.addEventListener('click', () => {
            inventory.sort((a, b) => b.quantity - a.quantity);
            updateInventoryDisplay();
        });

        scanBarcodeBtn.addEventListener('click', startBarcodeScanner);

        exportCsvBtn.addEventListener('click', exportToCsv);
        importCsvBtn.addEventListener('click', () => importCsvInput.click());
        importCsvInput.addEventListener('change', importFromCsv);

        addCategoryBtn.addEventListener('click', addCategory);

        // 初期データ読み込み
        loadCategories();
        loadInventory();
    }

    function loadCategories() {
        const dbRef = database.ref('categories');
        dbRef.on('value', (snapshot) => {
            categories = [];
            snapshot.forEach((childSnapshot) => {
                categories.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            updateCategoryDisplay();
            updateCategorySelect();
        });
    }

    function loadInventory() {
        const dbRef = database.ref('inventory');
        dbRef.on('value', (snapshot) => {
            inventory = [];
            snapshot.forEach((childSnapshot) => {
                inventory.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            updateInventoryDisplay();
        });
    }

    function addItem(name, quantity, categoryId) {
        const dbRef = database.ref('inventory');
        dbRef.push({
            name: name,
            quantity: parseInt(quantity),
            categoryId: categoryId
        });
    }

    function updateInventoryDisplay(items = inventory) {
        inventoryList.innerHTML = '';
        items.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = `${item.name} (${item.quantity})`;
            li.addEventListener('click', () => showItemDetails(item));
            inventoryList.appendChild(li);
        });
    }

    function updateCategoryDisplay() {
        categoryList.innerHTML = '';
        categories.forEach((category) => {
            const li = document.createElement('li');
            li.textContent = category.name;
            li.addEventListener('click', () => filterByCategory(category.id));
            categoryList.appendChild(li);
        });
    }

    function updateCategorySelect() {
        itemCategorySelect.innerHTML = '<option value="">カテゴリを選択</option>';
        categories.forEach((category) => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            itemCategorySelect.appendChild(option);
        });
    }

    function addCategory() {
        const categoryName = prompt('新しいカテゴリ名を入力してください：');
        if (categoryName) {
            const dbRef = database.ref('categories');
            dbRef.push({
                name: categoryName
            });
        }
    }

    function filterByCategory(categoryId) {
        const filteredInventory = inventory.filter(item => item.categoryId === categoryId);
        updateInventoryDisplay(filteredInventory);
    }

    function showItemDetails(item) {
        itemDetails.innerHTML = `
            <h3>${item.name}</h3>
            <p>数量: ${item.quantity}</p>
            <p>カテゴリ: ${categories.find(c => c.id === item.categoryId)?.name || '未分類'}</p>
            <input type="number" id="update-quantity" value="${item.quantity}">
            <button onclick="updateItemQuantity('${item.id}', document.getElementById('update-quantity').value)">更新</button>
            <button onclick="deleteItem('${item.id}')">削除</button>
        `;
    }

    function deleteItem(id) {
        const dbRef = database.ref('inventory/' + id);
        dbRef.remove();
    }

    function updateItemQuantity(id, newQuantity) {
        const dbRef = database.ref('inventory/' + id);
        dbRef.update({
            quantity: parseInt(newQuantity)
        });
    }

    function startBarcodeScanner() {
        barcodeScannerDiv.style.display = 'block';
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: barcodeScannerDiv
            },
            decoder: {
                readers: ["ean_reader"]
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
            document.getElementById('item-name').value = "商品 " + code;
            Quagga.stop();
            barcodeScannerDiv.style.display = 'none';
        });
    }

    function exportToCsv() {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "名前,数量,カテゴリID\n";
        inventory.forEach(item => {
            csvContent += `${item.name},${item.quantity},${item.categoryId}\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function importFromCsv(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const csv = e.target.result;
            const lines = csv.split('\n');
            
            for(let i = 1; i < lines.length; i++) {
                if(lines[i].trim() === '') continue;
                const [name, quantity, categoryId] = lines[i].split(',');
                addItem(name.trim(), parseInt(quantity.trim()), categoryId.trim());
            }
        };
        
        reader.readAsText(file);
    }

    console.log('Event listeners added');
});
