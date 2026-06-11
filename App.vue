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
        class="sidebar-logo"
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
            color="primary"
            @click="filterDrawer = !filterDrawer"
          />
        </v-badge>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="filterDrawer"
      location="right"
      width="300"
    >
      <div class="pa-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="text-subtitle-1 font-weight-bold">Filters</div>
          <v-btn
            variant="text"
            size="small"
            color="primary"
            prepend-icon="mdi-filter-remove"
            :disabled="!hasActiveFilters"
            @click="resetFilters"
          >
            Reset
          </v-btn>
        </div>
        <v-expansion-panels v-model="filterPanels" multiple flat>
          <v-expansion-panel value="region">
            <v-expansion-panel-title class="px-0 py-2 text-body-2 font-weight-bold filter-panel-title">
                <v-checkbox
                  class="filter-checkbox parent-checkbox"
                  density="compact"
                  hide-details
                  :model-value="selectedRegion.length === regionOptions.length"
                  :indeterminate="selectedRegion.length > 0 && selectedRegion.length < regionOptions.length"
                  @click.stop
                  @update:model-value="toggleSelectAll('region', $event)"
                  aria-label="Select all regions"
                />
                <span>Region</span>
                <template #actions="{ expanded }">
                  <v-icon :icon="expanded ? 'mdi-minus' : 'mdi-plus'" size="small" />
                </template>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="filter-panel-body">
              <v-checkbox
                v-for="r in regionOptions"
                :key="r"
                :label="r"
                :model-value="selectedRegion.includes(r)"
                density="compact"
                hide-details
                class="filter-checkbox child-checkbox"
                @update:model-value="toggleFilter('region', r, $event)"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel value="mode">
            <v-expansion-panel-title class="px-0 py-2 text-body-2 font-weight-bold filter-panel-title">
                <v-checkbox
                  class="filter-checkbox parent-checkbox"
                  density="compact"
                  hide-details
                  :model-value="selectedMode.length === modeOptions.length"
                  :indeterminate="selectedMode.length > 0 && selectedMode.length < modeOptions.length"
                  @click.stop
                  @update:model-value="toggleSelectAll('mode', $event)"
                  aria-label="Select all shipment modes"
                />
                <span>Shipment Mode</span>
                <template #actions="{ expanded }">
                  <v-icon :icon="expanded ? 'mdi-minus' : 'mdi-plus'" size="small" />
                </template>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="filter-panel-body">
              <v-checkbox
                v-for="m in modeOptions"
                :key="m"
                :label="m"
                :model-value="selectedMode.includes(m)"
                density="compact"
                hide-details
                class="filter-checkbox child-checkbox"
                @update:model-value="toggleFilter('mode', m, $event)"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-divider class="my-4" />
        <div v-if="hasActiveFilters" class="text-caption text-medium-emphasis">
          <div class="font-weight-medium mb-2">Active filters:</div>
          <v-chip
            v-for="r in selectedRegion"
            :key="'region-' + r"
            size="small"
            closable
            color="primary"
            variant="tonal"
            class="mr-1 mb-1 active-filter-chip"
            @click:close="selectedRegion = selectedRegion.filter(v => v !== r)"
          >
            {{ r }}
          </v-chip>
          <v-chip
            v-for="m in selectedMode"
            :key="'mode-' + m"
            size="small"
            closable
            color="primary"
            variant="tonal"
            class="mr-1 mb-1 active-filter-chip"
            @click:close="selectedMode = selectedMode.filter(v => v !== m)"
          >
            {{ m }}
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
const filterPanels = ref(['region', 'mode'])

const isDark = computed(() => theme.global.current.value.dark)

// --- Filter state ---
const selectedRegion = ref<string[]>([])
const selectedMode = ref<string[]>([])

const regionOptions = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
const modeOptions = ['LTL', 'FTL', 'Parcel']

