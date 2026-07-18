/** Corner crosshair (+) for the gitshow.io lattice frame. */
export function LatticeCross({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  return <span className={`gs-lattice-cross gs-lattice-cross-${position}`} aria-hidden />
}
