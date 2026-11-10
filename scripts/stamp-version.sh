#!/usr/bin/env bash
# 打版本号：ver <版本> · push #<推送次数>
#
# 规则（默认每改一次 +0.01）：
#   bash scripts/stamp-version.sh           # +0.01  日常修改
#   bash scripts/stamp-version.sh --minor   # +0.1   改动量较大
#   bash scripts/stamp-version.sh --major   # +1     全面重构 / 整页重做
#
# 推送次数每次 +1，对应远端的一次推送记录。
set -e
cd "$(dirname "$0")/.."

STATE="scripts/version.txt"
[ -f "$STATE" ] || echo "0.28 28" > "$STATE"
read -r VER PUSH < "$STATE"

case "${1:-}" in
  --minor) STEP=0.1 ;;
  --major) STEP=1 ;;
  *)       STEP=0.01 ;;
esac

VER=$(awk -v v="$VER" -v s="$STEP" 'BEGIN{printf "%.2f", v + s}')
PUSH=$((PUSH + 1))

echo "$VER $PUSH" > "$STATE"
sed -i -E "s/ver [0-9]+(\.[0-9]+)? · push #[0-9]+/ver ${VER} · push #${PUSH}/" index.html

echo "页脚版本号 -> ver ${VER} · push #${PUSH}"
