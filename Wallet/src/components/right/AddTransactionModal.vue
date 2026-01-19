<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增账目"
    width="420px"
    destroy-on-close
    align-center
    class="custom-dialog"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      
      <el-form-item label="消费金额" prop="amount">
        <el-input-number 
          v-model="form.amount" 
          :precision="2" 
          :step="10" 
          :min="0"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="消费类型" prop="category">
        <el-select v-model="form.category" placeholder="请选择类型" style="width: 100%">
          <el-option
            v-for="item in categories"
            :key="item.name"
            :label="item.label || item.name"
            :value="item.name"
          >
            <span style="float: left">{{ item.icon }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="交易时间" prop="transaction_time">
        <el-date-picker
          v-model="form.transaction_time"
          type="datetime"
          placeholder="选择日期和时间"
          style="width: 100%"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>

      <el-form-item label="备注说明">
        <el-input 
          v-model="form.note" 
          type="textarea" 
          rows="3" 
          placeholder="写点什么..." 
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" color="#1a3a63">确认保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import axios from 'axios'

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const categories = ref<any[]>([])

const form = reactive({
  amount: 0,
  category: '',
  transaction_time: '',
  type: 'expense',
  note: ''
})

const filteredCategories = computed(() => {
  if (form.type === 'income') {
    return categories.value.filter(c => c.name === 'income' || c.name === 'bonus');
  }
  return categories.value.filter(c => c.name !== 'income');
});

// 表单校验规则
const rules = {
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  transaction_time: [{ required: true, message: '请选择时间', trigger: 'change' }]
}

// 打开弹窗的方法
const open = async () => {
  dialogVisible.value = true
  // 默认填入当前时间
  form.transaction_time = new Date().toISOString().slice(0, 19).replace('T', ' ')
  // 获取最新的分类列表
  const res = await axios.get('http://localhost:3000/api/categories')
  categories.value = res.data
}

// 提交
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await axios.post('http://localhost:3000/api/transactions', form)
        ElMessage.success('保存成功！')
        dialogVisible.value = false
        emit('success') // 通知父组件刷新列表
      } catch (err) {
        ElMessage.error('保存失败')
      }
    }
  })
}

const emit = defineEmits(['success'])
defineExpose({ open })
</script>

<style>
.custom-dialog {
  border-radius: 20px !important;
  padding: 10px;
}
</style>