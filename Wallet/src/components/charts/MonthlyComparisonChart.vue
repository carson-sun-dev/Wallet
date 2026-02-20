<template>
  <div class="chart-wrapper">
    <div v-if="hasData" ref="chartRef" class="chart-container"></div>
    <div v-else class="empty-placeholder">No monthly comparison data. Add transactions to see the chart.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

const chartRef = ref<HTMLElement | null>(null)
const hasData = ref(false)
let chart: echarts.ECharts | null = null

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const toMonthLabel = (ym: string) => {
  const parts = ym.split('-')
  if (parts.length >= 2) {
    const p1 = parts[1]
    if (p1) {
      const m = parseInt(p1, 10)
      if (m >= 1 && m <= 12) return MONTH_NAMES[m - 1]
    }
  }
  return ym
}

const initChart = (data: { month?: string; income: number; expense: number }[]) => {
  if (!chartRef.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
  const months = data.map((d) => toMonthLabel(d.month ?? ''))
  const income = data.map((d) => d.income)
  const expense = data.map((d) => d.expense)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Income', 'Expense'],
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { interval: 0 }
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      { name: 'Income', type: 'bar', data: income, itemStyle: { color: '#67c23a' }, barMaxWidth: 28 },
      { name: 'Expense', type: 'bar', data: expense, itemStyle: { color: '#f56c6c' }, barMaxWidth: 28 }
    ]
  })
}

const onResize = () => chart?.resize()

onMounted(async () => {
  try {
    const res = await request.get('/api/monthly-comparison?months=6')
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
