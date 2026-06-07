# 宿舍减肥大赛静态网页 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为"北交散兵团第一届减肥大赛"搭建纯静态单页看板，Vite + React + TypeScript + Tailwind CSS + Recharts，数据来自 Python 脚本转换的静态 JSON。

**Architecture:** 所有数据在构建时编译进 JS bundle（`history.json` 和 `participants.ts` 直接 import）。`useWeekData` hook 在 Runtime 完成排名/百分比/出勤率计算。8 个组件通过 App.tsx 接收数据。Excel → JSON 和 Markdown → JSON 由两个 Python 脚本离线完成。

**Tech Stack:** Vite + React 18 + TypeScript + Tailwind CSS v3 + Recharts + Python 3 (openpyxl)

---

### Task 1: 项目脚手架与依赖安装

**Files:**
- Create: `package.json`（通过 Vite 模板生成）
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.tsx`（骨架）
- Create: `.gitignore`

- [ ] **Step 1: 使用 Vite 创建 React + TypeScript 项目**

```bash
cd /Users/leiwencheng/Coding/indiedev/diet-contest
npm create vite@latest . -- --template react-ts
```

根据提示确认覆盖（已有文件均为非代码文件，安全覆盖）。

- [ ] **Step 2: 安装依赖**

```bash
npm install
npm install recharts
npm install -D tailwindcss postcss autoprefixer
```

- [ ] **Step 3: 初始化 Tailwind CSS**

```bash
npx tailwindcss init -p
```

- [ ] **Step 4: 配置 `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#00ff88',
          purple: '#c084fc',
          pink: '#f472b6',
          gold: '#ffd700',
        },
        dark: {
          base: '#0a0a0f',
          card: '#111118',
          border: '#1e1e2a',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: 写入 `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0a0a0f;
  color: #ffffff;
}

/* 自定义霓虹发光动画 */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.15); }
  50% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.30); }
}

.glow-neon {
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes gold-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.gold-shimmer {
  background: linear-gradient(90deg, rgba(255,215,0,0.08), rgba(255,215,0,0.2), rgba(255,215,0,0.08));
  background-size: 200% 200%;
  animation: gold-shimmer 3s ease-in-out infinite;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: #0a0a0f;
}
::-webkit-scrollbar-thumb {
  background: #1e1e2a;
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: #00ff8844;
}
```

- [ ] **Step 6: 更新 `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏆</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>散兵团减肥大赛</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: 写入 `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 8: 写入 `src/App.tsx` 骨架**

```tsx
function App() {
  return (
    <div className="min-h-screen bg-dark-base text-white">
      <h1 className="text-neon-green text-2xl font-black p-8">散兵团减肥大赛 🏆</h1>
    </div>
  )
}

export default App
```

- [ ] **Step 9: 创建 `.gitignore`**

```
node_modules/
dist/
.DS_Store
.superpowers/

# 含真名的源文件 — 严禁提交
basicinfo.md
*.xlsx
config/
week*.md

# 转换脚本（含真名映射）
convert.py
parse_comments.py
```

- [ ] **Step 10: 运行开发服务器确认脚手架正常**

```bash
npm run dev
```

打开 `http://localhost:5173`，确认看到标题文字和暗黑背景。

---

### Task 2: TypeScript 类型定义

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 创建 `src/types/index.ts`**

```ts
// ===== 参赛者静态档案 =====
export interface Participant {
  uid: string           // "Latrell"
  nickname: string      // 展示昵称
  height: number        // cm
  initialWeight: number // kg，从第一周首日提取
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
  dailyRecords: DailyRecord[]  // 长度固定为 7
  aiComment: WeeklyAiComment
}

// ===== 一周完整数据 =====
export interface WeekData {
  week: number
  dateRange: string  // "2026.06.01 - 2026.06.07"
  participants: WeeklyParticipant[]
}

// ===== Runtime 计算结果（不在 JSON 中存储）=====
export interface LeaderboardEntry {
  uid: string
  nickname: string
  avatar: string
  initialWeight: number
  currentWeight: number
  weightLoss: number        // 累计减重(kg)，正数=减了
  weightLossPercent: number // 减重百分比
  attendance: number        // 出勤天数 0-7
  trend: "down" | "up" | "flat"
}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

Expected: 无错误。

---

### Task 3: 静态数据文件

**Files:**
- Create: `src/data/participants.ts`

- [ ] **Step 1: 创建 `src/data/participants.ts`**

**重要：不包含任何真名。**

```ts
import type { Participant } from '../types'

export const participants: Participant[] = [
  {
    uid: "Latrell",
    nickname: "Latrell",
    height: 188,
    initialWeight: 107,
    avatar: "/avatars/Latrell.jpg",
  },
  {
    uid: "Bard",
    nickname: "Bard",
    height: 175,
    initialWeight: 82,
    avatar: "/avatars/Bard.jpg",
  },
  {
    uid: "猪事顺利",
    nickname: "猪事顺利",
    height: 175.6,
    initialWeight: 87.25,
    avatar: "/avatars/猪事顺利.jpg",
  },
  {
    uid: "噤.",
    nickname: "噤.",
    height: 175.5,
    initialWeight: 81,
    avatar: "/avatars/噤..jpg",
  },
  {
    uid: "起个名字",
    nickname: "起个名字",
    height: 180,
    initialWeight: 63,
    avatar: "/avatars/起个名字.jpg",
  },
  {
    uid: "I miss",
    nickname: "I miss",
    height: 173.5,
    initialWeight: 87.5,
    avatar: "/avatars/I miss.jpg",
  },
  {
    uid: "定轴转动的屑刚体",
    nickname: "定轴转动的屑刚体",
    height: 180,
    initialWeight: 91.75,
    avatar: "/avatars/定轴转动的屑刚体.jpg",
  },
] as const

/** 快速查找：uid → Participant */
export const participantMap = new Map(
  participants.map(p => [p.uid, p])
)
```

---

### Task 4: Python Excel → JSON 转换脚本

**Files:**
- Create: `convert.py`（**.gitignore 排除**）
- Create: `config/name_mapping.json`（**.gitignore 排除**）
- Generate: `src/data/history.json`

- [ ] **Step 1: 创建 `config/name_mapping.json`**

> ⚠️ 此文件含真名，已在 .gitignore 中排除，不会提交到 Git。

```json
{
  "周子谦": "Bard",
  "代极峰": "I miss",
  "廖云鹏": "定轴转动的屑刚体"
}
```

- [ ] **Step 2: 创建 `convert.py`**

```python
"""将 Excel 打卡表转换为 history.json。

用法：python convert.py [excel_path] [output_path]
默认：python convert.py 北交散兵团第一届减肥大赛打卡.xlsx src/data/history.json
"""

import json
import sys
import os
from openpyxl import load_workbook

# 真名 → uid 映射（从 config 读取）
def load_name_mapping():
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'name_mapping.json')
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

