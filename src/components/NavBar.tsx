interface NavBarProps {
  currentWeek: number
  totalWeeks: number
  onWeekChange: (week: number) => void
}

const NAV_ITEMS = [
  { id: 'hero', label: '🔥 战报' },
  { id: 'leaderboard', label: '🏆 龙虎榜' },
  { id: 'checkin', label: '📅 打卡墙' },
  { id: 'comments', label: '💬 AI锐评' },
] as const

export default function NavBar({ currentWeek, totalWeeks, onWeekChange }: NavBarProps) {
  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-neon-green/20">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 text-neon-green font-black text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          🏆 散兵团减肥大赛
        </button>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleScroll(item.id)}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-neon-green hover:bg-neon-green/5 rounded-lg transition-all duration-200"
            >
              {item.label}
            </button>
          ))}

          {totalWeeks > 1 && (
            <select
              value={currentWeek}
              onChange={e => onWeekChange(Number(e.target.value))}
              className="ml-3 px-2 py-1 text-xs bg-[#111118] border border-[#1e1e2a] rounded-lg text-gray-300
                         focus:outline-none focus:border-neon-green/50 cursor-pointer appearance-none"
            >
              {Array.from({ length: totalWeeks }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  第 {i + 1} 周
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </nav>
  )
}
