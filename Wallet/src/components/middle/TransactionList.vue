<template>
  <div class="main-container">
    <div class="main-header">
      <h2>Weekly Top Spending</h2>
      <span class="see-all">See All</span>
    </div>

    <div class="transaction-list">
    <div v-for="(item, index) in topCategories" :key="index" class="transaction-item">
    <div class="icon-box" :style="{ backgroundColor: item.color + '22' }"> 
      <span :style="{ color: item.color }">
        {{ item.icon }}
      </span>
    </div>
        
        <div class="info">
          <div class="name">{{ item.category.charAt(0).toUpperCase() + item.category.slice(1) }}</div>
        </div>

        <div class="amount" >
           -￥{{ item.total_amount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';


// 定义一个接口，描述后端返回的数据结构
interface CategoryItem {
  category: string;
  total_amount: string | number;
  icon: string;
  color: string;
}

// 在定义 ref 时传入这个接口类型
const topCategories = ref<CategoryItem[]>([]);
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/top-categories');
    topCategories.value = res.data;
  } catch (error) {
    console.error("获取数据失败:", error);
  }
});

</script>

<style scoped>
.main-container {
  padding: 20px, 30px;
  height: 100%;
  box-sizing: border-box;
  margin-top: 0%;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.main-header h2 { font-size: 24px; color: #333; margin-left: 3%; }
.see-all { color: #409eff; cursor: pointer; font-size: 14px; margin-right: 3%; }

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 3vh;
  overflow: hidden; /* 确保外层不会被内容撑开 */
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 2vh;
  border-radius: 16px;
  height: 10vh;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: #f5f7fa;
}

/* 鼠标悬停变色 */
.transaction-item:hover {
  background-color: #ffffff;
  transform: translateX(5px);
}

.icon-box {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 15px;
}


.info { flex: 1; }
.name { font-weight: 600; color: #333; font-size: 16px; }
.time { font-size: 12px; color: #999; margin-top: 4px; }

.amount { font-size: 18px; font-weight: bold; color: #db5252; }
</style>