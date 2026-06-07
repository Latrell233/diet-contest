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


def parse_markdown(md_path):
    """解析 weekN.md，返回 WeeklyAiComment[]。"""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

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

        def extract_field(field_name):
            pattern = rf'\* \*\*{field_name}\*\*：(.+?)(?:\n\* \*\*|\n\n|\n---|\Z)'
            m = re.search(pattern, block, re.DOTALL)
            if m:
                return replace_real_names(m.group(1).strip())
            return ""

        tags_str = extract_field('本周标签')
        tags = [t.strip() for t in tags_str.split('/')] if tags_str else []

        comments.append({
            "uid": uid,
            "title": replace_real_names(title),
            "tags": [replace_real_names(t) for t in tags],
            "highlight": extract_field('关键表现'),
            "comment": extract_field('AI 锐评'),
            "nextWeekFlag": extract_field('下周 Flag'),
            "prediction": extract_field('玄学预测'),
        })

    return comments


def merge_to_history(comments, history_path):
    with open(history_path, 'r', encoding='utf-8') as f:
        history = json.load(f)

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
        print(json.dumps(comments, ensure_ascii=False, indent=2))
        print(f"\n✅ 解析出 {len(comments)} 条 AI 评语")


if __name__ == '__main__':
    main()
