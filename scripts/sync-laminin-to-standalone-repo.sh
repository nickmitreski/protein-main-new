#!/usr/bin/env bash
# Copy public/laminin-site (monorepo) → standalone LAMININ-PEPTIDES clone for push to GitHub/Vercel.
# Set LAMININ_STANDALONE_REPO to override the default sibling path.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/public/laminin-site"
REPO_PARENT="$(cd "${ROOT}/.." && pwd)"
DST="${LAMININ_STANDALONE_REPO:-${REPO_PARENT}/LAMININ-PEPTIDES}"

if [[ ! -d "${SRC}" ]]; then
  echo "Missing source: ${SRC}" >&2
  exit 1
fi
if [[ ! -d "${DST}/.git" ]]; then
  echo "Expected a git clone at: ${DST}" >&2
  echo "  git clone https://github.com/nickmitreski/LAMININ-PEPTIDES.git \"${DST}\"" >&2
  exit 1
fi

rsync -a --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude '.env.*.local' \
  --exclude '.DS_Store' \
  "${SRC}/" "${DST}/"

echo "Synced monorepo laminin-site → ${DST}"
echo "Next: cd \"${DST}\" && git status && git commit && git push"
