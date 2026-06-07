import { useEffect } from 'react'
import type { DailyRecord } from '../types'

interface DayDetailModalProps {
  open: boolean
  onClose: () => void
  nickname: string
  avatar: string
  date: string
  record: DailyRecord | null
  initialWeight: number
}

const DIET_COLORS: Record<string, string> = {
  '严格控制': 'bg-green-500/20 text-green-400 border-green-500/30',
  '轻度控制': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '爽吃': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  '未控制': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function DayDetailModal({
  open,
  onClose,
  nickname,
  avatar,
  date,
  record,
  initialWeight,
}: DayDetailModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  const weightChange =
    record?.weight != null ? record.weight - initialWeight : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#111118] border border-neon-green/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,255,136,0.10)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-xl"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-5">
          <img
            src={avatar}
            alt=""
            className="w-12 h-12 rounded-full border-2 border-white/10 object-cover"
          />
          <div>
            <div className="text-white font-bold">{nickname}</div>
            <div className="text-sm text-gray-500">{date}</div>
          </div>
          {!record?.weight && (
            <span className="ml-auto px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
              😴 缺卡
            </span>
          )}
        </div>

        {record?.weight ? (
          <>
            <div className="bg-[#0a0a0f] rounded-xl p-4 mb-3">
              <div className="text-xs text-gray-500 mb-1">今日体重</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {record.weight}
                </span>
                <span className="text-sm text-gray-500">kg</span>
                {weightChange != null && (
                  <span
                    className={`text-sm font-mono ml-2 ${
                      weightChange < 0
                        ? 'text-neon-green'
                        : weightChange > 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                    }`}
                  >
                    {weightChange < 0 ? '↓' : weightChange > 0 ? '↑' : '→'}{' '}
                    {Math.abs(weightChange).toFixed(1)}kg
                  </span>
                )}
              </div>
            </div>

            <div className="mb-2 px-1">
              <span className="text-xs text-gray-500">🏃 运动：</span>
              <span className="text-sm text-gray-300">{record.sport || '未记录'}</span>
            </div>

            <div className="mb-2 px-1">
              <span className="text-xs text-gray-500">🍽️ 饮食：</span>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs border ${
                  DIET_COLORS[record.diet] ?? DIET_COLORS['未控制']
                }`}
              >
                {record.diet || '未记录'}
              </span>
            </div>

            {record.note && (
              <div className="mt-4 bg-neon-green/[0.03] border-l-2 border-neon-green/30 rounded-r-lg p-3">
                <div className="text-xs text-gray-500 mb-1">💬 今日心得</div>
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  "{record.note}"
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">😴</div>
            <p>当天未打卡，没有记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