const hasActiveFilters = computed(() => selectedRegion.value.length > 0 || selectedMode.value.length > 0)

function resetFilters() {
  selectedRegion.value = []
  selectedMode.value = []
}

function toggleFilter(key: 'region' | 'mode', value: string, checked: boolean | null) {
  const arr = key === 'region' ? selectedRegion : selectedMode
  if (checked) {
    if (!arr.value.includes(value)) arr.value = [...arr.value, value]
  } else {
    arr.value = arr.value.filter((v) => v !== value)
  }
}
// Select all/none for region or mode
function toggleSelectAll(key: 'region' | 'mode', checked: boolean | null) {
  if (key === 'region') {
    selectedRegion.value = checked ? [...regionOptions] : []
  } else {
    selectedMode.value = checked ? [...modeOptions] : []
  }
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

/* Sidebar logo */
.sidebar-logo {
  padding: 16px 16px;
  justify-content: center;
}

/* Rail (collapsed) mode alignment */
.app-sidebar.v-navigation-drawer--rail .sidebar-logo {
  padding-inline: 24px !important;
  padding-top: 16px;
  padding-bottom: 16px;
  justify-content: center;
}
.app-sidebar.v-navigation-drawer--rail .sidebar-logo .v-list-item__prepend {
  margin-inline-end: 0;
}
.app-sidebar.v-navigation-drawer--rail .sidebar-logo .v-list-item__prepend .v-icon {
  margin-inline-start: 0;
  margin-inline-end: 0;
}
.app-sidebar.v-navigation-drawer--rail .v-list-item {
  padding-inline-start: 30px !important;
  padding-inline-end: 0px !important;
  justify-content: center;
}
.app-sidebar.v-navigation-drawer--rail .v-list-item .v-list-item__prepend {
  margin-inline-end: 0;
}
.app-sidebar.v-navigation-drawer--rail .v-list-item .v-list-item__prepend .v-icon {
  margin-inline-start: 0;
  margin-inline-end: 0;
}
.app-sidebar.v-navigation-drawer--rail .v-list--nav {
  padding-inline-start: 8px !important;
  padding-inline-end: 8px !important;
}
.app-sidebar.v-navigation-drawer--rail .v-list-item.mx-2 {
  margin-inline: 0px !important;
}
.app-sidebar.v-navigation-drawer--rail .nav-item-active {
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px;
}
.filter-panel-body .v-expansion-panel-text__wrapper {
  padding: 0 !important;
}
.filter-checkbox .v-label {
  font-size: 0.8125rem;
  margin-inline-start: 8px;
}
.filter-checkbox {
  flex: none;
}
.filter-checkbox .v-selection-control {
  min-height: unset;
  gap: 0;
}
/* Parent checkbox: 8px gap to icon+label, matching child checkboxes */
.parent-checkbox {
  margin-right: 0;
}
.parent-checkbox .v-selection-control__wrapper {
  margin-right: 8px;
}
.filter-panel-title .parent-label-icon {
  margin-right: 0px;
}
/* Child checkboxes: indented + 8px vertical gap */
.child-checkbox {
  padding-left: 32px;
  margin-top: 0;
  margin-bottom: 0;
}
.child-checkbox + .child-checkbox {
  margin-top: 0;
}
.filter-panel-body .v-expansion-panel-text__wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px !important;
  padding-bottom: 8px !important;
}
.filter-checkbox .v-selection-control__input i {
  color: #1B2A4A !important;
  opacity: 0.7;
}
.filter-checkbox .v-selection-control__input .mdi-checkbox-marked,
.filter-checkbox .v-selection-control__input .mdi-minus-box {
  color: #1B2A4A !important;
  opacity: 1;
}
/* Active filter chips */
.active-filter-chip .v-chip__close {
  color: #1B2A4A;
  opacity: 0.8;
}
.active-filter-chip .v-chip__close:hover {
  opacity: 1;
}
</style>
