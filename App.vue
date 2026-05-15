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
      </template>
    </v-app-bar>

    <v-main class="bg-background">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const drawer = ref(true)
const rail = ref(false)
const activeNav = ref('overview')

const isDark = computed(() => theme.global.current.value.dark)

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
