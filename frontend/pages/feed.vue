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

              <!-- Action text based on event type -->
              <span class="text-sm" style="color: #a1a1aa;">
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
            </div>
            <div class="text-xs mt-1" style="color: #a1a1aa;">{{ timeAgo(item.created_at) }}</div>

            <!-- Target (PR / Issue / Branch / Fork / Release) -->
            <div v-if="item.target" class="mt-2 text-sm">
              <a v-if="item.target_url" :href="item.target_url" target="_blank" class="hover:underline" style="color: #16a34a;">
                {{ item.target }}
              </a>
              <span v-else style="color: #16a34a;">{{ item.target }}</span>
              <span v-if="item.type === 'ForkEvent'" style="color: #a1a1aa;"> (fork)</span>
            </div>

            <!-- Message / Description -->
            <div v-if="item.message" class="mt-2 text-xs px-3 py-2" style="background-color: rgba(0,0,0,0.4); color: #a1a1aa;">
              {{ item.message }}
            </div>

            <!-- Commits (PushEvent only) -->
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
const { data: feed, pending } = useAsyncData('feed', () => api.getFeed(50))
</script>
