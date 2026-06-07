# 宿舍减肥大赛静态网页 — 设计规格书

**日期：** 2026-06-07  
**状态：** 已确认

---

## 1. 目标与技术约束

### 1.1 核心目标
为"北交散兵团第一届减肥大赛"搭建一个纯静态、无后端、无数据库的单页看板。数据来源为本地 Excel 文件，通过 Python 脚本转换为 JSON 后由前端直接 import。

### 1.2 硬性约束
- **纯静态**：所有计算（排名、百分比、出勤率）在浏览器 Runtime 完成
- **不暴露真名**：网页展示、JSON 数据、Git 仓库中均不得出现参赛者真实姓名；仅使用 uid/昵称
- **无后端**：Vite 构建产物直接部署到 GitHub Pages / Vercel

### 1.3 技术栈
- Vite + React 18 + TypeScript
- Tailwind CSS v4（纯 Tailwind，不使用 Shadcn UI）
- Recharts（折线图，React 原生、暗黑主题友好、~150KB）
- Python 3 + openpyxl（Excel → JSON 转换脚本）

---

## 2. 视觉风格

### 2.1 赛博绿霓虹（Cyber Green Neon）
- **底色：** `#0a0a0f` 深黑
- **强调色：** `#00ff88` 霓虹绿，用于边框发光、数字高亮、按钮
- **金色：** `#ffd700` 用于排名第一的强调（金腰带、第一名行背景渐变）
- **警告色：** `#ef4444` 用于增重标记、漏卡格子
- **文本层级：** `#ffffff` / `#a0a0a0` / `#666666`
- **圆角：** 卡片 12px，按钮/标签 20px（胶囊），格子 4px
- **发光效果：** 排名第一行 `box-shadow: 0 0 20px rgba(0,255,136,0.15)`；领奖台冠军卡片金色 glow

### 2.2 排版
- 标题：`font-black` + `tracking-tight`，霓虹绿渐变文字
- 数字：`font-mono`（Tabular Nums），确保数字对齐
- Emoji：大面积使用增加趣味（🥇🥈🥉👑🕊️🔥📉📈💪）

### 2.3 暗黑模式
- 全局暗黑，不考虑亮色切换
- 卡片背景 `#111118`，边框 `#ffffff0d`
- 毛玻璃导航 `backdrop-blur-xl bg-[#0a0a0f]/80`

---

## 3. 项目结构

```
diet-contest/
├── .gitignore               # 排除 basicinfo.md, *.xlsx, config/
├── config/
│   └── name_mapping.json    # 真名→uid 映射（gitignore，不提交）
├── convert.py               # Excel → JSON 转换脚本
├── package.json
├── vite.config.ts
├── index.html
├── public/
│   └── avatars/             # 头像图片（构建时复制到 dist）
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css            # Tailwind 指令 + 自定义霓虹动画
│   ├── data/
│   │   ├── participants.ts  # 参赛者静态档案 + 头像映射
│   │   └── history.json     # 由 convert.py 生成的全量周数据
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── hooks/
│   │   └── useWeekData.ts   # 取当前周数据 + Runtime 计算排名
│   └── components/
│       ├── NavBar.tsx           # 顶部固定导航 + 周切换器
│       ├── HeroStats.tsx        # 金腰带/鸽王/自律王 三卡横排
│       ├── Podium.tsx           # 🥇🥈🥉 领奖台横向排名
│       ├── TrendChart.tsx       # 减重趋势折线图（Recharts）
│       ├── LeaderboardTable.tsx # 完整排名表（含4-7名）
│       ├── AttendanceGrid.tsx   # 7×7 GitHub 风格打卡格子墙
│       ├── DayDetailModal.tsx   # 点击格子弹出当日详情 Modal
│       └── WeeklyAiComments.tsx  # AI 周评结构化卡片列表
```

---

## 4. 数据层设计

### 4.1 TypeScript 类型 (`src/types/index.ts`)

