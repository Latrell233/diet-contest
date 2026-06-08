import { useMemo } from 'react'
import type { LeaderboardEntry, WeekData } from '../types'
import { participants } from '../data/participants'
import history from '../data/history.json'

const allWeeks = history as WeekData[]

export function useWeekData(week: number) {
  return useMemo(() => {
    const weekIndex = week - 1
    const totalWeeks = allWeeks.length

    if (weekIndex < 0 || weekIndex >= allWeeks.length) {
      return {
        weekData: null as WeekData | null,
        trendWeeks: [] as WeekData[],
        leaderboard: [] as LeaderboardEntry[],
        champion: null as LeaderboardEntry | null,
        bingeKing: null as LeaderboardEntry | null,
        disciplined: null as LeaderboardEntry | null,
        totalWeeks,
      }
    }

    // 当前周（给打卡日历、AI 锐评用）
    const weekData = allWeeks[weekIndex]

    // 累计数据：合并 week 1 → week N 的所有打卡记录
    const cumulativeRecords = new Map<string, { weight: number; date: string }[]>()
    const bingeCounts = new Map<string, number>()
    const exerciseCounts = new Map<string, number>()

    for (let i = 0; i <= weekIndex; i++) {
      allWeeks[i].participants.forEach(wp => {
        if (!cumulativeRecords.has(wp.uid)) {
          cumulativeRecords.set(wp.uid, [])
          bingeCounts.set(wp.uid, 0)
          exerciseCounts.set(wp.uid, 0)
        }
        wp.dailyRecords.forEach(r => {
          if (r.weight !== null) {
            cumulativeRecords.get(wp.uid)!.push({
              weight: r.weight,
              date: r.date,
            })
          }
          if (r.diet === '爽吃') {
            bingeCounts.set(wp.uid, (bingeCounts.get(wp.uid) ?? 0) + 1)
          }
          // 运动：除了"未运动"以外都算
          if (r.sport && r.sport !== '未运动') {
            exerciseCounts.set(wp.uid, (exerciseCounts.get(wp.uid) ?? 0) + 1)
          }
        })
      })
    }

    // 累计排行榜
    const entries: LeaderboardEntry[] = participants.map(profile => {
      const records = cumulativeRecords.get(profile.uid) ?? []

      const currentWeight =
        records.length > 0
          ? records[records.length - 1].weight
          : profile.initialWeight

      const firstWeight =
        records.length > 0
          ? records[0].weight
          : profile.initialWeight

      const weightLoss = profile.initialWeight - currentWeight

      let trend: 'down' | 'up' | 'flat'
      if (currentWeight < firstWeight) trend = 'down'
      else if (currentWeight > firstWeight) trend = 'up'
      else trend = 'flat'

      return {
        uid: profile.uid,
        nickname: profile.nickname,
        avatar: profile.avatar,
        initialWeight: profile.initialWeight,
        currentWeight,
        weightLoss: Math.round(weightLoss * 100) / 100,
        weightLossPercent:
          Math.round((weightLoss / profile.initialWeight) * 10000) / 100,
        attendance: records.length,
        bingeCount: bingeCounts.get(profile.uid) ?? 0,
        exerciseCount: exerciseCounts.get(profile.uid) ?? 0,
        trend,
      }
    })

    entries.sort((a, b) => b.weightLoss - a.weightLoss)

    const champion = entries[0] ?? null

    const maxBinge = Math.max(...entries.map(e => e.bingeCount), 0)
    const bingeKing =
      maxBinge > 0
        ? entries
            .filter(e => e.bingeCount === maxBinge)
            .sort((a, b) => b.weightLoss - a.weightLoss)[0] ?? null
        : null

    // 自律之王：按运动天数排序，平局按减重
    const maxExercise = Math.max(...entries.map(e => e.exerciseCount), 0)
    const disciplined =
      entries
        .filter(e => e.exerciseCount === maxExercise)
        .sort((a, b) => b.weightLoss - a.weightLoss)[0] ?? null

    // 趋势图需要的数据：所有周到当前
    const trendWeeks = allWeeks.slice(0, weekIndex + 1)

    return {
      weekData,
      trendWeeks,
      leaderboard: entries,
      champion,
      bingeKing,
      disciplined,
      totalWeeks,
    }
  }, [week])
}

export { allWeeks }
