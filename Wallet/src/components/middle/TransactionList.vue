<template>
  <div class="transaction-list-container">
    <div class="main-header">
      <h2>Recent Transactions</h2>
      <span class="see-all" @click="goToDetail">See All</span>
    </div>
    <div class="transaction-list">
      <div
        v-for="(item, index) in transactions"
        :key="item.id ?? index"
        class="transaction-item"
      >
        <div class="type-dot" :class="item.type" />
        <div class="info">
          <div class="main-row">
            <span class="category">{{ formatCategory(item.category) }}</span>
            <span class="amount" :class="item.type">
              {{ item.type === 'income' ? '+' : '-' }}￥{{ item.amount }}
            </span>
          </div>
          <div class="sub-row">{{ formatDateMMDDYY(item.transaction_time) }}</div>
        </div>
      </div>
      <div v-if="transactions.length === 0 && !loading" class="empty-hint">
        No transactions yet. Add transactions to see them here.
      </div>
      <div v-if="loading" class="empty-hint">Loading...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { useRouter } from 'vue-router'
import { formatDateMMDDYY } from '@/utils/dateFormat'

interface TransactionItem {
  id?: number
  category: string
  type: string
  amount: number | string
  transaction_time: string
  note?: string
}

const router = useRouter()
const transactions = ref<TransactionItem[]>([])
const loading = ref(false)

const goToDetail = () => {
  router.push('/all-transactions')
}

const formatCategory = (name: string) => {
  if (!name) return '—'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/transactions?page=1&pageSize=8')
    transactions.value = res.data?.data || []
  } catch {
    transactions.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

defineExpose({ refresh: fetchData })
</script>

<style scoped>
.transaction-list-container {
  padding: 10px 12px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: linear-gradient(180deg, var(--app-card-bg) 0%, rgba(26, 58, 99, 0.04) 100%);
  border-radius: 10px;
  border: 1px solid var(--app-border);
  min-height: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

html.dark .transaction-list-container {
  background: linear-gradient(180deg, var(--app-card-bg) 0%, rgba(88, 166, 255, 0.06) 100%);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25);
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.main-header h2 {
  font-size: 1.1rem;
  color: var(--app-text);
  margin: 0;
}

.see-all {
  color: var(--app-primary);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(26, 58, 99, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(26, 58, 99, 0.2);
}

html.dark .see-all {
  background: rgba(88, 166, 255, 0.15);
  border-color: rgba(88, 166, 255, 0.3);
}

.see-all:hover {
  background: var(--app-primary);
  color: white;
  transform: translateY(-1px);
}

html.dark .see-all:hover {
  background: var(--app-primary-light);
}

.transaction-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.transaction-list::-webkit-scrollbar {
  display: none;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  min-height: 48px;
  transition: all 0.2s ease;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(26, 58, 99, 0.12);
  backdrop-filter: blur(8px);
}

.transaction-item:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

html.dark .transaction-item {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

html.dark .transaction-item:hover {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-dot.income {
  background: #67c23a;
}

.type-dot.expense {
  background: #f56c6c;
}

.info {
  flex: 1;
  min-width: 0;
}

.main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.category {
  font-weight: 600;
  color: var(--app-text);
  font-size: 14px;
}

.amount {
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}

.amount.income {
  color: #67c23a;
}

.amount.expense {
  color: #f56c6c;
}

.sub-row {
  font-size: 12px;
  color: var(--app-text-secondary);
  margin-top: 2px;
}

.empty-hint {
  padding: 16px;
  text-align: center;
  color: var(--app-text-secondary);
  font-size: 13px;
}
</style>
