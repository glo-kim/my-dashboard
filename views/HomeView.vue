<template>
  <v-container fluid class="pa-6">
    <!-- KPI Summary Bar -->
    <div id="section-overview">
      <KpiBar />
    </div>

    <!-- Shipment Volume Chart -->
    <div id="section-shipments" class="mt-6">
      <v-row>
        <v-col cols="12">
          <ShipmentVolumeChart />
        </v-col>
      </v-row>
    </div>

    <!-- OTD + Delivery Status -->
    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <OtdLineChart />
      </v-col>
      <v-col cols="12" lg="4">
        <DeliveryStatusDonut />
      </v-col>
    </v-row>

    <!-- Regional Performance -->
    <v-row class="mt-2">
      <v-col cols="12">
        <RegionTable />
      </v-col>
    </v-row>

    <!-- Exceptions Log -->
    <div id="section-exceptions" class="mt-2">
      <v-row>
        <v-col cols="12">
          <ExceptionTable />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import KpiBar from '@/components/dashboard/KpiBar.vue'
import ShipmentVolumeChart from '@/components/dashboard/ShipmentVolumeChart.vue'
import OtdLineChart from '@/components/dashboard/OtdLineChart.vue'
import DeliveryStatusDonut from '@/components/dashboard/DeliveryStatusDonut.vue'
import RegionTable from '@/components/dashboard/RegionTable.vue'
import ExceptionTable from '@/components/dashboard/ExceptionTable.vue'
</script>
