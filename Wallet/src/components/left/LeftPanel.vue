<template>
  <div class="left-panel-container">
    <div class="header-section">
      <h2 class="title">Monthly Summary</h2>
      <div class="amount">￥ {{ stats.balance }}</div>
      <div class="stat-group">
        <div class="val income">⬆ Income: ￥{{ stats.income }}</div>
        <div class="val expense">⬇ Expenses: ￥{{ stats.expense }}</div>
      </div>
    </div>

    <div class="divider"></div>
    
    <div class="chart-section">
      <h3 class="sub-title">Expense Pie Chart</h3>
      <div class="chart-wrapper">
        <AssetPieChart />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const stats = ref({
  income: 0,
  expense: 0,
  balance: 0
});

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/monthly-stats');
    stats.value = res.data;
  } catch (error) {
    console.error("获取统计数据失败:", error);
  }
});
</script>

<style scoped>
.left-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 30px 24px; /* 固定像素内边距，更稳定 */
  box-sizing: border-box;
  color: white;
  overflow: hidden; /* 严禁溢出 */
}

/* 头部区域：保持自然高度 */
.header-section {
  flex-shrink: 0; /* 标题和数字不准缩小 */
}

.title { font-size: 20px; opacity: 0.9; margin: 0 0 8px 0; margin-bottom: 3%;}
.amount { 
  font-size: 42px; 
  font-weight: 800; 
  margin-bottom: 16px; 
  letter-spacing: -1px;
  gap: 3px;
}

.stat-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.val { font-size: 15px; font-weight: 600; }
.income { font-size: 18px; color: #67c23a; }
.expense { font-size: 18px;color: #f56c6c; }

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 25px 0;
  flex-shrink: 0;
}

/* 图表区域：动态缩放的核心 */
.chart-section {
  flex: 1; /* 自动撑开占据所有剩余高度 */
  display: flex;
  flex-direction: column;
  min-height: 0; /* 允许内部元素为了不溢出而缩小 */
}

.sub-title { 
  font-size: 16px; 
  margin: 0 0 15px 0;
  text-align: left;
}

.chart-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0; /* 关键：防止 ECharts 等组件撑破容器 */
}
</style>