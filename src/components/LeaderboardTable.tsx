import { useState } from 'react'
import type { LeaderboardEntry } from '../types'

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[]
  totalDays: number
}

type SortKey = 'weightLoss' | 'weightLossPercent' | 'attendance' | 'bingeCount'

function MobileCard({
  entry,
  rank,
  totalDays,
}: {
  entry: LeaderboardEntry
  rank: number
  totalDays: number
}) {
  const medals = ['', '🥇', '🥈', '🥉']
  const isFirst = rank === 1

  return (
    <div
      className={`rounded-xl border p-4 ${
        isFirst
          ? 'border-neon-gold/40 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.08),transparent)]'
          : 'border-[#1e1e2a] bg-[#111118]'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-lg font-mono text-gray-500 w-6">
          {rank <= 3 ? medals[rank] : `#${rank}`}
        </span>
        <img
          src={entry.avatar}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-white font-bold">{entry.nickname}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-500">
          初始 <span className="text-gray-300 font-mono">{entry.initialWeight}kg</span>
        </div>
        <div className="text-gray-500 text-right">
          当前{' '}
          <span
            className={`font-mono ${entry.trend === 'up' ? 'text-red-400' : 'text-white'}`}
          >
            {entry.currentWeight}kg
          </span>
        </div>
        <div className="text-gray-500">
          减重{' '}
          <span
            className={`font-mono font-bold ${
              entry.weightLoss > 0
                ? 'text-neon-green'
                : entry.weightLoss < 0
                  ? 'text-red-400'
                  : 'text-gray-400'
            }`}
          >
            {entry.weightLoss > 0 ? '-' : entry.weightLoss < 0 ? '+' : ''}
            {Math.abs(entry.weightLoss).toFixed(1)}kg
          </span>
        </div>
        <div className="text-gray-500 text-right">
          <span className="font-mono text-neon-green">{entry.weightLossPercent.toFixed(1)}%</span>
        </div>
        <div className="text-gray-500">
          出勤{' '}
          <span
            className={`font-mono ${
              entry.attendance === totalDays
                ? 'text-neon-green'
                : entry.attendance < totalDays / 2
                  ? 'text-red-400'
                  : 'text-gray-300'
            }`}
          >
            {entry.attendance}/{totalDays}
          </span>
        </div>
        <div className="text-gray-500 text-right">
          爽吃{' '}
          <span
            className={`font-mono ${
              entry.bingeCount >= 3
                ? 'text-orange-400 font-bold'
                : entry.bingeCount > 0
                  ? 'text-orange-400/60'
                  : 'text-gray-600'
            }`}
          >
            {entry.bingeCount}🍗
          </span>
        </div>
      </div>
    </div>
  )
}

export default function LeaderboardTable({
  leaderboard,
  totalDays,
}: LeaderboardTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('weightLoss')

  const sorted = [...leaderboard].sort((a, b) => {
    if (sortKey === 'weightLoss') return b.weightLoss - a.weightLoss
    if (sortKey === 'weightLossPercent')
      return b.weightLossPercent - a.weightLossPercent
    if (sortKey === 'bingeCount') return b.bingeCount - a.bingeCount
    return b.attendance - a.attendance
  })

  const SortHeader = ({ field, label }: { field: SortKey; label: string }) => (
    <th
      className="px-2 md:px-4 py-3 text-right text-xs text-gray-500 cursor-pointer hover:text-neon-green transition-colors select-none"
      onClick={() => setSortKey(field)}
    >
      {label} {sortKey === field ? '▾' : '▸'}
    </th>
  )

  return (
    <section id="leaderboard" className="max-w-6xl mx-auto px-4 pb-12">
      <h2 className="text-lg font-black text-neon-green mb-4 tracking-tight">
        📊 完整排名
      </h2>

      {/* 桌面端：表格 */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#1e1e2a] bg-[#111118]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1e1e2a]">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-500 w-12">#</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">选手</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500">初始</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500">当前</th>
              <SortHeader field="weightLoss" label="减重" />
              <SortHeader field="weightLossPercent" label="减重%" />
              <SortHeader field="attendance" label="出勤" />
              <SortHeader field="bingeCount" label="爽吃数 🍗" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => {
              const isFirst = i === 0 && sortKey === 'weightLoss'
              return (
                <tr
                  key={entry.uid}
                  className={`border-b border-[#1e1e2a]/50 hover:bg-white/[0.02] transition-colors ${
                    isFirst
                      ? 'bg-[radial-gradient(ellipse_at_left,rgba(255,215,0,0.06),transparent)] border-l-2 border-l-neon-gold'
                      : ''
                  }`}
                >
                  <td className="px-4 py-3 text-gray-500 font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={entry.avatar}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-white font-medium">
                        {entry.nickname}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 font-mono text-xs">
                    {entry.initialWeight}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    <span
                      className={
                        entry.trend === 'up' ? 'text-red-400' : 'text-white'
                      }
                    >
                      {entry.currentWeight}
                    </span>
                    {entry.trend === 'up' && (
                      <span className="ml-0.5 text-[10px]">📈</span>
                    )}
                    {entry.trend === 'down' && (
                      <span className="ml-0.5 text-[10px] text-neon-green">
                        📉
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    <span
                      className={
                        entry.weightLoss > 0
                          ? 'text-neon-green font-bold'
                          : entry.weightLoss < 0
                            ? 'text-red-400'
                            : 'text-gray-400'
                      }
                    >
                      {entry.weightLoss > 0
                        ? '-'
                        : entry.weightLoss < 0
                          ? '+'
                          : ''}
                      {Math.abs(entry.weightLoss).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-neon-green">
                    {entry.weightLossPercent.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    <span
                      className={
                        entry.attendance === totalDays
                          ? 'text-neon-green'
                          : entry.attendance < totalDays / 2
                            ? 'text-red-400'
                            : 'text-gray-300'
                      }
                    >
                      {entry.attendance}/{totalDays}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    <span
                      className={
                        entry.bingeCount >= 3
                          ? 'text-orange-400 font-bold'
                          : entry.bingeCount > 0
                            ? 'text-orange-400/60'
                            : 'text-gray-600'
                      }
                    >
                      {entry.bingeCount}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 移动端：卡片 */}
      <div className="md:hidden flex flex-col gap-3">
        {sorted.map((entry, i) => (
          <MobileCard
            key={entry.uid}
            entry={entry}
            rank={i + 1}
            totalDays={totalDays}
          />
        ))}
      </div>
    </section>
  )
}
