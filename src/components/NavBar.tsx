interface NavBarProps {
  currentWeek: number
  totalWeeks: number
  onWeekChange: (week: number) => void
}

const NAV_ITEMS = [
  { id: 'hero', label: '🔥 战报', icon: '🔥' },
  { id: 'leaderboard', label: '🏆 龙虎榜', icon: '🏆' },
  { id: 'checkin', label: '📅 打卡', icon: '📅' },
  { id: 'comments', label: '💬 锐评', icon: '💬' },
] as const

export default function NavBar({ currentWeek, totalWeeks, onWeekChange }: NavBarProps) {
  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-neon-green/20">
      <div className="max-w-6xl mx-auto px-2 md:px-4">
        {/* 第一行：标题 + 周切换 */}
        <div className="flex items-center justify-center h-12 gap-1 md:gap-3">
          <button
            onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
            disabled={currentWeek <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-full
                       text-neon-green hover:bg-neon-green/10 active:bg-neon-green/20
                       disabled:opacity-25 disabled:cursor-not-allowed
                       transition-all text-lg select-none"
            aria-label="上一周"
          >
            ◀
          </button>

          <div className="flex flex-col items-center min-w-0">
            <span className="text-neon-green font-black text-sm md:text-lg tracking-tight truncate px-1">
              🏆 北交散兵团减肥大赛
            </span>
            <span className="text-[10px] md:text-xs text-gray-500 font-mono">
              第 {currentWeek} / {totalWeeks} 周
            </span>
          </div>

          <button
            onClick={() => onWeekChange(Math.min(totalWeeks, currentWeek + 1))}
            disabled={currentWeek >= totalWeeks}
            className="w-10 h-10 flex items-center justify-center rounded-full
                       text-neon-green hover:bg-neon-green/10 active:bg-neon-green/20
                       disabled:opacity-25 disabled:cursor-not-allowed
                       transition-all text-lg select-none"
            aria-label="下一周"
          >
            ▶
          </button>
        </div>

        {/* 第二行：导航链接 */}
        <div className="flex items-center justify-center gap-2 md:gap-3 pb-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleScroll(item.id)}
              className="px-3 py-1.5 text-xs md:text-sm text-gray-400
                         hover:text-neon-green hover:bg-neon-green/5 rounded-lg
                         transition-all duration-200"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
