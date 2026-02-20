<template>
  <div class="accounts-page">
    <div class="page-header">
      <h2 class="page-title">Accounts</h2>
      <el-button type="primary" @click="showAdd = true">Add Account</el-button>
    </div>
    <el-card class="accounts-card">
      <el-table :data="accounts" stripe>
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="type" label="Type" width="140" />
        <el-table-column prop="balance" label="Balance" width="140">
          <template #default="{ row }">￥{{ row.balance }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="160">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="editAccount(row)">Edit</el-button>
            <el-button link type="danger" size="small" @click="deleteAccount(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAdd" title="Add Account" width="400px" @close="resetForm">
      <el-form :model="form" label-width="80px">
        <el-form-item label="Name">
          <el-input v-model="form.name" placeholder="e.g. Cash, Alipay" />
        </el-form-item>
        <el-form-item label="Type">
          <el-select v-model="form.type" placeholder="Select type" style="width: 100%">
            <el-option label="Cash" value="cash" />
            <el-option label="Bank Card" value="bank" />
            <el-option label="Alipay" value="alipay" />
            <el-option label="WeChat" value="wechat" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">Cancel</el-button>
        <el-button type="primary" @click="createAccount">Create</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEdit" title="Edit Account" width="400px" @close="resetForm">
      <el-form :model="form" label-width="80px">
        <el-form-item label="Name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="Cash" value="cash" />
            <el-option label="Bank Card" value="bank" />
            <el-option label="Alipay" value="alipay" />
            <el-option label="WeChat" value="wechat" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">Cancel</el-button>
        <el-button type="primary" @click="updateAccount">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

interface Account {
  id: number
  name: string
  type: string
  balance: number
}

const accounts = ref<Account[]>([])
const showAdd = ref(false)
const showEdit = ref(false)
const form = ref({ id: 0, name: '', type: 'cash' })

const fetchAccounts = async () => {
  const res = await request.get('/api/accounts')
  accounts.value = res.data || []
}

const resetForm = () => {
  form.value = { id: 0, name: '', type: 'cash' }
}

const createAccount = async () => {
  await request.post('/api/accounts', { name: form.value.name, type: form.value.type })
  ElMessage.success('Account created')
  showAdd.value = false
  fetchAccounts()
}

const editAccount = (row: Account) => {
  form.value = { id: row.id, name: row.name, type: row.type }
  showEdit.value = true
}

const updateAccount = async () => {
  await request.put(`/api/accounts/${form.value.id}`, { name: form.value.name, type: form.value.type })
  ElMessage.success('Account updated')
  showEdit.value = false
  fetchAccounts()
}

const deleteAccount = async (row: Account) => {
  await ElMessageBox.confirm(`Delete "${row.name}"?`, 'Confirm')
  await request.delete(`/api/accounts/${row.id}`)
  ElMessage.success('Account deleted')
  fetchAccounts()
}

onMounted(fetchAccounts)
</script>

<style scoped>
.accounts-page {
  min-height: 100%;
  padding: 24px;
  background: var(--app-bg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--app-text);
}

.accounts-card {
  background: var(--app-card-bg);
  border: 1px solid var(--app-border);
  border-radius: 12px;
}
</style>
