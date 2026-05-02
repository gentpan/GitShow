<template>
  <div class="min-h-screen flex flex-col" :style="rootStyle">
    <!-- Capsule Nav -->
    <div class="nav-shell sticky top-4 z-50 px-4" :class="{ 'nav-shell-hidden': navHidden && !mobileMenuOpen }">
      <div class="nav-capsule themed-nav max-w-5xl mx-auto flex items-center justify-between px-2 py-2">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 px-4 py-2" style="color: var(--theme-primary); font-size: 18px; font-weight: 700;">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {{ siteTitle }}
        </NuxtLink>

        <!-- Desktop Nav Links -->
        <div class="hidden sm:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks" :key="link.path"
            :to="link.path"
            class="nav-pill nav-link flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors"
            :class="{ 'nav-link-active': route.path === link.path }"
          >
            <i :class="[link.icon, 'text-xs']"></i>
            {{ link.label }}
          </NuxtLink>
        </div>

        <!-- Desktop Contact Button -->
        <a
          :href="contactUrl" target="_blank"
          class="nav-pill flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors"
          style="background-color: var(--theme-primary); color: #000;"
          onmouseover="this.style.backgroundColor='var(--theme-primary-dark)'"
          onmouseout="this.style.backgroundColor='var(--theme-primary)'"
        >
          <i class="fas fa-paper-plane text-xs"></i>
          {{ contactLabel }}
        </a>

        <!-- Mobile Hamburger -->
        <button
          class="nav-pill nav-link sm:hidden flex items-center justify-center w-9 h-9 transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <i :class="mobileMenuOpen ? 'fas fa-xmark text-base' : 'fas fa-bars text-sm'"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-menu-panel sm:hidden px-4 pb-4 space-y-1"
    >
      <NuxtLink
        v-for="link in navLinks" :key="link.path"
        :to="link.path"
        class="nav-pill nav-link flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
        :class="{ 'nav-link-active': route.path === link.path }"
        @click="mobileMenuOpen = false"
      >
        <i :class="[link.icon, 'text-xs', 'w-4', 'text-center']"></i>
        {{ link.label }}
      </NuxtLink>
      <a
        :href="contactUrl" target="_blank"
        class="nav-pill nav-link flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
        @click="mobileMenuOpen = false"
      >
        <i class="fas fa-paper-plane text-xs w-4 text-center"></i>
        {{ contactLabel }}
      </a>
    </div>

    <main class="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
      <slot />
    </main>

    <!-- Footer -->
    <footer style="border-top: 1px solid rgba(255,255,255,0.06);">
      <div class="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-sm flex flex-wrap items-center justify-center gap-1.5" style="color: #52525b;">
          <span>© {{ new Date().getFullYear() }} {{ siteTitle }}</span>
          <span>build with</span>
          <a
            href="https://github.com/gentpan/GitShow"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors"
            style="color: #a1a1aa;"
            onmouseover="this.style.color='var(--theme-primary)'"
            onmouseout="this.style.color='#a1a1aa'"
          >
            GitShow
          </a>
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
          <button
            v-if="isAdminLoggedIn"
            class="footer-logout-button w-8 h-8 flex items-center justify-center text-sm transition-colors"
            title="退出登录"
            @click="logoutAdmin"
          >
            <i class="fas fa-right-from-bracket"></i>
          </button>
          <div v-else class="relative">
            <div
              v-if="showFooterLogin"
              class="footer-login-popover absolute bottom-full right-0 mb-2 w-64 p-4 space-y-3"
            >
              <div class="text-xs" style="color: #a1a1aa;">登录管理</div>
              <div v-if="footerLoginError" class="text-xs" style="color: #ef4444;">{{ footerLoginError }}</div>
              <button
                v-if="settings?.has_passkey && passkeySupported"
                class="w-full px-3 py-2 text-xs font-medium transition-colors"
                style="background-color: rgba(255,255,255,0.08); color: #fafafa; border: 1px solid rgba(255,255,255,0.12);"
                :disabled="passkeyLoading"
                @click="loginToAdminWithPasskey"
              >
                <i class="fas fa-fingerprint mr-1"></i>
                {{ passkeyLoading ? '验证中...' : '使用 Passkey' }}
              </button>
              <input
                v-model="footerPassword"
                type="password"
                class="w-full px-3 py-2 text-sm outline-none"
                style="background-color: rgba(0,0,0,0.55); color: #fafafa; border: 1px solid rgba(255,255,255,0.12);"
                :placeholder="settings?.has_admin_password ? '输入管理密码' : '无需密码，回车进入'"
                @keyup.enter="loginToAdmin"
                @focus="$event.target.style.borderColor='rgba(255,255,255,0.28)'"
                @blur="$event.target.style.borderColor='rgba(255,255,255,0.12)'"
              />
              <div class="flex items-center gap-2">
                <button
                  class="flex-1 px-3 py-2 text-xs font-medium transition-colors"
                  :style="{ backgroundColor: 'var(--theme-primary)', color: '#000' }"
                  @click="loginToAdmin"
                >
                  登录
                </button>
                <button
                  class="px-3 py-2 text-xs transition-colors"
                  style="color: #52525b;"
                  @click="showFooterLogin = false"
                >
                  取消
                </button>
              </div>
            </div>
            <button
              class="w-8 h-8 flex items-center justify-center text-sm transition-colors"
              style="color: #52525b;"
              title="登录"
              @mouseover="e => e.currentTarget.style.color = 'var(--theme-primary)'"
              @mouseout="e => e.currentTarget.style.color = '#52525b'"
              @click="toggleFooterLogin"
            >
              <i class="fas fa-lock"></i>
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const route = useRoute()
const api = useApi()
const passkey = usePasskey()
const adminAuth = useAdminAuth()
const mobileMenuOpen = ref(false)
const navHidden = ref(false)
const showFooterLogin = ref(false)
const footerPassword = ref('')
const footerLoginError = ref('')
const passkeyLoading = ref(false)
const passkeySupported = ref(false)
let lastScrollY = 0

