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
  region?: string[]
  mode?: string[]
}>()

const regionsByMonth = metrics.regionsByMonth as Record<string, typeof metrics.regions>
const shipmentsByIdMap = new Map(metrics.shipments.map((s) => [s.id, s]))

const regionData = computed(() => {
  if (!props.region || props.region.length === 0) return null
  const current = regionsByMonth['2026-05'] ?? []
  return current.filter((r) => props.region!.includes(r.region))
})

const prevRegionData = computed(() => {
  if (!props.region || props.region.length === 0) return null
  const prev = regionsByMonth['2026-04'] ?? []
  return prev.filter((r) => props.region!.includes(r.region))
})

const regionShare = computed(() => {
  if (!props.region || props.region.length === 0) return 1
  const current = regionsByMonth['2026-05'] ?? []
  const total = current.reduce((sum, r) => sum + r.shipments, 0)
  const selected = current.filter((r) => props.region!.includes(r.region))
  const selectedTotal = selected.reduce((sum, r) => sum + r.shipments, 0)
  return total > 0 ? selectedTotal / total : 1
})

const kpis = computed(() => {
  const hasRegion = !!props.region && props.region.length > 0
  const hasMode = !!props.mode && props.mode.length > 0

  // No filters: use original data
  if (!hasRegion && !hasMode) return metrics.kpis

  // Region only: aggregate regionsByMonth data
  if (hasRegion && !hasMode && regionData.value && regionData.value.length > 0) {
    const selected = regionData.value
    const prev = prevRegionData.value ?? []

    const totalShipments = selected.reduce((sum, r) => sum + r.shipments, 0)
    const prevShipments = prev.reduce((sum, r) => sum + r.shipments, 0) || totalShipments
    const change = +((((totalShipments - prevShipments) / prevShipments) * 100).toFixed(1))

    const otd = totalShipments > 0
      ? +(selected.reduce((sum, r) => sum + r.onTimePercent * r.shipments, 0) / totalShipments).toFixed(1)
      : metrics.kpis.onTimeDeliveryRate.value
    const prevOtd = prev.length > 0 && prevShipments > 0
      ? +(prev.reduce((sum, r) => sum + r.onTimePercent * r.shipments, 0) / prevShipments).toFixed(1)
      : otd

    const avgTransit = totalShipments > 0
      ? +(selected.reduce((sum, r) => sum + r.avgTransitDays * r.shipments, 0) / totalShipments).toFixed(1)
      : metrics.kpis.avgTransitTime.value
    const prevAvgTransit = prev.length > 0 && prevShipments > 0
      ? +(prev.reduce((sum, r) => sum + r.avgTransitDays * r.shipments, 0) / prevShipments).toFixed(1)
      : avgTransit

    const exceptions = selected.reduce((sum, r) => sum + r.exceptions, 0)

    return {
      totalShipments: {
        value: totalShipments,
        previousMonth: prevShipments,
        change,
        period: 'MTD May 2026',
      },
      onTimeDeliveryRate: {
        value: otd,
        target: 95,
        status: otd >= 95 ? 'green' : otd >= 90 ? 'yellow' : 'red',
        previousMonth: prevOtd,
      },
      avgTransitTime: {
        value: avgTransit,
        previousMonth: prevAvgTransit,
        trend: avgTransit <= prevAvgTransit ? 'down' : 'up',
        unit: 'days',
      },
      openExceptions: {
        value: exceptions,
        critical: Math.round(exceptions * 0.17),
        warning: Math.round(exceptions * 0.48),
        info: exceptions - Math.round(exceptions * 0.17) - Math.round(exceptions * 0.48),
      },
    }
  }

  // Mode involved (mode-only or region+mode): derive from raw data
  const modeKeys = props.mode!.map((m) => m.toLowerCase() as 'ltl' | 'ftl' | 'parcel')
  const mayVolume = metrics.dailyVolume.filter((d) => d.date >= '2026-05-01')
  const aprVolume = metrics.dailyVolume.filter((d) => d.date >= '2026-04-01' && d.date < '2026-05-01')

  let totalShipments = mayVolume.reduce((s, d) => s + modeKeys.reduce((ms, mk) => ms + d[mk], 0), 0)
  let prevShipments = aprVolume.reduce((s, d) => s + modeKeys.reduce((ms, mk) => ms + d[mk], 0), 0)
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
    if (!props.mode!.includes(s.mode)) return false
    if (hasRegion && !props.region!.includes(s.originRegion)) return false
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
    if (!s || !props.mode!.includes(s.mode)) return false
    if (hasRegion && !props.region!.includes(s.originRegion)) return false
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
