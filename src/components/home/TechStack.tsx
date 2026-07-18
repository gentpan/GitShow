import { Badge } from '@/components/home/ui/Badge'
import { Card } from '@/components/home/ui/Card'
import type { LanguageStat } from '@/lib/homeUtils'

interface TechStackProps {
  languages: LanguageStat[]
  activeLanguage?: string | null
  onActiveLanguageChange?: (name: string) => void
}

export function TechStack({
  languages,
  activeLanguage,
  onActiveLanguageChange,
}: TechStackProps) {
  return (
    <Card padding="lg" className="h-full">
      <div className="text-xs font-medium text-[var(--home-text-tertiary)] mb-3 uppercase tracking-wide">
        Core Technologies
      </div>

      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => {
          const isActive = lang.name === activeLanguage
          return (
            <button
              key={lang.name}
              type="button"
              className={`lang-tech-chip${isActive ? ' is-active' : ''}`}
              onClick={() => onActiveLanguageChange?.(lang.name)}
              aria-pressed={isActive}
            >
              <Badge color={lang.color} className={isActive ? 'lang-tech-badge-active' : ''}>
                {lang.name}
              </Badge>
            </button>
          )
        })}
        {!languages.length && (
          <span className="text-sm text-[var(--home-text-secondary)]">暂无语言数据</span>
        )}
      </div>
    </Card>
  )
}
