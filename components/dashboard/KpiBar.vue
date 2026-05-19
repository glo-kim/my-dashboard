<template>
  <v-row>
    <v-col cols="12" sm="6" lg="3">
      <KpiCard
        title="Total Shipments"
        :value="kpis.totalShipments.value"
        :subtitle="`${kpis.totalShipments.change > 0 ? '+' : ''}${kpis.totalShipments.change}% vs last month`"
        icon="mdi-package-variant-closed"
        icon-color="primary"
        :trend="kpis.totalShipments.change >= 0 ? 'up' : 'down'"
        :trend-color="kpis.totalShipments.change >= 0 ? 'success' : 'error'"
      />
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <KpiCard
        title="On-Time Delivery"
        :value="kpis.onTimeDeliveryRate.value"
        suffix="%"
        :subtitle="`Target: ${kpis.onTimeDeliveryRate.target}%`"
        icon="mdi-clock-check-outline"
        :icon-color="otdColor"
        :trend="kpis.onTimeDeliveryRate.value >= kpis.onTimeDeliveryRate.previousMonth ? 'up' : 'down'"
        :trend-color="otdColor"
      >
        <v-progress-linear
          :model-value="kpis.onTimeDeliveryRate.value"
          :color="otdColor"
          height="4"
          rounded
          class="mt-3"
        />
      </KpiCard>
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <KpiCard
        title="Avg Transit Time"
        :value="`${kpis.avgTransitTime.value}`"
        suffix=" days"
        :subtitle="`Was ${kpis.avgTransitTime.previousMonth} days last month`"
        icon="mdi-timer-outline"
        icon-color="info"
        :trend="kpis.avgTransitTime.trend === 'down' ? 'down' : 'up'"
        :trend-color="kpis.avgTransitTime.trend === 'down' ? 'success' : 'error'"
      />
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <KpiCard
        title="Open Exceptions"
        :value="kpis.openExceptions.value"
        :subtitle="`${kpis.openExceptions.critical} critical · ${kpis.openExceptions.warning} warning`"
        icon="mdi-alert-outline"
        :icon-color="kpis.openExceptions.critical > 0 ? 'error' : 'warning'"
      >
        <div class="d-flex ga-2 mt-3">
          <v-chip size="x-small" color="error" variant="flat" label>
            {{ kpis.openExceptions.critical }} Critical
          </v-chip>
          <v-chip size="x-small" color="warning" variant="flat" label>
            {{ kpis.openExceptions.warning }} Warning
          </v-chip>
          <v-chip size="x-small" color="info" variant="flat" label>
            {{ kpis.openExceptions.info }} Info
          </v-chip>
        </div>
      </KpiCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import KpiCard from './KpiCard.vue'
import metrics from '@/src/data/metrics.json'

const props = defineProps<{
  region?: string | null
  mode?: string | null
}>()

const regionsByMonth = metrics.regionsByMonth as Record<string, typeof metrics.regions>
const shipmentsByIdMap = new Map(metrics.shipments.map((s) => [s.id, s]))

const regionData = computed(() => {
  if (!props.region) return null
  const current = regionsByMonth['2026-05'] ?? []
  return current.find((r) => r.region === props.region) ?? null
})

const prevRegionData = computed(() => {
  if (!props.region) return null
  const prev = regionsByMonth['2026-04'] ?? []
  return prev.find((r) => r.region === props.region) ?? null
})

const regionShare = computed(() => {
  if (!props.region) return 1
  const current = regionsByMonth['2026-05'] ?? []
  const r = current.find((r) => r.region === props.region)
  const total = current.reduce((sum, r) => sum + r.shipments, 0)
  return r && total > 0 ? r.shipments / total : 1
})

