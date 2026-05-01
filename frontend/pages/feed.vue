<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold" style="color: #fafafa;">动态流</h1>

    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-[#16a34a] border-t-transparent animate-spin" />
    </div>

    <div v-else-if="!feed?.length" class="text-center py-20" style="color: #a1a1aa;">
      暂无动态
    </div>

    <div v-else class="max-w-3xl mx-auto space-y-4">
      <div
        v-for="item in feed" :key="item.id"
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

            <div v-if="item.commits?.length" class="mt-3 space-y-1.5">
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
const { data: feed, pending } = useAsyncData('feed', () => api.getFeed(50))

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
