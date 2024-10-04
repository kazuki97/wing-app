// main.js
import { db } from './db.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

async function testFirestore() {
  try {
    const docRef = await addDoc(collection(db, 'testCollection'), {
      name: 'テストデータ',
      createdAt: new Date()
    });
    console.log('ドキュメントが追加されました。ID: ', docRef.id);
  } catch (error) {
    console.error('エラーが発生しました: ', error);
  }
}

testFirestore();
