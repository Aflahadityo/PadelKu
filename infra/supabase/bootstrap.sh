#!/bin/sh

set -eu

SNAPSHOT_REF="self-hosted/v0.8.0"
SNAPSHOT_COMMIT="241bb11c0627f2981746d37033f57dbfa81d29b0"
REPOSITORY="https://github.com/supabase/supabase.git"
ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
RUNTIME_ROOT="$ROOT/.supabase"
RUNTIME="$RUNTIME_ROOT/docker"
STAMP="$RUNTIME/.supabase-version"

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: required command '$1' was not found." >&2
    exit 1
  }
}

set_env() {
  key=$1
  value=$2
  if grep -q "^${key}=" .env; then
    sed -i.old "s|^${key}=.*$|${key}=${value}|" .env
  else
    printf '%s=%s\n' "$key" "$value" >> .env
  fi
}

require_command git
require_command openssl
require_command node
require_command docker
docker compose version >/dev/null

mkdir -p "$RUNTIME_ROOT"

if [ -f "$RUNTIME/docker-compose.yml" ]; then
  if [ ! -f "$STAMP" ] || ! grep -q "^ref=${SNAPSHOT_REF}$" "$STAMP"; then
    echo "Error: existing Supabase runtime is not stamped ${SNAPSHOT_REF}." >&2
    echo "Use the documented snapshot update workflow instead of overwriting it." >&2
    exit 1
  fi
else
  if [ -e "$RUNTIME" ]; then
    echo "Error: $RUNTIME exists but is not a complete Supabase runtime." >&2
    exit 1
  fi

  WORK=$(mktemp -d "$RUNTIME_ROOT/bootstrap.XXXXXX")
  trap 'rm -rf "$WORK"' EXIT HUP INT TERM

  git clone --quiet --depth 1 --branch "$SNAPSHOT_REF" "$REPOSITORY" "$WORK/repository"
  ACTUAL_COMMIT=$(git -C "$WORK/repository" rev-parse HEAD)
  if [ "$ACTUAL_COMMIT" != "$SNAPSHOT_COMMIT" ]; then
    echo "Error: ${SNAPSHOT_REF} resolved to unexpected commit ${ACTUAL_COMMIT}." >&2
    exit 1
  fi

  mkdir "$RUNTIME"
  cp -R "$WORK/repository/docker/." "$RUNTIME/"
  printf 'ref=%s\ncommit=%s\n' "$SNAPSHOT_REF" "$SNAPSHOT_COMMIT" > "$STAMP"
fi

cd "$RUNTIME"
CREATED_ENV=0
if [ ! -f .env ]; then
  cp .env.example .env
  CREATED_ENV=1
fi

if grep -q '^POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password$' .env || \
   grep -q '^JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long$' .env; then
  sh utils/generate-keys.sh --update-env >/dev/null
fi

if ! grep -q '^SUPABASE_PUBLISHABLE_KEY=sb_publishable_' .env; then
  MSYS2_ARG_CONV_EXCL='*' sh utils/add-new-auth-keys.sh --update-env >/dev/null
fi

if ! grep -q '^MAINTENANCE_SECRET=.' .env; then
  set_env MAINTENANCE_SECRET "$(openssl rand -hex 32)"
fi

if [ "$CREATED_ENV" -eq 1 ]; then
  set_env SUPABASE_PUBLIC_URL 'http://supabase.localhost:8000'
  set_env API_EXTERNAL_URL 'http://supabase.localhost:8000/auth/v1'
  set_env SITE_URL 'http://localhost:3000'
  set_env ADDITIONAL_REDIRECT_URLS 'http://localhost:3000/**'
  set_env POOLER_TENANT_ID 'padelku'
  set_env STORAGE_TENANT_ID 'padelku'
  set_env POSTGRES_DIRECT_PORT '54322'
  set_env APP_PORT '3000'
  set_env OPENAI_API_KEY ""
fi

rm -f .env.old docker-compose.yml.old

echo "Supabase ${SNAPSHOT_REF} is ready in .supabase/docker."
echo "Run: docker compose config --quiet"
echo "Then: docker compose up --build -d --wait"
