<template>
  <div class="reg_container">
    <el-form 
      class="register_form"
      ref="regFormRef"
      :model="regData" 
      :rules="rules" 
    >
      <div class="register_info">
        <el-form-item prop="username">
          <el-input v-model="regData.username" placeholder="USERNAME" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="email">
          <el-input v-model="regData.email" placeholder="EMAIL ADDRESS" :prefix-icon="Message" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="regData.password" type="password" placeholder="PASSWORD" :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input v-model="regData.confirmPassword" type="password" placeholder="CONFIRM PASSWORD" :prefix-icon="Lock" show-password />
        </el-form-item>
      </div>

      <div class="button_wrapper">
        <el-button class="custom_submit_btn" @click="handleRegister(regFormRef)">
          REGISTER
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Message, Lock, User } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import request from '@/utils/request'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const regFormRef = ref<FormInstance>()
const regData = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Please input email', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: ['blur', 'change'] }
  ],
  username: [
    { required: true, message: 'Please input username', trigger: 'blur' },
    { min: 3, max: 15, message: 'Length 3-15 chars', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 6, message: 'At least 6 chars', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm password', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== regData.password) callback(new Error('Passwords do not match!'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

const handleRegister = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (!valid) return
    try {
      const res = await request.post('/api/auth/register', {
        username: regData.username,
        email: regData.email,
        password: regData.password
      })
      const d = res.data
      auth.setTokens(d.accessToken, d.refreshToken, d.user)
      router.push('/home')
      const notif = ElNotification.success({
        title: 'Success',
        message: 'Register success!',
        position: 'top-right',
        duration: 1000,
        customClass: 'login-success-toast'
      })
      nextTick(() => {
        const el = document.querySelector('.login-success-toast')
        if (el) el.addEventListener('mouseenter', () => notif.close())
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Register failed'
      ElMessage.error(msg)
    }
  })
}
</script>

<style scoped>
.reg_container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.register_form {
  width: 100%;
  max-width: 100%;
  min-width: 320px;
  padding: 2rem 0;
  text-align: center;
}


/* 核心：2*2 布局 */
.register_info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* 强制输入框为圆弧/胶囊形状 */
:deep(.el-input__wrapper) {
  border-radius: 50px !important;
  padding: 0 15px;
  height: 45px;
  background: var(--app-input-bg) !important;
}

/* 按钮居中与样式 */
.button_wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.custom_submit_btn {
  width: 280px;
  height: 48px;
  border-radius: 50px !important; /* 胶囊圆角 */
  background-color: rgb(34, 70, 130) !important;
  border: none !important;
  color: white !important;
  font-weight: bold;
  font-size: 1rem;
}

.custom_submit_btn:hover {
  opacity: 0.9;
  background-color: rgb(44, 80, 140) !important;
}
/* 去除表单项默认的底部外边距，改用网格间距控制 */
:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>