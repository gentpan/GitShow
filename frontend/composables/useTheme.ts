export const useTheme = () => {
  const { data: settings } = useAsyncData('themeSettings', () => {
    if (process.server) return { theme: 'green' }
    return fetch('/api/settings').then(r => r.json()).catch(() => ({ theme: 'green' }))
  })

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

  const c = computed(() => currentTheme.value.primary)
  const rgb = computed(() => currentTheme.value.rgb)

  return {
    c,      // color like #16a34a
    rgb,    // rgb like '22, 163, 74'
  }
}
