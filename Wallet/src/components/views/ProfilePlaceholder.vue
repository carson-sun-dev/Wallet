<template>
  <div class="profile-page">
    <div class="page-header">
      <el-button :icon="ArrowLeft" circle class="back-btn" @click="$router.push('/home')" />
      <h2 class="page-title">Profile</h2>
    </div>
    <el-card class="profile-card">
      <div class="profile-header">
        <div class="avatar-placeholder">
          <el-icon :size="48"><User /></el-icon>
        </div>
        <h2 class="profile-title">User Center</h2>
        <p v-if="auth.user" class="profile-subtitle">
          Welcome, {{ auth.user.username }}
        </p>
        <p v-if="auth.user" class="profile-email">{{ auth.user.email }}</p>
      </div>
      <div class="profile-actions">
        <el-button class="action-btn" @click="showManageAccount = true">
          Manage Account
        </el-button>
        <el-button type="danger" class="action-btn" @click="handleLogout">
          Logout
        </el-button>
      </div>

    <el-dialog v-model="showManageAccount" title="Manage Account" width="400px" @open="syncManageForm">
      <el-form :model="manageForm" label-position="top">
        <el-form-item label="Username">
          <el-input v-model="manageForm.username" placeholder="Username" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="manageForm.email" type="email" placeholder="Email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showManageAccount = false">Cancel</el-button>
        <el-button type="primary" @click="handleUpdateProfile">Save</el-button>
      </template>
    </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User, ArrowLeft } from '@element-plus/icons-vue'
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const auth = useAuthStore()
const router = useRouter()
const showManageAccount = ref(false)
const manageForm = reactive({ username: '', email: '' })

const syncManageForm = () => {
  if (auth.user) {
    manageForm.username = auth.user.username ?? ''
    manageForm.email = auth.user.email ?? ''
  }
}

watch(
  () => auth.user,
  (u) => {
    if (u) {
      manageForm.username = u.username ?? ''
      manageForm.email = u.email ?? ''
    }
  },
  { immediate: true }
)

const handleUpdateProfile = async () => {
  if (!manageForm.username.trim() || !manageForm.email.trim()) {
    ElMessage.warning('Username and email are required')
    return
  }
  try {
    await request.put('/api/auth/profile', {
      username: manageForm.username.trim(),
      email: manageForm.email.trim()
    })
    auth.setUser({ ...auth.user!, username: manageForm.username.trim(), email: manageForm.email.trim() })
    ElMessage.success('Profile updated')
    showManageAccount.value = false
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Update failed'
    ElMessage.error(msg)
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-page {
  min-height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--app-bg);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 480px;
  margin-bottom: 20px;
}

.back-btn {
  width: 44px;
  height: 44px;
  background: var(--app-primary) !important;
  color: white !important;
  border: none !important;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--app-primary-light) !important;
}

html.dark .back-btn {
  background: var(--app-primary) !important;
}

html.dark .back-btn:hover {
  background: var(--app-primary-light) !important;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--app-text);
}

.profile-card {
  width: 100%;
  max-width: 480px;
  background: var(--app-card-bg);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

html.dark .profile-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.profile-card :deep(.el-card__body) {
  padding: 32px;
}

.profile-header {
  text-align: center;
  margin-bottom: 28px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.profile-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--app-text);
}

.profile-subtitle {
  font-size: 1rem;
  color: var(--app-text);
  margin: 0 0 4px 0;
}

.profile-email {
  font-size: 0.875rem;
  color: var(--app-text-secondary);
  margin: 0;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 100%;
  height: 44px;
  font-weight: 500;
}
</style>
