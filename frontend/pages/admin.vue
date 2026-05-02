<template>
  <div class="max-w-[960px] mx-auto px-4 space-y-6">
    <h1 class="text-2xl font-bold" style="color: #fafafa;">管理设置</h1>

    <div v-if="settingsPending || reposPending" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-green-600 border-t-transparent animate-spin" />
    </div>

    <div v-else class="space-y-6">
      <!-- Refresh -->
      <div class="p-4 flex items-center justify-between" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
        <div class="flex items-center gap-2">
          <span class="text-sm" style="color: #a1a1aa;">最后刷新</span>
          <span class="text-sm" style="color: #52525b;">{{ lastUpdated ? timeAgo(lastUpdated) : '—' }}</span>
        </div>
        <button
          class="px-4 py-2 text-sm font-medium transition-colors"
          :style="{ backgroundColor: '#111', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)' }"
          :disabled="refreshing"
          @click="triggerRefresh"
        >
          {{ refreshing ? '刷新中...' : '刷新数据' }}
        </button>
      </div>

      <!-- Password Gate -->
      <div v-if="showPasswordInput" class="p-8 text-center" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
        <div class="text-lg font-medium mb-6" style="color: #fafafa;">管理后台</div>
        <div class="max-w-sm mx-auto space-y-4">
          <div v-if="!form.admin_password" class="text-sm mb-4" style="color: #a1a1aa;">
            首次设置，请设置管理密码
          </div>
          <div v-else-if="passwordError" class="text-sm mb-2" style="color: #ef4444;">
            密码错误
          </div>
          <input
            v-model="passwordInput"
            type="password"
            class="w-full px-4 py-3 text-center text-base outline-none"
            style="background-color: #111; color: #fafafa; border: 1px solid rgba(255,255,255,0.1);"
            :placeholder="form.admin_password ? '请输入密码' : '设置管理密码'"
            @keyup.enter="checkPassword"
            @focus="$event.target.style.borderColor=currentThemeColor"
            @blur="$event.target.style.borderColor='rgba(255,255,255,0.1)'"
          />
          <button
            class="w-full px-6 py-3 text-sm font-semibold transition-colors"
            :style="{ backgroundColor: currentThemeColor, color: '#000' }"
            @click="checkPassword"
          >
            {{ form.admin_password ? '登录' : '确认' }}
          </button>
        </div>
      </div>

      <div v-else class="space-y-6">
        <!-- 标题设置 -->
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <h2 class="text-sm font-medium mb-4" style="color: #a1a1aa;">网站标题</h2>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-4 py-3 text-base outline-none transition-colors"
            style="background-color: #111; color: #fafafa; border: 1px solid rgba(255,255,255,0.1);"
            placeholder="GitShow"
            @focus="$event.target.style.borderColor=currentThemeColor"
            @blur="$event.target.style.borderColor='rgba(255,255,255,0.1)'"
          />
        </div>

        <!-- 主题设置 -->
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <h2 class="text-sm font-medium mb-4" style="color: #a1a1aa;">主题颜色</h2>
          <div class="flex gap-3">
            <button
              v-for="t in themes" :key="t.key"
              class="w-10 h-10 transition-transform hover:scale-110"
              :class="form.theme === t.key ? 'ring-2 ring-offset-2 ring-offset-black' : ''"
              :style="{ backgroundColor: t.color, '--ring-color': t.color }"
              :title="t.label"
              @click="form.theme = t.key"
            />
          </div>
          <!-- Theme Preview -->
          <div class="mt-4 p-4" :style="{ borderTop: '3px solid ' + currentThemeColor }">
            <div class="text-xs mb-3" style="color: #a1a1aa;">预览</div>
            <div class="flex items-center gap-2 flex-wrap">
              <button
                class="px-4 py-1.5 text-xs font-medium"
                :style="{ backgroundColor: currentThemeColor, color: '#000' }"
              >按钮</button>
              <a
                class="px-4 py-1.5 text-xs font-medium transition-colors"
                :style="{ backgroundColor: currentThemeColor + '22', color: currentThemeColor, border: '1px solid ' + currentThemeColor + '55' }"
              >胶囊</a>
              <span class="text-xs" :style="{ color: currentThemeColor }">主色文字</span>
              <div class="w-6 h-6 rounded" :style="{ backgroundColor: currentThemeColor }"></div>
            </div>
          </div>
        </div>

        <!-- 数量设置 -->
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <h2 class="text-sm font-medium mb-4" style="color: #a1a1aa;">首页项目显示数量</h2>
          <div class="flex gap-3">
            <button
              v-for="n in [4, 6, 8, 10]" :key="n"
              class="px-5 py-2 text-sm font-medium transition-colors"
              :class="form.homepage_repo_count === n ? 'active-count' : 'inactive-count'"
              @click="form.homepage_repo_count = n"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- 社交链接 -->
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium" style="color: #a1a1aa;">社交链接 (Icon 按钮)</h2>
            <button class="text-xs flex items-center gap-1" :style="{ color: currentThemeColor }" @click="addSocialLink">
              <i class="fas fa-plus"></i> 添加
            </button>
          </div>
          <div class="space-y-3">
            <div
              v-for="(link, i) in form.social_links" :key="i"
              class="flex items-center gap-3 p-3"
              style="background-color: #0a0a0a; border: 1px solid rgba(255,255,255,0.08);"
            >
              <div class="w-8 h-8 flex items-center justify-center shrink-0" style="background-color: #111; border: 1px solid rgba(255,255,255,0.1);">
                <i :class="link.icon || 'fas fa-link'" style="color: #a1a1aa; font-size: 12px;"></i>
              </div>
              <input
                v-model="link.icon"
                type="text"
                class="w-28 px-3 py-2 text-sm outline-none"
                style="background-color: #111; color: #fafafa; border: 1px solid rgba(255,255,255,0.1);"
                placeholder="fab fa-github"
              />
              <input
                v-model="link.url"
                type="text"
                class="flex-1 px-3 py-2 text-sm outline-none"
                style="background-color: #111; color: #fafafa; border: 1px solid rgba(255,255,255,0.1);"
                placeholder="https://..."
              />
              <input
                v-model="link.color"
                type="text"
                class="w-20 px-3 py-2 text-sm outline-none"
                style="background-color: #111; color: #fafafa; border: 1px solid rgba(255,255,255,0.1);"
                placeholder="#16a34a"
              />
              <button
                class="w-8 h-8 flex items-center justify-center shrink-0 transition-colors"
                style="color: #a1a1aa;"
                onmouseover="this.style.color='#ef4444'"
                onmouseout="this.style.color='#a1a1aa'"
                @click="removeSocialLink(i)"
              >
                <i class="fas fa-trash text-xs"></i>
              </button>
            </div>
            <div v-if="!form.social_links.length" class="text-xs py-2" style="color: #a1a1aa;">暂无社交链接</div>
          </div>
        </div>

        <!-- 仓库 Toggle -->
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium" style="color: #a1a1aa;">项目管理</h2>
            <button class="text-xs" :style="{ color: currentThemeColor }" @click="toggleAll">
              {{ allSelected ? '取消全选' : '全选' }}
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="repo in repos" :key="repo.id"
              class="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors repo-row"
              @click="toggleRepo(repo.name)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-2 h-2 shrink-0" :style="{ backgroundColor: repo.language ? langColor(repo.language) : '#52525b' }" />
                <span class="text-sm truncate" style="color: #fafafa;">{{ repo.name }}</span>
                <span v-if="repo.full_name && repo.full_name.split('/')[0] !== 'gentpan'" class="text-[10px] px-1 py-0.5 shrink-0" style="background-color: rgba(255,255,255,0.08); color: #a1a1aa;">
                  {{ repo.full_name.split('/')[0] }}
                </span>
                <span class="text-xs shrink-0" style="color: #a1a1aa;">{{ repo.stargazers_count }} ★</span>
              </div>
              <div class="w-10 h-5 shrink-0 relative toggle-bg" :class="isSelected(repo.name) ? 'toggle-on' : 'toggle-off'">
                <div class="absolute top-0.5 w-4 h-4 toggle-knob" :class="isSelected(repo.name) ? 'knob-on' : 'knob-off'" />
              </div>
            </div>
          </div>
        </div>

        <!-- 管理密码 -->
        <div class="p-6" style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);">
          <h2 class="text-sm font-medium mb-4" style="color: #a1a1aa;">管理密码</h2>
          <div class="flex gap-3 items-center">
            <input
              v-model="form.admin_password"
              type="password"
              class="flex-1 px-4 py-3 text-sm outline-none"
              style="background-color: #111; color: #fafafa; border: 1px solid rgba(255,255,255,0.1);"
              placeholder="设置或修改管理密码，留空则无需密码"
              @focus="$event.target.style.borderColor=currentThemeColor"
              @blur="$event.target.style.borderColor='rgba(255,255,255,0.1)'"
            />
            <span class="text-xs shrink-0" style="color: #52525b;">留空则不启用密码</span>
          </div>
        </div>

        <!-- Save -->
        <div class="flex items-center gap-4">
          <button
            class="px-8 h-12 text-base font-semibold transition-colors btn-save"
            :style="{ backgroundColor: currentThemeColor, color: '#000' }"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? '保存中...' : '保存设置' }}
          </button>
          <span v-if="saved" class="text-sm" :style="{ color: currentThemeColor }">✓ 已保存</span>
          <span v-if="error" class="text-sm" style="color: #ef4444;">{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()
const { langColor } = useUtils()

const saving = ref(false)
const saved = ref(false)
const error = ref('')

const themes = [
  { key: 'green', label: '绿色', color: '#16a34a' },
  { key: 'blue', label: '蓝色', color: '#2563eb' },
  { key: 'purple', label: '紫色', color: '#9333ea' },
  { key: 'orange', label: '橙色', color: '#ea580c' },
]

const themeColorMap = {
  green: '#16a34a',
  blue: '#2563eb',
  purple: '#9333ea',
  orange: '#ea580c',
}

const currentThemeColor = computed(() => themeColorMap[form.value.theme] || '#16a34a')

const form = ref({
  title: 'GitShow',
  homepage_repo_count: 6,
  homepage_repos: [],
  social_links: [],
  theme: 'green',
  admin_password: '',
})

const showPasswordInput = ref(false)
const passwordInput = ref('')
const passwordError = ref(false)

const isUnlocked = ref(false)

const { data: settings, pending: settingsPending } = useAsyncData('settings', () => api.getSettings())
const { data: repos, pending: reposPending } = useAsyncData('adminRepos', () => api.getRepos())
const { data: health } = useAsyncData('health', () => api.getHealth())
const { timeAgo } = useUtils()

const lastUpdated = computed(() => health.value?.last_updated)
const refreshing = ref(false)

function checkPassword() {
  if (passwordInput.value === form.value.admin_password) {
    isUnlocked.value = true
    passwordError.value = false
  } else {
    passwordError.value = true
  }
}

watchEffect(() => {
  if (settings.value) {
    form.value.title = settings.value.title || 'GitShow'
    form.value.homepage_repo_count = settings.value.homepage_repo_count || 6
    form.value.homepage_repos = settings.value.homepage_repos || []
    form.value.social_links = settings.value.social_links || []
    form.value.theme = settings.value.theme || 'green'
    form.value.admin_password = settings.value.admin_password || ''
    showPasswordInput.value = !settings.value.admin_password
  }
})

function addSocialLink() {
  form.value.social_links.push({ icon: 'fab fa-github', url: '', color: '#16a34a' })
}

function removeSocialLink(i) {
  form.value.social_links.splice(i, 1)
}

function isSelected(name) {
  return form.value.homepage_repos.includes(name)
}

function toggleRepo(name) {
  const idx = form.value.homepage_repos.indexOf(name)
  if (idx >= 0) {
    form.value.homepage_repos.splice(idx, 1)
  } else {
    form.value.homepage_repos.push(name)
  }
}

const allSelected = computed(() => {
  if (!repos.value) return false
  return repos.value.every(r => form.value.homepage_repos.includes(r.name))
})

function toggleAll() {
  if (!repos.value) return
  if (allSelected.value) {
    form.value.homepage_repos = []
  } else {
    form.value.homepage_repos = repos.value.map(r => r.name)
  }
}

async function triggerRefresh() {
  refreshing.value = true
  try {
    await api.refreshCache()
    await refreshNuxtData('health')
    await refreshNuxtData('repos')
    await refreshNuxtData('me')
    await refreshNuxtData('activity')
    await refreshNuxtData('heatmap')
    await refreshNuxtData('starHistory')
    await refreshNuxtData('settings')
    await refreshNuxtData('adminRepos')
  } finally {
    refreshing.value = false
  }
}

async function save() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await api.saveSettings({
      title: form.value.title,
      homepage_repo_count: form.value.homepage_repo_count,
      homepage_repos: form.value.homepage_repos,
      social_links: form.value.social_links,
      theme: form.value.theme,
      admin_password: form.value.admin_password,
    })
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (e) {
    error.value = '保存失败'
  } finally {
    saving.value = false
  }
}


</script>

<style scoped>
.active-count {
  background-color: var(--theme-primary);
  color: #000;
  border: 1px solid var(--theme-primary);
}
.inactive-count {
  background-color: #111;
  color: #a1a1aa;
  border: 1px solid rgba(255,255,255,0.1);
}
.inactive-count:hover {
  border-color: rgba(255,255,255,0.2);
}
.repo-row {
  background-color: #0a0a0a;
  border: 1px solid transparent;
}
.repo-row:hover {
  background-color: #111;
}
.toggle-bg {
  transition: background-color 0.2s ease;
}
.toggle-on {
  background-color: var(--theme-primary);
}
.toggle-off {
  background-color: rgba(255,255,255,0.1);
}
.toggle-knob {
  transition: all 0.2s ease;
}
.knob-on {
  left: 22px;
  background-color: #000;
}
.knob-off {
  left: 2px;
  background-color: #a1a1aa;
}
.btn-save {
  background-color: var(--theme-primary);
  color: #000;
}
.btn-save:hover {
  background-color: var(--theme-primary-dark);
}
.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
