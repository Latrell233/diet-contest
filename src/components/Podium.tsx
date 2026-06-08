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

  const avatarSize = rank === 1 ? 'w-14 h-14 md:w-20 md:h-20' : 'w-12 h-12 md:w-16 md:h-16'

  return (
    <div className={`flex flex-col items-center justify-end ${height}`}>
      <div className="relative mb-2">
        <img
          src={entry.avatar}
          alt={entry.nickname}
          className={`rounded-full object-cover border-2 ${avatarSize} ${
            rank === 1 ? 'border-neon-gold' : 'border-gray-500'
          }`}
        />
        <span className="absolute -top-1 -right-1 text-base md:text-xl">
          {medals[rank]}
        </span>
      </div>

      <div
        className={`w-full max-w-[140px] md:max-w-[180px] rounded-xl ${glows[rank]} bg-[#111118] border p-2 md:p-3 text-center`}
      >
        <div className="text-xs md:text-sm font-bold text-white truncate">
          {entry.nickname}
        </div>
        <div className="text-sm md:text-lg font-black font-mono text-neon-green mt-1">
          {entry.weightLoss > 0 ? '-' : ''}
          {entry.weightLoss.toFixed(1)}kg
        </div>
        <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">
          {entry.weightLossPercent.toFixed(1)}% ·{' '}
          <span className="hidden md:inline">出勤 </span>
          {entry.attendance}
          <span className="md:hidden">天</span>
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
      <h2 className="text-center text-xs md:text-sm text-gray-500 mb-4 md:mb-6 tracking-widest uppercase">
        🏅 领奖台
      </h2>
      <div className="flex items-end justify-center gap-2 md:gap-6">
        <PodiumCard entry={second} rank={2} height="h-[140px] md:h-[180px]" />
        <PodiumCard entry={first} rank={1} height="h-[190px] md:h-[240px]" />
        <PodiumCard entry={third} rank={3} height="h-[110px] md:h-[150px]" />
      </div>
    </section>
  )
}