const kpis = computed(() => {
  const hasRegion = !!props.region
  const hasMode = !!props.mode

  // No filters: use original data
  if (!hasRegion && !hasMode) return metrics.kpis

  // Region only: use regionsByMonth (more accurate curated data)
  if (hasRegion && !hasMode && regionData.value) {
    const r = regionData.value
    const prev = prevRegionData.value
    const prevShipments = prev?.shipments ?? r.shipments
    const change = +((((r.shipments - prevShipments) / prevShipments) * 100).toFixed(1))

    return {
      totalShipments: {
        value: r.shipments,
        previousMonth: prevShipments,
        change,
        period: 'MTD May 2026',
      },
      onTimeDeliveryRate: {
        value: r.onTimePercent,
        target: 95,
        status: r.onTimePercent >= 95 ? 'green' : r.onTimePercent >= 90 ? 'yellow' : 'red',
        previousMonth: prev?.onTimePercent ?? r.onTimePercent,
      },
      avgTransitTime: {
        value: r.avgTransitDays,
        previousMonth: prev?.avgTransitDays ?? r.avgTransitDays,
        trend: r.avgTransitDays <= (prev?.avgTransitDays ?? r.avgTransitDays) ? 'down' : 'up',
        unit: 'days',
      },
      openExceptions: {
        value: r.exceptions,
        critical: Math.round(r.exceptions * 0.17),
        warning: Math.round(r.exceptions * 0.48),
        info: r.exceptions - Math.round(r.exceptions * 0.17) - Math.round(r.exceptions * 0.48),
      },
    }
  }

  // Mode involved (mode-only or region+mode): derive from raw data
  const modeKey = props.mode!.toLowerCase() as 'ltl' | 'ftl' | 'parcel'
  const mayVolume = metrics.dailyVolume.filter((d) => d.date >= '2026-05-01')
  const aprVolume = metrics.dailyVolume.filter((d) => d.date >= '2026-04-01' && d.date < '2026-05-01')

  let totalShipments = mayVolume.reduce((s, d) => s + d[modeKey], 0)
  let prevShipments = aprVolume.reduce((s, d) => s + d[modeKey], 0)
  if (hasRegion) {
    const share = regionShare.value
    totalShipments = Math.round(totalShipments * share)
    prevShipments = Math.round(prevShipments * share)
  }
  const change = prevShipments > 0
    ? +((((totalShipments - prevShipments) / prevShipments) * 100).toFixed(1))
    : 0

  // OTD & transit from shipments array
  const delivered = metrics.shipments.filter((s) => {
    if (s.onTime === null) return false
    if (s.mode !== props.mode) return false
    if (hasRegion && s.originRegion !== props.region) return false
    return true
  })
  const otdRate = delivered.length > 0
    ? +(((delivered.filter((s) => s.onTime).length / delivered.length) * 100).toFixed(1))
    : metrics.kpis.onTimeDeliveryRate.value

  const withTransit = delivered.filter((s) => s.actualDays !== null)
  const avgTransit = withTransit.length > 0
    ? +(withTransit.reduce((sum, s) => sum + (s.actualDays as number), 0) / withTransit.length).toFixed(1)
    : metrics.kpis.avgTransitTime.value
  const prevAvgTransit = metrics.kpis.avgTransitTime.previousMonth

  // Exceptions by mode
  let filteredExceptions = metrics.exceptions.filter((e) => e.status !== 'Resolved')
  filteredExceptions = filteredExceptions.filter((e) => {
    const s = shipmentsByIdMap.get(e.id)
    if (!s || s.mode !== props.mode) return false
    if (hasRegion && s.originRegion !== props.region) return false
    return true
  })
  const exceptionCount = filteredExceptions.length
  const criticalCount = filteredExceptions.filter((e) => e.severity === 'critical').length
  const warningCount = filteredExceptions.filter((e) => e.severity === 'warning').length
  const infoCount = Math.max(0, exceptionCount - criticalCount - warningCount)

  return {
    totalShipments: {
      value: totalShipments,
      previousMonth: prevShipments,
      change,
      period: 'MTD May 2026',
    },
    onTimeDeliveryRate: {
      value: otdRate,
      target: 95,
      status: otdRate >= 95 ? 'green' : otdRate >= 90 ? 'yellow' : 'red',
      previousMonth: metrics.kpis.onTimeDeliveryRate.previousMonth,
    },
    avgTransitTime: {
      value: avgTransit,
      previousMonth: prevAvgTransit,
      trend: avgTransit <= prevAvgTransit ? 'down' : 'up',
      unit: 'days',
    },
    openExceptions: {
      value: exceptionCount,
      critical: criticalCount,
      warning: warningCount,
      info: infoCount,
    },
  }
})

const otdColor = computed(() => {
  const val = kpis.value.onTimeDeliveryRate.value
  if (val >= 95) return 'success'
  if (val >= 90) return 'warning'
  return 'error'
})
</script>
