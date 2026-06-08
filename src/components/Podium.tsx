import type { LeaderboardEntry } from '../types'

interface PodiumProps {
  leaderboard: LeaderboardEntry[]
}

function PodiumCard({
  entry,
  rank,
}: {
  entry: LeaderboardEntry
  rank: 1 | 2 | 3
}) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }

  // 冠军卡：放大 + 厚金边 + 皇冠
  const isChampion = rank === 1

  const cardSize = isChampion
    ? 'w-36 md:w-48'
    : 'w-28 md:w-40'

  const borderGlow = {
    1: 'border-[#ffd700]/60 shadow-[0_0_40px_rgba(255,215,0,0.3),0_0_80px_rgba(255,215,0,0.1)] gold-shimmer',
    2: 'border-gray-400/30 shadow-[0_0_20px_rgba(192,192,192,0.15)]',
    3: 'border-orange-600/30 shadow-[0_0_20px_rgba(205,127,50,0.15)]',
  }

  return (
    <div className={`flex flex-col items-center ${isChampion ? '-mt-2' : ''}`}>
      {/* 皇冠：冠军专属 */}
      {isChampion && (
        <div className="text-3xl md:text-4xl mb-1 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          👑
        </div>
      )}

      {/* 卡片 */}
      <div
        className={`${cardSize} rounded-2xl border-2 ${borderGlow[rank]}
                    bg-[linear-gradient(180deg,#1a1a2e_0%,#111118_100%)]
                    p-3 md:p-5 text-center relative
                    transition-transform duration-300
                    ${isChampion ? 'scale-110 md:scale-100 z-10' : 'z-0'}`}
        style={
          isChampion
            ? {
                boxShadow:
                  '0 0 40px rgba(255,215,0,0.3), 0 0 80px rgba(255,215,0,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
              }
            : undefined
        }
      >
        {/* 排名徽章 */}
        <div
          className={`absolute -top-3 -right-3 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base
                      ${isChampion ? 'bg-[#ffd700] text-[#0a0a0f] shadow-[0_0_12px_rgba(255,215,0,0.5)]' : 'bg-[#1e1e2a] text-gray-400 border border-gray-600'}`}
        >
          {rank}
        </div>

        {/* 头像 */}
        <img
          src={entry.avatar}
          alt={entry.nickname}
          className={`rounded-full object-cover mx-auto mb-2 md:mb-3 border-2
                      ${isChampion ? 'w-16 h-16 md:w-20 md:h-20 border-[#ffd700]/60' : 'w-12 h-12 md:w-16 md:h-16 border-white/10'}`}
        />

        {/* 昵称 */}
        <div
          className={`font-bold truncate ${
            isChampion
              ? 'text-white text-sm md:text-base bg-gradient-to-r from-[#ffd700] to-[#ffed4a] bg-clip-text text-transparent'
              : 'text-gray-300 text-xs md:text-sm'
          }`}
        >
          {entry.nickname}
        </div>

        {/* 奖牌 */}
        <div className="text-xl md:text-2xl my-0.5 md:my-1">{medals[rank]}</div>

        {/* 减重数字 */}
        <div
          className={`font-black font-mono ${
            isChampion
              ? 'text-xl md:text-3xl text-[#ffd700] drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]'
              : 'text-lg md:text-xl text-neon-green'
          }`}
        >
          {entry.weightLoss > 0 ? '-' : ''}
          {entry.weightLoss.toFixed(1)}
          <span className="text-xs md:text-sm font-normal">kg</span>
        </div>

        {/* 副信息 */}
        <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1 space-x-2">
          <span>{entry.weightLossPercent.toFixed(1)}%</span>
          <span>·</span>
          <span>{entry.attendance}天</span>
        </div>
      </div>
    </div>
  )
}

