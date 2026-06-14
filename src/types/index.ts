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
  shoutOut?: string     // [第2周+] 隔空喊话 —— 选手异地对线
}

// ===== AI 周评结构化数据 =====
export interface WeeklyAiComment {
  uid: string          // 打卡人 uid
  title: string        // AI 封的搞笑称号
  tags: string[]       // 本周标签
  highlight: string    // 关键表现
  comment: string      // AI 锐评正文
  nextWeekFlag?: string // [第1周] 下周 Flag（第2周起由 coachGuide 取代）
  prediction?: string   // [第1周] 玄学预测（第2周起不再生成）
  coachGuide?: string   // [第2周+] 🏋️‍♂️ 专业私教避坑指南
  sassQuote?: string    // [第2周+] 🗣️ 本周高能骚话 —— 摘录原话
  sassReply?: string    // [第2周+] 🗣️ 锐评补刀 —— 30字内毒舌回怼
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
  macroReview?: string  // [第2周+] 📊 大盘宏观战报（~300字全员总评）
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
