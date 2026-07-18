interface GitShowLogoProps {
  className?: string
}

/** GitShow mark — concentric target icon. */
export function GitShowLogo({ className = '' }: GitShowLogoProps) {
  return (
    <span className={`nav-brand-lockup ${className}`.trim()}>
      <svg
        className="nav-brand-mark-icon"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="GitShow"
      >
        <path
          d="M543.019 0.002c257.278 15.867 463.147 221.737 479.013 479.016H895.016v64l127.016 0.002c-15.867 257.279-221.735 463.147-479.013 479.014l-0.003-127.016h-64l-0.003 127.016C221.734 1006.168 15.866 800.3 0 543.02l127.017-0.002v-64H-0.001C15.865 221.738 221.734 15.868 479.013 0.002l0.003 127.016h64L543.019 0.002z m-32.003 255.016c-141.385 0-256 114.615-256 256s114.615 256 256 256c141.384 0 256-114.615 256-256s-114.616-256-256-256z m0 96c88.365 0 160 71.635 160 160 0 88.366-71.635 160-160 160-88.366 0-160-71.634-160-160 0-88.365 71.634-160 160-160z m0 96c-35.347 0-64 28.654-64 64 0 35.347 28.653 64 64 64 35.346 0 64-28.653 64-64 0-35.346-28.654-64-64-64z"
          fill="currentColor"
        />
      </svg>
      <span className="nav-brand-word">GitShow</span>
    </span>
  )
}
