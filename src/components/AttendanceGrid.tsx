import { useState } from 'react'
import type { WeekData } from '../types'
import { participantMap } from '../data/participants'
import DayDetailModal from './DayDetailModal'

interface AttendanceGridProps {
  weekData: WeekData
}

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export default function AttendanceGrid({ weekData }: AttendanceGridProps) {
  const [selected, setSelected] = useState<{
    uid: string
    dayIndex: number
  } | null>(null)

  const getCellStyle = (uid: string, dayIndex: number) => {
    const wp = weekData.participants.find(p => p.uid === uid)
    const record = wp?.dailyRecords[dayIndex]
    if (!record || record.weight === null) {
      return 'bg-[#1a1a1a] text-gray-600 hover:bg-[#222]'
    }
    const profile = participantMap.get(uid)!
    const change =
      ((record.weight - profile.initialWeight) / profile.initialWeight) * 100
    if (change < -2) return 'bg-neon-green/40 text-white hover:bg-neon-green/50'
    if (change < -1) return 'bg-neon-green/25 text-white hover:bg-neon-green/35'
    if (change < 0) return 'bg-neon-green/15 text-white hover:bg-neon-green/25'
    if (change === 0) return 'bg-neon-green/10 text-gray-300 hover:bg-neon-green/20'
    return 'bg-yellow-500/10 text-gray-300 hover:bg-yellow-500/20'
  }

  const orderedUids = weekData.participants.map(p => p.uid)
  const selectedProfile = selected ? participantMap.get(selected.uid) : undefined
  const selectedRecord = selected
    ? weekData.participants
        .find(p => p.uid === selected.uid)
        ?.dailyRecords[selected.dayIndex] ?? null
    : null

  return (
    <>
      <section id="checkin" className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-lg font-black text-neon-green mb-4 tracking-tight">
          📅 打卡日历
        </h2>
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2a] p-4 md:p-6 overflow-x-auto">
          {/* 表头 */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1.5 mb-1.5 min-w-[560px]">
            <div className="text-xs text-gray-500 py-1 sticky left-0 bg-[#111118] z-10" />
            {WEEKDAYS.map((day, i) => {
              const dateStr = weekData.participants[0]?.dailyRecords[i]?.date
              const [, m, d] = dateStr ? dateStr.split('-') : ['', '', '']
              return (
                <div key={day} className="text-center text-xs text-gray-500 py-1">
                  <div>{day}</div>
                  <div className="text-[10px] text-gray-600">
                    {m}/{d}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 格子矩阵 */}
          {orderedUids.map(uid => {
            const profile = participantMap.get(uid)!
            return (
              <div
                key={uid}
                className="grid grid-cols-[80px_repeat(7,1fr)] gap-1.5 mb-1.5 min-w-[560px]"
              >
                <div className="flex items-center gap-1.5 py-1 pr-2 sticky left-0 bg-[#111118] z-10">
                  <img
                    src={profile.avatar}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="text-xs text-gray-400 truncate">
                    {profile.nickname}
                  </span>
                </div>

                {Array.from({ length: 7 }, (_, i) => {
                  const record = weekData.participants
                    .find(p => p.uid === uid)
                    ?.dailyRecords[i]
                  const hasData = record && record.weight !== null
                  const dateStr = record?.date ?? ''

                  return (
                    <button
                      key={i}
                      onClick={() => setSelected({ uid, dayIndex: i })}
                      className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs
                        transition-all duration-200 cursor-pointer relative group ${getCellStyle(
                          uid,
                          i,
                        )}`}
                      title={
                        hasData
                          ? `${dateStr} · ${record!.weight}kg — ${record!.note || '无心得'}`
                          : `${dateStr} · 未打卡`
                      }
                    >
                      {hasData ? (
                        <>
                          <span className="font-mono font-bold">{record!.weight}</span>
                          <span className="text-[10px] opacity-60">kg</span>
                        </>
                      ) : (
                        <span className="text-gray-600 font-mono">✕</span>
                      )}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#111118] border border-[#1e1e2a] rounded-md text-[10px] text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                        {hasData
                          ? `${dateStr} · ${record!.weight}kg`
                          : `${dateStr} · 漏卡`}
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}

          {/* 图例 */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#1e1e2a] text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-neon-green/40" /> 大幅减重
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-neon-green/15" /> 小幅减重
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-500/10" /> 小幅增重
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#1a1a1a]" /> 漏卡
            </span>
          </div>
        </div>
      </section>

      <DayDetailModal
        open={!!selected}
        onClose={() => setSelected(null)}
        nickname={selectedProfile?.nickname ?? ''}
        avatar={selectedProfile?.avatar ?? ''}
        date={selectedRecord?.date ?? ''}
        record={selectedRecord}
        initialWeight={selectedProfile?.initialWeight ?? 0}
      />
    </>
  )
}
