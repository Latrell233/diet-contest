import { useState } from 'react'
import NavBar from './components/NavBar'
import HeroStats from './components/HeroStats'
import Podium from './components/Podium'
import TrendChart from './components/TrendChart'
import LeaderboardTable from './components/LeaderboardTable'
import AttendanceGrid from './components/AttendanceGrid'
import WeeklyAiComments from './components/WeeklyAiComments'
import { useWeekData, allWeeks } from './hooks/useWeekData'

function App() {
  const [currentWeek, setCurrentWeek] = useState(allWeeks.length)

  const {
    weekData,
    trendWeeks,
    leaderboard,
    champion,
    bingeKing,
    disciplined,
    totalWeeks,
  } = useWeekData(currentWeek)

  if (!weekData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-gray-500">暂无数据</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <NavBar
        currentWeek={currentWeek}
        totalWeeks={totalWeeks}
        onWeekChange={setCurrentWeek}
      />

      <main>
        <HeroStats
          champion={champion}
          bingeKing={bingeKing}
          disciplined={disciplined}
          totalDays={trendWeeks.length * 7}
        />

        <Podium leaderboard={leaderboard} />

        <TrendChart trendWeeks={trendWeeks} />

        <LeaderboardTable leaderboard={leaderboard} totalDays={trendWeeks.length * 7} />

        <AttendanceGrid weekData={weekData} />

        <WeeklyAiComments weekData={weekData} leaderboard={leaderboard} />
      </main>

      <footer className="text-center py-8 text-xs text-gray-700">
        散兵团减肥大赛 · 数据截止 {weekData.dateRange} · 纯静态看板
      </footer>
    </div>
  )
}

export default App
