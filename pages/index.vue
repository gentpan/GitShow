<template>
  <div class="space-y-8">
    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="loading-spinner w-8 h-8 border-2 animate-spin" :style="{ borderColor: c, borderTopColor: 'transparent' }" />
    </div>

    <template v-else>
      <!-- Hero -->
      <div class="hero-card">
        <div class="hero-grid">
          <!-- Avatar -->
          <div class="hero-avatar-wrap">
            <img :src="me?.user?.avatar_url" class="hero-avatar avatar-glow" />
          </div>

          <!-- Info -->
          <div class="hero-profile">
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="hero-name">{{ me?.user?.login }}</h1>
              <span v-if="me?.location" class="flex items-center gap-1 text-sm" style="color: #a1a1aa;">
                <i class="fas fa-location-dot text-xs"></i>
                {{ me.location }}
              </span>
            </div>

            <p v-if="me?.user?.bio" class="hero-bio">{{ me.user.bio }}</p>

            <div v-if="settings?.social_links?.length" class="hero-socials">
              <a
                v-for="(link, i) in settings.social_links" :key="i"
                :href="link.url" target="_blank"
                class="hero-social-link"
                style="background-color: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #a1a1aa;"
                @mouseover="e => { e.currentTarget.style.borderColor=`rgba(${rgb},0.5)`; e.currentTarget.style.color=c }"
                @mouseout="e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#a1a1aa' }"
              >
                <i :class="link.icon"></i>
              </a>
            </div>
          </div>

          <!-- Stats -->
          <div class="hero-stats-panel">
            <div class="hero-stat-item">
              <i class="fas fa-folder hero-stat-icon" :style="{ color: c }"></i>
              <div class="hero-stat-copy">
                <div class="hero-stat-value">{{ formatNumber(me?.stats?.total_repos || 0) }}</div>
                <div class="hero-stat-label">Repositories</div>
              </div>
            </div>
            <div class="hero-stat-item">
              <i class="fas fa-star hero-stat-icon" :style="{ color: c }"></i>
              <div class="hero-stat-copy">
                <div class="hero-stat-value" :style="{ color: c }">{{ formatNumber(me?.stats?.total_stars || 0) }}</div>
                <div class="hero-stat-label">Stars</div>
              </div>
            </div>
            <div class="hero-stat-item">
              <i class="fas fa-code-commit hero-stat-icon" :style="{ color: c }"></i>
              <div class="hero-stat-copy">
                <div class="hero-stat-value" :style="{ color: c }">{{ formatNumber(me?.stats?.total_commits || 0) }}</div>
                <div class="hero-stat-label">Commits</div>
              </div>
            </div>
            <div class="hero-stat-item">
              <i class="fas fa-user-plus hero-stat-icon" :style="{ color: c }"></i>
              <div class="hero-stat-copy">
                <div class="hero-stat-value">{{ formatNumber(me?.following_count || 0) }}</div>
                <div class="hero-stat-label">Following</div>
              </div>
            </div>
            <div class="hero-stat-item">
              <i class="fas fa-users hero-stat-icon" :style="{ color: c }"></i>
              <div class="hero-stat-copy">
                <div class="hero-stat-value">{{ formatNumber(me?.user?.followers || 0) }}</div>
                <div class="hero-stat-label">Followers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Heatmap -->
      <div>
        <h2 class="text-sm font-medium mb-3" style="color: #a1a1aa;">贡献热力图</h2>
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <div class="w-full">
            <div class="flex w-full gap-[2px]">
              <div v-for="(week, wi) in heatmapWeeks" :key="wi" class="flex flex-col flex-1 gap-[2px]">
                <div
                  v-for="(day, di) in week" :key="di"
                  class="w-full"
                  :style="[heatmapStyle(day?.count || 0), { aspectRatio: '1' }]"
                  :title="`${day?.date}: ${day?.count || 0} contributions`"
                />
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-3 text-xs" style="color: #a1a1aa;">
            <span>Less</span>
            <div class="flex gap-1">
              <div class="w-3 h-3" style="background-color: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);" />
              <div class="w-3 h-3" style="background-color: rgba(var(--theme-primary-rgb), 0.2);" />
              <div class="w-3 h-3" style="background-color: rgba(var(--theme-primary-rgb), 0.45);" />
              <div class="w-3 h-3" style="background-color: rgba(var(--theme-primary-rgb), 0.7);" />
              <div class="w-3 h-3" style="background-color: var(--theme-primary);" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      <!-- Daily Chart -->
      <div>
        <h2 class="text-sm font-medium mb-3" style="color: #a1a1aa;">每日活动</h2>
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <ActivityChart :heatmap="heatmap" />
        </div>
      </div>

      <!-- Repos -->
      <div>
        <h2 class="text-sm font-medium mb-3" style="color: #a1a1aa;">项目</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            v-for="repo in repos" :key="repo.id"
            :href="repo.html_url" target="_blank"
            class="repo-card group block overflow-hidden"
          >
            <div class="p-4 pb-3">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-medium truncate flex items-center gap-2" :style="{ color: c }">
                  <i :class="[repoIcon(repo.language), 'text-xs']" :style="{ color: c }"></i>
                  {{ repo.name }}
                  <span v-if="repo.latest_version" class="text-[10px] px-1 py-0.5 rounded shrink-0" :style="{ backgroundColor: c, color: '#111' }">{{ repo.latest_version }}</span>
                </h3>
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
              <p v-if="repo.description" class="text-sm mt-1 line-clamp-2 h-10" style="color: #a1a1aa;">{{ repo.description }}</p>
              <div class="text-xs mt-2" style="color: #a1a1aa;">{{ timeAgo(repo.updated_at) }}</div>
            </div>
            <!-- 语言横条 -->
            <div class="flex h-[8px] w-full mt-auto relative" style="min-width: 0;">
              <div
                v-for="([lang, pct], i) in sortLangPct(repo.lang_pct)" :key="i"
                class="h-full relative group/lang"
                :style="{ width: Math.max(pct, 1) + '%', backgroundColor: langColor(lang), zIndex: i + 1 }"
              >
                <div
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 text-[10px] whitespace-nowrap opacity-0 group-hover/lang:opacity-100 transition-opacity"
                  style="background-color: rgba(0,0,0,0.85); color: #fafafa; z-index: 100;"
                >
                  {{ lang }} {{ pct.toFixed(1) }}%
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- Activity Section -->
      <div>
        <h2 class="text-sm font-medium mb-3" style="color: #a1a1aa;">最近动态</h2>
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <ActivityTimeline :items="activity" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const api = useApi()
const { langColor, repoIcon, formatNumber, timeAgo, sortLangPct } = useUtils()
const { c, rgb } = useTheme()

