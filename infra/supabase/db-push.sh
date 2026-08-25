#!/bin/sh

set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
ENV_FILE="$ROOT/.supabase/docker/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: run infra/supabase/bootstrap.sh first." >&2
  exit 1
fi

if [ ! -f "$ROOT/supabase/config.toml" ]; then
  echo "Error: supabase/config.toml is required for Supabase CLI migrations." >&2
  exit 1
fi

env_value() {
  grep "^$1=" "$ENV_FILE" | head -n 1 | cut -d= -f2- | tr -d '\r'
}

POSTGRES_PASSWORD=$(env_value POSTGRES_PASSWORD)
POSTGRES_DIRECT_PORT=$(env_value POSTGRES_DIRECT_PORT)
POSTGRES_DIRECT_PORT=${POSTGRES_DIRECT_PORT:-54322}
ENCODED_PASSWORD=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$POSTGRES_PASSWORD")
DB_URL="postgresql://postgres:${ENCODED_PASSWORD}@127.0.0.1:${POSTGRES_DIRECT_PORT}/postgres"

cd "$ROOT"
exec npx supabase db push --db-url "$DB_URL" --yes