export default function Podium({ leaderboard }: PodiumProps) {
  if (leaderboard.length < 3) return null
  const [first, second, third] = leaderboard

  return (
    <section className="max-w-6xl mx-auto px-4 pb-10">
      {/* 标题 */}
      <h2 className="text-center text-xs md:text-sm text-gray-500 mb-6 md:mb-8 tracking-widest uppercase">
        🏅 领奖台
      </h2>

      {/* 聚光灯 + 领奖台区域 */}
      <div className="relative">
        {/* 聚光灯背景 */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[500px] h-[60px] md:h-[80px]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255,215,0,0.06) 0%, transparent 70%)',
          }}
        />

        {/* 三列：卡牌 + 台座 */}
        <div className="flex items-end justify-center gap-2 md:gap-8 relative z-10">
          {/* 🥈 亚军 */}
          <div className="flex flex-col items-center">
            <PodiumCard entry={second} rank={2} />
            {/* 台座 */}
            <div className="relative w-32 md:w-44">
              <div
                className="w-full h-20 md:h-28 mt-1"
                style={{
                  background:
                    'linear-gradient(180deg, #1a1a2e 0%, #141420 40%, #0e0e18 100%)',
                  clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
                  borderLeft: '1px solid rgba(255,255,255,0.04)',
                  borderRight: '1px solid rgba(255,255,255,0.04)',
                }}
              />
              {/* 台座顶部银线 */}
              <div className="absolute top-0 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-gray-500/40 to-transparent" />
              {/* 台座标签 */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-gray-600 font-mono">
                🥈 2ND
              </div>
            </div>
          </div>

          {/* 🥇 冠军 */}
          <div className="flex flex-col items-center">
            <PodiumCard entry={first} rank={1} />
            {/* 台座 — 最高 */}
            <div className="relative w-36 md:w-52">
              <div
                className="w-full h-32 md:h-44 mt-1"
                style={{
                  background:
                    'linear-gradient(180deg, #1e1e35 0%, #1a1a2e 30%, #141420 60%, #0e0e18 100%)',
                  clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
                  borderLeft: '1px solid rgba(255,215,0,0.08)',
                  borderRight: '1px solid rgba(255,215,0,0.08)',
                }}
              />
              {/* 台座顶部金线 */}
              <div className="absolute top-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent shadow-[0_0_8px_rgba(255,215,0,0.3)]" />
              {/* 台座中间装饰线 */}
              <div className="absolute top-[35%] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#ffd700]/20 to-transparent" />
              {/* 台座标签 */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-[#ffd700]/50 font-mono tracking-widest">
                👑 CHAMPION
              </div>
            </div>
          </div>

          {/* 🥉 季军 */}
          <div className="flex flex-col items-center">
            <PodiumCard entry={third} rank={3} />
            {/* 台座 — 最矮 */}
            <div className="relative w-32 md:w-44">
              <div
                className="w-full h-14 md:h-20 mt-1"
                style={{
                  background:
                    'linear-gradient(180deg, #1a1a2e 0%, #141420 40%, #0e0e18 100%)',
                  clipPath: 'polygon(14% 0%, 86% 0%, 100% 100%, 0% 100%)',
                  borderLeft: '1px solid rgba(255,255,255,0.04)',
                  borderRight: '1px solid rgba(255,255,255,0.04)',
                }}
              />
              {/* 台座顶部铜线 */}
              <div className="absolute top-0 left-[14%] right-[14%] h-[2px] bg-gradient-to-r from-transparent via-orange-600/30 to-transparent" />
              {/* 台座标签 */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-gray-600 font-mono">
                🥉 3RD
              </div>
            </div>
          </div>
        </div>

        {/* 底座横条 */}
        <div className="relative z-10 -mt-0.5 mx-auto max-w-[340px] md:max-w-[580px]">
          <div
            className="h-3 md:h-4 w-full"
            style={{
              background:
                'linear-gradient(180deg, #141420 0%, #0e0e18 60%, #0a0a0f 100%)',
              borderRadius: '0 0 6px 6px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
            }}
          />
        </div>
      </div>
    </section>
  )
}
