<template>
  <div class="transaction-detail-page">
    <div class="header-section">
      <el-button
        @click="$router.push('/home')"
        :icon="ArrowLeft"
        circle
        class="back-btn"
      />
      <h2>All Transactions</h2>
      <el-tag type="info" effect="plain">Total {{ totalCount }} records</el-tag>
    </div>
    <el-card class="table-wrapper">
      <el-table
        :data="transactionList"
        stripe
        height="100%"
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="headerStyle"
      >
        <el-table-column prop="transaction_time" label="Date" width="100" sortable>
          <template #default="scope">{{ formatDateMMDDYY(scope.row.transaction_time) }}</template>
        </el-table-column>
        <el-table-column prop="category" label="Category" width="120" />
        <el-table-column prop="type" label="Type" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'expense' ? 'danger' : 'success'" size="small">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="Amount" width="120">
          <template #default="scope">
            <span :class="scope.row.type" class="amount-cell">
              {{ scope.row.type === 'expense' ? '-' : '+' }}￥{{ scope.row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="Note" show-overflow-tooltip min-width="120" />
      </el-table>
      <div class="pagination-footer">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next, total, jumper"
          :total="totalCount"
          @current-change="fetchData"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import { ArrowLeft } from '@element-plus/icons-vue'
import { formatDateMMDDYY } from '@/utils/dateFormat'

const transactionList = ref<Record<string, unknown>[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const headerStyle = computed(() => ({
  background: 'var(--app-bg)',
  color: 'var(--app-text-secondary)'
}))

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get(`/api/transactions?page=${currentPage.value}`)
    transactionList.value = res.data.data || []
    totalCount.value = res.data.total || 0
  } catch {
    transactionList.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.transaction-detail-page {
  min-height: 100%;
  padding: 20px 24px;
  background: var(--app-bg);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--app-text);
}

.back-btn {
  width: 44px !important;
  height: 44px !important;
  font-size: 18px !important;
  background: var(--app-primary) !important;
  color: white !important;
  border: none !important;
  transition: all 0.2s ease;
}

.back-btn:hover {
  transform: translateX(-4px);
  background: var(--app-primary-light) !important;
}

html.dark .back-btn {
  background: var(--app-primary) !important;
}

html.dark .back-btn:hover {
  background: var(--app-primary-light) !important;
}

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--app-border);
  background: var(--app-card-bg);
}

:deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.pagination-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: center;
  background: var(--app-card-bg);
  border-top: 1px solid var(--app-border);
}

.amount-cell {
  font-weight: 600;
  font-size: 15px;
}

.expense {
  color: #f56c6c;
}

.income {
  color: #67c23a;
}
</style>
