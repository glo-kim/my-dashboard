<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      color="primary"
      class="app-sidebar"
    >
      <v-list-item
        class="px-4 py-3"
        :prepend-icon="rail ? 'mdi-truck-fast-outline' : undefined"
      >
        <template v-if="!rail">
          <v-list-item-title class="text-h6 font-weight-bold text-white">
            FastForward
          </v-list-item-title>
          <v-list-item-subtitle class="text-white" style="opacity: 0.7">
            Operations Dashboard
          </v-list-item-subtitle>
        </template>
      </v-list-item>

      <v-divider class="mb-1" style="opacity: 0.2" />

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          :active="item.value === activeNav"
          rounded="lg"
          class="mx-2 my-1"
          active-class="nav-item-active"
          @click="scrollTo(item.value)"
        />
      </v-list>

      <template #append>
        <v-list density="compact" nav>
          <v-list-item
            :prepend-icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            title="Collapse"
            rounded="lg"
            class="mx-2 my-1"
            @click="rail = !rail"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-app-bar flat density="compact" color="surface" border="b">
      <v-app-bar-title class="text-body-1 text-medium-emphasis">
        <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
        {{ currentDate }}
      </v-app-bar-title>
      <template #append>
        <v-btn
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          size="small"
          @click="toggleTheme"
        />
        <v-badge
          :model-value="hasActiveFilters"
          dot
          color="primary"
          offset-x="4"
          offset-y="4"
        >
          <v-btn
            icon="mdi-filter-variant"
            variant="text"
            size="small"
            @click="filterDrawer = !filterDrawer"
          />
        </v-badge>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="filterDrawer"
      location="right"
      temporary
      width="300"
    >
      <div class="pa-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="text-subtitle-1 font-weight-bold">Filters</div>
          <v-btn
            v-if="hasActiveFilters"
            variant="text"
            size="small"
            prepend-icon="mdi-filter-remove"
            @click="resetFilters"
          >
            Reset
          </v-btn>
        </div>
        <v-select
          v-model="selectedRegion"
          :items="regionOptions"
          item-title="label"
          item-value="value"
          label="Region"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-map-marker-outline"
          class="mb-4"
        />
        <v-select
          v-model="selectedMode"
          :items="modeOptions"
          item-title="label"
          item-value="value"
          label="Shipment Mode"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-truck-outline"
          class="mb-4"
        />
        <v-divider class="my-4" />
        <div v-if="hasActiveFilters" class="text-caption text-medium-emphasis">
          <div class="font-weight-medium mb-2">Active filters:</div>
          <v-chip
            v-if="selectedRegion"
            size="small"
            closable
            class="mr-1 mb-1"
            @click:close="selectedRegion = null"
          >
            {{ selectedRegion }}
          </v-chip>
          <v-chip
            v-if="selectedMode"
            size="small"
            closable
            class="mr-1 mb-1"
            @click:close="selectedMode = null"
          >
            {{ selectedMode }}
          </v-chip>
        </div>
        <div v-else class="text-caption text-medium-emphasis">
          No filters applied. Showing all data.
        </div>
      </div>
    </v-navigation-drawer>

    <v-main class="bg-background">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const drawer = ref(true)
const rail = ref(false)
const activeNav = ref('overview')
const filterDrawer = ref(false)

const isDark = computed(() => theme.global.current.value.dark)

// --- Filter state ---
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

const hasActiveFilters = computed(() => !!selectedRegion.value || !!selectedMode.value)

function resetFilters() {
  selectedRegion.value = null
  selectedMode.value = null
}

provide('selectedRegion', selectedRegion)
provide('selectedMode', selectedMode)

const navItems = [
  { title: 'Overview', icon: 'mdi-view-dashboard-outline', value: 'overview' },
  { title: 'Shipments', icon: 'mdi-package-variant-closed', value: 'shipments' },
  { title: 'Exceptions', icon: 'mdi-alert-circle-outline', value: 'exceptions' },
]

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'fastForwardLight' : 'fastForwardDark'
}

function scrollTo(section: string) {
  activeNav.value = section
  const el = document.getElementById(`section-${section}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style>
.app-sidebar .v-list-item--active .v-list-item__overlay {
  opacity: 0 !important;
}
.nav-item-active {
  background: rgba(255, 255, 255, 0.15) !important;
}
.nav-item-active .v-list-item-title,
.nav-item-active .v-icon {
  color: white !important;
  font-weight: 600;
}
.v-navigation-drawer .v-list-item-title {
  color: rgba(255, 255, 255, 0.85);
}
.v-navigation-drawer .v-icon {
  color: rgba(255, 255, 255, 0.7);
}
</style>
