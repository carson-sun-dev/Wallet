<template>
  <div class="right-panel">
    <div class="widget-card goal-card">
      <div class="card-header">
        <span>Saving Goal</span>
        <el-icon><Edit /></el-icon>
      </div>
      <div class="goal-info">
        <h3>New MacBook Pro</h3>
        <p>￥12,500 / ￥20,000</p>
      </div>
      <el-progress :percentage="62.5" :stroke-width="12" color="#7367F0" />
    </div>

    <div class="widget-card actions-card">
      <div class="action-btn primary" @click="addModalRef.open()">
        <span class="plus-icon">+</span>
        <span>Add Transaction</span>
      </div>
      
      <div class="action-grid">
        <div class="sub-btn">Scan</div>
        <div class="sub-btn">Import</div>
      </div>
    </div>

    <div class="widget-card info-card">
      <h4>January Notes</h4>
      <p class="note-text">本月餐饮支出超标，下月需减少外卖次数...</p>
    </div>

    <AddTransactionModal ref="addModalRef" @success="handleUpdate" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Edit } from '@element-plus/icons-vue' // 确保导入图标
import AddTransactionModal from './AddTransactionModal.vue' // 确保路径正确

const addModalRef = ref()

const handleUpdate = () => {
  // 延迟一小下再刷新，给用户看一眼“保存成功”的提示
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};
</script>

<style scoped>
.right-panel {
  display: grid;
  /* 定义两列布局 */
  grid-template-columns: 1fr 1fr; 
  gap: 15px;
  padding: 10px;
}
/* 1. 让 Saving Goal 占满两列（第一行） */
.goal-card {
  grid-column: span 2;
}

/* 2. 让 Add Transaction 占满两列（第二行） */
.actions-card {
  grid-column: span 2;
}

/* 3. 如果后面还有小卡片（比如 Notes 和 Reminders），它们会自动并排在第三行 */
.info-card {
  grid-column: span 1; /* 默认就是1，两个 info-card 就会左右并排 */
}
.widget-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

/* 目标卡片样式 */
.goal-card h3 { font-size: 16px; margin: 10px 0 5px; color: #333; }
.goal-card p { font-size: 13px; color: #999; margin-bottom: 15px; }

/* 按钮样式 */
.action-btn.primary {
  background: #1a3a63; /* 和左侧渐变色呼应 */
  color: white;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;
}

.action-btn.primary:hover { transform: scale(1.02); }

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}

.sub-btn {
  background: #f5f7fa;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.note-text {
  font-size: 13px;
  color: #888;
  line-height: 1.6;
  font-style: italic;
}
</style>