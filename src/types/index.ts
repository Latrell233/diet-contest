// ===== 参赛者静态档案 =====
export interface Participant {
  uid: string           // "Latrell"
  nickname: string      // 展示昵称
  height: number        // cm
  initialWeight: number // kg
  avatar: string        // 头像路径
}

// ===== 每日打卡记录 =====
export type DietLevel = "严格控制" | "轻度控制" | "爽吃" | "未控制"

export interface DailyRecord {
  date: string          // "2026-06-01"
  weight: number | null // null = 缺卡
  sport: string
  diet: DietLevel
  note: string
}

// ===== AI 周评结构化数据 =====
export interface WeeklyAiComment {
  uid: string          // 打卡人 uid
  title: string        // AI 封的搞笑称号
  tags: string[]       // 本周标签
  highlight: string    // 关键表现
  comment: string      // AI 锐评正文
  nextWeekFlag: string // 下周 Flag
  prediction: string   // 玄学预测
}

// ===== 单人单周数据 =====
export interface WeeklyParticipant {
  uid: string
  dailyRecords: DailyRecord[]
  aiComment: WeeklyAiComment
}

// ===== 一周完整数据 =====
export interface WeekData {
  week: number
  dateRange: string
  participants: WeeklyParticipant[]
}

// ===== Runtime 计算结果（不在 JSON 中存储）=====
export interface LeaderboardEntry {
  uid: string
  nickname: string
  avatar: string
  initialWeight: number
  currentWeight: number
  weightLoss: number
  weightLossPercent: number
  attendance: number
  bingeCount: number
  exerciseCount: number
  trend: "down" | "up" | "flat"
}
