<template>
  <v-card elevation="0" border rounded="lg" class="pa-4 fill-height">
    <div class="d-flex align-center justify-space-between mb-3">
      <span class="text-caption text-medium-emphasis font-weight-medium text-uppercase tracking-wide">
        {{ title }}
      </span>
      <v-avatar :color="iconColor" size="36" variant="tonal">
        <v-icon size="20">{{ icon }}</v-icon>
      </v-avatar>
    </div>
    <div class="text-h4 font-weight-bold mb-1">{{ formattedValue }}</div>
    <div class="d-flex align-center ga-1">
      <v-icon v-if="trendIcon" :color="trendColor" size="16">{{ trendIcon }}</v-icon>
      <span class="text-caption" :class="trendColor ? `text-${trendColor}` : 'text-medium-emphasis'">
        {{ subtitle }}
      </span>
    </div>
    <slot />
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: number | string
  subtitle: string
  icon: string
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  trendColor?: string
  suffix?: string
}>()

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString() + (props.suffix ?? '')
  }
  return props.value
})

const trendIcon = computed(() => {
  if (props.trend === 'up') return 'mdi-arrow-up'
  if (props.trend === 'down') return 'mdi-arrow-down'
  return null
})
</script>

<style scoped>
.tracking-wide {
  letter-spacing: 0.05em;
}
</style>
