"""
将 Excel 打卡表转换为 history.json。

用法：python convert.py [excel_path] [output_path]
默认：python convert.py 北交散兵团第一届减肥大赛打卡.xlsx src/data/history.json
"""

import json
import sys
import os
from openpyxl import load_workbook

# 打卡人名称 → uid 直接映射（优先于 name_mapping）
NICKNAME_TO_UID = {
    "Latrell": "Latrell",
    "猪事顺利": "猪事顺利",
    "噤.": "噤.",
    "起个名字": "起个名字",
    "微信用户15f70e": "猪事顺利",
    "I miss": "I miss",
}

VALID_UIDS = {"Latrell", "Bard", "猪事顺利", "噤.", "起个名字", "I miss", "定轴转动的屑刚体"}


def load_name_mapping():
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'name_mapping.json')
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def resolve_uid(name, name_mapping):
    """将任意名称解析为 uid。"""
    name = str(name).strip()
    if name in NICKNAME_TO_UID:
        return NICKNAME_TO_UID[name]
    if name in name_mapping:
        return name_mapping[name]
    if name in VALID_UIDS:
        return name
    print(f"  ⚠️  无法解析名称: '{name}'")
    return name


def parse_excel(excel_path):
    """解析 Excel，返回 WeekData[]。"""
    wb = load_workbook(excel_path, data_only=True)
    name_mapping = load_name_mapping()

    # ===== 1. 解析"汇总-计数"：提取打卡状态和日期 =====
    ws_count = wb['汇总-计数']
    dates = []
    for col in range(6, 13):
        dates.append(str(ws_count.cell(row=1, column=col).value or ''))

    attendance_map = {}
    for row_idx in range(3, 10):
        raw_name = str(ws_count.cell(row=row_idx, column=1).value or '')
        uid = resolve_uid(raw_name, name_mapping)
        attendance_map[uid] = {}
        for i, col in enumerate(range(6, 13)):
            val = str(ws_count.cell(row=row_idx, column=col).value or '')
            attendance_map[uid][dates[i]] = (val != 'X' and val != 'None' and val != '')

    # ===== 2. 解析"汇总-内容"：提取每日详细信息 =====
    ws_content = wb['汇总-内容']
    content_dates = []
    for i in range(7):
        date_col = 5 + i * 6
        content_dates.append(str(ws_content.cell(row=1, column=date_col).value or ''))

    participants_data = []
    for row_idx in range(3, 10):
        # 打卡人列（B列）
        raw_name = str(ws_content.cell(row=row_idx, column=2).value or '')
        uid = resolve_uid(raw_name, name_mapping)

        daily_records = []
        for i in range(7):
            date_str = content_dates[i]
            base_col = 5 + i * 6
            weight_raw = ws_content.cell(row=row_idx, column=base_col).value

            sport = str(ws_content.cell(row=row_idx, column=base_col + 1).value or '')
            diet = str(ws_content.cell(row=row_idx, column=base_col + 2).value or '')
            note = str(ws_content.cell(row=row_idx, column=base_col + 3).value or '')

            has_checkin = attendance_map.get(uid, {}).get(date_str, False)

            if has_checkin and weight_raw is not None and str(weight_raw).strip() != '':
                try:
                    weight = float(weight_raw)
                except (ValueError, TypeError):
                    weight = None
            else:
                weight = None

            if sport in ('None', ''):
                sport = '未运动' if not has_checkin else ''
            if diet in ('None', ''):
                diet = '未控制'
            if note in ('None', ''):
                note = ''

            daily_records.append({
                "date": date_str,
                "weight": weight,
                "sport": sport,
                "diet": diet,
                "note": note,
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
                "prediction": "",
            },
        })

    week_data = {
        "week": 1,
        "dateRange": f"{dates[0]} - {dates[6]}",
        "participants": participants_data,
    }

    return [week_data]


def main():
    excel_path = sys.argv[1] if len(sys.argv) > 1 else '北交散兵团第一届减肥大赛打卡.xlsx'
    output_path = sys.argv[2] if len(sys.argv) > 2 else 'src/data/history.json'

    data = parse_excel(excel_path)

    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ 已生成 {output_path}")
    print(f"   共 {len(data)} 周数据，{len(data[0]['participants'])} 名参赛者")


if __name__ == '__main__':
    main()
