<template>
  <div class="login-page-wrapper">
    <div class="login-page">
      <div class="login-left">
        <img src="/wallet_icon.png" alt="Logo" class="login-logo" />
        <p class="app_name">FINANCE TRACKER</p>
        <div class="slogan_group">
          <b>
            <p class="slogan">MANAGE YOUR ANY COIN.</p>
            <p class="slogan">ACHIEVE YOUR GOALS.</p>
          </b>
        </div>
        <p class="version">v1.0.2</p>
      </div>

      <div :class="['login-right', { 'login-right-wide': !islogin }]">
        <div class="theme-toggle-corner">
          <el-switch v-model="theme.isDark" active-text="Dark" inactive-text="Light" class="theme-switch" />
        </div>
        <h2 class="welcome-title">{{ islogin ? 'WELCOME BACK!' : 'CREATE AN ACCOUNT' }}</h2>
        <div class="switch_group">
          <div :class="['tab_item', { active: islogin }]" @click="islogin = true">LOGIN</div>
          <div :class="['tab_item', { active: !islogin }]" @click="islogin = false">REGISTER</div>
        </div>
        <div :class="['form_stage', { 'form_stage_wide': !islogin }]">
          <transition name="fade-slide" mode="out-in">
            <div :key="String(islogin)">
              <Log v-if="islogin" @forgot-password="showForgotPassword = true" />
              <Reg v-else />
            </div>
          </transition>
        </div>
        <div class="third_party">
          <div class="divider-text">OR CONTINUE WITH</div>
          <div class="third_party_wrapper">
            <div class="social_btn">
              <img src="https://authjs.dev/img/providers/google.svg" alt="G" /> Google
            </div>
            <div class="social_btn">
              <img src="https://authjs.dev/img/providers/github.svg" alt="Git" /> Github
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showForgotPassword" title="Forgot Password" width="400px" @close="resetForgotForm">
      <el-form :model="forgotForm" label-position="top">
        <el-form-item label="Username">
          <el-input v-model="forgotForm.username" placeholder="Enter your username" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="forgotForm.email" placeholder="Enter your email" type="email" />
        </el-form-item>
        <el-form-item label="New Password">
          <el-input v-model="forgotForm.newPassword" type="password" placeholder="Enter new password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForgotPassword = false">Cancel</el-button>
        <el-button type="primary" @click="handleForgotPassword">Reset Password</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import Log from './Log.vue'
import Reg from './Reg.vue'
import { ref, reactive } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const islogin = ref(true)
const theme = useThemeStore()
const showForgotPassword = ref(false)
const forgotForm = reactive<{ username?: string; email?: string; newPassword?: string }>({})

const resetForgotForm = () => {
  forgotForm.username = ''
  forgotForm.email = ''
  forgotForm.newPassword = ''
}

const handleForgotPassword = async () => {
  if (!forgotForm.username || !forgotForm.email || !forgotForm.newPassword) {
    ElMessage.warning('Please fill all fields')
    return
  }
  if (forgotForm.newPassword!.length < 6) {
    ElMessage.warning('Password must be at least 6 characters')
    return
  }
  try {
    await request.post('/api/auth/forgot-password', {
      username: forgotForm.username,
      email: forgotForm.email,
      newPassword: forgotForm.newPassword
    })
    ElMessage.success('Password updated. Please login.')
    showForgotPassword.value = false
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Reset failed'
    ElMessage.error(msg)
  }
}
</script>

<style scoped>
.login-page-wrapper {
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: var(--app-bg);
}

.login-page {
  width: 100%;
  max-width: 1100px;
  min-height: 90vh;
  display: grid;
  grid-template-columns: 1fr;
  background: var(--app-card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

html.dark .login-page {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

@media (min-width: 900px) {
  .login-page {
    grid-template-columns: 2fr 3fr;
    min-height: 600px;
    max-height: 85vh;
  }
}

.login-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-light) 100%);
  padding: 32px;
  text-align: center;
}

html.dark .login-left {
  background: linear-gradient(135deg, #0d2847 0%, #1a3a63 100%);
}

.login-logo {
  width: 200x;
  max-width: 80%;
  height: auto;
  transition: transform 0.3s ease;
}
.login-logo:hover {
  transform: scale(1.05);
}

.app_name {
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 16px 0 48px 0;
}

.slogan_group {
  margin: 1rem 0 2rem 0;
}

.slogan {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.5rem;
  margin: 4px 0;
}

.version {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
  margin-top: auto;
}

.login-right {
  position: relative;
  padding: 48px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.theme-toggle-corner {
  position: absolute;
  top: 16px;
  right: 20px;
}

.welcome-title {
  text-align: center;
  margin: 0 0 28px 0;
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--app-text);
  width: 100%;
}

.switch_group {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 28px;
  width: 100%;
  max-width: 400px;
}

.login-right-wide .switch_group,
.login-right-wide .third_party {
  max-width: 520px;
}

.tab_item {
  flex: 1;
  padding: 14px 32px;
  text-align: center;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  border-radius: 999px;
  border: 2px solid var(--app-border);
  background: var(--app-input-bg);
  color: var(--app-text-secondary);
  transition: all 0.3s ease;
}

.tab_item:hover {
  border-color: var(--app-primary);
  color: var(--app-primary);
}

.tab_item.active {
  background: var(--app-primary);
  border-color: var(--app-primary);
  color: white;
}

html.dark .tab_item.active {
  background: var(--app-primary-light);
  border-color: var(--app-primary-light);
}

.form_stage {
  width: 100%;
  max-width: 400px;
  min-height: 260px;
}

.form_stage_wide {
  max-width: 520px;
}

.third_party {
  width: 100%;
  max-width: 400px;
  margin-top: 24px;
}

.divider-text {
  text-align: center;
  color: var(--app-text-secondary);
  font-size: 13px;
  margin-bottom: 16px;
}

.third_party_wrapper {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social_btn {
  border: 2px solid var(--app-border);
  padding: 10px 24px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--app-text);
  background: var(--app-input-bg);
  transition: all 0.2s ease;
}

.social_btn:hover {
  border-color: var(--app-primary);
  transform: translateY(-1px);
}

.social_btn img {
  width: 20px;
  height: 20px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
