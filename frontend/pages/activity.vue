<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold" style="color: #fafafa;">活动看板</h1>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="t in eventTypes" :key="t.type"
          class="px-3 py-1.5 text-xs font-medium transition-colors"
          :class="selectedType === t.type ? 'active-filter' : 'inactive-filter'"
          @click="selectedType = t.type"
        >
          <i :class="t.icon" class="mr-1"></i>
          {{ t.label }}
          <span v-if="counts[t.type]" class="ml-1 opacity-70">({{ counts[t.type] }})</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="t in statTypes" :key="t.type" class="p-4" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
        <div class="flex items-center gap-2 mb-2">
          <i :class="t.icon" style="color: #16a34a;"></i>
          <span class="text-xs" style="color: #a1a1aa;">{{ t.label }}</span>
        </div>
        <div class="text-2xl font-bold" style="color: #fafafa;">{{ counts[t.type] || 0 }}</div>
      </div>
    </div>

    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-[#16a34a] border-t-transparent animate-spin" />
    </div>

    <div v-else-if="!filteredFeed?.length" class="text-center py-20" style="color: #a1a1aa;">
      该类型暂无动态
    </div>

    <div v-else class="max-w-3xl mx-auto space-y-4">
      <div
        v-for="item in filteredFeed" :key="item.id"
        class="p-5 transition-colors"
        style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);"
        onmouseover="this.style.borderColor='rgba(255,255,255,0.12)'"
        onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'"
      >
        <div class="flex items-start gap-3">
          <img :src="item.avatar_url" class="w-10 h-10 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <a :href="`https://github.com/${item.actor}`" target="_blank" class="font-medium hover:text-[#16a34a] transition-colors" style="color: #fafafa;">
                {{ item.actor }}
              </a>
              <span class="text-sm" style="color: #a1a1aa;">{{ item.action }}</span>
              <a :href="item.repo_url" target="_blank" class="hover:underline text-sm truncate" style="color: #16a34a;">
                {{ item.repo }}
              </a>
            </div>
            <div class="text-xs mt-1" style="color: #a1a1aa;">{{ timeAgo(item.created_at) }}</div>

            <div v-if="item.target" class="mt-2 text-sm">
              <a v-if="item.target_url" :href="item.target_url" target="_blank" class="hover:underline" style="color: #16a34a;">
                {{ item.target }}
              </a>
              <span v-else style="color: #16a34a;">{{ item.target }}</span>
            </div>

            <div v-if="item.message" class="mt-2 text-xs px-3 py-2" style="background-color: rgba(0,0,0,0.4); color: #a1a1aa;">
              {{ item.message }}
            </div>

            <div v-if="item.commits?.length && item.type === 'PushEvent'" class="mt-3 space-y-1.5">
              <div
                v-for="(commit, i) in item.commits.slice(0, 3)" :key="i"
                class="flex items-center gap-2 text-sm px-3 py-2"
                style="background-color: rgba(0,0,0,0.4);"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #a1a1aa;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span class="truncate" style="color: #fafafa;">{{ commit.message }}</span>
              </div>
              <div v-if="item.commits.length > 3" class="text-xs pl-2" style="color: #a1a1aa;">
                还有 {{ item.commits.length - 3 }} 个提交...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()
const { timeAgo } = useUtils()

const { data: feed, pending } = useAsyncData('feedBoard', () => api.getFeed(200))

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

const statTypes = eventTypes.filter(t => t.type !== 'all')

const counts = computed(() => {
  const map = {}
  if (!feed.value) return map
  for (const t of statTypes) {
    map[t.type] = feed.value.filter(i => i.type === t.type).length
  }
  return map
})

const filteredFeed = computed(() => {
  if (!feed.value) return []
  if (selectedType.value === 'all') return feed.value
  return feed.value.filter(i => i.type === selectedType.value)
})
</script>

<style scoped>
.active-filter {
  background-color: rgba(22,163,74,0.15);
  color: #16a34a;
  border: 1px solid rgba(22,163,74,0.3);
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
