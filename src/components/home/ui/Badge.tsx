import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'outline' | 'solid'
  color?: string
  className?: string
}

export function Badge({ children, variant = 'default', color, className = '' }: BadgeProps) {
  const base = 'home-badge home-rounded-full inline-flex items-center px-2.5 py-1 text-xs font-medium whitespace-nowrap'
  if (color) {
    const style =
      variant === 'solid'
        ? { backgroundColor: color, color: '#fff' }
        : { backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }
    return (
      <span className={`${base} ${className}`} style={style}>
        {children}
      </span>
    )
  }
  if (variant === 'outline') {
    return <span className={`${base} home-badge-outline ${className}`}>{children}</span>
  }
  if (variant === 'solid') {
    return <span className={`${base} home-badge-solid ${className}`}>{children}</span>
  }
  return <span className={`${base} home-badge-default ${className}`}>{children}</span>
}
