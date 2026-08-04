#!/bin/bash
# ============================================================
# 减肥大赛周数据上线脚本
# 用法: ./deploy_week.sh <week_number> <data_dir>
# 示例: ./deploy_week.sh 9 data/week9
# ============================================================
set -e

WEEK="${1:?用法: ./deploy_week.sh <week_number> <data_dir>}"
DIR="${2:?用法: ./deploy_week.sh <week_number> <data_dir>}"

# ---- 1. 找 Excel 和 Markdown ----
XLSX=$(ls "$DIR"/*.xlsx 2>/dev/null | head -1)
MD=$(ls "$DIR"/*.md 2>/dev/null | head -1)

if [ -z "$XLSX" ]; then
  echo "❌ 找不到 Excel 文件: $DIR"
  exit 1
fi
if [ -z "$MD" ]; then
  echo "❌ 找不到 Markdown 文件: $DIR"
  exit 1
fi

echo "📋 第 ${WEEK} 周"
echo "   Excel: $XLSX"
echo "   MD:    $MD"

# ---- 2. 自动计算 start-day / end-day ----
# 读取 Excel 里所有日期，算出本周对应第几天到第几天
read TOTAL_DAYS START END < <(python3 -c "
from openpyxl import load_workbook
wb = load_workbook('$XLSX', data_only=True)
ws = wb['汇总-内容']
dates = []
for c in range(5, ws.max_column+1):
    v = ws.cell(row=1, column=c).value
    if v and str(v).startswith('2026'):
        dates.append(str(v).strip())
total = len(dates)
w = int('$WEEK')
# 第 w 周 = 第 (w-1)*7+1 天到第 w*7 天
start = (w - 1) * 7 + 1
end = w * 7
if end > total:
    print(f'❌ Excel 只有 {total} 天，需要 {end} 天', file=__import__('sys').stderr)
    exit(1)
print(total, start, end)
")

echo "   Days: ${START}-${END} / ${TOTAL_DAYS}"

# ---- 3. 转换 Excel 数据 ----
echo "🔄 转换打卡数据..."
python3 convert.py "$XLSX" \
  --week "$WEEK" \
  --start-day "$START" \
  --end-day "$END" \
  --append src/data/history.json

# ---- 4. 合并 AI 文案 ----
echo "💬 合并 AI 文案..."
python3 parse_comments.py "$MD" --merge src/data/history.json

# ---- 5. 验证 ----
echo "✅ 验证结果..."
python3 -c "
import json
with open('src/data/history.json') as f:
    data = json.load(f)
w = data[-1]
ok = sum(1 for p in w['participants'] if p['aiComment'].get('coachGuide'))
has_macro = bool(w.get('macroReview'))
print(f'   Week {w[\"week\"]}: {w[\"dateRange\"]}, macro={has_macro}, coachOK={ok}/7')
if not has_macro or ok < 7:
    print('⚠️  数据不完整，请检查')
    exit(1)
"

# ---- 6. 构建 ----
echo "🔨 构建..."
npm run build

# ---- 7. 提交推送 ----
echo "🚀 提交推送..."
git add -A
git commit -m "feat: week ${WEEK} data ($(python3 -c "
import json
with open('src/data/history.json') as f:
    print(json.load(f)[-1]['dateRange'])
"))"

# 开启代理（如果有 proxy_on 命令）
if command -v proxy_on &> /dev/null; then
  proxy_on
fi
git push

echo ""
echo "🎉 第 ${WEEK} 周上线完成！"
echo "   https://chengsen.xyz/diet-contest/"
