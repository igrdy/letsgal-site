#!/usr/bin/env bash
# 把版本号写进页脚：ver <semver>-<构建号>
# 构建号 = 本次提交的序号（提交总数），每次提交前跑一次即可
set -e
cd "$(dirname "$0")/.."

SEMVER="${1:-0.0.1}"
BUILD=$(( $(git rev-list --count HEAD) + 1 ))

sed -i -E "s/ver [0-9]+\.[0-9]+\.[0-9]+-[0-9]+/ver ${SEMVER}-${BUILD}/" index.html
echo "页脚版本号 -> ver ${SEMVER}-${BUILD}"
