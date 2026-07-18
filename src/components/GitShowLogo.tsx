interface GitShowLogoProps {
  className?: string
}

/** GitShow signature wordmark. */
export function GitShowLogo({ className = '' }: GitShowLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 148 28"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="GitShow"
    >
      <text
        x="0"
        y="22"
        fill="currentColor"
        fontFamily="Geist, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="22"
        fontWeight="600"
        letterSpacing="-0.6"
      >
        GitShow
      </text>
    </svg>
  )
}
