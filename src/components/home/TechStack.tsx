import { Badge } from '@/components/home/ui/Badge'
import { Card } from '@/components/home/ui/Card'
import type { LanguageStat } from '@/lib/homeUtils'

interface TechStackProps {
  languages: LanguageStat[]
  bio?: string | null
}

export function TechStack({ languages, bio }: TechStackProps) {
  return (
    <Card padding="lg" className="h-full">
      {bio && (
        <p className="text-sm text-[var(--home-text-secondary)] leading-relaxed mb-4 pb-4 border-b border-[var(--home-border)]">
          {bio}
        </p>
      )}

      <div className="text-xs font-medium text-[var(--home-text-tertiary)] mb-3 uppercase tracking-wide">
        Core Technologies
      </div>

      <div className="flex flex-wrap gap-2">
        {languages.slice(0, 8).map((lang) => (
          <Badge key={lang.name} color={lang.color}>
            {lang.name}
          </Badge>
        ))}
        {!languages.length && (
          <span className="text-sm text-[var(--home-text-secondary)]">No language data available</span>
        )}
      </div>
    </Card>
  )
}
