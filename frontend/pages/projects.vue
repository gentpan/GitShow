<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold" style="color: #fafafa;">所有项目</h1>
      <span class="text-sm" style="color: #a1a1aa;">{{ repos?.length || 0 }} 个仓库</span>
    </div>

    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-[#16a34a] border-t-transparent animate-spin" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <a
        v-for="repo in repos" :key="repo.id"
        :href="repo.html_url" target="_blank"
        class="repo-card group block overflow-hidden"
      >
        <div class="p-4 pb-3">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-medium truncate" style="color: #16a34a;">{{ repo.name }}</h3>
            <div class="flex items-center gap-3 text-xs shrink-0" style="color: #a1a1aa;">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {{ repo.stargazers_count }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                {{ repo.forks_count }}
              </span>
            </div>
          </div>
          <p class="text-sm mt-1 line-clamp-2 h-10" style="color: #a1a1aa;">{{ repo.description || 'No description' }}</p>
          <div class="text-xs mt-2" style="color: #a1a1aa;">{{ timeAgo(repo.updated_at) }}</div>
        </div>
        <div v-if="repo.lang_pct && Object.keys(repo.lang_pct).length > 0" class="flex h-[8px] w-full mt-auto">
          <div
            v-for="([lang, pct], i) in sortLangPct(repo.lang_pct)" :key="i"
            class="lang-bar-segment h-full"
            :style="{ width: pct + '%', backgroundColor: langColor(lang) }"
            :data-lang="`${lang} ${pct.toFixed(1)}%`"
          />
        </div>
        <div v-else-if="repo.language" class="h-[8px] w-full mt-auto" :style="{ backgroundColor: langColor(repo.language) }"></div>
      </a>
    </div>
  </div>
</template>

<script setup>
const api = useApi()
const { timeAgo, sortLangPct, langColor } = useUtils()
const { data: repos, pending } = useAsyncData('allRepos', () => api.getRepos())


</script>
