<template>
  <v-card elevation="0" border rounded="lg" class="fill-height">
    <v-card-title class="pa-4 pb-0">
      <div class="text-h6 font-weight-bold">On-Time Delivery Trend</div>
      <div class="text-caption text-medium-emphasis">Weekly OTD % — last 12 weeks</div>
    </v-card-title>
    <v-card-text class="pa-4">
      <Line :data="chartData" :options="chartOptions" :style="{ height: '280px' }" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import metrics from '@/src/data/metrics.json'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const weeklyOtd = metrics.weeklyOtd

const labels = weeklyOtd.map((w) => {
  const d = new Date(w.start + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

const chartData = {
  labels,
  datasets: [
    {
      label: 'OTD %',
      data: weeklyOtd.map((w) => w.otdPercent),
      borderColor: '#1B2A4A',
      backgroundColor: 'rgba(27, 42, 74, 0.08)',
      borderWidth: 2.5,
      pointBackgroundColor: '#1B2A4A',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.3,
      fill: true,
    },
    {
      label: '95% Target',
      data: Array(weeklyOtd.length).fill(95),
      borderColor: '#E53935',
      borderWidth: 1.5,
      borderDash: [6, 4],
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 16,
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: '#1B2A4A',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 6,
      callbacks: {
        label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 } },
    },
    y: {
      min: 88,
      max: 100,
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: {
        font: { size: 11 },
        callback: (val: string | number) => `${val}%`,
      },
    },
  },
}
</script>
