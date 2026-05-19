<template>
  <v-card elevation="0" border rounded="lg" class="fill-height">
    <v-card-title class="pa-4 pb-0">
      <div class="text-h6 font-weight-bold">Delivery Status</div>
      <div class="text-caption text-medium-emphasis">Breakdown for current month</div>
    </v-card-title>
    <v-card-text class="pa-4 d-flex flex-column align-center">
      <div style="position: relative; width: 100%; max-width: 260px;">
        <Doughnut :data="chartData" :options="chartOptions" />
        <div class="donut-center">
          <div class="text-h5 font-weight-bold">{{ deliveryStatus.total.toLocaleString() }}</div>
          <div class="text-caption text-medium-emphasis">Total</div>
        </div>
      </div>
      <div class="d-flex ga-4 mt-4 justify-center flex-wrap">
        <div v-for="item in legendItems" :key="item.label" class="text-center">
          <div class="text-h6 font-weight-bold" :style="{ color: item.color }">
            {{ item.value.toLocaleString() }}
          </div>
          <div class="text-caption text-medium-emphasis">{{ item.label }}</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import metrics from '@/src/data/metrics.json'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  region?: string[]
  mode?: string[]
}>()

const regionsByMonth = metrics.regionsByMonth as Record<string, typeof metrics.regions>

const deliveryStatus = computed(() => {
  const hasRegion = !!props.region && props.region.length > 0
  const hasMode = !!props.mode && props.mode.length > 0

  if (!hasRegion && !hasMode) return metrics.deliveryStatus

  const globalLateRatio = metrics.deliveryStatus.late / (metrics.deliveryStatus.late + metrics.deliveryStatus.early)

  if (hasMode) {
    // Derive from shipments array for mode filtering
    const filtered = metrics.shipments.filter((s) => {
      if (!props.mode!.includes(s.mode)) return false
      if (hasRegion && !props.region!.includes(s.originRegion)) return false
      return s.onTime !== null
    })

    // Scale up total from dailyVolume for accurate counts
    const modeKeys = props.mode!.map((m) => m.toLowerCase() as 'ltl' | 'ftl' | 'parcel')
    const mayVolume = metrics.dailyVolume.filter((d) => d.date >= '2026-05-01')
    let total = mayVolume.reduce((s, d) => s + modeKeys.reduce((ms, mk) => ms + d[mk], 0), 0)
    if (hasRegion) {
      const current = regionsByMonth['2026-05'] ?? []
      const selected = current.filter((r) => props.region!.includes(r.region))
      const totalAll = current.reduce((sum, r) => sum + r.shipments, 0)
      const selectedTotal = selected.reduce((sum, r) => sum + r.shipments, 0)
      if (totalAll > 0) total = Math.round(total * selectedTotal / totalAll)
    }

    const sampleTotal = filtered.length
    const sampleOnTime = filtered.filter((s) => s.onTime).length
    const otdRatio = sampleTotal > 0 ? sampleOnTime / sampleTotal : 0.937
    const onTime = Math.round(total * otdRatio)
    const remaining = total - onTime
    const late = Math.round(remaining * globalLateRatio)
    const early = remaining - late

    return { onTime, late, early, total }
  }

  // Region only — aggregate selected regions
  const current = regionsByMonth['2026-05'] ?? []
  const selected = current.filter((r) => props.region!.includes(r.region))
  if (selected.length === 0) return metrics.deliveryStatus

  const total = selected.reduce((sum, r) => sum + r.shipments, 0)
  const onTime = selected.reduce((sum, r) => sum + Math.round(r.shipments * r.onTimePercent / 100), 0)
  const remaining = total - onTime
  const late = Math.round(remaining * globalLateRatio)
  const early = remaining - late

  return { onTime, late, early, total }
})

const colors = {
  onTime: '#0077B6',
  late: '#D62828',
  early: '#F77F00',
}

function createDiagonalPattern(color: string): CanvasPattern {
  const canvas = document.createElement('canvas')
  canvas.width = 10
  canvas.height = 10
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 10, 10)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 10)
  ctx.lineTo(10, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-2, 2)
  ctx.lineTo(2, -2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(8, 12)
  ctx.lineTo(12, 8)
  ctx.stroke()
  return ctx.createPattern(canvas, 'repeat')!
}

function createDotPattern(color: string): CanvasPattern {
  const canvas = document.createElement('canvas')
  canvas.width = 10
  canvas.height = 10
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 10, 10)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.arc(5, 5, 2, 0, Math.PI * 2)
  ctx.fill()
  return ctx.createPattern(canvas, 'repeat')!
}

const latePattern = createDiagonalPattern(colors.late)
const earlyPattern = createDotPattern(colors.early)

const legendItems = computed(() => [
  { label: 'On-Time', value: deliveryStatus.value.onTime, color: colors.onTime },
  { label: 'Late', value: deliveryStatus.value.late, color: colors.late },
  { label: 'Early', value: deliveryStatus.value.early, color: colors.early },
])

const chartData = computed(() => ({
  labels: ['On-Time', 'Late', 'Early'],
  datasets: [
    {
      data: [deliveryStatus.value.onTime, deliveryStatus.value.late, deliveryStatus.value.early],
      backgroundColor: [colors.onTime, latePattern, earlyPattern],
      borderColor: ['#005F8A', '#A31D1D', '#C56200'],
      borderWidth: 2,
      hoverOffset: 6,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  cutout: '72%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1B2A4A',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 6,
      callbacks: {
        label: (ctx: any) => {
          const pct = ((ctx.parsed / deliveryStatus.value.total) * 100).toFixed(1)
          return `${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`
        },
      },
    },
  },
}))
</script>

<style scoped>
.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}
</style>
