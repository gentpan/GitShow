import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'outline' | 'solid'
  color?: string
  icon?: string
  className?: string
}

export function Badge({ children, variant = 'default', color, icon, className = '' }: BadgeProps) {
  const base = `home-badge home-badge-${variant === 'default' ? 'default' : variant} ${className}`.trim()
  const content = (
    <>
      {icon ? <i className={`home-badge-icon ${icon}`} aria-hidden /> : null}
      <span>{children}</span>
    </>
  )

  if (color) {
    const style =
      variant === 'solid'
        ? { backgroundColor: color, color: '#fff' }
        : { backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }
    return (
      <span className={`home-badge ${className}`.trim()} style={style}>
        {content}
      </span>
    )
  }

  return <span className={base}>{content}</span>
}
