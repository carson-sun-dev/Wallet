<template>
  <div class="app-container">
    <header v-if="auth.isLoggedIn" class="app-header">
      <span class="logo">FINANCE TRACKER</span>
      <div class="header-actions">
        <el-switch v-model="theme.isDark" active-text="Dark" inactive-text="Light" />
      </div>
    </header>
    <div class="main-content">
      <router-view />
    </div>
    <GlobalFooter v-if="auth.isLoggedIn" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import GlobalFooter from '@/components/footer/GlobalFooter.vue'

const auth = useAuthStore()
const theme = useThemeStore()
</script>

<style scoped>
.app-container {
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--app-card-bg);
  border-bottom: 1px solid var(--app-border);
}

.logo {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--app-primary);
}

html.dark .logo {
  color: var(--app-primary-light);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: var(--app-bg);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.main-content::-webkit-scrollbar {
  display: none;
}
</style>
