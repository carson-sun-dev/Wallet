<template>
  <div class="left-panel-container">
    <div class="header-section">
      <h2 class="title">Monthly Summary</h2>
      <div class="amount" :class="amountClass">￥{{ stats.balance }}</div>
      <div class="stat-group">
        <div class="val income">⬆ Income: ￥{{ stats.income }}</div>
        <div class="val expense">⬇ Expenses: ￥{{ stats.expense }}</div>
      </div>
    </div>

    <div v-if="budgetAmount > 0" class="budget-section">
      <h3 class="sub-title">Budget</h3>
      <el-progress
        :percentage="Math.min(100, (stats.expense / budgetAmount) * 100)"
        :color="(stats.expense / budgetAmount) >= 0.8 ? '#f56c6c' : '#67c23a'"
        :stroke-width="8"
      />
      <div class="budget-text">￥{{ stats.expense }} / ￥{{ budgetAmount }}</div>
    </div>

    <div class="divider"></div>

    <div class="slogan-section">
      <p class="slogan-line">MANAGE YOUR ANY COIN.</p>
      <p class="slogan-line">ACHIEVE YOUR GOALS.</p>
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
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'

const stats = ref({
  income: 0,
  expense: 0,
  balance: 0
})
const budgetAmount = ref(0)

const amountClass = computed(() => (stats.value.balance >= 0 ? 'positive' : 'negative'))

onMounted(async () => {
  try {
    const [statsRes, budgetsRes] = await Promise.all([
      request.get('/api/monthly-stats'),
      request.get('/api/budgets').catch(() => ({ data: [] }))
    ])
    stats.value = statsRes.data
    const currentMonth = new Date().toISOString().slice(0, 7)
    const b = budgetsRes.data?.find((x: { month: string }) => x.month === currentMonth)
    budgetAmount.value = b?.amount ?? 0
  } catch {
    // ignore
  }
})
</script>

<style scoped>
.left-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 180px;
  padding: 14px 16px;
  box-sizing: border-box;
  color: rgba(230, 228, 234, 0.95);
  overflow: hidden;
  background: linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-light) 100%);
  border-radius: 12px;
}

html.dark .left-panel-container {
  background: linear-gradient(135deg, #0d2847 0%, #1a3a63 100%);
}

.header-section {
  flex-shrink: 0;
}

.title {
  font-size: 17px;
  margin: 0 0 4px 0;
  margin-bottom: 2%;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.amount {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: -1px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.amount.positive {
  color: #a8e6a3;
}

.amount.negative {
  color: #ffb3b3;
}

.stat-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.val {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.income {
  color: #a8e6a3;
}

.expense {
  color: #ffb3b3;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 12px 0;
  flex-shrink: 0;
}

.budget-section {
  flex-shrink: 0;
}

.budget-text {
  font-size: 12px;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.9);
}

.chart-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.sub-title {
  font-size: 14px;
  margin: 0 0 8px 0;
  text-align: left;
  color: rgba(255, 255, 255, 0.95);
}

.slogan-section {
  flex-shrink: 0;
  text-align: center;
  padding: 6px 0;
}

.slogan-line {
  margin: 2px 0;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.5px;
}

.chart-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}
</style>
