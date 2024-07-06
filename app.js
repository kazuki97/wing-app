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
// ログイン関連の要素
const loginScreen = document.getElementById('login-screen');
const appContent = document.getElementById('app-content');
const passwordInput = document.getElementById('password-input');
const loginButton = document.getElementById('login-button');
const togglePasswordButton = document.getElementById('toggle-password');

// パスワードを平文で設定（注意: 実運用ではこの方法は使用しないでください）
const correctPassword = 'wing99kk';

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
    let db;

    const dbName = 'InventoryDB';
    const storeName = 'inventory';

    const request = indexedDB.open(dbName, 1);

    request.onerror = function(event) {
        console.error("IndexedDB error:", event.target.error);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadInventory();
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        store.createIndex('name', 'name', { unique: false });
    };

    // DOM要素の取得
    const searchInput = document.getElementById('search-input');
    const itemTemplate = document.getElementById('inventory-item-template');
    const form = document.getElementById('add-item-form');
    const itemNameInput = document.getElementById('item-name');
    const itemQuantityInput = document.getElementById('item-quantity');
    const inventoryList = document.getElementById('inventory-list');
    const sortNameBtn = document.getElementById('sort-name');
    const sortQuantityBtn = document.getElementById('sort-quantity');
    const scanBarcodeBtn = document.getElementById('scan-barcode');
    const barcodeScannerDiv = document.getElementById('barcode-scanner');
    const exportCsvBtn = document.getElementById('export-csv');
    const importCsvInput = document.getElementById('import-csv');
    const importCsvBtn = document.getElementById('import-csv-btn');

    // 在庫リスト
    let inventory = [];
// データベースから在庫データを読み込む
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


    // イベントリスナーの設定
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = itemNameInput.value;
        const quantity = parseInt(itemQuantityInput.value);
        addItem(name, quantity);
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

   function addItem(name, quantity) {
    const dbRef = database.ref('inventory');
    dbRef.push({
        name: name,
        quantity: parseInt(quantity)
    });
}

    function updateInventoryDisplay(items = inventory) {
    inventoryList.innerHTML = '';
    items.forEach((item) => {
        const itemElement = document.importNode(itemTemplate.content, true);
        itemElement.querySelector('.item-name').textContent = item.name;
        const quantityInput = itemElement.querySelector('.item-quantity');
        quantityInput.value = item.quantity;
        
        const updateBtn = itemElement.querySelector('.update-btn');
        updateBtn.addEventListener('click', () => updateItemQuantity(item.id, quantityInput.value));
        
        const deleteBtn = itemElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteItem(item.id));
        
        inventoryList.appendChild(itemElement);
    });
}

    function saveInventory() {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        store.clear();

        inventory.forEach(item => {
            store.add(item);
        });

        transaction.oncomplete = function() {
            console.log('All items saved successfully');
        };
    }

    function loadInventory() {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = function(event) {
            inventory = event.target.result;
            updateInventoryDisplay();
        };
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
        csvContent += "名前,数量\n";
        inventory.forEach(item => {
            csvContent += `${item.name},${item.quantity}\n`;
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
                const [name, quantity] = lines[i].split(',');
                addItem(name.trim(), parseInt(quantity.trim()));
            }
        };
        
        reader.readAsText(file);
    }

    // ページ読み込み時に在庫データを読み込む
    loadInventory();
}
