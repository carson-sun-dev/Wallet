<template>
  <div v-if="hasData" ref="chartRef" style="width: 100%; height: 280px;"></div>
  <div v-else class="empty-placeholder">暂无支出数据</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';

// 定义接口，确保 TS 知道后端返回了 color 和 icon
interface CategoryStat {
  category: string;
  total_amount: string | number;
  icon: string;
  color: string;
}

const chartRef = ref<HTMLElement | null>(null);
const hasData = ref(false);
let myChart: echarts.ECharts | null = null;

const initChart = (data: CategoryStat[]) => {
  if (!chartRef.value) return;
  if (myChart) myChart.dispose();
  myChart = echarts.init(chartRef.value);

  const chartData = data.map(item => ({
    value: parseFloat(item.total_amount as string),
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    itemStyle: { color: item.color },
    // 将原始的 icon 存入 data 供 label 使用
    originIcon: item.icon 
  }));

  const option = {
    // 1. 禁用全局浮动提示框，解决遮挡问题
    tooltip: { show: false }, 
    
    series: [
      {
        type: 'pie',
        radius: ['60%', '85%'], // 稍微调细一点，中心空间更充裕
        avoidLabelOverlap: false,
        itemStyle: { 
          borderRadius: 5, 
          borderColor: '#ffffff', // 建议设为和你侧边栏一致的底色
          borderWidth: 1 
        },
        label: {
          show: false,
          position: 'center' // 关键：让标签显示在圆环正中心
        },
        // 2. 配置高亮状态（鼠标移入或点击时）
        emphasis: {
          label: {
            show: true,
            // 自定义中心显示的文字内容
            formatter: (params: any) => {
              return `{icon|${params.data.originIcon}}\n{name|${params.name}}\n{value|￥${params.value}}`;
            },
            rich: {
              icon: { fontSize: 32, padding: [0, 0, 10, 0] },
              name: { fontSize: 18, color: '#fff', padding: [5, 0] },
              value: { fontSize: 14, fontWeight: 'bold', color: '#fff' }
            }
          }
        },
        data: chartData
      }
    ]
  };

  myChart.setOption(option);
};

const handleResize = () => {
  myChart?.resize();
};

onMounted(async () => {
  try {
    // 确保你的后端接口已经改成了带 JOIN 的 SQL
    const res = await axios.get('http://localhost:3000/api/all-categories-stats');
    
    if (res.data && res.data.length > 0) {
      hasData.value = true;
      await nextTick();
      initChart(res.data);
      window.addEventListener('resize', handleResize);
    } else {
      hasData.value = false;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    hasData.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  myChart?.dispose();
});
</script>