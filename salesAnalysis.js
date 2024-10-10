// salesAnalysis.js
import { getTransactions } from './transactions.js';

const Chart = window.Chart;

// フィルタリングオプションに基づいて売上データを取得する
async function getSalesData(filter) {
  const transactions = await getTransactions();
  return transactions.filter((transaction) => {
    const date = transaction.timestamp.toDate();
    const matchesYear = !filter.year || date.getFullYear() === filter.year;
    const matchesMonth = !filter.month || date.getMonth() + 1 === filter.month;
    const matchesCategory = !filter.category || transaction.category === filter.category;
    const matchesSubcategory = !filter.subcategory || transaction.subcategory === filter.subcategory;
    return matchesYear && matchesMonth && matchesCategory && matchesSubcategory;
  });
}

// グラフの表示
function displaySalesChart(data, labels, chartType, chartContainerId) {
  const ctx = document.getElementById(chartContainerId).getContext('2d');
  new Chart(ctx, {
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
  const labels = salesData.map((transaction) => transaction.timestamp.toDate().toLocaleDateString());
  const data = {
    sales: salesData.map((transaction) => transaction.totalAmount),
    profit: salesData.map((transaction) => transaction.profit),
    quantity: salesData.map((transaction) => transaction.items.reduce((sum, item) => sum + item.quantity, 0)),
  };
  displaySalesChart(data, labels, 'line', 'salesAnalysisChart');
}

// フィルタリングフォームのイベントリスナー
document.getElementById('salesAnalysisFilterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const year = parseInt(document.getElementById('analysisYear').value, 10);
  const month = parseInt(document.getElementById('analysisMonth').value, 10);
  const category = document.getElementById('analysisCategory').value;
  const subcategory = document.getElementById('analysisSubcategory').value;
  const filter = { year, month, category, subcategory };
  await initializeSalesAnalysis(filter);
});

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeSalesAnalysis({});
});
