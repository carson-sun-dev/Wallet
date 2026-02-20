<template>
  <div class="log_container">
    <el-form ref="formRef" :model="form" :rules="rules" class="login_form">
      <el-form-item prop="login">
        <el-input
          v-model="form.login"
          placeholder="USERNAME / EMAIL"
          :prefix-icon="User"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="PASSWORD"
          :prefix-icon="Lock"
          show-password
          @keyup.enter="handleLogin"
        />
      </el-form-item>

      <div class="form_options">
        <el-checkbox label="REMEMBER ME" size="small" />
        <span class="forgot_pw" @click="emit('forgot-password')">FORGOT PASSWORD?</span>
      </div>

      <div class="button_wrapper">
        <el-button class="custom_submit_btn" :loading="loading" @click="handleLogin">LOGIN</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import request from '@/utils/request'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ login: '', password: '' })
const rules: FormRules = {
  login: [{ required: true, message: 'Please input username or email', trigger: 'blur' }],
  password: [{ required: true, message: 'Please input password', trigger: 'blur' }]
}

const emit = defineEmits<{ (e: 'forgot-password'): void }>()

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await request.post('/api/auth/login', {
        email: form.login,
        username: form.login,
        password: form.password
      })
      const d = res.data
      auth.setTokens(d.accessToken, d.refreshToken, d.user)
      router.push('/home')
      const notif = ElNotification.success({
        title: 'Success',
        message: 'Login success!',
        position: 'top-right',
        duration: 1000,
        customClass: 'login-success-toast'
      })
      nextTick(() => {
        const el = document.querySelector('.login-success-toast')
        if (el) el.addEventListener('mouseenter', () => notif.close())
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.log_container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 8%;
}

.login_form {
  width: 100%;
  max-width: 400px; /* 登录表单通常比注册表单窄一点，更显精致 */
  padding: 10px 0;
  display: flex;
  flex-direction: column;
}

/* 强制输入框为圆弧/胶囊形状 */
:deep(.el-input__wrapper) {
  border-radius: 50px !important;
  padding: 0 15px;
  height: 45px;
  background: var(--app-input-bg) !important;
}

/* 选项行：左右分布 */
.form_options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px 10px 20px 10px;
}

.forgot_pw {
  font-size: 12px;
  color: #909399;
  cursor: pointer;
  transition: color 0.3s;
}
.forgot_pw:hover {
  color: rgb(34, 70, 130);
}

/* 按钮样式保持与 Reg 一致 */
.button_wrapper {
  display: flex;
  justify-content: center;
}

.custom_submit_btn {
  width: 60%; /* 登录按钮通常占满宽度 */
  height: 48px;
  border-radius: 50px !important;
  background-color: rgb(34, 70, 130) !important;
  border: none !important;
  color: white !important;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 1px;
}

.custom_submit_btn:hover {
  opacity: 0.9;
  background-color: rgb(44, 80, 140) !important;
}

/* 移除 Element 默认底边距 */
:deep(.el-form-item) {
  margin-bottom: 15px;
}
</style>