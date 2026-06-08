import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { WeekData } from '../types'
import { participantMap } from '../data/participants'

interface TrendChartProps {
  trendWeeks: WeekData[]
}

const LINE_COLORS = [
  '#ffd700', // Latrell — 金色
  '#00ff88', // Bard — 青绿
  '#60a5fa', // 猪事顺利 — 蓝
  '#c084fc', // 噤. — 紫
  '#f472b6', // 起个名字 — 粉
  '#ff6b6b', // I miss — 珊瑚红
  '#888888', // 定轴转动的屑刚体 — 灰
]

export default function TrendChart({ trendWeeks }: TrendChartProps) {
  if (trendWeeks.length === 0) return null

  const uids = trendWeeks[0].participants.map(p => p.uid)

  // 拉平所有周的打卡记录，每人一条长数组
  const flatRecords = new Map<
    string,
    { date: string; weight: number | null }[]
  >()
  uids.forEach(uid => flatRecords.set(uid, []))

  trendWeeks.forEach(week => {
    week.participants.forEach(wp => {
      const arr = flatRecords.get(wp.uid)
      if (!arr) return
      wp.dailyRecords.forEach(r =>
        arr.push({ date: r.date, weight: r.weight }),
      )
    })
  })

  // X 轴标签：从第一个人取日期
  const days =
    flatRecords.get(uids[0])?.map(r => {
      const [, m, d] = r.date.split('-')
      return `${parseInt(m)}/${parseInt(d)}`
    }) ?? []

  // 前向填充缺卡日
  const lastKnown: Record<string, number> = {}
  const chartData = days.map((day, i) => {
    const point: Record<string, number | string> = { day }
    uids.forEach(uid => {
      const profile = participantMap.get(uid)
      if (!profile) return
      const rec = flatRecords.get(uid)?.[i]
      if (rec?.weight !== null && rec?.weight !== undefined) {
        const val = parseFloat(
          (
            ((rec.weight - profile.initialWeight) / profile.initialWeight) *
            100
          ).toFixed(1),
        )
        point[uid] = val
        lastKnown[uid] = val
      } else if (lastKnown[uid] !== undefined) {
        point[uid] = lastKnown[uid]
      }
    })
    return point
  })

  // 计算周分隔线位置（每周最后一天之后）
  const weekBoundaries: number[] = []
  let dayCount = 0
  for (let w = 0; w < trendWeeks.length - 1; w++) {
    dayCount += trendWeeks[w].participants[0]?.dailyRecords.length ?? 7
    weekBoundaries.push(dayCount - 1)
  }

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
              <div
                key={p.dataKey}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-gray-300">
                  {profile?.nickname ?? p.dataKey}
                </span>
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
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2a] p-4 md:p-6">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={{ stroke: '#1e1e2a' }}
              tickLine={false}
              interval={Math.max(0, Math.floor(days.length / 8) - 1)}
            />
            <YAxis
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={{ stroke: '#1e1e2a' }}
              tickLine={false}
              tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 12 }}
              formatter={(value: string) => {
                const profile = participantMap.get(value)
                return (
                  <span className="text-gray-400 text-xs">
                    {profile?.nickname ?? value}
                  </span>
                )
              }}
            />
            {weekBoundaries.map((idx, i) => (
              <ReferenceLine
                key={`w${i}`}
                x={days[idx]}
                stroke="#333"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            ))}
            {uids.map((uid, i) => (
              <Line
                key={uid}
                type="monotone"
                dataKey={uid}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#0a0a0f' }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
