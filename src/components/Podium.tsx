import type { LeaderboardEntry } from '../types'

interface PodiumProps {
  leaderboard: LeaderboardEntry[]
}

function PodiumCard({
  entry,
  rank,
  height,
}: {
  entry: LeaderboardEntry
  rank: 1 | 2 | 3
  height: string
}) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' } as const
  const glows = {
    1: 'shadow-[0_0_30px_rgba(255,215,0,0.25)] gold-shimmer border-neon-gold/40',
    2: 'shadow-[0_0_15px_rgba(192,192,192,0.10)] border-gray-400/20',
    3: 'shadow-[0_0_15px_rgba(205,127,50,0.10)] border-orange-600/20',
  }

  return (
    <div className={`flex flex-col items-center justify-end ${height}`}>
      <div className="relative mb-2">
        <img
          src={entry.avatar}
          alt={entry.nickname}
          className={`rounded-full object-cover border-2 ${
            rank === 1 ? 'w-20 h-20 border-neon-gold' : 'w-16 h-16 border-gray-500'
          }`}
        />
        <span className="absolute -top-1 -right-1 text-xl">{medals[rank]}</span>
      </div>

      <div
        className={`w-full max-w-[180px] rounded-xl ${glows[rank]} bg-[#111118] border p-3 text-center`}
      >
        <div className="text-sm font-bold text-white truncate">{entry.nickname}</div>
        <div className="text-lg font-black font-mono text-neon-green mt-1">
          {entry.weightLoss > 0 ? '-' : ''}
          {entry.weightLoss.toFixed(1)}kg
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {entry.weightLossPercent.toFixed(1)}% · 出勤 {entry.attendance}/7
        </div>
      </div>
    </div>
  )
}

export default function Podium({ leaderboard }: PodiumProps) {
  if (leaderboard.length < 3) return null
  const [first, second, third] = leaderboard

  return (
    <section className="max-w-6xl mx-auto px-4 pb-8">
      <h2 className="text-center text-sm text-gray-500 mb-6 tracking-widest uppercase">
        🏅 领奖台
      </h2>
      <div className="flex items-end justify-center gap-3 md:gap-6">
        <PodiumCard entry={second} rank={2} height="h-[180px]" />
        <PodiumCard entry={first} rank={1} height="h-[240px]" />
        <PodiumCard entry={third} rank={3} height="h-[150px]" />
      </div>
    </section>
  )
}