```ts
export interface Participant {
  uid: string;              // "Latrell" — 唯一标识
  nickname: string;         // "Latrell" — 展示昵称
  height: number;           // 188 (cm)
  initialWeight: number;    // 107 (kg)，从第一周首日提取
  avatar: string;           // "/avatars/Latrell.jpg"
}

export interface DailyRecord {
  date: string;             // "2026-06-01"
  weight: number | null;    // null 表示缺卡
  sport: string;            // "有氧+力量训练"
  diet: DietLevel;          // 饮食控制等级
  note: string;             // 每日心得
}

export type DietLevel = "严格控制" | "轻度控制" | "爽吃" | "未控制";

// AI 周评结构化数据（由 weekN.md 解析生成）
export interface WeeklyAiComment {
  uid: string;              // 打卡人 uid
  title: string;            // AI 封的搞笑称号，如 "碳水潜伏者"
  tags: string[];           // 本周标签，如 ["智取减肥王", "碳水后置", "小有氧大吃"]
  highlight: string;        // 关键表现，一句话提炼
  comment: string;          // AI 锐评正文（150-200字）
  nextWeekFlag: string;     // 下周 Flag（视觉展示为 checkbox 样式，无交互）
  prediction: string;       // 玄学预测
}

export interface WeeklyParticipant {
  uid: string;
  dailyRecords: DailyRecord[];  // length = 7
  aiComment: WeeklyAiComment;   // 结构化的 AI 周评
}

export interface WeekData {
  week: number;
  dateRange: string;            // "2026.06.01 - 2026.06.07"
  participants: WeeklyParticipant[];
}

// Runtime 计算结果，不在 JSON 中存储
export interface LeaderboardEntry {
  uid: string;
  nickname: string;
  avatar: string;
  initialWeight: number;
  currentWeight: number;
  weightLoss: number;           // 累计减重 (kg)，正数=减了
  weightLossPercent: number;    // 减重百分比
  attendance: number;           // 本周出勤天数 (0-7)
  trend: "down" | "up" | "flat"; // 体重趋势
}
```

### 4.2 静态数据 (`src/data/participants.ts`)

不存真名。仅存 uid、nickname、height、initialWeight、avatar。

```ts
export const participants: Participant[] = [
  { uid: "Latrell",   nickname: "Latrell",         height: 188,   initialWeight: 107,   avatar: "/avatars/Latrell.jpg" },
  { uid: "Bard",      nickname: "Bard",             height: 175,   initialWeight: 82,    avatar: "/avatars/Bard.jpg" },
  { uid: "猪事顺利",  nickname: "猪事顺利",        height: 175.6, initialWeight: 87.25, avatar: "/avatars/猪事顺利.jpg" },
  { uid: "噤.",       nickname: "噤.",              height: 175.5, initialWeight: 81,    avatar: "/avatars/噤..jpg" },
  { uid: "起个名字",  nickname: "起个名字",        height: 180,   initialWeight: 63,    avatar: "/avatars/起个名字.jpg" },
  { uid: "I miss",    nickname: "I miss",           height: 173.5, initialWeight: 87.5,  avatar: "/avatars/I miss.jpg" },
  { uid: "定轴转动的屑刚体", nickname: "定轴转动的屑刚体", height: 180, initialWeight: 91.75, avatar: "/avatars/定轴转动的屑刚体.jpg" },
];
```

### 4.3 周数据 JSON (`src/data/history.json`)

由 `convert.py` 从 Excel 生成。数组按周排列，每周一个对象。**所有字段仅使用 uid/昵称，不含真名。**

