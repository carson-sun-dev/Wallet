<template>
  <el-dialog
    v-model="dialogVisible"
    title="New Transaction"
    width="420px"
    destroy-on-close
    align-center
    class="add-tx-dialog"
    :fullscreen="isMobile"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <el-form-item label="Amount" prop="amount">
        <el-input-number
          v-model="form.amount"
          :precision="2"
          :step="10"
          :min="0"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Type">
        <el-radio-group v-model="form.type">
          <el-radio-button value="expense">Expense</el-radio-button>
          <el-radio-button value="income">Income</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Category">
        <el-select v-model="form.category" placeholder="Select category" style="width: 100%" clearable>
          <el-option
            v-for="c in filteredCategories"
            :key="c.name"
            :label="c.name"
            :value="c.name"
          >
            <span class="cat-option">
              <span v-if="(c as { icon?: string }).icon" class="cat-icon">{{ (c as { icon?: string }).icon }}</span>
              {{ c.name }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Account">
        <el-select v-model="form.account_id" placeholder="Select account (optional)" style="width: 100%" clearable>
          <el-option
            v-for="acc in accounts"
            :key="acc.id"
            :label="`${acc.name} (￥${acc.balance})`"
            :value="acc.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Date" prop="transaction_time">
        <el-date-picker
          v-model="form.transaction_time"
          type="date"
          placeholder="Select date"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="Note">
        <el-input v-model="form.note" type="textarea" rows="3" placeholder="Optional note" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="submitForm">Confirm</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import request from '@/utils/request'

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const accounts = ref<{ id: number; name: string; balance: number }[]>([])
const categories = ref<{ name: string; type: string }[]>([])
const isMobile = computed(() => typeof window !== 'undefined' && window.innerWidth < 640)

const filteredCategories = computed(() => {
  const list = categories.value as { name: string; type?: string }[]
  if (!list.length) return []
  const filtered = list.filter((c) => !c.type || c.type === form.type || c.type === 'both')
  return filtered.length ? filtered : list
})

const form = reactive({
  amount: 0,
  transaction_time: '',
  type: 'expense' as 'income' | 'expense',
  category: '',
  note: '',
  account_id: null as number | null
})

const rules = {
  amount: [{ required: true, message: 'Please enter the amount', trigger: 'blur' }],
  transaction_time: [{ required: true, message: 'Please select the date', trigger: 'change' }]
}

const resetForm = () => {
  form.amount = 0
  form.transaction_time = new Date().toISOString().slice(0, 10)
  form.type = 'expense'
  form.category = ''
  form.note = ''
  form.account_id = null
}

const open = async () => {
  resetForm()
  dialogVisible.value = true
  try {
    const [accRes, catRes] = await Promise.all([
      request.get('/api/accounts').catch(() => ({ data: [] })),
      request.get('/api/categories').catch(() => ({ data: [] }))
    ])
    accounts.value = accRes.data || []
    categories.value = catRes.data || []
  } catch {
    accounts.value = []
    categories.value = []
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const category = form.category || (form.type === 'income' ? 'income' : 'other')
      await request.post('/api/transactions', {
        amount: form.amount,
        category,
        transaction_time: form.transaction_time + ' 00:00:00',
        type: form.type,
        note: form.note,
        account_id: form.account_id || undefined
      })
      ElMessage.success('Saved successfully')
      dialogVisible.value = false
      emit('success')
    } catch {
      ElMessage.error('Save failed')
    }
  })
}

const emit = defineEmits<{ success: [] }>()
defineExpose({ open })
</script>

<style scoped>
.add-tx-dialog :deep(.el-dialog) {
  border-radius: 16px;
  background: var(--app-card-bg);
}

.add-tx-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid var(--app-border);
}

.add-tx-dialog :deep(.el-dialog__body) {
  background: var(--app-card-bg);
}

.add-tx-dialog :deep(.el-radio-button__inner) {
  background: var(--app-bg);
  border-color: var(--app-border);
  color: var(--app-text);
}

.add-tx-dialog :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: var(--app-primary);
  border-color: var(--app-primary);
  color: white;
}

.cat-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cat-icon {
  font-size: 16px;
  line-height: 1;
}
</style>
