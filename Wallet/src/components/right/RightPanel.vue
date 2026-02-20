<template>
  <div class="right-panel">
    <div class="widget-card today-card">
      <div class="card-header">
        <h4>Today's Summary</h4>
      </div>
      <div class="today-stats">
        <div class="today-item">
          <span class="today-label">Income</span>
          <span class="today-val income">￥{{ todayStats.income }}</span>
        </div>
        <div class="today-item">
          <span class="today-label">Expense</span>
          <span class="today-val expense">￥{{ todayStats.expense }}</span>
        </div>
        <div class="today-item total">
          <span class="today-label">Net</span>
          <span class="today-val" :class="todayStats.balance >= 0 ? 'positive' : 'negative'">
            ￥{{ todayStats.balance }}
          </span>
        </div>
      </div>
    </div>

    <div class="widget-card goal-card">
      <div class="card-header">
        <span>Saving Goal</span>
        <el-button link type="primary" size="small" @click="editingGoal = true">Edit</el-button>
      </div>
      <div v-if="!editingGoal" class="goal-info">
        <h3>{{ prefs.savingGoal.title || 'Set your goal' }}</h3>
        <p>￥{{ prefs.savingGoal.current }} / ￥{{ prefs.savingGoal.target || '—' }}</p>
        <el-progress
          v-if="prefs.savingGoal.target > 0"
          :percentage="Math.min(100, (prefs.savingGoal.current / prefs.savingGoal.target) * 100)"
          :stroke-width="12"
          color="#7367F0"
        />
      </div>
      <div v-else class="goal-edit">
        <el-input v-model="goalForm.title" placeholder="Goal name" class="mb-2" />
        <el-input-number v-model="goalForm.target" placeholder="Target" :min="0" class="mb-2" style="width: 100%" />
        <el-input-number v-model="goalForm.current" placeholder="Current" :min="0" class="mb-2" style="width: 100%" />
        <el-button size="small" @click="editingGoal = false">Cancel</el-button>
        <el-button type="primary" size="small" @click="saveGoal">Save</el-button>
      </div>
    </div>

    <div class="widget-card info-card">
      <div class="card-header">
        <h4>Monthly Note</h4>
        <el-button link type="primary" size="small" @click="editingNote = !editingNote">
          {{ editingNote ? 'Done' : 'Edit' }}
        </el-button>
      </div>
      <p v-if="!editingNote" class="note-text">{{ prefs.monthlyNote || 'Add a note for this month...' }}</p>
      <el-input
        v-else
        v-model="prefs.monthlyNote"
        type="textarea"
        :rows="2"
        placeholder="Write your note..."
        @blur="editingNote = false"
      />
    </div>

    <div class="widget-card actions-card">
      <div class="action-btn primary" @click="addModalRef?.open()">
        <span class="plus-icon">+</span>
        <span>Add Transaction</span>
      </div>
      <div class="action-grid">
        <div class="sub-btn" @click="triggerImport">Import</div>
        <div class="sub-btn" @click="triggerExport">Export</div>
      </div>
    </div>

    <div class="widget-card coming-card">
      <div class="coming-placeholder">
        <span class="coming-icon">🚧</span>
        <p class="coming-title">More Features</p>
        <p class="coming-desc">Coming soon...</p>
      </div>
    </div>

    <AddTransactionModal ref="addModalRef" @success="handleUpdate" />
    <ImportModal ref="importModalRef" @success="handleUpdate" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import AddTransactionModal from './AddTransactionModal.vue'
import ImportModal from './ImportModal.vue'
import request from '@/utils/request'
import { useUserPrefsStore } from '@/stores/userPrefs'

const prefs = useUserPrefsStore()
const addModalRef = ref<InstanceType<typeof AddTransactionModal>>()
const importModalRef = ref<InstanceType<typeof ImportModal>>()
const editingGoal = ref(false)
const editingNote = ref(false)
const todayStats = ref({ income: 0, expense: 0, balance: 0 })

const fetchTodayStats = async () => {
  try {
    const res = await request.get('/api/today-stats')
    todayStats.value = res.data || { income: 0, expense: 0, balance: 0 }
  } catch {
    todayStats.value = { income: 0, expense: 0, balance: 0 }
  }
}
const goalForm = reactive({ title: 'New MacBook Pro', target: 20000, current: 12500 })

const saveGoal = () => {
  prefs.setGoal(goalForm.title, goalForm.target, goalForm.current)
  editingGoal.value = false
}

