<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold" style="color: #fafafa;">关注的人</h1>

    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2" :style="{ borderColor: c, borderTopColor: 'transparent' }" class="animate-spin" />
    </div>

    <div v-else-if="!following?.length" class="text-center py-20" style="color: #a1a1aa;">
      暂无关注数据
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="user in following" :key="user.username"
        class="p-5 transition-colors"
        style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);"
        onmouseover="this.style.borderColor='rgba(255,255,255,0.12)'"
        onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'"
      >
        <div class="flex items-center gap-3">
          <img :src="user.avatar_url" class="w-12 h-12" />
          <div class="min-w-0">
              <a :href="`https://github.com/${user.username}`" target="_blank" class="font-semibold truncate block hover:text-[var(--theme-primary)] transition-colors" style="color: #fafafa;">
              {{ user.username }}
            </a>
            <p v-if="user.bio" class="text-xs truncate" style="color: #a1a1aa;">{{ user.bio }}</p>
          </div>
        </div>

        <div class="mt-3 text-xs" style="color: #a1a1aa;">
          <span v-if="user.last_active">最近活跃: {{ timeAgo(user.last_active) }}</span>
          <span v-else>近期无活动</span>
        </div>

        <div v-if="user.recent_repos?.length" class="mt-4">
          <div class="text-xs font-medium mb-2" style="color: #a1a1aa;">最近仓库</div>
          <div class="space-y-1.5">
            <a
              v-for="repo in user.recent_repos.slice(0, 3)" :key="repo.id"
              :href="repo.html_url" target="_blank"
              class="flex items-center justify-between text-sm px-3 py-1.5 transition-colors"
              style="background-color: rgba(0,0,0,0.4);"
              onmouseover="this.style.backgroundColor='rgba(0,0,0,0.6)'"
              onmouseout="this.style.backgroundColor='rgba(0,0,0,0.4)'"
            >
              <span class="truncate" style="color: #fafafa;">{{ repo.name }}</span>
              <div class="flex items-center gap-2 text-xs shrink-0 ml-2" style="color: #a1a1aa;">
                <span v-if="repo.language" class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5" :style="{ backgroundColor: langColor(repo.language) }" />
                  {{ repo.language }}
                </span>
                <span class="flex items-center gap-0.5">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {{ repo.stargazers_count }}
                </span>
              </div>
            </a>
          </div>
        </div>

        <div v-if="user.recent_events?.length" class="mt-4">
          <div class="text-xs font-medium mb-2" style="color: #a1a1aa;">最近提交</div>
          <div class="space-y-2">
            <div v-for="evt in user.recent_events.slice(0, 2)" :key="evt.id" class="text-xs">
              <div class="truncate" style="color: #fafafa;">{{ evt.message || 'pushed to ' + evt.repo }}</div>
              <div class="mt-0.5" style="color: #a1a1aa;">{{ evt.repo }} · {{ timeAgo(evt.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()
const { timeAgo, langColor } = useUtils()
const { c } = useTheme()
const { data: following, pending } = useAsyncData('following', () => api.getFollowing())


</script>
