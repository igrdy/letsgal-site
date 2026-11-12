#!/usr/bin/env python3
"""扫描 images/misc/ 里的图片，重新生成 manifest.js。
   有多少张图就生成多少条，标题默认用文件名。"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, "images", "misc")
OUT = os.path.join(DIR, "manifest.js")
EXTS = {".webp", ".png", ".jpg", ".jpeg", ".gif", ".avif"}

items = []
for name in sorted(os.listdir(DIR)):
    if os.path.splitext(name)[1].lower() in EXTS:
        items.append({"file": name, "title": name})

body = json.dumps(items, ensure_ascii=False, indent=2)
with open(OUT, "w", encoding="utf-8") as f:
    f.write("window.MISC_ITEMS = " + body + ";\n")

print(f"manifest.js -> {len(items)} 项")
for it in items:
    print("  ", it["file"])