```json
[
  {
    "week": 1,
    "dateRange": "2026.06.01 - 2026.06.07",
    "participants": [
      {
        "uid": "Latrell",
        "dailyRecords": [
          { "date": "2026-06-01", "weight": 107,   "sport": "有氧+力量训练", "diet": "严格控制", "note": "智取减肥王" },
          { "date": "2026-06-02", "weight": 106.2, "sport": "有氧+力量训练", "diet": "严格控制", "note": "今天碳水后置..." },
          { "date": "2026-06-03", "weight": 106.7, "sport": "有氧+力量训练", "diet": "未控制",   "note": "虽然我练的多..." },
          { "date": "2026-06-04", "weight": 106.3, "sport": "有氧+力量训练", "diet": "轻度控制", "note": "准备爽吃" },
          { "date": "2026-06-05", "weight": 106.4, "sport": "有氧运动",       "diet": "轻度控制", "note": "准备爽吃" },
          { "date": "2026-06-06", "weight": 105,   "sport": "未运动",         "diet": "轻度控制", "note": "今日无事发生" },
          { "date": "2026-06-07", "weight": 106,   "sport": "有氧运动",       "diet": "未控制",   "note": "小有氧大吃" }
        ],
        "aiComment": {
          "uid": "Latrell",
          "title": "碳水潜伏者",
          "tags": ["智取减肥王", "碳水后置", "小有氧大吃"],
          "highlight": "开局雄心壮志自封王者，最终在"小有氧大吃"中迷失自我。",
          "comment": "周一高呼"智取减肥王"时算得上是个硬汉...",
          "nextWeekFlag": "下周严禁使用"碳水后置法"，再敢顶风爽吃，建议直接降级为"智取干饭王"。",
          "prediction": "下周若继续"小有氧大吃"，体重将稳步重返107kg的舒适圈。"
        }
      }
    ]
  }
]
```

### 4.4 数据流

```
[Excel .xlsx] ──convert.py──→ [history.json]
                                    │
              [participants.ts] ────┤
                                    │
                    ┌───────────────▼────────────────┐
                    │        useWeekData(week)        │
                    │                                 │
                    │  • 从 history.json 取指定周     │
                    │  • 关联 participants.ts 补全    │
                    │  • 计算 ranking/weightLoss/     │
                    │    attendance                   │
                    │  • 返回 LeaderboardEntry[]      │
                    └───────────┬────────────────────┘
                                │
                    ┌───────────▼────────────────────┐
                    │           App.tsx               │
                    │  状态: currentWeek (number)     │
                    │  分发数据到各子组件             │
                    └────────────────────────────────┘
```

---

## 5. 组件规格

### 5.1 NavBar
- **定位：** `sticky top-0 z-50`
- **样式：** 半透明黑底 + `backdrop-blur-xl`，底部 1px 霓虹绿线
- **左侧：** 🏆 图标 + "散兵团减肥大赛" 文字（霓虹绿渐变）
- **右侧：** 四个锚点按钮（战报 | 龙虎榜 | 打卡墙 | 锐评）+ 周选择 `<select>` 下拉
- **行为：** 锚点点击 `scrollIntoView({ behavior: 'smooth' })`

### 5.2 HeroStats
- **布局：** 3 列等宽卡片 `grid grid-cols-3 gap-4`
- **卡片样式：** 背景 `#111118`，边框 `#ffffff0d`，hover 时边框变霓虹绿
- **卡片1 — 🏆 金腰带：** 头像 + 昵称 + "累计减重 X.X kg"，背景有微弱金色径向渐变
- **卡片2 — 🕊️ 鸽王：** 😴 Emoji + 昵称 + "缺卡 X 天"，红色警告色调
- **卡片3 — 🔥 自律王：** 💪 Emoji + 昵称 + "全勤 7/7"，霓虹绿强调
- **数据来源：** `useWeekData` 计算后传入

### 5.3 Podium（领奖台）
- **布局：** 横向三栏，🥈(左) 🥇(中) 🥉(右)
- **高度差：** 冠军栏最高（约 280px），亚军和季军稍矮（约 220px / 180px）
- **冠军卡片：** 金色渐变背景 + `box-shadow: 0 0 30px rgba(255,215,0,0.3)`，大号头像
- **亚军/季军：** 银色/铜色微光，较小头像
- **信息展示：** 头像 + 昵称 + 减重数值 + 百分比 Badge + 出勤率
- **仅显示前 3 名**

