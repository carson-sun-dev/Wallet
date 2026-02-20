<template>
  <el-dialog
    v-model="visible"
    title="Import Transactions"
    width="500px"
    destroy-on-close
    @close="reset"
  >
    <div v-if="!parsed.length" class="import-zone" @click="triggerInput">
      <el-icon :size="48" color="#909399"><Upload /></el-icon>
      <p>Click to select Excel (.xlsx) or CSV file</p>
      <input ref="fileInputRef" type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="onFileChange" />
    </div>
    <div v-else>
      <p>Found {{ parsed.length }} records. Preview:</p>
      <el-table :data="parsed.slice(0, 5)" size="small" max-height="200">
        <el-table-column prop="transaction_time" label="Date" width="100">
        <template #default="scope">{{ formatDate(scope.row.transaction_time) }}</template>
      </el-table-column>
        <el-table-column prop="category" label="Category" width="100" />
        <el-table-column prop="type" label="Type" width="80" />
        <el-table-column prop="amount" label="Amount" width="80" />
      </el-table>
      <el-button class="mt-4" @click="reset">Choose another file</el-button>
    </div>
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" :loading="uploading" :disabled="!parsed.length" @click="submitImport">
        Import {{ parsed.length }} records
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { formatDateMMDDYY } from '@/utils/dateFormat'
import { ElMessage } from 'element-plus'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import request from '@/utils/request'

const visible = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const parsed = ref<Record<string, unknown>[]>([])
const uploading = ref(false)

const formatDate = (v: unknown) => formatDateMMDDYY(typeof v === 'string' ? v : undefined)
const emit = defineEmits<{ success: [] }>()

const triggerInput = () => {
  fileInputRef.value?.click()
}

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const ext = file.name.split('.').pop()?.toLowerCase()
  const reader = new FileReader()
  reader.onload = () => {
    let rows: Record<string, unknown>[] = []
    if (ext === 'csv') {
      const result = Papa.parse<Record<string, unknown>>(reader.result as string, { header: true, skipEmptyLines: true })
      rows = result.data || []
    } else if (ext === 'xlsx' || ext === 'xls') {
      const wb = XLSX.read(reader.result, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      const ws = sheetName ? wb.Sheets[sheetName] : undefined
      if (ws) rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]
    }
    parsed.value = normalizeRows(rows)
  }
  if (ext === 'csv') reader.readAsText(file, 'utf-8')
  else reader.readAsArrayBuffer(file)
  input.value = ''
}

function normalizeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((r) => {
    const amount = parseFloat(String(r.amount ?? r.Amount ?? r.amount ?? 0)) || 0
    const category = String(r.category ?? r.Category ?? r.category ?? 'other').trim()
    const type = String(r.type ?? r.Type ?? r.type ?? 'expense').toLowerCase()
    let time = String(r.transaction_time ?? r.time ?? r.date ?? r.transaction_time ?? '')
    if (!time) time = new Date().toISOString().slice(0, 19).replace('T', ' ')
    else if (time.length === 10) time = `${time} 00:00:00`
    return {
      amount,
      category: category || 'other',
      type: type === 'income' || category === 'income' || category === 'bonus' ? 'income' : 'expense',
      transaction_time: time,
      note: String(r.note ?? r.Note ?? r.note ?? '').trim()
    }
  })
}

const reset = () => {
  parsed.value = []
}

const submitImport = async () => {
  if (!parsed.value.length) return
  uploading.value = true
  try {
    await request.post('/api/transactions/batch', parsed.value)
    ElMessage.success(`Imported ${parsed.value.length} records`)
    visible.value = false
    emit('success')
  } catch {
    ElMessage.error('Import failed')
  } finally {
    uploading.value = false
  }
}

const open = () => {
  visible.value = true
  reset()
}

defineExpose({ open })
</script>

<style scoped>
.import-zone {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  color: #909399;
}
.import-zone:hover {
  border-color: #409eff;
  color: #409eff;
}
.hidden {
  display: none;
}
.mt-4 {
  margin-top: 1rem;
}
</style>
