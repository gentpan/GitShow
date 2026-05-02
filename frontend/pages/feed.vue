<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold" style="color: #fafafa;">动态流</h1>

    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-[#16a34a] border-t-transparent animate-spin" />
    </div>

    <div v-else-if="!feed?.length" class="text-center py-20" style="color: #a1a1aa;">
      暂无动态
    </div>

    <div v-else class="max-w-3xl mx-auto space-y-2">
      <div
        v-for="item in feed" :key="item.id"
        class="flex items-center gap-3 px-4 py-2.5 transition-colors"
        style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);"
        onmouseover="this.style.borderColor='rgba(255,255,255,0.12)'"
        onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'"
      >
        <img :src="item.avatar_url" class="w-8 h-8 rounded-full shrink-0" />
        <span class="text-sm shrink-0" style="color: #a1a1aa;">
          <template v-if="item.type === 'PushEvent'">pushed to</template>
          <template v-else-if="item.type === 'CreateEvent'">{{ item.action }} in</template>
          <template v-else-if="item.type === 'PullRequestEvent'">{{ item.action }} in</template>
          <template v-else-if="item.type === 'IssuesEvent'">{{ item.action }} in</template>
          <template v-else-if="item.type === 'WatchEvent'">{{ item.action }}</template>
          <template v-else-if="item.type === 'ForkEvent'">{{ item.action }}</template>
          <template v-else-if="item.type === 'ReleaseEvent'">{{ item.action }} in</template>
          <template v-else>{{ item.action || item.type }}</template>
        </span>
        <a :href="item.repo_url" target="_blank" class="hover:underline text-sm truncate" style="color: #16a34a;">
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
const { data: feed, pending } = useAsyncData('feed', () => api.getFeed(50))
</script>