### 5.4 TrendChart（减重趋势折线图）
- **图表库：** Recharts（`LineChart` + `ResponsiveContainer`）
- **位置：** Podium 下方、LeaderboardTable 上方，全宽展示
- **数据：**
  - 横轴：日期（`6/1` → `6/7`，多周后连续显示）
  - 纵轴：减重百分比 `(当前体重 - 初始体重) / 初始体重 × 100%`，负数表示减了
  - 7 条折线，每人一条，颜色各不相同
- **配色方案（7人）：**
  - 🥇 金 `#ffd700`、🥈 银 `#00ff88`、🥉 铜 `#60a5fa`
  - 其余：紫 `#c084fc`、粉 `#f472b6`、黄 `#fbbf24`、灰 `#888888`
- **样式：**
  - 深黑图表区背景 `#111118`，虚线网格 `#1a1a1a`
  - 折线 `strokeWidth={2.5}`，终点圆点突出显示（`r={4}`）
  - 底部横排图例，颜色圆点 + 昵称
  - Tooltip hover 显示：日期 + 昵称 + 当日体重 + 累计变化%
- **多周支持：** 当 history.json 有多周数据时，X 轴自动扩展为连续日期

### 5.5 LeaderboardTable
- **布局：** 在领奖台下方，显示全部 7 人完整排名表
- **表头：** 排名 | 选手 | 初始体重 | 当前体重 | 累计减重 | 减重% | 本周出勤
- **排序：** 默认按累计减重降序；点击表头可切换排序字段
- **视觉：** 第一名行背景有微金渐变 + 霓虹绿左边框；增重者体重列红色 + 📈
- **行 hover：** 背景微亮 + 过渡动画

### 5.6 AttendanceGrid
- **布局：** 7 列（周一→周日）× 7 行（每人），格子矩阵
- **格子样式：**
  - 已打卡 + 有体重数据：霓虹绿色（根据体重变化深浅变化，减得多颜色越深）
  - 已打卡 + 无体重数据：黄色（补卡但没称体重）
  - 未打卡：深灰 `#1a1a1a`，带 X 标记
- **Tooltip（hover）：** 显示 "6月1日 107kg — 智取减肥王" 简要信息
- **点击：** 打开 DayDetailModal

### 5.7 DayDetailModal
- **触发：** 点击打卡格子
- **样式：** 居中 Modal，背景 `#111118` + 霓虹绿边框，`backdrop` 遮罩
- **内容：**
  - 头部：头像 + 昵称 + 日期
  - 体重行：今日体重 / 较初始变化（绿色↓或红色↑）
  - 运动情况
  - 饮食控制（Badge 形式，"爽吃"用橙色 Badge，"严格控制"用绿色）
  - 💬 今日心得（引用块样式，带引号装饰）
- **关闭：** 点击遮罩、右上角 X、按 ESC

### 5.8 WeeklyAiComments（AI 周评卡片列表）
- **数据来源：** `history.json` 中每个 `WeeklyParticipant.aiComment`，以及 `participants.ts` 的头像/昵称
- **布局：** 纵向堆叠的卡片列表，每人一张独立卡片，按排名顺序排列
- **卡片结构（从上到下）：**
  1. **Header**：头像 + 昵称 + 搞笑称号（霓虹紫粉渐变 Badge，如 `碳水潜伏者`）
  2. **本周标签**：解析为彩色标签数组，横排展示（每个标签不同颜色：绿/蓝/紫/橙/粉）
  3. **关键表现**：Blockquote 引用样式，左边框霓虹绿，字体 italic，作为正文引子
  4. **AI 锐评**：正文段落，`leading-relaxed`，字号 15px，颜色 `#d0d0d0`
  5. **下周 Flag**：灰色卡片条，左侧 ☐ Checkbox 图标（纯视觉，无交互），文字 `line-through` 风格但保留可读
  6. **玄学预测**：底部小字，🔮 Emoji 前缀，颜色 `#888`
