export default function Logo({ size = 'md', theme = 'light' }) {
  const cfg = {
    sm:  { box: 28, icon: 13, gap: 'gap-2',   text: 'text-sm font-black'  },
    md:  { box: 36, icon: 16, gap: 'gap-2.5', text: 'text-lg font-black'  },
    lg:  { box: 48, icon: 22, gap: 'gap-3',   text: 'text-2xl font-black' },
  }[size]

  return (
    <div className={`flex items-center ${cfg.gap} select-none`}>
      {/* Icon mark */}
      <div
        style={{ width: cfg.box, height: cfg.box }}
        className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0"
      >
        <svg width={cfg.icon} height={cfg.icon} viewBox="0 0 20 20" fill="none">
          {/* Star shape */}
          <path
            d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.1l-4.94 2.6.94-5.49-4-3.9 5.53-.8z"
            fill="white"
            stroke="white"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <span
        className={`${cfg.text} tracking-tight leading-none ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}
      >
        Review
        <span className="text-amber-500">Gate</span>
      </span>
    </div>
  )
}
