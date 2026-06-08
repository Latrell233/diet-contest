import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { WeekData } from '../types'
import { participantMap } from '../data/participants'

interface TrendChartProps {
  weekData: WeekData
}

const LINE_COLORS = [
  '#ffd700',
  '#00ff88',
  '#60a5fa',
  '#c084fc',
  '#f472b6',
  '#fbbf24',
  '#888888',
]

export default function TrendChart({ weekData }: TrendChartProps) {
  const days =
    weekData.participants[0]?.dailyRecords.map(r => {
      const d = new Date(r.date + 'T00:00:00')
      return `${d.getMonth() + 1}/${d.getDate()}`
    }) ?? []

  // 提前计算每人有效数据的起止范围，首尾缺卡不绘制
  const uidRange = new Map<string, { first: number; last: number }>()
  weekData.participants.forEach(wp => {
    const validIndices = wp.dailyRecords
      .map((r, i) => (r.weight !== null ? i : -1))
      .filter(i => i >= 0)
    if (validIndices.length > 0) {
      uidRange.set(wp.uid, {
        first: validIndices[0],
        last: validIndices[validIndices.length - 1],
      })
    }
  })

  const chartData = days.map((day, i) => {
    const point: Record<string, number | string | null> = { day }
    weekData.participants.forEach(wp => {
      const profile = participantMap.get(wp.uid)
      if (!profile) return
      const range = uidRange.get(wp.uid)
      // 首尾缺卡：不写入 key，Recharts 不会在此区间绘制任何东西
      if (!range || i < range.first || i > range.last) return
      const weight = wp.dailyRecords[i]?.weight
      if (weight !== null && weight !== undefined) {
        point[wp.uid] = parseFloat(
          (((weight - profile.initialWeight) / profile.initialWeight) * 100).toFixed(1),
        )
      } else {
        // 中间缺卡：显式设为 null，connectNulls=true 会以直线连接
        point[wp.uid] = null
      }
    })
    return point
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-[#111118] border border-[#1e1e2a] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {payload
          .filter((p: any) => p.value !== undefined)
          .sort((a: any, b: any) => a.value - b.value)
          .map((p: any) => {
            const profile = participantMap.get(p.dataKey)
            return (
              <div key={p.dataKey} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-gray-300">{profile?.nickname ?? p.dataKey}</span>
                <span
                  className={`font-mono ${p.value <= 0 ? 'text-neon-green' : 'text-red-400'}`}
                >
                  {p.value > 0 ? '+' : ''}
                  {p.value}%
                </span>
              </div>
            )
          })}
      </div>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      <h2 className="text-lg font-black text-neon-green mb-4 tracking-tight">
        📈 减重趋势
      </h2>
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2a] p-6">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#1e1e2a' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#1e1e2a' }}
              tickLine={false}
              tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value: string) => {
                const profile = participantMap.get(value)
                return (
                  <span className="text-gray-400 text-xs">
                    {profile?.nickname ?? value}
                  </span>
                )
              }}
            />
            {weekData.participants.map((wp, i) => {
              const color = LINE_COLORS[i % LINE_COLORS.length]
              return (
                <React.Fragment key={wp.uid}>
                  {/* 虚线层：连接所有点（包括null），显示趋势走向 */}
                  <Line
                    type="monotone"
                    dataKey={wp.uid}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    strokeOpacity={0.35}
                    dot={false}
                    activeDot={false}
                    connectNulls={true}
                    legendType="none"
                  />
                  {/* 实线层：仅在有数据的段落绘制 */}
                  <Line
                    type="monotone"
                    dataKey={wp.uid}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#0a0a0f' }}
                    connectNulls={false}
                  />
                </React.Fragment>
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
