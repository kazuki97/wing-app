// salesAnalysis.js
import { getTransactions } from './transactions.js';
import { getSubcategories } from './categories.js';

let salesChartInstance = null;

// フィルタリングオプションに基づいて売上データを取得する
async function getSalesData(filter) {
  const transactions = await getTransactions();
  console.log('適用フィルタ:', filter); // デバッグ用
  console.log('全トランザクション:', transactions); // デバッグ用

  return transactions.filter((transaction) => {
    if (!transaction.subcategory) return false;

    const matchesSubcategory = !filter.subcategory || String(transaction.subcategory) === String(filter.subcategory);

    console.log('サブカテゴリ比較:', 'フィルタサブカテゴリ:', filter.subcategory, 'トランザクションサブカテゴリ:', transaction.subcategory, 'マッチ:', matchesSubcategory); // デバッグ用

    return matchesSubcategory;
  });
}

// グラフの表示
function displaySalesChart(data, labels, chartType, chartContainerId) {
  const ctx = document.getElementById(chartContainerId).getContext('2d');

  // 既存のチャートがある場合は破棄する
  if (salesChartInstance) {
    salesChartInstance.destroy();
  }

  salesChartInstance = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [
        {
          label: '売上金額',
          data: data.sales,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
        {
          label: '利益',
          data: data.profit,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
        },
        {
          label: '販売数量',
          data: data.quantity,
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// 売上分析セクションの初期化
async function initializeSalesAnalysis(filter) {
  const salesData = await getSalesData(filter);
  if (salesData.length === 0) {
    console.warn('該当する売上データがありません');
    const canvas = document.getElementById('salesAnalysisChart');
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    return;
  }
  const labels = salesData.map((transaction) => {
    const date = typeof transaction.timestamp === 'string' ? new Date(transaction.timestamp) : new Date(transaction.timestamp);
    return date.toLocaleDateString();
  });
  const data = {
    sales: salesData.map((transaction) => transaction.totalAmount || 0),
    profit: salesData.map((transaction) => transaction.profit || 0),
    quantity: salesData.map((transaction) => {
      return transaction.items && Array.isArray(transaction.items)
        ? transaction.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;
    }),
  };
  console.log('グラフに渡すデータ:', data); // デバッグ用
  displaySalesChart(data, labels, 'bar', 'salesAnalysisChart');
}

// サブカテゴリの選択肢を更新
async function updateSubcategorySelectOptions() {
  try {
    const subcategories = await getSubcategories();
    console.log('取得したサブカテゴリ:', subcategories); // デバッグ用
    const subcategorySelect = document.getElementById('analysisSubcategory');
    subcategorySelect.innerHTML = '<option value="">すべてのサブカテゴリ</option>';
    subcategories.forEach((subcategory) => {
      const option = document.createElement('option');
      option.value = subcategory.id;
      option.textContent = subcategory.name;
      subcategorySelect.appendChild(option);
    });
  } catch (error) {
    console.error('サブカテゴリの取得エラー:', error);
  }
}

// フィルタリングフォームのイベントリスナー
document.getElementById('salesAnalysisFilterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const year = parseInt(document.getElementById('analysisYear').value, 10);
  const month = parseInt(document.getElementById('analysisMonth').value, 10);

  // サブカテゴリを再取得してログ出力
  const subcategoryElement = document.getElementById('analysisSubcategory');
  let subcategory = subcategoryElement ? subcategoryElement.value : null;

  // サブカテゴリが未選択の場合のデフォルト処理
  if (subcategory === '') subcategory = null;

  const filter = { year, month, subcategory };
  console.log('送信されたフィルタ:', filter); // デバッグ用
  await initializeSalesAnalysis(filter);
});

// 年と月のドロップダウンの選択肢を追加
function updateYearMonthSelectOptions() {
  const currentYear = new Date().getFullYear();
  const yearSelect = document.getElementById('analysisYear');
  yearSelect.innerHTML = '';
  for (let year = currentYear; year >= 2020; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  const monthSelect = document.getElementById('analysisMonth');
  monthSelect.innerHTML = '';
  for (let month = 1; month <= 12; month++) {
    const option = document.createElement('option');
    option.value = month;
    option.textContent = `${month}月`;
    monthSelect.appendChild(option);
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  await updateSubcategorySelectOptions();
  updateYearMonthSelectOptions();
});
