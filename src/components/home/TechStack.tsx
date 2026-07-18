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
  const top = languages.slice(0, 5)

  return (
    <Card padding="lg" className="h-full">
      <div className="text-xs font-medium text-[var(--home-text-tertiary)] mb-3 uppercase tracking-wide">
        Core Technologies
      </div>

      <div className="flex flex-wrap gap-2">
        {top.map((lang) => {
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
        {!top.length && (
          <span className="text-sm text-[var(--home-text-secondary)]">No language data available</span>
        )}
      </div>
    </Card>
  )
}
