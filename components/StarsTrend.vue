<template>
  <div class="w-full">
    <div class="flex items-end justify-between mb-3">
      <h3 class="text-sm font-medium" style="color: #a1a1aa;">Star 趋势</h3>
      <span v-if="history?.length" class="text-xs" style="color: #52525b;">
        {{ history[0]?.date }} ~ {{ history[history.length - 1]?.date }}
      </span>
    </div>

    <div v-if="!history?.length" class="text-xs py-4 text-center" style="color: #52525b;">
      数据采集中，缓存刷新后将显示趋势
    </div>

    <div v-else class="flex items-end gap-[3px] h-28">
      <div
        v-for="(point, i) in displayData" :key="i"
        class="flex-1 flex flex-col items-center gap-1 group"
      >
        <div
          class="w-full relative transition-all duration-500"
          :style="barStyle(point.stars)"
        >
          <div
            class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1.5 py-0.5"
            style="background-color: var(--theme-primary); color: #000;"
          >
            {{ point.stars }}
          </div>
        </div>
        <div v-if="showLabel(i, displayData.length)" class="text-[9px]" style="color: #52525b;">
          {{ formatDay(point.date) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  history: { type: Array, default: () => [] }
})
const { rgb } = useTheme()

const displayData = computed(() => {
  if (!props.history || props.history.length === 0) return []
  // Show last 30 points max
  if (props.history.length <= 30) return props.history
  return props.history.slice(-30)
})

const minStars = computed(() => {
  if (!displayData.value.length) return 0
  return Math.min(...displayData.value.map(d => d.stars))
})

const maxStars = computed(() => {
  if (!displayData.value.length) return 0
  return Math.max(...displayData.value.map(d => d.stars), 1)
})

function barStyle(stars) {
  const range = maxStars.value - minStars.value
  const pct = range > 0 ? ((stars - minStars.value) / range) * 100 : 0
  const height = Math.max(pct, 4)
  return {
    height: height + '%',
    backgroundColor: `rgba(${rgb.value}, 0.7)`,
    minHeight: '4px',
  }
}

function formatDay(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return (d.getMonth() + 1) + '/' + d.getDate()
}

function showLabel(index, total) {
  if (total <= 7) return true
  if (index === 0 || index === total - 1) return true
  const step = Math.floor(total / 4)
  return index % step === 0
}
</script>
