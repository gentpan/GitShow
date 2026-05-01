<template>
  <div class="w-full">
    <div class="flex items-end justify-between mb-3">
      <h3 class="text-sm font-medium" style="color: #a1a1aa;">每日活动</h3>
      <span class="text-xs" style="color: #52525b;">最近 14 天</span>
    </div>
    <div class="flex items-end gap-[6px] h-36">
      <div
        v-for="(day, i) in chartData" :key="i"
        class="flex-1 flex flex-col items-center gap-1.5 group"
      >
        <div
          class="w-full relative transition-all duration-500"
          :style="barStyle(day.count)"
        >
          <div
            class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1.5 py-0.5"
            style="background-color: #16a34a; color: #000;"
          >
            {{ day.count }}
          </div>
        </div>
        <div class="text-[10px]" style="color: #52525b;">{{ formatDay(day.date) }}</div>
      </div>
    </div>
    <div class="flex justify-between mt-2 text-[10px]" style="color: #52525b;">
      <span>{{ formatFullDate(chartData[0]?.date) }}</span>
      <span>{{ formatFullDate(chartData[chartData.length - 1]?.date) }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  heatmap: { type: Array, default: () => [] }
})

const chartData = computed(() => {
  if (!props.heatmap || props.heatmap.length === 0) return []
  return props.heatmap.slice(-14)
})

const maxCount = computed(() => {
  if (!chartData.value.length) return 0
  return Math.max(...chartData.value.map(d => d.count), 1)
})

function barStyle(count) {
  const pct = maxCount.value ? (count / maxCount.value) * 100 : 0
  const height = Math.max(pct, 4)
  return {
    height: height + '%',
    backgroundColor: count > 0 ? 'rgba(22,163,74,0.7)' : '#1a1a1a',
    minHeight: '4px',
  }
}

function formatDay(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return (d.getMonth() + 1) + '/' + d.getDate()
}

function formatFullDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.getMonth() + 1 + '月' + d.getDate() + '日'
}
</script>
