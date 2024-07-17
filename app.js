// Firebaseの設定
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// カテゴリを保存する配列
let categories = [];

// DOM要素の取得
const categoryForm = document.getElementById('categoryForm');
const categoryList = document.getElementById('categoryList');

// ページロード時にカテゴリを読み込む
document.addEventListener('DOMContentLoaded', loadCategories);

// カテゴリの読み込み
function loadCategories() {
    db.collection("categories").get().then((querySnapshot) => {
        categories = [];
        querySnapshot.forEach((doc) => {
            categories.push(doc.data().name);
        });
        updateCategoryList();
    });
}

// カテゴリフォームの送信イベント
categoryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const categoryNameInput = document.getElementById('categoryName');
    const categoryName = categoryNameInput.value.trim();
    
    if (categoryName && !categories.includes(categoryName)) {
        // Firebaseにカテゴリを追加
        db.collection("categories").add({
            name: categoryName
        })
        .then(() => {
            categories.push(categoryName);
            updateCategoryList();
            categoryNameInput.value = '';
            alert('カテゴリが追加されました：' + categoryName);
        })
        .catch((error) => {
            console.error("Error adding category: ", error);
            alert('カテゴリの追加に失敗しました。');
        });
    } else if (categories.includes(categoryName)) {
        alert('このカテゴリは既に存在します。');
    } else {
        alert('カテゴリ名を入力してください。');
    }
});

// カテゴリリストの更新
function updateCategoryList() {
    categoryList.innerHTML = '';
    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category;
        categoryList.appendChild(li);
    });
}
