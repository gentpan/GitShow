import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'outline' | 'solid'
  color?: string
  className?: string
}

export function Badge({ children, variant = 'default', color, className = '' }: BadgeProps) {
  const base = `home-badge home-badge-${variant === 'default' ? 'default' : variant} ${className}`.trim()

  if (color) {
    const style =
      variant === 'solid'
        ? { backgroundColor: color, color: '#fff' }
        : { backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }
    return (
      <span className={`home-badge ${className}`.trim()} style={style}>
        {children}
      </span>
    )
  }

  return <span className={base}>{children}</span>
}
