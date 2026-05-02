export const useAdminAuth = () => {
  const cookie = useCookie('admin_logged_in', { maxAge: 60 * 60 * 24, path: '/' })
  const loggedIn = useState('admin_logged_in_state', () => cookie.value === '1')

  const sync = () => {
    if (!import.meta.client) return
    const hasCookie = document.cookie.split('; ').some((item) => item === 'admin_logged_in=1')
    loggedIn.value = cookie.value === '1' || hasCookie || localStorage.getItem('admin_logged_in') === '1'
  }

  const login = () => {
    loggedIn.value = true
    cookie.value = '1'
    if (import.meta.client) {
      localStorage.setItem('admin_logged_in', '1')
    }
  }

  const logout = () => {
    loggedIn.value = false
    cookie.value = null
    if (import.meta.client) {
      localStorage.removeItem('admin_logged_in')
      sessionStorage.removeItem('admin_password')
    }
  }

  return {
    isAdminLoggedIn: computed(() => loggedIn.value),
    login,
    logout,
    sync,
  }
}
