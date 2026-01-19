<template>
  <el-footer height="70px" class="global-footer">
    <div class="footer-inner">
      <div class="nav-group">
        <div 
          v-for="item in menuItems" 
          :key="item.name"
          :class="['nav-item', { active: currentTab === item.name }]"
          @click="currentTab = item.name"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </div>
      </div>

      <div class="version-tag">Version 1.0.2</div>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Monitor, User, InfoFilled } from '@element-plus/icons-vue';

// 模拟当前激活的菜单
const currentTab = ref('home');

const menuItems = [
  { name: 'home', label: '主界面', icon: Monitor },
  { name: 'user', label: '用户中心', icon: User },
  { name: 'about', label: '关于我们', icon: InfoFilled },
];
</script>

<style scoped>
.global-footer {
  background: white;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 40px;
}

.footer-inner {
  width: 100%;
  position: relative; /* 父级相对定位 */
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.nav-group {
  display: flex;
  gap: 80px; /* 菜单项之间的间距 */
  /* 也可以开启绝对居中以防万一 */
  /* position: absolute; left: 50%; transform: translateX(-50%); */
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #909399;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover, .nav-item.active {
  color: #1a3a63;
}

.nav-item.active {
  font-weight: bold;
}

.nav-item span {
  font-size: 12px;
}

.nav-item .el-icon {
  font-size: 22px;
}

.version-tag {
  position: absolute;
  right: 0;
  font-size: 12px;
  color: #c0c4cc;
}
</style>