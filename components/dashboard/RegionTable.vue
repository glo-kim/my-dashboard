<template>
  <v-card elevation="0" border rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
      <div>
        <div class="text-h6 font-weight-bold">Regional Performance</div>
        <div class="text-caption text-medium-emphasis">Aggregated by region — {{ selectedMonthLabel }}</div>
      </div>
      <v-select
        v-model="selectedMonth"
        :items="monthOptions"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        style="max-width: 160px;"
      />
    </v-card-title>
    <v-card-text class="pa-4 pt-0">
      <v-data-table
        :headers="headers"
        :items="regions"
        :items-per-page="-1"
        density="comfortable"
        class="region-table"
        hover
      >
        <template #[`item.region`]="{ item }">
          <div class="d-flex align-center ga-2">
            <v-icon size="18" color="primary">mdi-map-marker-outline</v-icon>
            <span class="font-weight-medium">{{ item.region }}</span>
          </div>
        </template>

        <template #[`item.shipments`]="{ item }">
          {{ item.shipments.toLocaleString() }}
        </template>

        <template #[`item.onTimePercent`]="{ item }">
          <v-chip
            :color="otdColor(item.onTimePercent)"
            variant="tonal"
            size="small"
            label
          >
            {{ item.onTimePercent }}%
          </v-chip>
        </template>

        <template #[`item.avgTransitDays`]="{ item }">
          {{ item.avgTransitDays }} days
        </template>

        <template #[`item.exceptions`]="{ item }">
          <v-chip
            :color="item.exceptions > 5 ? 'error' : item.exceptions > 3 ? 'warning' : 'success'"
            variant="tonal"
            size="small"
            label
          >
            {{ item.exceptions }}
          </v-chip>
        </template>

        <template #[`item.revenue`]="{ item }">
          ${{ item.revenue.toLocaleString() }}
        </template>

        <template #bottom />
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import metrics from '@/src/data/metrics.json'

const props = defineProps<{
  region?: string[]
}>()

const regionsByMonth = metrics.regionsByMonth as Record<string, typeof metrics.regions>

const monthOptions = [
  { label: 'Jan 2026', value: '2026-01' },
  { label: 'Feb 2026', value: '2026-02' },
  { label: 'Mar 2026', value: '2026-03' },
  { label: 'Apr 2026', value: '2026-04' },
  { label: 'May 2026', value: '2026-05' },
]

const selectedMonth = ref('2026-05')

const selectedMonthLabel = computed(() =>
  monthOptions.find((m) => m.value === selectedMonth.value)?.label ?? ''
)

const regions = computed(() => {
  const all = regionsByMonth[selectedMonth.value] ?? []
  if (!props.region || props.region.length === 0) return all
  return all.filter((r) => props.region!.includes(r.region))
})

const headers = [
  { title: 'Region', key: 'region', sortable: true },
  { title: 'Shipments', key: 'shipments', sortable: true, align: 'end' as const },
  { title: 'On-Time %', key: 'onTimePercent', sortable: true, align: 'center' as const },
  { title: 'Avg Transit', key: 'avgTransitDays', sortable: true, align: 'end' as const },
  { title: 'Exceptions', key: 'exceptions', sortable: true, align: 'center' as const },
  { title: 'Revenue', key: 'revenue', sortable: true, align: 'end' as const },
]

function otdColor(val: number): string {
  if (val >= 95) return 'success'
  if (val >= 90) return 'warning'
  return 'error'
}
</script>

<style>
.region-table .v-data-table__thead th {
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 0.7rem !important;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.5) !important;
}
</style>
