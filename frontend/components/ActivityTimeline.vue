<template>
  <div class="space-y-1">
    <div
      v-for="item in items" :key="item.id"
      class="flex items-center gap-3"
    >
      <img :src="item.avatar_url" class="w-7 h-7 rounded-full shrink-0" />
      <span class="text-xs shrink-0 px-1.5 py-0.5 rounded-sm font-medium" :style="actionStyle(item.type).style">
        {{ actionLabel(item) }}
      </span>
      <a :href="item.repo_url" target="_blank" class="hover:underline text-sm" :style="{ color: c }">
        {{ item.repo }}
      </a>
      <span v-if="item.message" class="text-sm truncate max-w-xs" style="color: #a1a1aa;">{{ item.message }}</span>
      <span class="text-xs ml-auto" style="color: #52525b;">{{ timeAgo(item.created_at) }}</span>
    </div>
    <div v-if="!items?.length" class="text-sm py-6 text-center" style="color: #a1a1aa;">暂无近期动态</div>
  </div>
</template>

<script setup>
const { timeAgo } = useUtils()
const { c } = useTheme()

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const typeMap = {
  PushEvent:       { label: 'push',    bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  CreateEvent:     { label: 'create',  bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
  PullRequestEvent:{ label: 'PR',      bg: 'rgba(147,197,253,0.15)', color: '#93c5fd' },
  IssuesEvent:     { label: 'issue',   bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  WatchEvent:      { label: 'star',    bg: 'rgba(244,114,132,0.15)', color: '#f472b6' },
  ForkEvent:       { label: 'fork',    bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  ReleaseEvent:    { label: 'release', bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
}

function actionLabel(item) {
  return typeMap[item.type]?.label || item.type
}

function actionStyle(type) {
  const t = typeMap[type] || { bg: 'rgba(161,161,170,0.15)', color: '#a1a1aa' }
  return { style: { backgroundColor: t.bg, color: t.color } }
}
</script>
