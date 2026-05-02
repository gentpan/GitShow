<template>
  <div class="max-w-[960px] mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold" style="color: #fafafa;">活动看板</h1>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="t in eventTypes" :key="t.type"
          class="px-3 py-1.5 text-xs font-medium transition-colors"
          :class="selectedType === t.type ? 'active-filter' : 'inactive-filter'"
          @click="selectedType = t.type"
        >
          <i :class="[t.icon, 'mr-1']"></i>
          {{ t.label }}
        </button>
      </div>
    </div>

    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 animate-spin" :style="{ borderColor: c, borderTopColor: 'transparent' }" />
    </div>

    <div v-else-if="!filteredFeed?.length" class="text-center py-20" style="color: #a1a1aa;">
      该类型暂无动态
    </div>

    <div v-else class="max-w-[960px] mx-auto space-y-2">
      <div
        v-for="item in filteredFeed" :key="item.id"
        class="flex items-center gap-3 px-4 py-2.5 transition-colors"
        style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);"
        onmouseover="this.style.borderColor='rgba(255,255,255,0.12)'"
        onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'"
      >
        <img :src="item.avatar_url" class="w-8 h-8 rounded-full shrink-0" />
        <span class="text-xs shrink-0 px-1.5 py-0.5 rounded-sm font-medium" :style="actionStyle(item.type).style">
          {{ actionLabel(item) }}
        </span>
        <a :href="item.repo_url" target="_blank" class="hover:underline text-sm truncate" :style="{ color: c }">
          {{ item.repo }}
        </a>
        <span v-if="item.message" class="text-sm truncate max-w-xs" style="color: #a1a1aa;">{{ item.message }}</span>
        <span class="text-xs ml-auto shrink-0" style="color: #52525b;">{{ timeAgo(item.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()
const { timeAgo } = useUtils()
const { c } = useTheme()

const { data: activity, pending } = useAsyncData('activityBoard', () => api.getActivity(undefined, 50))

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

const selectedType = ref('all')

const eventTypes = [
  { type: 'all', label: '全部', icon: 'fas fa-layer-group' },
  { type: 'PushEvent', label: '提交', icon: 'fas fa-code-commit' },
  { type: 'PullRequestEvent', label: 'PR', icon: 'fas fa-code-merge' },
  { type: 'IssuesEvent', label: 'Issue', icon: 'fas fa-circle-dot' },
  { type: 'CreateEvent', label: '创建', icon: 'fas fa-plus' },
  { type: 'WatchEvent', label: 'Star', icon: 'fas fa-star' },
  { type: 'ForkEvent', label: 'Fork', icon: 'fas fa-code-branch' },
  { type: 'ReleaseEvent', label: '发布', icon: 'fas fa-tag' },
]

const filteredFeed = computed(() => {
  if (!activity.value) return []
  if (selectedType.value === 'all') return activity.value
  return activity.value.filter(i => i.type === selectedType.value)
})
</script>

<style scoped>
.active-filter {
  background-color: rgba(var(--theme-primary-rgb), 0.15);
  color: var(--theme-primary);
  border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
}
.inactive-filter {
  background-color: #111;
  color: #a1a1aa;
  border: 1px solid rgba(255,255,255,0.08);
}
.inactive-filter:hover {
  border-color: rgba(255,255,255,0.15);
  color: #fafafa;
}
</style>
