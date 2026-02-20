<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import LeftPanel from '@/components/left/LeftPanel.vue'
import TransactionList from '@/components/middle/TransactionList.vue'
import RightPanel from '@/components/right/RightPanel.vue'

const txListRef = ref<InstanceType<typeof TransactionList>>()

let refreshInterval: ReturnType<typeof setInterval>
onMounted(() => {
  refreshInterval = setInterval(() => {
    txListRef.value?.refresh?.()
  }, 30000)
})
onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div class="home-layout">
    <el-container class="outer-container">
      <el-aside class="left-panel-aside">
        <div class="panel-inner">
          <LeftPanel />
        </div>
      </el-aside>

      <el-main class="middle-main">
        <TransactionList ref="txListRef" />
      </el-main>

      <el-aside class="right-panel-aside">
        <RightPanel />
      </el-aside>
    </el-container>
  </div>
</template>

<style scoped>
/* --- 1. 基础布局：填满 main-content，顶底由 App 的 header/footer 固定 --- */
.home-layout {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--app-bg);
  transition: background-color 0.3s ease;
}

.outer-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column; /* 小屏默认：左、中、右纵向排列，三栏都显示 */
  padding: 12px;
  gap: 16px;
  max-width: 1800px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* 小屏：左、右栏与中间一样整宽，全部 block 显示 */
.left-panel-aside,
.right-panel-aside {
  width: 100%;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

/* --- 2. 响应式断点：桌面端 (>= 1024px) --- */
@media (min-width: 1024px) {
  .outer-container {
    flex-direction: row; /* 恢复三栏并排 */
    align-items: stretch;
  }

  /* 左侧栏：使用 clamp 实现动态缩放 */
  .left-panel-aside {
    width: clamp(300px, 22vw, 380px) !important;
    flex: 0 0 clamp(300px, 22vw, 380px);
    display: flex;
    flex-direction: column;
  }

  /* 右侧栏：稍微窄一点，给中间留更多空间 */
  .right-panel-aside {
    width: clamp(280px, 18vw, 340px) !important;
    flex: 0 0 clamp(280px, 18vw, 340px);
    display: flex;
  }

  .middle-main {
    flex: 1;
    min-width: 400px; /* 保证账单列表的阅读体验 */
  }
}

/* --- 3. 响应式断点：平板端 (768px - 1023px) --- */
@media (min-width: 768px) and (max-width: 1023px) {
  .outer-container {
    flex-direction: row;
    flex-wrap: wrap; /* 允许换行 */
  }

  .left-panel-aside {
    width: 320px !important;
    flex: 0 0 320px;
  }

  .middle-main {
    flex: 1;
    min-width: calc(100% - 340px);
  }

  .right-panel-aside {
    width: 100% !important; /* 平板端右侧统计面板掉到下方全屏显示 */
    flex: 0 0 100%;
    margin-top: 10px;
  }
}

/* --- 4. 装饰性样式 --- */
.left-panel-aside {
  background: linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-light) 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 深色模式下的左侧栏 */
html.dark .left-panel-aside {
  background: linear-gradient(135deg, #112235 0%, #1a3a63 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.middle-main {
  padding: 0;
  overflow: visible; /* 配合内置滚动条 */
}

.right-panel-aside {
  background: var(--el-bg-color);
  border-radius: 16px;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 12px 14px;
  box-sizing: border-box;
}

.panel-inner {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

/* 隐藏滚动条但保留功能 */
.middle-main::-webkit-scrollbar {
  display: none;
}
</style>