# 打卡人/昵称 → uid 映射（姓名可能出现在不同列）
NICKNAME_TO_UID = {
    # 汇总-计数 的打卡人列
    "Latrell": "Latrell",
    "猪事顺利": "猪事顺利",
    "噤.": "噤.",
    "起个名字": "起个名字",
    # 汇总-内容 的昵称列 + 打卡人列（需要映射）
    "微信用户15f70e": "猪事顺利",
    "I miss": "I miss",
    # 真名→uid（通过 name_mapping.json 覆盖）
}

def resolve_uid(name, name_mapping):
    """将任意名称解析为 uid。"""
    name = str(name).strip()
    # 直接查昵称表
    if name in NICKNAME_TO_UID:
        return NICKNAME_TO_UID[name]
    # 查真名映射表
    if name in name_mapping:
        return name_mapping[name]
    # 如果已经是 uid，直接返回
    if name in {"Latrell", "Bard", "猪事顺利", "噤.", "起个名字", "I miss", "定轴转动的屑刚体"}:
        return name
    # 兜底：返回原名（应该尽量不走到这里）
    print(f"⚠️ 无法解析名称: {name}")
    return name

def parse_excel(excel_path):
    """解析 Excel，返回 WeekData[]。"""
    wb = load_workbook(excel_path, data_only=True)
    name_mapping = load_name_mapping()

    # ===== 1. 解析"汇总-计数"：提取打卡状态 =====
    ws_count = wb['汇总-计数']
    # 第一行：打卡人 | 累计次数 | ... | 日期1 | 日期2 | ... | 日期7
    dates = []
    for col in range(6, 13):  # F-L (6月1日到6月7日)
        dates.append(str(ws_count.cell(row=1, column=col).value or ''))

    attendance_map = {}  # uid → { date: bool }
    for row_idx in range(3, 10):  # 行3-9：7个参赛者
        raw_name = str(ws_count.cell(row=row_idx, column=1).value or '')
        uid = resolve_uid(raw_name, name_mapping)
        attendance_map[uid] = {}
        for i, col in enumerate(range(6, 13)):
            val = str(ws_count.cell(row=row_idx, column=col).value or '')
            attendance_map[uid][dates[i]] = val != 'X' and val != 'None' and val != ''

    # ===== 2. 解析"汇总-内容"：提取每日详细信息 =====
    ws_content = wb['汇总-内容']
    # 第一行：昵称 | 打卡人 | 应打卡 | 实打卡 | 每日4列（体重/运动/饮食/心得） × 7天
    # 共 4 + 4*7 = 32 列有效数据（实际可能更多列）
    content_dates = []
    for i in range(7):
        date_col = 5 + i * 6  # E, K, Q, W, AC, AI, AO
        content_dates.append(str(ws_content.cell(row=1, column=date_col).value or ''))

    participants_data = []  # uid → dailyRecords

    for row_idx in range(3, 10):
        raw_name = str(ws_content.cell(row=row_idx, column=2).value or '')  # 打卡人列
        uid = resolve_uid(raw_name, name_mapping)

        daily_records = []
        for i in range(7):
            date_str = content_dates[i]
            base_col = 5 + i * 6  # 体重列
            weight_raw = ws_content.cell(row=row_idx, column=base_col).value
            sport = str(ws_content.cell(row=row_idx, column=base_col + 1).value or '')
            diet = str(ws_content.cell(row=row_idx, column=base_col + 2).value or '')
            note = str(ws_content.cell(row=row_idx, column=base_col + 3).value or '')

            # 检查是否打卡
            has_checkin = attendance_map.get(uid, {}).get(date_str, False)

            if has_checkin and weight_raw is not None and str(weight_raw).strip() != '':
                try:
                    weight = float(weight_raw)
                except (ValueError, TypeError):
                    weight = None
            else:
                weight = None

            # 如果没有打卡但 weight 是 None → 标记为缺卡
            if not has_checkin:
                sport = sport if sport and sport != 'None' else ''
                diet = diet if diet and diet != 'None' else '未控制'
                note = note if note and note != 'None' else ''

            daily_records.append({
                "date": date_str,
                "weight": weight,
                "sport": sport if sport and sport != 'None' else '',
                "diet": diet if diet and diet != 'None' else '未控制',
                "note": note if note and note != 'None' else ''
            })

        participants_data.append({
            "uid": uid,
            "dailyRecords": daily_records,
            "aiComment": {
                "uid": uid,
                "title": "",
                "tags": [],
                "highlight": "",
                "comment": "",
                "nextWeekFlag": "",
                "prediction": ""
            }
        })

    # ===== 3. 构建 WeekData =====
    week_data = {
        "week": 1,
        "dateRange": f"{dates[0]} - {dates[6]}",
        "participants": participants_data
    }

    return [week_data]

