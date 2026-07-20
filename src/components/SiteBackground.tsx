/**
 * Fixed, low-opacity animated neon ribbon layer rendered behind all page
 * content. Sits at -z-10 so opaque sections stay calm while transparent
 * sections reveal the slow drift. Pure CSS animation; respects
 * prefers-reduced-motion via globals.css.
 */
export default function SiteBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg-primary"
    >
      {/* Flowing neon ribbon bands */}
      <svg
        className="ribbon-flow absolute left-1/2 top-1/2 h-[160%] w-[180%] -translate-x-1/2 -translate-y-1/2 opacity-[0.22] blur-[2px]"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="ribbonA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5A189A" stopOpacity="0" />
            <stop offset="45%" stopColor="#8E2DE2" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#B57BFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#5A189A" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }).map((_, i) => (
          <path
            key={i}
            d={`M -200 ${300 + i * 46} C 320 ${180 + i * 40}, 780 ${520 + i * 32}, 1640 ${260 + i * 44}`}
            stroke="url(#ribbonA)"
            strokeWidth="1.4"
            fill="none"
          />
        ))}
      </svg>

      <svg
        className="ribbon-flow-alt absolute left-1/2 top-1/2 h-[150%] w-[170%] -translate-x-1/2 -translate-y-1/2 opacity-[0.16] blur-[1px]"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <path
            key={i}
            d={`M -200 ${560 + i * 40} C 380 ${680 + i * 30}, 900 ${420 + i * 34}, 1640 ${600 + i * 36}`}
            stroke="url(#ribbonA)"
            strokeWidth="1.2"
            fill="none"
          />
        ))}
      </svg>

      {/* Soft drifting neon glow orbs */}
      <div className="glow-pulse absolute left-[12%] top-[18%] h-[360px] w-[360px] rounded-full bg-accent/30 blur-[150px]" />
      <div className="glow-pulse absolute bottom-[8%] right-[10%] h-[420px] w-[420px] rounded-full bg-accent-deep/40 blur-[170px]" />
    </div>
  );
}
