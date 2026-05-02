<template>
  <div class="grid grid-cols-2 gap-3">
    <div
      v-for="item in items" :key="item.id"
      class="px-3 py-2 flex items-center gap-2"
      style="background-color: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06);"
    >
      <img :src="item.avatar_url" class="w-6 h-6 rounded-full shrink-0" />
      <span class="text-xs shrink-0 px-1.5 py-0.5 rounded font-medium" :style="actionStyle(item.type).style">
        {{ actionLabel(item) }}
      </span>
      <a :href="item.actor_url" target="_blank" class="hover:underline text-sm shrink-0" :style="{ color: c }">
        {{ item.actor }}
      </a>
      <span class="text-sm shrink-0" style="color: #52525b;">/</span>
      <a :href="item.repo_url" target="_blank" class="hover:underline text-sm shrink-0" :style="{ color: c }">
        {{ item.repo }}
      </a>
      <span class="text-xs ml-auto shrink-0" style="color: #52525b;">{{ timeAgo(item.created_at) }}</span>
    </div>
    <div v-if="!items?.length" class="col-span-2 text-sm py-6 text-center" style="color: #a1a1aa;">暂无近期动态</div>
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
