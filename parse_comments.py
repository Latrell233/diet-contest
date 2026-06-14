"""
将 Gemini AI 输出的 weekN.md 解析为结构化 JSON，合并到 history.json。

用法：
  python parse_comments.py week1.md
  python parse_comments.py week1.md --merge src/data/history.json
"""

import json
import re
import sys
import os

REAL_NAME_MAP = {}
_name_config = os.path.join(os.path.dirname(__file__), 'config', 'name_mapping.json')
if os.path.exists(_name_config):
    with open(_name_config, 'r', encoding='utf-8') as f:
        REAL_NAME_MAP = json.load(f)

TITLE_NAME_TO_UID = {
    "Latrell": "Latrell",
    "Bard": "Bard",
    "猪事顺利": "猪事顺利",
    "噤.": "噤.",
    "起个名字": "起个名字",
    "I miss": "I miss",
    "定轴转动的屑刚体": "定轴转动的屑刚体",
}
TITLE_NAME_TO_UID.update(REAL_NAME_MAP)  # 合并真名→uid 映射


def replace_real_names(text):
    """将文本中的真名替换为 uid，保留昵称/外号。"""
    for real_name, uid in REAL_NAME_MAP.items():
        text = text.replace(real_name, uid)
    return text


def normalize_markdown(content):
    """
    规范化 markdown，处理不统一的换行格式。
    将 `*\\n**field**：` 和 `* \\n**field**：` 转为 `* **field**：`，方便正则提取。
    """
    # 去掉行尾空格
    content = re.sub(r'[ \t]+$', '', content, flags=re.MULTILINE)
    # 合并分隔的 bullet: "*\n**field**：" 或 "* \n**field**：" → "* **field**："
    content = re.sub(r'\* ?\n\*\*', r'* **', content)
    # 处理粗体标记后的换行: "**field**：\nvalue" → "**field**：value"（合并行）
    # 清理多余空行（3+ 空行 → 2 空行）
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    return content


def parse_markdown(md_path):
    """
    解析 weekN.md → (macro_review: str, comments: WeeklyAiComment[]).

    支持两种格式：
      - 第1周：无宏观战报，个体卡片包含 下周Flag / 玄学预测
      - 第2周+：有宏观战报，个体卡片包含 专业私教避坑指南 / 本周高能骚话
    """
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 规范化格式
    content = normalize_markdown(content)

    # 提取宏观战报（第2周+）
    macro_review = ""
    macro_match = re.search(
        r'## 📊 【大盘宏观战报[：:](.+?)\n\n---',
        content, re.DOTALL
    )
    if not macro_match:
        # 更简单的匹配：从 ## 到第一个 --- 之间
        macro_match = re.search(
            r'## 📊 【大盘宏观战报[：:](.+?)\n---',
            content, re.DOTALL
        )
    if macro_match:
        # 把标题行后的正文提取出来
        body = macro_match.group(1).strip()
        # 去掉可能残留的标题行
        body = re.sub(r'^[^\n]*\n', '', body).strip()
        macro_review = replace_real_names(body)

    # 按 --- 分割卡片
    blocks = re.split(r'\n---\n', content)
    comments = []

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        title_match = re.match(r'### 👑 (.+?) ｜ (.+)', block)
        if not title_match:
            continue

        raw_name = title_match.group(1).strip()
        title = title_match.group(2).strip()
        uid = TITLE_NAME_TO_UID.get(raw_name, raw_name)

        def extract_field(field_name, end_pattern=None):
            # field_name 可能包含 emoji/特殊字符，需要 re.escape
            escaped = re.escape(field_name)
            # 宽松匹配：不要求 `* ` 前缀，直接找 `**field**：`
            if end_pattern:
                pattern = rf'\*\*{escaped}\*\*[：:](.+?)(?={end_pattern})'
            else:
                # 到下一个 **field**： 或 block 结束
                pattern = rf'\*\*{escaped}\*\*[：:](.+?)(?=\n\* \*\*|\n\*\*|\n---|\n###|\Z)'
            m = re.search(pattern, block, re.DOTALL)
            if m:
                return replace_real_names(m.group(1).strip())
            return ""

        tags_str = extract_field('本周标签')
        tags = [t.strip() for t in tags_str.split('/')] if tags_str else []

        # 检测格式（第2周+ 有专业私教避坑指南 或 本周高能骚话）
        is_new_format = ('专业私教避坑指南' in block or
                         '本周高能骚话' in block)

        comment = {
            "uid": uid,
            "title": replace_real_names(title),
            "tags": [replace_real_names(t) for t in tags],
            "highlight": extract_field('关键表现'),
            "comment": extract_field('AI 锐评'),
        }

        if is_new_format:
            # 第2周+：新字段（字段名前有 emoji 前缀）
            # 尝试无 emoji 版和带 emoji 版
            coach = extract_field('专业私教避坑指南') or extract_field('🏋️‍♂️ 专业私教避坑指南')
            comment["coachGuide"] = coach

            sass_raw = extract_field('本周高能骚话') or extract_field('🗣️ 本周高能骚话')
            if '｜' in sass_raw or '|' in sass_raw:
                parts = re.split(r'[｜|]', sass_raw, maxsplit=1)
                comment["sassQuote"] = parts[0].strip()
                comment["sassReply"] = parts[1].strip() if len(parts) > 1 else ""
            else:
                comment["sassQuote"] = sass_raw
                comment["sassReply"] = ""
        else:
            # 第1周：旧字段
            comment["nextWeekFlag"] = extract_field('下周 Flag')
            comment["prediction"] = extract_field('玄学预测')

        comments.append(comment)

    return macro_review, comments


def merge_to_history(macro_review, comments, history_path):
    with open(history_path, 'r', encoding='utf-8') as f:
        history = json.load(f)

    week = history[-1]
    uid_to_comment = {c['uid']: c for c in comments}

    if macro_review:
        week['macroReview'] = macro_review

    for p in week['participants']:
        if p['uid'] in uid_to_comment:
            p['aiComment'] = uid_to_comment[p['uid']]

    with open(history_path, 'w', encoding='utf-8') as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

    print(f"✅ 已合并 {len(uid_to_comment)} 条 AI 评语到 {history_path}")
    if macro_review:
        print(f"   含宏观战报 ({len(macro_review)} 字)")


def main():
    if len(sys.argv) < 2:
        print("用法: python parse_comments.py <weekN.md> [--merge <history.json>]")
        sys.exit(1)

    md_path = sys.argv[1]
    macro_review, comments = parse_markdown(md_path)

    if '--merge' in sys.argv:
        merge_idx = sys.argv.index('--merge')
        history_path = sys.argv[merge_idx + 1]
        merge_to_history(macro_review, comments, history_path)
    else:
        result = {
            "macroReview": macro_review,
            "comments": comments,
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print(f"\n✅ 解析出 {len(comments)} 条 AI 评语")
        if macro_review:
            print(f"   含宏观战报 ({len(macro_review)} 字)")


if __name__ == '__main__':
    main()
