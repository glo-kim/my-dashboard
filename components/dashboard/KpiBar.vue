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

const kpis = metrics.kpis

const otdColor = computed(() => {
  const val = kpis.onTimeDeliveryRate.value
  if (val >= 95) return 'success'
  if (val >= 90) return 'warning'
  return 'error'
})
</script>
