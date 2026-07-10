import { Badge } from '@/components/home/ui/Badge'
import { Card } from '@/components/home/ui/Card'
import { formatJoinDate } from '@/lib/homeUtils'

interface SidebarProps {
  me: any
  settings: any
  accent: string
}

export function Sidebar({ me, settings, accent }: SidebarProps) {
  const user = me?.user
  const tags = [user?.location, me?.gender === 'female' ? 'She/Her' : me?.gender === 'male' ? 'He/Him' : null].filter(Boolean)

  return (
    <aside className="home-sidebar space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 flex flex-col items-center text-center border-b border-[var(--home-border)]">
          <img
            src={user?.avatar_url}
            alt=""
            className="home-avatar home-rounded-full w-48 h-48 object-cover mb-4"
          />
          {user?.name && <h2 className="text-lg font-semibold text-[var(--home-text-primary)]">{user.name}</h2>}
          <p className="text-sm text-[var(--home-text-secondary)]">@{user?.login}</p>
        </div>

        <div className="p-4 space-y-4">
          {user?.bio && <p className="text-sm text-[var(--home-text-secondary)] leading-relaxed">{user.bio}</p>}

          <a
            href={user?.html_url}
            target="_blank"
            rel="noreferrer"
            className="home-btn-primary home-rounded w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors"
          >
            <i className="fab fa-github" />
            Follow on GitHub
          </a>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag as string}>{tag}</Badge>
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm text-[var(--home-text-secondary)]">
            {(me?.location || user?.location) && (
              <div className="flex items-center gap-2">
                <i className="fas fa-location-dot w-4 text-center text-[var(--home-text-tertiary)]" />
                <span>{me?.location || user?.location}</span>
              </div>
            )}
            {settings?.contact_url && (
              <div className="flex items-center gap-2 min-w-0">
                <i className="fas fa-link w-4 text-center text-[var(--home-text-tertiary)] shrink-0" />
                <a href={settings.contact_url} target="_blank" rel="noreferrer" className="truncate hover:text-[var(--home-accent)] transition-colors">
                  {settings.contact_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {settings?.social_links?.length > 0 && settings.social_links.slice(0, 2).map((link: any, i: number) => (
              <div key={i} className="flex items-center gap-2 min-w-0">
                <i className={`${link.icon} w-4 text-center text-[var(--home-text-tertiary)] shrink-0`} />
                <a href={link.url} target="_blank" rel="noreferrer" className="truncate hover:text-[var(--home-accent)] transition-colors">
                  {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--home-border)] text-sm text-[var(--home-text-secondary)]">
            <span className="font-semibold text-[var(--home-text-primary)]">{user?.followers ?? 0}</span> followers
            <span className="mx-1">·</span>
            <span className="font-semibold text-[var(--home-text-primary)]">{me?.following_count ?? user?.following ?? 0}</span> following
          </div>
        </div>
      </Card>

      {settings?.social_links?.length > 0 && (
        <Card padding="sm">
          <div className="text-xs font-medium text-[var(--home-text-tertiary)] mb-3 uppercase tracking-wide">Links</div>
          <div className="flex flex-wrap gap-2">
            {settings.social_links.map((link: any, i: number) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="home-social-icon home-rounded w-9 h-9 flex items-center justify-center text-sm transition-colors"
                style={{ ['--hover-accent' as string]: accent }}
              >
                <i className={link.icon} />
              </a>
            ))}
          </div>
        </Card>
      )}
    </aside>
  )
}

export function SidebarJoinHint({ createdAt }: { createdAt?: string }) {
  if (!createdAt) return null
  return <p className="text-xs text-[var(--home-text-tertiary)]">{formatJoinDate(createdAt)}</p>
}
