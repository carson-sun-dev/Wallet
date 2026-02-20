<template>
  <el-footer height="52px" class="global-footer">
    <div class="footer-inner">
      <div class="nav-group">
        <div
          v-for="item in menuItems"
          :key="item.path"
          :class="['nav-item', { active: currentRoutePath === item.path }]"
          @click="handleNav(item.path)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </div>
      </div>
      <div class="version-tag">v1.0.2</div>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Monitor, User, InfoFilled, DataLine } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const currentRoutePath = computed(() => route.path)

const menuItems = [
  { path: '/home', label: 'Home', icon: Monitor },
  { path: '/statistics', label: 'Statistics', icon: DataLine },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/about', label: 'About', icon: InfoFilled }
]

const handleNav = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.global-footer {
  flex-shrink: 0;
  background: var(--footer-bg);
  border-top: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.footer-inner {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.nav-group {
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: center;
}

@media (min-width: 768px) {
  .nav-group {
    gap: 48px;
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--footer-text);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 56px;
}

.nav-item:hover,
.nav-item.active {
  color: var(--footer-active);
}

.nav-item.active {
  font-weight: 600;
}

.nav-item.active::after {
  content: '';
  width: 4px;
  height: 4px;
  background: var(--footer-active);
  border-radius: 50%;
  margin-top: 2px;
}

.nav-item span {
  font-size: 11px;
}

@media (min-width: 768px) {
  .nav-item span {
    font-size: 12px;
  }
}

.nav-item .el-icon {
  font-size: 16px;
}

.version-tag {
  position: absolute;
  right: 0;
  font-size: 12px;
  color: var(--footer-text);
}
</style>
