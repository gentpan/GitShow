interface GitShowLogoProps {
  className?: string
  title?: string
}

/** Header brand title from admin settings. */
export function GitShowLogo({ className = '', title = 'GitShow' }: GitShowLogoProps) {
  return <span className={className}>{title}</span>
}