const { data: me, pending: pendingMe } = useAsyncData('me', () => api.getMe())
const { data: allRepos, pending: pendingRepos } = useAsyncData('repos', () => api.getRepos())
const { data: activity, pending: pendingActivity } = useAsyncData('activity', () => api.getActivity(undefined, 10))
const { data: heatmap, pending: pendingHeatmap } = useAsyncData('heatmap', () => api.getHeatmap())
const { data: settings } = useAsyncData('settings', () => api.getSettings())

const pending = computed(() => pendingMe.value || pendingRepos.value || pendingActivity.value || pendingHeatmap.value)

const repos = computed(() => {
  if (!allRepos.value) return []
  const count = settings.value?.homepage_repo_count || 6
  const selected = settings.value?.homepage_repos || []
  if (selected.length > 0) {
    const ordered = []
    for (const name of selected) {
      const r = allRepos.value.find(x => x.name === name)
      if (r) ordered.push(r)
    }
    return ordered.slice(0, count)
  }
  // no selection: show by latest updated
  return [...allRepos.value].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, count)
})

const heatmapWeeks = computed(() => {
  if (!heatmap.value) return []
  const weeks = []
  for (let i = 0; i < heatmap.value.length; i += 7) {
    weeks.push(heatmap.value.slice(i, i + 7))
  }
  return weeks
})

function heatmapStyle(count) {
  if (count === 0) return { backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }
  if (count <= 2) return { backgroundColor: `rgba(${rgb.value}, 0.2)` }
  if (count <= 5) return { backgroundColor: `rgba(${rgb.value}, 0.45)` }
  if (count <= 10) return { backgroundColor: `rgba(${rgb.value}, 0.7)` }
  return { backgroundColor: c.value }
}


</script>
