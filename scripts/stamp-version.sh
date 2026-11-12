#!/usr/bin/env bash
# 打版本号：ver <版本>-<内容哈希前 8 位>
#
#   bash scripts/stamp-version.sh           # +0.01  日常修改
#   bash scripts/stamp-version.sh --minor   # +0.1   改动量较大
#   bash scripts/stamp-version.sh --major   # +1     全面重构 / 整页重做
#
# 哈希取的是「版本号已填成占位符时」的 index.html，所以同样的内容永远得到同样的短哈希，
# 内容一变哈希就变，不需要人工维护推送号。
set -e
cd "$(dirname "$0")/.."

STATE="scripts/version.txt"
[ -f "$STATE" ] || echo "0.29" > "$STATE"
VER=$(head -n1 "$STATE" | awk '{print $1}')

case "${1:-}" in
  --minor) STEP=0.1 ;;
  --major) STEP=1 ;;
  *)       STEP=0.01 ;;
esac

VER=$(awk -v v="$VER" -v s="$STEP" 'BEGIN{printf "%.2f", v + s}')
echo "$VER" > "$STATE"

# 先填占位，再对整份文件取哈希，最后把哈希写回去
for f in index.html html/notes.html html/letter.html; do
  [ -f "$f" ] && sed -i -E "s/ver [0-9][^<]*/ver ${VER}-________/" "$f"
done
H=$(cat index.html html/notes.html html/letter.html | sha256sum | cut -c1-8)
for f in index.html html/notes.html html/letter.html; do
  [ -f "$f" ] && sed -i -E "s/${VER}-________/${VER}-${H}/" "$f"
done

echo "页脚版本号 -> ver ${VER}-${H}"
