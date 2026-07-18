interface GitShowLogoProps {
  className?: string
  title?: string
}

/** Header brand: settings title, with trailing "GitShow" muted. */
export function GitShowLogo({ className = '', title = 'GitShow' }: GitShowLogoProps) {
  const match = title.match(/^(.*?)(\s*)(GitShow)$/i)

  if (!match) {
    return <span className={className}>{title}</span>
  }

  const [, prefix, space, brand] = match

  return (
    <span className={className}>
      {prefix ? <span className="nav-brand-prefix">{prefix}</span> : null}
      {space}
      <span className="nav-brand-suffix">{brand}</span>
    </span>
  )
}
