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

            <!-- PushEvent -->
            <div v-if="item.type === 'PushEvent'" class="text-sm mt-0.5">
              <span style="color: #a1a1aa;">pushed to </span>
              <a :href="item.repo_url" target="_blank" class="hover:underline" style="color: #16a34a;">{{ item.repo }}</a>
            </div>

            <!-- CreateEvent -->
            <div v-else-if="item.type === 'CreateEvent'" class="text-sm mt-0.5">
              <span style="color: #a1a1aa;">{{ item.action }}</span>
              <a v-if="item.target_url" :href="item.target_url" target="_blank" class="hover:underline ml-1" style="color: #16a34a;">{{ item.target }}</a>
              <span v-else class="ml-1" style="color: #16a34a;">{{ item.target }}</span>
              <span style="color: #a1a1aa;"> in </span>
              <a :href="item.repo_url" target="_blank" class="hover:underline" style="color: #16a34a;">{{ item.repo }}</a>
            </div>

            <!-- PullRequestEvent -->
            <div v-else-if="item.type === 'PullRequestEvent'" class="text-sm mt-0.5">
              <span style="color: #a1a1aa;">{{ item.action }}</span>
              <a v-if="item.target_url" :href="item.target_url" target="_blank" class="hover:underline ml-1" style="color: #16a34a;">{{ item.target }}</a>
              <span v-else class="ml-1" style="color: #16a34a;">{{ item.target }}</span>
              <span style="color: #a1a1aa;"> in </span>
              <a :href="item.repo_url" target="_blank" class="hover:underline" style="color: #16a34a;">{{ item.repo }}</a>
            </div>

            <!-- IssuesEvent -->
            <div v-else-if="item.type === 'IssuesEvent'" class="text-sm mt-0.5">
              <span style="color: #a1a1aa;">{{ item.action }}</span>
              <a v-if="item.target_url" :href="item.target_url" target="_blank" class="hover:underline ml-1" style="color: #16a34a;">{{ item.target }}</a>
              <span v-else class="ml-1" style="color: #16a34a;">{{ item.target }}</span>
              <span style="color: #a1a1aa;"> in </span>
              <a :href="item.repo_url" target="_blank" class="hover:underline" style="color: #16a34a;">{{ item.repo }}</a>
            </div>

            <!-- WatchEvent -->
            <div v-else-if="item.type === 'WatchEvent'" class="text-sm mt-0.5">
              <span style="color: #a1a1aa;">{{ item.action }}</span>
              <a :href="item.repo_url" target="_blank" class="hover:underline ml-1" style="color: #16a34a;">{{ item.repo }}</a>
            </div>

            <!-- ForkEvent -->
            <div v-else-if="item.type === 'ForkEvent'" class="text-sm mt-0.5">
              <span style="color: #a1a1aa;">{{ item.action }}</span>
              <a :href="item.repo_url" target="_blank" class="hover:underline ml-1" style="color: #16a34a;">{{ item.repo }}</a>
              <span v-if="item.target" style="color: #a1a1aa;"> to </span>
              <a v-if="item.target_url" :href="item.target_url" target="_blank" class="hover:underline" style="color: #16a34a;">{{ item.target }}</a>
            </div>

            <!-- ReleaseEvent -->
            <div v-else-if="item.type === 'ReleaseEvent'" class="text-sm mt-0.5">
              <span style="color: #a1a1aa;">{{ item.action }}</span>
              <a v-if="item.target_url" :href="item.target_url" target="_blank" class="hover:underline ml-1" style="color: #16a34a;">{{ item.target || 'release' }}</a>
              <span v-else class="ml-1" style="color: #16a34a;">{{ item.target || 'release' }}</span>
              <span style="color: #a1a1aa;"> in </span>
              <a :href="item.repo_url" target="_blank" class="hover:underline" style="color: #16a34a;">{{ item.repo }}</a>
            </div>

            <!-- Fallback -->
            <div v-else class="text-sm mt-0.5">
              <span style="color: #a1a1aa;">{{ item.action || item.type }}</span>
              <a :href="item.repo_url" target="_blank" class="hover:underline ml-1" style="color: #16a34a;">{{ item.repo }}</a>
            </div>

            <div v-if="item.message" class="text-xs mt-1 truncate" style="color: #52525b;">{{ item.message }}</div>

            <!-- Commits (PushEvent only) -->
            <div v-if="item.commits?.length && item.type === 'PushEvent'" class="mt-2 space-y-1">
              <div
                v-for="(commit, ci) in item.commits.slice(0, 2)" :key="ci"
                class="flex items-center gap-2 text-xs px-2 py-1"
                style="background-color: rgba(0,0,0,0.4);"
              >
                <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #52525b;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span class="truncate" style="color: #a1a1aa;">{{ commit.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!items?.length" class="text-sm py-6 text-center" style="color: #a1a1aa;">暂无近期动态</div>
  </div>
</template>

<script setup>
const { timeAgo } = useUtils()

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
</script>
