<template>
  <v-card elevation="0" border rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2 flex-wrap ga-2">
      <div>
        <div class="text-h6 font-weight-bold">Exceptions Log</div>
        <div class="text-caption text-medium-emphasis">Active and recently resolved exceptions</div>
      </div>
      <div class="d-flex ga-2">
        <v-select
          v-model="filterType"
          :items="typeOptions"
          label="Type"
          density="compact"
          variant="outlined"
          clearable
          hide-details
          style="min-width: 150px"
        />
        <v-select
          v-model="filterStatus"
          :items="statusOptions"
          label="Status"
          density="compact"
          variant="outlined"
          clearable
          hide-details
          style="min-width: 150px"
        />
      </div>
    </v-card-title>
    <v-card-text class="pa-4 pt-0">
      <v-data-table
        v-model:expanded="expanded"
        :headers="headers"
        :items="filteredExceptions"
        :items-per-page="10"
        item-value="id"
        show-expand
        density="comfortable"
        class="exception-table"
        hover
      >
        <template #[`item.id`]="{ item }">
          <span class="font-weight-medium text-primary">{{ item.id }}</span>
        </template>

        <template #[`item.type`]="{ item }">
          <v-chip
            :color="typeColor(item.type)"
            variant="tonal"
            size="small"
            label
          >
            <v-icon start size="14">{{ typeIcon(item.type) }}</v-icon>
            {{ item.type }}
          </v-chip>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
            :color="statusColor(item.status)"
            variant="flat"
            size="small"
            label
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #[`item.severity`]="{ item }">
          <v-icon :color="severityColor(item.severity)" size="18">
            {{ severityIcon(item.severity) }}
          </v-icon>
        </template>

        <template #[`item.daysOpen`]="{ item }">
          <span :class="item.daysOpen >= 5 ? 'text-error font-weight-bold' : ''">
            {{ item.daysOpen === 0 ? '—' : `${item.daysOpen}d` }}
          </span>
        </template>

        <template #expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="pa-4 bg-grey-lighten-5">
              <div class="d-flex align-start ga-2">
                <v-icon size="18" color="medium-emphasis" class="mt-1">mdi-note-text-outline</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis font-weight-medium mb-1">Notes</div>
                  <div class="text-body-2">{{ item.notes }}</div>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import metrics from '@/src/data/metrics.json'

const exceptions = metrics.exceptions
const expanded = ref<string[]>([])
const filterType = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

const typeOptions = ['Delayed', 'Damaged', 'Address Issue', 'Customs Hold', 'Lost']
const statusOptions = ['Open', 'In Progress', 'Resolved']

const headers = [
  { title: 'Shipment ID', key: 'id', sortable: true },
  { title: 'Origin', key: 'origin', sortable: true },
  { title: 'Destination', key: 'destination', sortable: true },
  { title: 'Carrier', key: 'carrier', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Severity', key: 'severity', sortable: true, align: 'center' as const },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Age', key: 'daysOpen', sortable: true, align: 'center' as const },
]

const filteredExceptions = computed(() => {
  return exceptions.filter((e) => {
    if (filterType.value && e.type !== filterType.value) return false
    if (filterStatus.value && e.status !== filterStatus.value) return false
    return true
  })
})

function typeColor(type: string): string {
  const map: Record<string, string> = {
    Delayed: 'warning',
    Damaged: 'error',
    'Address Issue': 'info',
    'Customs Hold': 'purple',
    Lost: 'error',
  }
  return map[type] ?? 'grey'
}

function typeIcon(type: string): string {
  const map: Record<string, string> = {
    Delayed: 'mdi-clock-alert-outline',
    Damaged: 'mdi-package-variant-remove',
    'Address Issue': 'mdi-map-marker-alert-outline',
    'Customs Hold': 'mdi-shield-alert-outline',
    Lost: 'mdi-package-variant-closed-remove',
  }
  return map[type] ?? 'mdi-alert'
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    Open: 'error',
    'In Progress': 'warning',
    Resolved: 'success',
  }
  return map[status] ?? 'grey'
}

function severityColor(severity: string): string {
  const map: Record<string, string> = {
    critical: 'error',
    warning: 'warning',
    info: 'info',
  }
  return map[severity] ?? 'grey'
}

function severityIcon(severity: string): string {
  const map: Record<string, string> = {
    critical: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information-outline',
  }
  return map[severity] ?? 'mdi-help-circle-outline'
}
</script>

<style>
.exception-table .v-data-table__thead th {
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 0.7rem !important;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.5) !important;
}
</style>