const triggerImport = () => {
  importModalRef.value?.open()
}

const triggerExport = async () => {
  try {
    const res = await request.get('/api/transactions/export?format=csv', { responseType: 'blob' })
    const url = URL.createObjectURL(res.data instanceof Blob ? res.data : new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    // handled by request interceptor
  }
}

const handleUpdate = () => {
  fetchTodayStats()
  setTimeout(() => window.location.reload(), 1000)
}

onMounted(() => {
  prefs.load()
  goalForm.title = prefs.savingGoal.title || 'New MacBook Pro'
  goalForm.target = prefs.savingGoal.target || 20000
  goalForm.current = prefs.savingGoal.current || 12500
  fetchTodayStats()
})
</script>

<style scoped>
.right-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  align-content: start;
  font-family: inherit;
  font-size: 14px;
  color: var(--app-text);
  margin: 0 auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.goal-card {
  grid-column: span 2;
}

.today-card {
  grid-column: span 2;
}

.today-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 6px;
}

.today-item {
  text-align: center;
  padding: 8px 6px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: transform 0.2s, box-shadow 0.2s;
}

.today-item:first-child {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.12) 0%, rgba(103, 194, 58, 0.04) 100%);
  border-color: rgba(103, 194, 58, 0.25);
}

.today-item:nth-child(2) {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.12) 0%, rgba(245, 108, 108, 0.04) 100%);
  border-color: rgba(245, 108, 108, 0.25);
}

.today-item.total {
  font-weight: 600;
  background: linear-gradient(135deg, rgba(26, 58, 99, 0.1) 0%, rgba(26, 58, 99, 0.04) 100%);
  border-color: rgba(26, 58, 99, 0.2);
}

.today-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

html.dark .today-item:first-child {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.18) 0%, rgba(103, 194, 58, 0.06) 100%);
}

html.dark .today-item:nth-child(2) {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.18) 0%, rgba(245, 108, 108, 0.06) 100%);
}

html.dark .today-item.total {
  background: linear-gradient(135deg, rgba(88, 166, 255, 0.12) 0%, rgba(88, 166, 255, 0.04) 100%);
  border-color: rgba(88, 166, 255, 0.25);
}

.today-label {
  display: block;
  font-size: 13px;
  color: var(--app-text-secondary);
  margin-bottom: 4px;
  font-family: inherit;
}

.today-val {
  font-size: 15px;
  font-weight: 600;
  color: var(--app-text);
  font-family: inherit;
}

.today-val.income {
  color: #67c23a;
}

.today-val.expense {
  color: #f56c6c;
}

.today-val.positive {
  color: #67c23a;
}

.today-val.negative {
  color: #f56c6c;
}

.actions-card {
  grid-column: span 2;
}

.coming-card {
  grid-column: span 2;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coming-placeholder {
  text-align: center;
  padding: 12px;
}

.coming-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
  opacity: 0.7;
}

.coming-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text-secondary);
  margin: 0 0 4px 0;
  font-family: inherit;
}

.coming-desc {
  font-size: 13px;
  color: var(--app-text-secondary);
  opacity: 0.8;
  margin: 0;
  font-family: inherit;
}

.info-card {
  grid-column: span 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4,
.card-header span {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--app-text);
  font-family: inherit;
}

.widget-card {
  background: var(--app-card-bg);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  text-align: left;
}

html.dark .widget-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.goal-card h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 6px 0 4px 0;
  color: var(--app-text);
  font-family: inherit;
}

.goal-card p {
  font-size: 13px;
  color: var(--app-text-secondary);
  margin-bottom: 10px;
  font-family: inherit;
}

.goal-edit .mb-2 {
  margin-bottom: 10px;
}

.action-btn.primary {
  background: var(--app-primary);
  color: white;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  transition: transform 0.2s;
  border: none;
}

.action-btn.primary:hover {
  transform: scale(1.02);
  opacity: 0.95;
}

html.dark .action-btn.primary {
  background: var(--app-primary-light);
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

.sub-btn {
  background: var(--app-bg);
  border: 1px solid var(--app-border);
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-family: inherit;
  color: var(--app-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.sub-btn:hover {
  color: var(--app-primary);
  border-color: var(--app-primary);
}

.info-card h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: var(--app-text);
  font-family: inherit;
}

.note-text {
  font-size: 13px;
  color: var(--app-text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
  font-family: inherit;
}
</style>
