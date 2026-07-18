import { Badge } from '@/components/home/ui/Badge'
import { Card } from '@/components/home/ui/Card'

interface SidebarProps {
  me: any
  settings: any
}

export function Sidebar({ me, settings }: SidebarProps) {
  const user = me?.user
  const pronouns =
    me?.gender === 'female' ? 'She/Her' : me?.gender === 'male' ? 'He/Him' : null
  const location = me?.location || user?.location || ''
  const socialLinks: { icon?: string; url?: string }[] = settings?.social_links || []

  return (
    <aside className="home-sidebar space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card padding="none" className="overflow-hidden">
        <div className="p-6 flex flex-col items-center text-center border-b border-[var(--home-border)]">
          <img
            src={user?.avatar_url}
            alt=""
            className="home-avatar home-rounded-full w-48 h-48 object-cover mb-4"
          />
          {user?.name && (
            <h2 className="text-lg font-semibold text-[var(--home-text-primary)]">{user.name}</h2>
          )}
          <p className="text-sm text-[var(--home-text-secondary)]">@{user?.login}</p>
        </div>

        <div className="p-6 space-y-4">
          {user?.bio && (
            <p className="text-sm text-[var(--home-text-secondary)] leading-relaxed">{user.bio}</p>
          )}

          <a
            href={user?.html_url}
            target="_blank"
            rel="noreferrer"
            className="home-btn-primary w-full"
          >
            <i className="fab fa-github" />
            Follow on GitHub
          </a>

          {pronouns && (
            <div className="flex flex-wrap gap-2">
              <Badge>{pronouns}</Badge>
            </div>
          )}

          <div className="space-y-2 text-sm text-[var(--home-text-secondary)]">
            {location && (
              <div className="flex items-center gap-2">
                <i className="fas fa-location-dot w-4 text-center text-[var(--home-text-tertiary)]" />
                <span>{location}</span>
              </div>
            )}
            {settings?.contact_url && (
              <div className="flex items-center gap-2 min-w-0">
                <i className="fas fa-link w-4 text-center text-[var(--home-text-tertiary)] shrink-0" />
                <a
                  href={settings.contact_url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate hover:text-[var(--home-accent)] transition-colors"
                >
                  {settings.contact_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[var(--home-border)] text-sm text-[var(--home-text-secondary)]">
            <span className="font-semibold text-[var(--home-text-primary)]">
              {user?.followers ?? 0}
            </span>{' '}
            followers
            <span className="mx-1">·</span>
            <span className="font-semibold text-[var(--home-text-primary)]">
              {me?.following_count ?? user?.following ?? 0}
            </span>{' '}
            following
          </div>
        </div>
      </Card>

      {socialLinks.length > 0 && (
        <Card padding="sm">
          <div className="text-xs font-medium text-[var(--home-text-tertiary)] mb-3 uppercase tracking-wide">
            Links
          </div>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link, i) => (
              <a
                key={`${link.url || ''}-${i}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="home-social-icon w-9 h-9 flex items-center justify-center text-sm transition-colors"
                title={link.url}
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
