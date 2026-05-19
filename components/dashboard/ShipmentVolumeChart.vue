<template>
  <v-card elevation="0" border rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between pa-4 pb-0">
      <div>
        <div class="text-h6 font-weight-bold">Shipment Volume</div>
        <div class="text-caption text-medium-emphasis">{{ subtitleText }}</div>
      </div>
      <div class="d-flex align-center ga-2">
        <v-select
          v-model="timePeriod"
          :items="timePeriodOptions"
          item-title="label"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 140px;"
        />
        <v-btn-toggle v-if="!mode" v-model="viewMode" density="compact" mandatory variant="outlined" divided>
          <v-btn value="stacked" size="small">By Mode</v-btn>
          <v-btn value="total" size="small">Total</v-btn>
        </v-btn-toggle>
      </div>
    </v-card-title>
    <v-card-text class="pa-4 pt-2">
      <div style="height: 320px; position: relative;">
        <Bar :data="chartData as any" :options="chartOptions as any" style="height: 100%; width: 100%; position: absolute;" />
      </div>
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

const props = defineProps<{
  region?: string | null
  mode?: string | null
}>()

const regionsByMonth = metrics.regionsByMonth as Record<string, typeof metrics.regions>

const regionShare = computed(() => {
  if (!props.region) return 1
  const current = regionsByMonth['2026-05'] ?? []
  const regionInfo = current.find((r) => r.region === props.region)
  const totalShipments = current.reduce((sum, r) => sum + r.shipments, 0)
  if (!regionInfo || totalShipments === 0) return 1
  return regionInfo.shipments / totalShipments
})

const dailyVolume = computed(() => {
  const share = regionShare.value
  if (share === 1) return metrics.dailyVolume
  return metrics.dailyVolume.map((d) => ({
    ...d,
    count: Math.round(d.count * share),
    ltl: Math.round(d.ltl * share),
    ftl: Math.round(d.ftl * share),
    parcel: Math.round(d.parcel * share),
  }))
})
const viewMode = ref('stacked')
const timePeriod = ref('daily')

const timePeriodOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
]

type VolumeEntry = { label: string; count: number; ltl: number; ftl: number; parcel: number }

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function getQuarter(date: Date): string {
  const q = Math.ceil((date.getMonth() + 1) / 3)
  return `Q${q} ${date.getFullYear()}`
}

function aggregateBy(period: string): VolumeEntry[] {
  // For daily view, show current month only (May 1 – today)
  const sourceData = period === 'daily'
    ? dailyVolume.value.filter((d) => d.date >= '2026-05-01')
    : dailyVolume.value

  if (period === 'daily') {
    return sourceData.map((d) => {
      const date = new Date(d.date + 'T00:00:00')
      return {
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: d.count,
        ltl: d.ltl,
        ftl: d.ftl,
        parcel: d.parcel,
      }
    })
  }

  const buckets = new Map<string, { count: number; ltl: number; ftl: number; parcel: number }>()
  const bucketOrder: string[] = []

  for (const d of sourceData) {
    const date = new Date(d.date + 'T00:00:00')
    let key: string
    if (period === 'weekly') {
      key = getISOWeek(date)
    } else if (period === 'monthly') {
      key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } else {
      key = getQuarter(date)
    }

    if (!buckets.has(key)) {
      buckets.set(key, { count: 0, ltl: 0, ftl: 0, parcel: 0 })
      bucketOrder.push(key)
    }
    const b = buckets.get(key)!
    b.count += d.count
    b.ltl += d.ltl
    b.ftl += d.ftl
    b.parcel += d.parcel
  }

  return bucketOrder.map((key) => ({
    label: key,
    ...buckets.get(key)!,
  }))
}

const aggregatedData = computed(() => aggregateBy(timePeriod.value))

