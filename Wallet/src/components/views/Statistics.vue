<template>
  <div class="statistics-page">
    <div class="page-header">
      <el-button :icon="ArrowLeft" circle class="back-btn" @click="$router.push('/home')" />
      <h2 class="page-title">Statistics</h2>
    </div>
    <div class="charts-grid">
      <el-card class="chart-card">
        <template #header>
          <span class="card-header-text">Expense Trend (30 days)</span>
        </template>
        <ExpenseTrendChart />
      </el-card>
      <el-card class="chart-card">
        <template #header>
          <span class="card-header-text">Monthly Comparison (6 months)</span>
        </template>
        <MonthlyComparisonChart />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import ExpenseTrendChart from '@/components/charts/ExpenseTrendChart.vue'
import MonthlyComparisonChart from '@/components/charts/MonthlyComparisonChart.vue'
</script>

<style scoped>
.statistics-page {
  min-height: 100%;
  padding: 24px;
  background: var(--app-bg);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  width: 44px;
  height: 44px;
  background: var(--app-primary) !important;
  color: white !important;
  border: none !important;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--app-primary-light) !important;
}

html.dark .back-btn {
  background: var(--app-primary) !important;
}

html.dark .back-btn:hover {
  background: var(--app-primary-light) !important;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--app-text);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.chart-card {
  min-height: 380px;
  background: var(--app-card-bg);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  overflow: hidden;
}

.chart-card :deep(.el-card__header) {
  padding: 16px 20px;
  background: var(--app-card-bg);
  border-bottom: 1px solid var(--app-border);
}

.chart-card :deep(.el-card__body) {
  padding: 20px;
  min-height: 300px;
}

.card-header-text {
  font-weight: 600;
  color: var(--app-text);
}
</style>
