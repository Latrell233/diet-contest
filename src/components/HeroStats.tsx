import type { LeaderboardEntry } from '../types'

interface HeroStatsProps {
  champion: LeaderboardEntry | null
  bingeKing: LeaderboardEntry | null
  disciplined: LeaderboardEntry | null
  totalDays: number
}

function StatCard({
  emoji,
  label,
  entry,
  accent,
  totalDays,
}: {
  emoji: string
  label: string
  entry: LeaderboardEntry | null
  accent: 'gold' | 'orange' | 'green'
  totalDays: number
}) {
  if (!entry) return null

  const accentBg = {
    gold: 'border-neon-gold/30 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.08),transparent)]',
    orange: 'border-orange-500/20 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.06),transparent)]',
    green: 'border-neon-green/30 bg-[radial-gradient(ellipse_at_top,rgba(0,255,136,0.06),transparent)]',
  }

  const accentText = {
    gold: 'text-neon-gold',
    orange: 'text-orange-400',
    green: 'text-neon-green',
  }

  return (
    <div
      className={`rounded-xl border p-4 ${accentBg[accent]} hover:border-neon-green/40 transition-all duration-300`}
    >
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <img
          src={entry.avatar}
          alt={entry.nickname}
          className="w-10 h-10 rounded-full border-2 border-white/10 object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{entry.nickname}</div>
          {accent === 'gold' && (
            <div className={`text-lg font-black font-mono ${accentText[accent]}`}>
              {entry.weightLoss > 0
                ? `-${entry.weightLoss.toFixed(1)}kg`
                : `${entry.weightLoss.toFixed(1)}kg`}
            </div>
          )}
          {accent === 'orange' && (
            <div className="text-sm text-orange-400 font-mono">
              🍗 爽吃 {entry.bingeCount} 天
            </div>
          )}
          {accent === 'green' && (
            <div className="text-sm text-neon-green font-mono">
              💪 出勤 {entry.attendance}/{totalDays}
              {entry.weightLoss > 0 && ` · -${entry.weightLoss.toFixed(1)}kg`}
            </div>
          )}
        </div>
        <span className="text-2xl flex-shrink-0">{emoji}</span>
      </div>
    </div>
  )
}

export default function HeroStats({ champion, bingeKing, disciplined, totalDays }: HeroStatsProps) {
  return (
    <section id="hero" className="max-w-6xl mx-auto px-4 pt-6 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard emoji="👑" label="🏆 金腰带" entry={champion} accent="gold" totalDays={totalDays} />
        <StatCard emoji="🍗" label="🍗 爽吃之王" entry={bingeKing} accent="orange" totalDays={totalDays} />
        <StatCard emoji="🔥" label="🔥 自律之王" entry={disciplined} accent="green" totalDays={totalDays} />
      </div>
    </section>
  )
}
