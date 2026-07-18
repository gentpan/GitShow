import { Badge } from '@/components/home/ui/Badge'
import { Card } from '@/components/home/ui/Card'
import type { LanguageStat } from '@/lib/homeUtils'

interface TechStackProps {
  languages: LanguageStat[]
}

export function TechStack({ languages }: TechStackProps) {
  return (
    <Card padding="lg" className="h-full">
      <div className="text-xs font-medium text-[var(--home-text-tertiary)] mb-3 uppercase tracking-wide">
        Core Technologies
      </div>

      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <Badge key={lang.name} color={lang.color}>
            {lang.name}
          </Badge>
        ))}
        {!languages.length && (
          <span className="text-sm text-[var(--home-text-secondary)]">暂无语言数据</span>
        )}
      </div>
    </Card>
  )
}
