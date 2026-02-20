<template>
  <div class="chart-wrapper">
    <div v-if="hasData" ref="chartRef" class="chart-container"></div>
    <div v-else class="empty-placeholder">No expense trend data. Add transactions to see the chart.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

const chartRef = ref<HTMLElement | null>(null)
const hasData = ref(false)
let chart: echarts.ECharts | null = null

const toMMDDYY = (dateStr: string) => {
  const parts = dateStr.split('-')
  if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
    const yy = parts[0].slice(-2)
    return `${parts[1]}/${parts[2]}/${yy}`
  }
  return dateStr
}

const initChart = (data: { date: string; total: number }[]) => {
  if (!chartRef.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
  const dates = data.map((d) => toMMDDYY(d.date))
  const values = data.map((d) => d.total)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: { type: 'value', name: 'Expense' },
    series: [
      {
        type: 'line',
        data: values,
        smooth: true,
        areaStyle: { opacity: 0.3 },
        lineStyle: { width: 2 },
        itemStyle: { color: '#1a3a63' }
      }
    ]
  })
}

const onResize = () => chart?.resize()

onMounted(async () => {
  try {
    const res = await request.get('/api/expense-trend')
    const data = res.data || []
    if (data.length > 0) {
      hasData.value = true
      await nextTick()
      initChart(data)
      window.addEventListener('resize', onResize)
      setTimeout(onResize, 150)
    } else {
      hasData.value = false
    }
  } catch {
    hasData.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
})
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 280px;
}

.chart-container {
  width: 100%;
  height: 280px;
}

.empty-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text-secondary);
  padding: 24px;
  text-align: center;
}
</style>
