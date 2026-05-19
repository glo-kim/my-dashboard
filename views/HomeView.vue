<template>
  <v-container fluid class="pa-6">
    <!-- Filters -->
    <v-row class="mb-2" align="center">
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-select
          v-model="selectedRegion"
          :items="regionOptions"
          item-title="label"
          item-value="value"
          label="Filter by Region"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-map-marker-outline"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-select
          v-model="selectedMode"
          :items="modeOptions"
          item-title="label"
          item-value="value"
          label="Filter by Mode"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-truck-outline"
        />
      </v-col>
      <v-col v-if="selectedRegion || selectedMode" cols="auto">
        <v-btn
          variant="tonal"
          size="small"
          prepend-icon="mdi-filter-remove"
          @click="resetFilters"
        >
          Reset Filters
        </v-btn>
      </v-col>
    </v-row>

    <!-- KPI Summary Bar -->
    <div id="section-overview">
      <KpiBar :region="selectedRegion" :mode="selectedMode" />
    </div>

    <!-- Shipment Volume Chart -->
    <div id="section-shipments" class="mt-6">
      <v-row>
        <v-col cols="12">
          <ShipmentVolumeChart :region="selectedRegion" :mode="selectedMode" />
        </v-col>
      </v-row>
    </div>

    <!-- OTD + Delivery Status -->
    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <OtdLineChart :region="selectedRegion" />
      </v-col>
      <v-col cols="12" lg="4">
        <DeliveryStatusDonut :region="selectedRegion" :mode="selectedMode" />
      </v-col>
    </v-row>

    <!-- Regional Performance -->
    <v-row class="mt-2">
      <v-col cols="12">
        <RegionTable :region="selectedRegion" />
      </v-col>
    </v-row>

    <!-- Exceptions Log -->
    <div id="section-exceptions" class="mt-2">
      <v-row>
        <v-col cols="12">
          <ExceptionTable :region="selectedRegion" :mode="selectedMode" />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KpiBar from '@/components/dashboard/KpiBar.vue'
import ShipmentVolumeChart from '@/components/dashboard/ShipmentVolumeChart.vue'
import OtdLineChart from '@/components/dashboard/OtdLineChart.vue'
import DeliveryStatusDonut from '@/components/dashboard/DeliveryStatusDonut.vue'
import RegionTable from '@/components/dashboard/RegionTable.vue'
import ExceptionTable from '@/components/dashboard/ExceptionTable.vue'

const selectedRegion = ref<string | null>(null)
const selectedMode = ref<string | null>(null)

const regionOptions = [
  { label: 'All Regions', value: null },
  { label: 'Northeast', value: 'Northeast' },
  { label: 'Southeast', value: 'Southeast' },
  { label: 'Midwest', value: 'Midwest' },
  { label: 'Southwest', value: 'Southwest' },
  { label: 'West', value: 'West' },
]

const modeOptions = [
  { label: 'All Modes', value: null },
  { label: 'LTL', value: 'LTL' },
  { label: 'FTL', value: 'FTL' },
  { label: 'Parcel', value: 'Parcel' },
]

function resetFilters() {
  selectedRegion.value = null
  selectedMode.value = null
}
</script>
