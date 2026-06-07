import { useMemo } from 'react'
import type { LeaderboardEntry, WeekData } from '../types'
import { participantMap } from '../data/participants'
import history from '../data/history.json'

const allWeeks = history as WeekData[]

export function useWeekData(week: number) {
  return useMemo(() => {
    const weekIndex = week - 1
    if (weekIndex < 0 || weekIndex >= allWeeks.length) {
      return {
        weekData: null as WeekData | null,
        leaderboard: [] as LeaderboardEntry[],
        champion: null as LeaderboardEntry | null,
        slacker: null as LeaderboardEntry | null,
        disciplined: null as LeaderboardEntry | null,
        totalWeeks: allWeeks.length,
      }
    }

    const weekData = allWeeks[weekIndex]

    const entries: LeaderboardEntry[] = weekData.participants.map(wp => {
      const profile = participantMap.get(wp.uid)
      if (!profile) {
        throw new Error(`Unknown uid: ${wp.uid}`)
      }

      const validWeights = wp.dailyRecords
        .filter(r => r.weight !== null)
        .map(r => r.weight as number)

      const currentWeight = validWeights.length > 0
        ? validWeights[validWeights.length - 1]
        : profile.initialWeight

      const firstWeight = validWeights.length > 0
        ? validWeights[0]
        : profile.initialWeight

      const weightLoss = profile.initialWeight - currentWeight
      const weightLossPercent = (weightLoss / profile.initialWeight) * 100
      const attendance = wp.dailyRecords.filter(r => r.weight !== null).length

      let trend: "down" | "up" | "flat"
      if (currentWeight < firstWeight) trend = "down"
      else if (currentWeight > firstWeight) trend = "up"
      else trend = "flat"

      return {
        uid: wp.uid,
        nickname: profile.nickname,
        avatar: profile.avatar,
        initialWeight: profile.initialWeight,
        currentWeight,
        weightLoss: Math.round(weightLoss * 100) / 100,
        weightLossPercent: Math.round(weightLossPercent * 100) / 100,
        attendance,
        trend,
      }
    })

    entries.sort((a, b) => b.weightLoss - a.weightLoss)

    const champion = entries[0] ?? null
    const slacker = [...entries].sort((a, b) => a.attendance - b.attendance)[0] ?? null
    const disciplined = entries
      .filter(e => e.attendance === 7)
      .sort((a, b) => b.weightLoss - a.weightLoss)[0] ?? null

    return {
      weekData,
      leaderboard: entries,
      champion,
      slacker,
      disciplined,
      totalWeeks: allWeeks.length,
    }
  }, [week])
}

export { allWeeks }
