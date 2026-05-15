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
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import metrics from '@/src/data/metrics.json'

ChartJS.register(ArcElement, Tooltip, Legend)

const deliveryStatus = metrics.deliveryStatus

const colors = {
  onTime: '#43A047',
  late: '#E53935',
  early: '#1976D2',
}

const legendItems = [
  { label: 'On-Time', value: deliveryStatus.onTime, color: colors.onTime },
  { label: 'Late', value: deliveryStatus.late, color: colors.late },
  { label: 'Early', value: deliveryStatus.early, color: colors.early },
]

const chartData = {
  labels: ['On-Time', 'Late', 'Early'],
  datasets: [
    {
      data: [deliveryStatus.onTime, deliveryStatus.late, deliveryStatus.early],
      backgroundColor: [colors.onTime, colors.late, colors.early],
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}

const chartOptions = {
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
          const pct = ((ctx.parsed / deliveryStatus.total) * 100).toFixed(1)
          return `${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`
        },
      },
    },
  },
}
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
