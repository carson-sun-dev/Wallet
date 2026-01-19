<script setup lang="ts">
import LeftPanel from './components/left/LeftPanel.vue';
import TransactionList from './components/middle/TransactionList.vue';
import RightPanel from './components/right/RightPanel.vue';
import GlobalFooter from './components/footer/GlobalFooter.vue'; // 引入组件
</script>

<template>
  <div class="common-layout">
    <el-container class="outer-container">
      <el-container class="main-content-wrapper">
        
        <el-aside class="dark-card left-panel-aside">
          <div class="panel-inner">
            <LeftPanel />
          </div>
        </el-aside>

        <el-main class="middle-main">
          <TransactionList />
        </el-main>

        <el-aside class="right-panel-aside">
          <RightPanel />
        </el-aside>
        
      </el-container>

      <GlobalFooter />

    </el-container>
  </div>
</template>

<style scoped>
/* 锁死高度，不准滚动 */
:deep(html), :deep(body) {
  height: 100vh;
  overflow: hidden;
}

.outer-container {
  height: 100vh;
  background-color: #dddde6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content-wrapper {
  flex: 1;
  padding: 15px;
  gap: 15px;
  overflow: hidden; /* 核心：不准上下左右滑动 */
}

/* 比例调整：左侧稍微宽一点，给内容留呼吸空间 */
.left-panel-aside {
  flex: 0 0 320px; 
  width: 300px !important;
}

.panel-inner {
  padding: 30px 20px; /* 这里手动控制内部内容的边距 */
  height: 100%;
  box-sizing: border-box;
}

.middle-main {
  flex: 1;
  border-radius: 24px;
  background: transparent; /* 或者保持白色取决于你的 TransactionList */
  padding: 0;
  overflow: hidden;
}

.right-panel-aside {
  flex: 0 0 380px;
  width: 380px !important;
}

.dark-card {
  background: linear-gradient(135deg, #1a3a63 0%, #2a5298 100%);
  border-radius: 28px;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 32px rgba(26, 58, 99, 0.2); /* 增加深蓝色投影，更高端 */
}
</style>