def main():
    excel_path = sys.argv[1] if len(sys.argv) > 1 else '北交散兵团第一届减肥大赛打卡.xlsx'
    output_path = sys.argv[2] if len(sys.argv) > 2 else 'src/data/history.json'

    data = parse_excel(excel_path)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ 已生成 {output_path}")
    print(f"   共 {len(data)} 周数据，{len(data[0]['participants'])} 名参赛者")

if __name__ == '__main__':
    main()
```

- [ ] **Step 3: 安装依赖并运行脚本**

```bash
pip3 install openpyxl
python3 convert.py
```

Expected: 输出 `✅ 已生成 src/data/history.json   共 1 周数据，7 名参赛者`

- [ ] **Step 4: 验证生成的 JSON 不含真名**

```bash
python3 -c "
import json
with open('src/data/history.json') as f:
    data = json.load(f)
# 检查所有字符串值
text = json.dumps(data, ensure_ascii=False)
for name in ['雷文丞', '周子谦', '彭泓勋', '郭哲文', '郝伊康', '代极峰', '廖云鹏']:
    if name in text:
        print(f'❌ 发现真名: {name}')
        break
else:
    print('✅ 无真名泄露')
for uid in ['Latrell', 'Bard', '猪事顺利', '噤.', '起个名字', 'I miss', '定轴转动的屑刚体']:
    if uid in text:
        print(f'  ✓ 包含 uid: {uid}')
"
```

- [ ] **Step 5: 确认 `src/data/history.json` 已生成**

```bash
ls -la src/data/history.json
```

---

### Task 5: Markdown → JSON 解析脚本

**Files:**
- Create: `parse_comments.py`（**.gitignore 排除**）

- [ ] **Step 1: 创建 `parse_comments.py`**

```python
"""将 Gemini AI 输出的 weekN.md 解析为结构化 JSON，并合并到 history.json。

用法：
  1. python parse_comments.py week1.md   # 生成独立 JSON
  2. python parse_comments.py week1.md --merge src/data/history.json  # 合并到 history.json
"""

import json
import re
import sys
import os

# 真名→uid 替换表（昵称/外号不替换：雷子、廖子、廖子强）
REAL_NAME_MAP = {}
config_path = os.path.join(os.path.dirname(__file__), 'config', 'name_mapping.json')
if os.path.exists(config_path):
    with open(config_path, 'r', encoding='utf-8') as f:
        REAL_NAME_MAP = json.load(f)

# 打卡人名称在 markdown 标题中的形式 → uid
TITLE_NAME_TO_UID = {
    "Latrell": "Latrell",
    "周子谦": "Bard",       # 真名 → uid
    "猪事顺利": "猪事顺利",
    "噤.": "噤.",
    "起个名字": "起个名字",
    "代极峰": "I miss",     # 真名 → uid
    "定轴转动的屑刚体": "定轴转动的屑刚体",
}

def replace_real_names(text):
    """将文本中的真名替换为 uid，保留昵称/外号。"""
    for real_name, uid in REAL_NAME_MAP.items():
        text = text.replace(real_name, uid)
    return text

def parse_markdown(md_path):
    """解析 weekN.md，返回 WeeklyAiComment[]。"""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 按 --- 分割每个人
    blocks = re.split(r'\n---\n', content)
    comments = []

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # 提取标题: ### 👑 [名称] ｜ [称号]
        title_match = re.match(r'### 👑 (.+?) ｜ (.+)', block)
        if not title_match:
            continue

        raw_name = title_match.group(1).strip()
        title = title_match.group(2).strip()
        uid = TITLE_NAME_TO_UID.get(raw_name, raw_name)

        # 提取各字段（格式：* **字段名**：值）
        def extract_field(field_name):
            pattern = rf'\* \*\*{field_name}\*\*：(.+?)(?:\n\* \*\*|\n\n|\n---|\Z)'
            match = re.search(pattern, block, re.DOTALL)
            if match:
                return replace_real_names(match.group(1).strip())
            return ""

        tags_str = extract_field('本周标签')
        tags = [t.strip() for t in tags_str.split('/')] if tags_str else []

        highlight = extract_field('关键表现')
        comment = extract_field('AI 锐评')
        next_week_flag = extract_field('下周 Flag')
        prediction = extract_field('玄学预测')

        comments.append({
            "uid": uid,
            "title": replace_real_names(title),
            "tags": [replace_real_names(t) for t in tags],
            "highlight": highlight,
            "comment": comment,
            "nextWeekFlag": next_week_flag,
            "prediction": prediction
        })

    return comments

def merge_to_history(comments, history_path):
    """将 AI 评语合并到 history.json 对应周的 participants 中。"""
    with open(history_path, 'r', encoding='utf-8') as f:
        history = json.load(f)

    # 默认合并到最新一周
    week = history[-1]
    uid_to_comment = {c['uid']: c for c in comments}

    for p in week['participants']:
        if p['uid'] in uid_to_comment:
            p['aiComment'] = uid_to_comment[p['uid']]

    with open(history_path, 'w', encoding='utf-8') as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

    print(f"✅ 已合并 {len(uid_to_comment)} 条 AI 评语到 {history_path}")

