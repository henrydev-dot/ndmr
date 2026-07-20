export default function HeroWaves() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="wave-drift absolute -left-1/4 top-0 h-[130%] w-[150%] opacity-40"
        viewBox="0 0 1200 800"
        fill="none"
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5A189A" stopOpacity="0" />
            <stop offset="50%" stopColor="#9D4EDD" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#5A189A" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            d={`M -100 ${180 + i * 34} C 300 ${80 + i * 30}, 600 ${320 + i * 26}, 1300 ${160 + i * 32}`}
            stroke="url(#waveGrad1)"
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>
      <svg
        className="wave-drift-slow absolute -right-1/4 bottom-0 h-[120%] w-[140%] opacity-30"
        viewBox="0 0 1200 800"
        fill="none"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d={`M -100 ${420 + i * 28} C 400 ${560 + i * 22}, 800 ${360 + i * 26}, 1300 ${480 + i * 24}`}
            stroke="url(#waveGrad1)"
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
    </div>
  );
}
