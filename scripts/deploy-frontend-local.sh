#!/usr/bin/env bash
set -euo pipefail

# Runs the frontend locally against the deployed API. Pulls VITE_API_URL from
# Terraform outputs (override by exporting VITE_API_URL before invoking) and
# starts the Vite dev server on http://localhost:5173.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TF_DIR="$ROOT_DIR/terraform"
FE_DIR="$ROOT_DIR/frontend"

if [ -z "${VITE_API_URL:-}" ]; then
  VITE_API_URL="$(terraform -chdir="$TF_DIR" output -raw api_url)"
fi
export VITE_API_URL

echo "API: $VITE_API_URL"
echo "Starting Vite dev server (http://localhost:5173)..."

pushd "$FE_DIR" >/dev/null
[ -d node_modules ] || npm install
npm run dev
popd >/dev/null
