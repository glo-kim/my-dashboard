<template>
  <v-card elevation="0" border rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between pa-4 pb-0">
      <div>
        <div class="text-h6 font-weight-bold">Shipment Volume</div>
        <div class="text-caption text-medium-emphasis">Daily shipment count — last 30 days</div>
      </div>
      <v-btn-toggle v-model="viewMode" density="compact" mandatory variant="outlined" divided>
        <v-btn value="stacked" size="small">By Mode</v-btn>
        <v-btn value="total" size="small">Total</v-btn>
      </v-btn-toggle>
    </v-card-title>
    <v-card-text class="pa-4">
      <Bar :data="chartData" :options="chartOptions" :style="{ height: '320px' }" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import metrics from '@/src/data/metrics.json'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  LineController, BarController, Title, Tooltip, Legend, Filler
)

const dailyVolume = metrics.dailyVolume
const viewMode = ref('stacked')

const labels = dailyVolume.map((d) => {
  const date = new Date(d.date + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

// 7-day moving average
const movingAvg = dailyVolume.map((_, i, arr) => {
  const start = Math.max(0, i - 6)
  const window = arr.slice(start, i + 1)
  return +(window.reduce((s, d) => s + d.count, 0) / window.length).toFixed(1)
})

const chartData = computed(() => {
  if (viewMode.value === 'stacked') {
    return {
      labels,
      datasets: [
        {
          label: 'LTL',
          data: dailyVolume.map((d) => d.ltl),
          backgroundColor: '#1B2A4A',
          stack: 'shipments',
          borderRadius: 2,
          barPercentage: 0.7,
        },
        {
          label: 'FTL',
          data: dailyVolume.map((d) => d.ftl),
          backgroundColor: '#4A6FA5',
          stack: 'shipments',
          borderRadius: 2,
          barPercentage: 0.7,
        },
        {
          label: 'Parcel',
          data: dailyVolume.map((d) => d.parcel),
          backgroundColor: '#94B3D7',
          stack: 'shipments',
          borderRadius: 2,
          barPercentage: 0.7,
        },
        {
          label: '7-Day Avg',
          data: movingAvg,
          type: 'line' as const,
          borderColor: '#F57C00',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
          order: 0,
        },
      ],
    }
  }
  return {
    labels,
    datasets: [
      {
        label: 'Shipments',
        data: dailyVolume.map((d) => d.count),
        backgroundColor: '#1B2A4A',
        borderRadius: 3,
        barPercentage: 0.6,
      },
      {
        label: '7-Day Avg',
        data: movingAvg,
        type: 'line' as const,
        borderColor: '#F57C00',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        order: 0,
      },
    ],
  }
})

const chartOptions = computed(() => ({
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
        pointStyle: 'rectRounded',
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
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 }, maxRotation: 45 },
      stacked: viewMode.value === 'stacked',
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: { font: { size: 11 } },
      stacked: viewMode.value === 'stacked',
    },
  },
}))
</script>
