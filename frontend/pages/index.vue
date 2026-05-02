<template>
  <div class="space-y-8">
    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-[#16a34a] border-t-transparent animate-spin" />
    </div>

    <template v-else>
      <!-- Hero -->
      <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
        <div class="flex flex-col sm:flex-row items-start gap-6">
          <!-- Avatar -->
          <img :src="me?.user?.avatar_url" class="w-[120px] h-[120px] avatar-glow shrink-0" />

          <!-- Info + Social -->
          <div class="flex-1 min-w-0 flex flex-col gap-1">
            <!-- Row 1: username + location + social icons -->
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 class="font-bold" style="font-size: 32px; line-height: 40px; color: #fafafa;">{{ me?.user?.login }}</h1>
                <div class="flex flex-wrap items-center gap-2 mt-1.5">
                  <span v-if="me?.location" class="flex items-center gap-1 text-sm" style="color: #a1a1aa;">
                    <i class="fas fa-location-dot text-xs"></i>
                    {{ me.location }}
                  </span>
                  <span v-if="me?.gender" class="tag-green">{{ me.gender }}</span>
                </div>
              </div>
              <!-- Social Icons (right side) -->
              <div v-if="settings?.social_links?.length" class="flex items-center gap-2">
                <a
                  v-for="(link, i) in settings.social_links" :key="i"
                  :href="link.url" target="_blank"
                  class="w-9 h-9 flex items-center justify-center text-sm transition-colors"
                  style="background-color: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #a1a1aa;"
                  onmouseover="this.style.borderColor='rgba(22,163,74,0.5)';this.style.color='#16a34a'"
                  onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';this.style.color='#a1a1aa'"
                >
                  <i :class="link.icon"></i>
                </a>
              </div>
            </div>

            <!-- Row 2: bio -->
            <p v-if="me?.user?.bio" class="text-base" style="color: #a1a1aa; line-height: 26px;">{{ me.user.bio }}</p>

            <!-- Row 3: buttons -->
            <div class="flex flex-wrap items-center gap-3 mt-1">
              <a
                :href="me?.user?.html_url" target="_blank"
                class="inline-flex items-center gap-2 px-5 h-10 text-sm font-semibold transition-colors"
                style="background-color: #16a34a; color: #000;"
                onmouseover="this.style.backgroundColor='#15803d'"
                onmouseout="this.style.backgroundColor='#16a34a'"
              >
                <i class="fab fa-github text-base"></i>
                GitHub
              </a>
              <a v-if="me?.user?.blog" :href="me.user.blog" target="_blank" class="inline-flex items-center gap-1.5 text-sm transition-colors" style="color: #a1a1aa;" onmouseover="this.style.color='#16a34a'" onmouseout="this.style.color='#a1a1aa'">
                <i class="fas fa-link text-xs"></i>
                {{ me.user.blog.replace(/^https?:\/\//, '') }}
              </a>
            </div>
          </div>
        </div>

        <!-- Stats 5 cards -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          <div class="stat-card">
            <i class="fas fa-folder text-sm mb-2" style="color: #16a34a;"></i>
            <div class="text-2xl font-bold" style="color: #fafafa;">{{ formatNumber(me?.stats?.total_repos || 0) }}</div>
            <div class="text-xs mt-0.5" style="color: #a1a1aa;">Repositories</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-star text-sm mb-2" style="color: #16a34a;"></i>
            <div class="text-2xl font-bold" style="color: #16a34a;">{{ formatNumber(me?.stats?.total_stars || 0) }}</div>
            <div class="text-xs mt-0.5" style="color: #a1a1aa;">Stars</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-code-commit text-sm mb-2" style="color: #16a34a;"></i>
            <div class="text-2xl font-bold" style="color: #16a34a;">{{ formatNumber(me?.stats?.total_commits || 0) }}</div>
            <div class="text-xs mt-0.5" style="color: #a1a1aa;">Commits</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-user-plus text-sm mb-2" style="color: #16a34a;"></i>
            <div class="text-2xl font-bold" style="color: #fafafa;">{{ formatNumber(me?.following_count || 0) }}</div>
            <div class="text-xs mt-0.5" style="color: #a1a1aa;">Following</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-users text-sm mb-2" style="color: #16a34a;"></i>
            <div class="text-2xl font-bold" style="color: #fafafa;">{{ formatNumber(me?.user?.followers || 0) }}</div>
            <div class="text-xs mt-0.5" style="color: #a1a1aa;">Followers</div>
          </div>
        </div>
      </div>

      <!-- Heatmap -->
      <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
        <h2 class="text-lg font-semibold mb-4" style="color: #fafafa;">贡献热力图</h2>
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
            <div class="w-3 h-3" style="background-color: rgba(22,163,74,0.2);" />
            <div class="w-3 h-3" style="background-color: rgba(22,163,74,0.45);" />
            <div class="w-3 h-3" style="background-color: rgba(22,163,74,0.7);" />
            <div class="w-3 h-3" style="background-color: #16a34a;" />
          </div>
          <span>More</span>
        </div>
      </div>

      <!-- Star Trend -->
      <div v-if="starHistory?.length" class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
        <StarsTrend :history="starHistory" />
      </div>

      <!-- Repos -->
      <div>
        <h2 class="text-lg font-semibold mb-4" style="color: #fafafa;">项目</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            v-for="repo in repos" :key="repo.id"
            :href="repo.html_url" target="_blank"
            class="repo-card group block overflow-hidden"
          >
            <div class="p-4 pb-3">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-medium truncate flex items-center gap-2" style="color: #16a34a;">
                  <i :class="repoIcon(repo.language)" class="text-xs" style="color: #16a34a;"></i>
                  {{ repo.name }}
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

      <!-- Activity Section -->
      <div class="space-y-4">
        <!-- Recent Timeline -->
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <h2 class="text-lg font-semibold mb-4" style="color: #fafafa;">最近动态</h2>
          <ActivityTimeline :items="activity" />
        </div>
        <!-- Daily Chart -->
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <ActivityChart :heatmap="heatmap" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const api = useApi()
const { langColor, repoIcon, formatNumber, timeAgo, sortLangPct } = useUtils()

const { data: me, pending: pendingMe } = useAsyncData('me', () => api.getMe())
const { data: allRepos, pending: pendingRepos } = useAsyncData('repos', () => api.getRepos())
const { data: activity, pending: pendingActivity } = useAsyncData('activity', () => api.getActivity(undefined, 10))
const { data: heatmap, pending: pendingHeatmap } = useAsyncData('heatmap', () => api.getHeatmap())
const { data: starHistory } = useAsyncData('starHistory', () => api.getStarHistory())
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
  return allRepos.value.slice(0, count)
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
  if (count <= 2) return { backgroundColor: 'rgba(22,163,74,0.2)' }
  if (count <= 5) return { backgroundColor: 'rgba(22,163,74,0.45)' }
  if (count <= 10) return { backgroundColor: 'rgba(22,163,74,0.7)' }
  return { backgroundColor: '#16a34a' }
}


</script>
