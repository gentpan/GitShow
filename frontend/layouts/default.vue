<template>
  <div class="min-h-screen flex flex-col" :style="rootStyle">
    <!-- Capsule Nav -->
    <div class="sticky top-4 z-50 px-4">
      <div class="nav-capsule max-w-5xl mx-auto flex items-center justify-between px-2 py-2" style="background-color: rgba(0,0,0,0.85); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px);">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 px-4 py-2" style="color: var(--theme-primary); font-size: 18px; font-weight: 700;">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          GitShow
        </NuxtLink>

        <!-- Desktop Nav Links -->
        <div class="hidden sm:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks" :key="link.path"
            :to="link.path"
            class="nav-pill flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors"
            :style="route.path === link.path ? 'color: var(--theme-primary); background-color: rgba(var(--theme-primary-rgb), 0.1);' : 'color: #a1a1aa;'"
            onmouseover="if(!this.classList.contains('active')) this.style.color='#16a34a'"
            onmouseout="if(!this.classList.contains('active')) this.style.color='#a1a1aa'"
          >
            <i :class="link.icon" class="text-xs"></i>
            {{ link.label }}
          </NuxtLink>
        </div>

        <!-- Desktop Contact Button -->
        <a
          :href="contactUrl" target="_blank"
          class="nav-pill flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors"
          style="color: var(--theme-primary);"
          onmouseover="this.style.backgroundColor='rgba(var(--theme-primary-rgb), 0.1)'; this.style.color='var(--theme-primary)';"
          onmouseout="this.style.backgroundColor=''; this.style.color='var(--theme-primary)';"
        >
          <i class="fas fa-paper-plane text-xs"></i>
          联系
        </a>

        <!-- Mobile Hamburger -->
        <button
          class="sm:hidden flex items-center justify-center w-9 h-9 transition-colors"
          style="color: #a1a1aa;"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <i :class="mobileMenuOpen ? 'fas fa-xmark text-base' : 'fas fa-bars text-sm'"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div
      v-if="mobileMenuOpen"
      class="sm:hidden px-4 pb-4 space-y-1"
      style="background-color: rgba(0,0,0,0.95); border-bottom: 1px solid rgba(255,255,255,0.08);"
    >
      <NuxtLink
        v-for="link in navLinks" :key="link.path"
        :to="link.path"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
        :style="route.path === link.path ? 'color: #16a34a; background-color: rgba(22,163,74,0.1);' : 'color: #a1a1aa;'"
        @click="mobileMenuOpen = false"
      >
        <i :class="link.icon" class="text-xs w-4 text-center"></i>
        {{ link.label }}
      </NuxtLink>
      <a
        :href="contactUrl" target="_blank"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
        :style="'color: var(--theme-primary);'"
        @click="mobileMenuOpen = false"
      >
        <i class="fas fa-paper-plane text-xs w-4 text-center"></i>
        联系
      </a>
    </div>

    <main class="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
      <slot />
    </main>

    <!-- Footer -->
    <footer style="border-top: 1px solid rgba(255,255,255,0.06);">
      <div class="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-sm" style="color: #52525b;">
          © {{ new Date().getFullYear() }} {{ siteTitle }} · Built with GitShow
        </div>
        <div class="flex items-center gap-2">
          <a
            v-for="(link, i) in socials" :key="i"
            :href="link.url" target="_blank"
            class="w-8 h-8 flex items-center justify-center text-sm transition-colors"
            style="color: #52525b;"
            onmouseover="this.style.color='var(--theme-primary)'"
            onmouseout="this.style.color='#52525b'"
          >
            <i :class="link.icon"></i>
          </a>
          <a
            :href="rssUrl" target="_blank"
            class="w-8 h-8 flex items-center justify-center text-sm transition-colors"
            style="color: #52525b;"
            onmouseover="this.style.color='var(--theme-primary)'"
            onmouseout="this.style.color='#52525b'"
            title="RSS Feed"
          >
            <i class="fas fa-rss"></i>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const route = useRoute()
const api = useApi()
const mobileMenuOpen = ref(false)

const navLinks = [
  { path: '/', label: '主页', icon: 'fas fa-house' },
  { path: '/projects', label: '项目', icon: 'fas fa-folder' },
  { path: '/following', label: '关注', icon: 'fas fa-user-plus' },
  { path: '/feed', label: '动态', icon: 'fas fa-bolt' },
  { path: '/activity', label: '看板', icon: 'fas fa-chart-bar' },
  { path: '/admin', label: '管理', icon: 'fas fa-gear' },
]

const { data: me } = useAsyncData('layoutMe', () => api.getMe())
const { data: settings } = useAsyncData('layoutSettings', () => api.getSettings())

const themeMap = {
  green:  { primary: '#16a34a', rgb: '22, 163, 74' },
  blue:   { primary: '#2563eb', rgb: '37, 99, 235' },
  purple: { primary: '#9333ea', rgb: '147, 51, 234' },
  orange: { primary: '#ea580c', rgb: '234, 88, 12' },
}

const currentTheme = computed(() => {
  const t = settings.value?.theme || 'green'
  return themeMap[t] || themeMap.green
})

const rootStyle = computed(() => ({
  backgroundColor: '#000',
  '--theme-primary': currentTheme.value.primary,
  '--theme-primary-rgb': currentTheme.value.rgb,
  '--theme-primary-dark': currentTheme.value.primary,
}))

const siteTitle = computed(() => settings.value?.title || 'GitShow')
const socials = computed(() => settings.value?.social_links || [])
const contactUrl = computed(() => {
  if (me.value?.user?.html_url) return me.value.user.html_url
  return 'https://github.com'
})

const rssUrl = computed(() => {
  const base = useRuntimeConfig().public.apiBase || 'http://localhost:3001'
  return base + '/rss'
})
</script>