const subtitleText = computed(() => {
  const map: Record<string, string> = {
    daily: 'Daily shipment count — May 2026',
    weekly: 'Weekly shipment count — Jan – May 2026',
    monthly: 'Monthly shipment count — Jan – May 2026',
    quarterly: 'Quarterly shipment count — 2026',
  }
  return map[timePeriod.value]
})

const modeColors: Record<string, string> = { ltl: '#1B2A4A', ftl: '#4A6FA5', parcel: '#94B3D7' }

function getModeValue(d: { count: number; ltl: number; ftl: number; parcel: number }): number {
  if (!props.mode) return d.count
  return d[props.mode.toLowerCase() as 'ltl' | 'ftl' | 'parcel']
}

// Moving average line
const movingAvg = computed(() => {
  const data = aggregatedData.value
  if (timePeriod.value === 'quarterly') return null

  if (timePeriod.value === 'daily') {
    // 7-day moving average for daily
    const filtered = dailyVolume.value.filter((d) => d.date >= '2026-05-01')
    return filtered.map((_, i, arr) => {
      const start = Math.max(0, i - 6)
      const window = arr.slice(start, i + 1)
      return +(window.reduce((s, d) => s + getModeValue(d), 0) / window.length).toFixed(1)
    })
  }

  // For weekly/monthly: rolling average over available buckets
  return data.map((_, i, arr) => {
    const start = Math.max(0, i - 2)
    const window = arr.slice(start, i + 1)
    return +(window.reduce((s, d) => s + getModeValue(d), 0) / window.length).toFixed(1)
  })
})

const avgLabel = computed(() => {
  const map: Record<string, string> = {
    daily: '7-Day Avg',
    weekly: '3-Week Avg',
    monthly: '3-Month Avg',
    quarterly: '',
  }
  return map[timePeriod.value]
})

const chartData = computed(() => {
  const data = aggregatedData.value
  const labels = data.map((d) => d.label)

  // When a specific mode is selected, show only that mode
  if (props.mode) {
    const modeKey = props.mode.toLowerCase() as 'ltl' | 'ftl' | 'parcel'
    const datasets: any[] = [
      {
        label: props.mode,
        data: data.map((d) => d[modeKey]),
        backgroundColor: modeColors[modeKey],
        borderRadius: 3,
        barPercentage: 0.6,
      },
    ]
    if (movingAvg.value) {
      datasets.push({
        label: avgLabel.value,
        data: movingAvg.value,
        type: 'line' as const,
        borderColor: '#F57C00',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        order: 0,
      })
    }
    return { labels, datasets }
  }

  if (viewMode.value === 'stacked') {
    const datasets: any[] = [
      {
        label: 'LTL',
        data: data.map((d) => d.ltl),
        backgroundColor: '#1B2A4A',
        stack: 'shipments',
        borderRadius: 2,
        barPercentage: 0.7,
      },
      {
        label: 'FTL',
        data: data.map((d) => d.ftl),
        backgroundColor: '#4A6FA5',
        stack: 'shipments',
        borderRadius: 2,
        barPercentage: 0.7,
      },
      {
        label: 'Parcel',
        data: data.map((d) => d.parcel),
        backgroundColor: '#94B3D7',
        stack: 'shipments',
        borderRadius: 2,
        barPercentage: 0.7,
      },
    ]
    if (movingAvg.value) {
      datasets.push({
        label: avgLabel.value,
        data: movingAvg.value,
        type: 'line' as const,
        borderColor: '#F57C00',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        order: 0,
      })
    }
    return { labels, datasets }
  }

  const datasets: any[] = [
    {
      label: 'Shipments',
      data: data.map((d) => d.count),
      backgroundColor: '#1B2A4A',
      borderRadius: 3,
      barPercentage: 0.6,
    },
  ]
  if (movingAvg.value) {
    datasets.push({
      label: avgLabel.value,
      data: movingAvg.value,
      type: 'line' as const,
      borderColor: '#F57C00',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
      order: 0,
    })
  }
  return { labels, datasets }
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