- **卡片样式：** 背景 `#111118`，边框 `#ffffff0d`，hover 时边框变霓虹紫 `#c084fc44`，顶部 2px 紫粉渐变装饰线
- **响应式：** 移动端卡片全宽，桌面端最大宽 720px 居中

### 5.9 Markdown → JSON 辅助脚本 (`parse_comments.py`)
- **输入：** `weekN.md`（Gemini AI 输出的标准格式 Markdown）
- **输出：** 结构化 JSON 片段，可直接合并进 `history.json`
- **真名替换：** 脚本内置 `config/name_mapping.json` 映射表，将文案中的真名替换为 uid（如 `周子谦`→`Bard`，`代极峰`→`I miss`）；昵称/外号不替换（`雷子`、`廖子`、`廖子强` 保留）
- **解析逻辑：** 正则匹配 `### 👑 [名称] ｜ [称号]` 和各 `**字段**：值` 行
- **执行方式：** 每周手动运行，将输出追加到 `history.json` 对应周的 `participants[].aiComment`

---

## 6. Excel → JSON 转换脚本 (`convert.py`)

### 6.1 输入
- `北交散兵团第一届减肥大赛打卡.xlsx`
- `config/name_mapping.json`（真名→uid 映射，gitignore）

### 6.2 输出
- `src/data/history.json`（全量周数据数组）

### 6.3 逻辑
1. 使用 openpyxl 读取三个 sheet
2. 从"汇总-计数"提取每人每天的打卡状态（有时间=打卡，X=缺卡）
3. 从"汇总-内容"提取每日体重、运动、饮食、心得
4. 从"明细"验证/补充数据
5. 通过 name_mapping.json 将所有真名替换为 uid
6. 输出符合 WeekData[] 类型的 JSON

### 6.4 隐私保护
- `config/name_mapping.json` 在 `.gitignore` 中，不提交
- `convert.py` 本身也建议加入 `.gitignore`（含映射逻辑），或只提交模板版本
- 输出的 `history.json` 不含任何真名

---

## 7. Runtime 计算逻辑 (`useWeekData`)

```ts
function useWeekData(week: number) {
  // 1. 从 history.json 取 weekData
  // 2. 从 participants.ts 取静态信息
  // 3. 对每个参赛者计算：
  //    - currentWeight: dailyRecords 中最后一个非 null 体重
  //    - weightLoss: initialWeight - currentWeight
  //    - weightLossPercent: (weightLoss / initialWeight) * 100
  //    - attendance: dailyRecords 中有体重记录的天数
  //    - trend: currentWeight vs 第一天体重
  // 4. 排序：weightLoss 降序
  // 5. 返回 {
  //      weekData,           // 原始周数据
  //      leaderboard,        // LeaderboardEntry[] 排名
  //      champion,           // 金腰带（第一名）
  //      slacker,            // 鸽王（缺卡最多）
  //      disciplined,        // 自律王（全勤且减重最多）
  //    }
}
```

---

## 8. `.gitignore` 清单

```
node_modules/
dist/
.DS_Store
.superpowers/

# 含真名的源文件
basicinfo.md
*.xlsx
config/

# 转换脚本（可选，如果含真名映射）
# convert.py
```

---

## 9. 后续扩展

- 每周更新只需：Excel 新增行 → 跑 `convert.py` → 替换 `history.json` → `npm run build` → 部署
- 多周支持：NavBar 的周切换器读取 `history.json` 长度，动态生成选项
- AI 评语目前手动填写在 JSON 中；后续可接 API 自动生成

---

## 10. 自检清单

- [x] 所有类型定义不含真名字段
- [x] JSON 结构支持多周扩展
- [x] 排名/百分比/出勤率均为前端 Runtime 计算
- [x] 领奖台横向布局（冠军居中）
- [x] 减重趋势折线图（Recharts，全宽，7色曲线）
- [x] 打卡格子可点击弹出 Modal
- [x] 暗黑赛博绿霓虹风格
- [x] `.gitignore` 排除所有含真名的文件