def main():
    if len(sys.argv) < 2:
        print("用法: python parse_comments.py <weekN.md> [--merge <history.json>]")
        sys.exit(1)

    md_path = sys.argv[1]
    comments = parse_markdown(md_path)

    if '--merge' in sys.argv:
        merge_idx = sys.argv.index('--merge')
        history_path = sys.argv[merge_idx + 1]
        merge_to_history(comments, history_path)
    else:
        # 独立输出
        output = json.dumps(comments, ensure_ascii=False, indent=2)
        print(output)
        print(f"\n✅ 解析出 {len(comments)} 条 AI 评语")

if __name__ == '__main__':
    main()
```

- [ ] **Step 2: 运行脚本合并 AI 评语**

```bash
python3 parse_comments.py week1.md --merge src/data/history.json
```

- [ ] **Step 3: 验证 AI 评语已合并且不含真名**

```bash
python3 -c "
import json
with open('src/data/history.json') as f:
    data = json.load(f)
for p in data[0]['participants']:
    ai = p.get('aiComment', {})
    print(f\"{p['uid']}: 称号={ai.get('title','无')}  标签={ai.get('tags','无')}\")
    body = json.dumps(ai, ensure_ascii=False)
    for real in ['周子谦', '代极峰', '廖云鹏']:
        if real in body:
            print(f'  ❌ 含真名: {real}')
"
```

---

### Task 6: `useWeekData` Hook

**Files:**
- Create: `src/hooks/useWeekData.ts`

- [ ] **Step 1: 创建 `src/hooks/useWeekData.ts`**

```ts
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

    // 计算每位参赛者的排名数据
    const entries: LeaderboardEntry[] = weekData.participants.map(wp => {
      const profile = participantMap.get(wp.uid)
      if (!profile) {
        throw new Error(`Unknown uid: ${wp.uid}`)
      }

      // 最新体重：dailyRecords 中最后一个非 null 体重
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

    // 按累计减重降序排序
    entries.sort((a, b) => b.weightLoss - a.weightLoss)

    // 金腰带 = 第一名
    const champion = entries[0] ?? null

    // 鸽王 = 缺卡最多
    const slacker = [...entries].sort((a, b) => a.attendance - b.attendance)[0] ?? null

    // 自律王 = 全勤中减重最多
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
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

Expected: 无类型错误。如果有 `resolveJsonModule` 相关错误，确认 `tsconfig.json` 中 `"resolveJsonModule": true`。

---

### Task 7: NavBar 组件

**Files:**
- Create: `src/components/NavBar.tsx`

- [ ] **Step 1: 创建 `src/components/NavBar.tsx`**

```tsx
interface NavBarProps {
  currentWeek: number
  totalWeeks: number
  onWeekChange: (week: number) => void
}

const NAV_ITEMS = [
  { id: 'hero', label: '🔥 战报' },
  { id: 'leaderboard', label: '🏆 龙虎榜' },
  { id: 'checkin', label: '📅 打卡墙' },
  { id: 'comments', label: '💬 AI锐评' },
] as const

export default function NavBar({ currentWeek, totalWeeks, onWeekChange }: NavBarProps) {
  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-dark-base/80 border-b border-neon-green/20">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 左侧 Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 text-neon-green font-black text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          🏆 散兵团减肥大赛
        </button>

        {/* 右侧导航 + 周切换 */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleScroll(item.id)}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-neon-green hover:bg-neon-green/5 rounded-lg transition-all duration-200"
            >
              {item.label}
            </button>
          ))}

          {/* 周切换器 */}
          {totalWeeks > 1 && (
            <select
              value={currentWeek}
              onChange={e => onWeekChange(Number(e.target.value))}
              className="ml-3 px-2 py-1 text-xs bg-dark-card border border-dark-border rounded-lg text-gray-300 
                         focus:outline-none focus:border-neon-green/50 cursor-pointer appearance-none"
            >
              {Array.from({ length: totalWeeks }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  第 {i + 1} 周
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </nav>
  )
}
```

---

### Task 8: HeroStats 组件

**Files:**
- Create: `src/components/HeroStats.tsx`

- [ ] **Step 1: 创建 `src/components/HeroStats.tsx`**

```tsx
import type { LeaderboardEntry } from '../types'

interface HeroStatsProps {
  champion: LeaderboardEntry | null
  slacker: LeaderboardEntry | null
  disciplined: LeaderboardEntry | null
}

function StatCard({
  emoji,
  label,
  entry,
  accent,
}: {
  emoji: string
  label: string
  entry: LeaderboardEntry | null
  accent: 'gold' | 'red' | 'green'
}) {
  if (!entry) return null

  const accentColors = {
    gold: 'border-neon-gold/30 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.08),transparent)]',
    red: 'border-red-500/20 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.06),transparent)]',
    green: 'border-neon-green/30 bg-[radial-gradient(ellipse_at_top,rgba(0,255,136,0.06),transparent)]',
  }

  const accentText = {
    gold: 'text-neon-gold',
    red: 'text-red-400',
    green: 'text-neon-green',
  }

  return (
    <div className={`rounded-xl border p-4 ${accentColors[accent]} hover:border-neon-green/40 transition-all duration-300`}>
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <img
          src={entry.avatar}
          alt={entry.nickname}
          className="w-10 h-10 rounded-full border-2 border-white/10 object-cover"
        />
        <div>
          <div className="text-sm font-semibold text-white">{entry.nickname}</div>
          {accent === 'gold' && (
            <div className={`text-lg font-black font-mono ${accentText[accent]}`}>
              {entry.weightLoss > 0 ? `-${entry.weightLoss.toFixed(1)}kg` : `${entry.weightLoss.toFixed(1)}kg`}
            </div>
          )}
          {accent === 'red' && (
            <div className="text-sm text-red-400 font-mono">
              😴 缺卡 {7 - entry.attendance} 天
            </div>
          )}
          {accent === 'green' && (
            <div className="text-sm text-neon-green font-mono">
              💪 全勤 {entry.attendance}/7 · {entry.weightLoss > 0 ? `-${entry.weightLoss.toFixed(1)}kg` : '0kg'}
            </div>
          )}
        </div>
        <span className="ml-auto text-2xl">{emoji}</span>
      </div>
    </div>
  )
}

export default function HeroStats({ champion, slacker, disciplined }: HeroStatsProps) {
  return (
    <section id="hero" className="max-w-6xl mx-auto px-4 pt-6 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard emoji="👑" label="🏆 本周金腰带" entry={champion} accent="gold" />
        <StatCard emoji="🕊️" label="🕊️ 本周鸽王" entry={slacker} accent="red" />
        <StatCard emoji="🔥" label="🔥 自律之王" entry={disciplined} accent="green" />
      </div>
    </section>
  )
}
```

---

### Task 9: Podium 领奖台组件

**Files:**
- Create: `src/components/Podium.tsx`

- [ ] **Step 1: 创建 `src/components/Podium.tsx`**

```tsx
import type { LeaderboardEntry } from '../types'

interface PodiumProps {
  leaderboard: LeaderboardEntry[]
}

function PodiumCard({
  entry,
  rank,
  height,
}: {
  entry: LeaderboardEntry
  rank: 1 | 2 | 3
  height: string
}) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const glows = {
    1: 'shadow-[0_0_30px_rgba(255,215,0,0.25)] gold-shimmer border-neon-gold/40',
    2: 'shadow-[0_0_15px_rgba(192,192,192,0.10)] border-gray-400/20',
    3: 'shadow-[0_0_15px_rgba(205,127,50,0.10)] border-orange-600/20',
  }

  return (
    <div className={`flex flex-col items-center justify-end ${height}`}>
      {/* 头像 */}
      <div className="relative mb-2">
        <img
          src={entry.avatar}
          alt={entry.nickname}
          className={`rounded-full object-cover border-2 ${
            rank === 1 ? 'w-20 h-20 border-neon-gold' : 'w-16 h-16 border-gray-500'
          }`}
        />
        <span className="absolute -top-1 -right-1 text-xl">{medals[rank]}</span>
      </div>

      {/* 信息卡 */}
      <div className={`w-full max-w-[180px] rounded-xl ${glows[rank]} bg-dark-card border p-3 text-center`}>
        <div className="text-sm font-bold text-white truncate">{entry.nickname}</div>
        <div className="text-lg font-black font-mono text-neon-green mt-1">
          {entry.weightLoss > 0 ? '-' : ''}{entry.weightLoss.toFixed(1)}kg
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {entry.weightLossPercent.toFixed(1)}% · 出勤 {entry.attendance}/7
        </div>
      </div>
    </div>
  )
}

export default function Podium({ leaderboard }: PodiumProps) {
  if (leaderboard.length < 3) return null
  const [first, second, third] = leaderboard

  return (
    <section className="max-w-6xl mx-auto px-4 pb-8">
      <h2 className="text-center text-sm text-gray-500 mb-6 tracking-widest uppercase">
        🏅 领奖台
      </h2>
      <div className="flex items-end justify-center gap-3 md:gap-6">
        {/* 亚军 (左) */}
        <PodiumCard entry={second} rank={2} height="h-[180px]" />
        {/* 冠军 (中，最高) */}
        <PodiumCard entry={first} rank={1} height="h-[240px]" />
        {/* 季军 (右) */}
        <PodiumCard entry={third} rank={3} height="h-[150px]" />
      </div>
    </section>
  )
}
```

---

### Task 10: LeaderboardTable 组件

**Files:**
- Create: `src/components/LeaderboardTable.tsx`

- [ ] **Step 1: 创建 `src/components/LeaderboardTable.tsx`**

```tsx
import { useState } from 'react'
import type { LeaderboardEntry } from '../types'

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[]
}

type SortKey = 'weightLoss' | 'weightLossPercent' | 'attendance'

export default function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('weightLoss')

  const sorted = [...leaderboard].sort((a, b) => {
    if (sortKey === 'weightLoss') return b.weightLoss - a.weightLoss
    if (sortKey === 'weightLossPercent') return b.weightLossPercent - a.weightLossPercent
    return b.attendance - a.attendance
  })

  const SortHeader = ({ field, label }: { field: SortKey; label: string }) => (
    <th
      className="px-4 py-3 text-left text-xs text-gray-500 cursor-pointer hover:text-neon-green transition-colors select-none"
      onClick={() => setSortKey(field)}
    >
      {label} {sortKey === field ? '▾' : '▸'}
    </th>
  )

  return (
    <section id="leaderboard" className="max-w-6xl mx-auto px-4 pb-12">
      <h2 className="text-lg font-black text-neon-green mb-4 tracking-tight">📊 完整排名</h2>
      <div className="overflow-x-auto rounded-xl border border-dark-border bg-dark-card">
        <table className="w-full text-sm">
          <thead className="border-b border-dark-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-500 w-12">#</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">选手</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500">初始体重</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500">当前体重</th>
              <SortHeader field="weightLoss" label="累计减重" />
              <SortHeader field="weightLossPercent" label="减重%" />
              <SortHeader field="attendance" label="出勤" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => {
              const isFirst = i === 0 && sortKey === 'weightLoss'
              return (
                <tr
                  key={entry.uid}
                  className={`border-b border-dark-border/50 hover:bg-white/[0.02] transition-colors ${
                    isFirst ? 'bg-[radial-gradient(ellipse_at_left,rgba(255,215,0,0.06),transparent)] border-l-2 border-l-neon-gold' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-gray-500 font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={entry.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-white font-medium">{entry.nickname}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 font-mono">{entry.initialWeight}kg</td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className={entry.trend === 'up' ? 'text-red-400' : 'text-white'}>
                      {entry.currentWeight}kg
                    </span>
                    {entry.trend === 'up' && <span className="ml-1">📈</span>}
                    {entry.trend === 'down' && <span className="ml-1 text-neon-green">📉</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className={entry.weightLoss > 0 ? 'text-neon-green font-bold' : entry.weightLoss < 0 ? 'text-red-400' : 'text-gray-400'}>
                      {entry.weightLoss > 0 ? '-' : entry.weightLoss < 0 ? '+' : ''}{Math.abs(entry.weightLoss).toFixed(1)}kg
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-neon-green">
                    {entry.weightLossPercent.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className={entry.attendance === 7 ? 'text-neon-green' : entry.attendance < 4 ? 'text-red-400' : 'text-gray-300'}>
                      {entry.attendance}/7
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
```

---

### Task 11: TrendChart 折线图组件

**Files:**
- Create: `src/components/TrendChart.tsx`

- [ ] **Step 1: 创建 `src/components/TrendChart.tsx`**

```tsx
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
  '#ffd700', // gold
  '#00ff88', // neon green
  '#60a5fa', // blue
  '#c084fc', // purple
  '#f472b6', // pink
  '#fbbf24', // amber
  '#888888', // gray
]

export default function TrendChart({ weekData }: TrendChartProps) {
  const days = weekData.participants[0]?.dailyRecords.map(r => {
    const d = new Date(r.date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }) ?? []

  // Transform: [{ day: "6/1", Latrell: 0, Bard: 0, ... }, ...]
  const chartData = days.map((day, i) => {
    const point: Record<string, number | string> = { day }
    weekData.participants.forEach(wp => {
      const profile = participantMap.get(wp.uid)
      if (!profile) return
      const weight = wp.dailyRecords[i]?.weight
      if (weight !== null && weight !== undefined) {
        // 减重百分比，负数=减了
        point[wp.uid] = parseFloat(
          (((weight - profile.initialWeight) / profile.initialWeight) * 100).toFixed(1)
        )
      }
    })
    return point
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {payload
          .filter((p: any) => p.value !== undefined)
          .sort((a: any, b: any) => a.value - b.value)
          .map((p: any) => {
            const profile = participantMap.get(p.dataKey)
            return (
              <div key={p.dataKey} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-gray-300">{profile?.nickname ?? p.dataKey}</span>
                <span className={`font-mono ${p.value <= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                  {p.value > 0 ? '+' : ''}{p.value}%
                </span>
              </div>
            )
          })}
      </div>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      <h2 className="text-lg font-black text-neon-green mb-4 tracking-tight">📈 减重趋势</h2>
      <div className="bg-dark-card rounded-xl border border-dark-border p-6">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value: string) => {
                const profile = participantMap.get(value)
                return <span className="text-gray-400 text-xs">{profile?.nickname ?? value}</span>
              }}
            />
            {weekData.participants.map((wp, i) => (
              <Line
                key={wp.uid}
                type="monotone"
                dataKey={wp.uid}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 0 }}
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
```

---

### Task 12: AttendanceGrid + DayDetailModal 组件

**Files:**
- Create: `src/components/AttendanceGrid.tsx`
- Create: `src/components/DayDetailModal.tsx`

- [ ] **Step 1: 创建 `src/components/DayDetailModal.tsx`**

```tsx
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
  open, onClose, nickname, avatar, date, record, initialWeight,
}: DayDetailModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  const weightChange = record?.weight != null
    ? record.weight - initialWeight
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-dark-card border border-neon-green/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,255,136,0.10)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <img src={avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white/10 object-cover" />
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
            {/* 体重 */}
            <div className="bg-dark-base rounded-xl p-4 mb-3">
              <div className="text-xs text-gray-500 mb-1">今日体重</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">{record.weight}</span>
                <span className="text-sm text-gray-500">kg</span>
                {weightChange != null && (
                  <span className={`text-sm font-mono ml-2 ${weightChange < 0 ? 'text-neon-green' : weightChange > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {weightChange < 0 ? '↓' : weightChange > 0 ? '↑' : '→'} {Math.abs(weightChange).toFixed(1)}kg
                  </span>
                )}
              </div>
            </div>

            {/* 运动 */}
            <div className="mb-2 px-1">
              <span className="text-xs text-gray-500">🏃 运动：</span>
              <span className="text-sm text-gray-300">{record.sport || '未记录'}</span>
            </div>

            {/* 饮食 */}
            <div className="mb-2 px-1">
              <span className="text-xs text-gray-500">🍽️ 饮食：</span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${DIET_COLORS[record.diet] ?? DIET_COLORS['未控制']}`}>
                {record.diet || '未记录'}
              </span>
            </div>

            {/* 心得 */}
            {record.note && (
              <div className="mt-4 bg-neon-green/[0.03] border-l-2 border-neon-green/30 rounded-r-lg p-3">
                <div className="text-xs text-gray-500 mb-1">💬 今日心得</div>
                <p className="text-sm text-gray-300 leading-relaxed italic">"{record.note}"</p>
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
```

- [ ] **Step 2: 创建 `src/components/AttendanceGrid.tsx`**

```tsx
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
    // 根据体重变化深浅（第一天为基准）
    const profile = participantMap.get(uid)!
    const change = ((record.weight - profile.initialWeight) / profile.initialWeight) * 100
    if (change < -2) return 'bg-neon-green/40 text-white hover:bg-neon-green/50'
    if (change < -1) return 'bg-neon-green/25 text-white hover:bg-neon-green/35'
    if (change < 0) return 'bg-neon-green/15 text-white hover:bg-neon-green/25'
    if (change === 0) return 'bg-neon-green/10 text-gray-300 hover:bg-neon-green/20'
    return 'bg-yellow-500/10 text-gray-300 hover:bg-yellow-500/20'
  }

  const selectedProfile = selected ? participantMap.get(selected.uid) : null
  const selectedRecord = selected
    ? weekData.participants.find(p => p.uid === selected.uid)?.dailyRecords[selected.dayIndex] ?? null
    : null

  // 按排名顺序排列参赛者（与 leaderboard 一致）
  const orderedUids = weekData.participants.map(p => p.uid)

  return (
    <>
      <section id="checkin" className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-lg font-black text-neon-green mb-4 tracking-tight">📅 打卡日历</h2>
        <div className="bg-dark-card rounded-xl border border-dark-border p-4 md:p-6 overflow-x-auto">
          {/* 表头：星期 */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1.5 mb-1.5 min-w-[600px]">
            <div className="text-xs text-gray-500 py-1" />
            {WEEKDAYS.map((day, i) => {
              const dateStr = weekData.participants[0]?.dailyRecords[i]?.date
              const date = dateStr ? new Date(dateStr) : null
              return (
                <div key={day} className="text-center text-xs text-gray-500 py-1">
                  <div>{day}</div>
                  {date && <div className="text-[10px] text-gray-600">{date.getMonth() + 1}/{date.getDate()}</div>}
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
                className="grid grid-cols-[80px_repeat(7,1fr)] gap-1.5 mb-1.5 min-w-[600px]"
              >
                {/* 行头：头像+昵称 */}
                <div className="flex items-center gap-2 py-1 pr-2">
                  <img src={profile.avatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                  <span className="text-xs text-gray-400 truncate">{profile.nickname}</span>
                </div>

                {/* 7天格子 */}
                {Array.from({ length: 7 }, (_, i) => {
                  const record = weekData.participants.find(p => p.uid === uid)?.dailyRecords[i]
                  const hasData = record && record.weight !== null
                  const dateStr = record?.date ?? ''

                  return (
                    <button
                      key={i}
                      onClick={() => setSelected({ uid, dayIndex: i })}
                      className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs 
                        transition-all duration-200 cursor-pointer relative group ${getCellStyle(uid, i)}`}
                      title={hasData
                        ? `${dateStr} · ${record?.weight}kg — ${record?.note || '无心得'}`
                        : `${dateStr} · 未打卡`
                      }
                    >
                      {hasData ? (
                        <>
                          <span className="font-mono font-bold">{record?.weight}</span>
                          <span className="text-[10px] opacity-60">kg</span>
                        </>
                      ) : (
                        <span className="text-gray-600 font-mono">✕</span>
                      )}

                      {/* Hover tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-dark-card border border-dark-border 
                        rounded-md text-[10px] text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity 
                        pointer-events-none z-10 shadow-xl">
                        {hasData
                          ? `${dateStr} · ${record?.weight}kg`
                          : `${dateStr} · 缺卡`}
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}

          {/* 图例 */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-dark-border text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-neon-green/40" /> 大幅减重</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-neon-green/15" /> 小幅减重</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/10" /> 小幅增重</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#1a1a1a]" /> 缺卡</span>
          </div>
        </div>
      </section>

      {/* Modal */}
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
```

---

### Task 13: WeeklyAiComments 组件

**Files:**
- Create: `src/components/WeeklyAiComments.tsx`

- [ ] **Step 1: 创建 `src/components/WeeklyAiComments.tsx`**

```tsx
import type { WeekData, WeeklyAiComment } from '../types'
import { participantMap } from '../data/participants'

interface WeeklyAiCommentsProps {
  weekData: WeekData
  leaderboard: { uid: string }[]
}

const TAG_COLORS = [
  'bg-green-500/15 text-green-400 border-green-500/25',
  'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'bg-purple-500/15 text-purple-400 border-purple-500/25',
  'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'bg-pink-500/15 text-pink-400 border-pink-500/25',
]

function CommentCard({
  comment,
  nickname,
  avatar,
}: {
  comment: WeeklyAiComment
  nickname: string
  avatar: string
}) {
  return (
    <div className="relative bg-dark-card rounded-2xl border border-dark-border p-6 md:p-8
                    hover:border-purple-500/25 transition-all duration-300 overflow-hidden
                    max-w-[720px] mx-auto">
      {/* 顶部紫粉渐变装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-pink-400 to-neon-green" />

      {/* 1. Header */}
      <div className="flex items-center gap-3 mb-5">
        <img
          src={avatar}
          alt={nickname}
          className="w-12 h-12 rounded-full border-2 border-white/10 object-cover"
        />
        <div>
          <div className="text-white font-bold text-base">{nickname}</div>
          {comment.title && (
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold
                           bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300
                           border border-purple-500/25">
              🎭 {comment.title}
            </span>
          )}
        </div>
      </div>

      {/* 2. Tags */}
      {comment.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {comment.tags.map((tag, i) => (
            <span
              key={tag}
              className={`px-2.5 py-0.5 rounded-md text-xs border ${TAG_COLORS[i % TAG_COLORS.length]}`}
            >
              🔖 {tag}
            </span>
          ))}
        </div>
      )}

      {/* 3. Highlight (Blockquote) */}
      {comment.highlight && (
        <div className="bg-neon-green/[0.03] border-l-[3px] border-neon-green/40 rounded-r-lg px-4 py-3 mb-5">
          <p className="text-neon-green/80 text-sm italic leading-relaxed">
            💡 {comment.highlight}
          </p>
        </div>
      )}

      {/* 4. AI Comment Body */}
      {comment.comment && (
        <div className="mb-6">
          <p className="text-[#d0d0d0] text-[15px] leading-relaxed">
            {comment.comment}
          </p>
        </div>
      )}

      <div className="border-t border-dark-border mb-5" />

      {/* 5. Next Week Flag */}
      {comment.nextWeekFlag && (
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-start gap-3 mb-4 border border-[#2a2a2a]">
          <div className="w-[18px] h-[18px] border-2 border-gray-600 rounded flex-shrink-0 mt-0.5
                        bg-gray-800/50 flex items-center justify-center">
            {/* 视觉 checkbox，无交互 */}
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-semibold tracking-wide uppercase">📋 下周 Flag</span>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              {comment.nextWeekFlag}
            </p>
          </div>
        </div>
      )}

      {/* 6. Prediction */}
      {comment.prediction && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-lg">🔮</span>
          <span className="text-xs text-gray-600 italic">{comment.prediction}</span>
        </div>
      )}
    </div>
  )
}

export default function WeeklyAiComments({ weekData, leaderboard }: WeeklyAiCommentsProps) {
  // 按排名顺序排列
  const rankedUids = leaderboard.map(e => e.uid)
  const orderedParticipants = rankedUids
    .map(uid => weekData.participants.find(p => p.uid === uid))
    .filter(Boolean)

  return (
    <section id="comments" className="max-w-6xl mx-auto px-4 pb-16">
      <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 tracking-tight">
        💬 AI 锐评茶话会
      </h2>
      <div className="flex flex-col gap-6">
        {orderedParticipants.map(wp => {
          const profile = participantMap.get(wp!.uid)!
          return (
            <CommentCard
              key={wp!.uid}
              comment={wp!.aiComment}
              nickname={profile.nickname}
              avatar={profile.avatar}
            />
          )
        })}
      </div>
    </section>
  )
}
```

---

### Task 14: App.tsx 组装所有组件

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 重写 `src/App.tsx`**

```tsx
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

  const { weekData, leaderboard, champion, slacker, disciplined, totalWeeks } =
    useWeekData(currentWeek)

  if (!weekData) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <p className="text-gray-500">暂无数据</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-base text-white">
      <NavBar
        currentWeek={currentWeek}
        totalWeeks={totalWeeks}
        onWeekChange={setCurrentWeek}
      />

      <main>
        <HeroStats
          champion={champion}
          slacker={slacker}
          disciplined={disciplined}
        />

        <Podium leaderboard={leaderboard} />

        <TrendChart weekData={weekData} />

        <LeaderboardTable leaderboard={leaderboard} />

        <AttendanceGrid weekData={weekData} />

        <WeeklyAiComments
          weekData={weekData}
          leaderboard={leaderboard}
        />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-700">
        散兵团减肥大赛 · 数据截止 {weekData.dateRange} · 纯静态看板
      </footer>
    </div>
  )
}

export default App
```

---

### Task 15: 头像文件路径确认

**Files:**
- Verify: `public/avatars/` 目录

- [ ] **Step 1: 确认 `public/avatars/` 存在且有正确的头像文件**

```bash
ls -la public/avatars/
```

如果 `public/avatars/` 不存在，创建软链接：

```bash
mkdir -p public
ln -sf ../avatars public/avatars
```

---

### Task 16: 最终验证与构建

**Files:**
- Verify: 全项目编译通过
- Verify: `npm run build` 成功

- [ ] **Step 1: TypeScript 类型检查**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 2: 构建生产版本**

```bash
npm run build
```

Expected: `dist/` 目录生成成功，无报错。

- [ ] **Step 3: 预览构建产物**

```bash
npm run preview
```

打开浏览器检查：
- 暗黑背景显示正常
- NavBar 毛玻璃效果 + 锚点跳转正常
- HeroStats 三卡横排（桌面端）
- Podium 领奖台 1-2-3 排列
- TrendChart 折线图渲染
- LeaderboardTable 排名数据正确
- AttendanceGrid 7×7 格子，点击弹 Modal
- WeeklyAiComments 卡片完整渲染
- 无控制台报错

- [ ] **Step 4: 检查无真名泄露**

```bash
grep -r "雷文丞\|周子谦\|彭泓勋\|郭哲文\|郝伊康\|代极峰\|廖云鹏" dist/ 2>/dev/null
```

Expected: 无匹配结果（grep 返回空）。

---

### Task 17: Git 初始化与首次提交

- [ ] **Step 1: 初始化 Git 仓库**

```bash
cd /Users/leiwencheng/Coding/indiedev/diet-contest
git init
```

- [ ] **Step 2: 确认 `.gitignore` 生效**

```bash
git status
```

Expected: `basicinfo.md`、`*.xlsx`、`config/`、`convert.py`、`parse_comments.py`、`week1.md` 不应出现在未跟踪文件中。

- [ ] **Step 3: 首次提交**

```bash
git add .
git commit -m "feat: init 散兵团减肥大赛静态看板

- Vite + React + TypeScript + Tailwind CSS
- 8 个组件：NavBar, HeroStats, Podium, TrendChart, LeaderboardTable, AttendanceGrid, DayDetailModal, WeeklyAiComments
- Recharts 折线图展示减重趋势
- Python 转换脚本 (convert.py, parse_comments.py)
- 纯静态，无后端，所有计算 Runtime 完成"
```
