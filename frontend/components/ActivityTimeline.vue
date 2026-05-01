<template>
  <div class="space-y-5">
    <div v-for="group in groups" :key="group.key">
      <div class="flex items-center gap-3 mb-3">
        <div class="text-xs font-semibold px-2 py-0.5" style="background-color: rgba(22,163,74,0.12); color: #16a34a; border: 1px solid rgba(22,163,74,0.25);">
          {{ group.label }}
        </div>
        <div class="flex-1 h-px" style="background-color: rgba(255,255,255,0.06);"></div>
      </div>
      <div class="space-y-0">
        <div
          v-for="(item, i) in group.items" :key="item.id"
          class="flex gap-3 py-2.5"
          :class="i !== group.items.length - 1 ? 'border-b' : ''"
          style="border-color: rgba(255,255,255,0.04);"
        >
          <img :src="item.avatar_url" class="w-7 h-7 shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-medium" style="color: #fafafa;">{{ item.actor }}</span>
              <span class="text-xs" style="color: #52525b;">{{ timeAgo(item.created_at) }}</span>
            </div>
            <div class="text-sm mt-0.5">
              <span style="color: #a1a1aa;">pushed to </span>
              <a :href="item.repo_url" target="_blank" class="hover:underline" style="color: #16a34a;">{{ item.repo }}</a>
            </div>
            <div v-if="item.message" class="text-xs mt-1 truncate" style="color: #52525b;">{{ item.message }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!items?.length" class="text-sm py-6 text-center" style="color: #a1a1aa;">暂无近期动态</div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] }
})

const groups = computed(() => {
  if (!props.items || props.items.length === 0) return []
  const map = new Map()
  for (const item of props.items) {
    const date = new Date(item.created_at)
    const today = new Date()
    const diff = Math.floor((today - date) / 86400000)
    let label
    if (diff === 0) label = '今天'
    else if (diff === 1) label = '昨天'
    else if (diff < 7) label = diff + ' 天前'
    else label = (date.getMonth() + 1) + '/' + date.getDate()
    const key = date.toDateString()
    if (!map.has(key)) {
      map.set(key, { key, label, items: [] })
    }
    map.get(key).items.push(item)
  }
  return Array.from(map.values())
})

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  const intervals = [
    [31536000, '年前'],
    [2592000, '个月前'],
    [86400, '天前'],
    [3600, '小时前'],
    [60, '分钟前'],
    [1, '秒前']
  ]
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return count + label
  }
  return '刚刚'
}
</script>
