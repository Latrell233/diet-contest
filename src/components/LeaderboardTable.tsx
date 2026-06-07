import { useState } from 'react'
import type { LeaderboardEntry } from '../types'

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[]
}

type SortKey = 'weightLoss' | 'weightLossPercent' | 'attendance'

export default function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('weightLoss')

  const sorted = [...leaderboard].sort((a, b) => {
    if (sortKey === 'weightLoss') return b.weightLoss - a.weightLoss
    if (sortKey === 'weightLossPercent') return b.weightLossPercent - a.weightLossPercent
    return b.attendance - a.attendance
  })

  const SortHeader = ({ field, label }: { field: SortKey; label: string }) => (
    <th
      className="px-4 py-3 text-right text-xs text-gray-500 cursor-pointer hover:text-neon-green transition-colors select-none"
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
      <div className="overflow-x-auto rounded-xl border border-[#1e1e2a] bg-[#111118]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1e1e2a]">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-500 w-12">#</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">选手</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500">初始体重</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500">当前体重</th>
              <SortHeader field="weightLoss" label="累计减重" />
              <SortHeader field="weightLossPercent" label="减重%" />
              <SortHeader field="attendance" label="出勤" />
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
                      <span className="text-white font-medium">{entry.nickname}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 font-mono">
                    {entry.initialWeight}kg
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className={entry.trend === 'up' ? 'text-red-400' : 'text-white'}>
                      {entry.currentWeight}kg
                    </span>
                    {entry.trend === 'up' && <span className="ml-1">📈</span>}
                    {entry.trend === 'down' && (
                      <span className="ml-1 text-neon-green">📉</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span
                      className={
                        entry.weightLoss > 0
                          ? 'text-neon-green font-bold'
                          : entry.weightLoss < 0
                            ? 'text-red-400'
                            : 'text-gray-400'
                      }
                    >
                      {entry.weightLoss > 0 ? '-' : entry.weightLoss < 0 ? '+' : ''}
                      {Math.abs(entry.weightLoss).toFixed(1)}kg
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-neon-green">
                    {entry.weightLossPercent.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span
                      className={
                        entry.attendance === 7
                          ? 'text-neon-green'
                          : entry.attendance < 4
                            ? 'text-red-400'
                            : 'text-gray-300'
                      }
                    >
                      {entry.attendance}/7
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
