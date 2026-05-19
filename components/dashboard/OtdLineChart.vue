<template>
  <v-card elevation="0" border rounded="lg" class="fill-height">
    <v-card-title class="d-flex align-center justify-space-between pa-4 pb-0">
      <div>
        <div class="text-h6 font-weight-bold">On-Time Delivery Trend</div>
        <div class="text-caption text-medium-emphasis">Weekly OTD % — last {{ weekRange }} weeks</div>
      </div>
      <v-btn-toggle v-model="weekRange" density="compact" mandatory variant="outlined" divided>
        <v-btn :value="6" size="small">6W</v-btn>
        <v-btn :value="12" size="small">12W</v-btn>
        <v-btn :value="24" size="small">24W</v-btn>
      </v-btn-toggle>
    </v-card-title>
    <v-card-text class="pa-4">
      <Line :data="chartData" :options="chartOptions" :style="{ height: '280px' }" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

const props = defineProps<{
  region?: string | null
}>()

const regionsByMonth = metrics.regionsByMonth as Record<string, typeof metrics.regions>

const regionOtdOffset = computed(() => {
  if (!props.region) return 0
  const current = regionsByMonth['2026-05'] ?? []
  const regionInfo = current.find((r) => r.region === props.region)
  if (!regionInfo) return 0
  const globalOtd = metrics.kpis.onTimeDeliveryRate.value
  return regionInfo.onTimePercent - globalOtd
})

const weeklyOtd = computed(() => {
  if (!props.region) return metrics.weeklyOtd
  const offset = regionOtdOffset.value
  return metrics.weeklyOtd.map((w) => ({
    ...w,
    otdPercent: +Math.min(100, Math.max(0, w.otdPercent + offset)).toFixed(1),
  }))
})

const weekRange = ref(6)

const filteredData = computed(() => weeklyOtd.value.slice(-weekRange.value))

const chartData = computed(() => {
  const data = filteredData.value
  const labels = data.map((w) => {
    const d = new Date(w.start + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  return {
    labels,
    datasets: [
      {
        label: 'OTD %',
        data: data.map((w) => w.otdPercent),
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
        data: Array(data.length).fill(95),
        borderColor: '#E53935',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      },
    ],
  }
})

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
