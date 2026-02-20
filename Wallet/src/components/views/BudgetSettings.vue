<template>
  <div class="budget-page">
    <h2 class="page-title">Monthly Budget</h2>
    <el-form inline class="form-row">
      <el-form-item label="Month">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="Select month"
          @change="fetchBudget"
        />
      </el-form-item>
      <el-form-item label="Amount">
        <el-input-number v-model="budgetAmount" :min="0" :precision="2" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveBudget">Save Budget</el-button>
      </el-form-item>
    </el-form>

    <el-card v-if="currentBudget" class="progress-card">
      <template #header>Budget Progress</template>
      <div class="progress-info">
        Spent: ￥{{ currentExpense }} / ￥{{ currentBudget.amount }}
      </div>
      <el-progress
        :percentage="Math.min(100, progressPercent)"
        :color="progressPercent >= 80 ? '#f56c6c' : progressPercent >= 60 ? '#e6a23c' : '#67c23a'"
        :stroke-width="12"
      />
      <p v-if="progressPercent >= 80" class="alert-text">
        Budget alert: you have used {{ Math.round(progressPercent) }}% of your budget.
      </p>
    </el-card>

    <el-card class="table-card">
      <template #header>Budget List</template>
      <el-table :data="budgets" stripe>
        <el-table-column prop="month" label="Month" width="120" />
        <el-table-column prop="amount" label="Budget (￥)" width="140" />
        <el-table-column prop="category" label="Category" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import request from '@/utils/request'

interface Budget {
  id: number
  month: string
  amount: number
  category: string | null
}

const budgets = ref<Budget[]>([])
const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const budgetAmount = ref(0)
const currentExpense = ref(0)
const monthlyStats = ref({ income: 0, expense: 0, balance: 0 })

const currentBudget = computed(() =>
  budgets.value.find((b) => b.month === selectedMonth.value && (!b.category || b.category === ''))
)

const progressPercent = computed(() => {
  const b = currentBudget.value
  if (!b || !b.amount) return 0
  return Math.min(100, (currentExpense.value / b.amount) * 100)
})

const fetchBudget = async () => {
  const [budgetsRes, statsRes] = await Promise.all([
    request.get('/api/budgets'),
    request.get(`/api/monthly-stats?month=${selectedMonth.value}`)
  ])
  budgets.value = budgetsRes.data || []
  monthlyStats.value = statsRes.data || { income: 0, expense: 0, balance: 0 }
  const b = budgets.value.find((x) => x.month === selectedMonth.value && (!x.category || x.category === ''))
  budgetAmount.value = b?.amount ?? 0
  currentExpense.value = monthlyStats.value.expense
}

const saveBudget = async () => {
  await request.post('/api/budgets', { month: selectedMonth.value, amount: budgetAmount.value })
  ElMessage.success('Budget saved')
  fetchBudget()
  checkAlert()
}

const checkAlert = () => {
  const pct = progressPercent.value
  if (pct >= 80 && currentBudget.value) {
    ElNotification({
      title: 'Budget Alert',
      message: `You have used ${Math.round(pct)}% of your monthly budget (￥${currentExpense.value} / ￥${currentBudget.value.amount})`,
      type: 'warning'
    })
  }
}

watch(progressPercent, () => {
  if (progressPercent.value >= 80) checkAlert()
})

onMounted(fetchBudget)
</script>

<style scoped>
.budget-page {
  min-height: 100%;
  padding: 24px;
  background: var(--app-bg);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: var(--app-text);
}

.form-row {
  margin-bottom: 24px;
}

.progress-card,
.table-card {
  margin-bottom: 20px;
  background: var(--app-card-bg);
  border: 1px solid var(--app-border);
  border-radius: 12px;
}

.progress-info {
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--app-text-secondary);
}

.alert-text {
  margin-top: 12px;
  font-size: 14px;
  color: #f56c6c;
}
</style>