const handleScroll = () => {
  const currentY = window.scrollY
  const delta = currentY - lastScrollY

  if (currentY < 24) {
    navHidden.value = false
  } else if (delta > 8) {
    navHidden.value = true
  } else if (delta < -8) {
    navHidden.value = false
  }

  lastScrollY = currentY
}

const baseNavLinks = [
  { path: '/', label: '主页', icon: 'fas fa-house' },
  { path: '/projects', label: '项目', icon: 'fas fa-folder' },
  { path: '/following', label: '关注', icon: 'fas fa-user-plus' },
  { path: '/activity', label: '看板', icon: 'fas fa-chart-bar' },
]

const isAdminLoggedIn = computed(() => adminAuth.isAdminLoggedIn.value || route.path === '/admin')
const navLinks = computed(() => {
  const links = [...baseNavLinks]
  if (isAdminLoggedIn.value) {
    links.push({ path: '/admin', label: '管理', icon: 'fas fa-gear' })
  }
  return links
})

const { data: me } = useAsyncData('layoutMe', () => api.getMe())
const { data: settings } = useAsyncData('layoutSettings', () => api.getSettings())

const siteTitle = computed(() => settings.value?.title || 'GitShow')
useHead(() => ({ title: siteTitle.value }))

const themeMap = {
  green:  { primary: '#16a34a', rgb: '22, 163, 74' },
  blue:   { primary: '#2563eb', rgb: '37, 99, 235' },
  purple: { primary: '#9333ea', rgb: '147, 51, 234' },
  orange: { primary: '#ea580c', rgb: '234, 88, 12' },
}

const darkenColor = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - 24)
  const g = Math.max(0, ((n >> 8) & 0xff) - 24)
  const b = Math.max(0, (n & 0xff) - 24)
  return `rgb(${r}, ${g}, ${b})`
}

const currentTheme = computed(() => {
  const t = settings.value?.theme || 'green'
  return themeMap[t] || themeMap.green
})

const rootStyle = computed(() => ({
  backgroundColor: '#000',
  '--theme-primary': currentTheme.value.primary,
  '--theme-primary-rgb': currentTheme.value.rgb,
  '--theme-primary-dark': darkenColor(currentTheme.value.primary),
}))

const socials = computed(() => settings.value?.social_links || [])
const contactLabel = computed(() => settings.value?.contact_label || '联系')
const contactUrl = computed(() => {
  if (settings.value?.contact_url) return settings.value.contact_url
  if (me.value?.user?.html_url) return me.value.user.html_url
  return 'https://github.com'
})

function logoutAdmin() {
  adminAuth.logout()
  if (route.path === '/admin') {
    navigateTo('/')
  }
}

function toggleFooterLogin() {
  footerLoginError.value = ''
  showFooterLogin.value = !showFooterLogin.value
}

async function loginToAdmin() {
  try {
    await api.adminLogin(footerPassword.value)
    adminAuth.login()
    if (import.meta.client) {
      sessionStorage.setItem('admin_password', footerPassword.value)
    }
    footerPassword.value = ''
    footerLoginError.value = ''
    showFooterLogin.value = false
    await navigateTo('/admin')
  } catch (e) {
    footerLoginError.value = '密码错误'
  }
}

async function loginToAdminWithPasskey() {
  passkeyLoading.value = true
  footerLoginError.value = ''
  try {
    await passkey.loginWithPasskey()
    adminAuth.login()
    if (import.meta.client) {
      sessionStorage.removeItem('admin_password')
    }
    showFooterLogin.value = false
    await navigateTo('/admin')
  } catch (e) {
    footerLoginError.value = 'Passkey 验证失败'
  } finally {
    passkeyLoading.value = false
  }
}

onMounted(() => {
  adminAuth.sync()
  if (route.path === '/admin') {
    adminAuth.login()
  }
  passkeySupported.value = passkey.isSupported()
  lastScrollY = window.scrollY
  window.addEventListener('scroll', handleScroll, { passive: true })
})

watch(() => route.path, (path) => {
  if (path === '/admin') {
    adminAuth.login()
  } else {
    adminAuth.sync()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
