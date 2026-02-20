<template>
  <div ref="chartWrapperRef" class="chart-wrapper">
    <div v-if="hasData" ref="chartRef" class="chart-container"></div>
    <div v-else class="empty-placeholder">No expense data</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

interface CategoryStat {
  category: string
  total_amount: string | number
  icon: string
  color: string
}

const chartRef = ref<HTMLElement | null>(null)
const chartWrapperRef = ref<HTMLElement | null>(null)
const hasData = ref(false)
let myChart: echarts.ECharts | null = null

const initChart = (data: CategoryStat[]) => {
  if (!chartRef.value) return
  if (myChart) myChart.dispose()
  myChart = echarts.init(chartRef.value)

  const chartData = data.map((item) => ({
    value: parseFloat(String(item.total_amount)),
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    itemStyle: { color: item.color || '#5470c6' },
    originIcon: item.icon || ''
  }))

  const option = {
    tooltip: {
      show: true,
      trigger: 'item',
      confine: true,
      position: (point: number[], _params: unknown, _dom: unknown, _rect: unknown, size: { viewSize: number[]; contentSize: number[] }) => {
        const viewWidth = size.viewSize[0] ?? 300
        const viewHeight = size.viewSize[1] ?? 200
        const contentWidth = size.contentSize[0] ?? 120
        const x = Math.max(viewWidth - contentWidth - 12, 10)
        const y = Math.min(Math.max((point[1] ?? 0) - 30, 10), viewHeight - 60)
        return [x, y]
      }
    },
    legend: {
      orient: 'vertical',
      right: 8,
      bottom: 8,
      type: 'scroll',
      formatter: (name: string) => name,
      textStyle: { color: 'rgba(255,255,255,0.95)', fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '62%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: { show: true },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0 }
        },
        data: chartData
      }
    ]
  }

  myChart.setOption(option)
}

const handleResize = () => {
  myChart?.resize()
}

onMounted(async () => {
  try {
    const res = await request.get('/api/all-categories-stats')
    const data = res.data || []
    if (data.length > 0) {
      hasData.value = true
      await nextTick()
      initChart(data)
      window.addEventListener('resize', handleResize)
      setTimeout(handleResize, 100)
    } else {
      hasData.value = false
    }
  } catch {
    hasData.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  myChart?.dispose()
})
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 140px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  width: 100%;
  min-width: 260px;
  height: 180px;
  min-height: 140px;
}

.empty-placeholder {
  padding: 24px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}
</style>
