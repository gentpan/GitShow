export const useUtils = () => {
  const langColors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Vue: '#41b883',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C#': '#178600',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    ObjectiveC: '#438eff',
    Scala: '#c22d40',
    Perl: '#0298c3',
    Haskell: '#5e5086',
    Lua: '#000080',
    R: '#198ce7',
    MATLAB: '#e16737',
    Arduino: '#00979D',
    Julia: '#a270ba',
    Groovy: '#e69f56',
    Elixir: '#6e4a7e',
    Clojure: '#db5855',
    CoffeeScript: '#244776',
    Erlang: '#B83998',
    F: '#b845fc',
    OCaml: '#3be133',
    PowerShell: '#012456',
    VimL: '#199f4b',
    TeX: '#3D6117',
    Assembly: '#6E4C13',
    Makefile: '#427819',
    Dockerfile: '#384d54',
    SQL: '#e38c00',
    PLSQL: '#dad8d8',
    EmacsLisp: '#c065db',
    CommonLisp: '#3fb68b',
    Crystal: '#000100',
    Nim: '#37775b',
    Vala: '#fbe5cd',
    D: '#ba595e',
    FORTRAN: '#4d41b1',
    Raku: '#0000fb',
    Zig: '#ec915c',
  }

  const langIcons: Record<string, string> = {
    PHP: 'fab fa-php',
    JavaScript: 'fab fa-js',
    TypeScript: 'fab fa-js',
    Go: 'fab fa-golang',
    Vue: 'fab fa-vuejs',
    Python: 'fab fa-python',
    HTML: 'fab fa-html5',
    CSS: 'fab fa-css3',
    Shell: 'fas fa-terminal',
    Dockerfile: 'fab fa-docker',
    Java: 'fab fa-java',
    Ruby: 'fab fa-ruby',
    Rust: 'fab fa-rust',
    'C++': 'fas fa-microchip',
    C: 'fas fa-microchip',
    'C#': 'fas fa-microchip',
  }

  function langColor(lang: string | null | undefined): string {
    return langColors[lang || ''] || '#8b949e'
  }

  function repoIcon(lang: string | null | undefined): string {
    return langIcons[lang || ''] || 'fas fa-code'
  }

  function formatNumber(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
    return String(n)
  }

  function timeAgo(date: string | Date | null | undefined): string {
    if (!date) return ''
    const seconds = Math.floor((+new Date() - +new Date(date)) / 1000)
    const intervals: [number, string][] = [
      [31536000, '年前'],
      [2592000, '个月前'],
      [86400, '天前'],
      [3600, '小时前'],
      [60, '分钟前'],
      [1, '秒前'],
    ]
    for (const [secs, label] of intervals) {
      const count = Math.floor(seconds / secs)
      if (count >= 1) return count + label
    }
    return '刚刚'
  }

  function sortLangPct(langPct: Record<string, number> | null | undefined): [string, number][] {
    if (!langPct) return []
    return Object.entries(langPct).sort((a, b) => b[1] - a[1])
  }

  return {
    langColors,
    langIcons,
    langColor,
    repoIcon,
    formatNumber,
    timeAgo,
    sortLangPct,
  }
}
